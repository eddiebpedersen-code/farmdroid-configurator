import { ConfiguratorState, Currency } from "./configurator-data";

/**
 * Custom line item added by distributor
 */
export interface CustomLineItem {
  id: string;
  description: string;
  price: number;
  isDiscount?: boolean; // If true, price should be negative and displayed as discount
}

/**
 * Quote customizations made by the distributor
 */
export interface QuoteCustomizations {
  showPricing: boolean;
  priceOverrides: Record<string, number>; // key: line item id, value: override price
  discounts: Record<string, number>; // key: line item id, value: discount percentage (0-100)
  customLineItems: CustomLineItem[];
  lineItemOrder: string[]; // ordered list of line item ids
  notes: string;
  validUntil: string | null; // ISO date string
  createdAt: string; // ISO date string
}

/**
 * Complete quote data for encoding/sharing
 */
export interface QuoteData {
  version: number;
  config: ConfiguratorState;
  customizations: QuoteCustomizations;
  locale: string;
}

/**
 * Line item for display in quote
 */
export interface QuoteLineItem {
  id: string;
  label: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  price: number;
  isCustom?: boolean;
  isIncluded?: boolean; // For items that are "Included" rather than priced
  isDiscount?: boolean; // For discount items (negative prices)
}

/**
 * Default customizations when creating a new quote
 */
export const DEFAULT_QUOTE_CUSTOMIZATIONS: QuoteCustomizations = {
  showPricing: true,
  priceOverrides: {},
  discounts: {},
  customLineItems: [],
  lineItemOrder: [],
  notes: "",
  validUntil: null,
  createdAt: new Date().toISOString(),
};

/**
 * Current version of the quote data format
 * Increment this when making breaking changes to QuoteData structure
 */
export const QUOTE_DATA_VERSION = 1;
