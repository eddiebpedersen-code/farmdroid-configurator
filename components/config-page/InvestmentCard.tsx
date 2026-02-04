"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ConfigPageData } from "@/lib/config-page-types";
import {
  calculatePrice,
  calculatePassiveRows,
  formatPrice,
  getPrices,
  getWeedCuttingDiscVariant,
  Currency,
} from "@/lib/configurator-data";

interface InvestmentCardProps {
  data: ConfigPageData;
}

export function InvestmentCard({ data }: InvestmentCardProps) {
  const t = useTranslations("configPage");
  const { config } = data;

  const [currency, setCurrency] = useState<Currency>(config.currency);

  const prices = getPrices(currency);
  const priceBreakdown = calculatePrice(config, undefined, currency);
  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);

  const weedCuttingDiscVariant = getWeedCuttingDiscVariant(config.rowDistance);

  // Build selected configuration items (labels only, no prices)
  const selectedItems = [
    { label: "FD20 Robot V2.6" },
    priceBreakdown.frontWheel > 0 && {
      label: t(`investment.frontWheel.${config.frontWheel}`),
    },
    {
      label: t("investment.activeRows", { count: config.activeRows, size: config.seedSize }),
    },
    passiveRows > 0 && {
      label: t("investment.passiveRows", { count: passiveRows }),
      included: true,
    },
    priceBreakdown.powerSource > 0 && {
      label: t("investment.hybrid"),
    },
    priceBreakdown.spraySystem > 0 && {
      label: t("investment.spraySystem"),
    },
    config.weedingTool === "combiTool" && {
      label: t("investment.combiTool", { count: config.activeRows }),
    },
    config.weedingTool === "weedCuttingDisc" && {
      label: t("investment.weedCuttingDisc", { count: config.activeRows, variant: weedCuttingDiscVariant || "" }),
    },
    // Accessory items
    config.starterKit && { label: t("investment.starterKit") },
    !config.starterKit && config.fstFieldSetupTool && { label: t("investment.fstFieldSetupTool") },
    !config.starterKit && config.baseStationV3 && { label: t("investment.baseStationV3") },
    !config.starterKit && config.essentialCarePackage && { label: t("investment.essentialCarePackage") },
    !config.starterKit && config.fieldBracket && { label: t("investment.fieldBracket") },
    config.roadTransport && { label: t("investment.roadTransport") },
    config.powerBank && { label: t("investment.powerBank") },
    config.spraySystem && (config.starterKit || config.essentialCarePackage) && { label: t("investment.essentialCareSpray") },
    config.additionalWeightKit && { label: t("investment.additionalWeightKit") },
    config.toolbox && { label: t("investment.toolbox") },
    priceBreakdown.warrantyExtension > 0 && {
      label: t("investment.warrantyExtension"),
    },
  ].filter(Boolean) as { label: string; included?: boolean }[];

  // Partner services (labels only, no prices)
  const partnerServices = [
    { label: t("investment.partnerDelivery") },
    { label: t("investment.partnerSetup") },
    { label: t("investment.partnerSeasonal") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">{t("investmentTitle")}</h2>
        <div className="flex items-center bg-stone-100 rounded-lg p-0.5" role="radiogroup" aria-label="Currency">
          {(["EUR", "DKK"] as Currency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              role="radio"
              aria-checked={currency === curr}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currency === curr
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Configuration Items (no prices) */}
      <div className="divide-y divide-stone-100">
        {selectedItems.map((item, index) => (
          <div key={index} className="px-6 py-3 flex justify-between items-center">
            <span className="text-sm text-stone-700">{item.label}</span>
            {item.included ? (
              <span className="text-sm text-emerald-600 font-medium">{t("investment.included")}</span>
            ) : (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                {t("investment.selected")}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Machine Price */}
      <div className="px-6 py-4 bg-stone-900">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">{t("investment.machinePriceTitle")}</span>
          <span className="text-xl font-bold text-white">
            {formatPrice(priceBreakdown.total, currency)}
          </span>
        </div>
        <p className="text-xs text-stone-400 mt-1">
          {t("investment.machinePriceSubtitle")}
        </p>
      </div>

      {/* Local Partner Services */}
      <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">
          {t("investment.partnerServicesTitle")}
        </h3>
        <div className="space-y-2">
          {partnerServices.map((service, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-stone-600">{service.label}</span>
              <span className="text-sm text-stone-400 italic">{t("investment.partnerQuoted")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      {config.servicePlan !== "none" && (
        <div className="px-6 py-4 border-t border-stone-200">
          <h3 className="text-sm font-semibold text-stone-700 mb-2">
            {t("investment.subscriptionTitle")}
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-stone-700">{t("investment.annualSubscription")}</span>
              {config.servicePlan === "premium" && (
                <span className="ml-2 text-xs text-emerald-600 font-medium">
                  {t("investment.firstYearIncluded")}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-stone-900">
              {formatPrice(prices.servicePlan[config.servicePlan], currency)}/yr
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="px-6 py-3 border-t border-stone-100">
        <p className="text-xs text-stone-500">{t("investment.currencyNote")}</p>
      </div>
    </motion.div>
  );
}
