"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link2, Mail, Printer, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/quote-utils";
import { generateShareEmailUrl } from "@/lib/config-page-utils";
import { ConfigPageData } from "@/lib/config-page-types";

interface ShareActionsProps {
  data: ConfigPageData;
}

export function ShareActions({ data }: ShareActionsProps) {
  const t = useTranslations("configPage");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const emailUrl = generateShareEmailUrl(
      window.location.href,
      data.lead.firstName,
      data.reference
    );
    window.location.href = emailUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="bg-white rounded-xl border border-stone-200 p-6"
    >
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{t("share.title")}</h2>

      <div className="flex flex-wrap gap-3">
        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            copied
              ? "bg-brand-50 border-brand-200 text-brand-700"
              : "border-stone-200 text-stone-700 hover:bg-stone-50"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              {t("share.linkCopied")}
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              {t("share.copyLink")}
            </>
          )}
        </button>

        {/* Email Share */}
        <button
          onClick={handleEmailShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <Mail className="w-4 h-4" />
          {t("share.emailShare")}
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" />
          {t("share.print")}
        </button>
      </div>
    </motion.div>
  );
}
