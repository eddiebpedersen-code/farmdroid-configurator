"use client";

import { motion } from "framer-motion";
import { Check, Battery, Zap } from "lucide-react";
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

export function StepPowerSource({ config, updateConfig }: StepPowerSourceProps) {
  const hasGenerator = config.powerSource === "hybrid";
  const hasPowerBank = config.powerBank && !hasGenerator;

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
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">Power Source</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">Choose your power configuration</p>
        </div>

        {/* Pure Electric Section */}
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">Pure Electric</p>

          {/* Solar Base */}
          <div className="p-3 md:p-4 rounded-lg border border-stone-900 bg-stone-50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">Solar</p>
                  <p className="text-xs text-stone-500 mt-0.5">Standard: 12-24h daily operation</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["1.6 kW solar panels", "5.7 kWh battery", "Zero emission"].map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900">Included</span>
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
                    <p className="font-medium text-stone-900 text-sm md:text-base">+ Power Bank</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Extended: Adds ~10h daily operation</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["5.7 kWh extra capacity", "11.4 kWh total", "Charged externally", "Smart Solar Charging"].map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {feature}
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
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">Hybrid Power</p>

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
                    <p className="font-medium text-stone-900 text-sm md:text-base">Solar + Generator</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Maximum: 24h+ continuous operation</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["1.6 kW solar panels", "5.7 kWh battery", "Generator backup", "All-weather operation"].map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {feature}
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
            ? "Hybrid configuration adds generator backup for maximum uptime in all conditions."
            : hasPowerBank
            ? "Extended electric operation with double battery capacity - stays fully emission-free."
            : "Pure solar power provides clean, quiet operation ideal for most farming conditions."}
        </p>
      </div>
    </div>
  );
}
