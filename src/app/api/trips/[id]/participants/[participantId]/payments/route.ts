import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trips/[id]/participants/[participantId]/payments - List payments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const supabase = await createClient();
  const { id, participantId } = await params;

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

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("participant_id", participantId)
    .order("payment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/trips/[id]/participants/[participantId]/payments - Add payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const supabase = await createClient();
  const { id, participantId } = await params;

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

  const body = await request.json();

  // Insert payment
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      participant_id: participantId,
      amount: body.amount,
      payment_date: body.payment_date || new Date().toISOString().split("T")[0],
      notes: body.notes,
    } as never)
    .select()
    .single();

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Update participant's total amount_paid
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("participant_id", participantId);

  const totalPaid = (payments as { amount: number }[] | null)?.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  ) || 0;

  await supabase
    .from("participants")
    .update({ amount_paid: totalPaid } as never)
    .eq("id", participantId);

  return NextResponse.json(payment, { status: 201 });
}
