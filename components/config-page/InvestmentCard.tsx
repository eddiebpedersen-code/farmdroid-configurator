"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ConfigPageData } from "@/lib/config-page-types";
import {
  calculatePrice,
  calculatePassiveRows,
  formatPrice,
  PRICES,
  getWeedCuttingDiscVariant,
} from "@/lib/configurator-data";

interface InvestmentCardProps {
  data: ConfigPageData;
}

export function InvestmentCard({ data }: InvestmentCardProps) {
  const t = useTranslations("configPage");
  const { config } = data;

  const priceBreakdown = calculatePrice(config);
  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);

  // Calculate weeding tool price separately for display
  let weedingToolPrice = 0;
  if (config.weedingTool === "combiTool") {
    weedingToolPrice = config.activeRows * PRICES.accessories.combiToolPerRow;
  } else if (config.weedingTool === "weedCuttingDisc") {
    weedingToolPrice = config.activeRows * PRICES.accessories.weedCuttingDiscPerRow;
  }

  const weedCuttingDiscVariant = getWeedCuttingDiscVariant(config.rowDistance);

  // Build line items
  const lineItems = [
    {
      label: "FD20 Robot V2.6",
      price: priceBreakdown.baseRobot,
    },
    priceBreakdown.frontWheel > 0 && {
      label: t(`investment.frontWheel.${config.frontWheel}`),
      price: priceBreakdown.frontWheel,
    },
    {
      label: t("investment.activeRows", { count: config.activeRows, size: config.seedSize }),
      price: priceBreakdown.activeRows,
    },
    passiveRows > 0 && {
      label: t("investment.passiveRows", { count: passiveRows }),
      price: 0,
      included: true,
    },
    priceBreakdown.powerSource > 0 && {
      label: t("investment.hybrid"),
      price: priceBreakdown.powerSource,
    },
    priceBreakdown.spraySystem > 0 && {
      label: t("investment.spraySystem"),
      price: priceBreakdown.spraySystem,
    },
    config.weedingTool === "combiTool" && {
      label: t("investment.combiTool", { count: config.activeRows }),
      price: weedingToolPrice,
    },
    config.weedingTool === "weedCuttingDisc" && {
      label: t("investment.weedCuttingDisc", { count: config.activeRows, variant: weedCuttingDiscVariant || "" }),
      price: weedingToolPrice,
    },
    (priceBreakdown.accessories - weedingToolPrice) > 0 && {
      label: t("investment.accessories"),
      price: priceBreakdown.accessories - weedingToolPrice,
    },
    priceBreakdown.warrantyExtension > 0 && {
      label: t("investment.warrantyExtension"),
      price: priceBreakdown.warrantyExtension,
    },
  ].filter(Boolean) as { label: string; price: number; included?: boolean }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900">{t("investmentTitle")}</h2>
      </div>

      {/* Line Items */}
      <div className="divide-y divide-stone-100">
        {lineItems.map((item, index) => (
          <div key={index} className="px-6 py-3 flex justify-between items-center">
            <span className="text-sm text-stone-700">{item.label}</span>
            {item.included ? (
              <span className="text-sm text-brand-600 font-medium">{t("investment.included")}</span>
            ) : (
              <span className="text-sm font-medium text-stone-900">
                {formatPrice(item.price, config.currency)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-6 py-4 bg-stone-900">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">{t("investment.total")}</span>
          <span className="text-xl font-bold text-white">
            {formatPrice(priceBreakdown.total, config.currency)}
          </span>
        </div>
      </div>

      {/* Annual Service */}
      {config.servicePlan !== "none" && (
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-stone-700">{t("investment.annualSubscription")}</span>
              {config.servicePlan === "premium" && (
                <span className="ml-2 text-xs text-brand-600 font-medium">
                  {t("investment.firstYearIncluded")}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-stone-900">
              {formatPrice(PRICES.servicePlan[config.servicePlan], config.currency)}/yr
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="px-6 py-3 border-t border-stone-100">
        <p className="text-xs text-stone-500">{t("investment.vatNote")}</p>
        <p className="text-xs text-stone-400 mt-1">{t("investment.disclaimer")}</p>
      </div>
    </motion.div>
  );
}
