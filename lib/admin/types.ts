/**
 * Admin system types
 */

// User roles
export type AdminRole = "super_admin" | "admin";

// Admin user row from database
export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserInsert {
  id?: string;
  email: string;
  name?: string | null;
  role: AdminRole;
  avatar_url?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserUpdate {
  id?: string;
  email?: string;
  name?: string | null;
  role?: AdminRole;
  avatar_url?: string | null;
  last_login_at?: string | null;
  updated_at?: string;
}

// HubSpot field mapping types
export type HubSpotObject = "contact" | "company" | "deal";
export type SourceCategory = "lead" | "config" | "derived" | "static";
export type TransformType = "direct" | "boolean" | "array_join" | "custom";

export interface HubSpotFieldMappingRow {
  id: string;
  source_field: string;
  source_category: SourceCategory;
  hubspot_object: HubSpotObject;
  hubspot_property: string;
  hubspot_property_label: string | null;
  transform_type: TransformType;
  transform_config: Record<string, unknown> | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HubSpotFieldMappingInsert {
  id?: string;
  source_field: string;
  source_category: SourceCategory;
  hubspot_object: HubSpotObject;
  hubspot_property: string;
  hubspot_property_label?: string | null;
  transform_type?: TransformType;
  transform_config?: Record<string, unknown> | null;
  is_active?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HubSpotFieldMappingUpdate {
  id?: string;
  source_field?: string;
  source_category?: SourceCategory;
  hubspot_object?: HubSpotObject;
  hubspot_property?: string;
  hubspot_property_label?: string | null;
  transform_type?: TransformType;
  transform_config?: Record<string, unknown> | null;
  is_active?: boolean;
  updated_at?: string;
}

// HubSpot property from API
export interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

// Configurator fields available for mapping
export interface ConfiguratorField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "enum";
  values?: string[];
}

export const CONFIGURATOR_FIELDS: Record<Exclude<SourceCategory, "static">, ConfiguratorField[]> = {
  lead: [
    { key: "email", label: "Email", type: "string" },
    { key: "firstName", label: "First Name", type: "string" },
    { key: "lastName", label: "Last Name", type: "string" },
    { key: "phone", label: "Phone", type: "string" },
    { key: "company", label: "Company", type: "string" },
    { key: "country", label: "Country", type: "string" },
    { key: "region", label: "Region", type: "string" },
    { key: "isFarmer", label: "Are you a farmer?", type: "enum", values: ["yes", "no"] },
    { key: "farmingType", label: "Organic or Conventional?", type: "enum", values: ["conventional", "organic", "both"] },
    { key: "farmSize", label: "Farm Size", type: "string" },
    { key: "hectaresForFarmDroid", label: "Hectares for FarmDroid", type: "string" },
    { key: "crops", label: "Crops", type: "string" },
    { key: "otherCrops", label: "Other Crops", type: "string" },
    { key: "contactByPartner", label: "Contact by Partner", type: "boolean" },
    { key: "marketingConsent", label: "Marketing Consent", type: "boolean" },
  ],
  config: [
    { key: "seedSize", label: "Seed Size", type: "enum", values: ["6mm", "14mm"] },
    { key: "activeRows", label: "Active Rows", type: "number" },
    { key: "rowDistance", label: "Row Distance (mm)", type: "number" },
    { key: "powerSource", label: "Power Source", type: "enum", values: ["solar", "hybrid"] },
    { key: "frontWheel", label: "Front Wheel", type: "enum", values: ["PFW", "AFW", "DFW"] },
    { key: "wheelSpacing", label: "Wheel Spacing (mm)", type: "number" },
    { key: "spraySystem", label: "Spray System", type: "boolean" },
    { key: "weedingTool", label: "Weeding Tool", type: "enum", values: ["none", "combiTool", "weedCuttingDisc"] },
    { key: "servicePlan", label: "Service Plan", type: "enum", values: ["none", "standard", "premium"] },
    { key: "warrantyExtension", label: "Warranty Extension", type: "boolean" },
    { key: "starterKit", label: "Starter Kit", type: "boolean" },
    { key: "roadTransport", label: "Road Transport Platform", type: "boolean" },
    { key: "powerBank", label: "Power Bank", type: "boolean" },
    { key: "additionalWeightKit", label: "Additional Weight Kit", type: "boolean" },
    { key: "toolbox", label: "Toolbox", type: "boolean" },
    { key: "fieldBracket", label: "Field Bracket", type: "boolean" },
    { key: "fstFieldSetupTool", label: "FST Field Setup Tool", type: "boolean" },
    { key: "baseStationV3", label: "Base Station V3", type: "boolean" },
    { key: "essentialCarePackage", label: "Essential Care Package", type: "boolean" },
    { key: "essentialCareSpray", label: "Essential Care Spray", type: "boolean" },
  ],
  derived: [
    { key: "reference", label: "Configuration Reference", type: "string" },
    { key: "configUrl", label: "Configuration URL", type: "string" },
    { key: "configSummary", label: "Configuration Summary", type: "string" },
    { key: "totalPrice", label: "Total Price", type: "number" },
    { key: "currency", label: "Currency", type: "string" },
  ],
};
