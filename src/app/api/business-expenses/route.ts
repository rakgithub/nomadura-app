import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { InsertBusinessExpense } from "@/types/database";
import { calculateAdvanceBasedFinancials } from "@/lib/calculations/fund-separation";

/**
 * GET /api/business-expenses
 *
 * Returns list of all business expenses for the authenticated user.
 * Sorted by expense_date in descending order (most recent first).
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
    .from("business_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/business-expenses
 *
 * Creates a new business expense for the authenticated user.
 *
 * Required fields:
 * - category: BusinessExpenseCategory
 * - description: string
 * - amount: number
 *
 * Optional fields:
 * - expense_date: string (ISO date)
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
    if (!body.category || !body.description || body.amount === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: category, description, and amount are required",
        },
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

    // NEW: Check Business Account balance per Five-Bucket Model
    // Fetch current financial data
    const [tripsResult, advancePaymentsResult, businessExpensesResult, globalTransfersResult] = await Promise.all([
      supabase
        .from("trips")
        .select("id, status, total_advance_received, estimated_cost, earned_revenue")
        .eq("user_id", user.id),
      supabase
        .from("advance_payments")
        .select("amount, business_amount, trips!inner(user_id)")
        .eq("trips.user_id", user.id),
      supabase
        .from("business_expenses")
        .select("amount")
        .eq("user_id", user.id),
      supabase
        .from("global_transfers")
        .select("from_bucket, to_bucket, amount")
        .eq("user_id", user.id),
    ]);

    if (tripsResult.error || advancePaymentsResult.error || businessExpensesResult.error || globalTransfersResult.error) {
      return NextResponse.json(
        { error: "Failed to fetch financial data" },
        { status: 500 }
      );
    }

    const trips = tripsResult.data || [];
    const advancePayments = advancePaymentsResult.data || [];
    const businessExpenses = businessExpensesResult.data || [];
    const globalTransfers = globalTransfersResult.data || [];

    // Calculate Business Account balance per Five-Bucket Model (newprd.md)
    // Business Account = Business Base - Business Expenses

    // Business Base = sum of business_amount from all advance payments
    const totalBusinessBase = advancePayments.reduce((sum: number, ap: any) => {
      return sum + (Number(ap.business_amount) || 0);
    }, 0);

    // Total Business Expenses (current)
    const currentBusinessExpenses = businessExpenses.reduce((sum, e: any) => sum + Number(e.amount), 0);

    // Calculate Business Account before applying global transfers
    let businessAccount = totalBusinessBase - currentBusinessExpenses;

    // Apply global transfers to adjust Business Account balance
    if (globalTransfers && globalTransfers.length > 0) {
      globalTransfers.forEach((transfer: any) => {
        const amount = Number(transfer.amount);

        // Deduct if transferring FROM business account
        if (transfer.from_bucket === 'business_account') {
          businessAccount -= amount;
        }

        // Add if transferring TO business account
        if (transfer.to_bucket === 'business_account') {
          businessAccount += amount;
        }
      });
    }

    // Validate that expense amount doesn't exceed available business account balance
    const expenseAmount = Number(body.amount);

    if (expenseAmount > businessAccount) {
      return NextResponse.json(
        {
          error: `Insufficient funds in Business Account. Available: ₹${businessAccount.toFixed(2)}, Required: ₹${expenseAmount.toFixed(2)}`,
          availableBalance: businessAccount,
          requestedAmount: expenseAmount,
        },
        { status: 400 }
      );
    }

    const insertData: InsertBusinessExpense = {
      user_id: user.id,
      category: body.category,
      description: body.description,
      amount: body.amount,
      expense_date: body.expense_date,
      notes: body.notes,
    };

    const { data, error } = await supabase
      .from("business_expenses")
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Business expense creation error:", error);
    return NextResponse.json(
      { error: "Failed to create business expense" },
      { status: 500 }
    );
  }
}
