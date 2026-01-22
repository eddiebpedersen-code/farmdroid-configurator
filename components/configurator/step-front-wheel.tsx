"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ConfiguratorState,
  PriceBreakdown,
  FrontWheel,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";
import { useMode } from "@/contexts/ModeContext";

// Subtle gray blur placeholder for smooth image loading
const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjQiLz48L3N2Zz4=";

interface StepFrontWheelProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

interface WheelOption {
  id: FrontWheel;
  nameKey: string;
  subtitleKey: string;
  wheelCount: "3-wheel" | "4-wheel";
  price: number;
  descriptionKey: string;
}

// Info tooltip for individual options
function InfoTooltip({ description }: { description: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("wheelConfig");

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPosition(null);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            handleClose();
          } else {
            handleOpen();
          }
        }}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className="p-1.5 -m-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        aria-label={t("moreInfo")}
      >
        <Info className="h-4 w-4" />
      </button>
      {isOpen && position && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] w-72 pointer-events-none"
          style={{ top: position.top, left: position.left, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-stone-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
            {description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-stone-900" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// SVG robot illustration based on wheel config
function RobotIllustration({ wheelConfig }: { wheelConfig: FrontWheel }) {
  const is3Wheel = wheelConfig === "PFW" || wheelConfig === "AFW";
  const isActive = wheelConfig === "AFW";

  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto max-w-md">
      {/* Robot body */}
      <rect x="40" y="35" width="120" height="55" rx="6" fill="#059669" />
      {/* Solar panels */}
      <rect x="32" y="20" width="136" height="15" rx="3" fill="#10b981" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={48 + i * 32} y1="20" x2={48 + i * 32} y2="35" stroke="#047857" strokeWidth="1" />
      ))}
      {/* Back wheels */}
      <circle cx="60" cy="105" r="16" fill="#374151" />
      <circle cx="60" cy="105" r="9" fill="#6b7280" />
      <circle cx="140" cy="105" r="16" fill="#374151" />
      <circle cx="140" cy="105" r="9" fill="#6b7280" />
      {/* Front wheel(s) */}
      {is3Wheel ? (
        <>
          <circle cx="100" cy="118" r="12" fill="#374151" />
          <circle cx="100" cy="118" r="7" fill="#6b7280" />
          {isActive && (
            <motion.circle
              cx="100"
              cy="118"
              r="4"
              fill="#f59e0b"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </>
      ) : (
        <>
          <circle cx="60" cy="125" r="10" fill="#374151" />
          <circle cx="60" cy="125" r="6" fill="#6b7280" />
          <circle cx="140" cy="125" r="10" fill="#374151" />
          <circle cx="140" cy="125" r="6" fill="#6b7280" />
        </>
      )}
      {/* Row tools */}
      <rect x="50" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
      <rect x="70" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
      <rect x="125" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
      <rect x="145" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
    </svg>
  );
}

function WheelInfoPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations("wheelConfig");

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
            className="fixed inset-0 bg-black/20 z-40"
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">{t("infoPanel.title")}</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Intro */}
              <div className="text-sm text-stone-600 leading-relaxed">
                <p>{t("infoPanel.intro")}</p>
                <p className="mt-3">{t("infoPanel.adjustmentRange")}</p>
              </div>

              {/* Passive Front Wheel */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-stone-400" />
                  <h3 className="font-semibold text-stone-900">{t("infoPanel.passiveFrontWheel")}</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {t("options.pfw.description")}
                </p>
              </div>

              {/* Dual Front Wheel */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="font-semibold text-stone-900">{t("infoPanel.dualFrontWheel")}</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {t("options.dfw.description")}
                </p>
              </div>

              {/* Active Front Wheel */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="font-semibold text-stone-900">{t("infoPanel.activeFrontWheel")}</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {t("options.afw.description")}
                </p>
              </div>

              {/* Footer note */}
              <div className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500 italic">
                  {t("infoPanel.footer")}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const pfwImages = [
  { src: "/farmdroid-pfw-side.png", labelKey: "views.sideView" },
  { src: "/farmdroid-pfw.png", labelKey: "views.frontView" },
];

export function StepFrontWheel({ config, updateConfig }: StepFrontWheelProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [pfwViewIndex, setPfwViewIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const t = useTranslations("wheelConfig");
  const tCommon = useTranslations("common");
  const tBaseRobot = useTranslations("baseRobot");
  const { showPrices } = useMode();

  // Track when wheel selection changes to show loading state
  const handleWheelChange = (wheelId: FrontWheel) => {
    if (wheelId !== config.frontWheel) {
      setImageLoading(true);
      updateConfig({ frontWheel: wheelId });
    }
  };

  const wheelOptions: WheelOption[] = [
    {
      id: "PFW",
      nameKey: "options.pfw.name",
      subtitleKey: "options.pfw.subtitle",
      wheelCount: "3-wheel",
      price: 0,
      descriptionKey: "options.pfw.description",
    },
    {
      id: "AFW",
      nameKey: "options.afw.name",
      subtitleKey: "options.afw.subtitle",
      wheelCount: "3-wheel",
      price: PRICES.frontWheel.AFW,
      descriptionKey: "options.afw.description",
    },
    {
      id: "DFW",
      nameKey: "options.dfw.name",
      subtitleKey: "options.dfw.subtitle",
      wheelCount: "4-wheel",
      price: PRICES.frontWheel.DFW,
      descriptionKey: "options.dfw.description",
    },
  ];

  const selectedOption = wheelOptions.find(o => o.id === config.frontWheel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Main visualization */}
        <div className="flex-1 flex items-center justify-center py-4 md:py-8 relative">
          {/* Loading overlay */}
          <AnimatePresence>
            {imageLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/60 z-10"
              >
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={config.frontWheel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              {config.frontWheel === "AFW" ? (
                <div className="relative aspect-[16/10] w-full">
                  {/* Ground shadow */}
                  <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
                  <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
                  <div className="absolute bottom-[21%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />
                  <Image
                    src="/farmdroid-afw.png"
                    alt={`FarmDroid FD20 - ${t("options.afw.name")}`}
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    onLoad={() => setImageLoading(false)}
                  />
                </div>
              ) : config.frontWheel === "PFW" ? (
                <div className="relative">
                  <div className="relative aspect-[16/10] w-full">
                    {/* Ground shadow */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
                    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
                    <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pfwViewIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={pfwImages[pfwViewIndex].src}
                          alt={`FarmDroid FD20 - ${t("options.pfw.name")} - ${tBaseRobot(pfwImages[pfwViewIndex].labelKey)}`}
                          fill
                          priority
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 60vw"
                          placeholder="blur"
                          blurDataURL={blurDataURL}
                          onLoad={() => setImageLoading(false)}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {/* View switcher dots */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {pfwImages.map((img, index) => (
                      <button
                        key={img.src}
                        onClick={() => setPfwViewIndex(index)}
                        className="group relative p-2"
                        aria-label={tCommon("switchTo", { label: tBaseRobot(img.labelKey) })}
                      >
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            pfwViewIndex === index
                              ? "w-6 bg-stone-800"
                              : "w-2 bg-stone-300 hover:bg-stone-400"
                          }`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {tBaseRobot(img.labelKey)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : config.frontWheel === "DFW" ? (
                <div className="relative aspect-[16/10] w-full">
                  {/* Ground shadow */}
                  <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
                  <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
                  <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />
                  <Image
                    src="/images/wheels/dfw.png"
                    alt={`FarmDroid FD20 - ${t("options.dfw.name")}`}
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    onLoad={() => setImageLoading(false)}
                  />
                </div>
              ) : (
                <div className="max-w-lg mx-auto">
                  <RobotIllustration wheelConfig={config.frontWheel} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Config type indicator */}
        <div className="flex justify-center gap-6 md:gap-8 pt-4 md:pt-6 border-t border-stone-100">
          <button
            onClick={() => config.frontWheel === "DFW" && handleWheelChange("PFW")}
            className={`text-center transition-opacity ${config.frontWheel !== "DFW" ? "opacity-100" : "opacity-40 hover:opacity-60 cursor-pointer"}`}
          >
            <p className="text-base md:text-lg font-semibold text-stone-900">{t("configTypes.threeWheel")}</p>
            <p className="text-xs text-stone-500">{t("configTypes.openField")}</p>
          </button>
          <button
            onClick={() => config.frontWheel !== "DFW" && handleWheelChange("DFW")}
            className={`text-center transition-opacity ${config.frontWheel === "DFW" ? "opacity-100" : "opacity-40 hover:opacity-60 cursor-pointer"}`}
          >
            <p className="text-base md:text-lg font-semibold text-stone-900">{t("configTypes.fourWheel")}</p>
            <p className="text-xs text-stone-500">{t("configTypes.bedConfig")}</p>
          </button>
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
            <button
              onClick={() => setShowInfo(true)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label={t("learnMore")}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
        </div>

        {/* Info Panel */}
        <WheelInfoPanel isOpen={showInfo} onClose={() => setShowInfo(false)} />

        {/* Options */}
        <div className="space-y-3 md:space-y-4">
          {wheelOptions.map((option) => {
            const isSelected = config.frontWheel === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleWheelChange(option.id)}
                className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border card-hover ${
                  isSelected
                    ? "selected"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center checkmark-animated">
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <p className="font-medium text-stone-900 text-sm md:text-base">{t(option.nameKey)}</p>
                      <InfoTooltip description={t(option.descriptionKey)} />
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{t(option.subtitleKey)}</p>
                  </div>
                  {(option.price === 0 || showPrices) && (
                    <span className="text-sm md:text-base font-semibold text-stone-900 flex-shrink-0">
                      {option.price === 0 ? tCommon("standard") : `+${formatPrice(option.price, config.currency)}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info based on selection */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            {t(`selectionInfo.${config.frontWheel.toLowerCase()}`)}
          </p>
        </div>
      </div>
    </div>
  );
}
