"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfiguratorState, PriceBreakdown, calculatePrice } from "@/lib/configurator-data";

// Country codes for FarmDroid market
const COUNTRY_CODES = ["DK", "DE", "NL", "SE", "NO", "FI", "FR", "GB", "PL", "AT", "CH", "BE", "OTHER"] as const;

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  countryOther: string;
  farmSize: string;
  hectaresForFarmDroid: string;
  crops: string;
  contactByPartner: boolean;
  marketingConsent: boolean;
}

interface LeadCaptureFormProps {
  config: ConfiguratorState;
  priceBreakdown: PriceBreakdown;
  onSubmit: (lead: LeadData) => void;
  initialLead?: LeadData | null;
}

export function LeadCaptureForm({ config, priceBreakdown, onSubmit, initialLead }: LeadCaptureFormProps) {
  const tPublic = useTranslations("publicMode");
  const t = useTranslations("publicMode.form");
  const [formData, setFormData] = useState<LeadData>(initialLead || {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    countryOther: "",
    farmSize: "",
    hectaresForFarmDroid: "",
    crops: "",
    contactByPartner: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadData, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (field: keyof LeadData, value: string | boolean) => {
    switch (field) {
      case "firstName":
        return typeof value === "string" && value.trim() === "" ? t("errors.firstNameRequired") : "";
      case "lastName":
        return typeof value === "string" && value.trim() === "" ? t("errors.lastNameRequired") : "";
      case "email":
        if (typeof value !== "string" || value.trim() === "") return t("errors.emailRequired");
        if (!isValidEmail(value)) return t("errors.emailInvalid");
        return "";
      case "company":
        return typeof value === "string" && value.trim() === "" ? t("errors.companyRequired") : "";
      case "country":
        return typeof value === "string" && value === "" ? t("errors.countryRequired") : "";
      case "countryOther":
        if (formData.country === "OTHER" && typeof value === "string" && value.trim() === "") {
          return t("errors.countryOtherRequired");
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field: keyof LeadData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field: keyof LeadData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LeadData, string>> = {};
    const requiredFields: (keyof LeadData)[] = ["firstName", "lastName", "email", "company", "country"];

    if (formData.country === "OTHER") {
      requiredFields.push("countryOther");
    }

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched(
      requiredFields.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Partial<Record<keyof LeadData, boolean>>
      )
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    // Create final lead data with resolved country
    const finalLead: LeadData = {
      ...formData,
      country: formData.country === "OTHER" ? formData.countryOther : formData.country,
    };

    // Call parent handler - parent will handle loading state and API call
    onSubmit(finalLead);
    // Note: We don't setSubmitting(false) here - the parent controls the flow now
  };

  const inputClasses = (field: keyof LeadData) =>
    `w-full h-11 px-4 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:border-transparent ${
      errors[field] && touched[field]
        ? "border-red-400 focus:ring-red-500"
        : "border-stone-200 focus:ring-stone-900"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-900">{tPublic("formHeading")}</h2>
        <p className="text-sm text-stone-500 mt-1">{tPublic("formSubheading")}</p>
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-stone-700">
            {t("firstName")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            onBlur={() => handleBlur("firstName")}
            className={inputClasses("firstName")}
          />
          {errors.firstName && touched.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">
            {t("lastName")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            onBlur={() => handleBlur("lastName")}
            className={inputClasses("lastName")}
          />
          {errors.lastName && touched.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          className={inputClasses("email")}
        />
        {errors.email && touched.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-stone-700">{t("phone")}</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
        />
      </div>

      {/* Company / Farm Name */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          {t("company")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleChange("company", e.target.value)}
          onBlur={() => handleBlur("company")}
          className={inputClasses("company")}
        />
        {errors.company && touched.company && (
          <p className="mt-1 text-xs text-red-500">{errors.company}</p>
        )}
      </div>

      {/* Country */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          {t("country")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            onBlur={() => handleBlur("country")}
            className={`${inputClasses("country")} appearance-none cursor-pointer`}
          >
            <option value="">{t("selectCountry")}</option>
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>
                {t(`countries.${code}`)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
        </div>
        {errors.country && touched.country && (
          <p className="mt-1 text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* Other Country (conditional) */}
      {formData.country === "OTHER" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <label className="text-sm font-medium text-stone-700">
            {t("specifyCountry")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.countryOther}
            onChange={(e) => handleChange("countryOther", e.target.value)}
            onBlur={() => handleBlur("countryOther")}
            className={inputClasses("countryOther")}
          />
          {errors.countryOther && touched.countryOther && (
            <p className="mt-1 text-xs text-red-500">{errors.countryOther}</p>
          )}
        </motion.div>
      )}

      {/* Farm Size */}
      <div>
        <label className="text-sm font-medium text-stone-700">{t("farmSize")}</label>
        <input
          type="number"
          value={formData.farmSize}
          onChange={(e) => handleChange("farmSize", e.target.value)}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          placeholder={t("farmSizePlaceholder")}
          min="0"
        />
      </div>

      {/* Hectares relevant for FarmDroid */}
      <div>
        <label className="text-sm font-medium text-stone-700">{t("hectaresForFarmDroid")}</label>
        <input
          type="number"
          value={formData.hectaresForFarmDroid}
          onChange={(e) => handleChange("hectaresForFarmDroid", e.target.value)}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          placeholder={t("hectaresPlaceholder")}
          min="0"
        />
        <p className="mt-1 text-xs text-stone-400">{t("hectaresHint")}</p>
      </div>

      {/* Crops */}
      <div>
        <label className="text-sm font-medium text-stone-700">{t("crops")}</label>
        <textarea
          value={formData.crops}
          onChange={(e) => handleChange("crops", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
          placeholder={t("cropsPlaceholder")}
          rows={2}
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.contactByPartner}
            onChange={(e) => handleChange("contactByPartner", e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
          />
          <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
            {t("contactByPartner")}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.marketingConsent}
            onChange={(e) => handleChange("marketingConsent", e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
          />
          <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
            {t("marketingConsent")}
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("sending")}
          </>
        ) : (
          <>
            {tPublic("submitButton")}
            <span className="ml-1">→</span>
          </>
        )}
      </button>

      <p className="text-xs text-stone-400 text-center">
        {t("privacyNote")}
      </p>
    </form>
  );
}
