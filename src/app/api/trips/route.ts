import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trips - List trips with filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  let query = supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (startDate) {
    query = query.gte("start_date", startDate);
  }

  if (endDate) {
    query = query.lte("end_date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/trips - Create trip
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const insertData = {
    user_id: user.id,
    name: body.name,
    destination: body.destination,
    start_date: body.start_date,
    end_date: body.end_date,
    status: body.status || "upcoming",
    min_participants: body.min_participants,
    price_per_participant: body.price_per_participant,
    notes: body.notes,
    destination_id: body.destination_id,
  };

  const { data, error } = await supabase
    .from("trips")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
