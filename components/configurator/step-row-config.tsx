"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Plus, Minus, Play, Pause, Grid3X3, Diamond, Info, Layers, Lightbulb, TrendingUp, ChevronDown } from "lucide-react";
import {
  ConfiguratorState,
  PriceBreakdown,
  SeedSize,
  SeedingMode,
  formatPrice,
  PRICES,
  ROW_CONSTRAINTS,
  WHEEL_CONSTRAINTS,
  validateRowConfig,
  generateRowSpacings,
  getWheelConfig,
  calculateOptimalWheelSpacing,
  calculateBetweenPassSpacing,
  calculateRobotSpeed,
} from "@/lib/configurator-data";
import {
  CropIcon,
  SeedingUnit,
  TractorWheel,
  WheelTrack,
  SeedInfoModal,
  CapacityGraphLarge,
} from "./step-row-config/index";
import { useMode } from "@/contexts/ModeContext";

interface StepRowConfigProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

export function StepRowConfig({ config, updateConfig }: StepRowConfigProps) {
  const t = useTranslations("rowConfig");
  const tCrops = useTranslations("crops");
  const { showPrices } = useMode();

  // Working width state - must be declared before calculations that use it
  // followWheelSpacing: true = Beds mode (follows wheel spacing), false = Pattern mode or custom
  const [followWheelSpacing, setFollowWheelSpacing] = useState(false);
  const [workingWidthOverride, setWorkingWidthOverride] = useState<number | null>(null);
  const [editingWorkingWidth, setEditingWorkingWidth] = useState(false);

  const rowSpacings = config.rowSpacings?.length === config.activeRows - 1
    ? config.rowSpacings
    : generateRowSpacings(config.activeRows, config.rowDistance);

  const wheelConfig = getWheelConfig(config.frontWheel);
  const is3Wheel = wheelConfig === "3-wheel";

  const minRowDistance = ROW_CONSTRAINTS.minRowDistance[config.seedSize];

  // Passive row calculation: always based on 22.5cm spacing (same for both seed sizes)
  // When gap >= 45cm (2x 22.5cm), passive rows appear
  // For every additional 22.5cm, another passive row is added
  // Note: 14mm just has a higher minimum (25cm), but passive logic is identical
  const passiveMinSpacing = 225; // 22.5cm - same for both 6mm and 14mm
  const passiveThreshold = 450; // 45cm - passive rows appear at this spacing

  // Calculate passive rows per gap
  const getPassiveRowsInGap = (spacing: number): number => {
    if (spacing < passiveThreshold) return 0;
    return Math.floor(spacing / passiveMinSpacing) - 1;
  };

  // Total inner passive = sum of passive rows in each gap
  const innerPassiveCount = rowSpacings.reduce((sum, s) => sum + getPassiveRowsInGap(s), 0);

  // Outer passive: 1 on the right when any gap has passive capability
  const hasAnyPassive = innerPassiveCount > 0;
  const outerPassiveCount = hasAnyPassive ? 1 : 0;
  const totalPassiveRows = innerPassiveCount + outerPassiveCount;

  // Row span = distance from first to last row
  const rowSpan = rowSpacings.reduce((sum, s) => sum + s, 0);
  // Calculate between-pass spacing based on mode:
  // - For alternating patterns (A-B-A-B), uses the "other" value to continue the pattern
  // - For symmetric/uniform patterns, uses the pattern's natural spacing
  // - For custom working width, derives from the override
  // Between-pass spacing must be at least minRowDistance to prevent overlap with faded rows
  const patternBetweenPassSpacing = calculateBetweenPassSpacing(rowSpacings, config.rowDistance);
  const calculatedWorkingWidth = rowSpan + patternBetweenPassSpacing;

  // Determine the desired between-pass spacing based on mode
  const desiredBetweenPassSpacing = followWheelSpacing
    ? config.wheelSpacing - rowSpan
    : (workingWidthOverride !== null ? workingWidthOverride - rowSpan : patternBetweenPassSpacing);

  // Between-pass spacing stays constant, but can't go below minRowDistance
  const betweenPassSpacing = Math.max(minRowDistance, desiredBetweenPassSpacing);

  // Working width follows from rowSpan + betweenPassSpacing
  const workingWidth = rowSpan + betweenPassSpacing;

  const validation = validateRowConfig(config.activeRows, config.rowDistance, config.seedSize, config.frontWheel, rowSpacings);

  const rowPrice = PRICES.activeRow[config.seedSize];
  const totalRowCost = config.activeRows * rowPrice; // Passive rows are included with active rows

  // Interaction state
  const [draggingWheelSide, setDraggingWheelSide] = useState<"left" | "right" | null>(null);
  const [draggingRowIdx, setDraggingRowIdx] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredGap, setHoveredGap] = useState<number | null>(null);
  const [hoveredSpacing, setHoveredSpacing] = useState<number | null>(null);
  const [editingSpacing, setEditingSpacing] = useState<number | null>(null);
  const [editingRowDistance, setEditingRowDistance] = useState(false);
  const [editingPlantSpacing, setEditingPlantSpacing] = useState(false);
  const [hoveredWheel, setHoveredWheel] = useState<"front" | "frontLeft" | "frontRight" | "backLeft" | "backRight" | null>(null);
  const [hoveredWheelEdge, setHoveredWheelEdge] = useState<{
    wheel: "backLeft" | "backRight" | "front" | "frontLeft" | "frontRight";
    edge: "left" | "right";
  } | null>(null);
  const [hoveredEdgeAdd, setHoveredEdgeAdd] = useState<"left" | "right" | null>(null);
  const [isVisualizationHovered, setIsVisualizationHovered] = useState(false);
  const [hoveredSeedUnit, setHoveredSeedUnit] = useState<number | null>(null);
  const [hoveredRemoveRow, setHoveredRemoveRow] = useState<number | null>(null);
  const [draggingWorkingWidth, setDraggingWorkingWidth] = useState(false);
  const [workingWidthHandleY, setWorkingWidthHandleY] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const dragStartX = useRef<number>(0);
  const dragStartSpacings = useRef<number[]>([]);
  const dragStartValue = useRef<number>(0);
  const dragStartWorkingWidth = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animation state - now using CSS animations for smooth performance
  const [isAnimating, setIsAnimating] = useState(true);
  const [isDiamondPattern, setIsDiamondPattern] = useState(false);
  // Seeding parameters - initialized from config with fallbacks
  const [plantSpacing, setPlantSpacing] = useState(config.plantSpacing ?? 18);
  const [seedingMode, setSeedingMode] = useState<SeedingMode>(config.seedingMode ?? "single");
  const [seedsPerGroup, setSeedsPerGroup] = useState(config.seedsPerGroup ?? 1);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [showSeedInfoModal, setShowSeedInfoModal] = useState(false);

  // Drag hint state - shows animated hint every time step is opened
  const [showDragHint, setShowDragHint] = useState(false);

  // Show drag hint every time the step is opened (with multiple rows)
  useEffect(() => {
    if (config.activeRows > 1) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowDragHint(true);
        // Hide hint after animation completes
        const hideTimer = setTimeout(() => {
          setShowDragHint(false);
        }, 6000); // 6 seconds for animation + tooltip
        return () => clearTimeout(hideTimer);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync seeding parameters to config when they change
  useEffect(() => {
    updateConfig({
      seedingMode,
      plantSpacing,
      seedsPerGroup,
    });
  }, [seedingMode, plantSpacing, seedsPerGroup, updateConfig]);

  // Sync working width to config when it changes
  useEffect(() => {
    updateConfig({ workingWidth });
  }, [workingWidth, updateConfig]);

  // Crop type selection with recommended configurations and seed size compatibility
  const cropTypes = [
    { id: "carrot", emoji: "🥕", nameKey: "carrot" as const, seedSize: "6mm" as SeedSize, rows: 8, rowDistance: 300, plantSpacing: 5, supports6mm: true, supports14mm: false },
    { id: "flower", emoji: "🌸", nameKey: "flower" as const, seedSize: "6mm" as SeedSize, rows: 6, rowDistance: 400, plantSpacing: 20, supports6mm: true, supports14mm: false },
    { id: "onion", emoji: "🧅", nameKey: "onion" as const, seedSize: "14mm" as SeedSize, rows: 8, rowDistance: 300, plantSpacing: 12, supports6mm: true, supports14mm: true },
    { id: "sugarbeet", emoji: "🫜", nameKey: "sugarBeet" as const, seedSize: "6mm" as SeedSize, rows: 6, rowDistance: 500, plantSpacing: 18, supports6mm: true, supports14mm: true },
    { id: "lettuce", emoji: "🥬", nameKey: "lettuce" as const, seedSize: "14mm" as SeedSize, rows: 6, rowDistance: 400, plantSpacing: 30, supports6mm: true, supports14mm: true },
    { id: "corn", emoji: "🌽", nameKey: "corn" as const, seedSize: "14mm" as SeedSize, rows: 4, rowDistance: 750, plantSpacing: 20, supports6mm: false, supports14mm: true },
    { id: "greenbean", emoji: "🫛", nameKey: "greenBean" as const, seedSize: "6mm" as SeedSize, rows: 8, rowDistance: 300, plantSpacing: 10, supports6mm: false, supports14mm: true },
    { id: "other", emoji: "🌱", nameKey: "otherCrop" as const, seedSize: "6mm" as SeedSize, rows: 6, rowDistance: 450, plantSpacing: 15, supports6mm: true, supports14mm: true },
  ];
  const [selectedCrop, setSelectedCrop] = useState(cropTypes[0]);

  // Sync crop emoji to config when selected crop changes
  useEffect(() => {
    updateConfig({ cropEmoji: selectedCrop.emoji });
  }, [selectedCrop, updateConfig]);

  // Optimize wheel spacing when first entering this step
  useEffect(() => {
    const optimal = calculateOptimalWheelSpacing(
      config.activeRows,
      config.rowDistance,
      rowSpacings,
      config.frontWheel
    );
    if (config.wheelSpacing !== optimal.spacing) {
      updateConfig({ wheelSpacing: optimal.spacing });
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCropConfig = (crop: typeof cropTypes[0]) => {
    setSelectedCrop(crop);
    const newRowSpacings = generateRowSpacings(crop.rows, crop.rowDistance);
    // Calculate optimal wheel spacing for this crop config
    const optimal = calculateOptimalWheelSpacing(
      crop.rows,
      crop.rowDistance,
      newRowSpacings,
      config.frontWheel
    );
    updateConfig({
      seedSize: crop.seedSize,
      activeRows: crop.rows,
      rowDistance: crop.rowDistance,
      rowSpacings: newRowSpacings,
      wheelSpacing: optimal.spacing,
    });
    setPlantSpacing(crop.plantSpacing);
  };

  // SVG layout - field encompasses entire robot
  const svgWidth = 990;
  const svgHeight = 594;
  const margin = { left: 0, right: 0 };
  const rowAreaTop = 80; // Start 80px from top to give space for front wheel
  const rowAreaBottom = svgHeight; // End at bottom

  // Fixed scale for mm to px conversion
  const pxPerMm = 0.22;

  // Calculate row positions in mm (centered)
  const svgCenterX = svgWidth / 2;
  const rowStartMm = -rowSpan / 2;
  const rowPositionsMm: number[] = [];
  let posMm = rowStartMm;
  for (let i = 0; i < config.activeRows; i++) {
    rowPositionsMm.push(posMm);
    if (i < rowSpacings.length) posMm += rowSpacings[i];
  }

  // Right outer passive row position only
  const rightOuterPassiveMm = hasAnyPassive
    ? rowPositionsMm[rowPositionsMm.length - 1] + config.rowDistance / 2
    : null;

  // Adjacent pass row positions (offset by working width)
  // Previous pass row positions (for showing already seeded crops on the left)
  const previousPassRowsMm = rowPositionsMm.map(mm => mm - workingWidth);

  // Wheel positions
  const leftWheelMm = -config.wheelSpacing / 2;
  const rightWheelMm = config.wheelSpacing / 2;

  const mmToX = (mm: number) => svgCenterX + mm * pxPerMm;

  // Front wheel position - always centered between back wheels (at 0mm, which is svgCenterX)
  let frontWheelMm: number | null = null;
  if (is3Wheel) {
    frontWheelMm = 0; // Center between back wheels (leftWheelMm and rightWheelMm are symmetric around 0)
  }

  // Wheel proximity warning: warn if row is within 5cm (50mm) of any wheel edge OR on top of wheel
  const wheelWidthMm = 170; // 17cm wheel width
  const wheelProximityWarningMm = 50; // 5cm

  // Back wheel edges
  const leftWheelLeftEdge = leftWheelMm - wheelWidthMm / 2;
  const leftWheelRightEdge = leftWheelMm + wheelWidthMm / 2;
  const rightWheelLeftEdge = rightWheelMm - wheelWidthMm / 2;
  const rightWheelRightEdge = rightWheelMm + wheelWidthMm / 2;

  const isRowTooCloseToBackWheel = (rowMm: number): boolean => {
    // Check if row is ON TOP of left back wheel (between edges) or too close to either edge
    if (rowMm >= leftWheelLeftEdge - wheelProximityWarningMm &&
        rowMm <= leftWheelRightEdge + wheelProximityWarningMm) {
      return true;
    }

    // Check if row is ON TOP of right back wheel (between edges) or too close to either edge
    if (rowMm >= rightWheelLeftEdge - wheelProximityWarningMm &&
        rowMm <= rightWheelRightEdge + wheelProximityWarningMm) {
      return true;
    }

    return false;
  };

  const isRowTooCloseToFrontWheel = (rowMm: number): boolean => {
    // Only applies to 3-wheel config
    if (frontWheelMm === null) return false;

    const frontWheelLeftEdge = frontWheelMm - wheelWidthMm / 2;
    const frontWheelRightEdge = frontWheelMm + wheelWidthMm / 2;
    if (rowMm >= frontWheelLeftEdge - wheelProximityWarningMm &&
        rowMm <= frontWheelRightEdge + wheelProximityWarningMm) {
      return true;
    }
    return false;
  };

  // Combined check for SVG visualization
  const isRowTooCloseToWheel = (rowMm: number): boolean => {
    return isRowTooCloseToBackWheel(rowMm) || isRowTooCloseToFrontWheel(rowMm);
  };

  // Helper to find distance from a wheel edge to the nearest row in a specific direction
  // Includes both current pass and previous pass rows
  const getDistanceToNearestRow = (wheelEdgeMm: number, direction: "left" | "right"): { distance: number; rowMm: number; isPreviousPass: boolean } | null => {
    // Combine current pass rows and previous pass rows
    const allRows = [
      ...rowPositionsMm.map(mm => ({ mm, isPreviousPass: false })),
      ...previousPassRowsMm.map(mm => ({ mm, isPreviousPass: true })),
    ];

    if (allRows.length === 0) return null;

    // Filter rows based on direction
    // "left" means rows to the left of the edge (rowMm < wheelEdgeMm)
    // "right" means rows to the right of the edge (rowMm > wheelEdgeMm)
    const rowsInDirection = allRows.filter(row =>
      direction === "left" ? row.mm < wheelEdgeMm : row.mm > wheelEdgeMm
    );

    if (rowsInDirection.length === 0) return null;

    let nearestRow = rowsInDirection[0];
    let minDistance = Math.abs(wheelEdgeMm - nearestRow.mm);

    for (const row of rowsInDirection) {
      const distance = Math.abs(wheelEdgeMm - row.mm);
      if (distance < minDistance) {
        minDistance = distance;
        nearestRow = row;
      }
    }

    return { distance: minDistance, rowMm: nearestRow.mm, isPreviousPass: nearestRow.isPreviousPass };
  };

  // Separate warning flags for current pass
  const hasBackWheelProximityWarning = rowPositionsMm.some(isRowTooCloseToBackWheel);
  const hasFrontWheelProximityWarning = is3Wheel && rowPositionsMm.some(isRowTooCloseToFrontWheel);

  // Warning flags for previous pass (crops from previous pass too close to left wheel)
  const hasPreviousPassProximityWarning = previousPassRowsMm.some(isRowTooCloseToBackWheel);

  // Check if user has custom (non-uniform) spacings
  const hasCustomSpacings = rowSpacings.length > 0 && !rowSpacings.every(s => s === rowSpacings[0]);

  // Helper function to get mirror spacing index for symmetric configuration
  // With n spacings: spacing[i] mirrors spacing[n-1-i]
  const getMirrorSpacingIndex = (idx: number, totalSpacings: number) => totalSpacings - 1 - idx;
  const getMirrorRowIndex = (idx: number) => config.activeRows - 1 - idx;

  // Max working width is 340cm (3400mm) - matches toolbeam length
  const maxWorkingWidth = 3400;

  // Row drag handlers - dragging pushes rows in the drag direction
  const handleRowDragStart = useCallback((idx: number, clientX: number) => {
    setDraggingRowIdx(idx);
    dragStartX.current = clientX;
    dragStartSpacings.current = [...rowSpacings];
  }, [rowSpacings]);

  const handleRowDragMove = useCallback((clientX: number) => {
    if (draggingRowIdx === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgScale = rect.width / svgWidth;
    const deltaPx = clientX - dragStartX.current;
    const deltaMm = deltaPx / (pxPerMm * svgScale);

    const newSpacings = [...dragStartSpacings.current];
    const totalSpacings = newSpacings.length;
    const isFirstRow = draggingRowIdx === 0;
    const isLastRow = draggingRowIdx === config.activeRows - 1;

    // Calculate max row span (working width = rowSpan + betweenPassSpacing)
    const maxRowSpan = maxWorkingWidth - minRowDistance;

    // Helper to update a spacing and its mirror with max constraint
    const updateSpacingWithMirror = (spacingIdx: number, newValue: number) => {
      const mirrorIdx = getMirrorSpacingIndex(spacingIdx, totalSpacings);
      const isMirrored = mirrorIdx !== spacingIdx;

      // Calculate current total of all OTHER spacings
      const currentSpacing = dragStartSpacings.current[spacingIdx];
      const mirrorSpacing = isMirrored ? dragStartSpacings.current[mirrorIdx] : 0;
      const currentRowSpan = dragStartSpacings.current.reduce((sum, s) => sum + s, 0);
      const otherSpacingsTotal = currentRowSpan - currentSpacing - mirrorSpacing;

      // Max value that keeps total under maxRowSpan
      const maxForThisSpacing = Math.floor((maxRowSpan - otherSpacingsTotal) / (isMirrored ? 2 : 1));

      const clampedValue = Math.max(minRowDistance, Math.min(maxForThisSpacing, newValue));
      newSpacings[spacingIdx] = clampedValue;
      if (isMirrored) {
        newSpacings[mirrorIdx] = clampedValue;
      }
    };

    if (isFirstRow) {
      // First row: only has spacing to its right
      const origSpacing = dragStartSpacings.current[0];
      const newSpacing = Math.round((origSpacing - deltaMm) / 10) * 10;
      updateSpacingWithMirror(0, newSpacing);
    } else if (isLastRow) {
      // Last row: only has spacing to its left
      const lastSpacingIdx = config.activeRows - 2;
      const origSpacing = dragStartSpacings.current[lastSpacingIdx];
      const newSpacing = Math.round((origSpacing + deltaMm) / 10) * 10;
      updateSpacingWithMirror(lastSpacingIdx, newSpacing);
    } else {
      // Middle rows: outer rows move WITH the dragged row, inner gap changes
      const centerIndex = (config.activeRows - 1) / 2;
      const isOnLeftSide = draggingRowIdx <= Math.floor(centerIndex);

      if (isOnLeftSide) {
        // Left side row: adjust the spacing to its RIGHT
        const spacingIdx = draggingRowIdx;
        const origSpacing = dragStartSpacings.current[spacingIdx];
        const newSpacing = Math.round((origSpacing - deltaMm) / 10) * 10;
        updateSpacingWithMirror(spacingIdx, newSpacing);
      } else {
        // Right side row: adjust the spacing to its LEFT
        const spacingIdx = draggingRowIdx - 1;
        const origSpacing = dragStartSpacings.current[spacingIdx];
        const newSpacing = Math.round((origSpacing + deltaMm) / 10) * 10;
        updateSpacingWithMirror(spacingIdx, newSpacing);
      }
    }

    updateConfig({ rowSpacings: newSpacings });
  }, [config.activeRows, draggingRowIdx, minRowDistance, maxWorkingWidth, updateConfig, getMirrorSpacingIndex]);

  // Working width drag handlers - dragging the boundary between passes
  const handleWorkingWidthDragStart = useCallback((clientX: number) => {
    setDraggingWorkingWidth(true);
    dragStartX.current = clientX;
    dragStartWorkingWidth.current = workingWidth;
  }, [workingWidth]);

  const handleWorkingWidthDragMove = useCallback((clientX: number) => {
    if (!draggingWorkingWidth || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgScale = rect.width / svgWidth;
    const deltaPx = clientX - dragStartX.current;
    // Dragging LEFT (negative deltaPx) = INCREASE working width
    // Dragging RIGHT (positive deltaPx) = DECREASE working width
    const deltaMm = -deltaPx / (pxPerMm * svgScale);

    const newWorkingWidth = dragStartWorkingWidth.current + deltaMm;
    // Clamp to valid range and round to nearest 10mm (1cm)
    // Minimum working width = rowSpan + minRowDistance (to ensure proper between-pass spacing)
    const minWorkingWidth = rowSpan + minRowDistance;
    const clampedWidth = Math.max(minWorkingWidth, Math.min(maxWorkingWidth, Math.round(newWorkingWidth / 10) * 10));

    // Update working width override (exits Beds mode, enters custom mode)
    setFollowWheelSpacing(false);
    setWorkingWidthOverride(clampedWidth === calculatedWorkingWidth ? null : clampedWidth);
  }, [draggingWorkingWidth, rowSpan, minRowDistance, maxWorkingWidth, calculatedWorkingWidth]);

  // Check if adding more rows would exceed max working width
  // New working width after adding = current rowSpan + new spacing + rowDistance
  const canAddMoreRows = (rowSpan + config.rowDistance + config.rowDistance) <= maxWorkingWidth && config.activeRows < ROW_CONSTRAINTS.maxActiveRows;

  // Calculate maximum row distance for current row count
  // Working width = (activeRows - 1) * rowDistance + betweenPassSpacing
  // For uniform spacing, betweenPassSpacing = rowDistance, so workingWidth = activeRows * rowDistance
  // maxRowDistance = maxWorkingWidth / activeRows
  const maxRowDistanceForCurrentRows = config.activeRows > 0
    ? Math.floor(maxWorkingWidth / config.activeRows / 10) * 10 // Round down to nearest 10mm (1cm)
    : 800; // Default max when no rows
  const canIncreaseRowDistance = config.rowDistance < Math.min(800, maxRowDistanceForCurrentRows);

  const handleAddRowAt = useCallback((gapIndex: number) => {
    // Always add rows in pairs for symmetry
    if (config.activeRows + 2 > ROW_CONSTRAINTS.maxActiveRows) return;
    // Note: No working width check needed here - inserting between rows splits existing gaps,
    // it doesn't increase the total row span

    const totalSpacings = rowSpacings.length;
    const mirrorGapIndex = getMirrorSpacingIndex(gapIndex, totalSpacings);

    const newSpacings = [...rowSpacings];

    // Split the clicked gap
    const existingGap = newSpacings[gapIndex];
    const halfGap = Math.max(minRowDistance, Math.round(existingGap / 2 / 10) * 10);

    if (mirrorGapIndex === gapIndex) {
      // Center gap - just split it once (adds 1 row, but we need pairs)
      // For center gap, we split it and that's it - only adds 1 row
      // Actually, to maintain symmetry with even rows, we should still add 2
      // Split center gap into 3 parts: halfGap, halfGap, halfGap (adds 2 spacings = 2 rows)
      const thirdGap = Math.max(minRowDistance, Math.round(existingGap / 3 / 10) * 10);
      newSpacings.splice(gapIndex, 1, thirdGap, thirdGap, thirdGap);
    } else {
      // Different gaps - split both, process higher index first to preserve lower index
      const highIdx = Math.max(gapIndex, mirrorGapIndex);
      const lowIdx = Math.min(gapIndex, mirrorGapIndex);

      const highGap = newSpacings[highIdx];
      const highHalfGap = Math.max(minRowDistance, Math.round(highGap / 2 / 10) * 10);
      newSpacings.splice(highIdx, 1, highHalfGap, highHalfGap);

      const lowGap = newSpacings[lowIdx];
      const lowHalfGap = Math.max(minRowDistance, Math.round(lowGap / 2 / 10) * 10);
      newSpacings.splice(lowIdx, 1, lowHalfGap, lowHalfGap);
    }

    const newCount = config.activeRows + 2;

    setHoveredGap(null); // Clear hover state before update
    updateConfig({
      activeRows: Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows),
      rowSpacings: newSpacings.slice(0, Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows) - 1),
    });
  }, [config.activeRows, minRowDistance, rowSpan, rowSpacings, updateConfig, getMirrorSpacingIndex]);

  const handleAddRowEdge = useCallback((side: "left" | "right") => {
    // Always add rows in pairs (one on each side) for symmetry
    if (config.activeRows + 2 > ROW_CONSTRAINTS.maxActiveRows) return;

    // Check if adding 2 rows would exceed max span
    if (rowSpan + config.rowDistance * 2 > maxWorkingWidth) return;

    const newSpacings = [...rowSpacings];
    // Add one spacing to left AND one to right for symmetric pairs
    newSpacings.unshift(config.rowDistance);
    newSpacings.push(config.rowDistance);

    const newCount = config.activeRows + 2;

    updateConfig({
      activeRows: Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows),
      rowSpacings: newSpacings.slice(0, Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows) - 1),
    });
  }, [config.activeRows, config.rowDistance, rowSpan, rowSpacings, updateConfig]);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    // Always remove rows in pairs for symmetry
    if (config.activeRows < 2) return;

    // Helper to remove a row at given index from spacings array
    const removeRowFromSpacings = (spacings: number[], idx: number, totalRows: number): number[] => {
      const newSpacings = [...spacings];
      if (idx === 0) {
        newSpacings.shift();
      } else if (idx === totalRows - 1) {
        newSpacings.pop();
      } else {
        const mergedGap = (newSpacings[idx - 1] || 0) + (newSpacings[idx] || 0);
        newSpacings.splice(idx - 1, 2, mergedGap);
      }
      return newSpacings;
    };

    // Calculate the mirror index (symmetric from other end)
    const mirrorIdx = config.activeRows - 1 - rowIndex;

    // Remove both rows - remove higher index first to preserve lower index
    let newSpacings = [...rowSpacings];
    const highIdx = Math.max(rowIndex, mirrorIdx);
    const lowIdx = Math.min(rowIndex, mirrorIdx);

    if (highIdx === lowIdx) {
      // Same row (center row with odd count - shouldn't happen with symmetric config)
      // Just remove this one row
      newSpacings = removeRowFromSpacings(newSpacings, highIdx, config.activeRows);
      updateConfig({
        activeRows: Math.max(0, config.activeRows - 1),
        rowSpacings: newSpacings,
      });
    } else {
      // Remove high index first, then low index
      newSpacings = removeRowFromSpacings(newSpacings, highIdx, config.activeRows);
      newSpacings = removeRowFromSpacings(newSpacings, lowIdx, config.activeRows - 1);

      updateConfig({
        activeRows: Math.max(0, config.activeRows - 2),
        rowSpacings: newSpacings,
      });
    }
  }, [config.activeRows, rowSpacings, updateConfig]);

  const handleSetRowCount = useCallback((count: number) => {
    if (count < 0 || count > ROW_CONSTRAINTS.maxActiveRows) return;
    if (is3Wheel && count > 0 && count % 2 !== 0) return; // 3-wheel requires even rows (or 0)

    // Check if new working width would exceed max
    if (count > 0) {
      const newSpan = (count - 1) * config.rowDistance;
      const newWorkingWidth = newSpan + config.rowDistance;
      if (newWorkingWidth > maxWorkingWidth) return;
    }

    updateConfig({
      activeRows: count,
      rowSpacings: generateRowSpacings(count, config.rowDistance),
    });
  }, [config.rowDistance, is3Wheel, updateConfig]);

  const handleWheelDragStart = useCallback((side: "left" | "right", clientX: number) => {
    setDraggingWheelSide(side);
    dragStartX.current = clientX;
    dragStartValue.current = config.wheelSpacing;
  }, [config.wheelSpacing]);

  const handleWheelDragMove = useCallback((clientX: number) => {
    if (draggingWheelSide === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgScale = rect.width / svgWidth;
    const deltaPx = clientX - dragStartX.current;
    const deltaMm = deltaPx / (pxPerMm * svgScale);

    const spacingDelta = draggingWheelSide === "right" ? deltaMm * 2 : -deltaMm * 2;
    const newSpacing = Math.round((dragStartValue.current + spacingDelta) / 100) * 100;
    const clamped = Math.max(WHEEL_CONSTRAINTS.minWheelSpacing, Math.min(WHEEL_CONSTRAINTS.maxWheelSpacing, newSpacing));

    if (clamped !== config.wheelSpacing) {
      updateConfig({ wheelSpacing: clamped });
    }
  }, [config.wheelSpacing, draggingWheelSide, updateConfig]);

  const handleDragEnd = useCallback(() => {
    setDraggingWheelSide(null);
    setDraggingRowIdx(null);
    setHoveredSeedUnit(null);
    setDraggingWorkingWidth(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingWheelSide) {
      handleWheelDragMove(e.clientX);
    } else if (draggingRowIdx !== null) {
      handleRowDragMove(e.clientX);
    } else if (draggingWorkingWidth) {
      handleWorkingWidthDragMove(e.clientX);
    }
  }, [draggingWheelSide, draggingRowIdx, draggingWorkingWidth, handleWheelDragMove, handleRowDragMove, handleWorkingWidthDragMove]);

  // Handler to set individual spacing value directly (with mirroring for symmetry)
  const handleSetSpacing = useCallback((spacingIdx: number, valueCm: number) => {
    const valueMm = valueCm * 10;
    const mirrorIdx = getMirrorSpacingIndex(spacingIdx, rowSpacings.length);
    const isMirrored = mirrorIdx !== spacingIdx;

    // Calculate max allowed value that keeps total row span under maxWorkingWidth
    // Working width = rowSpan + betweenPassSpacing, and betweenPassSpacing >= minRowDistance
    // So rowSpan must be <= maxWorkingWidth - minRowDistance
    const maxRowSpan = maxWorkingWidth - minRowDistance;
    const currentSpacingTotal = rowSpacings[spacingIdx] + (isMirrored ? rowSpacings[mirrorIdx] : 0);
    const otherSpacingsTotal = rowSpan - currentSpacingTotal;
    const maxForThisSpacing = Math.floor((maxRowSpan - otherSpacingsTotal) / (isMirrored ? 2 : 1));

    const clampedValue = Math.max(minRowDistance, Math.min(Math.min(800, maxForThisSpacing), valueMm));
    const newSpacings = [...rowSpacings];
    newSpacings[spacingIdx] = clampedValue;

    // Also update mirror spacing for symmetry
    if (isMirrored) {
      newSpacings[mirrorIdx] = clampedValue;
    }

    updateConfig({ rowSpacings: newSpacings });
  }, [minRowDistance, maxWorkingWidth, rowSpan, rowSpacings, updateConfig, getMirrorSpacingIndex]);

  // Start editing a spacing value
  const handleStartEditSpacing = useCallback((idx: number) => {
    setEditingSpacing(idx);
    setEditingValue(String(rowSpacings[idx] / 10));
  }, [rowSpacings]);

  // Finish editing and apply the value
  const handleFinishEditSpacing = useCallback(() => {
    if (editingSpacing !== null) {
      // Support both comma and dot as decimal separator
      const normalizedValue = editingValue.replace(',', '.');
      const parsed = parseFloat(normalizedValue);
      if (!isNaN(parsed) && parsed > 0) {
        handleSetSpacing(editingSpacing, parsed);
      }
    }
    setEditingSpacing(null);
    setEditingValue("");
  }, [editingSpacing, editingValue, handleSetSpacing]);

  // Start editing the base row distance
  const handleStartEditRowDistance = useCallback(() => {
    setEditingRowDistance(true);
    setEditingValue(String(config.rowDistance / 10));
  }, [config.rowDistance]);

  // Finish editing the base row distance
  const handleFinishEditRowDistance = useCallback(() => {
    // Support both comma and dot as decimal separator
    const normalizedValue = editingValue.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    if (!isNaN(parsed) && parsed > 0) {
      // Clamp to min row distance and max of either 800mm or max for current row count
      const maxDistance = Math.min(800, maxRowDistanceForCurrentRows);
      const newDistanceMm = Math.max(minRowDistance, Math.min(maxDistance, Math.round(parsed * 10)));
      updateConfig({
        rowDistance: newDistanceMm,
        rowSpacings: generateRowSpacings(config.activeRows, newDistanceMm)
      });
    }
    setEditingRowDistance(false);
    setEditingValue("");
  }, [editingValue, minRowDistance, maxRowDistanceForCurrentRows, config.activeRows, updateConfig]);

  // Start editing plant spacing
  const handleStartEditPlantSpacing = useCallback(() => {
    setEditingPlantSpacing(true);
    setEditingValue(String(plantSpacing));
  }, [plantSpacing]);

  // Finish editing plant spacing
  const handleFinishEditPlantSpacing = useCallback(() => {
    // Support both comma and dot as decimal separator
    const normalizedValue = editingValue.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    if (!isNaN(parsed) && parsed > 0) {
      const newSpacing = Math.max(3, Math.min(40, Math.round(parsed * 10) / 10)); // Round to 0.1
      setPlantSpacing(newSpacing);
    }
    setEditingPlantSpacing(false);
    setEditingValue("");
  }, [editingValue]);

  // Start editing working width
  const handleStartEditWorkingWidth = useCallback(() => {
    setEditingWorkingWidth(true);
    setEditingValue(String((workingWidth / 10).toFixed(0)));
  }, [workingWidth]);

  // Finish editing working width
  const handleFinishEditWorkingWidth = useCallback(() => {
    const normalizedValue = editingValue.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    if (!isNaN(parsed) && parsed > 0) {
      const newWidth = Math.round(parsed * 10); // Convert cm to mm
      // Minimum is rowSpan to prevent pass overlap, maximum is 500cm
      const validWidth = Math.max(rowSpan, Math.min(5000, newWidth));
      setFollowWheelSpacing(false); // Manual edit exits Beds mode
      setWorkingWidthOverride(validWidth === calculatedWorkingWidth ? null : validWidth);
    }
    setEditingWorkingWidth(false);
    setEditingValue("");
  }, [editingValue, calculatedWorkingWidth, rowSpan]);

  // Reset working width to default (Pattern mode with calculated working width)
  const handleResetWorkingWidth = useCallback(() => {
    setFollowWheelSpacing(false);
    setWorkingWidthOverride(null);
  }, []);

  const colors = {
    wheel: "#1c1917",
    wheelDrag: "#78716c",
    activeRow: "#0d9488",       // Teal for active rows
    activeRowHover: "#0f766e",
    passiveRow: "#94a3b8",      // Slate for passive - more visible
    addBtn: "#0d9488",
    removeBtn: "#f87171",
    warningBg: "rgba(254, 202, 202, 0.3)",
  };

  const wheelWidth = 26;
  const wheelHeight = 84;  // Doubled from 42

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 md:gap-6 py-4 md:py-6 pb-32">
      {/* Left: Visualization - Takes 4 columns */}
      <div className="lg:col-span-4 flex flex-col">
        {/* Header: View toggle aligned right */}
        <div className="flex items-center justify-end mb-2 md:mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 mr-1 hidden md:inline">View</span>
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("2d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "2d"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                2D
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "3d"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Graph
              </button>
            </div>
          </div>
        </div>

        {/* View container with fixed height */}
        <div className="h-[420px] md:h-[480px] relative">
          {/* Empty state overlay when no rows configured */}
          {config.activeRows === 0 && viewMode === "2d" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-stone-200 text-center max-w-sm mx-4 pointer-events-auto"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {t("emptyState.title")}
                </h3>
                <p className="text-sm text-stone-500 mb-4">
                  {t("emptyState.description")}
                </p>
                <button
                  onClick={() => handleSetRowCount(is3Wheel ? 2 : 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t("emptyState.addRows")}
                </button>
              </motion.div>
            </div>
          )}

          {/* Interactive tutorial overlay - shows every time step is opened */}
          <AnimatePresence>
            {showDragHint && config.activeRows > 0 && viewMode === "2d" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto cursor-pointer"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onClick={() => setShowDragHint(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="rounded-2xl shadow-2xl p-6 max-w-sm mx-4"
                  style={{ backgroundColor: '#1c1917' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-white font-semibold text-lg mb-4 text-center">{t("tutorialTitle")}</h3>
                  <div className="space-y-3">
                    {/* Drag rows */}
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                      <span className="text-sm">{t("tutorialDrag")}</span>
                    </div>
                    {/* Add rows */}
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Plus className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm">{t("tutorialAdd")}</span>
                    </div>
                    {/* Remove rows */}
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                        <Minus className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-sm">{t("tutorialRemove")}</span>
                    </div>
                    {/* Drag wheels */}
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <span className="text-sm">{t("tutorialWheels")}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDragHint(false)}
                    className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {t("tutorialGotIt")}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Capacity Graph */}
          {viewMode === "3d" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <CapacityGraphLarge
                seedingMode={seedingMode}
                plantSpacing={plantSpacing}
                workingWidth={workingWidth}
              />
            </motion.div>
          )}

          {/* 2D SVG Animation */}
          {viewMode === "2d" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => {
              handleDragEnd();
              setIsVisualizationHovered(false);
            }}
            onMouseEnter={() => setIsVisualizationHovered(true)}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full"
              role="img"
              aria-label={t("visualizationAria", { rows: config.activeRows, spacing: config.rowDistance / 10 })}
            >
              {/* Row area - subtle tinted background */}
              <rect
                x={margin.left}
                y={rowAreaTop}
                width={svgWidth - margin.left - margin.right}
                height={rowAreaBottom - rowAreaTop}
                fill="#f5f5f4"
                rx="6"
              />

              {/* Clip path for animation area */}
              <defs>
                <clipPath id="rowAreaClip">
                  <rect
                    x={margin.left}
                    y={rowAreaTop}
                    width={svgWidth - margin.left - margin.right}
                    height={rowAreaBottom - rowAreaTop}
                    rx="6"
                  />
                </clipPath>
                {/* Clip path for crops - only shows below the seeding units */}
                <clipPath id="cropsClip">
                  <rect
                    x={margin.left}
                    y={(rowAreaTop + rowAreaBottom) / 2 + 38}
                    width={svgWidth - margin.left - margin.right}
                    height={(rowAreaBottom - rowAreaTop) / 2 - 15}
                    rx="6"
                  />
                </clipPath>
              </defs>

              {/* Animated soil texture - using CSS animation for smooth scrolling */}
              {/* Speed-based animation: faster robot = faster animation */}
              {(() => {
                const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                const soilDuration = 800 / robotSpeed; // ~0.84s at 950m/h, ~1.33s at 600m/h
                return (
              <g clipPath="url(#rowAreaClip)" style={{ pointerEvents: "none" }}>
                <g
                  style={{
                    animation: isAnimating ? `soilScroll ${soilDuration.toFixed(2)}s linear infinite` : "none",
                  }}
                >
                  {/* Render soil dots directly - two sets for seamless loop */}
                  {[0, 40].map((yOffset) => (
                    <g key={yOffset} transform={`translate(0, ${yOffset})`}>
                      {Array.from({ length: Math.ceil((svgWidth - margin.left - margin.right) / 40) }).map((_, col) => (
                        <g key={col} transform={`translate(${margin.left + col * 40}, ${rowAreaTop})`}>
                          {Array.from({ length: Math.ceil((rowAreaBottom - rowAreaTop) / 40) + 1 }).map((_, row) => (
                            <g key={row} transform={`translate(0, ${row * 40})`}>
                              <circle cx="8" cy="8" r="1.5" fill="#d4a574" opacity="0.5" />
                              <circle cx="28" cy="6" r="1" fill="#c4956a" opacity="0.4" />
                              <circle cx="18" cy="18" r="1.2" fill="#b8906a" opacity="0.45" />
                              <circle cx="5" cy="28" r="0.8" fill="#c4956a" opacity="0.4" />
                              <circle cx="35" cy="22" r="1.3" fill="#d4a574" opacity="0.5" />
                              <circle cx="22" cy="35" r="1" fill="#b8906a" opacity="0.4" />
                              <circle cx="38" cy="38" r="0.9" fill="#c4956a" opacity="0.45" />
                            </g>
                          ))}
                        </g>
                      ))}
                    </g>
                  ))}
                </g>
                {/* CSS Keyframes for soil animation */}
                <style>
                  {`
                    @keyframes soilScroll {
                      from { transform: translateY(0); }
                      to { transform: translateY(40px); }
                    }
                    @keyframes wheelTread {
                      from { transform: translateY(0); }
                      to { transform: translateY(-10px); }
                    }
                  `}
                </style>
              </g>
                );
              })()}


              {/* Animated crops and row lines (moving down) - using CSS animation */}
              {config.activeRows > 0 && (
                <g clipPath="url(#rowAreaClip)" style={{ pointerEvents: "none" }}>
                  {/* CSS Keyframes for crop animation - dynamic based on plant spacing */}
                  <style>
                    {`
                      @keyframes cropScroll {
                        from { transform: translateY(0); }
                        to { transform: translateY(${plantSpacing * 3.5}px); }
                      }
                      @keyframes lineScroll {
                        from { transform: translateY(0); }
                        to { transform: translateY(${3 * 3.5}px); }
                      }
                    `}
                  </style>
                  {(() => {
                    // Calculate crop grid parameters once
                    const cropSpacingPx = plantSpacing * 3.5;
                    const cropsStartY = (rowAreaTop + rowAreaBottom) / 2 + 38; // Current pass: below robot
                    const cropsEndY = rowAreaBottom;
                    const visibleHeight = cropsEndY - cropsStartY;
                    const numRows = Math.ceil(visibleHeight / cropSpacingPx) + 3;

                    // Previous pass: entire field height (already fully seeded)
                    // Align to same grid as current pass by using cropsStartY as reference
                    const fullFieldHeight = rowAreaBottom - rowAreaTop;
                    const fullFieldNumRows = Math.ceil(fullFieldHeight / cropSpacingPx) + 3;
                    // Calculate grid-aligned start for previous pass (so crops align with current pass)
                    const gridAlignOffset = ((cropsStartY - rowAreaTop) % cropSpacingPx + cropSpacingPx) % cropSpacingPx;
                    const prevPassStartY = rowAreaTop + gridAlignOffset - cropSpacingPx;

                    // Speed-based animation duration: faster robot = faster animation
                    const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                    const animDuration = cropSpacingPx / (robotSpeed / 20);

                    // Previous pass rows that are visible (within SVG bounds) - for showing already seeded field
                    const visibleMinMm = -svgWidth / 2 / pxPerMm;
                    const visiblePrevPassRows = previousPassRowsMm.filter(mm => mm >= visibleMinMm);

                    // Group seeding patterns (defined once for reuse)
                    const groupPatterns: Record<number, { dx: number; dy: number }[]> = {
                      1: [{ dx: 0, dy: 0 }],
                      2: [{ dx: -3, dy: 0 }, { dx: 3, dy: 0 }],
                      3: [{ dx: 0, dy: -4 }, { dx: -4, dy: 3 }, { dx: 4, dy: 3 }],
                      4: [{ dx: -3, dy: -3 }, { dx: 3, dy: -3 }, { dx: -3, dy: 3 }, { dx: 3, dy: 3 }],
                      5: [{ dx: 0, dy: 0 }, { dx: -4, dy: -4 }, { dx: 4, dy: -4 }, { dx: -4, dy: 4 }, { dx: 4, dy: 4 }],
                      6: [{ dx: -3, dy: -4 }, { dx: 3, dy: -4 }, { dx: -5, dy: 0 }, { dx: 5, dy: 0 }, { dx: -3, dy: 4 }, { dx: 3, dy: 4 }],
                      7: [{ dx: 0, dy: 0 }, { dx: -3, dy: -4 }, { dx: 3, dy: -4 }, { dx: -5, dy: 0 }, { dx: 5, dy: 0 }, { dx: -3, dy: 4 }, { dx: 3, dy: 4 }],
                    };
                    const displayCount = Math.min(seedsPerGroup, 7);
                    const groupOffsets = groupPatterns[displayCount] || groupPatterns[3];
                    const groupScale = displayCount <= 3 ? 0.55 : displayCount <= 5 ? 0.5 : 0.45;

                    // Line seeding mode
                    if (seedingMode === "line") {
                      const lineCropSpacing = 3 * 3.5;
                      const lineNumRows = Math.ceil(visibleHeight / lineCropSpacing) + 3;
                      const lineFullFieldNumRows = Math.ceil(fullFieldHeight / lineCropSpacing) + 3;
                      const lineAnimDuration = lineCropSpacing / (robotSpeed / 20);
                      // Grid-aligned start for line mode previous pass
                      const lineGridAlignOffset = ((cropsStartY - rowAreaTop) % lineCropSpacing + lineCropSpacing) % lineCropSpacing;
                      const linePrevPassStartY = rowAreaTop + lineGridAlignOffset - lineCropSpacing;

                      return (
                        <>
                          {/* Previous pass - fully seeded field (entire height) */}
                          {visiblePrevPassRows.length > 0 && (
                            <g>
                              <g
                                style={{
                                  animation: isAnimating ? `lineScroll ${lineAnimDuration}s linear infinite` : "none",
                                }}
                              >
                                {Array.from({ length: lineFullFieldNumRows }).map((_, rowIdx) => {
                                  const baseY = linePrevPassStartY + rowIdx * lineCropSpacing;
                                  return visiblePrevPassRows.map((rowMm, colIdx) => {
                                    const x = mmToX(rowMm);
                                    return (
                                      <g
                                        key={`prev-line-${rowIdx}-${colIdx}`}
                                        transform={`translate(${x}, ${baseY}) scale(0.6)`}
                                        opacity={0.35}
                                      >
                                        <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                                      </g>
                                    );
                                  });
                                })}
                              </g>
                            </g>
                          )}
                          {/* Current pass - crops only below robot */}
                          <g clipPath="url(#cropsClip)">
                            <g
                              style={{
                                animation: isAnimating ? `lineScroll ${lineAnimDuration}s linear infinite` : "none",
                              }}
                            >
                              {Array.from({ length: lineNumRows }).map((_, rowIdx) => {
                                const baseY = cropsStartY - lineCropSpacing + rowIdx * lineCropSpacing;
                                return rowPositionsMm.map((rowMm, colIdx) => {
                                  const x = mmToX(rowMm);
                                  return (
                                    <g
                                      key={`line-${rowIdx}-${colIdx}`}
                                      transform={`translate(${x}, ${baseY}) scale(0.6)`}
                                      opacity={1}
                                    >
                                      <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                                    </g>
                                  );
                                });
                              })}
                            </g>
                          </g>
                        </>
                      );
                    }

                    // Single/Group seeding mode
                    return (
                      <>
                        {/* Previous pass - fully seeded field (entire height) */}
                        {visiblePrevPassRows.length > 0 && (
                          <g>
                            <g
                              style={{
                                animation: isAnimating ? `cropScroll ${animDuration}s linear infinite` : "none",
                              }}
                            >
                              {Array.from({ length: fullFieldNumRows }).map((_, rowIdx) => {
                                const baseY = prevPassStartY + rowIdx * cropSpacingPx;
                                return visiblePrevPassRows.map((rowMm, colIdx) => {
                                  const x = mmToX(rowMm);
                                  const diamondOffset = isDiamondPattern ? (colIdx % 2) * (cropSpacingPx / 2) : 0;

                                  if (seedingMode === "group") {
                                    return (
                                      <g
                                        key={`prev-crop-${rowIdx}-${colIdx}`}
                                        transform={`translate(${x}, ${baseY + diamondOffset})`}
                                        opacity={0.35}
                                      >
                                        {groupOffsets.map((offset, i) => (
                                          <g key={i} transform={`translate(${offset.dx}, ${offset.dy}) scale(${groupScale})`}>
                                            <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                                          </g>
                                        ))}
                                      </g>
                                    );
                                  }

                                  return (
                                    <g
                                      key={`prev-crop-${rowIdx}-${colIdx}`}
                                      transform={`translate(${x}, ${baseY + diamondOffset}) scale(0.7)`}
                                      opacity={0.35}
                                    >
                                      <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                                    </g>
                                  );
                                });
                              })}
                            </g>
                          </g>
                        )}
                        {/* Current pass - crops only below robot */}
                        <g clipPath="url(#cropsClip)">
                          <g
                            style={{
                              animation: isAnimating ? `cropScroll ${animDuration}s linear infinite` : "none",
                            }}
                          >
                            {Array.from({ length: numRows }).map((_, rowIdx) => {
                              const baseY = cropsStartY - cropSpacingPx + rowIdx * cropSpacingPx;
                              return rowPositionsMm.map((rowMm, colIdx) => {
                                const x = mmToX(rowMm);
                                const diamondOffset = isDiamondPattern ? (colIdx % 2) * (cropSpacingPx / 2) : 0;

                                if (seedingMode === "group") {
                                  return (
                                    <g
                                      key={`crop-${rowIdx}-${colIdx}`}
                                      transform={`translate(${x}, ${baseY + diamondOffset})`}
                                      opacity={1}
                                    >
                                      {groupOffsets.map((offset, i) => (
                                        <g key={i} transform={`translate(${offset.dx}, ${offset.dy}) scale(${groupScale})`}>
                                          <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                                        </g>
                                      ))}
                                    </g>
                                  );
                                }

                                return (
                                  <g
                                    key={`crop-${rowIdx}-${colIdx}`}
                                    transform={`translate(${x}, ${baseY + diamondOffset}) scale(0.7)`}
                                    opacity={1}
                                  >
                                    <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                                  </g>
                                );
                              });
                            })}
                          </g>
                        </g>
                      </>
                    );
                  })()}
                </g>
              )}

              {/* Legend - rendered early so tooltips appear on top */}
              <g transform={`translate(${margin.left + 10}, ${rowAreaTop + 10})`}>
                <rect x="-5" y="-5" width="95" height="75" rx="4" fill="white" fillOpacity="0.9" stroke="#e7e5e4" strokeWidth="1" />
                {/* Active row - badge icon */}
                <circle cx="10" cy="8" r="8" fill={colors.activeRow} />
                <text x="10" y="11" textAnchor="middle" className="text-[8px] fill-white font-semibold">1</text>
                <text x="28" y="12" className="text-[10px] fill-stone-600">Active row</text>
                {/* Passive row */}
                <line x1="0" y1="28" x2="20" y2="28" stroke={colors.passiveRow} strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="28" y="32" className="text-[10px] fill-stone-600">Passive row</text>
                {/* Crop or Seed line depending on mode */}
                {seedingMode === "line" ? (
                  <>
                    <g transform="translate(0, 48)">
                      {/* Dense row of small crop icons */}
                      {[0, 7, 14, 21].map((xPos, i) => (
                        <g key={i} transform={`translate(${xPos}, 0) scale(0.45)`}>
                          <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                        </g>
                      ))}
                    </g>
                    <text x="28" y="52" className="text-[10px] fill-stone-600">Seed line</text>
                  </>
                ) : seedingMode === "group" ? (
                  <>
                    <g transform="translate(10, 48)">
                      {/* Group icon - show plants based on seedsPerGroup (up to 7) */}
                      {(() => {
                        const legendPatterns: Record<number, { dx: number; dy: number }[]> = {
                          1: [{ dx: 0, dy: 0 }],
                          2: [{ dx: -2, dy: 0 }, { dx: 2, dy: 0 }],
                          3: [{ dx: 0, dy: -3 }, { dx: -3, dy: 2 }, { dx: 3, dy: 2 }],
                          4: [{ dx: -2, dy: -2 }, { dx: 2, dy: -2 }, { dx: -2, dy: 2 }, { dx: 2, dy: 2 }],
                          5: [{ dx: 0, dy: 0 }, { dx: -3, dy: -3 }, { dx: 3, dy: -3 }, { dx: -3, dy: 3 }, { dx: 3, dy: 3 }],
                          6: [{ dx: -2, dy: -3 }, { dx: 2, dy: -3 }, { dx: -4, dy: 0 }, { dx: 4, dy: 0 }, { dx: -2, dy: 3 }, { dx: 2, dy: 3 }],
                          7: [{ dx: 0, dy: 0 }, { dx: -2, dy: -3 }, { dx: 2, dy: -3 }, { dx: -4, dy: 0 }, { dx: 4, dy: 0 }, { dx: -2, dy: 3 }, { dx: 2, dy: 3 }],
                        };
                        const displayCount = Math.min(seedsPerGroup, 7);
                        const offsets = legendPatterns[displayCount] || legendPatterns[3];
                        const legendScale = displayCount <= 3 ? 0.5 : displayCount <= 5 ? 0.45 : 0.4;
                        return offsets.map((offset, i) => (
                          <g key={i} transform={`translate(${offset.dx}, ${offset.dy}) scale(${legendScale})`}>
                            <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                          </g>
                        ));
                      })()}
                    </g>
                    <text x="28" y="52" className="text-[10px] fill-stone-600">Portion</text>
                  </>
                ) : (
                  <>
                    <g transform="translate(10, 48)">
                      <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
                    </g>
                    <text x="28" y="52" className="text-[10px] fill-stone-600">Crop</text>
                  </>
                )}
              </g>

              {/* Pause button - rendered early so tooltips appear on top */}
              <g
                transform={`translate(${svgWidth - margin.right - 45}, ${rowAreaTop + 25})`}
                className="cursor-pointer"
                onClick={() => setIsAnimating(!isAnimating)}
              >
                <rect x="-18" y="-18" width="36" height="36" rx="18" fill="white" fillOpacity="0.95" stroke="#d6d3d1" strokeWidth="1.5" />
                {isAnimating ? (
                  <>
                    <rect x="-6" y="-8" width="4" height="16" rx="1" fill="#78716c" />
                    <rect x="2" y="-8" width="4" height="16" rx="1" fill="#78716c" />
                  </>
                ) : (
                  <polygon points="-4,-8 -4,8 8,0" fill="#78716c" />
                )}
              </g>

              {/* Spacing labels - subtle, between rows */}
              {rowSpacings.map((spacing, idx) => {
                const leftX = mmToX(rowPositionsMm[idx]);
                const rightX = mmToX(rowPositionsMm[idx + 1]);
                const midX = (leftX + rightX) / 2;
                const gapPx = rightX - leftX;
                const isHovered = hoveredSpacing === idx;
                const isEditing = editingSpacing === idx;

                if (gapPx < 40) return null;

                const spacingY = rowAreaTop + 145;

                return (
                  <g
                    key={`spacing-label-${idx}`}
                    onMouseEnter={() => !isEditing && setHoveredSpacing(idx)}
                    onMouseLeave={() => !isEditing && setHoveredSpacing(null)}
                  >
                    {/* Hitbox - invisible, just for click detection */}
                    {!isEditing && (
                      <rect
                        x={leftX - 10}
                        y={spacingY - 30}
                        width={rightX - leftX + 20}
                        height={55}
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => handleStartEditSpacing(idx)}
                      />
                    )}

                    {/* Dimension lines - always visible */}
                    <g className={isEditing ? "" : "cursor-pointer"} onClick={() => !isEditing && handleStartEditSpacing(idx)}>
                      {/* Left tick */}
                      <line x1={leftX} y1={spacingY - 7} x2={leftX} y2={spacingY + 7} stroke={isHovered || isEditing ? "#57534e" : "#78716c"} strokeWidth="1.5" />
                      {/* Horizontal line */}
                      <line x1={leftX} y1={spacingY} x2={rightX} y2={spacingY} stroke={isHovered || isEditing ? "#57534e" : "#78716c"} strokeWidth="1.5" />
                      {/* Right tick */}
                      <line x1={rightX} y1={spacingY - 7} x2={rightX} y2={spacingY + 7} stroke={isHovered || isEditing ? "#57534e" : "#78716c"} strokeWidth="1.5" />
                    </g>

                    {isEditing ? (
                      <foreignObject x={midX - 32} y={spacingY - 30} width={64} height={22}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={handleFinishEditSpacing}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleFinishEditSpacing();
                            if (e.key === "Escape") {
                              setEditingSpacing(null);
                              setEditingValue("");
                            }
                          }}
                          autoFocus
                          className="w-full h-full text-center text-[11px] font-medium text-stone-700 bg-white border border-emerald-400 rounded outline-none"
                          style={{ fontSize: "11px", padding: "2px" }}
                        />
                      </foreignObject>
                    ) : (
                      <text
                        x={midX}
                        y={spacingY - 12}
                        textAnchor="middle"
                        className={`cursor-pointer transition-all ${isHovered ? "text-[14px] font-bold fill-stone-900" : "text-[12px] font-medium fill-stone-600"}`}
                        onClick={() => handleStartEditSpacing(idx)}
                      >
                        {spacing / 10} cm
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Between-pass spacing dimension line - shown when hovering/dragging the working width handle */}
              {(hoveredGap === -1 || draggingWorkingWidth) && previousPassRowsMm.length > 0 && (() => {
                const prevRightmostMm = previousPassRowsMm[previousPassRowsMm.length - 1];
                const currLeftmostMm = rowPositionsMm[0];
                const visibleMinMm = -svgWidth / 2 / pxPerMm;
                if (prevRightmostMm < visibleMinMm) return null;

                const leftX = mmToX(prevRightmostMm);
                const rightX = mmToX(currLeftmostMm);
                const midX = (leftX + rightX) / 2;
                const spacingY = rowAreaTop + 145;
                const gapPx = rightX - leftX;

                if (gapPx < 40) return null;

                return (
                  <g>
                    {/* Left tick */}
                    <line x1={leftX} y1={spacingY - 7} x2={leftX} y2={spacingY + 7} stroke="#0d9488" strokeWidth="1.5" />
                    {/* Horizontal line */}
                    <line x1={leftX} y1={spacingY} x2={rightX} y2={spacingY} stroke="#0d9488" strokeWidth="1.5" />
                    {/* Right tick */}
                    <line x1={rightX} y1={spacingY - 7} x2={rightX} y2={spacingY + 7} stroke="#0d9488" strokeWidth="1.5" />
                    {/* Spacing value label */}
                    <text
                      x={midX}
                      y={spacingY - 12}
                      textAnchor="middle"
                      className="text-[14px] font-bold fill-teal-600"
                    >
                      {(betweenPassSpacing / 10).toFixed(1)} cm
                    </text>
                  </g>
                );
              })()}

              {/* Wheel tracks in soil - rendered before seeding units so hoppers appear solid */}
              {(() => {
                const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                const frontWheelY = 105;
                const backWheelY = rowAreaBottom - wheelHeight - 60;

                // Front wheel tracks - from bottom of front wheels to bottom of SVG
                const frontTrackStartY = frontWheelY + wheelHeight;
                const frontTrackLength = rowAreaBottom - frontTrackStartY + 20;

                // Back wheel tracks - from bottom of back wheels to bottom of SVG
                const backTrackStartY = backWheelY + wheelHeight;
                const backTrackLength = rowAreaBottom - backTrackStartY + 20;

                return (
                  <g>
                    {/* Front wheel tracks */}
                    {is3Wheel && frontWheelMm !== null ? (
                      /* 3-wheel mode - single front wheel track in center */
                      <WheelTrack
                        x={mmToX(frontWheelMm) - wheelWidth/2}
                        y={frontTrackStartY}
                        width={wheelWidth}
                        trackLength={frontTrackLength}
                        isAnimating={isAnimating}
                        robotSpeed={robotSpeed}
                        id="front-center"
                      />
                    ) : (
                      /* 4-wheel mode - left and right front wheel tracks */
                      <>
                        <WheelTrack
                          x={mmToX(leftWheelMm) - wheelWidth/2}
                          y={frontTrackStartY}
                          width={wheelWidth}
                          trackLength={frontTrackLength}
                          isAnimating={isAnimating}
                          robotSpeed={robotSpeed}
                          id="front-left"
                        />
                        <WheelTrack
                          x={mmToX(rightWheelMm) - wheelWidth/2}
                          y={frontTrackStartY}
                          width={wheelWidth}
                          trackLength={frontTrackLength}
                          isAnimating={isAnimating}
                          robotSpeed={robotSpeed}
                          id="front-right"
                        />
                      </>
                    )}

                    {/* Back wheel tracks - always show for left and right back wheels */}
                    <WheelTrack
                      x={mmToX(leftWheelMm) - wheelWidth/2}
                      y={backTrackStartY}
                      width={wheelWidth}
                      trackLength={backTrackLength}
                      isAnimating={isAnimating}
                      robotSpeed={robotSpeed}
                      id="back-left"
                    />
                    <WheelTrack
                      x={mmToX(rightWheelMm) - wheelWidth/2}
                      y={backTrackStartY}
                      width={wheelWidth}
                      trackLength={backTrackLength}
                      isAnimating={isAnimating}
                      robotSpeed={robotSpeed}
                      id="back-right"
                    />
                  </g>
                );
              })()}

              {/* Toolbeam - 3.4m wide horizontal bar */}
              {config.activeRows > 0 && (
                <g>
                  <line
                    x1={svgCenterX - (3400 / 2) * pxPerMm}
                    y1={(rowAreaTop + rowAreaBottom) / 2 - 50}
                    x2={svgCenterX + (3400 / 2) * pxPerMm}
                    y2={(rowAreaTop + rowAreaBottom) / 2 - 50}
                    stroke={colors.activeRow}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                  {/* Seeding units on each row - draggable */}
                  {rowPositionsMm.map((rowMm, idx) => {
                    const canDrag = config.activeRows > 1;
                    const isDragging = draggingRowIdx === idx;
                    const isHovered = hoveredSeedUnit === idx || hoveredRow === idx;
                    return (
                      <g
                        key={`seeding-unit-${idx}`}
                        transform={`translate(${mmToX(rowMm)}, ${(rowAreaTop + rowAreaBottom) / 2 - 35})`}
                        className={`${canDrag ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"} ${showDragHint && canDrag ? "drag-hint-wiggle" : ""}`}
                        onMouseEnter={() => { setHoveredSeedUnit(idx); setHoveredRow(idx); }}
                        onMouseLeave={() => { if (!isDragging) { setHoveredSeedUnit(null); setHoveredRow(null); } }}
                        onMouseDown={canDrag ? (e) => { e.preventDefault(); handleRowDragStart(idx, e.clientX); setShowDragHint(false); } : undefined}
                        style={{ opacity: isHovered || isDragging ? 1 : 0.95 }}
                      >
                        <SeedingUnit seedSize={config.seedSize} />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Active Row Lines with drag/remove UI */}
              {/* Warning highlights for previous pass rows too close to wheels */}
              {previousPassRowsMm.map((rowMm, idx) => {
                const x = mmToX(rowMm);
                const isTooCloseToWheel = isRowTooCloseToBackWheel(rowMm);
                // Only render if visible (within SVG bounds)
                const visibleMinMm = -svgWidth / 2 / pxPerMm;
                if (rowMm < visibleMinMm) return null;

                return isTooCloseToWheel ? (
                  <rect
                    key={`prev-pass-warning-${idx}`}
                    x={x - 12}
                    y={rowAreaTop}
                    width={24}
                    height={rowAreaBottom - rowAreaTop}
                    fill={colors.warningBg}
                    rx={2}
                    style={{ pointerEvents: "none" }}
                  />
                ) : null;
              })}

              {rowPositionsMm.map((rowMm, idx) => {
                const x = mmToX(rowMm);
                const isHovered = hoveredRow === idx;
                const isDragging = draggingRowIdx === idx;
                const canRemove = config.activeRows > (is3Wheel ? 2 : 1);
                const canDrag = config.activeRows > 1;
                const isTooCloseToWheel = isRowTooCloseToWheel(rowMm);
                // Check if this row is marked for removal (either directly hovered or its mirror pair)
                const mirrorIdx = getMirrorRowIndex(idx);
                const isMarkedForRemoval = hoveredRemoveRow !== null &&
                  (idx === hoveredRemoveRow || idx === mirrorIdx || getMirrorRowIndex(hoveredRemoveRow) === idx);

                return (
                  <g
                    key={`row-${idx}`}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => !isDragging && setHoveredRow(null)}
                  >
                    {/* Removal highlight - shows when hovering remove button on this or paired row */}
                    {isMarkedForRemoval && (
                      <rect
                        x={x - 15}
                        y={rowAreaTop}
                        width={30}
                        height={rowAreaBottom - rowAreaTop}
                        fill="rgba(248, 113, 113, 0.15)"
                        rx={4}
                        style={{ pointerEvents: "none" }}
                      />
                    )}

                    {/* Warning highlight */}
                    {isTooCloseToWheel && !isMarkedForRemoval && (
                      <rect
                        x={x - 12}
                        y={rowAreaTop}
                        width={24}
                        height={rowAreaBottom - rowAreaTop}
                        fill={colors.warningBg}
                        rx={2}
                        style={{ pointerEvents: "none" }}
                      />
                    )}

                    {/* Row number badge - visual only, interaction handled in separate layer */}
                    <g transform={`translate(${x}, ${(rowAreaTop + rowAreaBottom) / 2 - 75})`} style={{ pointerEvents: "none" }}>
                      {/* Badge circle */}
                      <circle
                        r={14}
                        fill={isMarkedForRemoval ? "#fca5a5" : (isHovered || isDragging ? colors.activeRowHover : colors.activeRow)}
                      />

                      {/* Show X icon when hovered and can remove, otherwise show row number */}
                      {isHovered && canRemove && !isDragging ? (
                        <g>
                          <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                          <line x1="4" y1="-4" x2="-4" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </g>
                      ) : (
                        <text
                          y={5}
                          textAnchor="middle"
                          className={`text-[12px] font-semibold select-none ${isMarkedForRemoval ? "fill-red-700" : "fill-white"}`}
                        >
                          {idx + 1}
                        </text>
                      )}

                      {/* Tooltip showing paired removal */}
                      {hoveredRemoveRow === idx && (
                        <g>
                          <rect x="-52" y="22" width="104" height="22" rx="4" fill="#1c1917" fillOpacity="0.9" />
                          <text y="37" textAnchor="middle" className="text-[10px] fill-white">
                            Remove rows {Math.min(idx + 1, mirrorIdx + 1)} &amp; {Math.max(idx + 1, mirrorIdx + 1)}
                          </text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}

              {/* CSS animation for passive row dash offset - speed based */}
              {(() => {
                const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                const passiveDuration = 247 / robotSpeed; // ~0.26s at 950m/h, ~0.41s at 600m/h
                return (
              <style>
                {`
                  @keyframes dashScroll {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -13px; }
                  }
                  .passive-row-animated {
                    animation: dashScroll ${passiveDuration.toFixed(3)}s linear infinite;
                  }
                `}
              </style>
                );
              })()}

              {/* Inner Passive Rows - animated with CSS */}
              {rowSpacings.map((spacing, idx) => {
                const passiveCount = getPassiveRowsInGap(spacing);
                if (passiveCount === 0) return null;

                const leftX = mmToX(rowPositionsMm[idx]);
                const rightX = mmToX(rowPositionsMm[idx + 1]);
                const gapWidth = rightX - leftX;

                const passivePositions: number[] = [];
                for (let p = 1; p <= passiveCount; p++) {
                  passivePositions.push(leftX + (gapWidth * p) / (passiveCount + 1));
                }

                return (
                  <g key={`passive-inner-${idx}`} style={{ pointerEvents: "none" }}>
                    {passivePositions.map((pX, pIdx) => (
                      <line
                        key={`passive-${idx}-${pIdx}`}
                        x1={pX}
                        y1={rowAreaTop}
                        x2={pX}
                        y2={rowAreaBottom}
                        stroke={colors.passiveRow}
                        strokeWidth={1.5}
                        strokeDasharray="8,5"
                        className={isAnimating ? "passive-row-animated" : ""}
                      />
                    ))}
                  </g>
                );
              })}

              {/* Right Outer Passive Row - animated with CSS */}
              {rightOuterPassiveMm !== null && (
                <g style={{ pointerEvents: "none" }}>
                  <line
                    x1={mmToX(rightOuterPassiveMm)}
                    y1={rowAreaTop}
                    x2={mmToX(rightOuterPassiveMm)}
                    y2={rowAreaBottom}
                    stroke={colors.passiveRow}
                    strokeWidth={1.5}
                    strokeDasharray="8,5"
                    className={isAnimating ? "passive-row-animated" : ""}
                  />
                </g>
              )}

              {/* Add row button - center when no rows */}
              {canAddMoreRows && config.activeRows === 0 && (
                <g
                  className="cursor-pointer"
                  onClick={() => handleSetRowCount(is3Wheel ? 2 : 1)}
                  transform={`translate(${svgCenterX}, ${(rowAreaTop + rowAreaBottom) / 2})`}
                >
                  <circle r="24" fill="white" stroke={colors.addBtn} strokeWidth="2" />
                  <text y="6" textAnchor="middle" className="text-[20px] fill-emerald-600 font-bold select-none">+</text>
                  <text y="50" textAnchor="middle" className="text-[12px] fill-emerald-600 font-medium">Click to add rows</text>
                </g>
              )}

              {/* Hover zones between previous pass rows */}
              {previousPassRowsMm.length > 1 && rowSpacings.map((spacing, idx) => {
                // Only show gaps that are visible
                if (idx >= previousPassRowsMm.length - 1) return null;

                const leftMm = previousPassRowsMm[idx];
                const rightMm = previousPassRowsMm[idx + 1];
                const visibleMinMm = -svgWidth / 2 / pxPerMm;

                // Skip if both rows are off-screen
                if (rightMm < visibleMinMm) return null;

                const leftX = mmToX(leftMm);
                const rightX = mmToX(rightMm);
                const midX = (leftX + rightX) / 2;
                const gapWidth = rightX - leftX;
                const seedingUnitY = (rowAreaTop + rowAreaBottom) / 2 - 35;
                const seedingUnitHeight = config.seedSize === "6mm" ? 90 : 100;
                // Use negative indices starting from -2 for previous pass gaps
                const gapIndex = -(idx + 2);
                const isHoveredGap = hoveredGap === gapIndex && draggingRowIdx === null;
                const isDragging = draggingRowIdx !== null;

                if (gapWidth < 10) return null;

                return (
                  <g
                    key={`prev-pass-row-gap-${idx}`}
                    onMouseEnter={() => {
                      if (!isDragging) {
                        setHoveredGap(gapIndex);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredGap(null);
                    }}
                  >
                    {/* Hover area - full height */}
                    <rect
                      x={leftX + 2}
                      y={rowAreaTop}
                      width={gapWidth - 4}
                      height={rowAreaBottom - rowAreaTop}
                      fill={isHoveredGap ? "rgba(100, 116, 139, 0.08)" : "transparent"}
                      pointerEvents="all"
                    />
                    {/* Spacing label - shown when hovered */}
                    {isHoveredGap && (
                      <text
                        x={midX}
                        y={rowAreaTop + 145 - 12}
                        textAnchor="middle"
                        className="text-[14px] font-bold fill-stone-900"
                      >
                        {(spacing / 10).toFixed(1)} cm
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draggable boundary between previous pass and current pass for adjusting working width */}
              {previousPassRowsMm.length > 0 && (() => {
                const prevRightmostMm = previousPassRowsMm[previousPassRowsMm.length - 1];
                const currLeftmostMm = rowPositionsMm[0];
                // Only show if previous pass rightmost row is visible
                const visibleMinMm = -svgWidth / 2 / pxPerMm;
                if (prevRightmostMm < visibleMinMm) return null;

                const leftX = mmToX(prevRightmostMm);
                const boundaryX = mmToX(currLeftmostMm);
                const midX = (leftX + boundaryX) / 2;
                const gapWidth = boundaryX - leftX;
                const isHovered = hoveredGap === -1;
                const isDragging = draggingWorkingWidth;
                const isAnyDragging = draggingRowIdx !== null || draggingWorkingWidth;

                if (gapWidth < 20) return null;

                return (
                  <g key="working-width-drag-handle">
                    {/* Gap hover area for showing between-pass spacing */}
                    <g
                      onMouseEnter={() => !isAnyDragging && setHoveredGap(-1)}
                      onMouseLeave={() => !isDragging && setHoveredGap(null)}
                    >
                      <rect
                        x={leftX}
                        y={rowAreaTop}
                        width={gapWidth - 20}
                        height={rowAreaBottom - rowAreaTop}
                        fill={isHovered && !isDragging ? "rgba(100, 116, 139, 0.08)" : "transparent"}
                        pointerEvents="all"
                      />
                      {/* Between-pass spacing label - shown when hovered but not dragging */}
                      {isHovered && !isDragging && (
                        <text
                          x={midX}
                          y={rowAreaTop + 145 - 12}
                          textAnchor="middle"
                          className="text-[14px] font-bold fill-stone-900"
                        >
                          {(betweenPassSpacing / 10).toFixed(1)} cm
                        </text>
                      )}
                    </g>

                    {/* Draggable handle at the faded row closest to the robot */}
                    {(() => {
                      // Calculate handle Y position - follow mouse or use center as default
                      const handleY = workingWidthHandleY !== null
                        ? Math.max(rowAreaTop + 30, Math.min(rowAreaBottom - 30, workingWidthHandleY))
                        : (rowAreaTop + rowAreaBottom) / 2;

                      return (
                        <g
                          style={{ cursor: isDragging ? "grabbing" : (isHovered ? "grab" : "default") }}
                          onMouseEnter={() => !isAnyDragging && setHoveredGap(-1)}
                          onMouseLeave={() => {
                            if (!isDragging) {
                              setHoveredGap(null);
                              setWorkingWidthHandleY(null);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (!svgRef.current) return;
                            const rect = svgRef.current.getBoundingClientRect();
                            const svgY = (e.clientY - rect.top) * (svgHeight / rect.height);
                            setWorkingWidthHandleY(svgY);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleWorkingWidthDragStart(e.clientX);
                          }}
                        >
                          {/* Invisible wider hit area for easier grabbing */}
                          <rect
                            x={leftX - 20}
                            y={rowAreaTop}
                            width={40}
                            height={rowAreaBottom - rowAreaTop}
                            fill="transparent"
                            style={{ pointerEvents: "all" }}
                          />
                          {/* Drag handle bubble - only shown on hover */}
                          {(isHovered || isDragging) && (
                            <g transform={`translate(${leftX}, ${handleY})`} style={{ pointerEvents: "none" }}>
                              <circle r="14" fill={isDragging ? "#0d9488" : "#14b8a6"} />
                              <text y="5" textAnchor="middle" className="text-[12px] fill-white font-bold select-none">
                                {"<>"}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })()}
                  </g>
                );
              })()}

              {/* Hover zones between rows - shows spacing on hover, add button if possible */}
              {rowSpacings.map((spacing, idx) => {
                const leftX = mmToX(rowPositionsMm[idx]);
                const rightX = mmToX(rowPositionsMm[idx + 1]);
                const midX = (leftX + rightX) / 2;
                const gapWidth = rightX - leftX;
                const seedingUnitY = (rowAreaTop + rowAreaBottom) / 2 - 35;
                const seedingUnitHeight = config.seedSize === "6mm" ? 90 : 100;
                const isHoveredGap = hoveredGap === idx && draggingRowIdx === null;
                const isDragging = draggingRowIdx !== null;

                // Account for seeding unit width (larger unit is ~53px, so ~27px half-width)
                const seedingUnitHalfWidth = config.seedSize === "6mm" ? 23 : 27;
                const visibleGapStart = leftX + seedingUnitHalfWidth;
                const visibleGapEnd = rightX - seedingUnitHalfWidth;
                const visibleGapWidth = visibleGapEnd - visibleGapStart;

                // Only show if there's some gap
                if (gapWidth < 10) return null;

                // Scale button size based on visible gap width
                const buttonRadius = Math.min(14, Math.max(8, Math.max(visibleGapWidth, 20) / 3));
                const fontSize = buttonRadius >= 12 ? "16px" : "12px";
                // For between-row inserts: only check max rows (not working width, since we're splitting existing gaps)
                // and that the gap is large enough to split into two valid gaps
                const canInsertBetweenRows = config.activeRows + 2 <= ROW_CONSTRAINTS.maxActiveRows && spacing >= minRowDistance * 2;
                const showAddButton = canInsertBetweenRows && gapWidth >= 20;

                return (
                  <g
                    key={`add-zone-${idx}`}
                    onMouseEnter={() => {
                      if (!isDragging) {
                        setHoveredGap(idx);
                        setHoveredSpacing(idx); // Highlight the spacing label above
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredGap(null);
                      setHoveredSpacing(null);
                    }}
                    onClick={() => !isDragging && showAddButton && handleAddRowAt(idx)}
                    style={{ cursor: showAddButton ? "pointer" : "default" }}
                  >
                    {/* Hover area above seeding units - full gap width */}
                    <rect
                      x={leftX + 2}
                      y={rowAreaTop}
                      width={gapWidth - 4}
                      height={seedingUnitY - rowAreaTop}
                      fill={isHoveredGap ? "rgba(13, 148, 136, 0.08)" : "transparent"}
                      pointerEvents="all"
                    />
                    {/* Hover area at seeding unit level - narrower to avoid overlap */}
                    {visibleGapWidth > 5 && (
                      <rect
                        x={visibleGapStart}
                        y={seedingUnitY}
                        width={visibleGapWidth}
                        height={seedingUnitHeight}
                        fill={isHoveredGap ? "rgba(13, 148, 136, 0.08)" : "transparent"}
                        pointerEvents="all"
                      />
                    )}
                    {/* Hover area below seeding units - full gap width */}
                    <rect
                      x={leftX + 2}
                      y={seedingUnitY + seedingUnitHeight}
                      width={gapWidth - 4}
                      height={rowAreaBottom - (seedingUnitY + seedingUnitHeight)}
                      fill={isHoveredGap ? "rgba(13, 148, 136, 0.08)" : "transparent"}
                      pointerEvents="all"
                    />
                    {/* Add button at seeding unit level - lower threshold for more consistent visibility */}
                    {isHoveredGap && showAddButton && visibleGapWidth > 5 && (
                      <g transform={`translate(${midX}, ${seedingUnitY + seedingUnitHeight / 2})`}>
                        <circle
                          r={buttonRadius}
                          fill="white"
                          stroke={colors.addBtn}
                          strokeWidth="1.5"
                        />
                        <text
                          y={buttonRadius >= 12 ? 5 : 4}
                          textAnchor="middle"
                          style={{ fontSize }}
                          className="fill-emerald-600 font-medium select-none"
                        >+</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Hover zone for gap between current pass and next pass (right side) */}
              {rowPositionsMm.length > 0 && (() => {
                const currRightmostMm = rowPositionsMm[rowPositionsMm.length - 1];
                const nextPassFirstMm = currRightmostMm + betweenPassSpacing;

                const leftX = mmToX(currRightmostMm);
                const rightX = mmToX(nextPassFirstMm);
                const midX = (leftX + rightX) / 2;
                const seedingUnitY = (rowAreaTop + rowAreaBottom) / 2 - 35;
                const seedingUnitHeight = config.seedSize === "6mm" ? 90 : 100;
                const seedingUnitHalfWidth = config.seedSize === "6mm" ? 23 : 27;
                // Use -1000 as a special index for the right side gap
                const isHovered = hoveredGap === -1000;
                const isDragging = draggingRowIdx !== null;

                // Start from the center of the last row, extend to where next pass's first row will be
                const visibleGapStart = leftX;
                const visibleGapWidth = rightX - visibleGapStart;

                if (visibleGapWidth < 10) return null;

                return (
                  <g
                    key="next-pass-gap"
                    onMouseEnter={() => !isDragging && setHoveredGap(-1000)}
                    onMouseLeave={() => setHoveredGap(null)}
                  >
                    {/* Hover area above seeding units */}
                    <rect
                      x={visibleGapStart}
                      y={rowAreaTop}
                      width={visibleGapWidth}
                      height={seedingUnitY - rowAreaTop}
                      fill={isHovered ? "rgba(100, 116, 139, 0.08)" : "transparent"}
                      pointerEvents="all"
                    />
                    {/* Hover area at seeding unit level */}
                    <rect
                      x={visibleGapStart}
                      y={seedingUnitY}
                      width={visibleGapWidth}
                      height={seedingUnitHeight}
                      fill={isHovered ? "rgba(100, 116, 139, 0.08)" : "transparent"}
                      pointerEvents="all"
                    />
                    {/* Hover area below seeding units */}
                    <rect
                      x={visibleGapStart}
                      y={seedingUnitY + seedingUnitHeight}
                      width={visibleGapWidth}
                      height={rowAreaBottom - (seedingUnitY + seedingUnitHeight)}
                      fill={isHovered ? "rgba(100, 116, 139, 0.08)" : "transparent"}
                      pointerEvents="all"
                    />
                    {/* Between-pass spacing label - shown when hovered */}
                    {isHovered && (
                      <text
                        x={midX}
                        y={rowAreaTop + 145 - 12}
                        textAnchor="middle"
                        className="text-[14px] font-bold fill-stone-900"
                      >
                        {(betweenPassSpacing / 10).toFixed(1)} cm
                      </text>
                    )}
                  </g>
                );
              })()}

              {/* Direction indicator - on top of animation */}
              <g transform={`translate(${svgCenterX}, 55)`}>
                <polygon points="0,-18 5,-9 -5,-9" fill="#78716c" />
                <text y="6" textAnchor="middle" className="text-[9px] fill-stone-500 font-medium tracking-widest uppercase">Front</text>
              </g>

              {/* Front Wheel(s) - on top of animation */}
              {(() => {
                const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                const edgeZoneWidth = 8;
                return is3Wheel && frontWheelMm !== null ? (
                  <g
                    onMouseEnter={() => setHoveredWheel("front")}
                    onMouseLeave={() => { setHoveredWheel(null); setHoveredWheelEdge(null); }}
                    className="cursor-default"
                  >
                    <g transform={`translate(${mmToX(frontWheelMm) - wheelWidth/2}, 105)`}>
                      <TractorWheel
                        width={wheelWidth}
                        height={wheelHeight}
                        isAnimating={isAnimating}
                        robotSpeed={robotSpeed}
                        isHovered={hoveredWheel === "front"}
                      />
                      {/* Edge hover zones for distance indicator */}
                      <rect
                        x={0}
                        y={0}
                        width={edgeZoneWidth}
                        height={wheelHeight}
                        fill="transparent"
                        className="cursor-help"
                        onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "front", edge: "left" }); }}
                        onMouseLeave={() => setHoveredWheelEdge(null)}
                      />
                      <rect
                        x={wheelWidth - edgeZoneWidth}
                        y={0}
                        width={edgeZoneWidth}
                        height={wheelHeight}
                        fill="transparent"
                        className="cursor-help"
                        onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "front", edge: "right" }); }}
                        onMouseLeave={() => setHoveredWheelEdge(null)}
                      />
                    </g>
                    {/* Tooltip on hover */}
                    {hoveredWheel === "front" && !hoveredWheelEdge && (
                      <g transform={`translate(${mmToX(frontWheelMm)}, ${105 + wheelHeight})`}>
                        <rect x="-40" y="4" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                        <text y="18" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                        <text y="28" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                        <line x1={-wheelWidth/2 + 2} y1="36" x2={wheelWidth/2 - 2} y2="36" stroke="white" strokeWidth="1" />
                        <line x1={-wheelWidth/2 + 2} y1="33" x2={-wheelWidth/2 + 2} y2="39" stroke="white" strokeWidth="1" />
                        <line x1={wheelWidth/2 - 2} y1="33" x2={wheelWidth/2 - 2} y2="39" stroke="white" strokeWidth="1" />
                      </g>
                    )}
                  </g>
                ) : (
                  <>
                    <g
                      onMouseEnter={() => setHoveredWheel("frontLeft")}
                      onMouseLeave={() => { setHoveredWheel(null); setHoveredWheelEdge(null); }}
                      className="cursor-default"
                    >
                      <g transform={`translate(${mmToX(leftWheelMm) - wheelWidth/2}, 105)`}>
                        <TractorWheel
                          width={wheelWidth}
                          height={wheelHeight}
                          isAnimating={isAnimating}
                          robotSpeed={robotSpeed}
                          isHovered={hoveredWheel === "frontLeft"}
                        />
                        {/* Edge hover zones for distance indicator */}
                        <rect
                          x={0}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "frontLeft", edge: "left" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                        <rect
                          x={wheelWidth - edgeZoneWidth}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "frontLeft", edge: "right" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                      </g>
                      {/* Tooltip on hover */}
                      {hoveredWheel === "frontLeft" && !hoveredWheelEdge && (
                        <g transform={`translate(${mmToX(leftWheelMm)}, ${105 + wheelHeight})`}>
                          <rect x="-40" y="4" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                          <text y="18" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                          <text y="28" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                          <line x1={-wheelWidth/2 + 2} y1="36" x2={wheelWidth/2 - 2} y2="36" stroke="white" strokeWidth="1" />
                          <line x1={-wheelWidth/2 + 2} y1="33" x2={-wheelWidth/2 + 2} y2="39" stroke="white" strokeWidth="1" />
                          <line x1={wheelWidth/2 - 2} y1="33" x2={wheelWidth/2 - 2} y2="39" stroke="white" strokeWidth="1" />
                        </g>
                      )}
                    </g>
                    <g
                      onMouseEnter={() => setHoveredWheel("frontRight")}
                      onMouseLeave={() => { setHoveredWheel(null); setHoveredWheelEdge(null); }}
                      className="cursor-default"
                    >
                      <g transform={`translate(${mmToX(rightWheelMm) - wheelWidth/2}, 105)`}>
                        <TractorWheel
                          width={wheelWidth}
                          height={wheelHeight}
                          isAnimating={isAnimating}
                          robotSpeed={robotSpeed}
                          isHovered={hoveredWheel === "frontRight"}
                        />
                        {/* Edge hover zones for distance indicator */}
                        <rect
                          x={0}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "frontRight", edge: "left" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                        <rect
                          x={wheelWidth - edgeZoneWidth}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "frontRight", edge: "right" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                      </g>
                      {/* Tooltip on hover */}
                      {hoveredWheel === "frontRight" && !hoveredWheelEdge && (
                        <g transform={`translate(${mmToX(rightWheelMm)}, ${105 + wheelHeight})`}>
                          <rect x="-40" y="4" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                          <text y="18" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                          <text y="28" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                          <line x1={-wheelWidth/2 + 2} y1="36" x2={wheelWidth/2 - 2} y2="36" stroke="white" strokeWidth="1" />
                          <line x1={-wheelWidth/2 + 2} y1="33" x2={-wheelWidth/2 + 2} y2="39" stroke="white" strokeWidth="1" />
                          <line x1={wheelWidth/2 - 2} y1="33" x2={wheelWidth/2 - 2} y2="39" stroke="white" strokeWidth="1" />
                        </g>
                      )}
                    </g>
                  </>
                );
              })()}

              {/* Extended hover zones for wheel edge to row distance - rendered BEFORE wheels so wheels stay on top */}
              {(() => {
                const backWheelY = rowAreaBottom - wheelHeight - 60;
                const frontWheelY = 105;

                // Calculate extended zones from wheel edges to nearest rows
                const zones: Array<{
                  wheel: "backLeft" | "backRight" | "front" | "frontLeft" | "frontRight";
                  edge: "left" | "right";
                  x: number;
                  width: number;
                  y: number;
                }> = [];

                // Helper to calculate zone for a wheel edge
                const addZone = (
                  wheel: "backLeft" | "backRight" | "front" | "frontLeft" | "frontRight",
                  edge: "left" | "right",
                  wheelMm: number,
                  wheelY: number
                ) => {
                  const edgeMm = edge === "left"
                    ? wheelMm - wheelWidthMm / 2
                    : wheelMm + wheelWidthMm / 2;

                  const nearest = getDistanceToNearestRow(edgeMm, edge);
                  if (!nearest || nearest.distance < 10) return; // Skip if no rows or too close

                  // Use visual wheel edge (pixels) for the zone
                  const wheelCenterX = mmToX(wheelMm);
                  const visualEdgeX = edge === "left"
                    ? wheelCenterX - wheelWidth / 2
                    : wheelCenterX + wheelWidth / 2;
                  const rowX = mmToX(nearest.rowMm);
                  const x = Math.min(visualEdgeX, rowX);
                  const width = Math.abs(visualEdgeX - rowX);

                  zones.push({ wheel, edge, x, width, y: wheelY });
                };

                // Add zones for back wheels
                addZone("backLeft", "left", leftWheelMm, backWheelY);
                addZone("backLeft", "right", leftWheelMm, backWheelY);
                addZone("backRight", "left", rightWheelMm, backWheelY);
                addZone("backRight", "right", rightWheelMm, backWheelY);

                // Add zones for front wheels
                if (frontWheelMm !== null) {
                  // 3-wheel mode
                  addZone("front", "left", frontWheelMm, frontWheelY);
                  addZone("front", "right", frontWheelMm, frontWheelY);
                } else {
                  // 4-wheel mode
                  addZone("frontLeft", "left", leftWheelMm, frontWheelY);
                  addZone("frontLeft", "right", leftWheelMm, frontWheelY);
                  addZone("frontRight", "left", rightWheelMm, frontWheelY);
                  addZone("frontRight", "right", rightWheelMm, frontWheelY);
                }

                return zones.map((zone, i) => (
                  <rect
                    key={`zone-${i}`}
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={wheelHeight}
                    fill="transparent"
                    className="cursor-help"
                    onMouseEnter={() => setHoveredWheelEdge({ wheel: zone.wheel, edge: zone.edge })}
                    onMouseLeave={() => setHoveredWheelEdge(null)}
                  />
                ));
              })()}

              {/* Back Wheels - Draggable, on top of animation */}
              {(() => {
                const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                const backWheelY = rowAreaBottom - wheelHeight - 60;
                const edgeZoneWidth = 8; // Width of edge hover zones
                return (
                  <>
                    <g
                      className="cursor-ew-resize"
                      onMouseDown={(e) => { e.preventDefault(); handleWheelDragStart("left", e.clientX); }}
                      onMouseEnter={() => !draggingWheelSide && setHoveredWheel("backLeft")}
                      onMouseLeave={() => { setHoveredWheel(null); setHoveredWheelEdge(null); }}
                    >
                      <g transform={`translate(${mmToX(leftWheelMm) - wheelWidth/2}, ${backWheelY})`}>
                        <TractorWheel
                          width={wheelWidth}
                          height={wheelHeight}
                          isAnimating={isAnimating}
                          robotSpeed={robotSpeed}
                          isHovered={hoveredWheel === "backLeft"}
                          isDragging={draggingWheelSide === "left"}
                        />
                        {/* Edge hover zones for distance indicator */}
                        <rect
                          x={0}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "backLeft", edge: "left" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                        <rect
                          x={wheelWidth - edgeZoneWidth}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "backLeft", edge: "right" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                      </g>
                    </g>
                    <g
                      className="cursor-ew-resize"
                      onMouseDown={(e) => { e.preventDefault(); handleWheelDragStart("right", e.clientX); }}
                      onMouseEnter={() => !draggingWheelSide && setHoveredWheel("backRight")}
                      onMouseLeave={() => { setHoveredWheel(null); setHoveredWheelEdge(null); }}
                    >
                      <g transform={`translate(${mmToX(rightWheelMm) - wheelWidth/2}, ${backWheelY})`}>
                        <TractorWheel
                          width={wheelWidth}
                          height={wheelHeight}
                          isAnimating={isAnimating}
                          robotSpeed={robotSpeed}
                          isHovered={hoveredWheel === "backRight"}
                          isDragging={draggingWheelSide === "right"}
                        />
                        {/* Edge hover zones for distance indicator */}
                        <rect
                          x={0}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "backRight", edge: "left" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                        <rect
                          x={wheelWidth - edgeZoneWidth}
                          y={0}
                          width={edgeZoneWidth}
                          height={wheelHeight}
                          fill="transparent"
                          className="cursor-help"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredWheelEdge({ wheel: "backRight", edge: "right" }); }}
                          onMouseLeave={() => setHoveredWheelEdge(null)}
                        />
                      </g>
                    </g>
                  </>
                );
              })()}

              {/* Wheel spacing dimension - positioned below back wheels */}
              <g>
                {/* Dimension line below back wheels */}
                <line x1={mmToX(leftWheelMm)} y1={rowAreaBottom - 32} x2={mmToX(rightWheelMm)} y2={rowAreaBottom - 32} stroke="#78716c" strokeWidth="1.5" />
                {/* Left tick */}
                <line x1={mmToX(leftWheelMm)} y1={rowAreaBottom - 39} x2={mmToX(leftWheelMm)} y2={rowAreaBottom - 25} stroke="#78716c" strokeWidth="1.5" />
                {/* Right tick */}
                <line x1={mmToX(rightWheelMm)} y1={rowAreaBottom - 39} x2={mmToX(rightWheelMm)} y2={rowAreaBottom - 25} stroke="#78716c" strokeWidth="1.5" />
                {/* Label */}
                <text x={svgCenterX} y={rowAreaBottom - 15} textAnchor="middle" className="text-[12px] font-medium fill-stone-600">
                  {config.wheelSpacing / 10} cm
                </text>
              </g>

              {/* ========== BADGE INTERACTION LAYER - rendered on top of gap hover zones ========== */}
              {rowPositionsMm.map((rowMm, idx) => {
                const x = mmToX(rowMm);
                const badgeY = (rowAreaTop + rowAreaBottom) / 2 - 75;
                const isHovered = hoveredRow === idx;
                const isDragging = draggingRowIdx === idx;
                const canRemove = config.activeRows > (is3Wheel ? 2 : 1);
                const canDrag = config.activeRows > 1;

                return (
                  <rect
                    key={`badge-hover-${idx}`}
                    x={x - 18}
                    y={badgeY - 18}
                    width={36}
                    height={36}
                    rx={18}
                    fill="transparent"
                    style={{ pointerEvents: "all" }}
                    className={isHovered && canRemove && !isDragging ? "cursor-pointer" : (canDrag ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default")}
                    onMouseEnter={() => {
                      setHoveredRow(idx);
                      if (canRemove) setHoveredRemoveRow(idx);
                    }}
                    onMouseLeave={() => {
                      if (!isDragging) setHoveredRow(null);
                      setHoveredRemoveRow(null);
                    }}
                    onClick={canRemove && !isDragging ? (e) => { e.stopPropagation(); handleRemoveRow(idx); } : undefined}
                    onMouseDown={canDrag && !canRemove ? (e) => { e.preventDefault(); handleRowDragStart(idx, e.clientX); } : undefined}
                  />
                );
              })}

              {/* ========== EDGE ADD BUTTONS - rendered on top of hover zones, only on hover ========== */}
              {isVisualizationHovered && canAddMoreRows && config.activeRows > 0 && rowPositionsMm.length > 0 && (() => {
                // Match positioning and style with between-row buttons
                const seedingUnitY = (rowAreaTop + rowAreaBottom) / 2 - 35;
                const seedingUnitHeight = config.seedSize === "6mm" ? 90 : 100;
                const buttonY = seedingUnitY + seedingUnitHeight / 2;
                const buttonRadius = 14;

                return (
                  <>
                    <g
                      className="cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                      onClick={() => handleAddRowEdge("left")}
                      transform={`translate(${mmToX(rowPositionsMm[0]) - 40}, ${buttonY})`}
                    >
                      <circle r={buttonRadius} fill="white" stroke={colors.addBtn} strokeWidth="1.5" />
                      <text y="5" textAnchor="middle" style={{ fontSize: "16px" }} className="fill-emerald-600 font-medium select-none">+</text>
                    </g>
                    <g
                      className="cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                      onClick={() => handleAddRowEdge("right")}
                      transform={`translate(${mmToX(rowPositionsMm[rowPositionsMm.length - 1]) + 40}, ${buttonY})`}
                    >
                      <circle r={buttonRadius} fill="white" stroke={colors.addBtn} strokeWidth="1.5" />
                      <text y="5" textAnchor="middle" style={{ fontSize: "16px" }} className="fill-emerald-600 font-medium select-none">+</text>
                    </g>
                  </>
                );
              })()}

              {/* ========== TOOLTIP LAYER - renders on top of everything ========== */}


              {/* Back wheel tooltips */}
              {hoveredWheel === "backLeft" && !draggingWheelSide && (
                <g transform={`translate(${mmToX(leftWheelMm)}, ${rowAreaBottom - wheelHeight - 60})`}>
                  <rect x="-40" y="-42" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                  <text y="-28" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                  <text y="-16" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                  <line x1={-wheelWidth/2 + 2} y1="-8" x2={wheelWidth/2 - 2} y2="-8" stroke="white" strokeWidth="1" />
                  <line x1={-wheelWidth/2 + 2} y1="-11" x2={-wheelWidth/2 + 2} y2="-5" stroke="white" strokeWidth="1" />
                  <line x1={wheelWidth/2 - 2} y1="-11" x2={wheelWidth/2 - 2} y2="-5" stroke="white" strokeWidth="1" />
                </g>
              )}
              {hoveredWheel === "backRight" && !draggingWheelSide && (
                <g transform={`translate(${mmToX(rightWheelMm)}, ${rowAreaBottom - wheelHeight - 60})`}>
                  <rect x="-40" y="-42" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                  <text y="-28" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                  <text y="-16" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                  <line x1={-wheelWidth/2 + 2} y1="-8" x2={wheelWidth/2 - 2} y2="-8" stroke="white" strokeWidth="1" />
                  <line x1={-wheelWidth/2 + 2} y1="-11" x2={-wheelWidth/2 + 2} y2="-5" stroke="white" strokeWidth="1" />
                  <line x1={wheelWidth/2 - 2} y1="-11" x2={wheelWidth/2 - 2} y2="-5" stroke="white" strokeWidth="1" />
                </g>
              )}

              {/* Wheel edge to row distance indicator */}
              {hoveredWheelEdge && (() => {
                // Determine wheel center position in mm and Y position
                let wheelMm: number;
                let wheelY: number;

                if (hoveredWheelEdge.wheel === "front") {
                  if (frontWheelMm === null) return null;
                  wheelMm = frontWheelMm;
                  wheelY = 105;
                } else if (hoveredWheelEdge.wheel === "frontLeft") {
                  wheelMm = leftWheelMm;
                  wheelY = 105;
                } else if (hoveredWheelEdge.wheel === "frontRight") {
                  wheelMm = rightWheelMm;
                  wheelY = 105;
                } else if (hoveredWheelEdge.wheel === "backLeft") {
                  wheelMm = leftWheelMm;
                  wheelY = rowAreaBottom - wheelHeight - 60;
                } else {
                  wheelMm = rightWheelMm;
                  wheelY = rowAreaBottom - wheelHeight - 60;
                }

                // Calculate wheel edge position (mm for distance calc)
                const edgeMm = hoveredWheelEdge.edge === "left"
                  ? wheelMm - wheelWidthMm / 2
                  : wheelMm + wheelWidthMm / 2;

                // Find nearest row in the same direction as the edge
                const nearest = getDistanceToNearestRow(edgeMm, hoveredWheelEdge.edge);
                if (!nearest) return null;

                // Calculate x positions - use visual wheel edge (pixels) for rendering
                const wheelCenterX = mmToX(wheelMm);
                const visualEdgeX = hoveredWheelEdge.edge === "left"
                  ? wheelCenterX - wheelWidth / 2
                  : wheelCenterX + wheelWidth / 2;
                const rowX = mmToX(nearest.rowMm);
                const x1 = Math.min(visualEdgeX, rowX);
                const x2 = Math.max(visualEdgeX, rowX);
                const rectWidth = x2 - x1;

                // Distance in cm (based on actual mm calculation)
                const distanceCm = Math.round(nearest.distance / 10);

                // Y position matches the wheel position, height matches wheel height
                const indicatorY = wheelY;
                const indicatorHeight = wheelHeight;

                const currentEdge = hoveredWheelEdge;

                // Label always below the box with background pill
                const labelX = (x1 + x2) / 2;
                const labelY = indicatorY + indicatorHeight + 14;

                return (
                  <g
                    onMouseEnter={() => setHoveredWheelEdge(currentEdge)}
                    onMouseLeave={() => setHoveredWheelEdge(null)}
                    className="cursor-help"
                  >
                    {/* Highlighted zone from wheel edge to row */}
                    <rect
                      x={x1}
                      y={indicatorY}
                      width={rectWidth}
                      height={indicatorHeight}
                      fill="rgba(244, 114, 114, 0.4)"
                      stroke="rgba(244, 114, 114, 0.8)"
                      strokeWidth="1"
                    />
                    {/* Distance label with background pill */}
                    <rect
                      x={labelX - 20}
                      y={labelY - 10}
                      width={40}
                      height={14}
                      rx={3}
                      fill="rgba(244, 114, 114, 0.9)"
                      style={{ pointerEvents: "none" }}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      className="text-[10px] font-medium fill-white"
                      style={{ pointerEvents: "none" }}
                    >
                      {distanceCm} cm
                    </text>
                  </g>
                );
              })()}

            </svg>
          </motion.div>
          )}

          {/* Info box - positioned inside bottom right corner */}
          {(() => {
            const speed = calculateRobotSpeed(seedingMode, plantSpacing);
            const workingWidthM = workingWidth / 1000;
            const maxCapacity = (speed * workingWidthM * 24) / 10000;
            return (
              <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-stone-600 shadow-sm border border-stone-100">
                {speed} m/h · up to {maxCapacity.toFixed(2)} ha/day
              </div>
            );
          })()}
        </div>

        {/* Plants per hectare - centered below animation/graph */}
        <div className="flex justify-center mt-3 text-sm text-stone-500 h-6">
          {seedingMode !== "line" ? (() => {
            // Calculate based on working width and active rows
            const workingWidthM = workingWidth / 1000;
            const plantSpacingM = plantSpacing / 100;
            const pointsPerHa = Math.round((10000 * config.activeRows) / (workingWidthM * plantSpacingM));
            const seedsPerHa = seedingMode === "group" ? pointsPerHa * seedsPerGroup : pointsPerHa;
            return (
              <>
                {selectedCrop.emoji} <span className="font-medium text-stone-700 mx-1">{seedsPerHa.toLocaleString()}</span> {t("seedsPerHectare")}
              </>
            );
          })() : (
            <span className="text-stone-400">{t("lineSeeding")}</span>
          )}
        </div>

          {/* Seeding Controls - Clean aligned layout */}
          <div className="mt-4 space-y-2 max-w-sm mx-auto">
            {/* 1. Seeding Mode */}
            <div className="flex items-center">
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">{t("mode")}</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="font-medium">{t("single")}:</span> {t("singleDesc")}<br/>
                    <span className="font-medium">{t("group")}:</span> {t("groupDesc")}<br/>
                    <span className="font-medium">{t("line")}:</span> {t("lineDesc")}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center bg-stone-100 rounded-lg p-0.5 w-[168px]">
                  <button
                    onClick={() => {
                      setSeedingMode("single");
                      setSeedsPerGroup(1);
                    }}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      seedingMode === "single"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    {t("single")}
                  </button>
                  <button
                    onClick={() => {
                      setSeedingMode("group");
                      setSeedsPerGroup(3);
                    }}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      seedingMode === "group"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    {t("group")}
                  </button>
                  <button
                    onClick={() => setSeedingMode("line")}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      seedingMode === "line"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    {t("line")}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Seeds per Group */}
            <div className={`flex items-center ${seedingMode !== "group" ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">{t("seedsPerGroup")}</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {t("seedsPerGroupTooltip")}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center justify-between w-[168px] bg-stone-100 rounded-lg px-1 py-0.5">
                  <button
                    onClick={() => setSeedsPerGroup(Math.max(2, seedsPerGroup - 1))}
                    disabled={seedsPerGroup <= 2 || seedingMode !== "group"}
                    className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold text-stone-900">{seedsPerGroup}</span>
                  <button
                    onClick={() => setSeedsPerGroup(Math.min(15, seedsPerGroup + 1))}
                    disabled={seedsPerGroup >= 15 || seedingMode !== "group"}
                    className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Plant Spacing */}
            <div className={`flex items-center ${seedingMode === "line" ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">{t("plantSpacing")}</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {t("spacingTooltip")}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
                {/* Precision seeding warning icon */}
                {plantSpacing < 10 && seedingMode !== "line" && (
                  <div className="relative group/warn">
                    <AlertCircle className="h-4 w-4 text-red-500 cursor-help animate-pulse" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover/warn:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                      {t("precisionWarning")}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 flex justify-end items-center gap-1.5">
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-1.5 w-36 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Hold Shift for 0.1cm
                    <div className="absolute top-full left-2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
                <div className={`flex items-center justify-between w-[168px] rounded-lg px-1 py-0.5 ${
                  plantSpacing < 10 && seedingMode !== "line" ? "bg-red-50 ring-1 ring-red-200" : "bg-stone-100"
                }`}>
                  <button
                    onClick={(e) => {
                      const step = e.shiftKey ? 0.1 : 1; // Normal = 1cm, Shift = 0.1cm
                      setPlantSpacing(Math.max(3, Math.round((plantSpacing - step) * 10) / 10));
                    }}
                    disabled={plantSpacing <= 3 || seedingMode === "line"}
                    className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  {editingPlantSpacing ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleFinishEditPlantSpacing}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishEditPlantSpacing();
                        if (e.key === "Escape") {
                          setEditingPlantSpacing(false);
                          setEditingValue("");
                        }
                      }}
                      autoFocus
                      className="w-14 h-9 text-center text-sm font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  ) : (
                    <span
                      onClick={handleStartEditPlantSpacing}
                      className={`text-sm font-semibold cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-emerald-100 ${
                        plantSpacing < 10 && seedingMode !== "line" ? "text-red-600" : "text-stone-900"
                      }`}
                    >
                      {plantSpacing}cm
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      const step = e.shiftKey ? 0.1 : 1; // Normal = 1cm, Shift = 0.1cm
                      setPlantSpacing(Math.min(40, Math.round((plantSpacing + step) * 10) / 10));
                    }}
                    disabled={plantSpacing >= 40 || seedingMode === "line"}
                    className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Seeding Pattern */}
            <div className={`flex items-center ${seedingMode === "line" ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">{t("pattern")}</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {t("patternTooltip")}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center bg-stone-100 rounded-lg p-0.5 w-[168px]">
                  <button
                    onClick={() => setIsDiamondPattern(false)}
                    disabled={seedingMode === "line"}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      !isDiamondPattern
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    <Grid3X3 className="h-3 w-3" />
                    {t("grid")}
                  </button>
                  <button
                    onClick={() => setIsDiamondPattern(true)}
                    disabled={seedingMode === "line"}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isDiamondPattern
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    <Diamond className="h-3 w-3" />
                    {t("diamond")}
                  </button>
                </div>
              </div>
            </div>
          </div>

      </div>

      {/* Right: Configuration - Takes 2 columns (narrower) */}
      <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:pl-2">
        {/* Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">{t("subtitle")}</p>
        </div>

        {/* Seeding System */}
        <div className="flex gap-2">
          {(["6mm", "14mm"] as SeedSize[]).map((size) => {
            const isSelected = config.seedSize === size;
            return (
              <button
                key={size}
                onClick={() => {
                  const newMinDistance = ROW_CONSTRAINTS.minRowDistance[size];
                  const newRowDistance = Math.max(config.rowDistance, newMinDistance);
                  const newSpacings = rowSpacings.map(s => Math.max(s, newMinDistance));
                  updateConfig({
                    seedSize: size,
                    rowDistance: newRowDistance,
                    rowSpacings: newSpacings
                  });
                }}
                className={`selection-card flex-1 text-left p-3 rounded-xl border transition-all card-hover ${
                  isSelected
                    ? "selected"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center checkmark-animated">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-stone-900">+Seed {size}</span>
                </div>
                {showPrices && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {formatPrice(PRICES.activeRow[size], config.currency)}/row
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Seed size tip with learn more link */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <span className="font-medium">{t("seedSizeTip.label")}</span>{" "}
            {t("seedSizeTip.text")}{" "}
            <button
              onClick={() => setShowSeedInfoModal(true)}
              className="text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              {t("seedSizeTip.learnMore")}
            </button>
          </p>
        </div>

        {/* Seed Info Modal */}
        <SeedInfoModal
          isOpen={showSeedInfoModal}
          onClose={() => setShowSeedInfoModal(false)}
          selectedSize={config.seedSize}
          onSelectSize={(size) => {
            const newMinDistance = ROW_CONSTRAINTS.minRowDistance[size];
            const newRowDistance = Math.max(config.rowDistance, newMinDistance);
            const newSpacings = rowSpacings.map(s => Math.max(s, newMinDistance));
            updateConfig({
              seedSize: size,
              rowDistance: newRowDistance,
              rowSpacings: newSpacings
            });
          }}
        />

        {/* Cost display */}
        {config.activeRows > 0 && (
          <div className="py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-700">{config.activeRows} active rows</span>
              {showPrices && (
                <span className="text-sm font-semibold text-emerald-700">
                  {formatPrice(config.activeRows * rowPrice, config.currency)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-xs text-emerald-600">{totalPassiveRows} passive rows</span>
              <span className="text-xs text-emerald-500">{totalPassiveRows > 0 ? "included" : "–"}</span>
            </div>
          </div>
        )}

        {/* Adjustments */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          {/* Active Rows */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-stone-600 font-medium">{t("rows")}</span>
              {is3Wheel && (
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    3-wheel: rows adjust in pairs
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between w-[116px] rounded-lg px-1 py-0.5 bg-stone-100">
              <button
                onClick={() => {
                  const decrement = is3Wheel && config.activeRows % 2 !== 0 ? 1 : (is3Wheel ? 2 : 1);
                  handleSetRowCount(config.activeRows - decrement);
                }}
                disabled={config.activeRows <= 0}
                className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-semibold text-stone-900">{config.activeRows}</span>
              <button
                onClick={() => {
                  if (config.activeRows === 0) {
                    handleSetRowCount(is3Wheel ? 2 : 1);
                  } else {
                    const increment = is3Wheel && config.activeRows % 2 !== 0 ? 1 : (is3Wheel ? 2 : 1);
                    handleSetRowCount(config.activeRows + increment);
                  }
                }}
                disabled={!canAddMoreRows}
                className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Row Spacing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-stone-600 font-medium">{t("spacing")}</span>
              {/* Front wheel proximity warning (3-wheel only) */}
              {hasFrontWheelProximityWarning && (
                <div className="relative group/warn">
                  <AlertCircle className="h-4 w-4 text-red-500 cursor-help animate-pulse" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover/warn:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                    Front wheel within 5cm of row
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
                  </div>
                </div>
              )}
              {!hasFrontWheelProximityWarning && (
                <span className={`text-[10px] text-amber-500 flex items-center gap-0.5 transition-opacity ${hasCustomSpacings ? "opacity-100" : "opacity-0"}`}>
                  <AlertCircle className="h-2.5 w-2.5" />
                  resets custom
                </span>
              )}
            </div>
            <div className={`flex items-center justify-between w-[116px] rounded-lg px-1 py-0.5 ${
              hasFrontWheelProximityWarning ? "bg-red-50 ring-1 ring-red-200" : "bg-stone-100"
            }`}>
              <button
                onClick={(e) => {
                  const step = e.shiftKey ? 1 : 10; // Normal = 1cm, Shift = 0.1cm
                  // If value is not a whole cm (not multiple of 10), round down first
                  const hasDecimal = config.rowDistance % 10 !== 0;
                  const decreased = hasDecimal && !e.shiftKey
                    ? Math.floor(config.rowDistance / 10) * 10
                    : config.rowDistance - step;
                  const newDistance = decreased < minRowDistance ? minRowDistance : decreased;
                  updateConfig({
                    rowDistance: newDistance,
                    rowSpacings: generateRowSpacings(config.activeRows, newDistance)
                  });
                }}
                disabled={config.rowDistance <= minRowDistance}
                className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
              >
                <Minus className="h-3 w-3" />
              </button>
              {editingRowDistance ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={handleFinishEditRowDistance}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFinishEditRowDistance();
                    if (e.key === "Escape") {
                      setEditingRowDistance(false);
                      setEditingValue("");
                    }
                  }}
                  autoFocus
                  className="w-12 h-7 text-center text-sm font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              ) : (
                <span
                  onClick={handleStartEditRowDistance}
                  className={`text-sm font-semibold cursor-pointer px-1 py-0.5 rounded transition-colors hover:bg-emerald-100 ${hasFrontWheelProximityWarning ? "text-red-600" : "text-stone-900"}`}
                >
                  {config.rowDistance / 10}cm
                </span>
              )}
              <button
                onClick={(e) => {
                  const step = e.shiftKey ? 1 : 10; // Normal = 1cm, Shift = 0.1cm
                  const maxDistance = Math.min(800, maxRowDistanceForCurrentRows);
                  // If value is not a whole cm (not multiple of 10), round up first
                  const hasDecimal = config.rowDistance % 10 !== 0;
                  const increased = hasDecimal && !e.shiftKey
                    ? Math.ceil(config.rowDistance / 10) * 10
                    : config.rowDistance + step;
                  const newDistance = Math.min(maxDistance, increased);
                  updateConfig({
                    rowDistance: newDistance,
                    rowSpacings: generateRowSpacings(config.activeRows, newDistance)
                  });
                }}
                disabled={!canIncreaseRowDistance}
                className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Wheel Spacing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-stone-600 font-medium">{t("wheelSpacing")}</span>
              {/* Wheel proximity warning icon */}
              {hasBackWheelProximityWarning && (
                <div className="relative group/warn">
                  <AlertCircle className="h-4 w-4 text-red-500 cursor-help animate-pulse" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover/warn:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                    Back wheels within 5cm of row
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
                  </div>
                </div>
              )}
            </div>
            <div className={`flex items-center justify-between w-[116px] rounded-lg px-1 py-0.5 ${
              hasBackWheelProximityWarning ? "bg-red-50 ring-1 ring-red-200" : "bg-stone-100"
            }`}>
              <button
                onClick={() => updateConfig({ wheelSpacing: Math.max(WHEEL_CONSTRAINTS.minWheelSpacing, config.wheelSpacing - 100) })}
                disabled={config.wheelSpacing <= WHEEL_CONSTRAINTS.minWheelSpacing}
                className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className={`text-sm font-semibold ${hasBackWheelProximityWarning ? "text-red-600" : "text-stone-900"}`}>{config.wheelSpacing / 10}cm</span>
              <button
                onClick={() => updateConfig({ wheelSpacing: Math.min(WHEEL_CONSTRAINTS.maxWheelSpacing, config.wheelSpacing + 100) })}
                disabled={config.wheelSpacing >= WHEEL_CONSTRAINTS.maxWheelSpacing}
                className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Optimal Wheel Spacing Suggestion */}
          {(() => {
            const optimal = calculateOptimalWheelSpacing(
              config.activeRows,
              config.rowDistance,
              rowSpacings,
              config.frontWheel
            );
            const isOptimal = config.wheelSpacing === optimal.spacing;

            if (isOptimal) {
              return (
                <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-emerald-700">{t("optimalWheelSpacing")}</span>
                </div>
              );
            }

            return (
              <button
                onClick={() => updateConfig({ wheelSpacing: optimal.spacing })}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors w-full text-left"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-700">
                  {t("suggestedSpacing", { spacing: optimal.spacing / 10 })}
                </span>
              </button>
            );
          })()}

          {/* Working Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 font-medium">{t("workingWidth")}</span>
              <div className="flex items-center justify-between w-[116px] rounded-lg px-1 py-0.5 bg-stone-100">
                <button
                  onClick={(e) => {
                    const step = e.shiftKey ? 1 : 10; // Normal = 1cm, Shift = 0.1cm
                    const decreased = workingWidth - step;
                    // Minimum working width = rowSpan + minRowDistance to prevent pass overlap
                    const minWidth = rowSpan + minRowDistance;
                    const newWidth = decreased < minWidth ? minWidth : decreased;
                    setFollowWheelSpacing(false); // Manual adjustment exits Beds mode
                    setWorkingWidthOverride(newWidth === calculatedWorkingWidth ? null : newWidth);
                  }}
                  disabled={workingWidth <= rowSpan + minRowDistance}
                  className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  <Minus className="h-3 w-3" />
                </button>
                {editingWorkingWidth ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={handleFinishEditWorkingWidth}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFinishEditWorkingWidth();
                      if (e.key === "Escape") {
                        setEditingWorkingWidth(false);
                        setEditingValue("");
                      }
                    }}
                    autoFocus
                    className="w-12 h-7 text-center text-sm font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                ) : (
                  <span
                    onClick={handleStartEditWorkingWidth}
                    className="text-sm font-semibold cursor-pointer px-1 py-0.5 rounded transition-colors hover:bg-emerald-100 text-stone-900"
                  >
                    {(workingWidth / 10).toFixed(0)}cm
                  </span>
                )}
                <button
                  onClick={(e) => {
                    const step = e.shiftKey ? 1 : 10; // Normal = 1cm, Shift = 0.1cm
                    const newWidth = Math.min(5000, workingWidth + step); // Max 500cm
                    setFollowWheelSpacing(false); // Manual adjustment exits Beds mode
                    setWorkingWidthOverride(newWidth === calculatedWorkingWidth ? null : newWidth);
                  }}
                  disabled={workingWidth >= 5000}
                  className="h-8 w-8 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white text-stone-500 transition-all flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Mode toggle - only shown when wheels are outside rows */}
            {rowSpan <= config.wheelSpacing && config.wheelSpacing !== calculatedWorkingWidth && (
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-stone-400">Optimize for</span>
                <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                  <div className="relative group/beds">
                    <button
                      onClick={() => {
                        setFollowWheelSpacing(true);
                        setWorkingWidthOverride(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        followWheelSpacing
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      Beds
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover/beds:opacity-100 transition-opacity pointer-events-none z-10">
                      Follow wheel spacing ({config.wheelSpacing / 10}cm). Wheel tracks align on each pass.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                    </div>
                  </div>
                  <div className="relative group/pattern">
                    <button
                      onClick={() => {
                        setFollowWheelSpacing(false);
                        setWorkingWidthOverride(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        !followWheelSpacing && workingWidthOverride === null
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      Pattern
                    </button>
                    <div className="absolute bottom-full right-0 mb-1.5 w-44 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover/pattern:opacity-100 transition-opacity pointer-events-none z-10">
                      Maintain uniform {config.rowDistance / 10}cm spacing ({calculatedWorkingWidth / 10}cm) across the entire field.
                      <div className="absolute top-full right-4 border-4 border-transparent border-t-stone-900" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation error - shows when row config exceeds toolbeam */}
          {!validation.valid && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2 px-3 rounded flex items-center gap-2 text-xs text-red-600 bg-red-50">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {validation.error}
            </motion.div>
          )}

        </div>

        {/* Crop Selection */}
        <div className="pt-3 border-t border-stone-100">
          <p className="text-xs font-medium text-stone-500 mb-2">{t("cropType")}</p>
          <div className="flex flex-wrap gap-1.5">
            {cropTypes.map((crop) => {
              const isCompatible = config.seedSize === "6mm" ? crop.supports6mm : crop.supports14mm;
              const tooltipText = isCompatible ? tCrops(crop.nameKey) : t("cropNotCompatible", { crop: tCrops(crop.nameKey), seedSize: config.seedSize });
              return (
                <div key={crop.id} className="relative group">
                  <button
                    onClick={() => isCompatible && setSelectedCrop(crop)}
                    disabled={!isCompatible}
                    className={`w-9 h-9 rounded-lg text-lg transition-all flex items-center justify-center ${
                      !isCompatible
                        ? "bg-stone-50 border-2 border-transparent opacity-40 cursor-not-allowed grayscale"
                        : selectedCrop.id === crop.id
                          ? "bg-emerald-50 border-2 border-emerald-300 scale-105"
                          : "bg-stone-100 hover:bg-stone-200 border-2 border-transparent"
                    }`}
                  >
                    {crop.emoji}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-stone-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {tooltipText}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected crop info & apply button */}
          <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">{selectedCrop.emoji} {tCrops(selectedCrop.nameKey)}</span>
            </div>
            <div className="text-xs text-stone-500 space-y-0.5 mb-2.5">
              <div className="flex justify-between">
                <span>{t("rows")}</span>
                <span className="text-stone-700">{selectedCrop.rows}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("rowSpacing")}</span>
                <span className="text-stone-700">{selectedCrop.rowDistance / 10}cm</span>
              </div>
              <div className="flex justify-between">
                <span>{t("plantSpacing")}</span>
                <span className="text-stone-700">{selectedCrop.plantSpacing}cm</span>
              </div>
              <div className="flex justify-between">
                <span>{t("seedSizeLabel")}</span>
                <span className="text-stone-700">{selectedCrop.seedSize}</span>
              </div>
            </div>
            <button
              onClick={() => applyCropConfig(selectedCrop)}
              className="w-full py-1.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
            >
              {t("applyCropConfig", { crop: tCrops(selectedCrop.nameKey) })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
