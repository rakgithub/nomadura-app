import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trips/[id]/participants - List participants for a trip
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

  const { data: participants, error } = await supabase
    .from("participants")
    .select("*")
    .eq("trip_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate actual amount paid including both regular payments and advance payments
  if (participants) {
    const participantsWithPayments = await Promise.all(
      participants.map(async (participant: any) => {
        // Get regular payments
        const { data: payments } = await (supabase as any)
          .from("payments")
          .select("amount")
          .eq("participant_id", participant.id);

        // Get advance payments
        const { data: advancePayments } = await (supabase as any)
          .from("advance_payments")
          .select("amount")
          .eq("participant_id", participant.id);

        const regularPaymentsTotal = payments?.reduce(
          (sum: number, p: any) => sum + (Number(p.amount) || 0),
          0
        ) || 0;

        const advancePaymentsTotal = advancePayments?.reduce(
          (sum: number, ap: any) => sum + (Number(ap.amount) || 0),
          0
        ) || 0;

        return {
          ...participant,
          amount_paid: regularPaymentsTotal + advancePaymentsTotal,
        };
      })
    );

    return NextResponse.json(participantsWithPayments);
  }

  return NextResponse.json(participants);
}

// POST /api/trips/[id]/participants - Add participant to trip
export async function POST(
  request: NextRequest,
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

  const body = await request.json();

  const insertData = {
    trip_id: id,
    name: body.name,
    email: body.email,
    phone: body.phone,
    amount_paid: body.amount_paid || 0,
    notes: body.notes,
  };

  const { data, error } = await supabase
    .from("participants")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
