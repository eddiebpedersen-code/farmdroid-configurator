import { hubspotRequest, searchHubSpot } from "./client";
import type { LeadData } from "@/components/configurator/lead-capture-form";
import type { ConfiguratorState } from "@/lib/configurator-data";
import {
  applyMappings,
  hasMappings,
  getDefaultContactProperties,
} from "./mapping-service";

interface HubSpotContact {
  id: string;
  properties: Record<string, string>;
}

/**
 * Create or update a contact in HubSpot
 * Uses dynamic mappings if available, falls back to hardcoded defaults
 * Returns the contact ID
 */
export async function createOrUpdateContact(
  lead: LeadData,
  reference: string,
  country: string,
  config?: ConfiguratorState
): Promise<string> {
  // First, search for existing contact by email
  const searchResult = await searchHubSpot("contacts", [
    {
      filters: [
        {
          propertyName: "email",
          operator: "EQ",
          value: lead.email,
        },
      ],
    },
  ]);

  let properties: Record<string, string | number | boolean>;

  // Check if we have dynamic mappings configured
  const useDynamicMappings = await hasMappings("contact");

  if (useDynamicMappings && config) {
    // Use dynamic mappings from database
    properties = await applyMappings(
      {
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        company: lead.company,
        country: country,
        farmSize: lead.farmSize,
        hectaresForFarmDroid: lead.hectaresForFarmDroid,
        crops: lead.crops,
        contactByPartner: lead.contactByPartner,
        marketingConsent: lead.marketingConsent,
      },
      config,
      "contact"
    );

    // Always ensure email is set (required for contact)
    if (!properties.email) {
      properties.email = lead.email;
    }
  } else {
    // Fall back to hardcoded defaults
    properties = getDefaultContactProperties(lead, reference, country);
  }

  if (searchResult.results.length > 0) {
    // Update existing contact
    const existingId = searchResult.results[0].id;
    await hubspotRequest<HubSpotContact>(
      `/crm/v3/objects/contacts/${existingId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      }
    );
    return existingId;
  } else {
    // Create new contact
    const result = await hubspotRequest<HubSpotContact>(
      "/crm/v3/objects/contacts",
      {
        method: "POST",
        body: JSON.stringify({ properties }),
      }
    );
    return result.id;
  }
}
