import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import type { HubSpotFieldMappingUpdate } from "@/lib/admin/types";

// PUT /api/admin/mappings/[id] - Update a field mapping
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify current user is authenticated and is an admin
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

    const body = await request.json();
    const {
      hubspot_property,
      hubspot_property_label,
      transform_type,
      transform_config,
      is_active,
    } = body as HubSpotFieldMappingUpdate;

    const updateData: HubSpotFieldMappingUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (hubspot_property !== undefined) updateData.hubspot_property = hubspot_property;
    if (hubspot_property_label !== undefined) updateData.hubspot_property_label = hubspot_property_label;
    if (transform_type !== undefined) updateData.transform_type = transform_type;
    if (transform_config !== undefined) updateData.transform_config = transform_config;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedMapping, error } = await supabase
      .from("hubspot_field_mappings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating mapping:", error);
      return NextResponse.json(
        { error: "Failed to update mapping" },
        { status: 500 }
      );
    }

    if (!updatedMapping) {
      return NextResponse.json({ error: "Mapping not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMapping);
  } catch (error) {
    console.error("Mappings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/mappings/[id] - Delete a field mapping
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify current user is authenticated and is an admin
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
      .from("hubspot_field_mappings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting mapping:", error);
      return NextResponse.json(
        { error: "Failed to delete mapping" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mappings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
