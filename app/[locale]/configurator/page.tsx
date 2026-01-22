"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Globe, Check, ChevronDown, Save, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { decodeConfigPageData } from "@/lib/config-page-utils";
import { useToastActions } from "@/components/ui/toast";
import { useKeyboardShortcuts, useFocusTrap } from "@/hooks/use-focus-trap";
import { useMode } from "@/contexts/ModeContext";
import {
  ConfiguratorState,
  DEFAULT_CONFIG,
  STEPS,
  calculatePrice,
  calculatePassiveRows,
  formatPrice,
  Currency,
  PRICES,
} from "@/lib/configurator-data";
import {
  saveConfiguration,
  loadConfiguration,
  hasSavedConfiguration,
  clearConfiguration,
  formatSavedTime,
} from "@/lib/persistence";
import { locales, localeNames, type Locale } from "@/i18n/config";

// Step Components
import { StepBaseRobot } from "@/components/configurator/step-base-robot";
import { StepPowerSource } from "@/components/configurator/step-power-source";
import { StepFrontWheel } from "@/components/configurator/step-front-wheel";
import { StepRowConfig } from "@/components/configurator/step-row-config";
import { StepSpraySystem } from "@/components/configurator/step-spray-system";
import { StepAccessories } from "@/components/configurator/step-accessories";
import { StepServicePlan } from "@/components/configurator/step-service-plan";
import { StepSummary } from "@/components/configurator/step-summary";

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
};


// Language selector component
function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");

  // Get current locale from pathname
  const currentLocale = pathname.split("/")[1] as Locale;

  const switchLocale = (newLocale: Locale) => {
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-50"
            role="listbox"
            aria-label={t("select")}
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                role="option"
                aria-selected={locale === currentLocale}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                  locale === currentLocale
                    ? "text-stone-900 font-medium bg-stone-50"
                    : "text-stone-600"
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Price breakdown tooltip component
function PriceBreakdownTooltip({
  priceBreakdown,
  currency,
  config,
  isOpen,
  onToggle,
}: {
  priceBreakdown: ReturnType<typeof calculatePrice>;
  currency: Currency;
  config: ConfiguratorState;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("priceBreakdown");
  const tCommon = useTranslations("common");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const passiveRowCount = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);

  const items = [
    { key: "baseRobot", value: priceBreakdown.baseRobot, label: t("baseRobot") },
    { key: "powerSource", value: priceBreakdown.powerSource, label: t("powerSource") },
    { key: "frontWheel", value: priceBreakdown.frontWheel, label: t("frontWheel") },
    { key: "activeRows", value: priceBreakdown.activeRows, label: t("activeRowsWithCount", { count: config.activeRows, size: config.seedSize }) },
    { key: "passiveRows", value: 0, included: true, label: t("passiveRowsWithCount", { count: passiveRowCount }), show: passiveRowCount > 0 },
    { key: "spraySystem", value: priceBreakdown.spraySystem, label: t("spraySystem") },
    { key: "accessories", value: priceBreakdown.accessories, label: t("accessories") },
    { key: "warrantyExtension", value: priceBreakdown.warrantyExtension, label: t("warrantyExtension") },
  ].filter((item) => item.value > 0 || item.show);

  // Calculate dropdown position based on button
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
        aria-expanded={isOpen}
        aria-label={t("title")}
      >
        <span>{t("title")}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {mounted && isOpen && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={onToggle}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: getDropdownPosition().top,
              right: getDropdownPosition().right,
            }}
            className="w-64 bg-white rounded-lg shadow-xl border border-stone-200 p-4 z-[9999]"
            role="tooltip"
          >
            <h3 className="text-sm font-semibold text-stone-900 mb-3">{t("title")}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.label}</span>
                  <span className="text-stone-900 font-medium">
                    {item.included ? tCommon("included") : formatPrice(item.value, currency)}
                  </span>
                </div>
              ))}
              <div className="border-t border-stone-200 pt-2 mt-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-stone-900">{t("total")}</span>
                  <span className="text-stone-900">
                    {formatPrice(priceBreakdown.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// Resume configuration modal
function ResumeConfigurationModal({
  savedTime,
  onResume,
  onStartFresh,
  locale,
}: {
  savedTime: number;
  onResume: () => void;
  onStartFresh: () => void;
  locale: string;
}) {
  const t = useTranslations("persistence");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-dialog-title"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
      >
        <h2 id="resume-dialog-title" className="text-xl font-semibold text-stone-900 mb-2">
          {t("resumeTitle")}
        </h2>
        <p className="text-stone-600 mb-6">
          {t("resumeMessage", { time: formatSavedTime(savedTime, locale) })}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStartFresh}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {t("startFreshButton")}
          </button>
          <button
            onClick={onResume}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
            autoFocus
          >
            {t("resumeButton")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConfiguratorContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState<ConfiguratorState>(DEFAULT_CONFIG);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedState, setSavedState] = useState<{ config: ConfiguratorState; step: number; highestStepReached: number; timestamp: number } | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [previousTotal, setPreviousTotal] = useState<number | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [configPreFilled, setConfigPreFilled] = useState(false);
  const [preFilledLead, setPreFilledLead] = useState<{ firstName: string; lastName: string; email: string; phone: string; company: string; country: string; countryOther: string; farmSize: string; hectaresForFarmDroid: string; crops: string; contactByPartner: boolean; marketingConsent: boolean } | null>(null);
  const [existingReference, setExistingReference] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = pathname.split("/")[1] as Locale;
  const toast = useToastActions();
  const { showPrices } = useMode();

  const t = useTranslations("navigation");
  const tSteps = useTranslations("steps");
  const tService = useTranslations("servicePlan");
  const tCommon = useTranslations("common");
  const tPublic = useTranslations("publicMode");

  const priceBreakdown = calculatePrice(config, highestStepReached);

  // Check for config parameter to pre-fill from personal config page
  useEffect(() => {
    const configParam = searchParams.get("config");
    if (configParam && !configPreFilled) {
      try {
        const decoded = decodeConfigPageData(configParam);
        if (decoded?.config) {
          setConfig(decoded.config);
          setConfigPreFilled(true);
          // Also save lead data if present (add default for hectaresForFarmDroid for backward compatibility)
          if (decoded.lead) {
            setPreFilledLead({
              ...decoded.lead,
              hectaresForFarmDroid: decoded.lead.hectaresForFarmDroid ?? "",
            });
          }
          // Store the reference if editing an existing configuration
          if (decoded.reference) {
            setExistingReference(decoded.reference);
          }
          // Skip the resume modal if we have pre-filled config
          setShowResumeModal(false);
          // Clear the URL parameter to avoid re-triggering
          const url = new URL(window.location.href);
          url.searchParams.delete("config");
          window.history.replaceState({}, "", url.toString());
        }
      } catch (error) {
        console.error("Failed to decode config from URL:", error);
      }
    }
  }, [searchParams, configPreFilled]);

  // Check for saved configuration on mount
  useEffect(() => {
    // Skip if we pre-filled from URL or if there's a config param in URL
    if (configPreFilled) return;
    const hasConfigParam = searchParams.get("config");
    if (hasConfigParam) return; // Will be handled by config param effect

    if (hasSavedConfiguration()) {
      const saved = loadConfiguration();
      if (saved) {
        setSavedState({
          config: saved.config,
          step: saved.step,
          highestStepReached: saved.highestStepReached || saved.step,
          timestamp: saved.timestamp
        });
        setShowResumeModal(true);
      }
    }
  }, [configPreFilled, searchParams]);

  // Auto-save configuration on changes
  useEffect(() => {
    // Don't save if we're showing the resume modal (initial load)
    if (!showResumeModal && config !== DEFAULT_CONFIG) {
      saveConfiguration(config, currentStep, highestStepReached);
      setLastSavedTime(Date.now());
    }
  }, [config, currentStep, highestStepReached, showResumeModal]);

  // Track price changes for animation
  useEffect(() => {
    if (previousTotal !== null && previousTotal !== priceBreakdown.total) {
      // Price changed - could trigger animation here
    }
    setPreviousTotal(priceBreakdown.total);
  }, [priceBreakdown.total, previousTotal]);

  // Keyboard shortcuts for step navigation
  useKeyboardShortcuts(
    {
      arrowright: () => {
        if (currentStep < STEPS.length) {
          nextStep();
        }
      },
      arrowleft: () => {
        if (currentStep > 1) {
          prevStep();
        }
      },
      escape: () => {
        if (showPriceBreakdown) {
          setShowPriceBreakdown(false);
        }
      },
    },
    !showResumeModal // Disable shortcuts when modal is open
  );

  // Get translated step titles
  const stepKeys = [
    "baseRobot",
    "wheelConfig",
    "seedConfig",
    "weedConfig",
    "powerSource",
    "accessories",
    "servicePlan",
    "summary",
  ] as const;

  const translatedSteps = STEPS.map((step, index) => ({
    ...step,
    title: tSteps(`${stepKeys[index]}.title`),
    subtitle: tSteps(`${stepKeys[index]}.subtitle`),
  }));

  const updateConfig = useCallback((updates: Partial<ConfiguratorState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    setHighestStepReached((prev) => Math.max(prev, step));
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      setDirection(1);
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setHighestStepReached((prev) => Math.max(prev, newStep));
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setCurrentStep(1);
    setHighestStepReached(1);
    setDirection(-1);
    clearConfiguration();
    setLastSavedTime(null);
    toast.info(tCommon("configurationReset"));
  }, [toast, tCommon]);

  const handleResume = useCallback(() => {
    if (savedState) {
      setConfig(savedState.config);
      setCurrentStep(savedState.step);
      setHighestStepReached(savedState.highestStepReached);
    }
    setShowResumeModal(false);
  }, [savedState]);

  const handleStartFresh = useCallback(() => {
    clearConfiguration();
    setShowResumeModal(false);
  }, []);

  const renderStepContent = () => {
    const commonProps = {
      config,
      updateConfig,
      priceBreakdown,
    };

    switch (currentStep) {
      case 1:
        return <StepBaseRobot {...commonProps} />;
      case 2:
        return <StepFrontWheel {...commonProps} />;
      case 3:
        return <StepRowConfig {...commonProps} />;
      case 4:
        return <StepSpraySystem {...commonProps} />;
      case 5:
        return <StepPowerSource {...commonProps} />;
      case 6:
        return <StepAccessories {...commonProps} />;
      case 7:
        return <StepServicePlan {...commonProps} />;
      case 8:
        return <StepSummary {...commonProps} onReset={resetConfig} initialLead={preFilledLead} existingReference={existingReference} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Resume Configuration Modal */}
      <AnimatePresence>
        {showResumeModal && savedState && (
          <ResumeConfigurationModal
            savedTime={savedState.timestamp}
            onResume={handleResume}
            onStartFresh={handleStartFresh}
            locale={currentLocale}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-stone-100 sticky top-0 z-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-5">
          <div className="flex items-center justify-between">
            {/* Enhanced Progress Steps - Compact with checkmarks */}
            <nav aria-label="Configuration progress" className="flex items-center gap-0.5 md:gap-1">
              {translatedSteps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className="group relative flex items-center"
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${step.title}${isCompleted ? ` - ${t("completed")}` : ""}`}
                  >
                    {/* Step indicator */}
                    {isCompleted ? (
                      // Completed step - show checkmark
                      <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-emerald-500 flex items-center justify-center transition-all">
                        <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" aria-hidden="true" />
                      </div>
                    ) : isCurrent ? (
                      // Current step - show number with active styling
                      <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-stone-900 flex items-center justify-center transition-all">
                        <span className="text-[10px] md:text-xs font-semibold text-white">{step.id}</span>
                      </div>
                    ) : (
                      // Future step - show number with muted styling
                      <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-stone-200 flex items-center justify-center transition-all group-hover:bg-stone-300">
                        <span className="text-[10px] md:text-xs font-medium text-stone-500">{step.id}</span>
                      </div>
                    )}

                    {/* Connector line */}
                    {index < translatedSteps.length - 1 && (
                      <div className={`w-2 md:w-4 h-0.5 transition-colors ${
                        isCompleted ? "bg-emerald-500" : "bg-stone-200"
                      }`} aria-hidden="true" />
                    )}

                    {/* Tooltip on hover */}
                    <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {step.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Language Selector, Currency Selector & Price Display */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Currency Toggle - Only shown in partner mode */}
              {showPrices && (
                <div className="flex items-center bg-stone-100 rounded-lg p-0.5" role="radiogroup" aria-label="Currency">
                  {(["EUR", "DKK"] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => updateConfig({ currency: curr })}
                      role="radio"
                      aria-checked={config.currency === curr}
                      className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                        config.currency === curr
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}

              {/* Configuration summary - Shown in public mode */}
              {!showPrices && (
                <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-500" />
                    FD20
                  </span>
                  {config.activeRows > 0 && (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" />
                      {config.activeRows} rows
                    </span>
                  )}
                  {config.frontWheel !== "PFW" && (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" />
                      {config.frontWheel}
                    </span>
                  )}
                  {config.spraySystem && (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" />
                      +SPRAY
                    </span>
                  )}
                  {config.starterKit && (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" />
                      Starter Kit
                    </span>
                  )}
                </div>
              )}

              {/* Price with breakdown - Only shown in partner mode */}
              {showPrices && (
                <div className="text-right min-w-[140px] md:min-w-[200px]">
                  {/* Live region for price announcements */}
                  <div aria-live="polite" aria-atomic="true" className="sr-only">
                    Total price: {formatPrice(priceBreakdown.total, config.currency)}
                  </div>

                  <motion.p
                    key={`${priceBreakdown.total}-${config.currency}`}
                    initial={{ scale: 1.08, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-lg md:text-2xl font-semibold text-stone-900 tracking-tight"
                  >
                    {formatPrice(priceBreakdown.total, config.currency)}
                  </motion.p>

                  {/* Price breakdown toggle */}
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <PriceBreakdownTooltip
                      priceBreakdown={priceBreakdown}
                      currency={config.currency}
                      config={config}
                      isOpen={showPriceBreakdown}
                      onToggle={() => setShowPriceBreakdown(!showPriceBreakdown)}
                    />
                  </div>

                  {/* Service plan indicator */}
                  <motion.div
                    key={`service-${config.servicePlan}-${config.currency}-${currentStep}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-end gap-1.5 mt-0.5"
                  >
                    {currentStep >= 7 && config.servicePlan === "premium" ? (
                      <>
                        <span className="text-xs text-stone-500">{tService("plans.premium.name")}:</span>
                        <span className="text-xs text-stone-400 line-through">
                          {formatPrice(PRICES.servicePlan.premium, config.currency)}/yr
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">
                          {formatPrice(0, config.currency)} {tCommon("firstYear")}
                        </span>
                      </>
                    ) : currentStep >= 7 && config.servicePlan === "standard" ? (
                      <span className="text-xs text-stone-500">
                        {tService("plans.standard.name")}: {formatPrice(PRICES.servicePlan.standard, config.currency)}/yr
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400">
                        — {config.currency === "EUR" ? "€" : "kr."}/yr
                      </span>
                    )}
                  </motion.div>

                  {/* Auto-save indicator */}
                  <AnimatePresence>
                    {lastSavedTime && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-end gap-1 mt-1"
                      >
                        <Save className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                        <span className="text-[10px] text-stone-400">{tCommon("autoSaved")}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual progress bar */}
        <div className="h-1 bg-stone-100" aria-hidden="true">
          <motion.div
            className="h-full bg-emerald-500"
            initial={false}
            animate={{ width: `${((currentStep - 1) / (translatedSteps.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Mobile step context - shows current step title on small screens */}
        <div className="sm:hidden bg-stone-50 border-b border-stone-100 px-4 py-2">
          <p className="text-sm font-medium text-stone-700 text-center">
            {translatedSteps[currentStep - 1].title}
          </p>
        </div>
      </header>

      {/* Public Mode Banner - Only shown when prices are hidden */}
      {!showPrices && (
        <div className="bg-emerald-50 border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-2.5">
            <p className="text-sm text-emerald-800 text-center">
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {tPublic("banner")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 35 },
              opacity: { duration: 0.15 },
            }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-stone-100 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Step indicator */}
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm text-stone-400">
                {t("stepOf", { current: currentStep, total: translatedSteps.length })}
              </span>
              <span className="text-xs md:text-sm font-medium text-stone-700 hidden sm:inline">
                {translatedSteps[currentStep - 1].title}
              </span>
            </div>

            {/* Navigation */}
            <nav aria-label="Step navigation" className="flex items-center gap-2 md:gap-3">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="h-11 px-3 md:px-5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("back")}</span>
                </button>
              )}

              {currentStep < translatedSteps.length ? (
                <button
                  onClick={nextStep}
                  className="h-11 px-4 md:px-6 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span className="hidden sm:inline">{t("continue")}</span>
                  <span className="sm:hidden">{t("next")}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  onClick={resetConfig}
                  className="h-11 px-4 md:px-5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("startOver")}</span>
                  <span className="sm:hidden">{t("reset")}</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ConfiguratorLoading() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-stone-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading configurator...</span>
      </div>
    </div>
  );
}

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={<ConfiguratorLoading />}>
      <ConfiguratorContent />
    </Suspense>
  );
}
