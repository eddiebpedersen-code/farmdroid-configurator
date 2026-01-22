"use client";

import { useTranslations } from "next-intl";

interface QuoteHeaderProps {
  quoteReference: string;
  quoteDate: string;
  validUntil: string | null;
}

export function QuoteHeader({ quoteReference, quoteDate, validUntil }: QuoteHeaderProps) {
  const t = useTranslations("quote");

  return (
    <div className="flex items-start justify-between pb-8 border-b border-stone-200">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7 text-white"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">FarmDroid</h1>
          <p className="text-sm text-stone-500">FD20 Configuration Quote</p>
        </div>
      </div>

      {/* Quote Details */}
      <div className="text-right">
        <div className="text-sm text-stone-500">{t("quoteReference")}</div>
        <div className="text-lg font-semibold text-stone-900">{quoteReference}</div>
        <div className="mt-2 text-sm text-stone-500">{t("quoteDate")}</div>
        <div className="text-sm font-medium text-stone-700">{quoteDate}</div>
        {validUntil && (
          <>
            <div className="mt-2 text-sm text-stone-500">{t("validUntil")}</div>
            <div className="text-sm font-medium text-emerald-600">{validUntil}</div>
          </>
        )}
      </div>
    </div>
  );
}
