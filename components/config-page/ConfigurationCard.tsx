"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Cpu, Rows3, Circle, Zap, Droplets, Package, Shield, Scissors, Sun, Battery } from "lucide-react";
import { ConfigPageData } from "@/lib/config-page-types";
import {
  calculatePassiveRows,
  getWeedCuttingDiscVariant,
} from "@/lib/configurator-data";

interface ConfigurationCardProps {
  data: ConfigPageData;
  className?: string;
}

// Section header component
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-stone-50 -mx-6 px-6 py-2 border-b border-stone-100">
      <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

// Config item component
function ConfigItem({
  icon,
  label,
  value,
  description
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-stone-700">{label}</span>
          {value && <span className="text-stone-900 font-medium">{value}</span>}
        </div>
        {description && (
          <p className="text-sm text-stone-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// Format row spacings for display - shows unique values separated by " / "
function formatRowSpacings(rowSpacings: number[]): string {
  if (!rowSpacings || rowSpacings.length === 0) return "";

  // Get unique spacing values in order of appearance
  const uniqueSpacings: number[] = [];
  for (const spacing of rowSpacings) {
    if (!uniqueSpacings.includes(spacing)) {
      uniqueSpacings.push(spacing);
    }
  }

  // Format each unique value to cm and join with " / "
  return uniqueSpacings
    .map(s => `${(s / 10).toFixed(s % 10 === 0 ? 0 : 1)} cm`)
    .join(" / ");
}

export function ConfigurationCard({ data, className = "" }: ConfigurationCardProps) {
  const t = useTranslations("configPage");
  const { config } = data;

  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);
  // Use saved working width from config (with fallback for backward compatibility)
  const workingWidth = config.workingWidth ?? 2000;
  const weedCuttingDiscVariant = getWeedCuttingDiscVariant(config.rowDistance);

  // Format row spacings for display
  const rowSpacingDisplay = config.rowSpacings && config.rowSpacings.length > 0
    ? formatRowSpacings(config.rowSpacings)
    : `${(config.rowDistance / 10).toFixed(config.rowDistance % 10 === 0 ? 0 : 1)} cm`;

  const frontWheelLabel = {
    PFW: t("config.frontWheel.PFW"),
    AFW: t("config.frontWheel.AFW"),
    DFW: t("config.frontWheel.DFW"),
  }[config.frontWheel];

  // Build accessories list
  const accessories: { name: string; key: string }[] = [];
  if (config.starterKit) {
    accessories.push({ name: t("config.accessories.starterKit"), key: "starterKit" });
  } else {
    if (config.fstFieldSetupTool) accessories.push({ name: t("config.accessories.fstFieldSetupTool"), key: "fstFieldSetupTool" });
    if (config.baseStationV3) accessories.push({ name: t("config.accessories.baseStationV3"), key: "baseStationV3" });
    if (config.essentialCarePackage) accessories.push({ name: t("config.accessories.essentialCarePackage"), key: "essentialCarePackage" });
    if (config.fieldBracket) accessories.push({ name: t("config.accessories.fieldBracket"), key: "fieldBracket" });
  }
  if (config.roadTransport) accessories.push({ name: t("config.accessories.roadTransport"), key: "roadTransport" });
  // Power Bank is shown in Power Source section, not here
  if (config.additionalWeightKit) accessories.push({ name: t("config.accessories.additionalWeightKit"), key: "additionalWeightKit" });
  if (config.toolbox) accessories.push({ name: t("config.accessories.toolbox"), key: "toolbox" });

  // Check if weed config has any items
  const hasWeedConfig = config.weedingTool !== "none" || config.spraySystem;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`bg-white rounded-xl border border-stone-200 overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900">{t("configurationTitle")}</h2>
      </div>

      <div className="px-6 py-4 space-y-1">
        {/* Base Robot Section */}
        <SectionHeader title={t("sections.robot")} />
        <ConfigItem
          icon={<Cpu className="h-5 w-5 text-emerald-600" />}
          label="FD20 Robot V2.6"
        />
        <ConfigItem
          icon={<Circle className="h-5 w-5 text-emerald-600" />}
          label={t("config.wheelConfig")}
          value={frontWheelLabel}
        />

        {/* +Seed Configuration Section */}
        <div className="pt-3">
          <SectionHeader title={t("sections.seedConfig")} />
        </div>
        <ConfigItem
          icon={<Rows3 className="h-5 w-5 text-emerald-600" />}
          label={t("config.activeRowsLabel")}
          value={`${config.activeRows} ${t("config.rows")}`}
          description={config.seedSize === "6mm" ? t("config.seedSize6mm") : t("config.seedSize14mm")}
        />
        {passiveRows > 0 && (
          <ConfigItem
            icon={<Rows3 className="h-5 w-5 text-stone-400" />}
            label={t("config.passiveRowsLabel")}
            value={`${passiveRows} ${t("config.rows")}`}
          />
        )}
        <ConfigItem
          icon={<div className="h-5 w-5 flex items-center justify-center text-emerald-600 text-xs font-bold">↔</div>}
          label={t("config.rowSpacing")}
          value={rowSpacingDisplay}
        />
        <ConfigItem
          icon={<div className="h-5 w-5 flex items-center justify-center text-emerald-600 text-xs font-bold">⟷</div>}
          label={t("config.workingWidthLabel")}
          value={`${(workingWidth / 10).toFixed(0)} cm`}
        />

        {/* +Weed Configuration Section */}
        {hasWeedConfig && (
          <>
            <div className="pt-3">
              <SectionHeader title={t("sections.weedConfig")} />
            </div>
            {config.spraySystem && (
              <ConfigItem
                icon={<Droplets className="h-5 w-5 text-blue-500" />}
                label={t("config.spraySystem")}
                description={t("config.spraySystemDesc")}
              />
            )}
            {config.weedingTool !== "none" && (
              <ConfigItem
                icon={<Scissors className="h-5 w-5 text-emerald-600" />}
                label={t("config.weedingToolLabel")}
                value={
                  config.weedingTool === "combiTool"
                    ? t("config.weedingTool.combiTool")
                    : t("config.weedingTool.weedCuttingDisc", { variant: weedCuttingDiscVariant || "" })
                }
              />
            )}
          </>
        )}

        {/* Power Source Section */}
        <div className="pt-3">
          <SectionHeader title={t("sections.power")} />
        </div>
        <ConfigItem
          icon={config.powerSource === "hybrid"
            ? <Battery className="h-5 w-5 text-amber-500" />
            : <Sun className="h-5 w-5 text-amber-500" />
          }
          label={config.powerSource === "hybrid" ? t("config.power.hybrid") : t("config.power.solar")}
          description={config.powerSource === "hybrid" ? t("config.power.hybridDesc") : t("config.power.solarDesc")}
        />
        {config.powerBank && (
          <ConfigItem
            icon={<Battery className="h-5 w-5 text-emerald-600" />}
            label={t("config.accessories.powerBank")}
            description={t("config.powerBankDesc")}
          />
        )}

        {/* Accessories Section */}
        {accessories.length > 0 && (
          <>
            <div className="pt-3">
              <SectionHeader title={t("sections.accessories")} />
            </div>
            {accessories.map((accessory) => (
              <ConfigItem
                key={accessory.key}
                icon={<Package className="h-5 w-5 text-emerald-600" />}
                label={accessory.name}
              />
            ))}
          </>
        )}

        {/* Service & Warranty Section */}
        {(config.servicePlan !== "none" || config.warrantyExtension) && (
          <>
            <div className="pt-3">
              <SectionHeader title={t("sections.service")} />
            </div>
            {config.servicePlan !== "none" && (
              <ConfigItem
                icon={<Shield className="h-5 w-5 text-emerald-600" />}
                label={
                  config.servicePlan === "premium"
                    ? t("config.servicePlan.premium")
                    : t("config.servicePlan.standard")
                }
              />
            )}
            {config.warrantyExtension && (
              <ConfigItem
                icon={<Shield className="h-5 w-5 text-amber-500" />}
                label={t("config.warrantyExtension")}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
