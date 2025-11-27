import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/transfers
 * Get all transfers for the authenticated user
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: transfers, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("user_id", user.id)
    .order("transfer_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(transfers);
}

/**
 * POST /api/transfers
 * Create a new transfer from profit pool to operating pool
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, transfer_date, notes } = body;

  // Validation
  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be greater than 0" },
      { status: 400 }
    );
  }

  const { data: transfer, error } = await supabase
    .from("transfers")
    .insert({
      user_id: user.id,
      amount,
      transfer_date: transfer_date || new Date().toISOString().split("T")[0],
      notes,
    } as any)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(transfer, { status: 201 });
}
