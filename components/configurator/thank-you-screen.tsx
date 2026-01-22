"use client";

import { motion } from "framer-motion";
import { Check, Mail, Phone, Handshake, RotateCcw, Cpu, Rows3, Zap, Circle, Droplets } from "lucide-react";
import { ConfiguratorState, calculatePassiveRows, calculateRowWorkingWidth } from "@/lib/configurator-data";
import { LeadData } from "./lead-capture-form";

interface ThankYouScreenProps {
  lead: LeadData;
  config: ConfiguratorState;
  onRestart: () => void;
}

export function ThankYouScreen({ lead, config, onRestart }: ThankYouScreenProps) {
  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);
  const workingWidth = calculateRowWorkingWidth(config.activeRows, config.rowDistance, config.frontWheel, config.rowSpacings);

  const steps = [
    {
      icon: Mail,
      title: "Check your email",
      description: "Your personalized quote is on its way",
    },
    {
      icon: Phone,
      title: "Expert consultation",
      description: "A FarmDroid expert will contact you within 24 hours",
    },
    {
      icon: Handshake,
      title: "Find your solution",
      description: "We'll help you find the perfect configuration",
    },
  ];

  return (
    <div className="py-8 md:py-12 max-w-2xl mx-auto">
      {/* Animated Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-24 w-24 rounded-full bg-brand-500 flex items-center justify-center"
          >
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.3, opacity: [0, 0.4, 0] }}
            transition={{ delay: 0.5, duration: 1, repeat: 2 }}
            className="absolute inset-0 rounded-full bg-brand-500"
          />
        </div>
      </motion.div>

      {/* Thank You Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
          Thank You, {lead.firstName}!
        </h1>
        <p className="text-lg text-stone-600">
          Your personalized quote is on its way to{" "}
          <span className="font-medium text-stone-900">{lead.email}</span>
        </p>
      </motion.div>

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-stone-50 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-4">What happens next?</h2>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border border-stone-200 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-medium text-stone-900">{step.title}</h3>
                  <p className="text-sm text-stone-500">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Configuration Summary (no prices) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white border border-stone-200 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Your Configuration</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2 border-b border-stone-100">
            <Cpu className="h-5 w-5 text-stone-400" />
            <span className="text-stone-700">FD20 Robot V2.6</span>
          </div>

          <div className="flex items-center gap-3 py-2 border-b border-stone-100">
            <Rows3 className="h-5 w-5 text-stone-400" />
            <span className="text-stone-700">
              {config.activeRows} active rows ({config.seedSize})
              {passiveRows > 0 && ` + ${passiveRows} passive rows`}
            </span>
          </div>

          <div className="flex items-center gap-3 py-2 border-b border-stone-100">
            <Circle className="h-5 w-5 text-stone-400" />
            <span className="text-stone-700">
              {config.frontWheel === "PFW"
                ? "Passive Front Wheel"
                : config.frontWheel === "AFW"
                ? "Active Front Wheel"
                : "Dual Front Wheel"}
            </span>
          </div>

          <div className="flex items-center gap-3 py-2 border-b border-stone-100">
            <Zap className="h-5 w-5 text-stone-400" />
            <span className="text-stone-700">
              {config.powerSource === "hybrid" ? "Hybrid Power (Solar + Generator)" : "Solar Powered"}
            </span>
          </div>

          {config.spraySystem && (
            <div className="flex items-center gap-3 py-2 border-b border-stone-100">
              <Droplets className="h-5 w-5 text-stone-400" />
              <span className="text-stone-700">+SPRAY System</span>
            </div>
          )}

          <div className="flex items-center gap-3 py-2">
            <span className="text-sm text-stone-500">Working Width:</span>
            <span className="font-medium text-stone-900">{(workingWidth / 10).toFixed(0)} cm</span>
          </div>
        </div>
      </motion.div>

      {/* Restart Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="text-center"
      >
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-700 font-medium transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
          Configure Another Robot
        </button>
      </motion.div>
    </div>
  );
}
