"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  PRICES,
  getWeedCuttingDiscVariant,
  WeedingTool,
} from "@/lib/configurator-data";

interface StepSpraySystemProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

export function StepSpraySystem({ config, updateConfig }: StepSpraySystemProps) {
  const t = useTranslations("spraySystem");
  const tCommon = useTranslations("common");

  const sprayPrice = PRICES.spraySystem.base + (config.activeRows * PRICES.spraySystem.perRow);
  const combiToolPrice = config.activeRows * PRICES.accessories.combiToolPerRow;
  const weedCuttingDiscPrice = config.activeRows * PRICES.accessories.weedCuttingDiscPerRow;

  // Check if weed cutting disc is available for current row distance
  const weedCuttingDiscVariant = getWeedCuttingDiscVariant(config.rowDistance);
  const isWeedCuttingDiscAvailable = weedCuttingDiscVariant !== null;

  const handleWeedingToolChange = (tool: WeedingTool) => {
    updateConfig({ weedingTool: tool });
  };

  const standardWeedFeatureKeys = ["weedingWires", "knifeInrow"] as const;
  const combiToolFeatureKeys = ["notchedDiscs", "lShares"] as const;
  const sprayFeatureKeys = ["tankCapacity", "precisionNozzles", "gpsGuided", "variableRate"] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex items-center justify-center">
        <motion.div
          key={`${config.spraySystem}-${config.weedingTool}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg py-6 md:py-12"
        >
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            {/* Robot body */}
            <rect x="40" y="50" width="120" height="60" rx="6" fill="#059669" />
            <rect x="32" y="35" width="136" height="15" rx="3" fill="#10b981" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={48 + i * 32} y1="35" x2={48 + i * 32} y2="50" stroke="#047857" strokeWidth="1" />
            ))}

            {/* Wheels */}
            <circle cx="60" cy="120" r="14" fill="#374151" />
            <circle cx="60" cy="120" r="8" fill="#6b7280" />
            <circle cx="140" cy="120" r="14" fill="#374151" />
            <circle cx="140" cy="120" r="8" fill="#6b7280" />
            <circle cx="100" cy="128" r="9" fill="#374151" />
            <circle cx="100" cy="128" r="5" fill="#6b7280" />

            {/* Standard weeding tools - always visible */}
            <g>
              {/* Weeding wires (horizontal lines below robot) */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`wire-${i}`}
                  x1={50 + i * 25}
                  y1="115"
                  x2={50 + i * 25}
                  y2="135"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
              {/* Knife for inrow (small blade shapes) */}
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={`knife-${i}`}
                  d={`M${47 + i * 25} 140 L${50 + i * 25} 148 L${53 + i * 25} 140 Z`}
                  fill="#d97706"
                />
              ))}
            </g>

            {/* Combi Tool if selected */}
            {config.weedingTool === "combiTool" && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Combi tool attachments (disc-like shapes) */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={`combi-${i}`}>
                    <ellipse
                      cx={50 + i * 25}
                      cy="152"
                      rx="8"
                      ry="3"
                      fill="#7c3aed"
                    />
                    <line
                      x1={50 + i * 25}
                      y1="148"
                      x2={50 + i * 25}
                      y2="152"
                      stroke="#7c3aed"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </motion.g>
            )}

            {/* Weed Cutting Disc if selected */}
            {config.weedingTool === "weedCuttingDisc" && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Weed cutting disc attachments (circular discs) */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={`disc-${i}`}>
                    <circle
                      cx={50 + i * 25}
                      cy="150"
                      r="6"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                    />
                    <line
                      x1={50 + i * 25}
                      y1="144"
                      x2={50 + i * 25}
                      y2="148"
                      stroke="#dc2626"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </motion.g>
            )}

            {/* Spray system if selected */}
            {config.spraySystem && (
              <motion.g
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Tank */}
                <rect x="70" y="8" width="60" height="22" rx="4" fill="#3b82f6" />
                <text x="100" y="23" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  110L
                </text>

                {/* Spray arms */}
                <rect x="42" y="100" width="116" height="4" rx="2" fill="#60a5fa" />

                {/* Nozzles with spray */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={i}>
                    <circle cx={52 + i * 24} cy="108" r="4" fill="#3b82f6" />
                    <motion.path
                      d={`M${52 + i * 24} 112 L${47 + i * 24} 126 L${57 + i * 24} 126 Z`}
                      fill="#93c5fd"
                      opacity={0.6}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                    />
                  </g>
                ))}
              </motion.g>
            )}
          </svg>
        </motion.div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
        </div>

        {/* Mechanical Weeding Section */}
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("mechanicalWeeding")}</p>

          {/* Standard +Weed Config - Always included */}
          <div className="p-3 md:p-4 rounded-lg border border-stone-900 bg-stone-50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("standardWeedConfig.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("standardWeedConfig.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {standardWeedFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {t(`standardWeedConfig.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900">{tCommon("included")}</span>
            </div>
          </div>

          {/* Optional Weeding Tool Section Label */}
          <p className="text-xs text-stone-400 mt-3 ml-2 md:ml-4">{t("optionalWeedingTool")}</p>

          {/* Combi Tool Option */}
          <button
            onClick={() => handleWeedingToolChange(config.weedingTool === "combiTool" ? "none" : "combiTool")}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ml-2 md:ml-4 ${
              config.weedingTool === "combiTool"
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
            style={{ width: "calc(100% - 0.5rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  config.weedingTool === "combiTool"
                    ? "bg-stone-900"
                    : "border-2 border-stone-300"
                }`}>
                  {config.weedingTool === "combiTool" && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("combiTool.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("combiTool.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {combiToolFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {t(`combiTool.features.${key}`)}
                      </span>
                    ))}
                  </div>
                  {config.weedingTool === "combiTool" && (
                    <p className="text-xs text-stone-400 mt-2">
                      {t("combiTool.pricePerRow", { price: formatPrice(PRICES.accessories.combiToolPerRow, config.currency), count: config.activeRows })}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900 ml-3">
                +{formatPrice(combiToolPrice, config.currency)}
              </span>
            </div>
          </button>

          {/* Weed Cutting Disc Option */}
          <button
            onClick={() => isWeedCuttingDiscAvailable && handleWeedingToolChange(config.weedingTool === "weedCuttingDisc" ? "none" : "weedCuttingDisc")}
            disabled={!isWeedCuttingDiscAvailable}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ml-2 md:ml-4 ${
              !isWeedCuttingDiscAvailable
                ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                : config.weedingTool === "weedCuttingDisc"
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
            style={{ width: "calc(100% - 0.5rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  config.weedingTool === "weedCuttingDisc"
                    ? "bg-stone-900"
                    : "border-2 border-stone-300"
                }`}>
                  {config.weedingTool === "weedCuttingDisc" && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm md:text-base ${isWeedCuttingDiscAvailable ? "text-stone-900" : "text-stone-400"}`}>
                      {t("weedCuttingDisc.name")} {isWeedCuttingDiscAvailable && `(${weedCuttingDiscVariant})`}
                    </p>
                    {!isWeedCuttingDiscAvailable && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-500">
                        {t("weedCuttingDisc.notAvailable")}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isWeedCuttingDiscAvailable ? "text-stone-500" : "text-stone-400"}`}>
                    {t("weedCuttingDisc.description")}
                  </p>
                  {config.weedingTool === "weedCuttingDisc" && isWeedCuttingDiscAvailable && (
                    <p className="text-xs text-stone-400 mt-2">
                      {t("weedCuttingDisc.pricePerRow", { price: formatPrice(PRICES.accessories.weedCuttingDiscPerRow, config.currency), count: config.activeRows })}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium ml-3 ${isWeedCuttingDiscAvailable ? "text-stone-900" : "text-stone-400"}`}>
                +{formatPrice(weedCuttingDiscPrice, config.currency)}
              </span>
            </div>
          </button>
        </div>

        {/* Spray System Section */}
        <div className="space-y-2 md:space-y-3 pt-2">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("spraySystemSection")}</p>

          {/* Spray System Add-on */}
          <button
            onClick={() => updateConfig({ spraySystem: !config.spraySystem })}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ${
              config.spraySystem
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  config.spraySystem
                    ? "bg-stone-900"
                    : "border-2 border-stone-300"
                }`}>
                  {config.spraySystem && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 text-sm md:text-base">{t("spray.name")}</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{t("spray.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sprayFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {t(`spray.features.${key}`)}
                      </span>
                    ))}
                  </div>
                  {config.spraySystem && (
                    <div className="mt-3 pt-3 border-t border-stone-200 space-y-1 text-xs text-stone-400">
                      <div className="flex justify-between">
                        <span>{t("spray.baseSystem")}</span>
                        <span>{formatPrice(PRICES.spraySystem.base, config.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("spray.rowNozzles", { count: config.activeRows })}</span>
                        <span>{formatPrice(config.activeRows * PRICES.spraySystem.perRow, config.currency)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900 ml-3">
                +{formatPrice(sprayPrice, config.currency)}
              </span>
            </div>
          </button>
        </div>

        {/* Info text */}
        <p className="text-sm text-stone-500 pt-4 border-t border-stone-100">
          {config.spraySystem && config.weedingTool !== "none"
            ? t("info.both")
            : config.spraySystem
            ? t("info.sprayOnly")
            : config.weedingTool === "combiTool"
            ? t("info.combiOnly")
            : config.weedingTool === "weedCuttingDisc"
            ? t("info.weedCuttingDiscOnly")
            : t("info.standard")}
        </p>
      </div>
    </div>
  );
}
