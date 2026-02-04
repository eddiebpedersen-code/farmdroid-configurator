import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import type { VerifiedConfigurationInsert } from "@/lib/admin/types";

// GET /api/admin/verified-configs - List all verified configs
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email!)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: configs, error } = await supabase
      .from("verified_configurations")
      .select("*")
      .order("display_order")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching verified configs:", error);
      return NextResponse.json(
        { error: "Failed to fetch verified configurations" },
        { status: 500 }
      );
    }

    return NextResponse.json(configs || []);
  } catch (error) {
    console.error("Verified configs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/verified-configs - Create a new verified config
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email!)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as VerifiedConfigurationInsert;

    if (!body.name || !body.config || !body.seed_size || !body.active_rows) {
      return NextResponse.json(
        { error: "Missing required fields: name, config, seed_size, active_rows" },
        { status: 400 }
      );
    }

    if (!["6mm", "14mm", "both"].includes(body.seed_size)) {
      return NextResponse.json(
        { error: "seed_size must be '6mm', '14mm', or 'both'" },
        { status: 400 }
      );
    }

    const { data: newConfig, error } = await supabase
      .from("verified_configurations")
      .insert({
        name: body.name,
        description: body.description || null,
        config: body.config,
        seed_size: body.seed_size,
        active_rows: body.active_rows,
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
        created_by: user.email,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating verified config:", error);
      return NextResponse.json(
        { error: "Failed to create verified configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error("Verified configs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
