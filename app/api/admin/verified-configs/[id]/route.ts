import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import type { VerifiedConfigurationUpdate } from "@/lib/admin/types";

// PUT /api/admin/verified-configs/[id] - Update a verified config
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = (await request.json()) as VerifiedConfigurationUpdate;

    const updateData: VerifiedConfigurationUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.config !== undefined) updateData.config = body.config;
    if (body.seed_size !== undefined) updateData.seed_size = body.seed_size;
    if (body.active_rows !== undefined) updateData.active_rows = body.active_rows;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;

    const { data: updated, error } = await supabase
      .from("verified_configurations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating verified config:", error);
      return NextResponse.json(
        { error: "Failed to update verified configuration" },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Verified configs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/verified-configs/[id] - Delete a verified config
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from("verified_configurations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting verified config:", error);
      return NextResponse.json(
        { error: "Failed to delete verified configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verified configs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
