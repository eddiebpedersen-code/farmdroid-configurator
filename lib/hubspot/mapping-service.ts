import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { HubSpotFieldMappingRow, HubSpotObject } from "@/lib/admin/types";
import type { ConfiguratorState } from "@/lib/configurator-data";

interface LeadData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company: string;
  country: string;
  region?: string;
  isFarmer?: string;
  farmingType?: string;
  farmSize?: string;
  hectaresForFarmDroid?: string;
  crops?: string;
  otherCrops?: string;
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

// Cache for mappings (1 minute TTL)
let mappingsCache: {
  data: HubSpotFieldMappingRow[];
  timestamp: number;
} | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Fetches active mappings from the database (with caching)
 */
async function getActiveMappings(): Promise<HubSpotFieldMappingRow[]> {
  if (mappingsCache && Date.now() - mappingsCache.timestamp < CACHE_TTL) {
    return mappingsCache.data;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("hubspot_field_mappings")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("[Mappings] Error fetching mappings:", error);
    return [];
  }

  console.log("[Mappings] Fetched", data?.length || 0, "active mappings from database");

  mappingsCache = {
    data: data || [],
    timestamp: Date.now(),
  };

  return data || [];
}

/**
 * Clears the mappings cache (call after updating mappings)
 */
export function clearMappingsCache() {
  mappingsCache = null;
}

/**
 * Gets a value from the source data based on the field path
 */
function getSourceValue(
  lead: LeadData,
  config: ConfiguratorState,
  mapping: HubSpotFieldMappingRow,
  derived?: DerivedData
): unknown {
  // Handle static values - the value is stored in transform_config
  if (mapping.source_category === "static") {
    const staticConfig = mapping.transform_config as { value?: string } | null;
    return staticConfig?.value || mapping.source_field; // source_field can store the static value as fallback
  }

  // Handle derived fields (computed at runtime)
  if (mapping.source_category === "derived" && derived) {
    return derived[mapping.source_field as keyof DerivedData];
  }

  const source = mapping.source_category === "lead" ? lead : config;
  return source[mapping.source_field as keyof typeof source];
}

/**
 * Transforms a source value based on the transform type
 */
function transformValue(
  value: unknown,
  mapping: HubSpotFieldMappingRow,
  lead?: LeadData,
  config?: ConfiguratorState,
  derived?: DerivedData
): string | number | boolean | null {
  if (value === undefined || value === null) {
    return null;
  }

  switch (mapping.transform_type) {
    case "direct":
      // Direct mapping - convert to string if not already
      if (typeof value === "boolean") {
        return value ? "true" : "false";
      }
      // Normalize common yes/no values to match HubSpot's expected format
      const strValue = String(value);
      if (strValue.toLowerCase() === "yes") return "Yes";
      if (strValue.toLowerCase() === "no") return "No";
      return strValue;

    case "boolean":
      // Convert boolean to specified format
      const boolConfig = mapping.transform_config as {
        trueValue?: string;
        falseValue?: string;
      } | null;
      if (typeof value === "boolean") {
        return value
          ? boolConfig?.trueValue || "Yes"
          : boolConfig?.falseValue || "No";
      }
      return Boolean(value)
        ? boolConfig?.trueValue || "Yes"
        : boolConfig?.falseValue || "No";

    case "array_join":
      // Join array values with a separator
      if (Array.isArray(value)) {
        const separator = (mapping.transform_config as { separator?: string })?.separator || ", ";
        return value.join(separator);
      }
      return String(value);

    case "custom":
      // Custom transformation based on config
      const customConfig = mapping.transform_config as {
        type?: string;
        mapping?: Record<string, string>;
        fields?: Array<{ category: "lead" | "config" | "derived"; field: string }>;
        separator?: string;
      } | null;

      // Handle template type (combine multiple fields)
      if (customConfig?.type === "template" && customConfig.fields && lead && config) {
        const values = customConfig.fields
          .map((f) => {
            let fieldValue: unknown;
            if (f.category === "derived" && derived) {
              fieldValue = derived[f.field as keyof DerivedData];
            } else {
              const source = f.category === "lead" ? lead : config;
              fieldValue = source[f.field as keyof typeof source];
            }
            return fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : "";
          })
          .filter((v) => v !== "");

        const separator = customConfig.separator || " ";
        return values.join(separator);
      }

      // Handle value mapping
      if (customConfig?.mapping && typeof value === "string") {
        return customConfig.mapping[value] || String(value);
      }
      return String(value);

    default:
      return String(value);
  }
}

/**
 * Applies field mappings to generate HubSpot properties
 */
export async function applyMappings(
  lead: LeadData,
  config: ConfiguratorState,
  objectType: HubSpotObject,
  derived?: DerivedData
): Promise<Record<string, string | number | boolean>> {
  const mappings = await getActiveMappings();
  const filteredMappings = mappings.filter(
    (m) => m.hubspot_object === objectType
  );

  const properties: Record<string, string | number | boolean> = {};

  for (const mapping of filteredMappings) {
    const sourceValue = getSourceValue(lead, config, mapping, derived);
    const transformedValue = transformValue(sourceValue, mapping, lead, config, derived);

    if (transformedValue !== null) {
      properties[mapping.hubspot_property] = transformedValue;
    }
  }

  return properties;
}

/**
 * Checks if there are any active mappings for a given object type
 */
export async function hasMappings(objectType: HubSpotObject): Promise<boolean> {
  const mappings = await getActiveMappings();
  return mappings.some((m) => m.hubspot_object === objectType);
}

/**
 * Gets the default (hardcoded) properties for backward compatibility
 * Used as fallback when no dynamic mappings exist
 */
export function getDefaultContactProperties(
  lead: LeadData,
  reference: string,
  country: string
): Record<string, string> {
  const properties: Record<string, string> = {
    email: lead.email,
    firstname: lead.firstName,
    lastname: lead.lastName,
    company: lead.company,
    country: country,
    hs_lead_status: "NEW",
  };

  if (lead.phone) properties.phone = lead.phone;
  if (lead.region) properties.state = lead.region;
  if (lead.isFarmer) properties.is_farmer = lead.isFarmer;
  if (lead.farmingType) properties.farming_type = lead.farmingType;
  if (lead.farmSize) properties.farm_size = lead.farmSize;
  if (lead.hectaresForFarmDroid) properties.hectares_for_farmdroid = lead.hectaresForFarmDroid;
  if (lead.crops) properties.crops = lead.crops;
  if (lead.otherCrops) properties.other_crops = lead.otherCrops;
  if (reference) properties.configurator_reference = reference;
  if (lead.marketingConsent) {
    properties.hs_legal_basis = "Freely given consent from contact";
  }

  return properties;
}

export function getDefaultCompanyProperties(
  companyName: string,
  country: string
): Record<string, string> {
  return {
    name: companyName,
    country: country,
    industry: "AGRICULTURE",
  };
}
