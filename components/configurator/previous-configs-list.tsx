"use client";

import { motion } from "framer-motion";
import { Edit3, Copy, Calendar, Rows3, Zap, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatPrice, Currency } from "@/lib/configurator-data";

export interface ConfigurationSummary {
  reference: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  currency: Currency;
  status: string;
  config: {
    activeRows: number;
    seedSize: string;
    powerSource: string;
    spraySystem: boolean;
    frontWheel: string;
    starterKit: boolean;
  };
}

interface PreviousConfigsListProps {
  configurations: ConfigurationSummary[];
  onSelect: (reference: string, action: "edit" | "duplicate") => void;
  onContinueNew: () => void;
  locale: string;
}

export function PreviousConfigsList({
  configurations,
  onSelect,
  onContinueNew,
  locale,
}: PreviousConfigsListProps) {
  const t = useTranslations("returningUser");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "en" ? "en-GB" : locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Configurations list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {configurations.map((config, index) => (
          <motion.div
            key={config.reference}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-stone-50 rounded-xl p-4 border border-stone-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-stone-700">
                    {t("configCard.reference", { reference: config.reference })}
                  </span>
                  {config.status === "submitted" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                  <Calendar className="h-3 w-3" />
                  <span>{t("configCard.created", { date: formatDate(config.createdAt) })}</span>
                </div>
              </div>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(config.totalPrice, config.currency)}
              </span>
            </div>

            {/* Config summary */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-xs text-stone-600 border border-stone-100">
                <Rows3 className="h-3 w-3" />
                <span>{t("configCard.rows", { count: config.config.activeRows })}</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-xs text-stone-600 border border-stone-100">
                {config.config.powerSource === "hybrid" ? (
                  <Zap className="h-3 w-3" />
                ) : (
                  <Sun className="h-3 w-3" />
                )}
                <span className="capitalize">{config.config.powerSource}</span>
              </div>
              {config.config.spraySystem && (
                <div className="bg-blue-50 px-2 py-1 rounded-md text-xs text-blue-600 border border-blue-100">
                  +Spray
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSelect(config.reference, "edit")}
                className="flex-1 flex items-center justify-center gap-2 h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                {t("modal.editConfig")}
              </button>
              <button
                type="button"
                onClick={() => onSelect(config.reference, "duplicate")}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-lg border border-stone-200 transition-colors"
              >
                <Copy className="h-4 w-4" />
                {t("modal.useAsTemplate")}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Start fresh button */}
      <button
        type="button"
        onClick={onContinueNew}
        className="w-full h-10 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        {t("modal.startFresh")}
      </button>
    </div>
  );
}
