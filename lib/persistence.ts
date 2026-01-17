// Configuration persistence utilities for localStorage

import { ConfiguratorState, DEFAULT_CONFIG } from "./configurator-data";

const STORAGE_KEY = "farmdroid-configurator-state";
const STORAGE_STEP_KEY = "farmdroid-configurator-step";
const STORAGE_VERSION = 1;

interface StoredState {
  version: number;
  config: ConfiguratorState;
  step: number;
  highestStepReached: number;
  timestamp: number;
}

/**
 * Save configuration state to localStorage
 */
export function saveConfiguration(config: ConfiguratorState, step: number, highestStepReached: number): void {
  if (typeof window === "undefined") return;

  try {
    const state: StoredState = {
      version: STORAGE_VERSION,
      config,
      step,
      highestStepReached,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save configuration to localStorage:", error);
  }
}

/**
 * Load configuration state from localStorage
 * Returns null if no saved state or if state is invalid/outdated
 */
export function loadConfiguration(): StoredState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: StoredState = JSON.parse(stored);

    // Check version compatibility
    if (state.version !== STORAGE_VERSION) {
      clearConfiguration();
      return null;
    }

    // Validate that all required fields exist
    if (!isValidConfig(state.config)) {
      clearConfiguration();
      return null;
    }

    return state;
  } catch (error) {
    console.warn("Failed to load configuration from localStorage:", error);
    clearConfiguration();
    return null;
  }
}

/**
 * Check if saved configuration exists and is recent (within 7 days)
 */
export function hasSavedConfiguration(): boolean {
  if (typeof window === "undefined") return false;

  const state = loadConfiguration();
  if (!state) return false;

  // Check if configuration is less than 7 days old
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - state.timestamp < sevenDaysMs;
}

/**
 * Clear saved configuration
 */
export function clearConfiguration(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear configuration from localStorage:", error);
  }
}

/**
 * Validate that a config object has all required fields
 */
function isValidConfig(config: unknown): config is ConfiguratorState {
  if (!config || typeof config !== "object") return false;

  const c = config as Record<string, unknown>;

  // Check essential fields exist
  const requiredFields = [
    "currency",
    "baseRobot",
    "powerSource",
    "frontWheel",
    "wheelSpacing",
    "seedSize",
    "activeRows",
    "rowDistance",
    "servicePlan",
  ];

  for (const field of requiredFields) {
    if (!(field in c)) return false;
  }

  return true;
}

/**
 * Format the saved timestamp as a readable string
 */
export function formatSavedTime(timestamp: number, locale: string = "en"): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return locale === "da" ? "lige nu" : "just now";
  if (minutes < 60) return locale === "da" ? `${minutes} min siden` : `${minutes}m ago`;
  if (hours < 24) return locale === "da" ? `${hours} timer siden` : `${hours}h ago`;
  return locale === "da" ? `${days} dage siden` : `${days}d ago`;
}
