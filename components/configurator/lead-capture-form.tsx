"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfiguratorState, PriceBreakdown, calculatePrice } from "@/lib/configurator-data";

// Primary FarmDroid markets (shown first in dropdown)
const PRIMARY_COUNTRIES = [
  "Denmark",
  "Germany",
  "Netherlands",
  "Sweden",
  "Norway",
  "Finland",
  "France",
  "United Kingdom",
  "Poland",
  "Austria",
  "Switzerland",
  "Belgium",
] as const;

// All countries (matching HubSpot values)
const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau",
  "Macedonia (FYROM)", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
] as const;

// Other countries (all except primary, for "Other countries" section)
const OTHER_COUNTRIES = ALL_COUNTRIES.filter(c => !PRIMARY_COUNTRIES.includes(c as typeof PRIMARY_COUNTRIES[number]));

// Crop types: key for translations, value for HubSpot internal name
const CROP_TYPES: Record<string, string> = {
  "Brassica": "Brassica - Kohl - Brassica - Kool - Kål",
  "Herbs": "Herbs - Kräuter - Herbes - Kruiden - Krydderurter",
  "Cereals": "Cereals - Getreide - Céréales - Granen - Korn",
  "Fodder beet": "Fodder beet - Futterrübe - Betterave fourragère - Voederbiet - Foderroe",
  "Sugar beet": "Sugar beet - Zuckerrübe - Betterave sucrière - Suikerbiet - Sukkerroe",
  "Red beet": "Red beet - Rote Bete - Betterave rouge - Rode biet - Rødbede",
  "Onion": "Onion - Zwiebel - Oignon - Ui - Løg",
  "Endives": "Endives - Endivie - Endive - Andijvie - Endivie",
  "Chicory": "Chicory - Zichorie - Chicorée - Cichorei - Cikorie",
  "Canola/Rape seed": "Canola/Rape seed - Raps - Colza - Koolzaad - Raps",
  "Carrot": "Carrot - Karotte/Möhre - Carotte - Wortel - Gulerod",
  "Field beans": "Field beans - Ackerbohne - Fève - Veldboon - Hestebønne",
  "Peas": "Peas - Erbse - Pois - Erwt - Ært",
  "Chickpea": "Chickpea - Kichererbse - Pois chiche - Kikkererwt - Kikært",
  "Soy bean": "Soy bean - Sojabohne - Soja - Sojaboon - Sojabønne",
  "Lupin": "Lupin - Lupine - Lupin - Lupine - Lupin",
  "Lentils": "Lentils - Linse - Lentille - Linze - Linse",
  "Fodder corn": "Fodder corn - Futtermais - Maïs fourrager - Voedermaïs - Fodermajs",
  "Sweet corn": "Sweet corn - Zuckermais - Maïs doux - Suikermaïs - majs",
  "Pumpkin": "Pumpkin - Kürbis - Potiron/Citrouille - Pompoen - Græskar",
  "Quinoa": "Quinoa - Quinoa - Quinoa - Quinoa - Quinoa",
  "Sunflower": "Sunflower - Sonnenblume - Tournesol - Zonnebloem - Solsikke",
  "Lettuce": "Lettuce - Salat - Laitue - Sla - Salat",
};

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  company: string;
  isFarmer: string;
  farmingType: string;
  farmSize: string;
  hectaresForFarmDroid: string;
  crops: string;
  otherCrops: string;
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
    country: "",
    region: "",
    company: "",
    isFarmer: "",
    farmingType: "",
    farmSize: "",
    hectaresForFarmDroid: "",
    crops: "",
    otherCrops: "",
    contactByPartner: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadData, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [cropsDropdownOpen, setCropsDropdownOpen] = useState(false);
  const cropsDropdownRef = useRef<HTMLDivElement>(null);

  // Close crops dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cropsDropdownRef.current && !cropsDropdownRef.current.contains(event.target as Node)) {
        setCropsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected crops as array (HubSpot internal values)
  const selectedCropsHubspot = formData.crops ? formData.crops.split(";").map(s => s.trim()).filter(Boolean) : [];

  // Get crop key from HubSpot value
  const getCropKeyFromHubspot = (hubspotValue: string): string | undefined => {
    return Object.keys(CROP_TYPES).find(key => CROP_TYPES[key] === hubspotValue);
  };

  // Check if a crop (by key) is selected
  const isCropSelected = (cropKey: string): boolean => {
    return selectedCropsHubspot.includes(CROP_TYPES[cropKey]);
  };

  // Toggle crop selection (stores HubSpot internal values)
  const toggleCrop = (cropKey: string) => {
    const hubspotValue = CROP_TYPES[cropKey];
    const newCrops = isCropSelected(cropKey)
      ? selectedCropsHubspot.filter(c => c !== hubspotValue)
      : [...selectedCropsHubspot, hubspotValue];
    handleChange("crops", newCrops.join(";"));
  };

  // Get display names for selected crops
  const getSelectedCropsDisplay = (): string => {
    return selectedCropsHubspot
      .map(hv => getCropKeyFromHubspot(hv))
      .filter(Boolean)
      .map(key => t(`cropTypes.${key}`))
      .join(", ");
  };

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
      case "isFarmer":
        return typeof value === "string" && value === "" ? t("errors.isFarmerRequired") : "";
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
    const requiredFields: (keyof LeadData)[] = ["isFarmer", "firstName", "lastName", "email", "company", "country"];

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

    // Call parent handler - parent will handle loading state and API call
    onSubmit(formData);
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

      {/* Are you a farmer? */}
      <div>
        <label className="text-sm font-medium text-stone-700">
          {t("isFarmer")} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isFarmer"
              value="yes"
              checked={formData.isFarmer === "yes"}
              onChange={(e) => handleChange("isFarmer", e.target.value)}
              className="h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer"
            />
            <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
              {t("yes")}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isFarmer"
              value="no"
              checked={formData.isFarmer === "no"}
              onChange={(e) => handleChange("isFarmer", e.target.value)}
              className="h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer"
            />
            <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
              {t("no")}
            </span>
          </label>
        </div>
        {errors.isFarmer && touched.isFarmer && (
          <p className="mt-1 text-xs text-red-500">{errors.isFarmer}</p>
        )}
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
            {ALL_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
        </div>
        {errors.country && touched.country && (
          <p className="mt-1 text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* Region */}
      <div>
        <label className="text-sm font-medium text-stone-700">{t("region")}</label>
        <input
          type="text"
          value={formData.region}
          onChange={(e) => handleChange("region", e.target.value)}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          placeholder={t("regionPlaceholder")}
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

      {/* Organic or Conventional? */}
      <div className={formData.isFarmer === "no" ? "opacity-50" : ""}>
        <label className="text-sm font-medium text-stone-700">{t("farmingType")}</label>
        <div className="flex gap-6 mt-2">
          <label className={`flex items-center gap-2 group ${formData.isFarmer === "no" ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input
              type="radio"
              name="farmingType"
              value="Conventional"
              checked={formData.farmingType === "Conventional"}
              onChange={(e) => handleChange("farmingType", e.target.value)}
              disabled={formData.isFarmer === "no"}
              className="h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
              {t("farmingTypes.conventional")}
            </span>
          </label>
          <label className={`flex items-center gap-2 group ${formData.isFarmer === "no" ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input
              type="radio"
              name="farmingType"
              value="Organic"
              checked={formData.farmingType === "Organic"}
              onChange={(e) => handleChange("farmingType", e.target.value)}
              disabled={formData.isFarmer === "no"}
              className="h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
              {t("farmingTypes.organic")}
            </span>
          </label>
          <label className={`flex items-center gap-2 group ${formData.isFarmer === "no" ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input
              type="radio"
              name="farmingType"
              value="Both"
              checked={formData.farmingType === "Both"}
              onChange={(e) => handleChange("farmingType", e.target.value)}
              disabled={formData.isFarmer === "no"}
              className="h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
              {t("farmingTypes.both")}
            </span>
          </label>
        </div>
      </div>

      {/* Farm Size */}
      <div className={formData.isFarmer === "no" ? "opacity-50" : ""}>
        <label className="text-sm font-medium text-stone-700">{t("farmSize")}</label>
        <input
          type="number"
          value={formData.farmSize}
          onChange={(e) => handleChange("farmSize", e.target.value)}
          disabled={formData.isFarmer === "no"}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
          placeholder={t("farmSizePlaceholder")}
          min="0"
        />
      </div>

      {/* Hectares relevant for FarmDroid */}
      <div className={formData.isFarmer === "no" ? "opacity-50" : ""}>
        <label className="text-sm font-medium text-stone-700">{t("hectaresForFarmDroid")}</label>
        <input
          type="number"
          value={formData.hectaresForFarmDroid}
          onChange={(e) => handleChange("hectaresForFarmDroid", e.target.value)}
          disabled={formData.isFarmer === "no"}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
          placeholder={t("hectaresPlaceholder")}
          min="0"
        />
        <p className="mt-1 text-xs text-stone-400">{t("hectaresHint")}</p>
      </div>

      {/* Crops - Multi-select */}
      <div className={formData.isFarmer === "no" ? "opacity-50" : ""} ref={cropsDropdownRef}>
        <label className="text-sm font-medium text-stone-700">{t("crops")}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => !formData.isFarmer || formData.isFarmer !== "no" ? setCropsDropdownOpen(!cropsDropdownOpen) : null}
            disabled={formData.isFarmer === "no"}
            className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed text-left flex items-center justify-between"
          >
            <span className={selectedCropsHubspot.length === 0 ? "text-stone-400" : "text-stone-900 truncate"}>
              {selectedCropsHubspot.length === 0
                ? t("selectCrops")
                : getSelectedCropsDisplay()}
            </span>
            <ChevronDown className={`h-5 w-5 text-stone-400 transition-transform ${cropsDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {cropsDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {Object.keys(CROP_TYPES).map((cropKey) => (
                <label
                  key={cropKey}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-stone-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isCropSelected(cropKey)}
                    onChange={() => toggleCrop(cropKey)}
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-sm text-stone-700">{t(`cropTypes.${cropKey}`)}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Other Crops - Free text */}
      <div className={formData.isFarmer === "no" ? "opacity-50" : ""}>
        <label className="text-sm font-medium text-stone-700">{t("otherCrops")}</label>
        <input
          type="text"
          value={formData.otherCrops}
          onChange={(e) => handleChange("otherCrops", e.target.value)}
          disabled={formData.isFarmer === "no"}
          className="w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
          placeholder={t("otherCropsPlaceholder")}
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
