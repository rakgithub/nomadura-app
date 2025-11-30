import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  GlobalBucket,
  GlobalBalances,
  validateGlobalTransfer,
  calculateGlobalTransferImpact,
  getGlobalBucketLabel,
} from "@/lib/calculations/global-transfers";

/**
 * GET /api/global-transfers
 * Get all global transfers for the authenticated user
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: transfers, error } = await supabase
    .from("global_transfers")
    .select("*")
    .eq("user_id", user.id)
    .order("transfer_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch global transfers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(transfers);
}

/**
 * Helper to fetch current global balances for validation
 * Queries database directly instead of calling API endpoint
 */
async function fetchGlobalBalances(
  supabase: any,
  userId: string
): Promise<GlobalBalances> {
  // 1. Get all trips to calculate balances
  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("id, status, released_profit, operating_account, trip_reserve_balance")
    .eq("user_id", userId);

  if (tripsError) {
    console.error("Failed to fetch trips:", tripsError);
    throw new Error("Failed to fetch trip data");
  }

  // 2. Get advance payments for business account calculation
  const { data: advancePayments, error: advanceError } = await supabase
    .from("advance_payments")
    .select(`
      amount,
      business_amount,
      trips!inner(user_id)
    `)
    .eq("trips.user_id", userId);

  if (advanceError) {
    console.error("Failed to fetch advance payments:", advanceError);
    throw new Error("Failed to fetch advance payment data");
  }

  // 3. Get business expenses
  const { data: businessExpenses, error: businessExpensesError } = await supabase
    .from("business_expenses")
    .select("amount")
    .eq("user_id", userId);

  if (businessExpensesError) {
    console.error("Failed to fetch business expenses:", businessExpensesError);
    throw new Error("Failed to fetch business expense data");
  }

  // 4. Get withdrawals
  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from("withdrawals")
    .select("amount")
    .eq("user_id", userId);

  if (withdrawalsError) {
    console.error("Failed to fetch withdrawals:", withdrawalsError);
    throw new Error("Failed to fetch withdrawal data");
  }

  // 5. Get existing global transfers
  const { data: globalTransfers, error: transfersError } = await supabase
    .from("global_transfers")
    .select("from_bucket, to_bucket, amount")
    .eq("user_id", userId);

  if (transfersError) {
    console.error("Failed to fetch global transfers:", transfersError);
    // Don't throw - transfers might not exist yet
  }

  // Calculate balances

  // Total Profit = sum of released_profit from all completed trips
  const totalProfit = trips?.reduce((sum: number, t: any) => {
    return sum + (Number(t.released_profit) || 0);
  }, 0) || 0;

  // Total Withdrawals
  const totalWithdrawals = withdrawals?.reduce((sum: number, w: any) => sum + Number(w.amount), 0) || 0;

  // Business Account Base = sum of business_amount from advances
  const businessAccountBase = advancePayments?.reduce((sum: number, ap: any) => {
    return sum + (Number(ap.business_amount) || 0);
  }, 0) || 0;

  // Business Expenses
  const totalBusinessExpenses = businessExpenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0;

  // Business Account = Base - Expenses
  let businessAccount = businessAccountBase - totalBusinessExpenses;

  // Trip Balances = sum of operating_account for active trips
  let tripBalances = trips?.reduce((sum: number, t: any) => {
    if (t.status === 'upcoming' || t.status === 'in_progress') {
      return sum + (Number(t.operating_account) || 0);
    }
    return sum;
  }, 0) || 0;

  // Trip Reserves = sum of trip_reserve_balance for active trips
  let tripReserves = trips?.reduce((sum: number, t: any) => {
    if (t.status === 'upcoming' || t.status === 'in_progress') {
      return sum + (Number(t.trip_reserve_balance) || 0);
    }
    return sum;
  }, 0) || 0;

  // Withdrawable Profit = Total Profit - Withdrawals
  let profitWithdrawable = totalProfit - totalWithdrawals;

  // Apply global transfers to adjust balances
  if (globalTransfers && globalTransfers.length > 0) {
    globalTransfers.forEach((transfer: any) => {
      const amount = Number(transfer.amount);

      // Deduct from source
      switch (transfer.from_bucket) {
        case 'profit_withdrawable':
          profitWithdrawable -= amount;
          break;
        case 'business_account':
          businessAccount -= amount;
          break;
        case 'trip_balances':
          tripBalances -= amount;
          break;
        case 'trip_reserves':
          tripReserves -= amount;
          break;
      }

      // Add to destination
      switch (transfer.to_bucket) {
        case 'trip_balances':
          tripBalances += amount;
          break;
        case 'business_account':
          businessAccount += amount;
          break;
      }
    });
  }

  return {
    profit_withdrawable: profitWithdrawable,
    business_account: businessAccount,
    trip_balances: tripBalances,
    trip_reserves: tripReserves,
  };
}

/**
 * POST /api/global-transfers
 * Create a new global transfer between buckets
 *
 * Body:
 * - from_bucket: source bucket
 * - to_bucket: destination bucket
 * - amount: transfer amount
 * - notes: optional notes
 * - transfer_date: optional date (defaults to today)
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { from_bucket, to_bucket, amount, notes, transfer_date } = body;

    // Validation
    if (!from_bucket || !to_bucket) {
      return NextResponse.json(
        { error: "Both from_bucket and to_bucket are required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Fetch current balances
    const balances = await fetchGlobalBalances(supabase, user.id);

    // Validate transfer
    const validation = validateGlobalTransfer(
      from_bucket as GlobalBucket,
      to_bucket as GlobalBucket,
      amount,
      balances
    );

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Calculate impact for logging
    const impact = calculateGlobalTransferImpact(
      from_bucket as GlobalBucket,
      to_bucket as GlobalBucket,
      amount,
      balances
    );

    // Create the transfer record
    const { data: transfer, error } = await (supabase as any)
      .from("global_transfers")
      .insert({
        user_id: user.id,
        from_bucket,
        to_bucket,
        amount,
        notes: notes || impact.impactDescription,
        transfer_date: transfer_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create global transfer:", error);
      return NextResponse.json(
        { error: "Failed to create transfer" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ...transfer,
        impact: {
          description: impact.impactDescription,
          warning: impact.warning,
          newBalances: impact.newBalances,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Global transfer error:", error);
    return NextResponse.json(
      { error: "Failed to process transfer" },
      { status: 500 }
    );
  }
}
