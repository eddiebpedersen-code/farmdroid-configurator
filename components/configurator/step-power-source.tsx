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
import { useMode } from "@/contexts/ModeContext";

// Subtle gray blur placeholder for smooth image loading
const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjQiLz48L3N2Zz4=";

interface StepPowerSourceProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

type PowerOptionId = "solar" | "powerBank";

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

  const powerOptions: PowerOptionId[] = ["solar", "powerBank"];

  // Image paths for each power option
  const optionImages: Record<PowerOptionId, string[]> = {
    solar: ["/accessories/solar-power.jpg"],
    powerBank: ["/accessories/power-bank-1.jpg", "/accessories/power-bank-2.jpg"],
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
            className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col lg:flex-row"
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
                    sizes="100vw"
                    quality={100}
                    unoptimized
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
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

export function StepPowerSource({ config, updateConfig }: StepPowerSourceProps) {
  const hasPowerBank = config.powerBank;
  const t = useTranslations("powerSource");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const { showPrices } = useMode();

  const solarFeatureKeys = ["solarPanels", "battery", "zeroEmission"] as const;
  const powerBankFeatureKeys = ["extraCapacity", "totalCapacity", "chargedExternally", "smartCharging"] as const;

  // Get robot image based on front wheel configuration
  const getRobotImage = () => {
    switch (config.frontWheel) {
      case "AFW":
        return "/farmdroid-afw.png";
      case "DFW":
        return "/images/wheels/dfw.png";
      case "PFW":
      default:
        return "/farmdroid-pfw.png";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col items-center justify-center py-6 md:py-8">
        <motion.div
          key={`${config.frontWheel}-${config.powerBank}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl mx-auto relative"
        >
          {/* FarmDroid top-down view - clean */}
          <svg viewBox="0 0 400 320" className="w-full h-auto">
            {/* Sun in corner */}
            <g transform="translate(330, 55)">
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(8)].map((_, i) => (
                  <rect
                    key={i}
                    x="-5"
                    y="-48"
                    width="10"
                    height="16"
                    rx="5"
                    fill="#fbbf24"
                    transform={`rotate(${i * 45})`}
                  />
                ))}
              </motion.g>
              <circle r="26" fill="#fbbf24" />
            </g>

            {/* Robot - top down view, larger */}
            <g transform="translate(200, 165)">
              {/* GPS/Antenna at top - touching the frame */}
              <rect x="-3" y="-90" width="6" height="18" fill="#374151" />
              <circle cx="0" cy="-93" r="6" fill="#6b7280" />

              {/* Main frame - green border */}
              <rect x="-75" y="-72" width="150" height="130" rx="5" fill="#10b981" />

              {/* Solar panel - dark with grid */}
              <rect x="-68" y="-65" width="136" height="116" rx="3" fill="#1e3a5f" />

              {/* Panel grid - 2x2 sections */}
              <line x1="0" y1="-65" x2="0" y2="51" stroke="#10b981" strokeWidth="4" />
              <line x1="-68" y1="-7" x2="68" y2="-7" stroke="#10b981" strokeWidth="4" />

              {/* Solar cell grid lines */}
              <g stroke="#2d4a6f" strokeWidth="0.75" opacity="0.5">
                {/* Vertical lines */}
                {[-56, -44, -32, -20, 20, 32, 44, 56].map((x) => (
                  <line key={x} x1={x} y1="-65" x2={x} y2="51" />
                ))}
                {/* Horizontal lines */}
                {[-52, -39, -26, 6, 19, 32, 45].map((y) => (
                  <line key={y} x1="-68" y1={y} x2="68" y2={y} />
                ))}
              </g>

              {/* Wheels at bottom */}
              <rect x="-55" y="58" width="20" height="30" rx="3" fill="#374151" />
              <rect x="35" y="58" width="20" height="30" rx="3" fill="#374151" />

              {/* Animated solar shimmer */}
              {[0, 1, 2, 3].map((i) => (
                <motion.rect
                  key={i}
                  x={i < 2 ? -65 : 4}
                  y={i % 2 === 0 ? -62 : -3}
                  width="61"
                  height="52"
                  rx="2"
                  fill="#3b82f6"
                  opacity="0"
                  animate={{ opacity: [0, 0.12, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                />
              ))}
            </g>

            {/* Power Bank - appears next to robot */}
            <AnimatePresence>
              {hasPowerBank && (
                <motion.g
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Power bank */}
                  <g transform="translate(45, 165)">
                    <rect x="-18" y="-40" width="36" height="80" rx="6" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />

                    {/* Battery indicator bars */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.rect
                        key={i}
                        x="-12"
                        y={-32 + i * 17}
                        width="24"
                        height="12"
                        rx="2"
                        fill="#60a5fa"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </g>

                  {/* Connection cable */}
                  <path
                    d="M 63 165 L 125 165"
                    stroke="#374151"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Energy flow */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={i}
                      r="4"
                      fill="#60a5fa"
                      cy="165"
                      animate={{
                        cx: [63, 94, 125],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.23,
                        ease: "linear",
                      }}
                    />
                  ))}

                  {/* Connection glow */}
                  <motion.circle
                    cx="125"
                    cy="165"
                    r="6"
                    fill="#22c55e"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />

                  {/* +6 kWh label */}
                  <text x="45" y="235" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1d4ed8">+6 kWh</text>
                </motion.g>
              )}
            </AnimatePresence>
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
        <div className="space-y-3 md:space-y-4">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("pureElectric")}</p>

          {/* Solar Base */}
          <div className="selection-card selected p-4 md:p-5 rounded-xl border">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("solar.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("solar.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {solarFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"
                      >
                        {t(`solar.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-900">{t("solar.name") === "Solar" ? "Included" : t("solar.name")}</span>
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
            className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border card-hover ml-3 md:ml-5 ${
              hasPowerBank
                ? "selected"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
            style={{ width: "calc(100% - 0.75rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  hasPowerBank
                    ? "bg-emerald-500"
                    : "border-2 border-stone-300"
                }`}>
                  {hasPowerBank && <Check className="h-3 w-3 text-white checkmark-animated" strokeWidth={3} />}
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
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          hasPowerBank ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {t(`powerBank.features.${key}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {showPrices && (
                <span className="text-sm font-semibold text-stone-900 ml-3">
                  +{formatPrice(PRICES.accessories.powerBank, config.currency)}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Info text */}
        <p className="text-sm text-stone-500 pt-4 border-t border-stone-100">
          {hasPowerBank
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
