"use client";

import { motion } from "framer-motion";
import { Check, Wrench } from "lucide-react";
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
  const combiToolPrice = config.activeRows * PRICES.accessories.combiToolPerRow;

  const sprayFeatures = [
    "110L tank capacity",
    "Precision nozzles per row",
    "GPS-guided application",
    "Variable rate control",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex items-center justify-center">
        <motion.div
          key={`${config.spraySystem}-${config.combiTool}`}
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
            {config.combiTool && (
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
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">+Weed Configuration</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">Configure your weeding setup</p>
        </div>

        {/* Mechanical Weeding Section */}
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">Mechanical Weeding</p>

          {/* Standard +Weed Config - Always included */}
          <div className="p-3 md:p-4 rounded-lg border border-stone-900 bg-stone-50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm md:text-base">Standard +Weed Config</p>
                  <p className="text-xs text-stone-500 mt-0.5">Included with every FarmDroid</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Weeding Wires", "Knife for Inrow"].map((feature) => (
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

          {/* Combi Tool Add-on */}
          <button
            onClick={() => updateConfig({ combiTool: !config.combiTool })}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ml-2 md:ml-4 ${
              config.combiTool
                ? "border-stone-900 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
            style={{ width: "calc(100% - 0.5rem)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  config.combiTool
                    ? "bg-stone-900"
                    : "border-2 border-stone-300"
                }`}>
                  {config.combiTool && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 text-sm md:text-base">+ Combi Tool</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Multi-purpose tool attachment for enhanced weeding</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Finger weeding", "Ridging", "Per active row"].map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  {config.combiTool && (
                    <p className="text-xs text-stone-400 mt-2">
                      {formatPrice(PRICES.accessories.combiToolPerRow, config.currency)} × {config.activeRows} rows
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-stone-900 ml-3">
                +{formatPrice(combiToolPrice, config.currency)}
              </span>
            </div>
          </button>
        </div>

        {/* Spray System Section */}
        <div className="space-y-2 md:space-y-3 pt-2">
          <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">+Spray System</p>

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
                    <p className="font-medium text-stone-900 text-sm md:text-base">+SPRAY System</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Precision spraying with GPS guidance</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sprayFeatures.map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  {config.spraySystem && (
                    <div className="mt-3 pt-3 border-t border-stone-200 space-y-1 text-xs text-stone-400">
                      <div className="flex justify-between">
                        <span>Base system</span>
                        <span>{formatPrice(PRICES.spraySystem.base, config.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{config.activeRows} row nozzles</span>
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
          {config.spraySystem && config.combiTool
            ? "Full weeding setup with mechanical tools and precision spraying for maximum weed control."
            : config.spraySystem
            ? "The +SPRAY system enables targeted herbicide application with GPS precision, reducing chemical usage by up to 90%."
            : config.combiTool
            ? "Enhanced mechanical weeding with Combi Tool attachments for improved soil management and weed control."
            : "Standard mechanical weeding configuration, perfect for organic certification requirements."}
        </p>
      </div>
    </div>
  );
}
