import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateTrip } from "@/types/database";

// GET /api/trips/[id] - Get trip details
export async function GET(
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

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
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

  const body = await request.json();

  const updateData: UpdateTrip = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.destination !== undefined) updateData.destination = body.destination;
  if (body.destination_id !== undefined) updateData.destination_id = body.destination_id;
  if (body.start_date !== undefined) updateData.start_date = body.start_date;
  if (body.end_date !== undefined) updateData.end_date = body.end_date;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.min_participants !== undefined) updateData.min_participants = body.min_participants;
  if (body.price_per_participant !== undefined) updateData.price_per_participant = body.price_per_participant;
  if (body.reserve_percentage !== undefined) {
    // Ensure reserve_percentage is properly formatted for DECIMAL(3,2) database type
    updateData.reserve_percentage = parseFloat(Number(body.reserve_percentage).toFixed(2));
  }
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data, error } = await supabase
    .from("trips")
    .update(updateData as never)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
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

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Trip deleted" });
}
