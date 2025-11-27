import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { InsertWithdrawal } from "@/types/database";
import { calculateFundSeparation } from "@/lib/calculations/fund-separation";

/**
 * GET /api/withdrawals
 *
 * Returns list of all withdrawals for the authenticated user.
 * Sorted by withdrawal_date in descending order (most recent first).
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", user.id)
    .order("withdrawal_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/withdrawals
 *
 * Creates a new withdrawal for the authenticated user.
 * Validates that the withdrawal amount doesn't exceed available withdrawable profit.
 *
 * Required fields:
 * - amount: number
 *
 * Optional fields:
 * - withdrawal_date: string (ISO date)
 * - notes: string
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (body.amount === undefined) {
      return NextResponse.json(
        { error: "Missing required field: amount" },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Calculate current withdrawable profit to validate withdrawal
    // 1. Get all trips for this user
    const { data: trips, error: tripsError } = await supabase
      .from("trips")
      .select("id")
      .eq("user_id", user.id);

    if (tripsError) throw tripsError;

    const tripIds = trips?.map((t: any) => t.id) || [];

    // 2. Calculate total revenue
    let totalRevenue = 0;
    if (tripIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, participants!inner(trip_id)")
        .in("participants.trip_id", tripIds);

      if (paymentsError) throw paymentsError;
      totalRevenue = payments?.reduce((sum, p: any) => sum + p.amount, 0) || 0;
    }

    // 3. Calculate total trip expenses
    let tripExpenses = 0;
    if (tripIds.length > 0) {
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("amount")
        .in("trip_id", tripIds);

      if (expensesError) throw expensesError;
      tripExpenses = expenses?.reduce((sum, e: any) => sum + e.amount, 0) || 0;
    }

    // 4. Calculate total business expenses
    const { data: businessExpenses, error: businessExpensesError } =
      await supabase
        .from("business_expenses")
        .select("amount")
        .eq("user_id", user.id);

    if (businessExpensesError) throw businessExpensesError;
    const totalBusinessExpenses =
      businessExpenses?.reduce((sum, e: any) => sum + e.amount, 0) || 0;

    // 5. Calculate total withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawals")
      .select("amount")
      .eq("user_id", user.id);

    if (withdrawalsError) throw withdrawalsError;
    const totalWithdrawals =
      withdrawals?.reduce((sum, w: any) => sum + w.amount, 0) || 0;

    // 6. Calculate available withdrawable profit
    const summary = calculateFundSeparation(
      totalRevenue,
      tripExpenses,
      totalBusinessExpenses,
      totalWithdrawals
    );

    // Validate withdrawal amount doesn't exceed available profit
    if (body.amount > summary.withdrawableProfit) {
      return NextResponse.json(
        {
          error: `Insufficient withdrawable profit. Available: $${summary.withdrawableProfit.toFixed(2)}, Requested: $${body.amount.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Create the withdrawal
    const insertData: InsertWithdrawal = {
      user_id: user.id,
      amount: body.amount,
      withdrawal_date: body.withdrawal_date,
      notes: body.notes,
    };

    const { data, error } = await (supabase as any)
      .from("withdrawals")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Withdrawal creation error:", error);
    return NextResponse.json(
      { error: "Failed to create withdrawal" },
      { status: 500 }
    );
  }
}
