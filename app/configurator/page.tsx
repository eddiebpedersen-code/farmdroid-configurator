"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  ConfiguratorState,
  DEFAULT_CONFIG,
  STEPS,
  calculatePrice,
  formatPrice,
  Currency,
} from "@/lib/configurator-data";

// Step Components
import { StepBaseRobot } from "@/components/configurator/step-base-robot";
import { StepPowerSource } from "@/components/configurator/step-power-source";
import { StepFrontWheel } from "@/components/configurator/step-front-wheel";
import { StepRowConfig } from "@/components/configurator/step-row-config";
import { StepSpraySystem } from "@/components/configurator/step-spray-system";
import { StepAccessories } from "@/components/configurator/step-accessories";
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

export default function ConfiguratorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState<ConfiguratorState>(DEFAULT_CONFIG);

  const priceBreakdown = calculatePrice(config);

  const updateConfig = useCallback((updates: Partial<ConfiguratorState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
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
    setDirection(-1);
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
        return <StepSummary {...commonProps} onReset={resetConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-stone-100 sticky top-0 z-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-5">
          <div className="flex items-center justify-between">
            {/* Progress Steps */}
            <div className="flex items-center gap-0.5 md:gap-1">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className="group flex items-center"
                >
                  <div
                    className={`h-1.5 md:h-2 transition-all duration-300 rounded-full ${
                      step.id === currentStep
                        ? "w-5 md:w-8 bg-stone-900"
                        : step.id < currentStep
                        ? "w-1.5 md:w-2 bg-stone-400"
                        : "w-1.5 md:w-2 bg-stone-200"
                    }`}
                  />
                  {index < STEPS.length - 1 && (
                    <div className="w-0.5 md:w-1" />
                  )}
                  {/* Tooltip - hidden on mobile */}
                  <div className="hidden md:block absolute mt-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {step.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Currency Selector & Price Display */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Currency Toggle */}
              <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                {(["EUR", "DKK"] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => updateConfig({ currency: curr })}
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

              {/* Price */}
              <motion.p
                key={`${priceBreakdown.total}-${config.currency}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg md:text-2xl font-semibold text-stone-900 tracking-tight"
              >
                {formatPrice(priceBreakdown.total, config.currency)}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
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
      </div>

      {/* Clean Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-stone-100 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Step indicator */}
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm text-stone-400">
                {currentStep} / {STEPS.length}
              </span>
              <span className="text-xs md:text-sm font-medium text-stone-700 hidden sm:inline">
                {STEPS[currentStep - 1].title}
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 md:gap-3">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="h-11 md:h-10 px-3 md:px-5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button
                  onClick={nextStep}
                  className="h-11 md:h-10 px-4 md:px-6 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span className="hidden sm:inline">Continue</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={resetConfig}
                  className="h-11 md:h-10 px-4 md:px-5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Start Over</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
