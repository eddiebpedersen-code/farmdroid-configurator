"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { decodeQuoteData } from "@/lib/quote-utils";
import { QuoteData } from "@/lib/quote-types";
import { QuotePage } from "@/components/quote/QuotePage";
import Link from "next/link";

function QuoteContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("quote");

  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const encoded = searchParams.get("d");

    if (!encoded) {
      setError("noData");
      setIsLoading(false);
      return;
    }

    try {
      const decoded = decodeQuoteData(encoded);
      if (decoded) {
        setQuoteData(decoded);
      } else {
        setError("invalid");
      }
    } catch {
      setError("invalid");
    }

    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">
            {t("errorTitle")}
          </h1>
          <p className="text-stone-600 mb-6">
            {error === "noData" ? t("errorNoData") : t("errorInvalid")}
          </p>
          <Link
            href="/configurator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("startNewConfig")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Print button - hidden in print */}
      <div className="fixed top-4 right-4 z-10 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white shadow-md rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          {t("print")}
        </button>
      </div>

      {/* Quote content */}
      <div className="max-w-4xl mx-auto py-8 px-4 print:p-0 print:max-w-none">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          <QuotePage quoteData={quoteData} />
        </div>
      </div>
    </div>
  );
}

function QuoteLoadingFallback() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-stone-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default function QuoteRoute() {
  return (
    <Suspense fallback={<QuoteLoadingFallback />}>
      <QuoteContent />
    </Suspense>
  );
}
