"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { SeedSize } from "@/lib/configurator-data";

// Seed System Info Modal - with tabs like Tesla and card-style consistent with configurator
export function SeedInfoModal({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: SeedSize;
  onSelectSize: (size: SeedSize) => void;
}) {
  const t = useTranslations("rowConfig.seedInfoModal");
  const [activeTab, setActiveTab] = useState<SeedSize>(selectedSize);

  // Update active tab when modal opens with different selection
  useEffect(() => {
    if (isOpen) {
      setActiveTab(selectedSize);
    }
  }, [isOpen, selectedSize]);

  const seedSystems = [
    {
      id: "6mm" as SeedSize,
      image: "/seed-6mm.jpg",
    },
    {
      id: "14mm" as SeedSize,
      image: "/seed-14mm.jpg",
    },
  ];

  const currentSystem = seedSystems.find(s => s.id === activeTab) || seedSystems[0];
  const isCurrentSelected = selectedSize === activeTab;

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
            {/* Left: Image area */}
            <div className="relative flex-1 bg-stone-100 min-h-[200px] lg:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentSystem.image}
                    alt={t(`systems.${activeTab}.name`)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Caption at bottom of image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg md:text-xl font-medium">{t(`systems.${activeTab}.name`)}</p>
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

              {/* Tabs - like Tesla style */}
              <div className="flex border-b border-stone-200">
                {seedSystems.map((system) => {
                  const isActive = activeTab === system.id;
                  return (
                    <button
                      key={system.id}
                      onClick={() => setActiveTab(system.id)}
                      className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                        isActive
                          ? "text-stone-900"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      +Seed {system.id}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Intro */}
                <p className="text-sm text-stone-600 leading-relaxed">
                  {t(`systems.${activeTab}.description`)}
                </p>

                {/* Crop comparison table - matching service plan design */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-3 border-b border-stone-200">
                    <div className="p-3 bg-stone-50">
                      <span className="text-sm font-medium text-stone-500">{t("cropComparison")}</span>
                    </div>
                    <div className={`p-3 text-center transition-colors ${
                      activeTab === "6mm"
                        ? "bg-emerald-50 border-l-2 border-r-2 border-t-2 border-emerald-500"
                        : "bg-stone-50"
                    }`}>
                      <div className="text-sm font-semibold text-stone-900">+Seed 6mm</div>
                    </div>
                    <div className={`p-3 text-center transition-colors ${
                      activeTab === "14mm"
                        ? "bg-emerald-50 border-l-2 border-r-2 border-t-2 border-emerald-500 rounded-tr-xl"
                        : "bg-stone-50"
                    }`}>
                      <div className="text-sm font-semibold text-stone-900">+Seed 14mm</div>
                    </div>
                  </div>
                  {/* Crop rows */}
                  {[
                    { name: t("crops.carrots"), supports6mm: true, supports14mm: false },
                    { name: t("crops.flowers"), supports6mm: true, supports14mm: false },
                    { name: t("crops.onions"), supports6mm: true, supports14mm: true },
                    { name: t("crops.spinach"), supports6mm: true, supports14mm: true },
                    { name: t("crops.radish"), supports6mm: true, supports14mm: true },
                    { name: t("crops.sugarBeets"), supports6mm: true, supports14mm: true },
                    { name: t("crops.redBeets"), supports6mm: true, supports14mm: true },
                    { name: t("crops.lettuce"), supports6mm: true, supports14mm: true },
                    { name: t("crops.cabbage"), supports6mm: true, supports14mm: true },
                    { name: t("crops.beans"), supports6mm: false, supports14mm: true },
                    { name: t("crops.peas"), supports6mm: false, supports14mm: true },
                    { name: t("crops.corn"), supports6mm: false, supports14mm: true },
                    { name: t("crops.sunflowers"), supports6mm: false, supports14mm: true },
                  ].map((crop, idx, arr) => (
                    <div key={crop.name} className={`grid grid-cols-3 ${idx < arr.length - 1 ? "border-b border-stone-100" : ""}`}>
                      <div className="p-3 flex items-center">
                        <span className="text-sm text-stone-700">{crop.name}</span>
                      </div>
                      <div className={`p-3 flex items-center justify-center ${
                        activeTab === "6mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                      }`}>
                        {crop.supports6mm ? (
                          <Check className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <X className="h-5 w-5 text-stone-300" />
                        )}
                      </div>
                      <div className={`p-3 flex items-center justify-center ${
                        activeTab === "14mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                      }`}>
                        {crop.supports14mm ? (
                          <Check className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <X className="h-5 w-5 text-stone-300" />
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Footer row showing more crops available */}
                  <div className="grid grid-cols-3 border-t border-stone-200 bg-stone-50">
                    <div className="p-3">
                      <span className="text-sm text-stone-500 italic">{t("andMoreCrops")}</span>
                    </div>
                    <div className={`p-3 flex items-center justify-center ${
                      activeTab === "6mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-b-2 border-emerald-500" : ""
                    }`}>
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className={`p-3 flex items-center justify-center ${
                      activeTab === "14mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-b-2 border-emerald-500 rounded-br-xl" : ""
                    }`}>
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Specs comparison - matching service plan design */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-3 border-b border-stone-200">
                    <div className="p-3 bg-stone-50">
                      <span className="text-sm font-medium text-stone-500">{t("specifications")}</span>
                    </div>
                    <div className={`p-3 text-center transition-colors ${
                      activeTab === "6mm"
                        ? "bg-emerald-50 border-l-2 border-r-2 border-t-2 border-emerald-500"
                        : "bg-stone-50"
                    }`}>
                      <div className="text-sm font-semibold text-stone-900">+Seed 6mm</div>
                    </div>
                    <div className={`p-3 text-center transition-colors ${
                      activeTab === "14mm"
                        ? "bg-emerald-50 border-l-2 border-r-2 border-t-2 border-emerald-500 rounded-tr-xl"
                        : "bg-stone-50"
                    }`}>
                      <div className="text-sm font-semibold text-stone-900">+Seed 14mm</div>
                    </div>
                  </div>
                  {/* Spec rows */}
                  <div className="grid grid-cols-3 border-b border-stone-100">
                    <div className="p-3 flex items-center">
                      <span className="text-sm text-stone-700">{t("specs.hopperWidth")}</span>
                    </div>
                    <div className={`p-3 text-center ${
                      activeTab === "6mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                    }`}>
                      <span className="text-sm font-medium text-stone-900">21cm</span>
                    </div>
                    <div className={`p-3 text-center ${
                      activeTab === "14mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                    }`}>
                      <span className="text-sm font-medium text-stone-900">24cm</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-b border-stone-100">
                    <div className="p-3 flex items-center">
                      <span className="text-sm text-stone-700">{t("specs.maxSeedSize")}</span>
                    </div>
                    <div className={`p-3 text-center ${
                      activeTab === "6mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                    }`}>
                      <span className="text-sm font-medium text-stone-900">6mm</span>
                    </div>
                    <div className={`p-3 text-center ${
                      activeTab === "14mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-emerald-500" : ""
                    }`}>
                      <span className="text-sm font-medium text-stone-900">14mm</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div className="p-3 flex items-center">
                      <span className="text-sm text-stone-700">{t("specs.minRowSpacing")}</span>
                    </div>
                    <div className={`p-3 text-center ${
                      activeTab === "6mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-b-2 border-emerald-500" : ""
                    }`}>
                      <span className="text-sm font-medium text-stone-900">22.5cm</span>
                    </div>
                    <div className={`p-3 text-center ${
                      activeTab === "14mm" ? "bg-emerald-50/50 border-l-2 border-r-2 border-b-2 border-emerald-500 rounded-br-xl" : ""
                    }`}>
                      <span className="text-sm font-medium text-stone-900">25cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with action */}
              <div className="px-6 py-4 border-t border-stone-100 bg-white">
                {isCurrentSelected ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-100 text-stone-600 text-sm font-medium rounded-lg">
                    <Check className="h-4 w-4" />
                    {t("currentlySelected")}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSelectSize(activeTab);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    {t("selectSystem", { size: activeTab })}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
