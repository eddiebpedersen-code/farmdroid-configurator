import { createOrUpdateContact } from "./contacts";
import { createOrUpdateCompany, associateContactToCompany, getContactCompany } from "./companies";
import { createContactNote } from "./notes";
import { sendConfigurationEmail } from "@/lib/emails/sendgrid";
import type { LeadData } from "@/components/configurator/lead-capture-form";
import type { ConfiguratorState } from "@/lib/configurator-data";

export interface HubSpotResult {
  contactId: string;
  companyId?: string;
  noteId?: string;
  emailSent?: boolean;
}

/**
 * Create all HubSpot entities for a new configuration submission
 * Creates/updates Contact, creates/updates Company, and creates a note on the contact with the config link
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
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "https://configurator.farmdroid.com"
): Promise<HubSpotResult> {
  // 1. Create or update contact (pass config for dynamic mappings)
  const contactId = await createOrUpdateContact(lead, reference, country, config);

  // 2. Only create/associate company if the lead is a farmer
  let companyId: string | undefined;

  if (lead.isFarmer !== "no") {
    // Check if contact already has a company associated (prevents duplicates from misspellings)
    companyId = await getContactCompany(contactId) || undefined;

    if (!companyId) {
      // Prepare lead data for company mapping
      const leadData = {
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        company: lead.company,
        country: country,
        region: lead.region,
        isFarmer: lead.isFarmer,
        farmingType: lead.farmingType,
        farmSize: lead.farmSize,
        hectaresForFarmDroid: lead.hectaresForFarmDroid,
        crops: lead.crops,
        otherCrops: lead.otherCrops,
        contactByPartner: lead.contactByPartner,
        marketingConsent: lead.marketingConsent,
      };

      // No existing company - create or find one by name
      companyId = await createOrUpdateCompany(lead.company, country, leadData, config);
      // Associate contact to company
      await associateContactToCompany(contactId, companyId);
    } else {
      console.log(`Contact ${contactId} already associated with company ${companyId}, using existing`);
    }
  } else {
    console.log(`Lead is not a farmer, skipping company creation for contact ${contactId}`);
  }

  // 3. Create a note on the contact with the configuration link
  const configUrl = `${baseUrl}/${locale}/config/${reference}`;
  let noteId: string | undefined;
  try {
    noteId = await createContactNote(contactId, reference, configUrl);
  } catch (error) {
    // Note creation is non-critical, log and continue
    console.error("Failed to create HubSpot note:", error);
  }

  // 4. Send configuration email to the contact via SendGrid
  let emailSent = false;
  try {
    emailSent = await sendConfigurationEmail(
      lead.email,
      lead.firstName,
      reference,
      configUrl,
      locale
    );
  } catch (error) {
    // Email is non-critical, log and continue
    console.error("Failed to send configuration email:", error);
  }

  return {
    contactId,
    companyId,
    noteId,
    emailSent,
  };
}

export { createOrUpdateContact } from "./contacts";
export { createOrUpdateCompany, associateContactToCompany, getContactCompany } from "./companies";
export { createContactNote } from "./notes";
export { sendConfigurationEmail } from "@/lib/emails/sendgrid";
