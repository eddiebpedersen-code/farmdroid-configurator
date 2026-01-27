import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateConfigReference } from "@/lib/config-page-utils";
import { createHubSpotEntities } from "@/lib/hubspot";
import type { ConfiguratorState } from "@/lib/configurator-data";
import type { LeadData } from "@/components/configurator/lead-capture-form";

interface CreateConfigurationRequest {
  lead: LeadData;
  config: ConfiguratorState;
  locale: string;
  totalPrice: number;
  currency: string;
}

/**
 * POST /api/configurations
 * Creates a new configuration in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateConfigurationRequest = await request.json();
    const { lead, config, locale, totalPrice, currency } = body;

    // Validate required fields
    if (!lead || !config || !locale || totalPrice === undefined || !currency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique reference code
    let reference = generateConfigReference();
    const supabase = createServerSupabaseClient();

    // Ensure reference is unique (retry up to 5 times if collision)
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("configurations")
        .select("reference")
        .eq("reference", reference)
        .single();

      if (!existing) break;
      reference = generateConfigReference();
      attempts++;
    }

    const resolvedCountry = lead.country;

    // Insert into database
    const { data, error } = await supabase
      .from("configurations")
      .insert({
        reference,
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        phone: lead.phone || null,
        company: lead.company,
        is_farmer: lead.isFarmer || null,
        farming_type: lead.farmingType || null,
        country: resolvedCountry,
        region: lead.region || null,
        farm_size: lead.farmSize || null,
        hectares_for_farmdroid: lead.hectaresForFarmDroid || null,
        crops: lead.crops || null,
        other_crops: lead.otherCrops || null,
        contact_by_partner: lead.contactByPartner,
        marketing_consent: lead.marketingConsent,
        config,
        locale,
        total_price: totalPrice,
        currency,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save configuration" },
        { status: 500 }
      );
    }

    // Create HubSpot entities (Contact, Company) and Note with config link
    let hubspotResult = null;
    try {
      console.log("[API] Starting HubSpot integration for reference:", reference);
      // Get base URL for config link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://configurator.farmdroid.com";

      hubspotResult = await createHubSpotEntities(
        lead,
        config,
        reference,
        totalPrice,
        currency,
        resolvedCountry || "",
        locale,
        baseUrl
      );

      // Update database with HubSpot IDs
      await supabase
        .from("configurations")
        .update({
          hubspot_contact_id: hubspotResult.contactId,
          hubspot_company_id: hubspotResult.companyId,
        })
        .eq("reference", reference);
      console.log("[API] HubSpot integration completed successfully:", hubspotResult);
    } catch (hubspotError) {
      // Log but don't fail the request - config is already saved
      console.error("[API] HubSpot integration error:", hubspotError);
      console.error("[API] Error details:", hubspotError instanceof Error ? hubspotError.stack : hubspotError);
    }

    return NextResponse.json({
      success: true,
      reference: data.reference,
      url: `/${locale}/config/${data.reference}`,
      hubspot: hubspotResult,
    });
  } catch (error) {
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
