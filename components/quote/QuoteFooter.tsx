"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, Globe } from "lucide-react";

export function QuoteFooter() {
  const t = useTranslations("quote");

  return (
    <div className="mt-12 pt-8 border-t border-stone-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Contact info */}
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3">
            {t("contactUs")}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Mail className="w-4 h-4 text-stone-400" />
              <a href="mailto:sales@farmdroid.dk" className="hover:text-brand-600">
                sales@farmdroid.dk
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Phone className="w-4 h-4 text-stone-400" />
              <a href="tel:+4570707172" className="hover:text-brand-600">
                +45 70 70 71 72
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Globe className="w-4 h-4 text-stone-400" />
              <a
                href="https://farmdroid.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600"
              >
                farmdroid.dk
              </a>
            </div>
          </div>
        </div>

        {/* Company info */}
        <div className="text-right">
          <div className="text-sm text-stone-500">
            FarmDroid ApS
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Aggersundvej 50, 9670 Logstor, Denmark
          </div>
          <div className="text-xs text-stone-400 mt-1">
            CVR: 38515169
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 pt-4 border-t border-stone-100 text-center">
        <p className="text-xs text-stone-400">
          {t("generatedWith")}
        </p>
      </div>
    </div>
  );
}
