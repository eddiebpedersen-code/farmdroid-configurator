"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { QuoteData, QuoteLineItem } from "@/lib/quote-types";
import { formatPrice, Currency, calculatePassiveRows, calculatePrice } from "@/lib/configurator-data";
import { generateQuoteLineItems, calculateQuoteTotal, formatQuoteDate, generateQuoteReference } from "@/lib/quote-utils";
import { QuoteHeader } from "./QuoteHeader";
import { QuoteConfigSummary } from "./QuoteConfigSummary";
import { QuotePricingTable } from "./QuotePricingTable";
import { QuoteFooter } from "./QuoteFooter";

interface QuotePageProps {
  quoteData: QuoteData;
  quoteRef?: string;
}

export const QuotePage = forwardRef<HTMLDivElement, QuotePageProps>(
  function QuotePage({ quoteData, quoteRef }, ref) {
    const t = useTranslations("quote");
    const { config, customizations, locale } = quoteData;

    const priceBreakdown = calculatePrice(config, 8); // Step 8 = full pricing

    // Generate line items with translations
    const lineItems = generateQuoteLineItems(
      config,
      priceBreakdown,
      customizations,
      (key, params) => t(key, params)
    );

    const total = calculateQuoteTotal(lineItems);
    const quoteReference = quoteRef || generateQuoteReference();
    const quoteDate = formatQuoteDate(customizations.createdAt, locale);

    return (
      <div
        ref={ref}
        className="bg-white min-h-screen"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {/* Print-optimized container */}
        <div className="max-w-3xl mx-auto px-8 py-12 print:px-0 print:py-0 print:max-w-none">
          {/* Header with logo and quote info */}
          <QuoteHeader
            quoteReference={quoteReference}
            quoteDate={quoteDate}
            validUntil={customizations.validUntil ? formatQuoteDate(customizations.validUntil, locale) : null}
          />

          {/* Configuration Summary */}
          <QuoteConfigSummary config={config} />

          {/* Pricing Table */}
          {customizations.showPricing ? (
            <QuotePricingTable
              lineItems={lineItems}
              total={total}
              currency={config.currency}
            />
          ) : (
            <div className="mt-8 p-6 bg-stone-50 rounded-xl text-center">
              <p className="text-stone-600">{t("pricingOnRequest")}</p>
            </div>
          )}

          {/* Notes */}
          {customizations.notes && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-stone-900 mb-2">
                {t("notesAndTerms")}
              </h3>
              <div className="p-4 bg-stone-50 rounded-lg text-sm text-stone-600 whitespace-pre-wrap">
                {customizations.notes}
              </div>
            </div>
          )}

          {/* Footer */}
          <QuoteFooter />
        </div>
      </div>
    );
  }
);
