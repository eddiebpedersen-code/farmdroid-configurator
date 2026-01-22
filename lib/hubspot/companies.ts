import { hubspotRequest, searchHubSpot } from "./client";
import type { ConfiguratorState } from "@/lib/configurator-data";
import {
  applyMappings,
  hasMappings,
  getDefaultCompanyProperties,
} from "./mapping-service";

interface LeadData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company: string;
  country: string;
  farmSize?: string;
  hectaresForFarmDroid?: string;
  crops?: string;
  contactByPartner?: boolean;
  marketingConsent?: boolean;
}

interface HubSpotCompany {
  id: string;
  properties: Record<string, string>;
}

/**
 * Create or update a company in HubSpot
 * Uses dynamic mappings if available, falls back to hardcoded defaults
 * Returns the company ID
 */
export async function createOrUpdateCompany(
  companyName: string,
  country: string,
  lead?: LeadData,
  config?: ConfiguratorState
): Promise<string> {
  // Normalize company name (trim whitespace)
  const normalizedName = companyName.trim();

  // Search for existing company by name
  const searchResult = await searchHubSpot("companies", [
    {
      filters: [
        {
          propertyName: "name",
          operator: "EQ",
          value: normalizedName,
        },
      ],
    },
  ]);

  let properties: Record<string, string | number | boolean>;

  // Check if we have dynamic mappings configured
  const useDynamicMappings = await hasMappings("company");

  if (useDynamicMappings && lead && config) {
    // Use dynamic mappings from database
    properties = await applyMappings(lead, config, "company");

    // Always ensure name is set (required for company)
    if (!properties.name) {
      properties.name = normalizedName;
    }
  } else {
    // Fall back to hardcoded defaults
    properties = getDefaultCompanyProperties(normalizedName, country);
  }

  if (searchResult.results.length > 0) {
    // Update existing company
    const existingId = searchResult.results[0].id;
    await hubspotRequest<HubSpotCompany>(
      `/crm/v3/objects/companies/${existingId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      }
    );
    return existingId;
  } else {
    // Create new company
    const result = await hubspotRequest<HubSpotCompany>(
      "/crm/v3/objects/companies",
      {
        method: "POST",
        body: JSON.stringify({ properties }),
      }
    );
    return result.id;
  }
}

/**
 * Associate a contact with a company
 */
export async function associateContactToCompany(
  contactId: string,
  companyId: string
): Promise<void> {
  await hubspotRequest(
    `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
    {
      method: "PUT",
    }
  );
}
