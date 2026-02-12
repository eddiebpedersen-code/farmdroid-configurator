import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createHubSpotEntities } from "@/lib/hubspot";
import { updateNoteWithViewTracking, type ContactPreferences } from "@/lib/hubspot/notes";
import type { ConfiguratorState } from "@/lib/configurator-data";

interface RouteParams {
  params: Promise<{ reference: string }>;
}

interface LeadUpdates {
  firstName?: string;
  lastName?: string;
  phone?: string;
  farmSize?: string;
  hectaresForFarmDroid?: string;
  crops?: string;
  otherCrops?: string;
}

interface UpdateConfigurationRequest {
  config: ConfiguratorState;
  totalPrice: number;
  currency: string;
  leadUpdates?: LeadUpdates;
}

/**
 * GET /api/configurations/[reference]
 * Fetches a configuration by its reference code
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reference } = await params;

    if (!reference) {
      return NextResponse.json(
        { error: "Reference code is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch configuration
    const { data, error } = await supabase
      .from("configurations")
      .select("*")
      .eq("reference", reference.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Increment view count
    const newViewCount = (data.view_count ?? 0) + 1;
    const newLastViewedAt = new Date().toISOString();

    const { error: viewUpdateError } = await supabase
      .from("configurations")
      .update({
        view_count: newViewCount,
        last_viewed_at: newLastViewedAt,
        updated_at: newLastViewedAt,
      })
      .eq("id", data.id);

    if (viewUpdateError) {
      console.error("[Views] Failed to update view count:", viewUpdateError.message);
    }

    // Update HubSpot note with view tracking (throttled: at most once per hour)
    if (data.hubspot_note_id) {
      const shouldSync =
        !data.hubspot_note_synced_at ||
        Date.now() - new Date(data.hubspot_note_synced_at).getTime() > 60 * 60 * 1000;

      if (shouldSync) {
        void (async () => {
          try {
            // Ensure baseUrl has no trailing whitespace/slashes that could break URLs
            const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://configurator.farmdroid.com").trim().replace(/\/+$/, "");
            const configUrl = `${baseUrl}/${data.locale || "en"}/config/${reference}`;

            // Include contact preferences in the note
            const preferences: ContactPreferences = {
              contactByPartner: data.contact_by_partner ?? false,
              marketingConsent: data.marketing_consent ?? false,
            };

            await updateNoteWithViewTracking(
              data.hubspot_note_id!,
              reference,
              configUrl,
              newViewCount,
              newLastViewedAt,
              preferences
            );

            await supabase
              .from("configurations")
              .update({ hubspot_note_synced_at: newLastViewedAt })
              .eq("id", data.id);

            console.log(`[HubSpot] Updated note ${data.hubspot_note_id} with view tracking for ${reference}`);
          } catch (error) {
            console.error("[HubSpot] Failed to update note with view tracking:", error);
          }
        })();
      }
    }

    // Return configuration data in the format expected by the config page
    return NextResponse.json({
      reference: data.reference,
      lead: {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone || "",
        company: data.company,
        isFarmer: data.is_farmer || "",
        country: data.country,
        region: data.region || "",
        farmingType: data.farming_type || "",
        farmSize: data.farm_size || "",
        hectaresForFarmDroid: data.hectares_for_farmdroid || "",
        crops: data.crops || "",
        otherCrops: data.other_crops || "",
        contactByPartner: data.contact_by_partner,
        marketingConsent: data.marketing_consent,
      },
      config: data.config,
      locale: data.locale,
      totalPrice: data.total_price,
      currency: data.currency,
      createdAt: data.created_at,
      viewCount: newViewCount,
      lastViewedAt: newLastViewedAt,
    });
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/configurations/[reference]
 * Updates an existing configuration (config only, not lead data)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { reference } = await params;
    const body: UpdateConfigurationRequest = await request.json();
    const { config, totalPrice, currency, leadUpdates } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Reference code is required" },
        { status: 400 }
      );
    }

    if (!config || totalPrice === undefined || !currency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch existing configuration to get lead data
    const { data: existing, error: fetchError } = await supabase
      .from("configurations")
      .select("*")
      .eq("reference", reference.toUpperCase())
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Build update object with config and optional lead updates
    const updateData: Record<string, unknown> = {
      config,
      total_price: totalPrice,
      currency,
      updated_at: new Date().toISOString(),
    };

    // Add lead field updates if provided (email and company are not updateable)
    if (leadUpdates) {
      if (leadUpdates.firstName) updateData.first_name = leadUpdates.firstName;
      if (leadUpdates.lastName) updateData.last_name = leadUpdates.lastName;
      if (leadUpdates.phone !== undefined) updateData.phone = leadUpdates.phone || null;
      if (leadUpdates.farmSize !== undefined) updateData.farm_size = leadUpdates.farmSize || null;
      if (leadUpdates.hectaresForFarmDroid !== undefined) updateData.hectares_for_farmdroid = leadUpdates.hectaresForFarmDroid || null;
      if (leadUpdates.crops !== undefined) updateData.crops = leadUpdates.crops || null;
    }

    // Update the configuration
    const { error: updateError } = await supabase
      .from("configurations")
      .update(updateData)
      .eq("reference", reference.toUpperCase());

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update configuration" },
        { status: 500 }
      );
    }

    // Update HubSpot entities (Contact, Company, Deal will be updated/deduplicated)
    try {
      // Ensure baseUrl has no trailing whitespace/slashes that could break URLs
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://configurator.farmdroid.com").trim().replace(/\/+$/, "");

      // Use updated lead values if provided, otherwise use existing values
      const lead = {
        firstName: leadUpdates?.firstName || existing.first_name,
        lastName: leadUpdates?.lastName || existing.last_name,
        email: existing.email, // Never changes
        phone: leadUpdates?.phone !== undefined ? leadUpdates.phone : (existing.phone || ""),
        company: existing.company, // Never changes
        isFarmer: existing.is_farmer || "",
        country: existing.country,
        region: existing.region || "",
        farmingType: existing.farming_type || "",
        farmSize: leadUpdates?.farmSize !== undefined ? leadUpdates.farmSize : (existing.farm_size || ""),
        hectaresForFarmDroid: leadUpdates?.hectaresForFarmDroid !== undefined ? leadUpdates.hectaresForFarmDroid : (existing.hectares_for_farmdroid || ""),
        crops: leadUpdates?.crops !== undefined ? leadUpdates.crops : (existing.crops || ""),
        otherCrops: leadUpdates?.otherCrops !== undefined ? leadUpdates.otherCrops : (existing.other_crops || ""),
        contactByPartner: existing.contact_by_partner,
        marketingConsent: existing.marketing_consent,
      };

      await createHubSpotEntities(
        lead,
        config,
        reference.toUpperCase(),
        totalPrice,
        currency,
        existing.country || "",
        existing.locale,
        baseUrl
      );
    } catch (hubspotError) {
      // Log but don't fail - config is already updated
      console.error("HubSpot update error:", hubspotError);
    }

    return NextResponse.json({
      success: true,
      reference: reference.toUpperCase(),
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
