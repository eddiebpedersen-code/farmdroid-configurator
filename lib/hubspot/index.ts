import { createOrUpdateContact } from "./contacts";
import { createOrUpdateCompany, associateContactToCompany } from "./companies";
import { createOrUpdateDeal, associateDealToContact, associateDealToCompany } from "./deals";
import { createConfigurationNote, generateConfigSummary } from "./notes";
import type { LeadData } from "@/components/configurator/lead-capture-form";
import type { ConfiguratorState } from "@/lib/configurator-data";

export interface HubSpotResult {
  contactId: string;
  companyId: string;
  dealId: string;
  noteId?: string;
}

/**
 * Create all HubSpot entities for a new configuration submission
 * Creates/updates Contact, creates/updates Company, creates Deal, and associates them all
 * Uses dynamic field mappings if configured, falls back to hardcoded defaults
 */
export async function createHubSpotEntities(
  lead: LeadData,
  config: ConfiguratorState,
  reference: string,
  totalPrice: number,
  currency: string,
  country: string,
  locale: string = "en",
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "https://configurator.farmdroid.dk"
): Promise<HubSpotResult> {
  // Prepare lead data for mapping service
  const leadData = {
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
  };

  // 1. Create or update contact (pass config for dynamic mappings)
  const contactId = await createOrUpdateContact(lead, reference, country, config);

  // 2. Create or update company (pass lead and config for dynamic mappings)
  const companyId = await createOrUpdateCompany(lead.company, country, leadData, config);

  // 3. Associate contact to company
  await associateContactToCompany(contactId, companyId);

  // Prepare derived data for field mapping
  const configUrl = `${baseUrl}/${locale}/config/${reference}`;
  const configSummary = generateConfigSummary(config, reference, totalPrice, currency, configUrl);
  const derivedData = {
    reference,
    configUrl,
    configSummary,
    totalPrice,
    currency,
  };

  // 4. Create or update deal (pass contactId for deduplication)
  const dealId = await createOrUpdateDeal(
    lead.company,
    reference,
    totalPrice,
    currency,
    config,
    lead.contactByPartner,
    contactId,
    leadData,
    derivedData
  );

  // 5. Associate deal to contact and company
  await associateDealToContact(dealId, contactId);
  await associateDealToCompany(dealId, companyId);

  // 6. Create a note with the configuration summary
  let noteId: string | undefined;
  try {
    noteId = await createConfigurationNote(
      dealId,
      contactId,
      config,
      reference,
      totalPrice,
      currency,
      configUrl
    );
  } catch (error) {
    // Note creation is non-critical, log and continue
    console.error("Failed to create HubSpot note:", error);
  }

  return {
    contactId,
    companyId,
    dealId,
    noteId,
  };
}

export { createOrUpdateContact } from "./contacts";
export { createOrUpdateCompany, associateContactToCompany } from "./companies";
export { createOrUpdateDeal, createDeal, associateDealToContact, associateDealToCompany } from "./deals";
export { createConfigurationNote, createDealNote, generateConfigSummary } from "./notes";
