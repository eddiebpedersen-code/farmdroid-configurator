"use client";

import { motion } from "framer-motion";
import { Package, Truck, Link2, Check, Star } from "lucide-react";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";

interface StepAccessoriesProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

interface Accessory {
  id: keyof Pick<ConfiguratorState, "starterKit" | "roadTransport" | "fieldBracket">;
  name: string;
  description: string;
  price: number;
  icon: typeof Package;
  recommended?: boolean;
}

const accessories: Accessory[] = [
  {
    id: "starterKit",
    name: "Starter Kit",
    description: "Essential care package with base station V3 and field setup tools",
    price: PRICES.accessories.starterKit,
    icon: Package,
    recommended: true,
  },
  {
    id: "roadTransport",
    name: "Road Transport Platform",
    description: "Transport platform for moving FD20 between fields on public roads",
    price: PRICES.accessories.roadTransport,
    icon: Truck,
  },
  {
    id: "fieldBracket",
    name: "Field Bracket with Chain",
    description: "Secure mounting bracket for field positioning",
    price: PRICES.accessories.fieldBracket,
    icon: Link2,
  },
];

export function StepAccessories({ config, updateConfig }: StepAccessoriesProps) {
  const toggleAccessory = (id: Accessory["id"]) => {
    updateConfig({ [id]: !config[id] });
  };

  const selectedCount = accessories.filter((a) => config[a.id]).length;
  const totalAccessoriesPrice = accessories
    .filter((a) => config[a.id])
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Visualization - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Accessory grid visualization */}
        <div className="flex-1 py-4 md:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-3 md:gap-4 max-w-lg mx-auto"
          >
            {accessories.map((accessory, index) => {
              const isSelected = config[accessory.id];
              const Icon = accessory.icon;

              return (
                <motion.button
                  key={accessory.id}
                  onClick={() => toggleAccessory(accessory.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 md:p-6 rounded-lg border transition-all ${
                    isSelected
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-stone-900" : "bg-stone-100"
                    }`}>
                      <Icon className={`h-5 w-5 md:h-6 md:w-6 ${isSelected ? "text-white" : "text-stone-400"}`} />
                    </div>
                    <p className={`text-xs md:text-sm font-medium ${isSelected ? "text-stone-900" : "text-stone-500"}`}>
                      {accessory.name}
                    </p>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Summary row */}
        <div className="flex justify-center gap-8 md:gap-12 pt-4 md:pt-6 border-t border-stone-100">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-semibold text-stone-900">
              {selectedCount}
              <span className="text-sm md:text-base font-normal text-stone-400 ml-0.5">items</span>
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Selected</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-semibold text-stone-900">
              {formatPrice(totalAccessoriesPrice, config.currency)}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">Accessories</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">Additional equipment for your FarmDroid</p>
        </div>

        {/* Accessory list */}
        <div className="space-y-2 md:space-y-3">
          {accessories.map((accessory) => {
            const isSelected = config[accessory.id];

            return (
              <button
                key={accessory.id}
                onClick={() => toggleAccessory(accessory.id)}
                className={`w-full text-left p-4 md:p-5 rounded-lg border transition-all ${
                  isSelected
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <p className="font-medium text-stone-900 text-sm md:text-base">{accessory.name}</p>
                      {accessory.recommended && (
                        <span className="flex items-center gap-1 text-[10px] md:text-xs bg-amber-100 text-amber-700 px-1.5 md:px-2 py-0.5 rounded-full">
                          <Star className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          Recommended
                        </span>
                      )}
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-stone-500 mt-0.5">{accessory.description}</p>
                  </div>
                  <span className="text-sm md:text-base font-medium text-stone-900 flex-shrink-0">
                    +{formatPrice(accessory.price, config.currency)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info text */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            {selectedCount === 0
              ? "Accessories are optional. You can add them later through our service department."
              : `${selectedCount} accessory item${selectedCount > 1 ? "s" : ""} selected for ${formatPrice(totalAccessoriesPrice, config.currency)}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
