"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, X } from "lucide-react";
import {
  ConfiguratorState,
  PriceBreakdown,
  FrontWheel,
  formatPrice,
  PRICES,
} from "@/lib/configurator-data";

interface StepFrontWheelProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

interface WheelOption {
  id: FrontWheel;
  name: string;
  subtitle: string;
  wheelCount: "3-wheel" | "4-wheel";
  price: number;
  description: string;
}

const wheelOptions: WheelOption[] = [
  {
    id: "PFW",
    name: "Passive Front Wheel",
    subtitle: "Best for flat fields with wider row spacing (45–50 cm)",
    wheelCount: "3-wheel",
    price: 0,
    description: "The standard wheel configuration provides stability and smooth guidance on flat terrain. Ideal for crops with even row counts and wider row spacing, such as sugar beets (45–50 cm).",
  },
  {
    id: "AFW",
    name: "Active Front Wheel",
    subtitle: "Auto-tilting stability for slopes above 8%",
    wheelCount: "3-wheel",
    price: PRICES.frontWheel.AFW,
    description: "For hilly terrains, the Active Front Wheel adds an actuator that automatically tilts the front wheel to maintain stability. Recommended for slopes above 8% and side inclines over 5%, and for crops with even row numbers and wider spacing (around 45–50 cm).",
  },
  {
    id: "DFW",
    name: "Dual Front Wheel",
    subtitle: "Narrow row spacing down to 22.5 cm & bed systems",
    wheelCount: "4-wheel",
    price: PRICES.frontWheel.DFW,
    description: "Equipped with two front wheels instead of one, this setup enhances balance and precision, particularly for crops with narrow row spacing down to 22.5 cm. Perfect for flat fields and bed systems, works well with both even and uneven row counts.",
  },
];

// Info tooltip for individual options
function InfoTooltip({ description }: { description: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        aria-label="More information"
      >
        <Info className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
          >
            <div className="bg-stone-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
              {description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="border-8 border-transparent border-t-stone-900" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// SVG robot illustration based on wheel config
function RobotIllustration({ wheelConfig }: { wheelConfig: FrontWheel }) {
  const is3Wheel = wheelConfig === "PFW" || wheelConfig === "AFW";
  const isActive = wheelConfig === "AFW";

  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto max-w-md">
      {/* Robot body */}
      <rect x="40" y="35" width="120" height="55" rx="6" fill="#059669" />
      {/* Solar panels */}
      <rect x="32" y="20" width="136" height="15" rx="3" fill="#10b981" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={48 + i * 32} y1="20" x2={48 + i * 32} y2="35" stroke="#047857" strokeWidth="1" />
      ))}
      {/* Back wheels */}
      <circle cx="60" cy="105" r="16" fill="#374151" />
      <circle cx="60" cy="105" r="9" fill="#6b7280" />
      <circle cx="140" cy="105" r="16" fill="#374151" />
      <circle cx="140" cy="105" r="9" fill="#6b7280" />
      {/* Front wheel(s) */}
      {is3Wheel ? (
        <>
          <circle cx="100" cy="118" r="12" fill="#374151" />
          <circle cx="100" cy="118" r="7" fill="#6b7280" />
          {isActive && (
            <motion.circle
              cx="100"
              cy="118"
              r="4"
              fill="#f59e0b"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </>
      ) : (
        <>
          <circle cx="60" cy="125" r="10" fill="#374151" />
          <circle cx="60" cy="125" r="6" fill="#6b7280" />
          <circle cx="140" cy="125" r="10" fill="#374151" />
          <circle cx="140" cy="125" r="6" fill="#6b7280" />
        </>
      )}
      {/* Row tools */}
      <rect x="50" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
      <rect x="70" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
      <rect x="125" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
      <rect x="145" y="75" width="5" height="18" rx="1" fill="#f59e0b" />
    </svg>
  );
}

function WheelInfoPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Wheel Configurations</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Intro */}
              <div className="text-sm text-stone-600 leading-relaxed">
                <p>
                  Every field is different, and so is every FarmDroid. The FD20 can be tailored to your specific conditions with adjustable wheel distances, row numbers, and a choice of three front wheel configurations.
                </p>
                <p className="mt-3">
                  Your ideal setup depends on several parameters, including crop type, row spacing, soil conditions, and the slope of your field. The FD20's dual back wheels can be adjusted between <strong>160–230 cm</strong> in 10 cm increments.
                </p>
              </div>

              {/* Passive Front Wheel */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-stone-400" />
                  <h3 className="font-semibold text-stone-900">1. Passive Front Wheel</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  The standard wheel configuration provides stability and smooth guidance on flat terrain. Ideal for crops with even row counts and wider row spacing, such as sugar beets (45–50 cm).
                </p>
              </div>

              {/* Dual Front Wheel */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="font-semibold text-stone-900">2. Dual Front Wheel</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Equipped with two front wheels instead of one, this setup enhances balance and precision, particularly for crops with narrow row spacing down to 22.5 cm. Perfect for flat fields and bed systems, the Dual Front Wheel configuration works well with both even and uneven row counts. It can be selected for new robots or retrofitted to existing ones.
                </p>
              </div>

              {/* Active Front Wheel */}
              <div className="border-t border-stone-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="font-semibold text-stone-900">3. Active Front Wheel</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  For hilly terrains, the Active Front Wheel configuration adds an actuator that automatically tilts the front wheel to maintain stability. This intelligent tilting system distributes weight evenly across the back wheels, improving traction and minimizing front-end impact. Recommended for slopes above 8% and side inclines over 5%, and for crops with even row numbers and wider spacing (around 45–50 cm).
                </p>
              </div>

              {/* Footer note */}
              <div className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500 italic">
                  With these configuration options, you can fine-tune your FarmDroid to match your terrain, crops, and working style. Our robot specialists are always ready to help you design the setup that fits your farm best.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const pfwImages = [
  { src: "/farmdroid-pfw-side.png", label: "Side View" },
  { src: "/farmdroid-pfw.png", label: "Front View" },
];

export function StepFrontWheel({ config, updateConfig }: StepFrontWheelProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [pfwViewIndex, setPfwViewIndex] = useState(0);
  const selectedOption = wheelOptions.find(o => o.id === config.frontWheel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
      {/* Left: Product Image - Takes 3 columns */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Main visualization */}
        <div className="flex-1 flex items-center justify-center py-4 md:py-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={config.frontWheel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              {config.frontWheel === "AFW" ? (
                <div className="relative aspect-[16/10] w-full">
                  {/* Ground shadow */}
                  <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
                  <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
                  <div className="absolute bottom-[21%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />
                  <Image
                    src="/farmdroid-afw.png"
                    alt="FarmDroid FD20 - Active Front Wheel"
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                </div>
              ) : config.frontWheel === "PFW" ? (
                <div className="relative">
                  <div className="relative aspect-[16/10] w-full">
                    {/* Ground shadow */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-12 bg-stone-900/20 rounded-[100%] blur-3xl" />
                    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-8 bg-stone-900/30 rounded-[100%] blur-xl" />
                    <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-[55%] h-5 bg-stone-900/40 rounded-[100%] blur-lg" />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pfwViewIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={pfwImages[pfwViewIndex].src}
                          alt={`FarmDroid FD20 - Passive Front Wheel - ${pfwImages[pfwViewIndex].label}`}
                          fill
                          priority
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 60vw"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {/* View switcher dots */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {pfwImages.map((img, index) => (
                      <button
                        key={img.src}
                        onClick={() => setPfwViewIndex(index)}
                        className="group relative p-2"
                        aria-label={`Switch to ${img.label}`}
                      >
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            pfwViewIndex === index
                              ? "w-6 bg-stone-800"
                              : "w-2 bg-stone-300 hover:bg-stone-400"
                          }`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {img.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-lg mx-auto">
                  <RobotIllustration wheelConfig={config.frontWheel} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Config type indicator */}
        <div className="flex justify-center gap-6 md:gap-8 pt-4 md:pt-6 border-t border-stone-100">
          <div className={`text-center ${config.frontWheel !== "DFW" ? "opacity-100" : "opacity-40"}`}>
            <p className="text-base md:text-lg font-semibold text-stone-900">3-wheel</p>
            <p className="text-xs text-stone-500">Open field</p>
          </div>
          <div className={`text-center ${config.frontWheel === "DFW" ? "opacity-100" : "opacity-40"}`}>
            <p className="text-base md:text-lg font-semibold text-stone-900">4-wheel</p>
            <p className="text-xs text-stone-500">Bed config</p>
          </div>
        </div>
      </div>

      {/* Right: Configuration - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">Wheel Configuration</h1>
            <button
              onClick={() => setShowInfo(true)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Learn more about wheel configurations"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">Choose between 3-wheel and 4-wheel setup</p>
        </div>

        {/* Info Panel */}
        <WheelInfoPanel isOpen={showInfo} onClose={() => setShowInfo(false)} />

        {/* Options */}
        <div className="space-y-2 md:space-y-3">
          {wheelOptions.map((option) => {
            const isSelected = config.frontWheel === option.id;

            return (
              <button
                key={option.id}
                onClick={() => updateConfig({ frontWheel: option.id })}
                className={`w-full text-left p-4 md:p-5 rounded-lg border transition-all ${
                  isSelected
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-stone-900 text-sm md:text-base">{option.name}</p>
                      <InfoTooltip description={option.description} />
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-stone-900 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{option.subtitle}</p>
                  </div>
                  <span className="text-sm md:text-base font-medium text-stone-900 flex-shrink-0">
                    {option.price === 0 ? "Included" : `+${formatPrice(option.price, config.currency)}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info based on selection */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            {config.frontWheel === "DFW"
              ? "4-wheel configuration provides maximum stability. All wheels run outside the rows, ideal for bed cultivation."
              : config.frontWheel === "AFW"
              ? "Active front wheel provides better traction in soft soil conditions while maintaining open field capability."
              : "Passive front wheel runs between rows, allowing for wider working width in open field cultivation."}
          </p>
        </div>
      </div>
    </div>
  );
}
