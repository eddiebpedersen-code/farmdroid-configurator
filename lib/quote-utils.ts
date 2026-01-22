import pako from "pako";
import { QuoteData, QuoteLineItem, QuoteCustomizations, QUOTE_DATA_VERSION } from "./quote-types";
import { ConfiguratorState, PriceBreakdown, formatPrice, Currency, calculatePassiveRows } from "./configurator-data";

/**
 * Encode quote data to a URL-safe string
 */
export function encodeQuoteData(data: QuoteData): string {
  try {
    const json = JSON.stringify(data);
    const compressed = pako.deflate(json);

    // Convert to base64 and make URL-safe
    const base64 = btoa(String.fromCharCode(...compressed))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return base64;
  } catch (error) {
    console.error("Failed to encode quote data:", error);
    throw new Error("Failed to encode quote data");
  }
}

/**
 * Decode quote data from URL-safe string
 */
export function decodeQuoteData(encoded: string): QuoteData | null {
  try {
    // Convert from URL-safe base64
    const base64 = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    // Add padding if needed
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const json = pako.inflate(bytes, { to: "string" });
    const data = JSON.parse(json) as QuoteData;

    // Validate version
    if (data.version > QUOTE_DATA_VERSION) {
      console.warn("Quote data version is newer than supported");
    }

    return data;
  } catch (error) {
    console.error("Failed to decode quote data:", error);
    return null;
  }
}

/**
 * Generate a shareable quote URL
 */
export function generateQuoteUrl(data: QuoteData, baseUrl: string): string {
  const encoded = encodeQuoteData(data);
  const url = new URL(`/${data.locale}/quote`, baseUrl);
  url.searchParams.set("d", encoded);
  return url.toString();
}

/**
 * Generate a unique quote reference number
 */
export function generateQuoteReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FD-${year}-${random}`;
}

/**
 * Generate line items from config and price breakdown
 */
export function generateQuoteLineItems(
  config: ConfiguratorState,
  priceBreakdown: PriceBreakdown,
  customizations: QuoteCustomizations,
  t: (key: string, params?: Record<string, string | number | Date>) => string
): QuoteLineItem[] {
  const items: QuoteLineItem[] = [];

  // Base Robot
  if (priceBreakdown.baseRobot > 0) {
    const id = "baseRobot";
    items.push({
      id,
      label: t("lineItems.baseRobot"),
      price: customizations.priceOverrides[id] ?? priceBreakdown.baseRobot,
    });
  }

  // Power Source
  if (priceBreakdown.powerSource > 0) {
    const id = "powerSource";
    items.push({
      id,
      label: t(`lineItems.powerSource.${config.powerSource}`),
      price: customizations.priceOverrides[id] ?? priceBreakdown.powerSource,
    });
  }

  // Front Wheel
  if (priceBreakdown.frontWheel > 0) {
    const id = "frontWheel";
    items.push({
      id,
      label: t(`lineItems.frontWheel.${config.frontWheel}`),
      price: customizations.priceOverrides[id] ?? priceBreakdown.frontWheel,
    });
  }

  // Active Rows
  if (priceBreakdown.activeRows > 0) {
    const id = "activeRows";
    items.push({
      id,
      label: t("lineItems.activeRows", { count: config.activeRows, size: config.seedSize }),
      quantity: config.activeRows,
      price: customizations.priceOverrides[id] ?? priceBreakdown.activeRows,
    });
  }

  // Passive Rows (included)
  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);
  if (passiveRows > 0) {
    items.push({
      id: "passiveRows",
      label: t("lineItems.passiveRows", { count: passiveRows }),
      price: 0,
      isIncluded: true,
    });
  }

  // Spray System
  if (priceBreakdown.spraySystem > 0) {
    const id = "spraySystem";
    items.push({
      id,
      label: t("lineItems.spraySystem"),
      price: customizations.priceOverrides[id] ?? priceBreakdown.spraySystem,
    });
  }

  // Accessories
  if (priceBreakdown.accessories > 0) {
    const id = "accessories";
    items.push({
      id,
      label: t("lineItems.accessories"),
      price: customizations.priceOverrides[id] ?? priceBreakdown.accessories,
    });
  }

  // Warranty Extension
  if (priceBreakdown.warrantyExtension > 0) {
    const id = "warrantyExtension";
    items.push({
      id,
      label: t("lineItems.warrantyExtension"),
      price: customizations.priceOverrides[id] ?? priceBreakdown.warrantyExtension,
    });
  }

  // Add custom line items (including discounts)
  for (const customItem of customizations.customLineItems) {
    items.push({
      id: customItem.id,
      label: customItem.description,
      price: customItem.price,
      isCustom: true,
      isDiscount: customItem.isDiscount,
    });
  }

  return items;
}

/**
 * Calculate total from line items
 */
export function calculateQuoteTotal(items: QuoteLineItem[]): number {
  return items.reduce((sum, item) => sum + (item.isIncluded ? 0 : item.price), 0);
}

/**
 * Generate PDF from an HTML element
 */
export async function generateQuotePdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher resolution
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // Create PDF (A4 dimensions in mm)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // If content is taller than one page, scale to fit
  if (imgHeight > pdfHeight) {
    const scale = pdfHeight / imgHeight;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, pdfHeight);
  } else {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  }

  pdf.save(filename);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }
}

/**
 * Format date for display
 */
export function formatQuoteDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "en" ? "en-GB" : locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
