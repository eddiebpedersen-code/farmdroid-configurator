import type { ConfiguratorState } from "./configurator-data";
import type {
  AdminUserRow,
  AdminUserInsert,
  AdminUserUpdate,
  HubSpotFieldMappingRow,
  HubSpotFieldMappingInsert,
  HubSpotFieldMappingUpdate,
} from "./admin/types";

/**
 * Database types for Supabase
 */
export interface Database {
  public: {
    Tables: {
      configurations: {
        Row: ConfigurationRow;
        Insert: ConfigurationInsert;
        Update: ConfigurationUpdate;
      };
      configuration_views: {
        Row: ConfigurationViewRow;
        Insert: ConfigurationViewInsert;
        Update: ConfigurationViewUpdate;
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: AdminUserInsert;
        Update: AdminUserUpdate;
      };
      hubspot_field_mappings: {
        Row: HubSpotFieldMappingRow;
        Insert: HubSpotFieldMappingInsert;
        Update: HubSpotFieldMappingUpdate;
      };
      email_verification_codes: {
        Row: EmailVerificationCodeRow;
        Insert: EmailVerificationCodeInsert;
        Update: EmailVerificationCodeUpdate;
      };
    };
  };
}

/**
 * Configuration row as stored in database
 */
export interface ConfigurationRow {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string;
  country: string;
  farm_size: string | null;
  hectares_for_farmdroid: string | null;
  crops: string | null;
  contact_by_partner: boolean;
  marketing_consent: boolean;
  config: ConfiguratorState;
  locale: string;
  total_price: number;
  currency: string;
  hubspot_contact_id: string | null;
  hubspot_company_id: string | null;
  hubspot_deal_id: string | null;
  status: "submitted" | "contacted" | "quoted" | "converted";
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Configuration insert (for creating new rows)
 */
export interface ConfigurationInsert {
  id?: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  company: string;
  country: string;
  farm_size?: string | null;
  hectares_for_farmdroid?: string | null;
  crops?: string | null;
  contact_by_partner?: boolean;
  marketing_consent?: boolean;
  config: ConfiguratorState;
  locale: string;
  total_price: number;
  currency: string;
  hubspot_contact_id?: string | null;
  hubspot_company_id?: string | null;
  hubspot_deal_id?: string | null;
  status?: "submitted" | "contacted" | "quoted" | "converted";
  view_count?: number;
  last_viewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Configuration update (for updating existing rows)
 */
export interface ConfigurationUpdate {
  id?: string;
  reference?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
  company?: string;
  country?: string;
  farm_size?: string | null;
  hectares_for_farmdroid?: string | null;
  crops?: string | null;
  contact_by_partner?: boolean;
  marketing_consent?: boolean;
  config?: ConfiguratorState;
  locale?: string;
  total_price?: number;
  currency?: string;
  hubspot_contact_id?: string | null;
  hubspot_company_id?: string | null;
  hubspot_deal_id?: string | null;
  status?: "submitted" | "contacted" | "quoted" | "converted";
  view_count?: number;
  last_viewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Configuration view row (analytics)
 */
export interface ConfigurationViewRow {
  id: string;
  configuration_id: string;
  viewed_at: string;
  viewer_type: "farmer" | "distributor" | "internal" | null;
  user_agent: string | null;
  ip_hash: string | null;
}

/**
 * Configuration view insert
 */
export interface ConfigurationViewInsert {
  id?: string;
  configuration_id: string;
  viewed_at?: string;
  viewer_type?: "farmer" | "distributor" | "internal" | null;
  user_agent?: string | null;
  ip_hash?: string | null;
}

/**
 * Configuration view update
 */
export interface ConfigurationViewUpdate {
  id?: string;
  configuration_id?: string;
  viewed_at?: string;
  viewer_type?: "farmer" | "distributor" | "internal" | null;
  user_agent?: string | null;
  ip_hash?: string | null;
}

/**
 * Email verification code row
 */
export type EmailVerificationPurpose = "email_lookup" | "my_configs";

export interface EmailVerificationCodeRow {
  id: string;
  email: string;
  code: string;
  purpose: EmailVerificationPurpose;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  verified_at: string | null;
  ip_hash: string | null;
  created_at: string;
}

/**
 * Email verification code insert
 */
export interface EmailVerificationCodeInsert {
  id?: string;
  email: string;
  code: string;
  purpose: EmailVerificationPurpose;
  attempts?: number;
  max_attempts?: number;
  expires_at: string;
  verified_at?: string | null;
  ip_hash?: string | null;
  created_at?: string;
}

/**
 * Email verification code update
 */
export interface EmailVerificationCodeUpdate {
  id?: string;
  email?: string;
  code?: string;
  purpose?: EmailVerificationPurpose;
  attempts?: number;
  max_attempts?: number;
  expires_at?: string;
  verified_at?: string | null;
  ip_hash?: string | null;
  created_at?: string;
}
