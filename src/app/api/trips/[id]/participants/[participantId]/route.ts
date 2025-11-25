import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/trips/[id]/participants/[participantId] - Update participant
export async function PUT(
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

  const { data, error } = await supabase
    .from("participants")
    .update({
      name: body.name,
      email: body.email,
      phone: body.phone,
      amount_paid: body.amount_paid || 0,
      notes: body.notes,
    } as never)
    .eq("id", participantId)
    .eq("trip_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/trips/[id]/participants/[participantId] - Delete participant
export async function DELETE(
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

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("trip_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
