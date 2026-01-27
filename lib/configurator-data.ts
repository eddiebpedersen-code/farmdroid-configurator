// FarmDroid Product Configurator Data & Types

// ============================================================================
// TYPES
// ============================================================================

export type PowerSource = "solar" | "hybrid";
export type FrontWheel = "PFW" | "AFW" | "DFW";
export type SeedSize = "6mm" | "14mm";
export type Currency = "EUR" | "DKK";
export type WheelConfig = "3-wheel" | "4-wheel";
export type RowPlacementMode = "bed" | "field" | "custom"; // bed = inside wheels only, field = inside + outside, custom = manual
export type ServicePlan = "none" | "standard" | "premium";
export type WeedingTool = "none" | "combiTool" | "weedCuttingDisc";
export type SeedingMode = "single" | "group" | "line";

export interface ConfiguratorState {
  // Currency selection
  currency: Currency;

  // Step 1: Base robot is always included
  baseRobot: boolean;

  // Step 2: Power source
  powerSource: PowerSource;

  // Step 3: Front wheel
  frontWheel: FrontWheel;

  // Step 4: Row configuration
  wheelSpacing: number; // distance between left and right wheels in mm (1500-2300)
  rowPlacementMode: RowPlacementMode; // bed, field, or custom
  seedSize: SeedSize;
  activeRows: number;
  rowDistance: number; // base row distance in mm between rows
  rowSpacings: number[]; // individual spacings between rows
  rowsOutsideLeft: number; // number of rows outside left wheel (field/custom mode)
  rowsOutsideRight: number; // number of rows outside right wheel (field/custom mode)

  // Seeding parameters (for capacity/speed calculation)
  seedingMode: SeedingMode; // single, group, or line seeding
  plantSpacing: number; // spacing between plants in cm (affects robot speed)
  seedsPerGroup: number; // number of seeds per drop point (1 for single, 2-15 for group)
  workingWidth: number; // actual working width in mm (may be customized)
  cropEmoji: string; // emoji of the selected crop for visualization

  // Step 4: Spray/Weed system
  spraySystem: boolean;
  weedingTool: WeedingTool;

  // Step 6: Accessories
  starterKit: boolean;
  roadTransport: boolean;
  fieldBracket: boolean;
  powerBank: boolean;
  fstFieldSetupTool: boolean;
  baseStationV3: boolean;
  essentialCarePackage: boolean;
  essentialCareSpray: boolean;
  additionalWeightKit: boolean;
  toolbox: boolean;

  // Step 7: Service & Warranty
  servicePlan: ServicePlan;
  warrantyExtension: boolean;
}

export interface StepInfo {
  id: number;
  title: string;
  subtitle: string;
}

export interface PriceBreakdown {
  baseRobot: number;
  powerSource: number;
  frontWheel: number;
  activeRows: number;
  passiveRows: number;
  spraySystem: number;
  accessories: number;
  servicePlan: number;
  warrantyExtension: number;
  total: number;
}

export interface CropPreset {
  name: string;
  seedSize: SeedSize;
  activeRows: number;
  rowDistance: number;
  icon: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const STEPS: StepInfo[] = [
  { id: 1, title: "Base Robot", subtitle: "FD20 Robot V2.6" },
  { id: 2, title: "Wheel Configuration", subtitle: "Select wheel configuration" },
  { id: 3, title: "+Seed Configuration", subtitle: "Configure your seeding setup" },
  { id: 4, title: "+Weed Configuration", subtitle: "Configure your weeding setup" },
  { id: 5, title: "Power Source", subtitle: "Choose your power configuration" },
  { id: 6, title: "Accessories", subtitle: "Additional equipment" },
  { id: 7, title: "Service & Warranty", subtitle: "Support and protection plans" },
  { id: 8, title: "Summary", subtitle: "Review your configuration" },
];

// Pricing constants (EUR)
export const PRICES = {
  baseRobot: 45990,

  powerSource: {
    solar: 0,
    hybrid: 8000,
  },

  frontWheel: {
    PFW: 0,
    AFW: 5000,
    DFW: 5000,
  },

  activeRow: {
    "6mm": 2500,
    "14mm": 4000,
  },

  passiveRow: 690,

  spraySystem: {
    base: 7000,
    perRow: 500,
  },

  accessories: {
    starterKit: 9880,
    roadTransport: 7890,
    fieldBracket: 700,
    powerBank: 5000,
    combiToolPerRow: 400,
    weedCuttingDiscPerRow: 360,
    fstFieldSetupTool: 1990,
    baseStationV3: 5790,
    essentialCarePackage: 3290,
    essentialCareSpray: 750,
    additionalWeightKit: 515,
    toolbox: 150,
  },

  servicePlan: {
    none: 0,
    standard: 595, // per year
    premium: 995, // per year (included 1st year for new robots)
  },

  warrantyExtension: 2000, // 2-year extension
};

// Pricing constants (DKK) — actual list prices from partner price list
export const PRICES_DKK: typeof PRICES = {
  baseRobot: 344925,

  powerSource: {
    solar: 0,
    hybrid: 59600,
  },

  frontWheel: {
    PFW: 0,
    AFW: 37500,
    DFW: 37500,
  },

  activeRow: {
    "6mm": 18750,
    "14mm": 29800,
  },

  passiveRow: 5175,

  spraySystem: {
    base: 52500,
    perRow: 3750,
  },

  accessories: {
    starterKit: 74100,
    roadTransport: 59175,
    fieldBracket: 5250,
    powerBank: 37500,
    combiToolPerRow: 3000,
    weedCuttingDiscPerRow: 2700,
    fstFieldSetupTool: 14925,
    baseStationV3: 43425,
    essentialCarePackage: 24675,
    essentialCareSpray: 5600,
    additionalWeightKit: 3850,
    toolbox: 1150,
  },

  servicePlan: {
    none: 0,
    standard: 4450, // per year
    premium: 7450, // per year (included 1st year for new robots)
  },

  warrantyExtension: 14900, // 2-year extension
};

/**
 * Get prices in the specified currency
 */
export function getPrices(currency: Currency = "EUR"): typeof PRICES {
  return currency === "DKK" ? PRICES_DKK : PRICES;
}

// Wheel configuration constraints
export const WHEEL_CONSTRAINTS = {
  minWheelSpacing: 1600, // 160cm minimum
  maxWheelSpacing: 2300, // 230cm maximum
  wheelSpacingIncrement: 100, // 10cm increments
  wheelWidth: 170, // 17cm wheel width
  minRowToWheelGap: 65, // 6.5cm clearance (wheel centered in min 30cm gap: (300-170)/2 = 65mm)
};

// Row configuration constraints
export const ROW_CONSTRAINTS = {
  maxWorkingWidth: 3400, // 3.4m in mm - matches toolbeam length
  maxActiveRows: 12,
  minRowDistance: {
    "6mm": 225,
    "14mm": 250,
  },
  passiveRowThreshold: 450, // Passive rows added when spacing >= 450mm
};

// Crop presets
export const CROP_PRESETS: CropPreset[] = [
  { name: "Sugar Beet", seedSize: "6mm", activeRows: 6, rowDistance: 500, icon: "🌱" },
  { name: "Carrot", seedSize: "6mm", activeRows: 10, rowDistance: 250, icon: "🥕" },
  { name: "Onion", seedSize: "14mm", activeRows: 8, rowDistance: 300, icon: "🧅" },
  { name: "Cabbage", seedSize: "14mm", activeRows: 6, rowDistance: 500, icon: "🥬" },
  { name: "Parsnip", seedSize: "6mm", activeRows: 8, rowDistance: 300, icon: "🥕" },
];

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const DEFAULT_CONFIG: ConfiguratorState = {
  currency: "EUR",
  baseRobot: true,
  powerSource: "solar",
  frontWheel: "PFW",
  wheelSpacing: 1800, // 180cm default wheel spacing
  rowPlacementMode: "field", // default to field config (rows can be inside and outside)
  seedSize: "6mm",
  activeRows: 4, // Default to 4 rows
  rowDistance: 500, // 50cm default
  rowSpacings: [500, 500, 500], // 3 gaps at 50cm for 4 rows
  rowsOutsideLeft: 0,
  rowsOutsideRight: 0,
  seedingMode: "single", // single seed placement
  plantSpacing: 18, // 18cm between plants
  seedsPerGroup: 1, // 1 seed per drop point
  workingWidth: 2000, // 200cm default working width
  cropEmoji: "🥕", // default crop emoji (carrot)
  spraySystem: false,
  weedingTool: "none",
  starterKit: false,
  roadTransport: false,
  fieldBracket: false,
  powerBank: false,
  fstFieldSetupTool: false,
  baseStationV3: false,
  essentialCarePackage: false,
  essentialCareSpray: false,
  additionalWeightKit: false,
  toolbox: false,
  servicePlan: "premium",
  warrantyExtension: false,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get wheel configuration (3-wheel or 4-wheel) based on front wheel choice
 * - PFW (Passive Front Wheel) = 3-wheel
 * - AFW (Active Front Wheel) = 3-wheel
 * - DFW (Dual Front Wheel) = 4-wheel
 */
export function getWheelConfig(frontWheel: FrontWheel): WheelConfig {
  return frontWheel === "DFW" ? "4-wheel" : "3-wheel";
}

/**
 * Get field configuration type based on front wheel choice
 * - 3-wheel (PFW/AFW) = open-field (front wheel runs between center rows)
 * - 4-wheel (DFW) = bed (all wheels outside rows)
 */
export function getFieldConfig(frontWheel: FrontWheel): "open-field" | "bed" {
  return frontWheel === "DFW" ? "bed" : "open-field";
}

/**
 * Calculate robot speed based on seeding mode and plant spacing
 * Line seeding runs at max speed (950 m/h)
 * Single/Group seeding speed depends on plant spacing (600-950 m/h)
 */
export function calculateRobotSpeed(
  seedingMode: SeedingMode,
  plantSpacingCm: number
): number {
  // Line seeding always runs at max speed
  if (seedingMode === "line") return 950;

  // Single/Group seeding - speed depends on plant spacing
  if (plantSpacingCm <= 10) return 600;
  if (plantSpacingCm >= 18) return 950;

  // Linear interpolation between 10-18cm
  // 600 m/h at 10cm, 950 m/h at 18cm
  return Math.round(600 + ((plantSpacingCm - 10) / 8) * 350);
}

/**
 * Calculate daily capacity in hectares based on speed, working width, and hours
 */
export function calculateDailyCapacity(
  speedMph: number,
  workingWidthMm: number,
  hoursPerDay: number
): number {
  const workingWidthM = workingWidthMm / 1000;
  return (speedMph * workingWidthM * hoursPerDay) / 10000;
}

/**
 * Check if the given row count is valid for the wheel configuration
 * - 3-wheel: Only even number of rows (front wheel must be centered between rows)
 * - 4-wheel: Any number of rows
 */
export function isValidRowCount(frontWheel: FrontWheel, rowCount: number): boolean {
  const wheelConfig = getWheelConfig(frontWheel);
  if (wheelConfig === "3-wheel") {
    return rowCount % 2 === 0; // Must be even
  }
  return true; // 4-wheel can do any count
}

/**
 * Calculate the front wheel position for 3-wheel config
 * Returns the position (in mm from left edge) where the front wheel is centered
 * For 3-wheel with even rows, it's exactly between the two middle rows
 */
export function getFrontWheelPosition(
  frontWheel: FrontWheel,
  rowPositions: number[],
  wheelSpacing: number
): number | null {
  const wheelConfig = getWheelConfig(frontWheel);

  if (wheelConfig === "4-wheel") {
    return null; // No single front wheel - has two front wheels at sides
  }

  // 3-wheel: front wheel is centered
  // For rows positioned relative to wheel center, the front wheel is at center (0)
  // But if we're showing absolute positions, we need to calculate based on row layout
  if (rowPositions.length === 0) return wheelSpacing / 2;

  // Front wheel is between the two middle rows
  const midIndex = rowPositions.length / 2;
  if (midIndex === Math.floor(midIndex) && rowPositions.length >= 2) {
    // Even number of rows - front wheel between rows at midIndex-1 and midIndex
    const leftMiddle = rowPositions[midIndex - 1];
    const rightMiddle = rowPositions[midIndex];
    return (leftMiddle + rightMiddle) / 2;
  }

  return wheelSpacing / 2; // Fallback to center
}

/**
 * Calculate wheel track positions (inner edges where crops can't be)
 * Returns { leftInner, rightInner } - the inner edges of the wheel tracks
 */
export function getWheelTrackPositions(wheelSpacing: number): {
  leftOuter: number;
  leftInner: number;
  rightInner: number;
  rightOuter: number;
} {
  const halfWidth = WHEEL_CONSTRAINTS.wheelWidth / 2;
  const leftWheelCenter = 0;
  const rightWheelCenter = wheelSpacing;

  return {
    leftOuter: leftWheelCenter - halfWidth,
    leftInner: leftWheelCenter + halfWidth,
    rightInner: rightWheelCenter - halfWidth,
    rightOuter: rightWheelCenter + halfWidth,
  };
}

/**
 * Generate row spacings array based on active rows and base distance
 * Creates n-1 gaps for n rows
 */
export function generateRowSpacings(activeRows: number, rowDistance: number): number[] {
  if (activeRows <= 1) return [];
  return Array(activeRows - 1).fill(rowDistance);
}

/**
 * Sync row spacings when active rows or base distance changes
 * Preserves existing spacings where possible
 * Creates n-1 gaps for n rows
 */
export function syncRowSpacings(
  currentSpacings: number[],
  activeRows: number,
  rowDistance: number
): number[] {
  const gapCount = Math.max(0, activeRows - 1);

  if (currentSpacings.length === gapCount) {
    return currentSpacings;
  }

  const newSpacings: number[] = [];
  for (let i = 0; i < gapCount; i++) {
    // Keep existing spacing if available, otherwise use base distance
    newSpacings.push(i < currentSpacings.length ? currentSpacings[i] : rowDistance);
  }
  return newSpacings;
}

/**
 * Calculate number of passive rows based on active rows and spacing
 * Uses the average spacing to determine if passive rows should be added
 * Note: Passive rows are included with active row pricing, not charged separately
 */
export function calculatePassiveRows(activeRows: number, rowDistance: number, rowSpacings?: number[]): number {
  if (activeRows <= 1) return 0; // Need at least 2 rows for passive rows between them

  const passiveMinSpacing = 225; // 22.5cm - same for both 6mm and 14mm
  const passiveThreshold = 450; // 45cm - passive rows appear at this spacing

  // Calculate passive rows in a single gap
  const getPassiveRowsInGap = (spacing: number): number => {
    if (spacing < passiveThreshold) return 0;
    return Math.floor(spacing / passiveMinSpacing) - 1;
  };

  // Use individual row spacings if available, otherwise use uniform rowDistance
  const effectiveSpacings = rowSpacings && rowSpacings.length === activeRows - 1
    ? rowSpacings
    : Array(activeRows - 1).fill(rowDistance);

  // Total inner passive = sum of passive rows in each gap
  const innerPassiveCount = effectiveSpacings.reduce((sum, s) => sum + getPassiveRowsInGap(s), 0);

  // Outer passive: 1 on the right when any gap has passive capability
  const outerPassiveCount = innerPassiveCount > 0 ? 1 : 0;

  return innerPassiveCount + outerPassiveCount;
}

/**
 * Calculate the span of rows (first row to last row distance)
 * This is the sum of all gaps between rows
 */
export function calculateRowSpan(rowSpacings: number[]): number {
  if (rowSpacings.length === 0) return 0;
  return rowSpacings.reduce((sum, s) => sum + s, 0);
}

/**
 * Detect if row spacings form an alternating pattern (exactly 2 values alternating)
 * Returns the two values if alternating, null otherwise
 */
export function detectAlternatingPattern(rowSpacings: number[]): { valueA: number; valueB: number } | null {
  if (rowSpacings.length < 2) return null;

  const uniqueValues = [...new Set(rowSpacings)];
  if (uniqueValues.length !== 2) return null;

  const [valueA, valueB] = uniqueValues;

  // Check if pattern alternates: A-B-A-B... or B-A-B-A...
  for (let i = 0; i < rowSpacings.length; i++) {
    const expected = i % 2 === 0 ? rowSpacings[0] : (rowSpacings[0] === valueA ? valueB : valueA);
    if (rowSpacings[i] !== expected) return null;
  }

  return { valueA, valueB };
}

/**
 * Detect if row spacings form a symmetric pattern (mirrors around center)
 * Examples:
 *   [25, 25, 25, 50, 25, 25, 25] - symmetric with center gap 50
 *   [25, 50, 50, 25] - symmetric, even length
 *   [30, 30, 30, 30] - uniform (special case of symmetric)
 * Returns the recommended between-pass spacing, null if not symmetric
 */
export function detectSymmetricPattern(rowSpacings: number[]): { betweenPassSpacing: number } | null {
  if (rowSpacings.length < 1) return null;

  const len = rowSpacings.length;

  // Check if all values are the same (uniform spacing)
  const allSame = rowSpacings.every(s => s === rowSpacings[0]);
  if (allSame) {
    return { betweenPassSpacing: rowSpacings[0] };
  }

  // Check if symmetric (mirrors around center)
  for (let i = 0; i < Math.floor(len / 2); i++) {
    if (rowSpacings[i] !== rowSpacings[len - 1 - i]) {
      return null; // Not symmetric
    }
  }

  // It's symmetric! Determine the between-pass spacing
  if (len % 2 === 1) {
    // Odd length: use the center value
    // e.g., [25, 25, 25, 50, 25, 25, 25] -> center is 50
    const centerIdx = Math.floor(len / 2);
    return { betweenPassSpacing: rowSpacings[centerIdx] };
  } else {
    // Even length: use the outer value (first/last spacing)
    // e.g., [25, 50, 50, 25] -> use 25 to continue the pattern
    return { betweenPassSpacing: rowSpacings[0] };
  }
}

/**
 * Calculate the between-pass spacing based on row pattern
 * Priority:
 *   1. Alternating patterns (A-B-A-B): returns the "other" value to continue alternation
 *   2. Symmetric patterns: returns center value (odd) or outer value (even) to maintain symmetry
 *   3. Non-pattern: returns the base rowDistance
 */
export function calculateBetweenPassSpacing(rowSpacings: number[], rowDistance: number): number {
  // First check for alternating pattern
  const alternating = detectAlternatingPattern(rowSpacings);
  if (alternating) {
    // Get outer spacing (first spacing in pattern)
    const outerSpacing = rowSpacings[0];
    // Return the OTHER value to continue alternation
    return outerSpacing === alternating.valueA ? alternating.valueB : alternating.valueA;
  }

  // Then check for symmetric pattern
  const symmetric = detectSymmetricPattern(rowSpacings);
  if (symmetric) {
    return symmetric.betweenPassSpacing;
  }

  // Non-pattern: use base row distance
  return rowDistance;
}

/**
 * Calculate simple row working width (distance from first to last row)
 * Used for visualization and basic validation
 * For 3-wheel config, also adds half the last row distance for weeding extension
 */
export function calculateRowWorkingWidth(
  activeRows: number,
  rowDistance: number,
  frontWheel: FrontWheel,
  rowSpacings?: number[]
): number {
  if (activeRows <= 0) return 0;

  // Calculate span from first row to last row
  const rowSpan = rowSpacings && rowSpacings.length > 0
    ? calculateRowSpan(rowSpacings)
    : (activeRows - 1) * rowDistance;

  const wheelConfig = getWheelConfig(frontWheel);

  // For 3-wheel, add half row distance on each side for weeding extension
  if (wheelConfig === "3-wheel") {
    return rowSpan + rowDistance; // Adds extension for proper weeding coverage
  }

  // For 4-wheel (bed config), just the row span
  return rowSpan;
}

/**
 * Calculate total working width (row span + between-pass spacing)
 * Working width = the total width covered by one pass, including the gap to the next pass
 */
export function calculateWorkingWidth(
  config: ConfiguratorState
): number {
  const { activeRows, rowDistance, rowSpacings, wheelSpacing } = config;

  if (activeRows <= 0) return 0;

  // Calculate span of all rows
  const effectiveRowSpacings = rowSpacings.length === activeRows - 1
    ? rowSpacings
    : generateRowSpacings(activeRows, rowDistance);
  const rowSpan = calculateRowSpan(effectiveRowSpacings);

  // For bed config, working width equals wheel spacing
  if (config.rowPlacementMode === "bed") {
    return wheelSpacing;
  }

  // For field/custom config, working width = rowSpan + betweenPassSpacing
  const betweenPassSpacing = calculateBetweenPassSpacing(effectiveRowSpacings, rowDistance);
  return rowSpan + betweenPassSpacing;
}

/**
 * Validate row configuration
 */
export function validateRowConfig(
  activeRows: number,
  rowDistance: number,
  seedSize: SeedSize,
  frontWheel: FrontWheel,
  rowSpacings?: number[]
): { valid: boolean; error?: string } {
  const minDistance = ROW_CONSTRAINTS.minRowDistance[seedSize];
  const workingWidth = calculateRowWorkingWidth(activeRows, rowDistance, frontWheel, rowSpacings);

  // Check minimum distance for base and all individual spacings
  if (rowDistance < minDistance) {
    return { valid: false, error: `Minimum row distance for ${seedSize} seeds is ${minDistance}mm` };
  }

  if (rowSpacings) {
    const belowMin = rowSpacings.find(s => s < minDistance);
    if (belowMin !== undefined) {
      return { valid: false, error: `All row spacings must be at least ${minDistance}mm for ${seedSize} seeds` };
    }
  }

  if (activeRows > ROW_CONSTRAINTS.maxActiveRows) {
    return { valid: false, error: `Maximum ${ROW_CONSTRAINTS.maxActiveRows} active rows allowed` };
  }

  if (workingWidth > ROW_CONSTRAINTS.maxWorkingWidth) {
    return { valid: false, error: `Working width (${workingWidth}mm) exceeds maximum ${ROW_CONSTRAINTS.maxWorkingWidth}mm` };
  }

  // Check 3-wheel constraint: only even rows allowed
  const wheelConfig = getWheelConfig(frontWheel);
  if (wheelConfig === "3-wheel" && activeRows % 2 !== 0) {
    return { valid: false, error: "3-wheel configuration requires an even number of rows (front wheel must be centered)" };
  }

  return { valid: true };
}

/**
 * Get the available weed cutting disc variant based on row distance
 * The disc requires the row distance to be evenly divisible by 225mm or 250mm
 * @param rowDistanceMm - The row distance in millimeters
 * @returns "225mm" or "250mm" if available, null if not compatible
 */
export function getWeedCuttingDiscVariant(rowDistanceMm: number): "225mm" | "250mm" | null {
  const divisibleBy225 = rowDistanceMm % 225 === 0;
  const divisibleBy250 = rowDistanceMm % 250 === 0;

  if (divisibleBy250) return "250mm"; // Prefer 250mm if both work
  if (divisibleBy225) return "225mm";
  return null; // Not compatible
}

/**
 * Check if an accessory is included in the Starter Kit
 */
export function isIncludedInStarterKit(accessoryId: string): boolean {
  const includedItems = ["fstFieldSetupTool", "baseStationV3", "essentialCarePackage", "fieldBracket"];
  return includedItems.includes(accessoryId);
}

/**
 * Calculate total price and breakdown
 * @param config - The configurator state
 * @param currentStep - Optional current step (1-8). When provided, only includes pricing for steps the user has reached.
 */
export function calculatePrice(config: ConfiguratorState, currentStep?: number, currency?: Currency): PriceBreakdown {
  const prices = getPrices(currency || config.currency);
  const baseRobot = prices.baseRobot;

  // Step 2: Front wheel configuration
  const frontWheel = currentStep === undefined || currentStep >= 2
    ? prices.frontWheel[config.frontWheel]
    : 0;

  // Step 3: Row/Seed configuration
  const activeRowPrice = prices.activeRow[config.seedSize];
  const activeRows = currentStep === undefined || currentStep >= 3
    ? config.activeRows * activeRowPrice
    : 0;

  const passiveRowCount = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);
  const passiveRows = currentStep === undefined || currentStep >= 3
    ? passiveRowCount * prices.passiveRow
    : 0;

  // Step 4: Spray/Weed system
  let spraySystem = 0;
  if (config.spraySystem && (currentStep === undefined || currentStep >= 4)) {
    spraySystem = prices.spraySystem.base + (config.activeRows * prices.spraySystem.perRow);
  }

  // Step 4: Weeding tools (part of weed config step)
  let weedingTools = 0;
  if (currentStep === undefined || currentStep >= 4) {
    if (config.weedingTool === "combiTool") {
      weedingTools = config.activeRows * prices.accessories.combiToolPerRow;
    } else if (config.weedingTool === "weedCuttingDisc") {
      weedingTools = config.activeRows * prices.accessories.weedCuttingDiscPerRow;
    }
  }

  // Step 5: Power source
  const powerSource = currentStep === undefined || currentStep >= 5
    ? prices.powerSource[config.powerSource]
    : 0;

  // Step 6: Accessories
  let accessories = 0;
  if (currentStep === undefined || currentStep >= 6) {
    if (config.starterKit) {
      // Starter Kit includes: FST Field Setup Tool, Base Station V3, Essential Care Package, Field Bracket
      accessories += prices.accessories.starterKit;
    } else {
      // Individual items (only charge if Starter Kit is NOT selected)
      if (config.fstFieldSetupTool) accessories += prices.accessories.fstFieldSetupTool;
      if (config.baseStationV3) accessories += prices.accessories.baseStationV3;
      if (config.essentialCarePackage) accessories += prices.accessories.essentialCarePackage;
      if (config.fieldBracket) accessories += prices.accessories.fieldBracket;
    }
    // Items NOT included in Starter Kit (always add if selected)
    if (config.roadTransport) accessories += prices.accessories.roadTransport;
    if (config.powerBank) accessories += prices.accessories.powerBank;
    // Essential Care Spray is automatically included when spray system is on AND (Starter Kit OR Essential Care Package is selected)
    const hasEssentialCare = config.starterKit || config.essentialCarePackage;
    if (config.spraySystem && hasEssentialCare) {
      accessories += prices.accessories.essentialCareSpray;
    }
    if (config.additionalWeightKit) accessories += prices.accessories.additionalWeightKit;
    if (config.toolbox) accessories += prices.accessories.toolbox;
  }

  // Step 7: Service & Warranty
  let servicePlan = 0;
  let warrantyExtension = 0;
  if (currentStep === undefined || currentStep >= 7) {
    servicePlan = prices.servicePlan[config.servicePlan];
    if (config.warrantyExtension) {
      warrantyExtension = prices.warrantyExtension;
    }
  }

  // Passive rows are included with active row pricing, not charged separately
  // Service plan is an annual subscription and not included in one-time total
  const total = baseRobot + powerSource + frontWheel + activeRows + spraySystem + weedingTools + accessories + warrantyExtension;

  return {
    baseRobot,
    powerSource,
    frontWheel,
    activeRows,
    passiveRows,
    spraySystem,
    accessories: accessories + weedingTools, // Include weeding tools in accessories for price breakdown
    servicePlan,
    warrantyExtension,
    total,
  };
}

// Currency conversion rate (approximate EUR to DKK, used as fallback)
export const EUR_TO_DKK_RATE = 7.45;

/**
 * Format currency in EUR or DKK.
 * Values should already be in the target currency (use getPrices() to get correct prices).
 */
export function formatPrice(value: number, currency: Currency = "EUR"): string {
  const locale = currency === "DKK" ? "da-DK" : "de-DE";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculate optimal wheel spacing based on row configuration
 * Goal: Position wheel CENTERS as close to the middle between rows as possible
 * Returns the recommended wheel spacing and a score (0 = perfect, higher = worse)
 */
export function calculateOptimalWheelSpacing(
  activeRows: number,
  rowDistance: number,
  rowSpacings: number[],
  frontWheel: FrontWheel
): { spacing: number; score: number; recommendation: string } {
  const { minWheelSpacing, maxWheelSpacing, wheelSpacingIncrement } = WHEEL_CONSTRAINTS;

  // Calculate total row span
  const rowSpan = rowSpacings.length > 0
    ? rowSpacings.reduce((sum, s) => sum + s, 0)
    : (activeRows - 1) * rowDistance;

  // Generate all row positions (centered around 0)
  const rowPositions: number[] = [];
  if (activeRows > 0) {
    let currentPos = -rowSpan / 2;
    for (let i = 0; i < activeRows; i++) {
      rowPositions.push(currentPos);
      if (i < rowSpacings.length) {
        currentPos += rowSpacings[i];
      } else if (i < activeRows - 1) {
        currentPos += rowDistance;
      }
    }
  }

  // Calculate gap midpoints (where we ideally want the wheel CENTERS)
  const gapMidpoints: number[] = [];
  for (let i = 0; i < rowPositions.length - 1; i++) {
    gapMidpoints.push((rowPositions[i] + rowPositions[i + 1]) / 2);
  }

  // Add virtual gaps outside the outermost rows (for field config)
  if (rowPositions.length > 0) {
    gapMidpoints.unshift(rowPositions[0] - rowDistance / 2);
    gapMidpoints.push(rowPositions[rowPositions.length - 1] + rowDistance / 2);
  }

  let bestSpacing = minWheelSpacing;
  let bestScore = Infinity;
  let bestClearance = 0;

  // Fallback tracking: if no spacing meets clearance, use the one with maximum clearance
  let fallbackSpacing = minWheelSpacing;
  let fallbackClearance = 0;

  const halfWheelWidth = WHEEL_CONSTRAINTS.wheelWidth / 2; // 85mm
  const minClearanceRequired = WHEEL_CONSTRAINTS.minRowToWheelGap; // 300mm (30cm)

  // Test each possible wheel spacing
  for (let spacing = minWheelSpacing; spacing <= maxWheelSpacing; spacing += wheelSpacingIncrement) {
    // Wheel centers are at -spacing/2 and +spacing/2 (symmetric around center)
    const leftWheelCenter = -spacing / 2;
    const rightWheelCenter = spacing / 2;

    // Calculate wheel edge positions
    const leftWheelInnerEdge = leftWheelCenter + halfWheelWidth;
    const leftWheelOuterEdge = leftWheelCenter - halfWheelWidth;
    const rightWheelInnerEdge = rightWheelCenter - halfWheelWidth;
    const rightWheelOuterEdge = rightWheelCenter + halfWheelWidth;

    // Check clearance from wheel EDGES to ALL rows
    let minClearance = Infinity;
    for (const rowPos of rowPositions) {
      // Check if row is inside either wheel (overlap)
      const inLeftWheel = rowPos > leftWheelOuterEdge && rowPos < leftWheelInnerEdge;
      const inRightWheel = rowPos > rightWheelInnerEdge && rowPos < rightWheelOuterEdge;

      if (inLeftWheel || inRightWheel) {
        minClearance = 0;
        break;
      }

      // Distance from row to nearest wheel edge
      const toLeftWheelInner = Math.abs(rowPos - leftWheelInnerEdge);
      const toLeftWheelOuter = Math.abs(rowPos - leftWheelOuterEdge);
      const toRightWheelInner = Math.abs(rowPos - rightWheelInnerEdge);
      const toRightWheelOuter = Math.abs(rowPos - rightWheelOuterEdge);

      const clearance = Math.min(toLeftWheelInner, toLeftWheelOuter, toRightWheelInner, toRightWheelOuter);
      minClearance = Math.min(minClearance, clearance);
    }

    // Track fallback (spacing with maximum clearance)
    if (minClearance > fallbackClearance) {
      fallbackClearance = minClearance;
      fallbackSpacing = spacing;
    }

    // Skip spacings that don't meet minimum clearance requirement
    if (minClearance < minClearanceRequired) continue;

    // Calculate alignment score (how far each wheel CENTER is from the nearest gap midpoint)
    let leftScore = Infinity;
    let rightScore = Infinity;

    for (const midpoint of gapMidpoints) {
      const leftDist = Math.abs(leftWheelCenter - midpoint);
      const rightDist = Math.abs(rightWheelCenter - midpoint);
      leftScore = Math.min(leftScore, leftDist);
      rightScore = Math.min(rightScore, rightDist);
    }

    // Combined score (lower is better)
    const totalScore = leftScore + rightScore;

    // Prefer wider spacing when scores are equal (use <= for wider preference)
    if (totalScore < bestScore || (totalScore === bestScore && spacing > bestSpacing)) {
      bestScore = totalScore;
      bestSpacing = spacing;
      bestClearance = minClearance;
    }
  }

  // If no spacing met clearance requirement, use the fallback with best clearance
  if (bestScore === Infinity) {
    bestSpacing = fallbackSpacing;
    bestClearance = fallbackClearance;
    bestScore = 999; // High score to indicate poor alignment
  }

  // Generate recommendation text based on clearance and alignment
  let recommendation = "";
  if (bestClearance < minClearanceRequired) {
    recommendation = "Warning - wheels may be too close to rows";
  } else if (bestScore < 20) {
    recommendation = "Excellent - wheels well centered with good clearance";
  } else if (bestScore < 50) {
    recommendation = "Good - wheels well positioned between rows";
  } else if (bestScore < 100) {
    recommendation = "Acceptable - wheels maintain safe clearance";
  } else {
    recommendation = "Optimal for clearance - consider adjusting rows for better centering";
  }

  return {
    spacing: bestSpacing,
    score: Math.round(bestScore),
    recommendation
  };
}

/**
 * Get all wheel spacing options with their alignment scores
 */
export function getWheelSpacingOptions(
  activeRows: number,
  rowDistance: number,
  rowSpacings: number[],
  frontWheel: FrontWheel
): Array<{ spacing: number; score: number; isOptimal: boolean }> {
  const { minWheelSpacing, maxWheelSpacing, wheelSpacingIncrement } = WHEEL_CONSTRAINTS;

  // Calculate total row span
  const rowSpan = rowSpacings.length > 0
    ? rowSpacings.reduce((sum, s) => sum + s, 0)
    : (activeRows - 1) * rowDistance;

  // Generate all row positions (centered around 0)
  const rowPositions: number[] = [];
  if (activeRows > 0) {
    let currentPos = -rowSpan / 2;
    for (let i = 0; i < activeRows; i++) {
      rowPositions.push(currentPos);
      if (i < rowSpacings.length) {
        currentPos += rowSpacings[i];
      } else if (i < activeRows - 1) {
        currentPos += rowDistance;
      }
    }
  }

  // Calculate gap midpoints
  const gapMidpoints: number[] = [];
  for (let i = 0; i < rowPositions.length - 1; i++) {
    gapMidpoints.push((rowPositions[i] + rowPositions[i + 1]) / 2);
  }
  if (rowPositions.length > 0) {
    gapMidpoints.unshift(rowPositions[0] - rowDistance / 2);
    gapMidpoints.push(rowPositions[rowPositions.length - 1] + rowDistance / 2);
  }

  const options: Array<{ spacing: number; score: number; isOptimal: boolean }> = [];
  let bestScore = Infinity;
  let bestSpacing = minWheelSpacing;

  for (let spacing = minWheelSpacing; spacing <= maxWheelSpacing; spacing += wheelSpacingIncrement) {
    // Use wheel CENTER positions, not inner edges
    const leftWheelCenter = -spacing / 2;
    const rightWheelCenter = spacing / 2;

    let leftScore = Infinity;
    let rightScore = Infinity;

    for (const midpoint of gapMidpoints) {
      leftScore = Math.min(leftScore, Math.abs(leftWheelCenter - midpoint));
      rightScore = Math.min(rightScore, Math.abs(rightWheelCenter - midpoint));
    }

    const totalScore = Math.round(leftScore + rightScore);
    options.push({ spacing, score: totalScore, isOptimal: false });

    if (totalScore < bestScore || (totalScore === bestScore && spacing > bestSpacing)) {
      bestScore = totalScore;
      bestSpacing = spacing;
    }
  }

  // Mark the optimal one
  for (const opt of options) {
    if (opt.spacing === bestSpacing) {
      opt.isOptimal = true;
      break;
    }
  }

  return options;
}

/**
 * Generate configuration summary text
 */
export function generateConfigSummary(config: ConfiguratorState): string[] {
  const summary: string[] = [];

  summary.push("FD20 Robot V2.6");

  if (config.powerSource === "hybrid") {
    summary.push("Hybrid Power (Solar + Generator)");
  }

  const wheelConfig = getWheelConfig(config.frontWheel);
  const fieldConfig = getFieldConfig(config.frontWheel);

  // Add wheel/field configuration
  const wheelNames = { PFW: "Passive Front Wheel", AFW: "Active Front Wheel", DFW: "Dual Front Wheel" };
  const fieldConfigNames = { "open-field": "Open Field", "bed": "Bed Configuration" };
  summary.push(`${wheelConfig} (${fieldConfigNames[fieldConfig]})`);
  if (config.frontWheel !== "PFW") {
    summary.push(wheelNames[config.frontWheel]);
  }

  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance, config.rowSpacings);
  const workingWidth = calculateRowWorkingWidth(config.activeRows, config.rowDistance, config.frontWheel, config.rowSpacings);

  // Check if variable spacing is used
  const hasVariableSpacing = config.rowSpacings?.some(s => s !== config.rowDistance);
  if (hasVariableSpacing) {
    summary.push(`${config.activeRows} active rows (${config.seedSize}), variable spacing`);
  } else {
    summary.push(`${config.activeRows} active rows (${config.seedSize}), ${config.rowDistance}mm spacing`);
  }
  if (passiveRows > 0) {
    summary.push(`${passiveRows} passive rows`);
  }
  summary.push(`Working width: ${(workingWidth / 1000).toFixed(2)}m`);

  if (config.spraySystem) {
    summary.push("+SPRAY System");
  }

  // Weeding tools
  if (config.weedingTool === "combiTool") {
    summary.push("+ Combi Tool");
  } else if (config.weedingTool === "weedCuttingDisc") {
    const variant = getWeedCuttingDiscVariant(config.rowDistance);
    summary.push(`+ Weed Cutting Disc (${variant || "N/A"})`);
  }

  const accessories: string[] = [];
  if (config.starterKit) {
    accessories.push("Starter Kit");
  } else {
    if (config.fstFieldSetupTool) accessories.push("FST Field Setup Tool");
    if (config.baseStationV3) accessories.push("Base Station V3");
    if (config.essentialCarePackage) accessories.push("Essential Care Package");
    if (config.fieldBracket) accessories.push("Field Bracket");
  }
  if (config.roadTransport) accessories.push("Road Transport");
  if (config.powerBank) accessories.push("Power Bank");
  if (config.essentialCareSpray && config.spraySystem) accessories.push("Essential Care for +Spray");
  if (config.additionalWeightKit) accessories.push("Additional Weight Kit");
  if (config.toolbox) accessories.push("Toolbox");

  if (accessories.length > 0) {
    summary.push(`Accessories: ${accessories.join(", ")}`);
  }

  return summary;
}
