"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Mail, Phone, FileText, Truck, Users, ExternalLink } from "lucide-react";
import { ConfigPageData } from "@/lib/config-page-types";

interface NextStepsSectionProps {
  data: ConfigPageData;
  className?: string;
}

interface Step {
  icon: typeof Mail;
  title: string;
  description?: string;
  customContent?: React.ReactNode;
}

export function NextStepsSection({ data, className = "" }: NextStepsSectionProps) {
  const t = useTranslations("configPage");
  const { lead } = data;

  // Build steps array based on contactByPartner selection
  const steps: Step[] = [
    {
      icon: Mail,
      title: t("nextSteps.email.title"),
      description: t("nextSteps.email.description"),
    },
    // Different content based on whether user wants to be contacted
    lead.contactByPartner
      ? {
          icon: Phone,
          title: t("nextSteps.consultation.title"),
          description: t("nextSteps.consultation.description"),
        }
      : {
          icon: Users,
          title: t("nextSteps.reachOut.title"),
          customContent: (
            <div className="text-sm text-stone-500 mt-0.5 space-y-1">
              <a
                href="https://farmdroid.com/the-team/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {t("nextSteps.reachOut.teamLink")}
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-stone-400">{t("nextSteps.reachOut.or")}</span>
              <a
                href="https://farmdroid.com/get-started/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {t("nextSteps.reachOut.partnerLink")}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ),
        },
    {
      icon: FileText,
      title: t("nextSteps.quote.title"),
      description: t("nextSteps.quote.description"),
    },
    {
      icon: Truck,
      title: t("nextSteps.delivery.title"),
      description: t("nextSteps.delivery.description"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className={`bg-white rounded-xl border border-stone-200 p-6 ${className}`}
    >
      <h2 className="text-lg font-semibold text-stone-900 mb-6">{t("nextSteps.title")}</h2>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className="flex gap-4"
            >
              {/* Step number with connector line */}
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-emerald-100 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <h3 className="text-sm font-medium text-stone-900">{step.title}</h3>
                {step.customContent ? (
                  step.customContent
                ) : (
                  <p className="text-sm text-stone-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Contact info */}
      <div className="mt-6 pt-6 border-t border-stone-100">
        <h3 className="text-sm font-medium text-stone-900 mb-2">{t("nextSteps.contactTitle")}</h3>
        <p className="text-sm text-stone-500">{t("nextSteps.contactDescription")}</p>
        <a
          href="mailto:info@farmdroid.com"
          className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Mail className="w-4 h-4" />
          info@farmdroid.com
        </a>
      </div>
    </motion.div>
  );
}
