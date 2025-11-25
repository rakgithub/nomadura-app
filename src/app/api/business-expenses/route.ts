import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { InsertBusinessExpense } from "@/types/database";

/**
 * GET /api/business-expenses
 *
 * Returns list of all business expenses for the authenticated user.
 * Sorted by expense_date in descending order (most recent first).
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("business_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/business-expenses
 *
 * Creates a new business expense for the authenticated user.
 *
 * Required fields:
 * - category: BusinessExpenseCategory
 * - description: string
 * - amount: number
 *
 * Optional fields:
 * - expense_date: string (ISO date)
 * - notes: string
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.category || !body.description || body.amount === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: category, description, and amount are required",
        },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const insertData: InsertBusinessExpense = {
      user_id: user.id,
      category: body.category,
      description: body.description,
      amount: body.amount,
      expense_date: body.expense_date,
      notes: body.notes,
    };

    const { data, error } = await supabase
      .from("business_expenses")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Business expense creation error:", error);
    return NextResponse.json(
      { error: "Failed to create business expense" },
      { status: 500 }
    );
  }
}
