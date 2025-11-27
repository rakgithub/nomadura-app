import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateAdvanceBasedFinancials } from "@/lib/calculations/fund-separation";

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
 * Returns financial summary with advance-based tracking per PRD.
 *
 * New Model:
 * - Tracks customer advances separately from earned revenue
 * - Revenue only earned when trips complete
 * - Operating account includes earned funds + early unlock - business expenses
 * - Trip reserves protect trip money from business expenses
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
    // 1. Get all trips to calculate earned revenue and released profit
    const { data: trips, error: tripsError } = await supabase
      .from("trips")
      .select("id, status, earned_revenue, released_profit, operating_account, trip_reserve_balance")
      .eq("user_id", user.id);

    if (tripsError) throw tripsError;

    // 2. Get all advance payments with split amounts
    const { data: advancePayments, error: advanceError } = await (supabase as any)
      .from("advance_payments")
      .select(`
        amount,
        trip_reserve_amount,
        operating_amount,
        business_amount,
        early_unlock_amount,
        locked_amount,
        payment_date,
        trips!inner(user_id)
      `)
      .eq("trips.user_id", user.id);

    if (advanceError) throw advanceError;

    // 3. Calculate advance-based totals per FIVE-BUCKET MODEL (newprd.md)

    // Total advance received: sum of all advance payment amounts
    const totalAdvanceReceived = advancePayments?.reduce((sum: number, ap: any) => sum + (Number(ap.amount) || 0), 0) || 0;

    // Bucket 2: Trip Reserve - sum of all trip_reserve amounts (reserve % of advances)
    const totalTripReserves = advancePayments?.reduce((sum: number, ap: any) => sum + (Number(ap.trip_reserve_amount) || 0), 0) || 0;

    // Bucket 3: Operating Account base - sum of operating_amount from all advances
    const totalOperatingBase = advancePayments?.reduce((sum: number, ap: any) => sum + (Number(ap.operating_amount) || 0), 0) || 0;

    // Bucket 4: Business Account base - sum of business_amount from all advances
    const totalBusinessBase = advancePayments?.reduce((sum: number, ap: any) => sum + (Number(ap.business_amount) || 0), 0) || 0;

    // For backward compatibility - keep old calculations
    const unlockedOperating = advancePayments?.reduce((sum: number, ap: any) => {
      const earlyUnlock = Number(ap.early_unlock_amount) || 0;
      const locked = Number(ap.locked_amount) || 0;
      return sum + earlyUnlock + locked;
    }, 0) || 0;

    const totalLockedAdvance = 0;

    // Earned revenue: only from completed trips
    const earnedRevenue = trips?.reduce((sum, t: any) => {
      if (t.status === 'completed') {
        return sum + (Number(t.earned_revenue) || 0);
      }
      return sum;
    }, 0) || 0;

    const tripIds = trips?.map((t: any) => t.id) || [];

    // 3. Calculate total trip expenses from all trips
    let tripExpenses = 0;
    if (tripIds.length > 0) {
      let expensesQuery = supabase
        .from("expenses")
        .select("amount, expense_date")
        .in("trip_id", tripIds);

      if (startDate) {
        expensesQuery = expensesQuery.gte("expense_date", startDate);
      }
      if (endDate) {
        expensesQuery = expensesQuery.lte("expense_date", endDate);
      }

      const { data: expenses, error: expensesError } = await expensesQuery;

      if (expensesError) throw expensesError;

      tripExpenses = expenses?.reduce((sum, e: any) => sum + e.amount, 0) || 0;
    }

    // 4. Calculate total business expenses
    let businessExpensesQuery = supabase
      .from("business_expenses")
      .select("amount, expense_date")
      .eq("user_id", user.id);

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
      businessExpenses?.reduce((sum, e: any) => sum + e.amount, 0) || 0;

    // 5. Calculate total withdrawals
    let withdrawalsQuery = supabase
      .from("withdrawals")
      .select("amount, withdrawal_date")
      .eq("user_id", user.id);

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
      withdrawals?.reduce((sum, w: any) => sum + w.amount, 0) || 0;

    // 6. Calculate total transfers
    let transfersQuery = supabase
      .from("transfers")
      .select("amount, transfer_date")
      .eq("user_id", user.id);

    if (startDate) {
      transfersQuery = transfersQuery.gte("transfer_date", startDate);
    }
    if (endDate) {
      transfersQuery = transfersQuery.lte("transfer_date", endDate);
    }

    const { data: transfers, error: transfersError } = await transfersQuery;

    if (transfersError) throw transfersError;

    const totalTransfers = transfers?.reduce((sum, t: any) => sum + t.amount, 0) || 0;

    // 7. Calculate FIVE BUCKETS per newprd.md

    // Bucket 1: Bank Balance = Total Advances Received + Earned Revenue – Total Expenses – Withdrawals
    const bankBalance = totalAdvanceReceived + earnedRevenue - tripExpenses - totalBusinessExpenses - totalWithdrawals;

    // Bucket 2: Trip Reserve (already calculated as totalTripReserves)

    // Bucket 3: Operating Account = Operating Base - Trip Expenses
    const operatingAccount = totalOperatingBase - tripExpenses;

    // Bucket 4: Business Account = Business Base - Business Expenses
    const businessAccount = totalBusinessBase - totalBusinessExpenses;

    // Bucket 5: Profit (Withdrawable) - from completed trips via released_profit
    // Sum of released_profit from all completed trips
    const totalProfit = trips?.reduce((sum, t: any) => {
      return sum + (Number(t.released_profit) || 0);
    }, 0) || 0;

    // Trip Balances: Sum of operating_account for active trips (upcoming/in_progress)
    const tripBalances = trips?.reduce((sum, t: any) => {
      if (t.status === 'upcoming' || t.status === 'in_progress') {
        return sum + (Number(t.operating_account) || 0);
      }
      return sum;
    }, 0) || 0;

    // Active Trips Count
    const activeTripsCount = trips?.filter((t: any) =>
      t.status === 'upcoming' || t.status === 'in_progress'
    ).length || 0;

    // Upcoming Locked Reserve: Sum of trip_reserve_balance for active trips
    const upcomingLockedReserve = trips?.reduce((sum, t: any) => {
      if (t.status === 'upcoming' || t.status === 'in_progress') {
        return sum + (Number(t.trip_reserve_balance) || 0);
      }
      return sum;
    }, 0) || 0;

    const profit = totalProfit;
    const withdrawableProfit = Math.max(0, profit - totalWithdrawals - totalTransfers);

    // 8. Build summary per FIVE-BUCKET MODEL
    const totalExpenses = tripExpenses + totalBusinessExpenses;
    const profitPool = earnedRevenue * 0.30; // Keep for backward compatibility
    const operatingPool = earnedRevenue * 0.70; // Keep for backward compatibility
    const reserveShortfall = Math.max(0, totalTripReserves - bankBalance);

    // Determine operating status
    let operatingStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (operatingAccount < 0) {
      operatingStatus = 'critical';
    } else if (operatingAccount < tripExpenses * 0.2) {
      operatingStatus = 'warning';
    }

    const summary = {
      // Five Buckets
      bankBalance,
      tripReserve: totalTripReserves,
      operatingAccount,
      businessAccount,
      profit,
      withdrawableProfit,

      // Trip Money Flow (newprd.md) metrics
      totalProfit,                   // Sum of released_profit from completed trips
      tripBalances,                  // Sum of operating_account for active trips
      upcomingLockedReserve,         // Sum of trip_reserve_balance for active trips
      businessBalance: businessAccount, // Alias for clarity
      activeTripsCount,              // Count of active trips

      // Supporting metrics
      earnedRevenue,
      totalAdvanceReceived,
      tripExpenses,
      businessExpenses: totalBusinessExpenses,
      totalExpenses,
      totalWithdrawals,
      totalTransfers,
      operatingStatus,

      // Backward compatibility fields
      totalLockedAdvance,
      reserveRequirement: totalTripReserves,
      reserveShortfall,
      profitPool,
      unlockedOperating,
      totalEarlyUnlock: unlockedOperating,
      totalTripReserves,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
