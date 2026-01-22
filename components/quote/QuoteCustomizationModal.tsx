"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Download, Plus, Trash2, Link as LinkIcon, ChevronUp, ChevronDown, Percent } from "lucide-react";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  calculatePassiveRows,
} from "@/lib/configurator-data";
import {
  QuoteData,
  QuoteCustomizations,
  CustomLineItem,
  DEFAULT_QUOTE_CUSTOMIZATIONS,
  QUOTE_DATA_VERSION,
} from "@/lib/quote-types";
import {
  generateQuoteUrl,
  generateQuotePdf,
  copyToClipboard,
  generateQuoteReference,
  formatQuoteDate,
} from "@/lib/quote-utils";
import { useToastActions } from "@/components/ui/toast";

interface QuoteCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfiguratorState;
  priceBreakdown: PriceBreakdown;
  locale: string;
}

export function QuoteCustomizationModal({
  isOpen,
  onClose,
  config,
  priceBreakdown,
  locale,
}: QuoteCustomizationModalProps) {
  const t = useTranslations("quote");
  const toast = useToastActions();

  const [customizations, setCustomizations] = useState<QuoteCustomizations>({
    ...DEFAULT_QUOTE_CUSTOMIZATIONS,
    createdAt: new Date().toISOString(),
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [quoteRef] = useState(() => generateQuoteReference());
  const [lineItemOrder, setLineItemOrder] = useState<string[]>([]);

  const quotePreviewRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);
  const currencySymbol = config.currency === "EUR" ? "€" : "DKK ";

  // Line item type
  type LineItem = {
    id: string;
    label: string;
    price: number;
    qty: number;
    isIncluded?: boolean;
    isCustom?: boolean;
    discount?: number;
  };

  // Build line items
  const getBaseLineItems = useCallback((): LineItem[] => {
    const items: LineItem[] = [];

    if (priceBreakdown.baseRobot > 0) {
      items.push({
        id: "baseRobot",
        label: "FD20 Base Robot",
        qty: 1,
        price: customizations.priceOverrides["baseRobot"] ?? priceBreakdown.baseRobot,
        discount: customizations.discounts?.["baseRobot"],
      });
    }

    if (priceBreakdown.powerSource > 0) {
      items.push({
        id: "powerSource",
        label: config.powerSource === "hybrid" ? "Hybrid Power System" : "Solar Power System",
        qty: 1,
        price: customizations.priceOverrides["powerSource"] ?? priceBreakdown.powerSource,
        discount: customizations.discounts?.["powerSource"],
      });
    }

    if (priceBreakdown.frontWheel > 0) {
      items.push({
        id: "frontWheel",
        label:
          config.frontWheel === "PFW"
            ? "Passive Front Wheel"
            : config.frontWheel === "AFW"
            ? "Active Front Wheel"
            : "Dual Front Wheel",
        qty: 1,
        price: customizations.priceOverrides["frontWheel"] ?? priceBreakdown.frontWheel,
        discount: customizations.discounts?.["frontWheel"],
      });
    }

    if (priceBreakdown.activeRows > 0) {
      items.push({
        id: "activeRows",
        label: `Active Row Unit (${config.seedSize})`,
        qty: config.activeRows,
        price: customizations.priceOverrides["activeRows"] ?? priceBreakdown.activeRows,
        discount: customizations.discounts?.["activeRows"],
      });
    }

    if (passiveRows > 0) {
      items.push({
        id: "passiveRows",
        label: "Passive Row Unit",
        qty: passiveRows,
        price: 0,
        isIncluded: true,
      });
    }

    if (priceBreakdown.spraySystem > 0) {
      items.push({
        id: "spraySystem",
        label: "+SPRAY System",
        qty: 1,
        price: customizations.priceOverrides["spraySystem"] ?? priceBreakdown.spraySystem,
        discount: customizations.discounts?.["spraySystem"],
      });
    }

    if (priceBreakdown.accessories > 0) {
      items.push({
        id: "accessories",
        label: "Accessories Package",
        qty: 1,
        price: customizations.priceOverrides["accessories"] ?? priceBreakdown.accessories,
        discount: customizations.discounts?.["accessories"],
      });
    }

    if (priceBreakdown.warrantyExtension > 0) {
      items.push({
        id: "warrantyExtension",
        label: "Extended Warranty (+2 Years)",
        qty: 1,
        price: customizations.priceOverrides["warrantyExtension"] ?? priceBreakdown.warrantyExtension,
        discount: customizations.discounts?.["warrantyExtension"],
      });
    }

    // Custom items
    for (const item of customizations.customLineItems) {
      items.push({
        id: item.id,
        label: item.description,
        qty: 1,
        price: item.price,
        isCustom: true,
        discount: customizations.discounts?.[item.id],
      });
    }

    return items;
  }, [config, priceBreakdown, customizations, passiveRows]);

  // Get ordered line items
  const lineItems = (() => {
    const items = getBaseLineItems();
    if (lineItemOrder.length === 0) return items;

    const orderedItems: LineItem[] = [];
    for (const id of lineItemOrder) {
      const item = items.find(i => i.id === id);
      if (item) orderedItems.push(item);
    }
    for (const item of items) {
      if (!lineItemOrder.includes(item.id)) orderedItems.push(item);
    }
    return orderedItems;
  })();

  // Initialize order
  useEffect(() => {
    if (lineItemOrder.length === 0 && lineItems.length > 0) {
      setLineItemOrder(lineItems.map(i => i.id));
    }
  }, [lineItems, lineItemOrder.length]);

  // Calculate totals
  const getItemTotal = (item: LineItem) => {
    if (item.isIncluded) return 0;
    const discount = item.discount || 0;
    return item.price * (1 - discount / 100);
  };

  const subtotal = lineItems
    .filter((item) => !item.isIncluded)
    .reduce((sum, item) => sum + item.price, 0);
  const totalDiscount = lineItems
    .filter((item) => !item.isIncluded && item.discount)
    .reduce((sum, item) => sum + (item.price * (item.discount || 0) / 100), 0);
  const total = subtotal - totalDiscount;

  const updateCustomizations = useCallback((updates: Partial<QuoteCustomizations>) => {
    setCustomizations((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePriceOverride = (id: string, price: number) => {
    updateCustomizations({
      priceOverrides: { ...customizations.priceOverrides, [id]: price },
    });
  };

  const updateDiscount = (id: string, discount: number | null) => {
    const newDiscounts = { ...customizations.discounts };
    if (discount === null || discount === 0) {
      delete newDiscounts[id];
    } else {
      newDiscounts[id] = discount;
    }
    updateCustomizations({ discounts: newDiscounts });
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const currentOrder = lineItemOrder.length > 0 ? [...lineItemOrder] : lineItems.map(i => i.id);
    const idx = currentOrder.indexOf(id);
    if (idx === -1) return;

    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;

    [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
    setLineItemOrder(currentOrder);
  };

  const addCustomItem = () => {
    const newItem: CustomLineItem = {
      id: `custom-${Date.now()}`,
      description: "Additional Service",
      price: 500,
    };
    const newOrder = [...(lineItemOrder.length > 0 ? lineItemOrder : lineItems.map(i => i.id)), newItem.id];
    setLineItemOrder(newOrder);
    updateCustomizations({
      customLineItems: [...customizations.customLineItems, newItem],
    });
  };

  const updateCustomItem = (id: string, updates: Partial<CustomLineItem>) => {
    updateCustomizations({
      customLineItems: customizations.customLineItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const removeCustomItem = (id: string) => {
    setLineItemOrder(prev => prev.filter(i => i !== id));
    updateCustomizations({
      customLineItems: customizations.customLineItems.filter((item) => item.id !== id),
    });
  };

  const handleCopyLink = async () => {
    const quoteData: QuoteData = {
      version: QUOTE_DATA_VERSION,
      config,
      customizations,
      locale,
    };
    const url = generateQuoteUrl(quoteData, window.location.origin);
    const success = await copyToClipboard(url);
    if (success) {
      toast.success(t("linkCopied"));
    } else {
      toast.error(t("linkCopyFailed"));
    }
  };

  const handleDownloadPdf = async () => {
    if (!quotePreviewRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateQuotePdf(quotePreviewRef.current, `FarmDroid-Quote-${quoteRef}.pdf`);
      toast.success(t("pdfDownloaded"));
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t("pdfFailed"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const quoteDate = formatQuoteDate(customizations.createdAt, locale);

  // Use same pattern as SeedInfoModal - no createPortal
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal container - clicking outside paper closes modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8"
          >
            {/* Quote Paper - A4 portrait aspect ratio (taller than wide) */}
            <div
              ref={quotePreviewRef}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl min-h-[1100px] my-8 p-6"
            >
              {/* Close button - positioned outside green header area */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-700 hover:bg-stone-200 transition-colors z-10 print:hidden"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Inner content with rounded corners */}
              <div className="bg-white rounded-xl">
                {/* Header with light green background */}
                <div className="bg-emerald-50 rounded-t-xl px-8 pt-10 pb-8">
                  <div className="flex flex-wrap justify-between items-center gap-6">
                    {/* Title */}
                    <h1 className="text-4xl font-light italic text-emerald-600 tracking-tight">
                      Quotation
                    </h1>

                    {/* Company info */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-stone-400 mb-0.5">Quotation by</div>
                        <div className="font-semibold text-stone-900 text-sm">FarmDroid ApS</div>
                        <div className="text-stone-500 text-xs">Aggersundvej 50</div>
                        <div className="text-stone-500 text-xs">9670 Løgstør, Denmark</div>
                      </div>
                      <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-base">FD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration & Quote Details */}
                <div className="px-8 py-6">
                  <div className="flex flex-wrap justify-between items-start gap-8">
                    {/* Configuration */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                        <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider">Configuration</span>
                      </div>
                      <div className="font-semibold text-stone-900 text-lg">FD20 Robot</div>
                      <div className="text-sm text-stone-500 mt-1.5 space-y-0.5">
                        <div>{config.activeRows} active rows · {config.rowDistance / 10}cm spacing</div>
                        <div>{config.seedSize} seed system · {config.powerSource} power</div>
                      </div>
                    </div>

                    {/* Quote Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                        <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider">Quotation Details</span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between gap-6">
                          <span className="text-stone-500">Quotation #</span>
                          <span className="text-stone-900 font-medium">{quoteRef}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-stone-500">Quotation Date</span>
                          <span className="text-stone-900">{quoteDate}</span>
                        </div>
                        <div className="flex justify-between gap-6 items-center">
                          <span className="text-stone-500">Valid Until</span>
                          <input
                            type="date"
                            value={customizations.validUntil?.split("T")[0] || ""}
                            onChange={(e) =>
                              updateCustomizations({
                                validUntil: e.target.value ? new Date(e.target.value).toISOString() : null,
                              })
                            }
                            className="text-stone-900 bg-transparent border-b border-dashed border-stone-300 focus:border-emerald-500 outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Line Items Table */}
              <div className="px-8 pb-6">
                <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-emerald-500 text-white">
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                          Item Description
                        </th>
                        <th className="text-center px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wide w-14">
                          Qty
                        </th>
                        <th className="text-right px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide w-28">
                          Unit Price
                        </th>
                        <th className="text-center px-1 py-2.5 text-[11px] font-semibold uppercase tracking-wide w-14">
                        </th>
                        <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide w-28">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => {
                        const itemTotal = getItemTotal(item);
                        const hasDiscount = (item.discount || 0) > 0;

                        return (
                          <tr
                            key={item.id}
                            className={`group border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50 transition-colors`}
                          >
                            {/* Item description */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {/* Reorder buttons */}
                                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 print:hidden">
                                  <button
                                    onClick={() => moveItem(item.id, "up")}
                                    disabled={idx === 0}
                                    className="p-0.5 text-stone-300 hover:text-stone-600 disabled:opacity-30"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => moveItem(item.id, "down")}
                                    disabled={idx === lineItems.length - 1}
                                    className="p-0.5 text-stone-300 hover:text-stone-600 disabled:opacity-30"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-stone-400 text-sm flex-shrink-0">{idx + 1}.</span>

                                {item.isCustom ? (
                                  <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => updateCustomItem(item.id, { description: e.target.value })}
                                    className="flex-1 min-w-0 text-sm text-stone-700 bg-transparent border-b border-dashed border-transparent hover:border-stone-300 focus:border-emerald-500 outline-none"
                                    placeholder="Item description"
                                  />
                                ) : (
                                  <span className="text-sm text-stone-700 truncate">{item.label}</span>
                                )}

                                {/* Delete custom item */}
                                {item.isCustom && (
                                  <button
                                    onClick={() => removeCustomItem(item.id)}
                                    className="p-1 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 print:hidden"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Qty */}
                            <td className="px-2 py-3 text-sm text-stone-600 text-center">
                              {item.qty}
                            </td>

                            {/* Unit Price (price per unit) */}
                            <td className="px-3 py-3 text-sm text-right tabular-nums">
                              {item.isIncluded ? (
                                <span className="text-stone-400">—</span>
                              ) : (
                                <span className="text-stone-600">
                                  {currencySymbol} {(item.price / item.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>

                            {/* Discount - between Unit Price and Amount */}
                            <td className="px-1 py-3 text-sm text-center">
                              {item.isIncluded ? (
                                <span className="text-stone-300"></span>
                              ) : hasDiscount ? (
                                <div className="flex items-center justify-center gap-0.5">
                                  <span
                                    className="text-sm text-red-500 cursor-text"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const val = Math.min(100, Math.max(0, parseInt(e.currentTarget.textContent || "0") || 0));
                                      updateDiscount(item.id, val === 0 ? null : val);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                      }
                                    }}
                                  >
                                    -{item.discount}%
                                  </span>
                                  <button
                                    onClick={() => updateDiscount(item.id, null)}
                                    className="p-0.5 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => updateDiscount(item.id, 10)}
                                  className="p-1 text-stone-300 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                  title="Add discount"
                                >
                                  <Percent className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3 text-sm text-right tabular-nums">
                              {item.isIncluded ? (
                                <span className="text-emerald-600 font-medium text-xs uppercase tracking-wide">Included</span>
                              ) : (
                                <span className={`font-semibold ${hasDiscount ? "text-emerald-600" : "text-stone-900"}`}>
                                  {currencySymbol} {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Add item button */}
                  <div className="border-t border-dashed border-stone-100 px-4 py-2 print:hidden">
                    <button
                      onClick={addCustomItem}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 transition-colors ml-6"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add line item
                    </button>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="px-8 pb-6">
                <div className="flex justify-end">
                  <div className="w-64">
                    {/* Separator line */}
                    <div className="border-t border-stone-200 mb-3"></div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Sub Total</span>
                        <span className="text-stone-900 font-medium tabular-nums">{currencySymbol} {subtotal.toLocaleString()}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Discount</span>
                          <span className="text-red-500 font-medium tabular-nums">- {currencySymbol} {totalDiscount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-stone-200">
                      <span className="text-base font-semibold text-stone-900">Total</span>
                      <span className="text-2xl font-bold text-emerald-500 tabular-nums">
                        {currencySymbol} {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Notes Footer */}
              <div className="px-8 pt-6 pb-6 bg-white border-t border-stone-100">
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <h3 className="font-semibold text-stone-800 text-xs uppercase tracking-wide mb-3">Terms and Conditions</h3>
                    <div className="text-sm text-stone-600 space-y-1.5">
                      <div className="flex gap-2">
                        <span className="text-stone-400">•</span>
                        <span>Delivery: 4-8 weeks from order confirmation</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-stone-400">•</span>
                        <span>Payment: According to agreed terms</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-stone-400">•</span>
                        <span>Warranty: 1 year included, extendable</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 text-xs uppercase tracking-wide mb-3">Additional Notes</h3>
                    <textarea
                      value={customizations.notes}
                      onChange={(e) => updateCustomizations({ notes: e.target.value })}
                      placeholder="Add any additional notes here..."
                      rows={3}
                      className="w-full text-sm text-stone-600 bg-stone-50 border-0 rounded-lg p-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder:text-stone-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Footer contact */}
                <div className="mt-6 pt-4 border-t border-stone-100 text-sm text-stone-500 text-center">
                  For any enquiries, email us on{" "}
                  <span className="text-emerald-600 font-medium">sales@farmdroid.dk</span>
                  {" "}or call us on{" "}
                  <span className="text-stone-700 font-medium">+45 70 70 71 72</span>
                </div>
              </div>
              </div>
              {/* End inner content wrapper */}

              {/* Action buttons at bottom */}
              <div className="flex items-center justify-center gap-4 pt-8 print:hidden">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors border border-stone-200"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/25 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingPdf ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
