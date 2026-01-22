"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  PRICES,
  getWeedCuttingDiscVariant,
  WeedingTool,
} from "@/lib/configurator-data";
import { useMode } from "@/contexts/ModeContext";


interface StepSpraySystemProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

type WeedOptionId = "standardWeeding" | "combiTool" | "weedCuttingDisc" | "spraySystem";

// Weed Config Info Modal Component
function WeedConfigInfoModal({
  isOpen,
  onClose,
  initialOption = "standardWeeding",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialOption?: WeedOptionId;
}) {
  const t = useTranslations("spraySystem.infoModal");
  const [activeOption, setActiveOption] = useState<WeedOptionId>(initialOption);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Update active option when modal opens with different initial option
  React.useEffect(() => {
    if (isOpen) {
      setActiveOption(initialOption);
      setCurrentImageIndex(0);
    }
  }, [isOpen, initialOption]);

  // Reset image index when switching options
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeOption]);

  const weedOptions: WeedOptionId[] = ["standardWeeding", "combiTool", "weedCuttingDisc", "spraySystem"];

  // Images for combi tool
  const combiToolImages = [
    "/accessories/combi-tool/combi-tool-1.jpg",
    "/accessories/combi-tool/combi-tool-2.jpg",
    "/accessories/combi-tool/combi-tool-3.jpg",
  ];

  // Images for weed cutting disc
  const weedCuttingDiscImages = [
    "/accessories/weed-cutting-disc/weed-cutting-disc-1.jpg",
    "/accessories/weed-cutting-disc/weed-cutting-disc-2.jpg",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col lg:flex-row"
          >
            {/* Left: Image/Video area */}
            <div className="relative flex-1 bg-stone-100 min-h-[250px] lg:min-h-0">
              {activeOption === "standardWeeding" ? (
                /* Video for standard weeding */
                <div className="absolute inset-0">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/videos/weeding-sequences.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-lg md:text-xl font-medium">{t(`options.standardWeeding.name`)}</p>
                  </div>
                </div>
              ) : activeOption === "spraySystem" ? (
                /* Video for spray system */
                <div className="absolute inset-0">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/videos/spray-system.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-lg md:text-xl font-medium">{t(`options.spraySystem.name`)}</p>
                  </div>
                </div>
              ) : (activeOption === "combiTool" || activeOption === "weedCuttingDisc") ? (
                <>
                  {(() => {
                    const images = activeOption === "combiTool"
                      ? combiToolImages
                      : weedCuttingDiscImages;
                    return (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${activeOption}-${currentImageIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                          >
                            <Image
                              src={images[currentImageIndex]}
                              alt={t(`options.${activeOption}.name`)}
                              fill
                              className="object-cover"
                              sizes="100vw"
                              quality={100}
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </motion.div>
                        </AnimatePresence>

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}

                        {/* Image indicators */}
                        {images.length > 1 && (
                          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-2 rounded-full transition-all ${
                                  idx === currentImageIndex
                                    ? "bg-white w-6"
                                    : "bg-white/50 hover:bg-white/75 w-2"
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Caption */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <p className="text-lg md:text-xl font-medium">{t(`options.${activeOption}.name`)}</p>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-stone-400 text-sm">
                  {/* Placeholder for other options */}
                </div>
              )}
            </div>

            {/* Right: Info panel */}
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white">
              {/* Header with close button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-900">{t("title")}</h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs for weed options */}
              <div className="flex border-b border-stone-200 overflow-x-auto">
                {weedOptions.map((option) => {
                  const isActive = activeOption === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setActiveOption(option)}
                      className={`flex-1 min-w-0 py-3 px-2 text-[11px] font-medium transition-colors relative whitespace-nowrap ${
                        isActive
                          ? "text-stone-900"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      <span className="truncate block">{t(`options.${option}.name`)}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeWeedTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeOption}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{t(`options.${activeOption}.name`)}</h3>
                      <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                        {t(`options.${activeOption}.description`)}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-medium text-stone-900">{t("specifications")}</h4>
                      <ul className="space-y-2">
                        {(t.raw(`options.${activeOption}.specs`) as string[])?.map((spec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Use case tip */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">{t(`options.${activeOption}.tipLabel`)}</span>{" "}
                        {t(`options.${activeOption}.tipText`)}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-stone-100 bg-white">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function StepSpraySystem({ config, updateConfig }: StepSpraySystemProps) {
  const t = useTranslations("spraySystem");
  const tCommon = useTranslations("common");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalOption, setInfoModalOption] = useState<WeedOptionId>("standardWeeding");
  const { showPrices } = useMode();

  const openInfoModal = (option: WeedOptionId) => {
    setInfoModalOption(option);
    setShowInfoModal(true);
  };

  const sprayPrice = PRICES.spraySystem.base + (config.activeRows * PRICES.spraySystem.perRow);
  const combiToolPrice = config.activeRows * PRICES.accessories.combiToolPerRow;
  const weedCuttingDiscPrice = config.activeRows * PRICES.accessories.weedCuttingDiscPerRow;

  // Check if combi tool is available - requires minimum row spacing of 30cm (300mm)
  const minRowSpacing = config.rowSpacings && config.rowSpacings.length > 0
    ? Math.min(...config.rowSpacings)
    : config.rowDistance;
  const isCombiToolAvailable = minRowSpacing >= 300;

  // Check if spray system is available - only up to 10 rows
  const isSpraySystemAvailable = config.activeRows <= 10;

  // Check if weed cutting disc is available for current row distance
  const weedCuttingDiscVariant = getWeedCuttingDiscVariant(config.rowDistance);
  const isWeedCuttingDiscAvailable = weedCuttingDiscVariant !== null;

  // Auto-deselect options if they become unavailable due to config changes
  useEffect(() => {
    if (config.weedingTool === "combiTool" && !isCombiToolAvailable) {
      updateConfig({ weedingTool: "none" });
    }
    if (config.spraySystem && !isSpraySystemAvailable) {
      updateConfig({ spraySystem: false });
    }
  }, [config.weedingTool, config.spraySystem, isCombiToolAvailable, isSpraySystemAvailable, updateConfig]);

  const handleWeedingToolChange = (tool: WeedingTool) => {
    updateConfig({ weedingTool: tool });
  };

  const standardWeedFeatureKeys = ["weedingWires", "knifeInrow"] as const;
  const combiToolFeatureKeys = ["notchedDiscs", "lShares"] as const;
  const sprayFeatureKeys = ["tankCapacity", "precisionNozzles", "gpsGuided", "variableRate"] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Video Background - Takes 3 columns */}
      <div className="lg:col-span-3 flex items-center justify-center">
        <div className="w-full max-w-2xl py-6 md:py-12">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-900 shadow-lg">
            {/* Video */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/videos/weeding-sequences.mp4" type="video/mp4" />
            </video>

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />
          </div>
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
        </div>

        {/* Mechanical Weeding Section */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("mechanicalWeeding")}</p>
            <button
              onClick={() => openInfoModal("standardWeeding")}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">{t("learnMore")}</span>
            </button>
          </div>

          {/* Standard +Weed Config - Always included */}
          <div className="selection-card selected p-4 md:p-5 rounded-xl border">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("standardWeedConfig.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("standardWeedConfig.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {standardWeedFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"
                      >
                        {t(`standardWeedConfig.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-900">{tCommon("included")}</span>
            </div>
          </div>

          {/* Optional Weeding Tool Section Label */}
          <div className="flex items-center justify-between mt-3 ml-2 md:ml-4">
            <p className="text-xs text-stone-400">{t("optionalWeedingTool")}</p>
            <button
              onClick={() => openInfoModal("combiTool")}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">{t("learnMore")}</span>
            </button>
          </div>

          {/* Combi Tool Option */}
          <button
            onClick={() => isCombiToolAvailable && handleWeedingToolChange(config.weedingTool === "combiTool" ? "none" : "combiTool")}
            disabled={!isCombiToolAvailable}
            className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border ${isCombiToolAvailable && "card-hover"} ml-3 md:ml-5 ${
              !isCombiToolAvailable
                ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                : config.weedingTool === "combiTool"
                ? "selected"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
            style={{ width: "calc(100% - 0.75rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  config.weedingTool === "combiTool"
                    ? "bg-emerald-500"
                    : "border-2 border-stone-300"
                }`}>
                  {config.weedingTool === "combiTool" && <Check className="h-3 w-3 text-white checkmark-animated" strokeWidth={3} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm md:text-base ${isCombiToolAvailable ? "text-stone-900" : "text-stone-400"}`}>
                      {t("combiTool.name")}
                    </p>
                    {!isCombiToolAvailable && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-500">
                        {t("combiTool.notAvailable")}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isCombiToolAvailable ? "text-stone-500" : "text-stone-400"}`}>
                    {!isCombiToolAvailable ? t("combiTool.requiresMinSpacing") : t("combiTool.description")}
                  </p>
                  {isCombiToolAvailable && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {combiToolFeatureKeys.map((key) => (
                        <span
                          key={key}
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            config.weedingTool === "combiTool" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {t(`combiTool.features.${key}`)}
                        </span>
                      ))}
                    </div>
                  )}
                  {config.weedingTool === "combiTool" && showPrices && (
                    <p className="text-xs text-stone-400 mt-2">
                      {t("combiTool.pricePerRow", { price: formatPrice(PRICES.accessories.combiToolPerRow, config.currency), count: config.activeRows })}
                    </p>
                  )}
                </div>
              </div>
              {showPrices && (
                <span className={`text-sm font-semibold ml-3 ${isCombiToolAvailable ? "text-stone-900" : "text-stone-400"}`}>
                  +{formatPrice(combiToolPrice, config.currency)}
                </span>
              )}
            </div>
          </button>

          {/* Weed Cutting Disc Option */}
          <button
            onClick={() => isWeedCuttingDiscAvailable && handleWeedingToolChange(config.weedingTool === "weedCuttingDisc" ? "none" : "weedCuttingDisc")}
            disabled={!isWeedCuttingDiscAvailable}
            className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border ${isWeedCuttingDiscAvailable && "card-hover"} ml-3 md:ml-5 ${
              !isWeedCuttingDiscAvailable
                ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                : config.weedingTool === "weedCuttingDisc"
                ? "selected"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
            style={{ width: "calc(100% - 0.75rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  config.weedingTool === "weedCuttingDisc"
                    ? "bg-emerald-500"
                    : "border-2 border-stone-300"
                }`}>
                  {config.weedingTool === "weedCuttingDisc" && <Check className="h-3 w-3 text-white checkmark-animated" strokeWidth={3} />}
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
                  {config.weedingTool === "weedCuttingDisc" && isWeedCuttingDiscAvailable && showPrices && (
                    <p className="text-xs text-stone-400 mt-2">
                      {t("weedCuttingDisc.pricePerRow", { price: formatPrice(PRICES.accessories.weedCuttingDiscPerRow, config.currency), count: config.activeRows })}
                    </p>
                  )}
                </div>
              </div>
              {showPrices && (
                <span className={`text-sm font-semibold ml-3 ${isWeedCuttingDiscAvailable ? "text-stone-900" : "text-stone-400"}`}>
                  +{formatPrice(weedCuttingDiscPrice, config.currency)}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Spray System Section */}
        <div className="space-y-3 md:space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("spraySystemSection")}</p>
            <button
              onClick={() => openInfoModal("spraySystem")}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">{t("learnMore")}</span>
            </button>
          </div>

          {/* Spray System Add-on */}
          <button
            onClick={() => isSpraySystemAvailable && updateConfig({ spraySystem: !config.spraySystem })}
            disabled={!isSpraySystemAvailable}
            className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border ${isSpraySystemAvailable && "card-hover"} ${
              !isSpraySystemAvailable
                ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                : config.spraySystem
                ? "selected"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  config.spraySystem
                    ? "bg-emerald-500"
                    : "border-2 border-stone-300"
                }`}>
                  {config.spraySystem && <Check className="h-3 w-3 text-white checkmark-animated" strokeWidth={3} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm md:text-base ${isSpraySystemAvailable ? "text-stone-900" : "text-stone-400"}`}>
                      {t("spray.name")}
                    </p>
                    {!isSpraySystemAvailable && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-500">
                        {t("spray.notAvailable")}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isSpraySystemAvailable ? "text-stone-500" : "text-stone-400"}`}>
                    {!isSpraySystemAvailable ? t("spray.maxRowsExceeded") : t("spray.description")}
                  </p>
                  {isSpraySystemAvailable && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {sprayFeatureKeys.map((key) => (
                        <span
                          key={key}
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            config.spraySystem ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {t(`spray.features.${key}`)}
                        </span>
                      ))}
                    </div>
                  )}
                  {config.spraySystem && showPrices && isSpraySystemAvailable && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1 text-xs text-stone-400">
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
              {showPrices && (
                <span className={`text-sm font-semibold ml-3 ${isSpraySystemAvailable ? "text-stone-900" : "text-stone-400"}`}>
                  +{formatPrice(sprayPrice, config.currency)}
                </span>
              )}
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

      {/* Weed Config Info Modal */}
      <WeedConfigInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        initialOption={infoModalOption}
      />
    </div>
  );
}
