"use client";

import { motion } from "framer-motion";
import { Check, X, Shield, Star, Headphones, Cpu, Cloud, Smartphone, Radio, Database, MapPin, RefreshCw, Zap } from "lucide-react";
import {
  ConfiguratorState,
  PriceBreakdown,
  ServicePlan,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";

interface StepServicePlanProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

interface Feature {
  name: string;
  icon: typeof Check;
  standard: boolean;
  premium: boolean;
}

const features: Feature[] = [
  { name: "Support centre (phone and email)", icon: Headphones, standard: true, premium: true },
  { name: "AI assistant and Knowledge Base", icon: Cpu, standard: true, premium: true },
  { name: "Software maintenance", icon: RefreshCw, standard: true, premium: true },
  { name: "FarmDroid App", icon: Smartphone, standard: true, premium: true },
  { name: "IoT connectivity (base station + robot)", icon: Radio, standard: true, premium: true },
  { name: "Field data backup", icon: Database, standard: true, premium: true },
  { name: "Base station survey", icon: MapPin, standard: true, premium: true },
  { name: "Connection to Agrirouter", icon: Cloud, standard: false, premium: true },
  { name: "Software upgrades", icon: Zap, standard: false, premium: true },
];

export function StepServicePlan({ config, updateConfig }: StepServicePlanProps) {
  const selectPlan = (plan: ServicePlan) => {
    updateConfig({ servicePlan: plan });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Comparison Table - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-stone-200">
            <div className="p-4 bg-stone-50">
              <span className="text-sm font-medium text-stone-500">Features</span>
            </div>
            <div
              className={`p-4 text-center transition-colors ${
                config.servicePlan === "standard"
                  ? "bg-teal-50 border-l-2 border-r-2 border-t-2 border-teal-500"
                  : "bg-stone-50"
              }`}
            >
              <div className="text-sm font-semibold text-stone-900">Care Standard</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {formatPrice(PRICES.servicePlan.standard, config.currency)}/year
              </div>
            </div>
            <div
              className={`p-4 text-center transition-colors relative ${
                config.servicePlan === "premium"
                  ? "bg-teal-50 border-l-2 border-r-2 border-t-2 border-teal-500 rounded-tr-xl"
                  : "bg-stone-50"
              }`}
            >
              <div className="text-sm font-semibold text-stone-900">Care Premium</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {formatPrice(PRICES.servicePlan.premium, config.currency)}/year
              </div>
            </div>
          </div>

          {/* Feature rows */}
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className={`grid grid-cols-3 ${
                  index < features.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <div className="p-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-stone-400 flex-shrink-0" />
                  <span className="text-sm text-stone-700">{feature.name}</span>
                </div>
                <div
                  className={`p-3 flex items-center justify-center ${
                    config.servicePlan === "standard" ? "bg-teal-50/50 border-l-2 border-r-2 border-teal-500" : ""
                  }`}
                >
                  {feature.standard ? (
                    <Check className="h-5 w-5 text-teal-600" />
                  ) : (
                    <X className="h-5 w-5 text-stone-300" />
                  )}
                </div>
                <div
                  className={`p-3 flex items-center justify-center ${
                    config.servicePlan === "premium" ? "bg-teal-50/50 border-l-2 border-r-2 border-teal-500" : ""
                  }`}
                >
                  {feature.premium ? (
                    <Check className="h-5 w-5 text-teal-600" />
                  ) : (
                    <X className="h-5 w-5 text-stone-300" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Billing note */}
          <div className="grid grid-cols-3 border-t border-stone-200 bg-stone-50">
            <div className="p-3">
              <span className="text-xs text-stone-500 italic">Billed annually</span>
            </div>
            <div className={`p-3 text-center ${config.servicePlan === "standard" ? "bg-teal-50/50 border-l-2 border-r-2 border-b-2 border-teal-500" : ""}`}>
              <span className="text-xs text-stone-500 italic">Billed annually</span>
            </div>
            <div className={`p-3 text-center ${config.servicePlan === "premium" ? "bg-teal-50/50 border-l-2 border-r-2 border-b-2 border-teal-500 rounded-br-xl" : ""}`}>
              <span className="text-xs text-teal-600 italic font-medium">
                1st year included
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: Plan Selection & Warranty - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 tracking-tight">
            Service & Warranty
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            Choose your support and protection plan
          </p>
        </div>

        {/* Plan Selection */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Service Plan</span>

          {/* Premium Option */}
          <button
            onClick={() => selectPlan("premium")}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              config.servicePlan === "premium"
                ? "border-teal-500 bg-teal-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900">Care Premium</span>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                    RECOMMENDED
                  </span>
                  {config.servicePlan === "premium" && (
                    <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Full support with software upgrades and Agrirouter
                </p>
              </div>
              <div className="text-right ml-4">
                <span className="text-sm text-stone-400 line-through">
                  {formatPrice(PRICES.servicePlan.premium, config.currency)}/yr
                </span>
                <p className="text-sm font-semibold text-teal-600">
                  {formatPrice(0, config.currency)} first year
                </p>
              </div>
            </div>
          </button>

          {/* Standard Option */}
          <button
            onClick={() => selectPlan("standard")}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              config.servicePlan === "standard"
                ? "border-teal-500 bg-teal-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900">Care Standard</span>
                  {config.servicePlan === "standard" && (
                    <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Essential support and maintenance
                </p>
              </div>
              <span className="text-sm font-semibold text-stone-900 ml-4">
                {formatPrice(PRICES.servicePlan.standard, config.currency)}/yr
              </span>
            </div>
          </button>

          {/* No Plan Option */}
          <button
            onClick={() => selectPlan("none")}
            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
              config.servicePlan === "none"
                ? "border-stone-400 bg-stone-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">No service plan</span>
              {config.servicePlan === "none" && (
                <div className="h-5 w-5 rounded-full bg-stone-400 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Warranty Extension */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-stone-600" />
            <span className="text-sm font-medium text-stone-700">Warranty Extension</span>
          </div>

          <button
            onClick={() => updateConfig({ warrantyExtension: !config.warrantyExtension })}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              config.warrantyExtension
                ? "border-teal-500 bg-teal-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900">
                    +2 Year Warranty Extension
                  </span>
                  {config.warrantyExtension && (
                    <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Covers parts and replacement. Requires FD20 to be serviced annually.
                </p>
              </div>
              <span className="text-sm font-semibold text-stone-900 ml-4">
                {formatPrice(PRICES.warrantyExtension, config.currency)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
