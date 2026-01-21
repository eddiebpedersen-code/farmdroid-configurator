"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { ConfiguratorState, PriceBreakdown, calculatePrice } from "@/lib/configurator-data";

// Countries list for FarmDroid market
const COUNTRIES = [
  { value: "DK", label: "Denmark" },
  { value: "DE", label: "Germany" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GB", label: "United Kingdom" },
  { value: "PL", label: "Poland" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "BE", label: "Belgium" },
  { value: "OTHER", label: "Other" },
];

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  countryOther: string;
  farmSize: string;
  crops: string;
  contactByPartner: boolean;
  marketingConsent: boolean;
}

interface LeadCaptureFormProps {
  config: ConfiguratorState;
  priceBreakdown: PriceBreakdown;
  onSubmit: (lead: LeadData) => void;
}

export function LeadCaptureForm({ config, priceBreakdown, onSubmit }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    countryOther: "",
    farmSize: "",
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
        return typeof value === "string" && value.trim() === "" ? "First name is required" : "";
      case "lastName":
        return typeof value === "string" && value.trim() === "" ? "Last name is required" : "";
      case "email":
        if (typeof value !== "string" || value.trim() === "") return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email";
        return "";
      case "company":
        return typeof value === "string" && value.trim() === "" ? "Company / Farm name is required" : "";
      case "country":
        return typeof value === "string" && value === "" ? "Please select a country" : "";
      case "countryOther":
        if (formData.country === "OTHER" && typeof value === "string" && value.trim() === "") {
          return "Please specify your country";
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create submission object
    const submission = {
      lead: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        country: formData.country === "OTHER" ? formData.countryOther : formData.country,
        farmSize: formData.farmSize,
        crops: formData.crops,
        contactByPartner: formData.contactByPartner,
        marketingConsent: formData.marketingConsent,
      },
      configuration: {
        model: "FD20",
        seedSize: config.seedSize,
        activeRows: config.activeRows,
        rowDistance: config.rowDistance,
        frontWheel: config.frontWheel,
        powerSource: config.powerSource,
        spraySystem: config.spraySystem,
        weedingTool: config.weedingTool,
        servicePlan: config.servicePlan,
        warrantyExtension: config.warrantyExtension,
      },
      calculatedPrice: priceBreakdown.total,
      submittedAt: new Date().toISOString(),
      source: "website-configurator",
    };

    console.log("Lead submission:", submission);

    setSubmitting(false);
    onSubmit(formData);
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
        <h2 className="text-xl font-semibold text-stone-900">Get Your Personalized Quote</h2>
        <p className="text-sm text-stone-500 mt-1">
          Complete the form below and we&apos;ll send you a detailed quote with pricing.
        </p>
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-stone-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            onBlur={() => handleBlur("firstName")}
            className={inputClasses("firstName")}
            placeholder="John"
          />
          {errors.firstName && touched.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            onBlur={() => handleBlur("lastName")}
            className={inputClasses("lastName")}
            placeholder="Doe"
          />
          {errors.lastName && touched.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          className={inputClasses("email")}
          placeholder="john.doe@farm.com"
        />
        {errors.email && touched.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-stone-700">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          placeholder="+45 12 34 56 78"
        />
      </div>

      {/* Company / Farm Name */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          Company / Farm Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleChange("company", e.target.value)}
          onBlur={() => handleBlur("company")}
          className={inputClasses("company")}
          placeholder="Green Valley Farm"
        />
        {errors.company && touched.company && (
          <p className="mt-1 text-xs text-red-500">{errors.company}</p>
        )}
      </div>

      {/* Country */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          Country <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            onBlur={() => handleBlur("country")}
            className={`${inputClasses("country")} appearance-none cursor-pointer`}
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
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
            Please specify your country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.countryOther}
            onChange={(e) => handleChange("countryOther", e.target.value)}
            onBlur={() => handleBlur("countryOther")}
            className={inputClasses("countryOther")}
            placeholder="Your country"
          />
          {errors.countryOther && touched.countryOther && (
            <p className="mt-1 text-xs text-red-500">{errors.countryOther}</p>
          )}
        </motion.div>
      )}

      {/* Farm Size */}
      <div>
        <label className="text-sm font-medium text-stone-700">Farm Size (hectares)</label>
        <input
          type="number"
          value={formData.farmSize}
          onChange={(e) => handleChange("farmSize", e.target.value)}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          placeholder="e.g., 50"
          min="0"
        />
      </div>

      {/* Crops */}
      <div>
        <label className="text-sm font-medium text-stone-700">What crops do you grow?</label>
        <textarea
          value={formData.crops}
          onChange={(e) => handleChange("crops", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
          placeholder="e.g., Sugar beet, carrots, onions"
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
            I&apos;d like to be contacted by a local FarmDroid partner
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
            I agree to receive communications from FarmDroid about products and updates
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
            Sending...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Me My Quote
          </>
        )}
      </button>

      <p className="text-xs text-stone-400 text-center">
        By submitting this form, you agree to our privacy policy.
      </p>
    </form>
  );
}
