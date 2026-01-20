"use client";

import { useTranslations } from "next-intl";
import { ConfiguratorState, calculatePassiveRows } from "@/lib/configurator-data";
import { Zap, Sun, Circle, Grid3X3, Droplets, Shield } from "lucide-react";

interface QuoteConfigSummaryProps {
  config: ConfiguratorState;
}

export function QuoteConfigSummary({ config }: QuoteConfigSummaryProps) {
  const t = useTranslations("quote");

  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance);
  const totalRows = config.activeRows + passiveRows;
  const workingWidth = config.rowSpacings
    ? config.rowSpacings.reduce((sum, s) => sum + s, 0)
    : (config.activeRows - 1) * config.rowDistance;

  const features = [
    {
      icon: Grid3X3,
      label: t("config.rows"),
      value: `${config.activeRows} ${t("config.active")}${passiveRows > 0 ? ` + ${passiveRows} ${t("config.passive")}` : ""}`,
    },
    {
      icon: Circle,
      label: t("config.seedSize"),
      value: config.seedSize,
    },
    {
      icon: Circle,
      label: t("config.rowSpacing"),
      value: `${config.rowDistance / 10} cm`,
    },
    {
      icon: Circle,
      label: t("config.workingWidth"),
      value: `${(workingWidth / 10).toFixed(0)} cm`,
    },
    {
      icon: config.powerSource === "hybrid" ? Zap : Sun,
      label: t("config.powerSource"),
      value: config.powerSource === "hybrid" ? t("config.hybrid") : t("config.solar"),
    },
    {
      icon: Circle,
      label: t("config.frontWheel"),
      value: config.frontWheel === "PFW"
        ? t("config.passiveFrontWheel")
        : config.frontWheel === "AFW"
        ? t("config.activeFrontWheel")
        : t("config.dualFrontWheel"),
    },
  ];

  // Add optional features
  if (config.spraySystem) {
    features.push({
      icon: Droplets,
      label: t("config.spraySystem"),
      value: t("config.included"),
    });
  }

  if (config.warrantyExtension) {
    features.push({
      icon: Shield,
      label: t("config.warranty"),
      value: t("config.extended"),
    });
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">
        {t("configurationSummary")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg"
          >
            <feature.icon className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-stone-500">{feature.label}</div>
              <div className="text-sm font-medium text-stone-900">{feature.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Accessories summary if any selected */}
      {(config.starterKit || config.roadTransport || config.fieldBracket ||
        config.powerBank || config.fstFieldSetupTool || config.baseStationV3 ||
        config.essentialCarePackage || config.additionalWeightKit || config.toolbox) && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg">
          <div className="text-xs text-stone-500 mb-2">{t("config.accessories")}</div>
          <div className="flex flex-wrap gap-2">
            {config.starterKit && <AccessoryBadge label={t("accessories.starterKit")} />}
            {config.roadTransport && <AccessoryBadge label={t("accessories.roadTransport")} />}
            {config.fieldBracket && <AccessoryBadge label={t("accessories.fieldBracket")} />}
            {config.powerBank && <AccessoryBadge label={t("accessories.powerBank")} />}
            {config.fstFieldSetupTool && <AccessoryBadge label={t("accessories.fstTool")} />}
            {config.baseStationV3 && <AccessoryBadge label={t("accessories.baseStation")} />}
            {config.essentialCarePackage && <AccessoryBadge label={t("accessories.carePkg")} />}
            {config.additionalWeightKit && <AccessoryBadge label={t("accessories.weightKit")} />}
            {config.toolbox && <AccessoryBadge label={t("accessories.toolbox")} />}
          </div>
        </div>
      )}
    </div>
  );
}

function AccessoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-1 bg-white rounded text-xs font-medium text-stone-700 border border-stone-200">
      {label}
    </span>
  );
}
