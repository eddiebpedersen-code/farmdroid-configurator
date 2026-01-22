import { hubspotRequest } from "./client";
import type { ConfiguratorState } from "@/lib/configurator-data";

interface NoteResponse {
  id: string;
  properties: Record<string, string>;
}

/**
 * Generates a configuration summary for HubSpot notes
 */
export function generateConfigSummary(
  config: ConfiguratorState,
  reference: string,
  totalPrice: number,
  currency: string,
  configUrl: string
): string {
  const lines: string[] = [];

  lines.push(`Configuration Reference: ${reference}`);
  lines.push(`View Configuration: ${configUrl}`);
  lines.push("");
  lines.push("=== Robot Configuration ===");
  lines.push("");
  lines.push(`Robot Model: FD20 V2.6`);
  lines.push(`Seed Size: ${config.seedSize}`);
  lines.push(`Active Rows: ${config.activeRows}`);
  lines.push(`Row Distance: ${config.rowDistance}mm`);
  lines.push(`Power Source: ${config.powerSource === "hybrid" ? "Hybrid" : "Solar"}`);

  // Front wheel
  const wheelNames: Record<string, string> = {
    PFW: "Passive Front Wheel",
    AFW: "Active Front Wheel",
    DFW: "Double Front Wheel",
  };
  lines.push(`Front Wheel: ${wheelNames[config.frontWheel] || config.frontWheel}`);
  lines.push(`Wheel Spacing: ${config.wheelSpacing}mm`);

  // Optional features
  if (config.spraySystem) {
    lines.push(`+SPRAY System: Yes`);
  }

  if (config.weedingTool !== "none") {
    const toolNames: Record<string, string> = {
      combiTool: "Combi Tool",
      weedCuttingDisc: "Weed Cutting Disc",
    };
    lines.push(`Weeding Tool: ${toolNames[config.weedingTool] || config.weedingTool}`);
  }

  // Accessories
  const accessories: string[] = [];
  if (config.starterKit) accessories.push("Starter Kit");
  if (config.roadTransport) accessories.push("Road Transport Platform");
  if (config.powerBank) accessories.push("Power Bank");
  if (config.additionalWeightKit) accessories.push("Additional Weight Kit");
  if (config.toolbox) accessories.push("Toolbox");
  if (config.fieldBracket) accessories.push("Field Bracket");
  if (config.fstFieldSetupTool) accessories.push("FST Field Setup Tool");
  if (config.baseStationV3) accessories.push("Base Station V3");
  if (config.essentialCarePackage) accessories.push("Essential Care Package");
  if (config.essentialCareSpray) accessories.push("Essential Care Spray");

  if (accessories.length > 0) {
    lines.push("");
    lines.push("=== Accessories ===");
    lines.push("");
    accessories.forEach((acc) => lines.push(`- ${acc}`));
  }

  // Service plan
  if (config.servicePlan !== "none") {
    lines.push("");
    lines.push("=== Service ===");
    lines.push("");
    lines.push(`Service Plan: ${config.servicePlan === "premium" ? "Premium" : "Standard"}`);
  }

  if (config.warrantyExtension) {
    if (config.servicePlan === "none") {
      lines.push("");
      lines.push("=== Service ===");
      lines.push("");
    }
    lines.push(`Warranty Extension: Yes (+2 years)`);
  }

  // Price
  lines.push("");
  lines.push("=== Pricing ===");
  lines.push("");
  const formattedPrice = new Intl.NumberFormat(currency === "DKK" ? "da-DK" : "de-DE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalPrice); // totalPrice is already in whole currency units
  lines.push(`Total Price: ${formattedPrice}`);

  return lines.join("\n");
}

/**
 * Creates a note in HubSpot and associates it with a deal
 */
export async function createDealNote(
  dealId: string,
  noteBody: string
): Promise<string> {
  // Create the note using the Engagements API v3
  const response = await hubspotRequest<NoteResponse>(
    "/crm/v3/objects/notes",
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [
          {
            to: {
              id: dealId,
            },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 214, // Note to Deal association
              },
            ],
          },
        ],
      }),
    }
  );

  return response.id;
}

/**
 * Creates a note and associates it with both deal and contact
 */
export async function createConfigurationNote(
  dealId: string,
  contactId: string,
  config: ConfiguratorState,
  reference: string,
  totalPrice: number,
  currency: string,
  configUrl: string
): Promise<string> {
  const noteBody = generateConfigSummary(
    config,
    reference,
    totalPrice,
    currency,
    configUrl
  );

  // Create the note with associations to both deal and contact
  const response = await hubspotRequest<NoteResponse>(
    "/crm/v3/objects/notes",
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [
          {
            to: {
              id: dealId,
            },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 214, // Note to Deal
              },
            ],
          },
          {
            to: {
              id: contactId,
            },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 202, // Note to Contact
              },
            ],
          },
        ],
      }),
    }
  );

  return response.id;
}

/**
 * Creates a simple note on a contact with the configuration link
 */
export async function createContactNote(
  contactId: string,
  reference: string,
  configUrl: string
): Promise<string> {
  const noteBody = `FarmDroid Configuration: ${reference}\n\nView configuration: ${configUrl}`;

  const response = await hubspotRequest<NoteResponse>(
    "/crm/v3/objects/notes",
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [
          {
            to: {
              id: contactId,
            },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 202, // Note to Contact
              },
            ],
          },
        ],
      }),
    }
  );

  return response.id;
}
