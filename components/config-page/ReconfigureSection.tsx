"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Settings, ArrowRight, X, Edit3, RefreshCw } from "lucide-react";
import { ConfigPageData } from "@/lib/config-page-types";
import { encodeConfigPageData, encodeLeadData } from "@/lib/config-page-utils";

interface ReconfigureSectionProps {
  data: ConfigPageData;
}

export function ReconfigureSection({ data }: ReconfigureSectionProps) {
  const t = useTranslations("configPage");
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleModifyExisting = () => {
    // Encode the current config to pass to configurator
    const encoded = encodeConfigPageData(data);
    router.push(`/${data.locale}/configurator?config=${encoded}`);
  };

  const handleStartFresh = () => {
    // Go to configurator with lead data (contact details) but no config
    const encodedLead = encodeLeadData(data.lead);
    router.push(`/${data.locale}/configurator?lead=${encodedLead}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl p-6 flex items-center justify-between gap-6 print:hidden"
      >
        <div>
          <h2 className="text-lg font-semibold text-stone-900 mb-1">{t("reconfigure.title")}</h2>
          <p className="text-sm text-stone-500">{t("reconfigure.description")}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          {t("reconfigure.button")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Choice Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900">
                  {t("reconfigure.modal.title")}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <p className="text-sm text-stone-500 mb-6">
                {t("reconfigure.modal.description")}
              </p>

              <div className="space-y-3">
                {/* Modify existing option */}
                <button
                  onClick={handleModifyExisting}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">
                        {t("reconfigure.modal.modifyTitle")}
                      </h4>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {t("reconfigure.modal.modifyDescription")}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Start fresh option */}
                <button
                  onClick={handleStartFresh}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-200 transition-colors">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">
                        {t("reconfigure.modal.freshTitle")}
                      </h4>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {t("reconfigure.modal.freshDescription")}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
