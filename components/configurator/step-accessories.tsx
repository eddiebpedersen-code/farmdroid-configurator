"use client";

import { motion } from "framer-motion";
import { Package, Truck, Link2, Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";
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

interface AccessoryConfig {
  id: keyof Pick<ConfiguratorState, "starterKit" | "roadTransport" | "fieldBracket">;
  translationKey: string;
  price: number;
  icon: typeof Package;
  recommended?: boolean;
}

const accessoryConfigs: AccessoryConfig[] = [
  {
    id: "starterKit",
    translationKey: "starterKit",
    price: PRICES.accessories.starterKit,
    icon: Package,
    recommended: true,
  },
  {
    id: "roadTransport",
    translationKey: "roadTransport",
    price: PRICES.accessories.roadTransport,
    icon: Truck,
  },
  {
    id: "fieldBracket",
    translationKey: "fieldBracket",
    price: PRICES.accessories.fieldBracket,
    icon: Link2,
  },
];

export function StepAccessories({ config, updateConfig }: StepAccessoriesProps) {
  const t = useTranslations("accessories");
  const toggleAccessory = (id: AccessoryConfig["id"]) => {
    updateConfig({ [id]: !config[id] });
  };

  const selectedCount = accessoryConfigs.filter((a) => config[a.id]).length;
  const totalAccessoriesPrice = accessoryConfigs
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
            {accessoryConfigs.map((accessory, index) => {
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
                      {t(`items.${accessory.translationKey}.name`)}
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
              <span className="text-sm md:text-base font-normal text-stone-400 ml-0.5">{t("itemsLabel")}</span>
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{t("selected")}</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-semibold text-stone-900">
              {formatPrice(totalAccessoriesPrice, config.currency)}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{t("total")}</p>
          </div>
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
        </div>

        {/* Accessory list */}
        <div className="space-y-2 md:space-y-3">
          {accessoryConfigs.map((accessory) => {
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
                      <p className="font-medium text-stone-900 text-sm md:text-base">{t(`items.${accessory.translationKey}.name`)}</p>
                      {accessory.recommended && (
                        <span className="flex items-center gap-1 text-[10px] md:text-xs bg-amber-100 text-amber-700 px-1.5 md:px-2 py-0.5 rounded-full">
                          <Star className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          {t("recommended")}
                        </span>
                      )}
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-stone-500 mt-0.5">{t(`items.${accessory.translationKey}.description`)}</p>
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
              ? t("emptyMessage")
              : selectedCount > 1
              ? t("selectedMessagePlural", { count: selectedCount, price: formatPrice(totalAccessoriesPrice, config.currency) })
              : t("selectedMessage", { count: selectedCount, price: formatPrice(totalAccessoriesPrice, config.currency) })}
          </p>
        </div>
      </div>
    </div>
  );
}
