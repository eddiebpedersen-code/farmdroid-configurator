import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import type { HubSpotFieldMappingInsert } from "@/lib/admin/types";

// GET /api/admin/mappings - List all field mappings
export async function GET() {
  try {
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

    // Get all field mappings
    const { data: mappings, error } = await supabase
      .from("hubspot_field_mappings")
      .select("*")
      .order("hubspot_object")
      .order("source_category")
      .order("source_field");

    if (error) {
      console.error("Error fetching mappings:", error);
      return NextResponse.json(
        { error: "Failed to fetch mappings" },
        { status: 500 }
      );
    }

    return NextResponse.json(mappings || []);
  } catch (error) {
    console.error("Mappings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/mappings - Create a new field mapping
export async function POST(request: Request) {
  try {
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
      source_field,
      source_category,
      hubspot_object,
      hubspot_property,
      hubspot_property_label,
      transform_type = "direct",
      transform_config,
    } = body as HubSpotFieldMappingInsert;

    // Validate required fields
    if (!source_field || !source_category || !hubspot_object || !hubspot_property) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["lead", "config", "static", "derived"].includes(source_category)) {
      return NextResponse.json(
        { error: "Invalid source category" },
        { status: 400 }
      );
    }

    if (!["contact", "company", "deal"].includes(hubspot_object)) {
      return NextResponse.json(
        { error: "Invalid HubSpot object type" },
        { status: 400 }
      );
    }

    // Check if mapping already exists for this source field and HubSpot object
    const { data: existing } = await supabase
      .from("hubspot_field_mappings")
      .select("id")
      .eq("source_field", source_field)
      .eq("hubspot_object", hubspot_object)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A mapping for this field and HubSpot object already exists" },
        { status: 409 }
      );
    }

    // Create the mapping
    const { data: newMapping, error } = await supabase
      .from("hubspot_field_mappings")
      .insert({
        source_field,
        source_category,
        hubspot_object,
        hubspot_property,
        hubspot_property_label,
        transform_type,
        transform_config,
        created_by: adminUser.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating mapping:", error);
      return NextResponse.json(
        { error: "Failed to create mapping" },
        { status: 500 }
      );
    }

    return NextResponse.json(newMapping, { status: 201 });
  } catch (error) {
    console.error("Mappings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
