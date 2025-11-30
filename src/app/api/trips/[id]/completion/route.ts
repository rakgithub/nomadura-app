import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/trips/[id]/completion
 *
 * Fetches the completion log for a completed trip
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: tripId } = await params;

  try {
    // Fetch the completion log for this trip
    const { data, error } = await supabase
      .from("trip_completion_logs")
      .select("*")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - trip not completed
        return NextResponse.json(
          { error: "Trip not completed" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch completion log:", error);
    return NextResponse.json(
      { error: "Failed to fetch completion log" },
      { status: 500 }
    );
  }
}
