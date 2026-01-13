"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";

interface StepSpraySystemProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

export function StepSpraySystem({ config, updateConfig }: StepSpraySystemProps) {
  const sprayPrice = PRICES.spraySystem.base + (config.activeRows * PRICES.spraySystem.perRow);

  const sprayFeatures = [
    "110L tank capacity",
    "Precision nozzles per row",
    "GPS-guided application",
    "Variable rate control",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Main visualization */}
        <div className="flex-1 flex items-center justify-center py-4 md:py-8">
          <motion.div
            key={config.spraySystem ? "spray" : "no-spray"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <svg viewBox="0 0 200 160" className="w-full h-auto">
              {/* Robot body */}
              <rect x="40" y="50" width="120" height="60" rx="8" fill="#059669" />
              <rect x="30" y="32" width="140" height="18" rx="4" fill="#10b981" />
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1={50 + i * 32} y1="32" x2={50 + i * 32} y2="50" stroke="#047857" strokeWidth="2" />
              ))}

              {/* Wheels */}
              <circle cx="60" cy="125" r="16" fill="#374151" />
              <circle cx="60" cy="125" r="9" fill="#6b7280" />
              <circle cx="140" cy="125" r="16" fill="#374151" />
              <circle cx="140" cy="125" r="9" fill="#6b7280" />
              <circle cx="100" cy="135" r="10" fill="#374151" />
              <circle cx="100" cy="135" r="6" fill="#6b7280" />

              {/* Spray system */}
              {config.spraySystem && (
                <motion.g
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Tank */}
                  <rect x="70" y="10" width="60" height="22" rx="4" fill="#3b82f6" />
                  <text x="100" y="25" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
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

        {/* Status indicator */}
        <div className="flex justify-center gap-6 md:gap-8 pt-4 md:pt-6 border-t border-stone-100">
          <div className={`text-center ${!config.spraySystem ? "opacity-100" : "opacity-40"}`}>
            <p className="text-base md:text-lg font-semibold text-stone-900">Mechanical Only</p>
            <p className="text-xs text-stone-500">Weeding without spray</p>
          </div>
          <div className={`text-center ${config.spraySystem ? "opacity-100" : "opacity-40"}`}>
            <p className="text-base md:text-lg font-semibold text-stone-900">+SPRAY</p>
            <p className="text-xs text-stone-500">Precision application</p>
          </div>
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">Weeding Configuration</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">Add precision spraying capability</p>
        </div>

        {/* Options */}
        <div className="space-y-2 md:space-y-3">
          {/* No Spray */}
          <button
            onClick={() => updateConfig({ spraySystem: false })}
            className={`w-full text-left p-4 md:p-5 rounded-lg border transition-all ${
              !config.spraySystem
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <p className="font-medium text-stone-900 text-sm md:text-base">No Spray System</p>
                  {!config.spraySystem && (
                    <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5">Mechanical weeding only - ideal for organic farming</p>
              </div>
              <span className="text-sm md:text-base font-medium text-stone-900 flex-shrink-0">Included</span>
            </div>
          </button>

          {/* With Spray */}
          <button
            onClick={() => updateConfig({ spraySystem: true })}
            className={`w-full text-left p-4 md:p-5 rounded-lg border transition-all ${
              config.spraySystem
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <p className="font-medium text-stone-900 text-sm md:text-base">+SPRAY System</p>
                  {config.spraySystem && (
                    <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5">Precision spraying with GPS guidance</p>
              </div>
              <span className="text-sm md:text-base font-medium text-stone-900 flex-shrink-0">+{formatPrice(sprayPrice, config.currency)}</span>
            </div>

            {config.spraySystem && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-stone-200"
              >
                {/* Price breakdown */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Base system</span>
                    <span>{formatPrice(PRICES.spraySystem.base, config.currency)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{config.activeRows} row nozzles</span>
                    <span>{formatPrice(config.activeRows * PRICES.spraySystem.perRow, config.currency)}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sprayFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </button>
        </div>

        {/* Info text */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            {config.spraySystem
              ? "The +SPRAY system enables targeted herbicide application with GPS precision, reducing chemical usage by up to 90%."
              : "Without spray, the robot focuses on mechanical weeding, perfect for organic certification requirements."}
          </p>
        </div>
      </div>
    </div>
  );
}
