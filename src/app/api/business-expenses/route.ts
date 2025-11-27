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

    // NEW: Check Operating Account balance using reserve requirement logic
    // Fetch current financial data
    const [tripsResult, businessExpensesResult, withdrawalsResult, transfersResult] = await Promise.all([
      supabase
        .from("trips")
        .select("id, status, total_advance_received, estimated_cost, earned_revenue")
        .eq("user_id", user.id),
      supabase
        .from("business_expenses")
        .select("amount")
        .eq("user_id", user.id),
      supabase
        .from("withdrawals")
        .select("amount")
        .eq("user_id", user.id),
      supabase
        .from("transfers")
        .select("amount")
        .eq("user_id", user.id),
    ]);

    if (tripsResult.error || businessExpensesResult.error || withdrawalsResult.error || transfersResult.error) {
      return NextResponse.json(
        { error: "Failed to fetch financial data" },
        { status: 500 }
      );
    }

    const trips = tripsResult.data || [];
    const businessExpenses = businessExpensesResult.data || [];
    const withdrawals = withdrawalsResult.data || [];
    const transfers = transfersResult.data || [];

    // Calculate totals using NEW status-based logic
    const totalAdvanceReceived = trips.reduce((sum, t: any) => sum + (Number(t.total_advance_received) || 0), 0);

    // Locked advance: sum of advances for trips NOT completed (status-based)
    const totalLockedAdvance = trips.reduce((sum, t: any) => {
      if (t.status !== 'completed' && t.status !== 'cancelled') {
        return sum + (Number(t.total_advance_received) || 0);
      }
      return sum;
    }, 0);

    // Reserve requirement: sum of estimated costs for upcoming trips
    const reserveRequirement = trips.reduce((sum, t: any) => {
      if (t.status !== 'completed' && t.status !== 'cancelled') {
        return sum + (Number(t.estimated_cost) || 0);
      }
      return sum;
    }, 0);

    const earnedRevenue = trips.reduce((sum, t: any) => {
      if (t.status === 'completed') {
        return sum + (Number(t.earned_revenue) || 0);
      }
      return sum;
    }, 0);

    const currentBusinessExpenses = businessExpenses.reduce((sum, e: any) => sum + Number(e.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w: any) => sum + Number(w.amount), 0);
    const totalTransfers = transfers.reduce((sum, t: any) => sum + Number(t.amount), 0);

    // Get trip expenses
    const tripIds = trips.map((t: any) => t.id);
    let tripExpenses = 0;
    if (tripIds.length > 0) {
      const tripExpensesResult = await supabase
        .from("expenses")
        .select("amount")
        .in("trip_id", tripIds);

      tripExpenses = tripExpensesResult.data?.reduce((sum, e: any) => sum + Number(e.amount), 0) || 0;
    }

    // Calculate bank balance
    const bankBalance = totalAdvanceReceived + earnedRevenue - tripExpenses - currentBusinessExpenses - totalWithdrawals;

    // Calculate current financial state using NEW logic
    const financialSummary = calculateAdvanceBasedFinancials(
      bankBalance,
      earnedRevenue,
      totalAdvanceReceived,
      totalLockedAdvance,
      reserveRequirement,  // NEW: dynamic reserve requirement
      tripExpenses,
      currentBusinessExpenses,
      totalWithdrawals,
      totalTransfers
    );

    // Check if expense would cause reserve shortfall
    const expenseAmount = Number(body.amount);
    const availableOperatingCash = financialSummary.operatingAccount;
    const newBankBalance = bankBalance - expenseAmount;
    const newReserveShortfall = Math.max(0, reserveRequirement - newBankBalance);

    if (newReserveShortfall > 0 && !body.ignoreWarning) {
      // Return warning - this expense would cause reserve shortfall
      return NextResponse.json(
        {
          warning: true,
          message: "This expense will cause reserve shortfall",
          availableOperatingCash,
          expenseAmount,
          reserveRequirement,
          currentBankBalance: bankBalance,
          newBankBalance,
          reserveShortfall: newReserveShortfall,
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
