"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Truck } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";

interface StepBaseRobotProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

export function StepBaseRobot({ config, priceBreakdown }: StepBaseRobotProps) {
  const [activeView, setActiveView] = useState(0);
  const t = useTranslations("baseRobot");
  const tCommon = useTranslations("common");

  const productViews = [
    { id: 1, src: "/farmdroid-fd20.png", label: t("views.sideView") },
  ];

  const specs = [
    { value: "12", unit: t("specs.rows"), label: t("specs.upTo") },
    { value: "12-24", unit: "h", label: t("specs.runtime") },
    { value: "1.6", unit: "kW", label: t("specs.solarPeakPower") },
    { value: "5.7", unit: "kWh", label: t("specs.lithiumBatteries") },
  ];

  const featureKeys = [
    "solarPower",
    "batteries",
    "gps",
    "autonomous",
    "remoteMonitoring",
    "premiumSubscription",
    "warranty",
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center py-8 relative">
          {/* White gradient background to help images blend */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-stone-50/30 to-white" />

          <div className="relative w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative aspect-[16/10] w-full"
              >
                {/* Ground shadow directly under the robot */}
                <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
                <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />

                <Image
                  src={productViews[activeView].src}
                  alt={`FarmDroid FD20 - ${productViews[activeView].label}`}
                  fill
                  className="object-contain drop-shadow-sm"
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                  style={{
                    mixBlendMode: "multiply",
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* View switcher dots - only show if multiple views */}
            {productViews.length > 1 && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {productViews.map((view, index) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(index)}
                    className="group relative p-2"
                    aria-label={tCommon("switchTo", { label: view.label })}
                  >
                    <motion.div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeView === index
                          ? "w-6 bg-stone-800"
                          : "w-2 bg-stone-300 hover:bg-stone-400"
                      }`}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {view.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12 pt-6 md:pt-12 border-t border-stone-100">
          {specs.map((spec, index) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-lg md:text-2xl font-semibold text-stone-900">
                {spec.value}
                <span className="text-sm md:text-base font-normal text-stone-400 ml-0.5">{spec.unit}</span>
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{spec.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("productTitle")}</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("productDescription")}</p>
        </div>

        {/* Robot Selection Card */}
        <div className="border border-stone-200 rounded-lg p-4 md:p-5 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-stone-900 text-sm md:text-base">{t("productTitle")}</p>
              <p className="text-xs md:text-sm text-stone-500 mt-0.5">{t("baseConfiguration")}</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className="text-base md:text-lg font-semibold text-stone-900">{formatPrice(PRICES.baseRobot, config.currency)}</span>
              <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="pt-4">
          <p className="text-sm font-medium text-stone-700 mb-3">{t("included")}</p>
          <ul className="space-y-2">
            {featureKeys.map((key, index) => (
              <motion.li
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                className="flex items-center gap-2.5 text-sm text-stone-600"
              >
                <div className="h-1 w-1 rounded-full bg-stone-400" />
                {t(`features.${key}`)}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Delivery Info */}
        <div className="pt-4 mt-4 border-t border-stone-100">
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-4 w-4 text-stone-400" />
            <div>
              <span className="text-stone-600">{t("delivery.label")} </span>
              <span className="font-medium text-stone-900">{t("delivery.value")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
