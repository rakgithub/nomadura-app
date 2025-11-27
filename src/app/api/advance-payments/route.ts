import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InsertAdvancePayment } from "@/types/database";

/**
 * GET /api/advance-payments
 *
 * Returns all advance payments for the authenticated user's trips.
 * Optional query params:
 * - trip_id: Filter by specific trip
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("trip_id");

  try {
    let query = supabase
      .from("advance_payments")
      .select(`
        *,
        trips!inner(user_id, name, status)
      `)
      .eq("trips.user_id", user.id)
      .order("payment_date", { ascending: false });

    if (tripId) {
      query = query.eq("trip_id", tripId);
    }

    const { data: advancePayments, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(advancePayments);
  } catch (error) {
    console.error("Advance payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch advance payments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/advance-payments
 *
 * Creates a new advance payment.
 * Automatically calculates split amounts based on user settings.
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
    if (!body.trip_id) {
      return NextResponse.json(
        { error: "trip_id is required" },
        { status: 400 }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Verify trip belongs to user and get reserve percentage
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, user_id, reserve_percentage")
      .eq("id", body.trip_id)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found or access denied" },
        { status: 404 }
      );
    }

    // Get trip's reserve percentage (default to 60% if not set)
    const reservePercentage = (trip as any).reserve_percentage ?? 0.60;

    // Calculate split amounts per NEW five-bucket model (newprd.md):
    // 1. Trip Reserve = advance × reserve_percentage
    // 2. Spendable = advance - trip_reserve
    // 3. Operating Account = spendable × 50%
    // 4. Business Account = spendable × 50%
    const amount = parseFloat(body.amount);
    const tripReserveAmount = amount * reservePercentage;
    const spendableAmount = amount - tripReserveAmount;
    const operatingAmount = spendableAmount * 0.5;
    const businessAmount = spendableAmount * 0.5;

    // Keep old split for backward compatibility during transition
    const earlyUnlockAmount = spendableAmount / 2;
    const lockedAmount = spendableAmount / 2;

    const insertData: InsertAdvancePayment = {
      trip_id: body.trip_id,
      participant_id: body.participant_id || null,
      amount: amount,
      payment_date: body.payment_date || new Date().toISOString().split("T")[0],
      trip_reserve_amount: tripReserveAmount,
      operating_amount: operatingAmount,
      business_amount: businessAmount,
      // Keep old fields for backward compatibility
      early_unlock_amount: earlyUnlockAmount,
      locked_amount: lockedAmount,
      notes: body.notes || null,
    };

    const { data: advancePayment, error } = await supabase
      .from("advance_payments")
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(advancePayment, { status: 201 });
  } catch (error) {
    console.error("Advance payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create advance payment" },
      { status: 500 }
    );
  }
}
