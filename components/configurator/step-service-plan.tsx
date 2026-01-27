"use client";

import { motion } from "framer-motion";
import { Check, X, Shield, Headphones, Cpu, Cloud, Smartphone, Radio, Database, MapPin, RefreshCw, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ConfiguratorState,
  PriceBreakdown,
  ServicePlan,
  formatPrice,
  getPrices,
} from "@/lib/configurator-data";
import { useMode } from "@/contexts/ModeContext";

interface StepServicePlanProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

interface FeatureConfig {
  translationKey: string;
  icon: typeof Check;
  standard: boolean;
  premium: boolean;
}

const featureConfigs: FeatureConfig[] = [
  { translationKey: "supportCentre", icon: Headphones, standard: true, premium: true },
  { translationKey: "aiAssistant", icon: Cpu, standard: true, premium: true },
  { translationKey: "softwareMaintenance", icon: RefreshCw, standard: true, premium: true },
  { translationKey: "farmDroidApp", icon: Smartphone, standard: true, premium: true },
  { translationKey: "iotConnectivity", icon: Radio, standard: true, premium: true },
  { translationKey: "fieldDataBackup", icon: Database, standard: true, premium: true },
  { translationKey: "baseStationSurvey", icon: MapPin, standard: true, premium: true },
  { translationKey: "agrirouter", icon: Cloud, standard: false, premium: true },
  { translationKey: "softwareUpgrades", icon: Zap, standard: false, premium: true },
];

export function StepServicePlan({ config, updateConfig }: StepServicePlanProps) {
  const t = useTranslations("servicePlan");
  const tCommon = useTranslations("common");
  const { showPrices } = useMode();
  const prices = getPrices(config.currency);
  const selectPlan = (plan: ServicePlan) => {
    // Toggle: clicking the already-selected plan deselects it
    if (config.servicePlan === plan) {
      updateConfig({ servicePlan: "none" });
    } else {
      updateConfig({ servicePlan: plan });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Comparison Table - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-stone-200">
            <div className="p-2 sm:p-4 bg-stone-50">
              <span className="text-xs sm:text-sm font-medium text-stone-500">{t("features")}</span>
            </div>
            <div
              className={`p-2 sm:p-4 text-center transition-colors ${
                config.servicePlan === "standard"
                  ? "bg-emerald-50 border-l-2 border-r-2 border-t-2 border-emerald-500"
                  : "bg-stone-50"
              }`}
            >
              <div className="text-xs sm:text-sm font-semibold text-stone-900">{t("plans.standard.name")}</div>
              <div className="text-[10px] sm:text-xs mt-0.5 text-stone-500">
                {formatPrice(prices.servicePlan.standard, config.currency)}{t("perYear")}
              </div>
            </div>
            <div
              className={`p-2 sm:p-4 text-center transition-colors relative ${
                config.servicePlan === "premium"
                  ? "bg-emerald-50 border-l-2 border-r-2 border-t-2 border-emerald-500 rounded-tr-xl"
                  : "bg-stone-50"
              }`}
            >
              <div className="text-xs sm:text-sm font-semibold text-stone-900">{t("plans.premium.name")}</div>
              <div className="text-[10px] sm:text-xs mt-0.5 text-stone-500">
                {formatPrice(prices.servicePlan.premium, config.currency)}{t("perYear")}
              </div>
            </div>
          </div>

          {/* Feature rows */}
          {featureConfigs.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.translationKey}
                className={`grid grid-cols-3 ${
                  index < featureConfigs.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <div className="p-2 sm:p-3 flex items-center gap-1.5 sm:gap-2">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-stone-400 flex-shrink-0" />
                  <span className="text-[11px] sm:text-sm text-stone-700 leading-tight">{t(`featuresList.${feature.translationKey}`)}</span>
                </div>
                <div
                  className={`p-2 sm:p-3 flex items-center justify-center ${
                    config.servicePlan === "standard" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                  }`}
                >
                  {feature.standard ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-stone-300" />
                  )}
                </div>
                <div
                  className={`p-2 sm:p-3 flex items-center justify-center ${
                    config.servicePlan === "premium" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                  }`}
                >
                  {feature.premium ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-stone-300" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Billing note */}
          <div className="grid grid-cols-3 border-t border-stone-200 bg-stone-50">
            <div className="p-2 sm:p-3" />
            <div className={`p-2 sm:p-3 text-center ${config.servicePlan === "standard" ? "bg-emerald-50/50 border-l-2 border-r-2 border-b-2 border-emerald-500" : ""}`}>
              <span className="text-[10px] sm:text-xs text-stone-500 italic">{t("billedAnnually")}</span>
            </div>
            <div className={`p-2 sm:p-3 text-center ${config.servicePlan === "premium" ? "bg-emerald-50/50 border-l-2 border-r-2 border-b-2 border-emerald-500 rounded-br-xl" : ""}`}>
              <span className="text-[10px] sm:text-xs text-emerald-600 italic font-medium">
                {t("firstYearIncluded")}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: Plan Selection & Warranty - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Plan Selection */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-stone-700">{t("servicePlanLabel")}</span>

          {/* Premium Option */}
          <button
            onClick={() => selectPlan("premium")}
            className={`selection-card w-full p-4 rounded-xl border-2 transition-all text-left card-hover ${
              config.servicePlan === "premium"
                ? "selected border-emerald-500"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  {config.servicePlan === "premium" && (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center checkmark-animated">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-stone-900">{t("plans.premium.name")}</span>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                    {t("plans.premium.recommended")}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {t("plans.premium.description")}
                </p>
              </div>
              <div className="text-right ml-4">
                <span className="text-sm text-stone-400 line-through">
                  {formatPrice(prices.servicePlan.premium, config.currency)}/yr
                </span>
                <p className="text-sm font-semibold text-emerald-600">
                  {tCommon("freeFirstYear", { price: formatPrice(0, config.currency) })}
                </p>
              </div>
            </div>
          </button>

          {/* Standard Option */}
          <button
            onClick={() => selectPlan("standard")}
            className={`selection-card w-full p-4 rounded-xl border-2 transition-all text-left card-hover ${
              config.servicePlan === "standard"
                ? "selected border-emerald-500"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  {config.servicePlan === "standard" && (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center checkmark-animated">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-stone-900">{t("plans.standard.name")}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {t("plans.standard.description")}
                </p>
              </div>
              <span className="text-sm font-semibold text-stone-900 ml-4">
                {formatPrice(prices.servicePlan.standard, config.currency)}/yr
              </span>
            </div>
          </button>

          {/* Hint that clicking a selected plan deselects it */}
          {config.servicePlan !== "none" && (
            <p className="text-xs text-stone-400 text-center mt-1">{t("clickToDeselect")}</p>
          )}
        </div>

        {/* Warranty Extension */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-stone-600" />
            <span className="text-sm font-medium text-stone-700">{t("warranty.title")}</span>
          </div>

          <button
            onClick={() => updateConfig({ warrantyExtension: !config.warrantyExtension })}
            className={`selection-card w-full p-4 rounded-xl border-2 transition-all text-left card-hover ${
              config.warrantyExtension
                ? "selected border-emerald-500"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  {config.warrantyExtension && (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center checkmark-animated">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-stone-900">
                    {t("warranty.extension")}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {t("warranty.description")}
                </p>
              </div>
              <span className="text-sm font-semibold text-stone-900 ml-4">
                {formatPrice(prices.warrantyExtension, config.currency)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
