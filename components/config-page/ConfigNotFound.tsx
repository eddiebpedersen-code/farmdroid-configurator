"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ConfigNotFoundProps {
  errorType: string;
}

export function ConfigNotFound({ errorType }: ConfigNotFoundProps) {
  const t = useTranslations("configPage");

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-stone-900 mb-2">
          {t("notFound.title")}
        </h1>
        <p className="text-stone-600 mb-6">
          {errorType === "noData"
            ? t("notFound.descriptionNoData")
            : t("notFound.description")}
        </p>
        <Link
          href="/configurator"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("notFound.startNew")}
        </Link>
      </motion.div>
    </div>
  );
}
