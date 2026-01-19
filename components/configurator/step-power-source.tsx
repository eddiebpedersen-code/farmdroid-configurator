"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";

interface StepPowerSourceProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

type PowerOptionId = "solar" | "powerBank" | "hybrid";

// Power Source Info Modal Component
function PowerSourceInfoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("powerSource.infoModal");
  const [activeOption, setActiveOption] = useState<PowerOptionId>("solar");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const powerOptions: PowerOptionId[] = ["solar", "powerBank", "hybrid"];

  // Image paths for each power option
  const optionImages: Record<PowerOptionId, string[]> = {
    solar: ["/farmdroid-fd20.png"],
    powerBank: ["/accessories/power-bank-1.jpg", "/accessories/power-bank-2.jpg"],
    hybrid: ["/farmdroid-fd20.png"],
  };

  const images = optionImages[activeOption];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Reset image index when switching options
  const handleOptionChange = (option: PowerOptionId) => {
    setActiveOption(option);
    setCurrentImageIndex(0);
  };

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
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col lg:flex-row"
          >
            {/* Left: Image area with gallery */}
            <div className="relative flex-1 bg-stone-100 min-h-[250px] lg:min-h-0">
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
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
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
                      className={`h-2 w-2 rounded-full transition-colors ${
                        idx === currentImageIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Caption at bottom of image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg md:text-xl font-medium">{t(`options.${activeOption}.name`)}</p>
              </div>
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

              {/* Tabs for power options */}
              <div className="flex border-b border-stone-200 overflow-x-auto">
                {powerOptions.map((option) => {
                  const isActive = activeOption === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionChange(option)}
                      className={`flex-1 min-w-0 py-3 px-3 text-xs font-medium transition-colors relative whitespace-nowrap ${
                        isActive
                          ? "text-stone-900"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      <span className="truncate block">{t(`options.${option}.name`)}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activePowerTab"
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
                            <Check className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
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

export function StepPowerSource({ config, updateConfig }: StepPowerSourceProps) {
  const hasGenerator = config.powerSource === "hybrid";
  const hasPowerBank = config.powerBank && !hasGenerator;
  const t = useTranslations("powerSource");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const solarFeatureKeys = ["solarPanels", "battery", "zeroEmission"] as const;
  const powerBankFeatureKeys = ["extraCapacity", "totalCapacity", "chargedExternally", "smartCharging"] as const;
  const hybridFeatureKeys = ["solarPanels", "battery", "generatorBackup", "allWeather"] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex items-center justify-center">
        <motion.div
          key={`${config.powerSource}-${config.powerBank}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg py-6 md:py-12"
        >
          <svg viewBox="0 0 200 140" className="w-full h-auto">
            {/* Sun rays */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "100px 25px" }}
            >
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="100"
                  y1="5"
                  x2="100"
                  y2="12"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  transform={`rotate(${i * 45} 100 25)`}
                />
              ))}
            </motion.g>
            <circle cx="100" cy="25" r="12" fill="#fbbf24" />

            {/* Generator if hybrid */}
            {hasGenerator && (
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <rect x="8" y="70" width="30" height="35" rx="3" fill="#6b7280" />
                <rect x="11" y="74" width="24" height="7" rx="1" fill="#374151" />
                <motion.rect
                  x="14"
                  y="84"
                  width="5"
                  height="5"
                  fill="#22c55e"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <path d="M38 87 L50 87 L50 70" stroke="#f59e0b" strokeWidth="2" fill="none" />
              </motion.g>
            )}

            {/* Power Bank if selected */}
            {hasPowerBank && (
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <rect x="8" y="70" width="30" height="35" rx="3" fill="#3b82f6" />
                <rect x="12" y="76" width="22" height="12" rx="2" fill="#1d4ed8" />
                <motion.rect
                  x="15"
                  y="79"
                  width="16"
                  height="6"
                  rx="1"
                  fill="#60a5fa"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <path d="M38 87 L50 87 L50 70" stroke="#3b82f6" strokeWidth="2" fill="none" />
              </motion.g>
            )}

            {/* Robot */}
            <rect x="40" y="50" width="120" height="60" rx="6" fill="#059669" />
            <rect x="32" y="35" width="136" height="15" rx="3" fill="#10b981" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={48 + i * 32} y1="35" x2={48 + i * 32} y2="50" stroke="#047857" strokeWidth="1" />
            ))}
            <circle cx="60" cy="120" r="14" fill="#374151" />
            <circle cx="60" cy="120" r="8" fill="#6b7280" />
            <circle cx="140" cy="120" r="14" fill="#374151" />
            <circle cx="140" cy="120" r="8" fill="#6b7280" />
            <circle cx="100" cy="128" r="9" fill="#374151" />
            <circle cx="100" cy="128" r="5" fill="#6b7280" />
          </svg>
        </motion.div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors group"
            >
              <span className="flex items-center justify-center h-4 w-4 rounded-full border border-stone-300 group-hover:border-stone-400 group-hover:bg-stone-100 transition-colors">
                <Info className="h-2.5 w-2.5" />
              </span>
              <span className="underline underline-offset-2">{t("learnMore")}</span>
            </button>
          </div>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
        </div>

        {/* Pure Electric Section */}
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("pureElectric")}</p>

          {/* Solar Base */}
          <div className="p-3 md:p-4 rounded-lg border border-stone-900 bg-stone-50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("solar.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("solar.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {solarFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {t(`solar.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900">{t("solar.name") === "Solar" ? "Included" : t("solar.name")}</span>
            </div>
          </div>

          {/* Power Bank Add-on */}
          <button
            onClick={() => {
              if (hasPowerBank) {
                updateConfig({ powerBank: false });
              } else {
                updateConfig({ powerSource: "solar", powerBank: true });
              }
            }}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ml-2 md:ml-4 ${
              hasPowerBank
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
            style={{ width: "calc(100% - 0.5rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  hasPowerBank
                    ? "bg-stone-900"
                    : "border-2 border-stone-300"
                }`}>
                  {hasPowerBank && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 text-sm md:text-base">{t("powerBank.name")}</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{t("powerBank.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {powerBankFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {t(`powerBank.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900 ml-3">
                +{formatPrice(PRICES.accessories.powerBank, config.currency)}
              </span>
            </div>
          </button>
        </div>

        {/* Hybrid Power Section */}
        <div className="space-y-2 md:space-y-3 pt-2">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("hybridPower")}</p>

          {/* Generator Add-on */}
          <button
            onClick={() => {
              if (hasGenerator) {
                updateConfig({ powerSource: "solar" });
              } else {
                updateConfig({ powerSource: "hybrid", powerBank: false });
              }
            }}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ${
              hasGenerator
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  hasGenerator
                    ? "bg-stone-900"
                    : "border-2 border-stone-300"
                }`}>
                  {hasGenerator && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 text-sm md:text-base">{t("hybrid.name")}</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{t("hybrid.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {hybridFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {t(`hybrid.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900 ml-3">
                +{formatPrice(PRICES.powerSource.hybrid, config.currency)}
              </span>
            </div>
          </button>
        </div>

        {/* Info text */}
        <p className="text-sm text-stone-500 pt-4 border-t border-stone-100">
          {hasGenerator
            ? t("info.hybrid")
            : hasPowerBank
            ? t("info.powerBank")
            : t("info.solar")}
        </p>
      </div>

      {/* Power Source Info Modal */}
      <PowerSourceInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
