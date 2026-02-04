import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";

// GET /api/verified-configs - Public endpoint for active verified configs
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const seedSize = searchParams.get("seed_size");

    let query = supabase
      .from("verified_configurations")
      .select("id, name, description, config, seed_size, active_rows, display_order")
      .eq("is_active", true)
      .order("display_order")
      .order("created_at", { ascending: false });

    if (seedSize && ["6mm", "14mm"].includes(seedSize)) {
      query = query.in("seed_size", [seedSize, "both"]);
    }

    const { data: configs, error } = await query;

    if (error) {
      console.error("Error fetching public verified configs:", error);
      return NextResponse.json(
        { error: "Failed to fetch verified configurations" },
        { status: 500 }
      );
    }

    return NextResponse.json(configs || [], {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Public verified configs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
