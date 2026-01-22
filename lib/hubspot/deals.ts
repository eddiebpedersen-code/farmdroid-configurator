import { hubspotRequest, searchHubSpot } from "./client";
import type { ConfiguratorState } from "@/lib/configurator-data";
import { applyMappings, hasMappings } from "./mapping-service";

interface AssociatedDealsResponse {
  results: Array<{
    id: string;
    properties: Record<string, string>;
  }>;
}

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

interface DerivedData {
  reference: string;
  configUrl: string;
  configSummary: string;
  totalPrice: number;
  currency: string;
}

interface HubSpotDeal {
  id: string;
  properties: Record<string, string>;
}

/**
 * Generate a description of the configuration for the deal
 */
function generateConfigDescription(config: ConfiguratorState): string {
  const lines: string[] = [
    `Robot: FD20 V2.6`,
    `Seed Size: ${config.seedSize}`,
    `Active Rows: ${config.activeRows}`,
    `Row Distance: ${config.rowDistance}mm`,
    `Power: ${config.powerSource === "hybrid" ? "Hybrid" : "Solar"}`,
    `Front Wheel: ${config.frontWheel}`,
  ];

  if (config.spraySystem) {
    lines.push(`+SPRAY System: Yes`);
  }

  if (config.weedingTool !== "none") {
    lines.push(`Weeding Tool: ${config.weedingTool}`);
  }

  // Accessories
  const accessories: string[] = [];
  if (config.starterKit) accessories.push("Starter Kit");
  if (config.roadTransport) accessories.push("Road Transport Platform");
  if (config.powerBank) accessories.push("Power Bank");
  if (config.additionalWeightKit) accessories.push("Weight Kit");
  if (config.toolbox) accessories.push("Toolbox");

  if (accessories.length > 0) {
    lines.push(`Accessories: ${accessories.join(", ")}`);
  }

  if (config.servicePlan !== "none") {
    lines.push(`Service Plan: ${config.servicePlan}`);
  }

  if (config.warrantyExtension) {
    lines.push(`Warranty: Extended (+2 years)`);
  }

  return lines.join("\n");
}

/**
 * Create or update a deal in HubSpot
 * If a deal already exists for the contact, it will be updated
 * Uses dynamic mappings for additional properties if available
 * Returns the deal ID
 */
export async function createOrUpdateDeal(
  companyName: string,
  reference: string,
  totalPrice: number,
  currency: string,
  config: ConfiguratorState,
  contactByPartner: boolean,
  contactId: string,
  lead?: LeadData,
  derived?: DerivedData
): Promise<string> {
  const dealName = `${companyName} - FD20 Configuration ${reference}`;
  const description = generateConfigDescription(config);

  // totalPrice is already in whole currency units (EUR or DKK)
  const amount = totalPrice;

  // Start with minimal required properties
  // Pipeline and dealstage should be configured via admin mappings
  const properties: Record<string, string | number | boolean> = {
    dealname: dealName,
    amount: amount,
    description: description,
  };

  // If they want to be contacted by partner, note it
  if (contactByPartner) {
    properties.description = `${description}\n\n** Customer requested to be contacted by local partner **`;
  }

  // Check if we have dynamic mappings configured for deals
  const useDynamicMappings = await hasMappings("deal");

  if (useDynamicMappings && lead) {
    // Apply dynamic mappings - these can add additional properties
    const mappedProperties = await applyMappings(
      lead,
      config,
      "deal",
      derived
    );

    // Merge mapped properties with defaults (mapped properties override)
    Object.assign(properties, mappedProperties);

    // Ensure essential fields are always set
    if (!properties.dealname) {
      properties.dealname = dealName;
    }
    if (!properties.amount) {
      properties.amount = amount;
    }
  }

  // Search for existing deals associated with this contact
  try {
    const existingDeals = await hubspotRequest<AssociatedDealsResponse>(
      `/crm/v3/objects/contacts/${contactId}/associations/deals`,
      { method: "GET" }
    );

    if (existingDeals.results && existingDeals.results.length > 0) {
      // Get the most recent deal's details to check if it's a configurator deal
      const recentDealId = existingDeals.results[0].id;

      // Update the existing deal
      await hubspotRequest<HubSpotDeal>(
        `/crm/v3/objects/deals/${recentDealId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ properties }),
        }
      );

      console.log(`Updated existing deal ${recentDealId} for contact ${contactId}`);
      return recentDealId;
    }
  } catch (error) {
    // If search fails, continue to create a new deal
    console.log("No existing deals found or error searching, creating new deal");
  }

  // Create new deal
  const result = await hubspotRequest<HubSpotDeal>("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  console.log(`Created new deal ${result.id} for contact ${contactId}`);
  return result.id;
}

// Keep old function name as alias for backwards compatibility
export const createDeal = createOrUpdateDeal;

/**
 * Associate a deal with a contact
 */
export async function associateDealToContact(
  dealId: string,
  contactId: string
): Promise<void> {
  await hubspotRequest(
    `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
    {
      method: "PUT",
    }
  );
}

/**
 * Associate a deal with a company
 */
export async function associateDealToCompany(
  dealId: string,
  companyId: string
): Promise<void> {
  await hubspotRequest(
    `/crm/v3/objects/deals/${dealId}/associations/companies/${companyId}/deal_to_company`,
    {
      method: "PUT",
    }
  );
}
