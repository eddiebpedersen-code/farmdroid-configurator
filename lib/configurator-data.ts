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

  // Step 5: Spray system
  spraySystem: boolean;

  // Step 6: Accessories
  starterKit: boolean;
  roadTransport: boolean;
  fieldBracket: boolean;
  powerBank: boolean;
  combiTool: boolean;
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
  { id: 7, title: "Summary", subtitle: "Review your configuration" },
];

// Pricing constants
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
  },
};

// Wheel configuration constraints
export const WHEEL_CONSTRAINTS = {
  minWheelSpacing: 1500, // 150cm minimum
  maxWheelSpacing: 2300, // 230cm maximum
  wheelSpacingIncrement: 100, // 10cm increments
  wheelWidth: 170, // 17cm wheel width
  minRowToWheelGap: 50, // minimum 5cm gap between row and wheel edge
};

// Row configuration constraints
export const ROW_CONSTRAINTS = {
  maxWorkingWidth: 3000, // 3m in mm
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
  spraySystem: false,
  starterKit: false,
  roadTransport: false,
  fieldBracket: false,
  powerBank: false,
  combiTool: false,
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
export function calculatePassiveRows(activeRows: number, rowDistance: number): number {
  if (activeRows <= 1) return 0; // Need at least 2 rows for passive rows between them
  if (rowDistance < ROW_CONSTRAINTS.passiveRowThreshold) {
    return 0;
  }
  // Passive rows go between active rows
  return activeRows - 1;
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
 * Calculate total working width including rows outside wheels
 * Working width = row span including any rows outside the wheel tracks
 */
export function calculateWorkingWidth(
  config: ConfiguratorState
): number {
  const { activeRows, rowDistance, rowSpacings, rowsOutsideLeft, rowsOutsideRight, wheelSpacing } = config;

  if (activeRows <= 0) return 0;

  // Calculate span of main rows (between wheels or all rows for bed config)
  const mainRowSpan = rowSpacings.length > 0
    ? calculateRowSpan(rowSpacings)
    : (activeRows - 1) * rowDistance;

  // For bed config, working width equals wheel spacing
  if (config.rowPlacementMode === "bed") {
    return wheelSpacing;
  }

  // For field/custom config, add rows outside wheels
  const leftExtension = rowsOutsideLeft * rowDistance;
  const rightExtension = rowsOutsideRight * rowDistance;

  return mainRowSpan + leftExtension + rightExtension;
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
 * Calculate total price and breakdown
 */
export function calculatePrice(config: ConfiguratorState): PriceBreakdown {
  const baseRobot = PRICES.baseRobot;
  const powerSource = PRICES.powerSource[config.powerSource];
  const frontWheel = PRICES.frontWheel[config.frontWheel];

  const activeRowPrice = PRICES.activeRow[config.seedSize];
  const activeRows = config.activeRows * activeRowPrice;

  const passiveRowCount = calculatePassiveRows(config.activeRows, config.rowDistance);
  const passiveRows = passiveRowCount * PRICES.passiveRow;

  let spraySystem = 0;
  if (config.spraySystem) {
    spraySystem = PRICES.spraySystem.base + (config.activeRows * PRICES.spraySystem.perRow);
  }

  let accessories = 0;
  if (config.starterKit) accessories += PRICES.accessories.starterKit;
  if (config.roadTransport) accessories += PRICES.accessories.roadTransport;
  if (config.fieldBracket) accessories += PRICES.accessories.fieldBracket;
  if (config.powerBank) accessories += PRICES.accessories.powerBank;
  if (config.combiTool) accessories += config.activeRows * PRICES.accessories.combiToolPerRow;

  // Passive rows are included with active row pricing, not charged separately
  const total = baseRobot + powerSource + frontWheel + activeRows + spraySystem + accessories;

  return {
    baseRobot,
    powerSource,
    frontWheel,
    activeRows,
    passiveRows,
    spraySystem,
    accessories,
    total,
  };
}

// Currency conversion rate (approximate EUR to DKK)
export const EUR_TO_DKK_RATE = 7.45;

/**
 * Format currency in EUR or DKK
 */
export function formatPrice(value: number, currency: Currency = "EUR"): string {
  const displayValue = currency === "DKK" ? value * EUR_TO_DKK_RATE : value;
  const locale = currency === "DKK" ? "da-DK" : "de-DE";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayValue);
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

  // Test each possible wheel spacing
  for (let spacing = minWheelSpacing; spacing <= maxWheelSpacing; spacing += wheelSpacingIncrement) {
    // Wheel centers are at -spacing/2 and +spacing/2 (symmetric around center)
    const leftWheelCenter = -spacing / 2;
    const rightWheelCenter = spacing / 2;

    // Calculate how far each wheel CENTER is from the nearest gap midpoint
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
    }
  }

  // Generate recommendation text
  let recommendation = "";
  if (bestScore < 20) {
    recommendation = "Excellent - wheels perfectly centered between rows";
  } else if (bestScore < 50) {
    recommendation = "Good - wheels well positioned between rows";
  } else if (bestScore < 100) {
    recommendation = "Acceptable - minor offset from row centers";
  } else {
    recommendation = "Consider adjusting row spacing for better wheel alignment";
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

  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance);
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

  const accessories: string[] = [];
  if (config.starterKit) accessories.push("Starter Kit");
  if (config.roadTransport) accessories.push("Road Transport");
  if (config.fieldBracket) accessories.push("Field Bracket");
  if (config.powerBank) accessories.push("Power Bank");
  if (config.combiTool) accessories.push("Combi Tool");

  if (accessories.length > 0) {
    summary.push(`Accessories: ${accessories.join(", ")}`);
  }

  return summary;
}
