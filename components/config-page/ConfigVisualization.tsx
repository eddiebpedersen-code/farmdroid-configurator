"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ConfigPageData } from "@/lib/config-page-types";
import { RowConfigAnimation } from "@/components/configurator/step-row-config/RowConfigAnimation";

interface ConfigVisualizationProps {
  data: ConfigPageData;
}

export function ConfigVisualization({ data }: ConfigVisualizationProps) {
  const t = useTranslations("configPage");
  const { config } = data;

  // Use the saved crop emoji from config (with fallback based on seed size)
  const cropEmoji = config.cropEmoji ?? (config.seedSize === "6mm" ? "🥕" : "🌱");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900">{t("visualizationTitle")}</h2>
      </div>

      <div className="p-4">
        <RowConfigAnimation
          config={config}
          seedingMode={config.seedingMode}
          plantSpacing={config.plantSpacing}
          seedsPerGroup={config.seedsPerGroup}
          workingWidth={config.workingWidth}
          cropEmoji={cropEmoji}
          isStatic={true}
        />
      </div>
    </motion.div>
  );
}
