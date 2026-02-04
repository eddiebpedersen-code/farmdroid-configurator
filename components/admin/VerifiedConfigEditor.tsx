"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { ModeProvider } from "@/contexts/ModeContext";
import { StepRowConfig } from "@/components/configurator/step-row-config";
import {
  ConfiguratorState,
  PriceBreakdown,
  DEFAULT_CONFIG,
} from "@/lib/configurator-data";
import type {
  VerifiedConfigurationRow,
  VerifiedRowConfig,
  VerifiedSeedSize,
} from "@/lib/admin/types";
import messages from "@/messages/en.json";

const ZERO_PRICE_BREAKDOWN: PriceBreakdown = {
  baseRobot: 0,
  powerSource: 0,
  frontWheel: 0,
  activeRows: 0,
  passiveRows: 0,
  spraySystem: 0,
  accessories: 0,
  servicePlan: 0,
  warrantyExtension: 0,
  total: 0,
};

function extractRowConfig(config: ConfiguratorState): VerifiedRowConfig {
  return {
    seedSize: config.seedSize,
    activeRows: config.activeRows,
    rowDistance: config.rowDistance,
    rowSpacings: config.rowSpacings,
    wheelSpacing: config.wheelSpacing,
    frontWheel: config.frontWheel,
    cropEmoji: config.cropEmoji,
    seedingMode: config.seedingMode,
    plantSpacing: config.plantSpacing,
    seedsPerGroup: config.seedsPerGroup,
    workingWidth: config.workingWidth,
    rowPlacementMode: config.rowPlacementMode || "field",
  };
}

interface VerifiedConfigEditorProps {
  initialConfig?: VerifiedConfigurationRow;
  onSave: (data: {
    name: string;
    description: string | null;
    config: VerifiedRowConfig;
    seed_size: VerifiedSeedSize;
    active_rows: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function VerifiedConfigEditor({ initialConfig, onSave, onCancel }: VerifiedConfigEditorProps) {
  const [name, setName] = useState(initialConfig?.name || "");
  const [description, setDescription] = useState(initialConfig?.description || "");
  const [seedSizeOption, setSeedSizeOption] = useState<VerifiedSeedSize>(initialConfig?.seed_size || "both");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build full ConfiguratorState from defaults + verified row config
  const [editorConfig, setEditorConfig] = useState<ConfiguratorState>(() => {
    if (initialConfig?.config) {
      return {
        ...DEFAULT_CONFIG,
        ...(initialConfig.config as Partial<ConfiguratorState>),
      };
    }
    return { ...DEFAULT_CONFIG };
  });

  const updateConfig = useCallback((updates: Partial<ConfiguratorState>) => {
    setEditorConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const rowConfig = extractRowConfig(editorConfig);
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        config: rowConfig,
        seed_size: seedSizeOption,
        active_rows: editorConfig.activeRows,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {initialConfig ? "Update Configuration" : "Save Configuration"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Metadata form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Configuration Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 6-row Sugar Beet Setup"
            className="w-full h-10 px-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of this setup"
            className="w-full h-10 px-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Seed Size
          </label>
          <div className="flex gap-2 h-10 items-center">
            {(["both", "6mm", "14mm"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSeedSizeOption(option)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  seedSizeOption === option
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                }`}
              >
                {option === "both" ? "Both" : option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded StepRowConfig */}
      <div className="rounded-lg border border-stone-200 bg-stone-50 overflow-hidden">
        <div className="px-4 py-3 bg-stone-100 border-b border-stone-200">
          <h3 className="text-sm font-medium text-stone-700">Row Configuration</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Use the interactive 2D view below to configure rows, spacing, and working width
          </p>
        </div>
        <div className="p-4">
          <NextIntlClientProvider messages={messages} locale="en">
            <ModeProvider>
              <StepRowConfig
                config={editorConfig}
                updateConfig={updateConfig}
                priceBreakdown={ZERO_PRICE_BREAKDOWN}
              />
            </ModeProvider>
          </NextIntlClientProvider>
        </div>
      </div>
    </div>
  );
}
