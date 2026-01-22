"use client";

import { useTranslations } from "next-intl";
import { QuoteLineItem } from "@/lib/quote-types";
import { formatPrice, Currency } from "@/lib/configurator-data";

interface QuotePricingTableProps {
  lineItems: QuoteLineItem[];
  total: number;
  currency: Currency;
}

export function QuotePricingTable({ lineItems, total, currency }: QuotePricingTableProps) {
  const t = useTranslations("quote");

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">
        {t("priceBreakdown")}
      </h2>

      <div className="border border-stone-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 bg-stone-50 border-b border-stone-200">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            {t("description")}
          </div>
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide text-right">
            {t("price")}
          </div>
        </div>

        {/* Line items */}
        <div className="divide-y divide-stone-100">
          {lineItems.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-[1fr_auto] gap-4 px-4 py-3 ${
                item.isCustom ? "bg-emerald-50/50" : ""
              }`}
            >
              <div>
                <div className="text-sm font-medium text-stone-900">
                  {item.label}
                  {item.isCustom && (
                    <span className="ml-2 text-xs text-emerald-600 font-normal">
                      {t("custom")}
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-stone-500 mt-0.5">
                    {item.description}
                  </div>
                )}
                {item.quantity && item.quantity > 1 && (
                  <div className="text-xs text-stone-500 mt-0.5">
                    {item.quantity} x {formatPrice(item.price / item.quantity, currency)}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-stone-900 text-right">
                {item.isIncluded ? (
                  <span className="text-emerald-600">{t("included")}</span>
                ) : (
                  formatPrice(item.price, currency)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 bg-stone-900 text-white">
          <div className="text-base font-semibold">{t("total")}</div>
          <div className="text-lg font-bold text-right">
            {formatPrice(total, currency)}
          </div>
        </div>
      </div>

      {/* VAT note and disclaimer */}
      <div className="mt-3 text-right space-y-1">
        <p className="text-xs text-stone-500">
          {t("vatNote")}
        </p>
        <p className="text-xs text-stone-400">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}
