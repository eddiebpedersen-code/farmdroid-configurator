"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link2, Mail, Printer, Check } from "lucide-react";
import { ConfigPageData } from "@/lib/config-page-types";
import { calculateWorkingWidth } from "@/lib/configurator-data";
import { copyToClipboard } from "@/lib/quote-utils";
import { generateShareEmailUrl } from "@/lib/config-page-utils";

// Subtle gray blur placeholder for smooth image loading
const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjQiLz48L3N2Zz4=";

// Get the product image based on front wheel configuration
function getProductImage(frontWheel: string): string {
  switch (frontWheel) {
    case "AFW":
      return "/farmdroid-afw.png";
    case "DFW":
      return "/farmdroid-fd20.png"; // DFW uses the general FD20 image
    case "PFW":
    default:
      return "/farmdroid-pfw-side.png";
  }
}

interface HeroSectionProps {
  data: ConfigPageData;
}

export function HeroSection({ data }: HeroSectionProps) {
  const t = useTranslations("configPage");
  const { config, lead, reference } = data;
  const [copied, setCopied] = useState(false);

  const workingWidth = calculateWorkingWidth(config);
  const productImage = getProductImage(config.frontWheel);

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
      lead.firstName,
      reference
    );
    window.location.href = emailUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Greeting and Share Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-2">
            {t("greeting", { firstName: lead.firstName })}
          </h1>

          {/* Reference Code - Prominent Display */}
          <div className="mb-4">
            <p className="text-sm text-stone-500 mb-1">{t("referenceLabel")}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-lg border border-brand-200">
              <span className="text-lg font-mono font-semibold text-brand-800">{reference}</span>
            </div>
            <p className="text-xs text-stone-400 mt-2 max-w-md mx-auto">
              {t("referenceHint")}
            </p>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center justify-center gap-2 print:hidden">
              <button
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  copied
                    ? "bg-brand-100 text-brand-700"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
                title={t("share.copyLink")}
              >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? t("share.linkCopied") : t("share.copyLink")}</span>
              </button>
              <button
                onClick={handleEmailShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                title={t("share.emailShare")}
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{t("share.emailShare")}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                title={t("share.print")}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t("share.print")}</span>
              </button>
            </div>
        </motion.div>

        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative w-full max-w-lg aspect-[16/10]">
            {/* Ground shadow */}
            <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
            <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />
            <Image
              src={productImage}
              alt={`FarmDroid FD20 - ${config.frontWheel}`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 512px"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center gap-8 md:gap-12"
        >
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-stone-900">
              {config.activeRows}
              <span className="text-base font-normal text-stone-400 ml-0.5">{t("stats.rows")}</span>
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{t("stats.active")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-stone-900">
              {(workingWidth / 10).toFixed(0)}
              <span className="text-base font-normal text-stone-400 ml-0.5">cm</span>
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{t("stats.workingWidth")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-stone-900">
              {config.powerSource === "hybrid" ? t("stats.hybrid") : t("stats.solar")}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{t("stats.power")}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
