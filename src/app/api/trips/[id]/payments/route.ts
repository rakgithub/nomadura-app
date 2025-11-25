import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trips/[id]/payments - List all payments for a trip
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify trip belongs to user
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Get all participants for this trip
  const { data: participantsData } = await supabase
    .from("participants")
    .select("id, name")
    .eq("trip_id", id);

  const participants = participantsData as { id: string; name: string }[] | null;

  if (!participants || participants.length === 0) {
    return NextResponse.json([]);
  }

  const participantIds = participants.map((p) => p.id);
  const participantMap = new Map(participants.map((p) => [p.id, p.name]));

  // Get all payments for these participants
  const { data: paymentsData, error } = await supabase
    .from("payments")
    .select("*")
    .in("participant_id", participantIds)
    .order("payment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  interface PaymentRow {
    id: string;
    participant_id: string;
    amount: number;
    payment_date: string;
    notes: string | null;
    created_at: string;
  }

  const payments = paymentsData as PaymentRow[] | null;

  // Add participant name to each payment
  const paymentsWithNames = payments?.map((payment) => ({
    ...payment,
    participant_name: participantMap.get(payment.participant_id) || "Unknown",
  }));

  return NextResponse.json(paymentsWithNames);
}
