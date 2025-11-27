import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InsertSettings } from "@/types/database";

/**
 * GET /api/settings
 *
 * Returns the user's advance split settings.
 * Creates default settings if none exist.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Try to get existing settings
    const { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If settings don't exist, create default settings
    if (error && error.code === "PGRST116") {
      const defaultSettings: InsertSettings = {
        user_id: user.id,
        trip_reserve_percentage: 60,
        early_unlock_percentage: 20,
        locked_percentage: 20,
        minimum_operating_cash_threshold: 0,
        minimum_trip_reserve_threshold: 0,
      };

      const { data: newSettings, error: createError } = await supabase
        .from("settings")
        .insert(defaultSettings as never)
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(newSettings);
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 *
 * Updates the user's advance split settings.
 * Validates that percentages sum to 100.
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate percentages if provided
    if (
      body.trip_reserve_percentage !== undefined ||
      body.early_unlock_percentage !== undefined ||
      body.locked_percentage !== undefined
    ) {
      // Get current settings to fill in missing values
      const { data: currentSettings } = await supabase
        .from("settings")
        .select("trip_reserve_percentage, early_unlock_percentage, locked_percentage")
        .eq("user_id", user.id)
        .single();

      const tripReserve =
        body.trip_reserve_percentage ?? (currentSettings as any)?.trip_reserve_percentage ?? 60;
      const earlyUnlock =
        body.early_unlock_percentage ?? (currentSettings as any)?.early_unlock_percentage ?? 20;
      const locked =
        body.locked_percentage ?? (currentSettings as any)?.locked_percentage ?? 20;

      const total = tripReserve + earlyUnlock + locked;

      if (total !== 100) {
        return NextResponse.json(
          {
            error: `Percentages must sum to 100. Current sum: ${total}`,
            details: {
              trip_reserve_percentage: tripReserve,
              early_unlock_percentage: earlyUnlock,
              locked_percentage: locked,
              total,
            },
          },
          { status: 400 }
        );
      }

      // Validate individual percentages
      if (tripReserve < 0 || tripReserve > 100) {
        return NextResponse.json(
          { error: "Trip reserve percentage must be between 0 and 100" },
          { status: 400 }
        );
      }
      if (earlyUnlock < 0 || earlyUnlock > 100) {
        return NextResponse.json(
          { error: "Early unlock percentage must be between 0 and 100" },
          { status: 400 }
        );
      }
      if (locked < 0 || locked > 100) {
        return NextResponse.json(
          { error: "Locked percentage must be between 0 and 100" },
          { status: 400 }
        );
      }

      // Warn if early unlock is too high
      if (earlyUnlock > 40) {
        console.warn(
          `High early unlock percentage (${earlyUnlock}%) may leave too little for trip expenses`
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (body.trip_reserve_percentage !== undefined)
      updateData.trip_reserve_percentage = body.trip_reserve_percentage;
    if (body.early_unlock_percentage !== undefined)
      updateData.early_unlock_percentage = body.early_unlock_percentage;
    if (body.locked_percentage !== undefined)
      updateData.locked_percentage = body.locked_percentage;
    if (body.minimum_operating_cash_threshold !== undefined)
      updateData.minimum_operating_cash_threshold = body.minimum_operating_cash_threshold;
    if (body.minimum_trip_reserve_threshold !== undefined)
      updateData.minimum_trip_reserve_threshold = body.minimum_trip_reserve_threshold;

    const { data: settings, error } = await supabase
      .from("settings")
      .update(updateData as never)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // If settings don't exist, create them
      if (error.code === "PGRST116") {
        const insertData: InsertSettings = {
          user_id: user.id,
          trip_reserve_percentage: body.trip_reserve_percentage ?? 60,
          early_unlock_percentage: body.early_unlock_percentage ?? 20,
          locked_percentage: body.locked_percentage ?? 20,
          minimum_operating_cash_threshold: body.minimum_operating_cash_threshold ?? 0,
          minimum_trip_reserve_threshold: body.minimum_trip_reserve_threshold ?? 0,
        };

        const { data: newSettings, error: createError } = await supabase
          .from("settings")
          .insert(insertData as never)
          .select()
          .single();

        if (createError) {
          return NextResponse.json(
            { error: createError.message },
            { status: 500 }
          );
        }

        return NextResponse.json(newSettings);
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
