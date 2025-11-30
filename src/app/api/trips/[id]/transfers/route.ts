import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateTransfer,
  calculateTransferImpact,
  generateTransferNote,
  getAvailableBalance,
  type WalletType,
  type TripBalances,
} from "@/lib/calculations/transfers";

/**
 * POST /api/trips/[id]/transfers
 *
 * Create a transfer between trip wallets (Reserve, Trip Balance, Business)
 *
 * Body:
 * {
 *   from_wallet: 'trip_reserve' | 'trip_balance' | 'business_account',
 *   to_wallet: 'trip_balance' | 'business_account',
 *   amount: number
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: tripId } = await params;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse request body
    const body = await request.json();
    const { from_wallet, to_wallet, amount } = body;

    // Validate input
    if (!from_wallet || !to_wallet) {
      return NextResponse.json(
        { error: "from_wallet and to_wallet are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json(
        { error: "amount must be a valid number" },
        { status: 400 }
      );
    }

    // Fetch the trip with current balances
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, user_id, name, trip_reserve_balance, operating_account, business_account")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !tripData) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    const trip = tripData as any;

    const currentBalances: TripBalances = {
      trip_reserve_balance: Number(trip.trip_reserve_balance) || 0,
      operating_account: Number(trip.operating_account) || 0,
      business_account: Number(trip.business_account) || 0,
    };

    // Validate transfer
    const validation = validateTransfer(
      from_wallet as WalletType,
      to_wallet as WalletType,
      amount,
      currentBalances
    );

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Calculate impact
    const impact = calculateTransferImpact(
      from_wallet as WalletType,
      to_wallet as WalletType,
      amount,
      currentBalances
    );

    // Generate note
    const note = generateTransferNote(
      from_wallet as WalletType,
      to_wallet as WalletType,
      amount,
      impact
    );

    // Start transaction: Update trip balances and create transfer record
    // Update trip balances
    const { error: updateError } = await (supabase as any)
      .from("trips")
      .update({
        trip_reserve_balance: impact.newBalances.trip_reserve_balance,
        operating_account: impact.newBalances.operating_account,
        business_account: impact.newBalances.business_account,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating trip balances:", updateError);
      throw updateError;
    }

    // Create transfer record
    const { data: transfer, error: transferError } = await (supabase as any)
      .from("wallet_transfers")
      .insert({
        user_id: user.id,
        trip_id: tripId,
        from_wallet,
        to_wallet,
        amount,
        impact_type: impact.impactType,
        note,
        transfer_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (transferError) {
      console.error("Error creating transfer record:", transferError);
      throw transferError;
    }

    // Return success with updated data
    return NextResponse.json({
      success: true,
      transfer,
      impact: {
        profitChange: impact.profitChange,
        warning: impact.warning,
      },
      newBalances: impact.newBalances,
      message: "Transfer completed successfully",
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: "Failed to complete transfer" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[id]/transfers
 *
 * Get all transfers for a specific trip
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: tripId } = await params;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // Fetch transfers
    const { data: transfers, error: transfersError } = await supabase
      .from("wallet_transfers")
      .select("*")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .order("transfer_date", { ascending: false });

    if (transfersError) {
      throw transfersError;
    }

    return NextResponse.json(transfers || []);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}
