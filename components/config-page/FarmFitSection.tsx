"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Leaf, Sun, Zap, Ruler, Clock } from "lucide-react";
import { ConfigPageData } from "@/lib/config-page-types";
import { calculateRobotSpeed, calculateDailyCapacity } from "@/lib/configurator-data";

interface FarmFitSectionProps {
  data: ConfigPageData;
  className?: string;
}

export function FarmFitSection({ data, className = "" }: FarmFitSectionProps) {
  const t = useTranslations("configPage");
  const { config } = data;

  // Use saved values from config (with fallbacks for backward compatibility)
  const workingWidth = config.workingWidth ?? 2000;
  const seedingMode = config.seedingMode ?? "single";
  const plantSpacing = config.plantSpacing ?? 18;

  // Calculate using the same method as the configurator (24h/day for "up to" max capacity)
  const speed = calculateRobotSpeed(seedingMode, plantSpacing);
  const maxDailyHectares = Math.round(calculateDailyCapacity(speed, workingWidth, 24) * 10) / 10;

  const benefits = [
    {
      icon: Ruler,
      title: t("farmFit.workingWidth"),
      description: t("farmFit.workingWidthDesc", {
        rows: config.activeRows,
        spacing: (config.rowDistance / 10).toFixed(1),
        width: (workingWidth / 10).toFixed(0),
      }),
    },
    {
      icon: Clock,
      title: t("farmFit.dailyCapacity"),
      description: t("farmFit.dailyCapacityDesc", {
        hectares: maxDailyHectares,
      }),
    },
    config.powerSource === "solar"
      ? {
          icon: Sun,
          title: t("farmFit.solarPower"),
          description: t("farmFit.solarPowerDesc"),
        }
      : {
          icon: Zap,
          title: t("farmFit.hybridPower"),
          description: t("farmFit.hybridPowerDesc"),
        },
    {
      icon: Leaf,
      title: t("farmFit.sustainability"),
      description: t("farmFit.sustainabilityDesc"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className={`bg-brand-50 rounded-xl p-6 ${className}`}
    >
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{t("farmFit.title")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-stone-900">{benefit.title}</h3>
                <p className="text-sm text-stone-600 mt-0.5">{benefit.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
