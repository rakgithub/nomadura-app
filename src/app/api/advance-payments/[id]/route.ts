import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/advance-payments/[id]
 *
 * Returns a single advance payment by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("advance_payments")
    .select(`
      *,
      trips!inner(user_id, name)
    `)
    .eq("id", id)
    .eq("trips.user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Advance payment not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/advance-payments/[id]
 *
 * Deletes an advance payment by ID.
 * This will automatically update trip totals via database trigger.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify advance payment belongs to user's trip
  const { data: advancePayment } = await supabase
    .from("advance_payments")
    .select(`
      id,
      trips!inner(user_id)
    `)
    .eq("id", id)
    .eq("trips.user_id", user.id)
    .single();

  if (!advancePayment) {
    return NextResponse.json(
      { error: "Advance payment not found or access denied" },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from("advance_payments")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
