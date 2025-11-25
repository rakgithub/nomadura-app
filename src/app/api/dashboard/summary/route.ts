import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateFundSeparation } from "@/lib/calculations/fund-separation";

/**
 * Calculate date range based on period filter
 */
function getDateRange(period: string): { startDate: string | null; endDate: string | null } {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  switch (period) {
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "last_month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case "this_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case "last_year":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
    case "all":
    default:
      return { startDate: null, endDate: null };
  }

  return {
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
  };
}

/**
 * GET /api/dashboard/summary
 *
 * Returns financial summary with fund separation calculations
 * based on the 30/70 split model.
 *
 * Query params:
 * - period: this_month | last_month | this_year | last_year | all (default: all)
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get date filter from query params
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "all";

  // Calculate date range based on period
  const { startDate, endDate } = getDateRange(period);


  try {
    // 1. Get all trips for this user
    const { data: trips, error: tripsError } = await supabase
      .from("trips")
      .select("id")
      .eq("user_id", user.id);

    if (tripsError) throw tripsError;

    const tripIds = trips?.map((t) => t.id) || [];

    // 2. Calculate total revenue (sum of all payments)
    let totalRevenue = 0;
    if (tripIds.length > 0) {
      let paymentsQuery = supabase
        .from("payments")
        .select("amount, payment_date, participants!inner(trip_id)")
        .in("participants.trip_id", tripIds);

      // Apply date filter if specified
      if (startDate) {
        paymentsQuery = paymentsQuery.gte("payment_date", startDate);
      }
      if (endDate) {
        paymentsQuery = paymentsQuery.lte("payment_date", endDate);
      }

      const { data: payments, error: paymentsError } = await paymentsQuery;

      if (paymentsError) throw paymentsError;

      totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    }

    // 3. Calculate total trip expenses
    let tripExpenses = 0;
    if (tripIds.length > 0) {
      let expensesQuery = supabase
        .from("expenses")
        .select("amount, expense_date")
        .in("trip_id", tripIds);

      // Apply date filter if specified
      if (startDate) {
        expensesQuery = expensesQuery.gte("expense_date", startDate);
      }
      if (endDate) {
        expensesQuery = expensesQuery.lte("expense_date", endDate);
      }

      const { data: expenses, error: expensesError } = await expensesQuery;

      if (expensesError) throw expensesError;

      tripExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    }

    // 4. Calculate total business expenses
    let businessExpensesQuery = supabase
      .from("business_expenses")
      .select("amount, expense_date")
      .eq("user_id", user.id);

    // Apply date filter if specified
    if (startDate) {
      businessExpensesQuery = businessExpensesQuery.gte("expense_date", startDate);
    }
    if (endDate) {
      businessExpensesQuery = businessExpensesQuery.lte("expense_date", endDate);
    }

    const { data: businessExpenses, error: businessExpensesError } =
      await businessExpensesQuery;

    if (businessExpensesError) throw businessExpensesError;

    const totalBusinessExpenses =
      businessExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    // 5. Calculate total withdrawals
    let withdrawalsQuery = supabase
      .from("withdrawals")
      .select("amount, withdrawal_date")
      .eq("user_id", user.id);

    // Apply date filter if specified
    if (startDate) {
      withdrawalsQuery = withdrawalsQuery.gte("withdrawal_date", startDate);
    }
    if (endDate) {
      withdrawalsQuery = withdrawalsQuery.lte("withdrawal_date", endDate);
    }

    const { data: withdrawals, error: withdrawalsError } =
      await withdrawalsQuery;

    if (withdrawalsError) throw withdrawalsError;

    const totalWithdrawals =
      withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

    // 6. Apply fund separation calculation
    const summary = calculateFundSeparation(
      totalRevenue,
      tripExpenses,
      totalBusinessExpenses,
      totalWithdrawals
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to calculate financial summary" },
      { status: 500 }
    );
  }
}
