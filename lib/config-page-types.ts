import { ConfiguratorState } from "./configurator-data";
import { LeadData } from "@/components/configurator/lead-capture-form";

/**
 * Complete data for the personal configuration page
 */
export interface ConfigPageData {
  version: number;
  config: ConfiguratorState;
  lead: LeadData;
  reference: string;      // Short reference like "FD-K7X9M2"
  createdAt: string;      // ISO date string
  locale: string;
  viewCount?: number;     // Number of times this config has been viewed
  lastViewedAt?: string;  // ISO date string of last view
}

/**
 * Current version of the config page data format
 * Increment this when making breaking changes to ConfigPageData structure
 */
export const CONFIG_PAGE_VERSION = 1;
