import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateBusinessExpense } from "@/types/database";

/**
 * GET /api/business-expenses/[id]
 *
 * Returns a single business expense by ID.
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
    .from("business_expenses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Business expense not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * PUT /api/business-expenses/[id]
 *
 * Updates a business expense by ID.
 */
export async function PUT(
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

  try {
    const body = await request.json();

    // Validate amount if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const updateData: UpdateBusinessExpense = {
      category: body.category,
      description: body.description,
      amount: body.amount,
      expense_date: body.expense_date,
      notes: body.notes,
    };

    const { data, error } = await supabase
      .from("business_expenses")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Business expense not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Business expense update error:", error);
    return NextResponse.json(
      { error: "Failed to update business expense" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/business-expenses/[id]
 *
 * Deletes a business expense by ID.
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

  const { error } = await supabase
    .from("business_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
