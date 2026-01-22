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
  getWeedCuttingDiscVariant,
  WeedingTool,
} from "@/lib/configurator-data";
import { useMode } from "@/contexts/ModeContext";

// Subtle gray blur placeholder for smooth image loading
const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjQiLz48L3N2Zz4=";

interface StepSpraySystemProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

type WeedOptionId = "standardWeeding" | "combiTool" | "weedCuttingDisc" | "spraySystem";

// Combi Tool Animation Component
function CombiToolAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <svg viewBox="0 0 400 300" className="w-full h-full max-w-[500px]">
        {/* Background soil */}
        <rect x="0" y="150" width="400" height="150" fill="#8B7355" />

        {/* Soil texture lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={`soil-${i}`}
            x1={i * 50 + 10}
            y1="160"
            x2={i * 50 + 30}
            y2="280"
            stroke="#6B5344"
            strokeWidth="2"
            opacity="0.3"
          />
        ))}

        {/* Crop row - center line of plants */}
        <g>
          {/* Soil ridge for crop row */}
          <ellipse cx="200" cy="180" rx="25" ry="8" fill="#9B8365" />

          {/* Plants in the row */}
          {[-80, -40, 0, 40, 80].map((offset, i) => (
            <g key={`plant-${i}`} transform={`translate(${200 + offset}, 160)`}>
              {/* Plant stem */}
              <line x1="0" y1="0" x2="0" y2="-30" stroke="#22c55e" strokeWidth="3" />
              {/* Leaves */}
              <ellipse cx="-8" cy="-20" rx="10" ry="5" fill="#22c55e" transform="rotate(-30)" />
              <ellipse cx="8" cy="-20" rx="10" ry="5" fill="#22c55e" transform="rotate(30)" />
              <ellipse cx="-6" cy="-35" rx="8" ry="4" fill="#16a34a" transform="rotate(-20)" />
              <ellipse cx="6" cy="-35" rx="8" ry="4" fill="#16a34a" transform="rotate(20)" />
            </g>
          ))}
        </g>

        {/* Left disc assembly */}
        <g transform="translate(120, 175)">
          {/* Disc arm */}
          <rect x="-5" y="-60" width="10" height="60" fill="#374151" rx="2" />

          {/* Rotating notched disc */}
          <g>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {/* Main disc */}
              <circle cx="0" cy="0" r="35" fill="#6b7280" stroke="#374151" strokeWidth="3" />
              {/* Notches */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <g key={`left-notch-${angle}`} transform={`rotate(${angle})`}>
                  <path
                    d="M 30 -8 L 40 0 L 30 8 Z"
                    fill="#374151"
                  />
                </g>
              ))}
              {/* Center hub */}
              <circle cx="0" cy="0" r="10" fill="#1f2937" />
              <circle cx="0" cy="0" r="5" fill="#4b5563" />
            </motion.g>
          </g>

          {/* Soil spray particles - left side throws soil outward */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.circle
              key={`left-particle-${i}`}
              cx={-20 - i * 5}
              cy={10 + i * 3}
              r={3 - i * 0.4}
              fill="#8B7355"
              animate={{
                x: [-10, -40 - i * 10],
                y: [0, -20 + i * 8, 30],
                opacity: [0.8, 0.6, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </g>

        {/* Right disc assembly */}
        <g transform="translate(280, 175)">
          {/* Disc arm */}
          <rect x="-5" y="-60" width="10" height="60" fill="#374151" rx="2" />

          {/* Rotating notched disc - opposite direction */}
          <g>
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {/* Main disc */}
              <circle cx="0" cy="0" r="35" fill="#6b7280" stroke="#374151" strokeWidth="3" />
              {/* Notches */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <g key={`right-notch-${angle}`} transform={`rotate(${angle})`}>
                  <path
                    d="M 30 -8 L 40 0 L 30 8 Z"
                    fill="#374151"
                  />
                </g>
              ))}
              {/* Center hub */}
              <circle cx="0" cy="0" r="10" fill="#1f2937" />
              <circle cx="0" cy="0" r="5" fill="#4b5563" />
            </motion.g>
          </g>

          {/* Soil spray particles - right side throws soil outward */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.circle
              key={`right-particle-${i}`}
              cx={20 + i * 5}
              cy={10 + i * 3}
              r={3 - i * 0.4}
              fill="#8B7355"
              animate={{
                x: [10, 40 + i * 10],
                y: [0, -20 + i * 8, 30],
                opacity: [0.8, 0.6, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </g>

        {/* Direction arrow */}
        <g transform="translate(200, 40)">
          <motion.g
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path
              d="M 0 0 L -15 -20 L -8 -20 L -8 -40 L 8 -40 L 8 -20 L 15 -20 Z"
              fill="#059669"
              opacity="0.8"
            />
          </motion.g>
        </g>

        {/* Labels */}
        <text x="200" y="290" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="500">
          Notched discs cut weeds on both sides of the crop row
        </text>
      </svg>
    </div>
  );
}

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

  // Update active option when modal opens with different initial option
  React.useEffect(() => {
    if (isOpen) {
      setActiveOption(initialOption);
    }
  }, [isOpen, initialOption]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const weedOptions: WeedOptionId[] = ["standardWeeding", "combiTool", "weedCuttingDisc", "spraySystem"];

  // Image paths for each weed option (placeholder for now - user can add real images)
  const optionImages: Record<WeedOptionId, string[]> = {
    standardWeeding: ["/farmdroid-fd20.png"],
    combiTool: ["/farmdroid-fd20.png"],
    weedCuttingDisc: ["/farmdroid-fd20.png"],
    spraySystem: ["/farmdroid-fd20.png"],
  };

  const images = optionImages[activeOption];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Reset image index when switching options
  const handleOptionChange = (option: WeedOptionId) => {
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
            {/* Left: Image/Animation area */}
            <div className="relative flex-1 bg-stone-100 min-h-[250px] lg:min-h-0">
              <AnimatePresence mode="wait">
                {activeOption === "combiTool" ? (
                  /* Show animation for Combi Tool */
                  <motion.div
                    key="combiTool-animation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <CombiToolAnimation />
                  </motion.div>
                ) : (
                  /* Show image for other options */
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
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation arrows - only show for image galleries, not animations */}
              {activeOption !== "combiTool" && images.length > 1 && (
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

              {/* Image indicators - only show for image galleries */}
              {activeOption !== "combiTool" && images.length > 1 && (
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

              {/* Caption at bottom - only show for image galleries */}
              {activeOption !== "combiTool" && (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-lg md:text-xl font-medium">{t(`options.${activeOption}.name`)}</p>
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
                      onClick={() => handleOptionChange(option)}
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
                            <Check className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
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
                <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("standardWeedConfig.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("standardWeedConfig.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {standardWeedFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-700"
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
            onClick={() => handleWeedingToolChange(config.weedingTool === "combiTool" ? "none" : "combiTool")}
            className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border card-hover ml-3 md:ml-5 ${
              config.weedingTool === "combiTool"
                ? "selected"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
            style={{ width: "calc(100% - 0.75rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  config.weedingTool === "combiTool"
                    ? "bg-brand-500"
                    : "border-2 border-stone-300"
                }`}>
                  {config.weedingTool === "combiTool" && <Check className="h-3 w-3 text-white checkmark-animated" strokeWidth={3} />}
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">{t("combiTool.name")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("combiTool.description")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {combiToolFeatureKeys.map((key) => (
                      <span
                        key={key}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          config.weedingTool === "combiTool" ? "bg-brand-100 text-brand-700" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {t(`combiTool.features.${key}`)}
                      </span>
                    ))}
                  </div>
                  {config.weedingTool === "combiTool" && showPrices && (
                    <p className="text-xs text-stone-400 mt-2">
                      {t("combiTool.pricePerRow", { price: formatPrice(PRICES.accessories.combiToolPerRow, config.currency), count: config.activeRows })}
                    </p>
                  )}
                </div>
              </div>
              {showPrices && (
                <span className="text-sm font-semibold text-stone-900 ml-3">
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
                    ? "bg-brand-500"
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
            onClick={() => updateConfig({ spraySystem: !config.spraySystem })}
            className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border card-hover ${
              config.spraySystem
                ? "selected"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  config.spraySystem
                    ? "bg-brand-500"
                    : "border-2 border-stone-300"
                }`}>
                  {config.spraySystem && <Check className="h-3 w-3 text-white checkmark-animated" strokeWidth={3} />}
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
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          config.spraySystem ? "bg-brand-100 text-brand-700" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {t(`spray.features.${key}`)}
                      </span>
                    ))}
                  </div>
                  {config.spraySystem && showPrices && (
                    <div className="mt-3 pt-3 border-t border-brand-200 space-y-1 text-xs text-stone-400">
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
                <span className="text-sm font-semibold text-stone-900 ml-3">
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
