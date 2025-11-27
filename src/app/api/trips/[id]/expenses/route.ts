import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trips/[id]/expenses - List expenses for a trip
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

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", id)
    .order("expense_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/trips/[id]/expenses - Add expense to trip
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

  // Verify trip belongs to user and get trip reserve balance
  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, trip_reserve_balance")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const body = await request.json();

  // Check if adding this expense would exceed trip reserve balance
  // Get current trip expenses
  const { data: currentExpenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("trip_id", id);

  const currentTripExpenses = currentExpenses?.reduce((sum, e: any) => sum + Number(e.amount), 0) || 0;
  const expenseAmount = Number(body.amount);
  const tripReserveBalance = Number((trip as any).trip_reserve_balance) || 0;
  const remainingReserve = tripReserveBalance - currentTripExpenses;
  const shortfall = expenseAmount - remainingReserve;

  if (shortfall > 0 && !body.ignoreWarning) {
    // Return warning - expense would exceed available trip reserve
    return NextResponse.json(
      {
        warning: true,
        message: "Expense exceeds available trip reserve",
        tripName: (trip as any).name,
        tripReserveBalance,
        expenseAmount,
        shortfall,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      trip_id: id,
      category: body.category,
      description: body.description,
      amount: body.amount,
      expense_date: body.expense_date || new Date().toISOString().split("T")[0],
      notes: body.notes,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
