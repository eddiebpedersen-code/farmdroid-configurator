import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import { hubspotRequest } from "@/lib/hubspot/client";
import type { HubSpotProperty } from "@/lib/admin/types";

interface HubSpotPropertiesResponse {
  results: Array<{
    name: string;
    label: string;
    type: string;
    fieldType: string;
    groupName: string;
    description?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
}

// Simple in-memory cache for HubSpot properties (5 minutes)
const cache: Map<string, { data: HubSpotProperty[]; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/admin/hubspot/properties?object=contact|company|deal
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const objectType = searchParams.get("object");

    if (!objectType || !["contact", "company", "deal"].includes(objectType)) {
      return NextResponse.json(
        { error: "Invalid object type. Must be contact, company, or deal" },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `properties_${objectType}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Map object type to HubSpot API endpoint
    const hubspotObjectType =
      objectType === "contact"
        ? "contacts"
        : objectType === "company"
        ? "companies"
        : "deals";

    // Fetch properties from HubSpot
    const response = await hubspotRequest<HubSpotPropertiesResponse>(
      `/crm/v3/properties/${hubspotObjectType}`
    );

    // Log enumeration properties for debugging
    const enumerationProps = response.results.filter(p => p.type === "enumeration");
    console.log(`Found ${enumerationProps.length} enumeration properties for ${objectType}:`,
      enumerationProps.map(p => ({ name: p.name, label: p.label, optionsCount: p.options?.length || 0 }))
    );

    // Transform and filter properties
    const properties: HubSpotProperty[] = response.results
      .filter((prop) => {
        // Filter out read-only and system properties that aren't useful for mapping
        const excludedGroups = ["contactinformation_legacy", "conversioninformation"];
        return !excludedGroups.includes(prop.groupName);
      })
      .map((prop) => ({
        name: prop.name,
        label: prop.label,
        type: prop.type,
        fieldType: prop.fieldType,
        groupName: prop.groupName,
        description: prop.description,
        options: prop.options,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // Update cache
    cache.set(cacheKey, { data: properties, timestamp: Date.now() });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("HubSpot properties API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot properties" },
      { status: 500 }
    );
  }
}
