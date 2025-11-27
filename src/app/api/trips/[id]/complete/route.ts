import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Trip, UpdateTrip } from "@/types/database";

/**
 * POST /api/trips/[id]/complete
 *
 * Completes a trip and releases profit to the global Profit Wallet.
 *
 * Per Trip_Completion_Flow_Prd.md:
 * - Final Profit = Trip Reserve + Remaining Trip Spend
 * - Trip becomes read-only after completion
 * - All trip balances are zeroed out
 * - Completion is logged for audit trail
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: tripId } = await params;

  try {
    // 1. Fetch the trip with all necessary data
    const { data, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    const trip = data as Trip;

    // 2. Validation checks
    if (trip.status === "completed") {
      return NextResponse.json(
        { error: "Trip is already completed" },
        { status: 400 }
      );
    }

    if (trip.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot complete a cancelled trip" },
        { status: 400 }
      );
    }

    // 3. Get total expenses for this trip
    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select("amount")
      .eq("trip_id", tripId);

    if (expensesError) throw expensesError;

    const expenses = (expensesData || []) as Array<{ amount: number }>;
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 4. Calculate final profit
    // Final Profit = Trip Reserve + Remaining Trip Spend (operating_account)
    const reserveReleased = Number(trip.trip_reserve_balance) || 0;
    const tripSpendReleased = Math.max(0, Number(trip.operating_account) || 0);
    const finalProfit = reserveReleased + tripSpendReleased;

    // 5. Create completion breakdown for audit
    const breakdown = {
      total_advance_received: Number(trip.total_advance_received) || 0,
      trip_reserve_balance: reserveReleased,
      operating_account: Number(trip.operating_account) || 0,
      business_account: Number(trip.business_account) || 0,
      total_expenses: totalExpenses,
      reserve_released: reserveReleased,
      trip_spend_released: tripSpendReleased,
      final_profit: finalProfit,
      completion_formula: "Trip Reserve + Remaining Trip Spend",
    };

    // 6. Update trip to completed status
    // The database trigger will handle setting released_profit
    // But we'll also explicitly set it for consistency
    const { error: updateError } = await (supabase as any)
      .from("trips")
      .update({
        status: "completed",
        released_profit: finalProfit,
        trip_reserve_balance: 0,
        operating_account: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // 7. Create completion log entry
    const { error: logError } = await (supabase as any)
      .from("trip_completion_logs")
      .insert({
        trip_id: tripId,
        user_id: user.id,
        final_profit: finalProfit,
        reserve_released: reserveReleased,
        trip_spend_released: tripSpendReleased,
        total_advance_received: Number(trip.total_advance_received) || 0,
        total_expenses: totalExpenses,
        breakdown: breakdown,
        completed_at: new Date().toISOString(),
      });

    if (logError) throw logError;

    // 8. Fetch updated dashboard summary to get new profit wallet balance
    const { data: summary } = await supabase
      .from("trips")
      .select("released_profit")
      .eq("user_id", user.id);

    const totalProfit = summary?.reduce((sum, t: any) => sum + (Number(t.released_profit) || 0), 0) || 0;

    // 9. Return success response
    return NextResponse.json({
      success: true,
      tripId: tripId,
      status: "completed",
      finalProfit: finalProfit,
      reserveReleased: reserveReleased,
      tripSpendReleased: tripSpendReleased,
      profitWalletBalance: totalProfit,
      breakdown: breakdown,
      message: "Trip completed successfully. Profit has been released to your Profit Wallet.",
    });

  } catch (error) {
    console.error("Trip completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete trip" },
      { status: 500 }
    );
  }
}
