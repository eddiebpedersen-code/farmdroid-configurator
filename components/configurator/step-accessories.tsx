"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, Link2, Check, Star, Radio, Wifi, Wrench, Weight, Box, Info, X, ChevronLeft, ChevronRight, Grid3X3, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  getPrices,
  isIncludedInStarterKit,
} from "@/lib/configurator-data";
import { useMode } from "@/contexts/ModeContext";

// Subtle gray blur placeholder for smooth image loading
const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjQiLz48L3N2Zz4=";

interface StepAccessoriesProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

type AccessoryId =
  | "starterKit"
  | "fstFieldSetupTool"
  | "baseStationV3"
  | "essentialCarePackage"
  | "essentialCareSpray"
  | "fieldBracket"
  | "roadTransport"
  | "additionalWeightKit"
  | "toolbox";

interface AccessoryConfig {
  id: AccessoryId;
  translationKey: string;
  icon: typeof Package;
  recommended?: boolean;
  includedInStarterKit?: boolean;
  requiresSpraySystem?: boolean;
}

// Bundles group
const bundleConfigs: AccessoryConfig[] = [
  {
    id: "starterKit",
    translationKey: "starterKit",
    icon: Package,
    recommended: true,
  },
];

// Connectivity group
const connectivityConfigs: AccessoryConfig[] = [
  {
    id: "baseStationV3",
    translationKey: "baseStationV3",
    icon: Wifi,
    includedInStarterKit: true,
  },
  {
    id: "fstFieldSetupTool",
    translationKey: "fstFieldSetupTool",
    icon: Radio,
    includedInStarterKit: true,
  },
];

// Transport group
const transportConfigs: AccessoryConfig[] = [
  {
    id: "fieldBracket",
    translationKey: "fieldBracket",
    icon: Link2,
    includedInStarterKit: true,
  },
  {
    id: "roadTransport",
    translationKey: "roadTransport",
    icon: Truck,
  },
];

// Maintenance group
const maintenanceConfigs: AccessoryConfig[] = [
  {
    id: "essentialCarePackage",
    translationKey: "essentialCarePackage",
    icon: Wrench,
    includedInStarterKit: true,
  },
  {
    id: "essentialCareSpray",
    translationKey: "essentialCareSpray",
    icon: Wrench,
    requiresSpraySystem: true,
  },
  {
    id: "additionalWeightKit",
    translationKey: "additionalWeightKit",
    icon: Weight,
  },
  {
    id: "toolbox",
    translationKey: "toolbox",
    icon: Box,
  },
];

// All extras combined for calculations
const allExtraConfigs: AccessoryConfig[] = [
  ...connectivityConfigs,
  ...transportConfigs,
  ...maintenanceConfigs,
];

type GroupType = "bundles" | "connectivity" | "transport" | "maintenance";

// Info Modal Component for Accessories Groups
function AccessoriesInfoModal({
  isOpen,
  onClose,
  group,
}: {
  isOpen: boolean;
  onClose: () => void;
  group: GroupType;
}) {
  const t = useTranslations("accessories.infoModals");

  const getGroupItems = (groupType: GroupType): string[] => {
    switch (groupType) {
      case "bundles":
        return ["fstFieldSetupTool", "baseStationV3", "essentialCarePackage", "fieldBracket"];
      case "connectivity":
        return ["baseStationV3", "fstFieldSetupTool"];
      case "transport":
        return ["fieldBracket", "roadTransport"];
      case "maintenance":
        return ["essentialCarePackage", "additionalWeightKit", "toolbox"];
      default:
        return [];
    }
  };

  const items = getGroupItems(group);
  const [activeItem, setActiveItem] = useState(items[0]);
  const [bundleImageIndex, setBundleImageIndex] = useState(0);

  // Items included in Starter Kit
  const starterKitItems = ["fstFieldSetupTool", "baseStationV3", "essentialCarePackage", "fieldBracket"];
  const isInStarterKit = (item: string) => starterKitItems.includes(item);

  // Reset active item when group changes
  useEffect(() => {
    setActiveItem(getGroupItems(group)[0]);
    setBundleImageIndex(0);
  }, [group]);

  // Image paths for each product
  const itemImages: Record<string, string> = {
    starterKit: "/accessories/starter-kit.jpg",
    fstFieldSetupTool: "/accessories/fst-field-setup-tool.png",
    baseStationV3: "/accessories/base-station-v3.jpg",
    essentialCarePackage: "/accessories/essential-care-package.jpg",
    fieldBracket: "/accessories/field-bracket.jpg",
    roadTransport: "/accessories/road-transport.jpg",
    additionalWeightKit: "/accessories/additional-weight-kit.jpg",
    toolbox: "/accessories/toolbox.jpg",
  };

  // For bundles, dynamically get images from included items
  const bundleImages = starterKitItems.map(item => ({
    src: itemImages[item],
    itemKey: item
  }));

  const nextBundleImage = () => {
    setBundleImageIndex((prev) => (prev + 1) % bundleImages.length);
  };

  const prevBundleImage = () => {
    setBundleImageIndex((prev) => (prev - 1 + bundleImages.length) % bundleImages.length);
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
            className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col lg:flex-row"
          >
            {/* Left: Image area */}
            <div className="relative flex-1 bg-stone-100 min-h-[200px] lg:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={group === "bundles" ? `bundle-${bundleImageIndex}` : activeItem}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={group === "bundles" ? bundleImages[bundleImageIndex].src : itemImages[activeItem]}
                    alt={group === "bundles" ? t(`items.${bundleImages[bundleImageIndex].itemKey}.name`) : t(`items.${activeItem}.name`)}
                    fill
                    className="object-contain bg-stone-50"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows for bundles */}
              {group === "bundles" && bundleImages.length > 1 && (
                <>
                  <button
                    onClick={prevBundleImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextBundleImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image indicators for bundles */}
              {group === "bundles" && bundleImages.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                  {bundleImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBundleImageIndex(idx)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        idx === bundleImageIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Caption at bottom of image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg md:text-xl font-medium">
                  {group === "bundles" ? t(`items.${bundleImages[bundleImageIndex].itemKey}.name`) : t(`items.${activeItem}.name`)}
                </p>
                {group === "bundles" && (
                  <p className="text-sm text-white/70 mt-1">
                    {bundleImageIndex + 1} / {bundleImages.length}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Info panel */}
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white">
              {/* Header with close button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-900">{t(`${group}.title`)}</h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs for non-bundle groups */}
              {group !== "bundles" && (
                <div className="flex border-b border-stone-200 overflow-x-auto">
                  {items.map((item) => {
                    const isActive = activeItem === item;
                    const inStarterKit = isInStarterKit(item);
                    return (
                      <button
                        key={item}
                        onClick={() => setActiveItem(item)}
                        className={`flex-1 min-w-0 py-3 px-3 text-xs font-medium transition-colors relative whitespace-nowrap ${
                          isActive
                            ? "text-stone-900"
                            : "text-stone-500 hover:text-stone-700"
                        }`}
                      >
                        <span className="truncate block">
                          {t(`items.${item}.name`)}
                          {inStarterKit && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeProductTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* For bundles: show what's included */}
                {group === "bundles" && (
                  <>
                    {/* Intro */}
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {t("bundles.description")}
                    </p>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-stone-900">{t("includedItems")}</h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-stone-900">{t(`items.${item}.name`)}</p>
                              <p className="text-xs text-stone-500 mt-0.5">{t(`items.${item}.description`)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips section for bundles */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">{t("bundles.tip.label")}</span>{" "}
                        {t("bundles.tip.text")}
                      </p>
                    </div>
                  </>
                )}

                {/* For other groups: show detailed product info */}
                {group !== "bundles" && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-stone-900">{t(`items.${activeItem}.name`)}</h3>
                          {isInStarterKit(activeItem) && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              <Package className="h-3 w-3" />
                              {t("starterKitBadge")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                          {t(`items.${activeItem}.description`)}
                        </p>
                      </div>

                      {/* Features/specs list if available */}
                      {t.raw(`items.${activeItem}.features`) && (
                        <div className="space-y-2 pt-2">
                          <h4 className="text-sm font-medium text-stone-900">{t("features")}</h4>
                          <ul className="space-y-2">
                            {(t.raw(`items.${activeItem}.features`) as string[])?.map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
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

// Info button component for group headers
function GroupInfoButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("accessories.infoModals");

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors group py-2"
    >
      <span className="flex items-center justify-center h-5 w-5 rounded-full border border-stone-300 group-hover:border-stone-400 group-hover:bg-stone-100 transition-colors">
        <Info className="h-3 w-3" />
      </span>
      <span className="underline underline-offset-2">{t("learnMore")}</span>
    </button>
  );
}

type ViewMode = "grid" | "photos";

export function StepAccessories({ config, updateConfig }: StepAccessoriesProps) {
  const t = useTranslations("accessories");
  const [activeModal, setActiveModal] = useState<GroupType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { showPrices } = useMode();
  const prices = getPrices(config.currency);

  // Helper to get the price of an accessory from the dynamic prices object
  const getAccessoryPrice = (id: AccessoryId): number => {
    return prices.accessories[id] ?? 0;
  };

  const toggleAccessory = (id: AccessoryId) => {
    if (id === "starterKit") {
      // When toggling Starter Kit, also reset the included items
      const newStarterKitValue = !config.starterKit;
      if (newStarterKitValue) {
        // Turning ON Starter Kit - no need to change individual items (they show as included visually)
        updateConfig({ starterKit: true });
      } else {
        // Turning OFF Starter Kit - reset all included items to false
        updateConfig({
          starterKit: false,
          fstFieldSetupTool: false,
          baseStationV3: false,
          essentialCarePackage: false,
          fieldBracket: false,
        });
      }
    } else {
      updateConfig({ [id]: !config[id as keyof ConfiguratorState] });
    }
  };

  // Check if an item is disabled due to Starter Kit selection
  const isDisabledByStarterKit = (accessory: AccessoryConfig) => {
    return config.starterKit && accessory.includedInStarterKit;
  };

  // Check if Essential Care Spray is auto-included (spray system + starter kit or essential care package)
  const isEssentialCareSprayAutoIncluded = () => {
    return config.spraySystem && (config.starterKit || config.essentialCarePackage);
  };

  // Check if an item is auto-included with Essential Care
  const isAutoIncludedWithCare = (accessory: AccessoryConfig) => {
    return accessory.id === "essentialCareSpray" && isEssentialCareSprayAutoIncluded();
  };

  // Check if an item should be hidden (requires spray system but not enabled)
  const shouldHideItem = (accessory: AccessoryConfig) => {
    return accessory.requiresSpraySystem && !config.spraySystem;
  };

  // Filter each group to only show relevant items
  const visibleConnectivity = connectivityConfigs.filter(a => !shouldHideItem(a));
  const visibleTransport = transportConfigs.filter(a => !shouldHideItem(a));
  const visibleMaintenance = maintenanceConfigs.filter(a => !shouldHideItem(a));
  const visibleExtras = [...visibleConnectivity, ...visibleTransport, ...visibleMaintenance];

  // Product photos for carousel - map accessory IDs to their images
  const accessoryImages: Record<string, { src: string; name: string }> = {
    starterKit: { src: "/farmdroid-fd20.png", name: t("items.starterKit.name") },
    fstFieldSetupTool: { src: "/farmdroid-fd20.png", name: t("items.fstFieldSetupTool.name") },
    baseStationV3: { src: "/farmdroid-fd20.png", name: t("items.baseStationV3.name") },
    essentialCarePackage: { src: "/farmdroid-fd20.png", name: t("items.essentialCarePackage.name") },
    essentialCareSpray: { src: "/farmdroid-fd20.png", name: t("items.essentialCareSpray.name") },
    fieldBracket: { src: "/farmdroid-fd20.png", name: t("items.fieldBracket.name") },
    roadTransport: { src: "/farmdroid-fd20.png", name: t("items.roadTransport.name") },
    additionalWeightKit: { src: "/farmdroid-fd20.png", name: t("items.additionalWeightKit.name") },
    toolbox: { src: "/farmdroid-fd20.png", name: t("items.toolbox.name") },
  };

  // Get list of selected/included accessories for the photo carousel
  const getSelectedAccessories = () => {
    const selected: { id: string; src: string; name: string }[] = [];

    // Add starter kit if selected
    if (config.starterKit) {
      selected.push({ id: "starterKit", ...accessoryImages.starterKit });
    }

    // Add individually selected items (not covered by starter kit)
    allExtraConfigs.forEach((accessory) => {
      const isSelected = config[accessory.id as keyof ConfiguratorState];
      const isDisabled = isDisabledByStarterKit(accessory);
      const isAutoIncluded = isAutoIncludedWithCare(accessory);

      if ((isSelected || isDisabled || isAutoIncluded) && accessoryImages[accessory.id]) {
        // Don't duplicate if already added via starter kit
        if (!selected.find(s => s.id === accessory.id)) {
          selected.push({ id: accessory.id, ...accessoryImages[accessory.id] });
        }
      }
    });

    return selected;
  };

  const selectedAccessoryPhotos = getSelectedAccessories();

  // Reset photo index when selection changes
  useEffect(() => {
    if (currentPhotoIndex >= selectedAccessoryPhotos.length) {
      setCurrentPhotoIndex(Math.max(0, selectedAccessoryPhotos.length - 1));
    }
  }, [selectedAccessoryPhotos.length, currentPhotoIndex]);

  const nextPhoto = () => {
    if (selectedAccessoryPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % selectedAccessoryPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedAccessoryPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + selectedAccessoryPhotos.length) % selectedAccessoryPhotos.length);
    }
  };

  // Calculate selected count and total price
  const allAccessories = [...bundleConfigs, ...visibleExtras];
  const selectedCount = allAccessories.filter((a) => {
    if (isDisabledByStarterKit(a)) return false; // Don't count items included in starter kit
    return config[a.id as keyof ConfiguratorState];
  }).length + (config.starterKit ? 1 : 0);

  const totalAccessoriesPrice = allAccessories.reduce((sum, a) => {
    if (isDisabledByStarterKit(a)) return sum; // Don't add price for items included in starter kit
    if (config[a.id as keyof ConfiguratorState]) {
      return sum + getAccessoryPrice(a.id);
    }
    return sum;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Visualization - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        {/* View switcher tabs */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            {t("viewGrid")}
          </button>
          <button
            onClick={() => setViewMode("photos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              viewMode === "photos"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {t("viewPhotos")}
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 py-4 md:py-8 relative">
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              /* Accessory grid visualization */
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-2 md:gap-3 max-w-lg mx-auto"
              >
                {allAccessories.slice(0, 9).map((accessory, index) => {
                  const isSelected = config[accessory.id as keyof ConfiguratorState];
                  const isDisabled = isDisabledByStarterKit(accessory);
                  const isAutoIncluded = isAutoIncludedWithCare(accessory);
                  const isIncludedOrDisabled = isDisabled || isAutoIncluded;
                  const Icon = accessory.icon;

                  return (
                    <motion.button
                      key={accessory.id}
                      onClick={() => !isIncludedOrDisabled && toggleAccessory(accessory.id)}
                      disabled={isIncludedOrDisabled}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 md:p-4 rounded-xl border transition-all ${
                        isIncludedOrDisabled
                          ? "border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-1 md:gap-2">
                        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${
                          isIncludedOrDisabled
                            ? "bg-stone-200"
                            : isSelected
                            ? "bg-emerald-500"
                            : "bg-stone-100"
                        }`}>
                          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${
                            isIncludedOrDisabled
                              ? "text-stone-400"
                              : isSelected
                              ? "text-white"
                              : "text-stone-400"
                          }`} />
                        </div>
                        <p className={`text-[10px] md:text-xs font-medium line-clamp-2 ${
                          isIncludedOrDisabled
                            ? "text-stone-400"
                            : isSelected
                            ? "text-stone-900"
                            : "text-stone-500"
                        }`}>
                          {t(`items.${accessory.translationKey}.name`)}
                        </p>
                        <div
                          className={`h-4 w-4 md:h-5 md:w-5 rounded-full flex items-center justify-center transition-opacity ${
                            (isSelected || isIncludedOrDisabled) ? "opacity-100" : "opacity-0"
                          } ${isIncludedOrDisabled ? "bg-stone-400" : "bg-emerald-500"}`}
                        >
                          <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              /* Product photos carousel */
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="max-w-lg mx-auto"
              >
                {selectedAccessoryPhotos.length > 0 ? (
                  <div className="relative">
                    {/* Main image */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPhotoIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={selectedAccessoryPhotos[currentPhotoIndex]?.src || "/farmdroid-fd20.png"}
                            alt={selectedAccessoryPhotos[currentPhotoIndex]?.name || "Accessory"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 500px"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </motion.div>
                      </AnimatePresence>

                      {/* Navigation arrows */}
                      {selectedAccessoryPhotos.length > 1 && (
                        <>
                          <button
                            onClick={prevPhoto}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextPhoto}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 transition-colors shadow-lg"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Caption */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-base md:text-lg font-medium">
                          {selectedAccessoryPhotos[currentPhotoIndex]?.name}
                        </p>
                        <p className="text-xs text-white/70 mt-0.5">
                          {currentPhotoIndex + 1} / {selectedAccessoryPhotos.length}
                        </p>
                      </div>
                    </div>

                    {/* Thumbnail indicators */}
                    {selectedAccessoryPhotos.length > 1 && (
                      <div className="flex justify-center gap-1.5 mt-3">
                        {selectedAccessoryPhotos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentPhotoIndex(idx)}
                            className={`h-2 w-2 rounded-full transition-colors ${
                              idx === currentPhotoIndex
                                ? "bg-stone-900"
                                : "bg-stone-300 hover:bg-stone-400"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="aspect-[4/3] rounded-xl bg-stone-100 flex flex-col items-center justify-center text-stone-400">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <p className="text-sm">{t("noAccessoriesSelected")}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
          {showPrices && (
            <div className="text-center">
              <p className="text-xl md:text-2xl font-semibold text-stone-900">
                {formatPrice(totalAccessoriesPrice, config.currency)}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{t("total")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
        </div>

        {/* Bundles & Kits Group */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("groups.bundles")}</p>
            <GroupInfoButton onClick={() => setActiveModal("bundles")} />
          </div>

          {bundleConfigs.map((accessory) => {
            const isSelected = config[accessory.id as keyof ConfiguratorState];

            return (
              <button
                key={accessory.id}
                onClick={() => toggleAccessory(accessory.id)}
                className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border card-hover ${
                  isSelected
                    ? "selected"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 md:gap-3 flex-wrap">
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center checkmark-animated">
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <p className="font-medium text-stone-900 text-sm md:text-base">{t(`items.${accessory.translationKey}.name`)}</p>
                      {accessory.recommended && (
                        <span className="flex items-center gap-1 text-[10px] md:text-xs bg-amber-100 text-amber-700 px-1.5 md:px-2 py-0.5 rounded-full">
                          <Star className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          {t("recommended")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-stone-500 mt-1">{t(`items.${accessory.translationKey}.description`)}</p>
                    <p className="text-xs text-emerald-600 mt-2">{t("starterKitIncludes")}</p>
                  </div>
                  {showPrices && (
                    <span className="text-sm md:text-base font-semibold text-stone-900 flex-shrink-0">
                      +{formatPrice(getAccessoryPrice(accessory.id), config.currency)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Connectivity Group */}
        {visibleConnectivity.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("groups.connectivity")}</p>
              <GroupInfoButton onClick={() => setActiveModal("connectivity")} />
            </div>

            {visibleConnectivity.map((accessory) => {
              const isSelected = config[accessory.id as keyof ConfiguratorState];
              const isDisabled = isDisabledByStarterKit(accessory);
              const isAutoIncluded = isAutoIncludedWithCare(accessory);
              const isIncludedOrDisabled = isDisabled || isAutoIncluded;

              return (
                <button
                  key={accessory.id}
                  onClick={() => !isIncludedOrDisabled && toggleAccessory(accessory.id)}
                  disabled={isIncludedOrDisabled}
                  className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border ${!isIncludedOrDisabled && "card-hover"} ${
                    isIncludedOrDisabled
                      ? "border-stone-200 bg-stone-50 cursor-not-allowed"
                      : isSelected
                      ? "selected"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        {(isSelected || isIncludedOrDisabled) && (
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isIncludedOrDisabled ? "bg-stone-400" : "bg-emerald-500 checkmark-animated"}`}>
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <p className={`font-medium text-sm md:text-base ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-900"}`}>
                          {t(`items.${accessory.translationKey}.name`)}
                        </p>
                      </div>
                      {accessory.includedInStarterKit && (
                        <span className="inline-block text-[10px] md:text-xs bg-emerald-100 text-emerald-700 px-1.5 md:px-2 py-0.5 rounded-full mt-1.5">
                          {t("includedInStarterKit")}
                        </span>
                      )}
                      <p className={`text-xs md:text-sm mt-1 ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-500"}`}>
                        {t(`items.${accessory.translationKey}.description`)}
                      </p>
                    </div>
                    <span className={`text-sm md:text-base font-semibold flex-shrink-0 ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-900"}`}>
                      {isDisabled ? t("included") : showPrices ? `+${formatPrice(getAccessoryPrice(accessory.id), config.currency)}` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Transport Group */}
        {visibleTransport.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("groups.transport")}</p>
              <GroupInfoButton onClick={() => setActiveModal("transport")} />
            </div>

            {visibleTransport.map((accessory) => {
              const isSelected = config[accessory.id as keyof ConfiguratorState];
              const isDisabled = isDisabledByStarterKit(accessory);
              const isAutoIncluded = isAutoIncludedWithCare(accessory);
              const isIncludedOrDisabled = isDisabled || isAutoIncluded;

              return (
                <button
                  key={accessory.id}
                  onClick={() => !isIncludedOrDisabled && toggleAccessory(accessory.id)}
                  disabled={isIncludedOrDisabled}
                  className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border ${!isIncludedOrDisabled && "card-hover"} ${
                    isIncludedOrDisabled
                      ? "border-stone-200 bg-stone-50 cursor-not-allowed"
                      : isSelected
                      ? "selected"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        {(isSelected || isIncludedOrDisabled) && (
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isIncludedOrDisabled ? "bg-stone-400" : "bg-emerald-500 checkmark-animated"}`}>
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <p className={`font-medium text-sm md:text-base ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-900"}`}>
                          {t(`items.${accessory.translationKey}.name`)}
                        </p>
                      </div>
                      {accessory.includedInStarterKit && (
                        <span className="inline-block text-[10px] md:text-xs bg-emerald-100 text-emerald-700 px-1.5 md:px-2 py-0.5 rounded-full mt-1.5">
                          {t("includedInStarterKit")}
                        </span>
                      )}
                      <p className={`text-xs md:text-sm mt-1 ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-500"}`}>
                        {t(`items.${accessory.translationKey}.description`)}
                      </p>
                    </div>
                    <span className={`text-sm md:text-base font-semibold flex-shrink-0 ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-900"}`}>
                      {isDisabled ? t("included") : showPrices ? `+${formatPrice(getAccessoryPrice(accessory.id), config.currency)}` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Maintenance Group */}
        {visibleMaintenance.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs md:text-sm font-medium text-stone-500 uppercase tracking-wide">{t("groups.maintenance")}</p>
              <GroupInfoButton onClick={() => setActiveModal("maintenance")} />
            </div>

            {visibleMaintenance.map((accessory) => {
              const isSelected = config[accessory.id as keyof ConfiguratorState];
              const isDisabled = isDisabledByStarterKit(accessory);
              const isAutoIncluded = isAutoIncludedWithCare(accessory);
              const isIncludedOrDisabled = isDisabled || isAutoIncluded;

              return (
                <button
                  key={accessory.id}
                  onClick={() => !isIncludedOrDisabled && toggleAccessory(accessory.id)}
                  disabled={isIncludedOrDisabled}
                  className={`selection-card w-full text-left p-4 md:p-5 rounded-xl border ${!isIncludedOrDisabled && "card-hover"} ${
                    isIncludedOrDisabled
                      ? "border-stone-200 bg-stone-50 cursor-not-allowed"
                      : isSelected
                      ? "selected"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        {(isSelected || isIncludedOrDisabled) && (
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isIncludedOrDisabled ? "bg-stone-400" : "bg-emerald-500 checkmark-animated"}`}>
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <p className={`font-medium text-sm md:text-base ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-900"}`}>
                          {t(`items.${accessory.translationKey}.name`)}
                        </p>
                      </div>
                      {accessory.includedInStarterKit && (
                        <span className="inline-block text-[10px] md:text-xs bg-emerald-100 text-emerald-700 px-1.5 md:px-2 py-0.5 rounded-full mt-1.5">
                          {t("includedInStarterKit")}
                        </span>
                      )}
                      {accessory.requiresSpraySystem && (
                        <span className="inline-block text-[10px] md:text-xs bg-emerald-100 text-emerald-700 px-1.5 md:px-2 py-0.5 rounded-full mt-1.5">
                          {t("includedWithCare")}
                        </span>
                      )}
                      <p className={`text-xs md:text-sm mt-1 ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-500"}`}>
                        {t(`items.${accessory.translationKey}.description`)}
                      </p>
                    </div>
                    <span className={`text-sm md:text-base font-semibold flex-shrink-0 ${isIncludedOrDisabled ? "text-stone-400" : "text-stone-900"}`}>
                      {isIncludedOrDisabled ? t("included") : showPrices ? `+${formatPrice(getAccessoryPrice(accessory.id), config.currency)}` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Info text */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            {selectedCount === 0
              ? t("emptyMessage")
              : showPrices
                ? (selectedCount > 1
                  ? t("selectedMessagePlural", { count: selectedCount, price: formatPrice(totalAccessoriesPrice, config.currency) })
                  : t("selectedMessage", { count: selectedCount, price: formatPrice(totalAccessoriesPrice, config.currency) }))
                : t("selectedCountOnly", { count: selectedCount })}
          </p>
        </div>
      </div>

      {/* Info Modal */}
      {activeModal && (
        <AccessoriesInfoModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          group={activeModal}
        />
      )}
    </div>
  );
}
