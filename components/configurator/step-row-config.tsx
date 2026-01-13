"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, Plus, Minus, Play, Pause, Grid3X3, Diamond, Info, Box, Layers } from "lucide-react";
import { SeedingModelViewer } from "./seeding-model-viewer";

// Crop icon component for animated plants - seedling design
function CropIcon({ seedSize }: { seedSize: "6mm" | "14mm" }) {
  const scale = seedSize === "6mm" ? 0.9 : 1.1;

  return (
    <g transform={`scale(${scale}) translate(-12, -20)`}>
      {/* Left leaf */}
      <path d="M12 10a6 6 0 0 0 -6 -6h-3v2a6 6 0 0 0 6 6h3" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right leaf */}
      <path d="M12 14a6 6 0 0 1 6 -6h3v1a6 6 0 0 1 -6 6h-3" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stem */}
      <path d="M12 20l0 -10" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// Seeding unit component - white hopper box with FARMDROID branding
function SeedingUnit({ seedSize }: { seedSize: "6mm" | "14mm" }) {
  const width = seedSize === "6mm" ? 24 : 28;
  const height = seedSize === "6mm" ? 70 : 80;

  return (
    <g>
      {/* Main white hopper body with black outline */}
      <rect
        x={-width / 2}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill="#ffffff"
        stroke="#1c1917"
        strokeWidth={1.5}
      />
      {/* Subtle shadow curve on right side */}
      <path
        d={`M${width / 2 - 4} 8 Q${width / 2 - 2} ${height / 2} ${width / 2 - 4} ${height - 8}`}
        fill="none"
        stroke="#e5e5e5"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* FARMDROID text - vertical */}
      <text
        x={0}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90, 0, ${height / 2})`}
        className="text-[8px] font-bold fill-[#1c1917] tracking-tight"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        FARMDR
        <tspan fill="#22c55e">O</tspan>
        ID
      </text>
    </g>
  );
}
import {
  ConfiguratorState,
  PriceBreakdown,
  SeedSize,
  formatPrice,
  PRICES,
  ROW_CONSTRAINTS,
  WHEEL_CONSTRAINTS,
  CROP_PRESETS,
  validateRowConfig,
  generateRowSpacings,
  getWheelConfig,
} from "@/lib/configurator-data";

interface StepRowConfigProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
}

export function StepRowConfig({ config, updateConfig }: StepRowConfigProps) {
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
  // Working width = rowSpan + one rowDistance (accounts for half row distance on each side)
  // Working width can never be less than wheel distance
  const calculatedWorkingWidth = rowSpan + config.rowDistance;
  const workingWidth = Math.max(calculatedWorkingWidth, config.wheelSpacing);

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
  const [hoveredWheel, setHoveredWheel] = useState<"front" | "frontLeft" | "frontRight" | "backLeft" | "backRight" | null>(null);
  const [hoveredEdgeAdd, setHoveredEdgeAdd] = useState<"left" | "right" | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const dragStartX = useRef<number>(0);
  const dragStartSpacings = useRef<number[]>([]);
  const dragStartValue = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animation state - now using CSS animations for smooth performance
  const [isAnimating, setIsAnimating] = useState(true);
  const [isDiamondPattern, setIsDiamondPattern] = useState(false);
  const [plantSpacing, setPlantSpacing] = useState(18); // cm between plants in row
  const [seedingMode, setSeedingMode] = useState<"single" | "group" | "line">("single");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  // SVG layout - field encompasses entire robot
  const svgWidth = 900;
  const svgHeight = 580;
  const margin = { left: 30, right: 30 };
  const rowAreaTop = 25; // Start near top
  const rowAreaBottom = svgHeight - 40; // End near bottom

  // Fixed scale
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

  const isRowTooCloseToWheel = (rowMm: number): boolean => {
    // Back wheel edges (both sides)
    const leftWheelLeftEdge = leftWheelMm - wheelWidthMm / 2;
    const leftWheelRightEdge = leftWheelMm + wheelWidthMm / 2;
    const rightWheelLeftEdge = rightWheelMm - wheelWidthMm / 2;
    const rightWheelRightEdge = rightWheelMm + wheelWidthMm / 2;

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

    // Check front wheel in 3-wheel config
    if (frontWheelMm !== null) {
      const frontWheelLeftEdge = frontWheelMm - wheelWidthMm / 2;
      const frontWheelRightEdge = frontWheelMm + wheelWidthMm / 2;
      if (rowMm >= frontWheelLeftEdge - wheelProximityWarningMm &&
          rowMm <= frontWheelRightEdge + wheelProximityWarningMm) {
        return true;
      }
    }

    return false;
  };

  // Check if any row has wheel proximity warning
  const hasWheelProximityWarning = rowPositionsMm.some(isRowTooCloseToWheel);

  // Check if user has custom (non-uniform) spacings
  const hasCustomSpacings = rowSpacings.length > 0 && !rowSpacings.every(s => s === rowSpacings[0]);

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
    const isFirstRow = draggingRowIdx === 0;
    const isLastRow = draggingRowIdx === config.activeRows - 1;

    if (isFirstRow) {
      // First row: only has spacing to its right
      // Dragging left pushes nothing (row at edge), dragging right closes gap to row 2
      const origSpacing = dragStartSpacings.current[0];
      const newSpacing = Math.round((origSpacing - deltaMm) / 10) * 10;
      newSpacings[0] = Math.max(minRowDistance, newSpacing);
    } else if (isLastRow) {
      // Last row: only has spacing to its left
      // Dragging right pushes nothing (row at edge), dragging left closes gap to previous row
      const lastSpacingIdx = config.activeRows - 2;
      const origSpacing = dragStartSpacings.current[lastSpacingIdx];
      const newSpacing = Math.round((origSpacing + deltaMm) / 10) * 10;
      newSpacings[lastSpacingIdx] = Math.max(minRowDistance, newSpacing);
    } else {
      // Middle rows: outer rows move WITH the dragged row, inner gap changes
      // Left side: change spacing to the RIGHT (toward center), outer left rows move together
      // Right side: change spacing to the LEFT (toward center), outer right rows move together
      const centerIndex = (config.activeRows - 1) / 2;
      const isOnLeftSide = draggingRowIdx <= Math.floor(centerIndex);

      if (isOnLeftSide) {
        // Left side row: adjust the spacing to its RIGHT (between this row and inner rows)
        // Outer rows (to the left) move together with this row
        const spacingIdx = draggingRowIdx; // spacing between this row and the next (inner) row
        const origSpacing = dragStartSpacings.current[spacingIdx];
        // Drag RIGHT → decrease spacing (move toward center)
        // Drag LEFT → increase spacing (move away from center)
        const newSpacing = Math.round((origSpacing - deltaMm) / 10) * 10;
        newSpacings[spacingIdx] = Math.max(minRowDistance, newSpacing);
      } else {
        // Right side row: adjust the spacing to its LEFT (between inner rows and this row)
        // Outer rows (to the right) move together with this row
        const spacingIdx = draggingRowIdx - 1; // spacing between previous (inner) row and this row
        const origSpacing = dragStartSpacings.current[spacingIdx];
        // Drag RIGHT → increase spacing (move away from center)
        // Drag LEFT → decrease spacing (move toward center)
        const newSpacing = Math.round((origSpacing + deltaMm) / 10) * 10;
        newSpacings[spacingIdx] = Math.max(minRowDistance, newSpacing);
      }
    }

    updateConfig({ rowSpacings: newSpacings });
  }, [config.activeRows, draggingRowIdx, minRowDistance, updateConfig]);

  // Max working width is 360cm (3600mm)
  const maxWorkingWidth = 3600;
  // Check if adding more rows would exceed max working width
  // New working width after adding = current rowSpan + new spacing + rowDistance
  const canAddMoreRows = (rowSpan + config.rowDistance + config.rowDistance) <= maxWorkingWidth && config.activeRows < ROW_CONSTRAINTS.maxActiveRows;

  const handleAddRowAt = useCallback((gapIndex: number) => {
    if (config.activeRows >= ROW_CONSTRAINTS.maxActiveRows) return;
    // Check if new working width would exceed max (adding a row adds at least minRowDistance to span)
    if (rowSpan + minRowDistance + config.rowDistance > maxWorkingWidth) return;

    const newSpacings = [...rowSpacings];
    const existingGap = newSpacings[gapIndex];
    const halfGap = Math.max(minRowDistance, Math.round(existingGap / 2 / 10) * 10);
    newSpacings.splice(gapIndex, 1, halfGap, halfGap);

    let newCount = config.activeRows + 1;

    if (is3Wheel) {
      // In 3-wheel mode, always add 2 rows to maintain even count
      // Calculate mirror index in the NEW spacings array (after first splice)
      const mirrorIdx = newSpacings.length - gapIndex - 2;

      if (mirrorIdx >= 0 && mirrorIdx !== gapIndex && mirrorIdx !== gapIndex + 1 && mirrorIdx < newSpacings.length) {
        const mirrorGap = newSpacings[mirrorIdx];
        const halfMirror = Math.max(minRowDistance, Math.round(mirrorGap / 2 / 10) * 10);
        newSpacings.splice(mirrorIdx, 1, halfMirror, halfMirror);
        newCount++;
      } else {
        // Middle gap case: add row on the other side of the existing new row
        // This ensures we always add 2 rows
        if (gapIndex + 2 < newSpacings.length) {
          const nextGap = newSpacings[gapIndex + 2];
          const halfNext = Math.max(minRowDistance, Math.round(nextGap / 2 / 10) * 10);
          newSpacings.splice(gapIndex + 2, 1, halfNext, halfNext);
          newCount++;
        } else if (gapIndex > 0) {
          const prevGap = newSpacings[gapIndex - 1];
          const halfPrev = Math.max(minRowDistance, Math.round(prevGap / 2 / 10) * 10);
          newSpacings.splice(gapIndex - 1, 1, halfPrev, halfPrev);
          newCount++;
        }
      }

      // Safety check: ensure even count in 3-wheel mode
      if (newCount % 2 !== 0) {
        return; // Don't proceed if we'd end up with odd rows
      }
    }

    setHoveredGap(null); // Clear hover state before update
    updateConfig({
      activeRows: Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows),
      rowSpacings: newSpacings.slice(0, Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows) - 1),
    });
  }, [config.activeRows, is3Wheel, minRowDistance, rowSpan, rowSpacings, updateConfig]);

  const handleAddRowEdge = useCallback((side: "left" | "right") => {
    if (config.activeRows >= ROW_CONSTRAINTS.maxActiveRows) return;

    // Check if adding would exceed max span (add 1 or 2 row distances depending on mode)
    const addedSpan = is3Wheel ? config.rowDistance * 2 : config.rowDistance;
    if (rowSpan + addedSpan + config.rowDistance > maxWorkingWidth) return;

    const newSpacings = [...rowSpacings];
    if (side === "left") {
      newSpacings.unshift(config.rowDistance);
    } else {
      newSpacings.push(config.rowDistance);
    }

    let newCount = config.activeRows + 1;

    if (is3Wheel) {
      if (side === "left") {
        newSpacings.push(config.rowDistance);
      } else {
        newSpacings.unshift(config.rowDistance);
      }
      newCount++;
    }

    updateConfig({
      activeRows: Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows),
      rowSpacings: newSpacings.slice(0, Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows) - 1),
    });
  }, [config.activeRows, config.rowDistance, is3Wheel, rowSpan, rowSpacings, updateConfig]);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    if (config.activeRows <= 0) return;
    // 3-wheel mode: can only go down to 0 (remove 2 at a time)
    // 4-wheel mode: can go down to 0 (remove 1 at a time)

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

    if (is3Wheel) {
      // 3-wheel: remove 2 rows at a time (need at least 2 to remove)
      if (config.activeRows < 2) return;

      // Calculate the mirror index (symmetric from other end)
      const mirrorIdx = config.activeRows - 1 - rowIndex;

      // Remove both rows - remove higher index first to preserve lower index
      let newSpacings = [...rowSpacings];
      const highIdx = Math.max(rowIndex, mirrorIdx);
      const lowIdx = Math.min(rowIndex, mirrorIdx);

      if (highIdx === lowIdx) {
        // Same row (shouldn't happen with even counts, but safety check)
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
    } else {
      // 4-wheel mode: remove single row
      const newSpacings = removeRowFromSpacings(rowSpacings, rowIndex, config.activeRows);
      const newCount = config.activeRows - 1;

      updateConfig({
        activeRows: Math.max(0, newCount),
        rowSpacings: newSpacings,
      });
    }
  }, [config.activeRows, is3Wheel, rowSpacings, updateConfig]);

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
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingWheelSide) {
      handleWheelDragMove(e.clientX);
    } else if (draggingRowIdx !== null) {
      handleRowDragMove(e.clientX);
    }
  }, [draggingWheelSide, draggingRowIdx, handleWheelDragMove, handleRowDragMove]);

  const applyPreset = (preset: typeof CROP_PRESETS[0]) => {
    updateConfig({
      seedSize: preset.seedSize,
      activeRows: preset.activeRows,
      rowDistance: preset.rowDistance,
      rowSpacings: generateRowSpacings(preset.activeRows, preset.rowDistance),
    });
  };

  // Handler to set individual spacing value directly
  const handleSetSpacing = useCallback((spacingIdx: number, valueCm: number) => {
    const valueMm = valueCm * 10;
    const newSpacings = [...rowSpacings];
    newSpacings[spacingIdx] = Math.max(minRowDistance, Math.min(800, valueMm));
    updateConfig({ rowSpacings: newSpacings });
  }, [minRowDistance, rowSpacings, updateConfig]);

  // Start editing a spacing value
  const handleStartEditSpacing = useCallback((idx: number) => {
    setEditingSpacing(idx);
    setEditingValue(String(rowSpacings[idx] / 10));
  }, [rowSpacings]);

  // Finish editing and apply the value
  const handleFinishEditSpacing = useCallback(() => {
    if (editingSpacing !== null) {
      const parsed = parseFloat(editingValue);
      if (!isNaN(parsed) && parsed > 0) {
        handleSetSpacing(editingSpacing, parsed);
      }
    }
    setEditingSpacing(null);
    setEditingValue("");
  }, [editingSpacing, editingValue, handleSetSpacing]);

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
  const wheelHeight = 42;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 md:gap-6 py-4 md:py-6 pb-24">
      {/* Left: Visualization - Takes 4 columns */}
      <div className="lg:col-span-4 flex flex-col">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-end gap-2 mb-2 md:mb-3">
          <span className="text-xs text-stone-500 mr-1">View</span>
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
              <Box className="h-3.5 w-3.5" />
              3D
            </button>
          </div>
        </div>

        {/* 3D Model Viewer */}
        {viewMode === "3d" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SeedingModelViewer isPlaying={isAnimating} />
          </motion.div>
        )}

        {/* 2D SVG Animation */}
        {viewMode === "2d" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* SVG Canvas */}
          <div
            className="py-2"
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto"
            >
              {/* Background */}
              <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="white" />

              {/* Row area - subtle tinted background */}
              <rect
                x={margin.left}
                y={rowAreaTop}
                width={svgWidth - margin.left - margin.right}
                height={rowAreaBottom - rowAreaTop}
                fill="#f5f5f4"
                rx="6"
              />
              {/* Inner border effect */}
              <rect
                x={margin.left + 1}
                y={rowAreaTop + 1}
                width={svgWidth - margin.left - margin.right - 2}
                height={rowAreaBottom - rowAreaTop - 2}
                fill="none"
                stroke="white"
                strokeWidth="1"
                rx="5"
                opacity="0.8"
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
              <g clipPath="url(#rowAreaClip)" style={{ pointerEvents: "none" }}>
                <g
                  style={{
                    animation: isAnimating ? "soilScroll 0.8s linear infinite" : "none",
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
                  `}
                </style>
              </g>

              {/* Animated crops and row lines (moving down) - using CSS animation */}
              {config.activeRows > 0 && (
                <g clipPath="url(#rowAreaClip)">
                  {/* CSS Keyframes for crop animation - dynamic based on plant spacing */}
                  <style>
                    {`
                      @keyframes cropScroll {
                        from { transform: translateY(0); }
                        to { transform: translateY(${plantSpacing * 3.5}px); }
                      }
                    `}
                  </style>
                  {(() => {
                    // Calculate crop grid parameters once
                    const cropSpacingPx = plantSpacing * 3.5;
                    const cropsStartY = (rowAreaTop + rowAreaBottom) / 2 + 38;
                    const cropsEndY = rowAreaBottom;
                    const visibleHeight = cropsEndY - cropsStartY;
                    const numRows = Math.ceil(visibleHeight / cropSpacingPx) + 3;
                    const animDuration = cropSpacingPx / 50;

                    // Line seeding mode
                    if (seedingMode === "line") {
                      return rowPositionsMm.map((rowMm, rowIdx) => {
                        const x = mmToX(rowMm);
                        return (
                          <g key={`crop-row-${rowIdx}`}>
                            <g clipPath="url(#cropsClip)">
                              <line
                                x1={x}
                                y1={cropsStartY}
                                x2={x}
                                y2={cropsEndY}
                                stroke="#22c55e"
                                strokeWidth={3}
                                opacity={0.7}
                              />
                            </g>
                          </g>
                        );
                      });
                    }

                    // Single/Group seeding mode - all crops in one animation group
                    return (
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
                              // Diamond pattern: offset every other column by half spacing
                              const diamondOffset = isDiamondPattern ? (colIdx % 2) * (cropSpacingPx / 2) : 0;
                              return (
                                <g
                                  key={`crop-${rowIdx}-${colIdx}`}
                                  transform={`translate(${x}, ${baseY + diamondOffset})`}
                                  opacity={0.85}
                                >
                                  <CropIcon seedSize={config.seedSize} />
                                </g>
                              );
                            });
                          })}
                        </g>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Spacing labels - subtle, between rows */}
              {rowSpacings.map((spacing, idx) => {
                const leftX = mmToX(rowPositionsMm[idx]);
                const rightX = mmToX(rowPositionsMm[idx + 1]);
                const midX = (leftX + rightX) / 2;
                const gapPx = rightX - leftX;
                const isHovered = hoveredSpacing === idx;
                const isEditing = editingSpacing === idx;

                if (gapPx < 40) return null;

                return (
                  <g
                    key={`spacing-label-${idx}`}
                    onMouseEnter={() => !isEditing && setHoveredSpacing(idx)}
                    onMouseLeave={() => !isEditing && setHoveredSpacing(null)}
                  >
                    {isEditing ? (
                      <foreignObject x={midX - 32} y={rowAreaTop - 28} width={64} height={24}>
                        <input
                          type="number"
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
                          className="w-full h-full text-center text-[14px] font-medium text-stone-700 bg-white border border-stone-300 rounded outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{ fontSize: "14px" }}
                        />
                      </foreignObject>
                    ) : (
                      <text
                        x={midX}
                        y={rowAreaTop - 10}
                        textAnchor="middle"
                        className={`text-[14px] cursor-pointer transition-colors ${isHovered ? "fill-stone-600 font-semibold" : "fill-stone-500 font-medium"}`}
                        onClick={() => handleStartEditSpacing(idx)}
                      >
                        {spacing / 10}
                      </text>
                    )}

                    {!isEditing && (
                      <rect
                        x={midX - 30}
                        y={rowAreaTop - 30}
                        width={60}
                        height={28}
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => handleStartEditSpacing(idx)}
                      />
                    )}
                  </g>
                );
              })}

              {/* Toolbeam - 3.5m wide horizontal bar */}
              {config.activeRows > 0 && (
                <g>
                  <line
                    x1={svgCenterX - (3500 / 2) * pxPerMm}
                    y1={(rowAreaTop + rowAreaBottom) / 2 - 50}
                    x2={svgCenterX + (3500 / 2) * pxPerMm}
                    y2={(rowAreaTop + rowAreaBottom) / 2 - 50}
                    stroke={colors.activeRow}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                  {/* Seeding units on each row */}
                  {rowPositionsMm.map((rowMm, idx) => (
                    <g
                      key={`seeding-unit-${idx}`}
                      transform={`translate(${mmToX(rowMm)}, ${(rowAreaTop + rowAreaBottom) / 2 - 35})`}
                    >
                      <SeedingUnit seedSize={config.seedSize} />
                    </g>
                  ))}
                </g>
              )}

              {/* Active Row Lines with drag/remove UI */}
              {rowPositionsMm.map((rowMm, idx) => {
                const x = mmToX(rowMm);
                const isHovered = hoveredRow === idx;
                const isDragging = draggingRowIdx === idx;
                const canRemove = config.activeRows > (is3Wheel ? 2 : 1);
                const canDrag = config.activeRows > 1;
                const isTooCloseToWheel = isRowTooCloseToWheel(rowMm);

                return (
                  <g
                    key={`row-${idx}`}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => !isDragging && setHoveredRow(null)}
                  >
                    {/* Warning highlight */}
                    {isTooCloseToWheel && (
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

                    {/* Row number badge - above toolbeam */}
                    <g transform={`translate(${x}, ${(rowAreaTop + rowAreaBottom) / 2 - 75})`}>
                      {/* Invisible hover area that covers both badge and remove button */}
                      <rect
                        x="-20"
                        y={canRemove ? "-45" : "-20"}
                        width="40"
                        height={canRemove ? "65" : "40"}
                        fill="transparent"
                        className={canDrag ? "cursor-ew-resize" : "cursor-default"}
                      />

                      {/* Remove button - positioned above badge */}
                      {isHovered && !isDragging && canRemove && (
                        <g
                          transform="translate(0, -30)"
                          className="cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); handleRemoveRow(idx); }}
                        >
                          <circle r="12" fill="white" stroke="#e7e5e4" strokeWidth="1" />
                          <line x1="-4" y1="0" x2="4" y2="0" stroke={colors.removeBtn} strokeWidth="2.5" strokeLinecap="round" />
                          {/* Tooltip */}
                          <rect x="18" y="-10" width="55" height="20" rx="4" fill="#1c1917" fillOpacity="0.9" />
                          <text x="45" y="4" textAnchor="middle" className="text-[9px] fill-white">Remove</text>
                        </g>
                      )}

                      {/* Badge circle */}
                      <circle
                        r={14}
                        fill={isHovered || isDragging ? colors.activeRowHover : colors.activeRow}
                        className={canDrag ? "cursor-ew-resize" : "cursor-default"}
                        onMouseDown={canDrag ? (e) => { e.preventDefault(); handleRowDragStart(idx, e.clientX); } : undefined}
                      />
                      <text
                        y={5}
                        textAnchor="middle"
                        className="text-[12px] fill-white font-semibold select-none"
                        style={{ pointerEvents: "none" }}
                      >
                        {idx + 1}
                      </text>
                      {/* Tooltip on hover */}
                      {isHovered && !isDragging && (
                        <g style={{ pointerEvents: "none" }}>
                          <rect x="20" y="-12" width="85" height="24" rx="4" fill="#1c1917" fillOpacity="0.9" />
                          <text x="62" y="4" textAnchor="middle" className="text-[10px] fill-white">Drag to move</text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}

              {/* CSS animation for passive row dash offset */}
              <style>
                {`
                  @keyframes dashScroll {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -13px; }
                  }
                  .passive-row-animated {
                    animation: dashScroll 0.26s linear infinite;
                  }
                `}
              </style>

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
                  <text y="6" textAnchor="middle" className="text-[20px] fill-teal-600 font-bold select-none">+</text>
                  <text y="50" textAnchor="middle" className="text-[12px] fill-teal-600 font-medium">Click to add rows</text>
                </g>
              )}

              {/* Add row buttons at edges - always visible when rows exist */}
              {canAddMoreRows && config.activeRows > 0 && rowPositionsMm.length > 0 && (
                <>
                  <g
                    className="cursor-pointer"
                    onClick={() => handleAddRowEdge("left")}
                    onMouseEnter={() => setHoveredEdgeAdd("left")}
                    onMouseLeave={() => setHoveredEdgeAdd(null)}
                    transform={`translate(${mmToX(rowPositionsMm[0]) - 40}, ${(rowAreaTop + rowAreaBottom) / 2})`}
                  >
                    <circle r="16" fill="white" stroke={hoveredEdgeAdd === "left" ? colors.activeRowHover : colors.addBtn} strokeWidth="2" />
                    <text y="6" textAnchor="middle" className="text-[18px] fill-teal-600 font-bold select-none">+</text>
                    {hoveredEdgeAdd === "left" && (
                      <>
                        <rect x="-45" y="22" width="90" height="22" rx="4" fill="#1c1917" fillOpacity="0.9" />
                        <text y="37" textAnchor="middle" className="text-[10px] fill-white">Add row{is3Wheel ? "s" : ""} on left</text>
                      </>
                    )}
                  </g>
                  <g
                    className="cursor-pointer"
                    onClick={() => handleAddRowEdge("right")}
                    onMouseEnter={() => setHoveredEdgeAdd("right")}
                    onMouseLeave={() => setHoveredEdgeAdd(null)}
                    transform={`translate(${mmToX(rowPositionsMm[rowPositionsMm.length - 1]) + 40}, ${(rowAreaTop + rowAreaBottom) / 2})`}
                  >
                    <circle r="16" fill="white" stroke={hoveredEdgeAdd === "right" ? colors.activeRowHover : colors.addBtn} strokeWidth="2" />
                    <text y="6" textAnchor="middle" className="text-[18px] fill-teal-600 font-bold select-none">+</text>
                    {hoveredEdgeAdd === "right" && (
                      <>
                        <rect x="-48" y="22" width="96" height="22" rx="4" fill="#1c1917" fillOpacity="0.9" />
                        <text y="37" textAnchor="middle" className="text-[10px] fill-white">Add row{is3Wheel ? "s" : ""} on right</text>
                      </>
                    )}
                  </g>
                </>
              )}

              {/* Hover zones between rows to add - button only appears on hover */}
              {rowSpacings.map((_, idx) => {
                const leftX = mmToX(rowPositionsMm[idx]);
                const rightX = mmToX(rowPositionsMm[idx + 1]);
                const midX = (leftX + rightX) / 2;
                const gapWidth = rightX - leftX;
                const isHoveredGap = hoveredGap === idx;

                // Only hide if gap is really tiny
                if (gapWidth < 15 || !canAddMoreRows) return null;

                // Scale button size based on gap width
                const buttonRadius = Math.min(14, Math.max(8, gapWidth / 3));
                const fontSize = buttonRadius >= 12 ? "16px" : "12px";

                return (
                  <g
                    key={`add-zone-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredGap(idx)}
                    onMouseLeave={() => setHoveredGap(null)}
                    onClick={() => handleAddRowAt(idx)}
                  >
                    {/* Invisible hover area */}
                    <rect
                      x={leftX + 5}
                      y={rowAreaTop + 10}
                      width={Math.max(10, gapWidth - 10)}
                      height={rowAreaBottom - rowAreaTop - 20}
                      fill={isHoveredGap ? "rgba(13, 148, 136, 0.05)" : "transparent"}
                      rx="4"
                    />
                    {/* Show + button only on hover */}
                    {isHoveredGap && (
                      <g transform={`translate(${midX}, ${(rowAreaTop + rowAreaBottom) / 2})`}>
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
                          className="fill-teal-600 font-medium select-none"
                        >+</text>
                        {/* Tooltip */}
                        <rect x="-50" y={buttonRadius + 6} width="100" height="20" rx="4" fill="#1c1917" fillOpacity="0.9" />
                        <text y={buttonRadius + 20} textAnchor="middle" className="text-[9px] fill-white">Click to insert row{is3Wheel ? "s" : ""}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Direction indicator - on top of animation */}
              <g transform={`translate(${svgCenterX}, ${rowAreaTop + 100})`}>
                <polygon points="0,-6 5,3 -5,3" fill="#78716c" />
                <text y="-12" textAnchor="middle" className="text-[9px] fill-stone-500 font-medium tracking-widest uppercase">Front</text>
              </g>

              {/* Front Wheel(s) - on top of animation */}
              {is3Wheel && frontWheelMm !== null ? (
                <g
                  onMouseEnter={() => setHoveredWheel("front")}
                  onMouseLeave={() => setHoveredWheel(null)}
                  className="cursor-default"
                >
                  <rect
                    x={mmToX(frontWheelMm) - wheelWidth/2}
                    y={rowAreaTop + 110}
                    width={wheelWidth}
                    height={wheelHeight}
                    rx={5}
                    fill={hoveredWheel === "front" ? colors.wheelDrag : colors.wheel}
                  />
                  {/* Tooltip on hover */}
                  {hoveredWheel === "front" && (
                    <g transform={`translate(${mmToX(frontWheelMm)}, ${rowAreaTop + 110 + wheelHeight})`}>
                      <rect x="-55" y="4" width="110" height="34" rx="4" fill="#1c1917" fillOpacity="0.9" />
                      <text y="20" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                      <line x1={-wheelWidth/2 + 2} y1="30" x2={wheelWidth/2 - 2} y2="30" stroke="white" strokeWidth="1" />
                      <line x1={-wheelWidth/2 + 2} y1="27" x2={-wheelWidth/2 + 2} y2="33" stroke="white" strokeWidth="1" />
                      <line x1={wheelWidth/2 - 2} y1="27" x2={wheelWidth/2 - 2} y2="33" stroke="white" strokeWidth="1" />
                      <text y="31" x="30" className="text-[8px] fill-stone-300">17 cm</text>
                    </g>
                  )}
                </g>
              ) : (
                <>
                  <g
                    onMouseEnter={() => setHoveredWheel("frontLeft")}
                    onMouseLeave={() => setHoveredWheel(null)}
                    className="cursor-default"
                  >
                    <rect x={mmToX(leftWheelMm) - wheelWidth/2} y={rowAreaTop + 110} width={wheelWidth} height={wheelHeight} rx={5} fill={hoveredWheel === "frontLeft" ? colors.wheelDrag : colors.wheel} />
                    {/* Tooltip on hover */}
                    {hoveredWheel === "frontLeft" && (
                      <g transform={`translate(${mmToX(leftWheelMm)}, ${rowAreaTop + 110 + wheelHeight})`}>
                        <rect x="-55" y="4" width="110" height="34" rx="4" fill="#1c1917" fillOpacity="0.9" />
                        <text y="20" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                        <line x1={-wheelWidth/2 + 2} y1="30" x2={wheelWidth/2 - 2} y2="30" stroke="white" strokeWidth="1" />
                        <line x1={-wheelWidth/2 + 2} y1="27" x2={-wheelWidth/2 + 2} y2="33" stroke="white" strokeWidth="1" />
                        <line x1={wheelWidth/2 - 2} y1="27" x2={wheelWidth/2 - 2} y2="33" stroke="white" strokeWidth="1" />
                        <text y="31" x="30" className="text-[8px] fill-stone-300">17 cm</text>
                      </g>
                    )}
                  </g>
                  <g
                    onMouseEnter={() => setHoveredWheel("frontRight")}
                    onMouseLeave={() => setHoveredWheel(null)}
                    className="cursor-default"
                  >
                    <rect x={mmToX(rightWheelMm) - wheelWidth/2} y={rowAreaTop + 110} width={wheelWidth} height={wheelHeight} rx={5} fill={hoveredWheel === "frontRight" ? colors.wheelDrag : colors.wheel} />
                    {/* Tooltip on hover */}
                    {hoveredWheel === "frontRight" && (
                      <g transform={`translate(${mmToX(rightWheelMm)}, ${rowAreaTop + 110 + wheelHeight})`}>
                        <rect x="-55" y="4" width="110" height="34" rx="4" fill="#1c1917" fillOpacity="0.9" />
                        <text y="20" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                        <line x1={-wheelWidth/2 + 2} y1="30" x2={wheelWidth/2 - 2} y2="30" stroke="white" strokeWidth="1" />
                        <line x1={-wheelWidth/2 + 2} y1="27" x2={-wheelWidth/2 + 2} y2="33" stroke="white" strokeWidth="1" />
                        <line x1={wheelWidth/2 - 2} y1="27" x2={wheelWidth/2 - 2} y2="33" stroke="white" strokeWidth="1" />
                        <text y="31" x="30" className="text-[8px] fill-stone-300">17 cm</text>
                      </g>
                    )}
                  </g>
                </>
              )}

              {/* Back Wheels - Draggable, on top of animation */}
              <g
                className="cursor-ew-resize"
                onMouseDown={(e) => { e.preventDefault(); handleWheelDragStart("left", e.clientX); }}
                onMouseEnter={() => !draggingWheelSide && setHoveredWheel("backLeft")}
                onMouseLeave={() => setHoveredWheel(null)}
              >
                <rect
                  x={mmToX(leftWheelMm) - wheelWidth/2}
                  y={rowAreaBottom - wheelHeight - 110}
                  width={wheelWidth}
                  height={wheelHeight}
                  rx={5}
                  fill={draggingWheelSide === "left" || hoveredWheel === "backLeft" ? colors.wheelDrag : colors.wheel}
                />
                {/* Tooltip on hover */}
                {hoveredWheel === "backLeft" && !draggingWheelSide && (
                  <g transform={`translate(${mmToX(leftWheelMm)}, ${rowAreaBottom - wheelHeight - 110})`}>
                    {/* Tooltip background */}
                    <rect x="-55" y="-38" width="110" height="34" rx="4" fill="#1c1917" fillOpacity="0.9" />
                    {/* "Wheel" label */}
                    <text y="-22" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                    {/* Width bracket with dimension */}
                    <line x1={-wheelWidth/2 + 2} y1="-10" x2={wheelWidth/2 - 2} y2="-10" stroke="white" strokeWidth="1" />
                    <line x1={-wheelWidth/2 + 2} y1="-13" x2={-wheelWidth/2 + 2} y2="-7" stroke="white" strokeWidth="1" />
                    <line x1={wheelWidth/2 - 2} y1="-13" x2={wheelWidth/2 - 2} y2="-7" stroke="white" strokeWidth="1" />
                    <text y="-10" x="30" className="text-[8px] fill-stone-300">17 cm</text>
                  </g>
                )}
              </g>
              <g
                className="cursor-ew-resize"
                onMouseDown={(e) => { e.preventDefault(); handleWheelDragStart("right", e.clientX); }}
                onMouseEnter={() => !draggingWheelSide && setHoveredWheel("backRight")}
                onMouseLeave={() => setHoveredWheel(null)}
              >
                <rect
                  x={mmToX(rightWheelMm) - wheelWidth/2}
                  y={rowAreaBottom - wheelHeight - 110}
                  width={wheelWidth}
                  height={wheelHeight}
                  rx={5}
                  fill={draggingWheelSide === "right" || hoveredWheel === "backRight" ? colors.wheelDrag : colors.wheel}
                />
                {/* Tooltip on hover */}
                {hoveredWheel === "backRight" && !draggingWheelSide && (
                  <g transform={`translate(${mmToX(rightWheelMm)}, ${rowAreaBottom - wheelHeight - 110})`}>
                    {/* Tooltip background */}
                    <rect x="-55" y="-38" width="110" height="34" rx="4" fill="#1c1917" fillOpacity="0.9" />
                    {/* "Wheel" label */}
                    <text y="-22" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                    {/* Width bracket with dimension */}
                    <line x1={-wheelWidth/2 + 2} y1="-10" x2={wheelWidth/2 - 2} y2="-10" stroke="white" strokeWidth="1" />
                    <line x1={-wheelWidth/2 + 2} y1="-13" x2={-wheelWidth/2 + 2} y2="-7" stroke="white" strokeWidth="1" />
                    <line x1={wheelWidth/2 - 2} y1="-13" x2={wheelWidth/2 - 2} y2="-7" stroke="white" strokeWidth="1" />
                    <text y="-10" x="30" className="text-[8px] fill-stone-300">17 cm</text>
                  </g>
                )}
              </g>

              {/* Wheel spacing dimension - positioned below back wheels */}
              <g>
                {/* Dimension line below back wheels */}
                <line x1={mmToX(leftWheelMm)} y1={rowAreaBottom - 55} x2={mmToX(rightWheelMm)} y2={rowAreaBottom - 55} stroke="#a8a29e" strokeWidth="1" />
                {/* Left tick */}
                <line x1={mmToX(leftWheelMm)} y1={rowAreaBottom - 61} x2={mmToX(leftWheelMm)} y2={rowAreaBottom - 49} stroke="#a8a29e" strokeWidth="1" />
                {/* Right tick */}
                <line x1={mmToX(rightWheelMm)} y1={rowAreaBottom - 61} x2={mmToX(rightWheelMm)} y2={rowAreaBottom - 49} stroke="#a8a29e" strokeWidth="1" />
                {/* Label */}
                <text x={svgCenterX} y={rowAreaBottom - 40} textAnchor="middle" className="text-[10px] fill-stone-500">
                  {config.wheelSpacing / 10} cm
                </text>
              </g>

              {/* Legend */}
              <g transform={`translate(${margin.left + 10}, ${rowAreaTop + 10})`}>
                <rect x="-5" y="-5" width="95" height="75" rx="4" fill="white" fillOpacity="0.9" stroke="#e7e5e4" strokeWidth="1" />
                {/* Active row */}
                <line x1="0" y1="8" x2="20" y2="8" stroke={colors.activeRow} strokeWidth="2" />
                <text x="28" y="12" className="text-[10px] fill-stone-600">Active row</text>
                {/* Passive row */}
                <line x1="0" y1="28" x2="20" y2="28" stroke={colors.passiveRow} strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="28" y="32" className="text-[10px] fill-stone-600">Passive row</text>
                {/* Crop or Seed line depending on mode */}
                {seedingMode === "line" ? (
                  <>
                    <line x1="0" y1="48" x2="20" y2="48" stroke="#22c55e" strokeWidth="3" opacity="0.7" />
                    <text x="28" y="52" className="text-[10px] fill-stone-600">Seed line</text>
                  </>
                ) : (
                  <>
                    <g transform="translate(10, 48)">
                      <CropIcon seedSize={config.seedSize} />
                    </g>
                    <text x="28" y="52" className="text-[10px] fill-stone-600">Crop</text>
                  </>
                )}
              </g>

              {/* Pause button inside field */}
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
            </svg>
          </div>

          {/* Seeding mode control */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-xs text-stone-500">Seeding Mode</span>
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
              <button
                onClick={() => setSeedingMode("single")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  seedingMode === "single"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setSeedingMode("group")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  seedingMode === "group"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Group
              </button>
              <button
                onClick={() => setSeedingMode("line")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  seedingMode === "line"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Line
              </button>
            </div>
            <div className="relative group">
              <Info className="h-4 w-4 text-stone-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <span className="font-medium">Single:</span> Precision single seeding<br/>
                <span className="font-medium">Group:</span> Precision group seeding<br/>
                <span className="font-medium">Line:</span> Continuous line seeding (no spacing)
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
              </div>
            </div>
          </div>

          {/* Seeding pattern control */}
          <div className={`flex items-center justify-center gap-3 mt-3 relative group/pattern ${seedingMode === "line" ? "opacity-40" : ""}`}>
            <span className="text-xs text-stone-500">Seeding Pattern</span>
            <div className={`flex items-center bg-stone-100 rounded-lg p-0.5 ${seedingMode === "line" ? "pointer-events-none" : ""}`}>
              <button
                onClick={() => setIsDiamondPattern(false)}
                disabled={seedingMode === "line"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !isDiamondPattern
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                } ${seedingMode === "line" ? "cursor-not-allowed" : ""}`}
              >
                <Grid3X3 className="h-3 w-3" />
                Grid
              </button>
              <button
                onClick={() => setIsDiamondPattern(true)}
                disabled={seedingMode === "line"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isDiamondPattern
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                } ${seedingMode === "line" ? "cursor-not-allowed" : ""}`}
              >
                <Diamond className="h-3 w-3" />
                Diamond
              </button>
            </div>
            <div className="relative group">
              <Info className="h-4 w-4 text-stone-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                FarmDroid +Seed can seed in both a perfect grid or diamond formation for optimal plant spacing.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
              </div>
            </div>
            {/* Disabled tooltip for line seeding */}
            {seedingMode === "line" && (
              <div className="absolute inset-0 cursor-not-allowed" title="Not available for line seeding">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-700 text-white text-xs rounded opacity-0 group-hover/pattern:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  Not available for line seeding
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-700" />
                </div>
              </div>
            )}
          </div>

          {/* Plant spacing control */}
          <div className={`flex items-center justify-center gap-3 mt-3 relative group/spacing ${seedingMode === "line" ? "opacity-40" : ""}`}>
            <span className="text-xs text-stone-500">Plant Spacing</span>
            <div className={`flex items-center gap-2 ${seedingMode === "line" ? "pointer-events-none" : ""}`}>
              <button
                onClick={() => setPlantSpacing(Math.max(10, plantSpacing - 2))}
                disabled={plantSpacing <= 10 || seedingMode === "line"}
                className="h-6 w-6 rounded-full border border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-500 transition-all flex items-center justify-center"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-medium text-stone-700 w-12 text-center">{plantSpacing} cm</span>
              <button
                onClick={() => setPlantSpacing(Math.min(40, plantSpacing + 2))}
                disabled={plantSpacing >= 40 || seedingMode === "line"}
                className="h-6 w-6 rounded-full border border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-500 transition-all flex items-center justify-center"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="relative group">
              <Info className="h-4 w-4 text-stone-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Distance between plants along each row. Minimum 10 cm spacing for precision seeding.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
              </div>
            </div>
            {/* Disabled tooltip for line seeding */}
            {seedingMode === "line" && (
              <div className="absolute inset-0 cursor-not-allowed" title="Not available for line seeding">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-700 text-white text-xs rounded opacity-0 group-hover/spacing:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  Not available for line seeding
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-700" />
                </div>
              </div>
            )}
          </div>

        </motion.div>
        )}

        {/* Stats row */}
        <div className="flex justify-center gap-6 md:gap-12 pt-4 md:pt-6 mt-2">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-semibold text-teal-600">{config.activeRows}</p>
            <p className="text-xs md:text-sm text-stone-500 mt-1">Active</p>
          </div>
          <div className="text-center border-l border-stone-200 pl-6 md:pl-12">
            <p className="text-xl md:text-2xl font-semibold text-stone-400">{totalPassiveRows}</p>
            <p className="text-xs md:text-sm text-stone-500 mt-1">Passive</p>
          </div>
          <div className="text-center border-l border-stone-200 pl-6 md:pl-12">
            <p className="text-xl md:text-2xl font-semibold text-stone-700">
              {(workingWidth / 10).toFixed(0)}
              <span className="text-sm md:text-base font-normal text-stone-400 ml-0.5">cm</span>
            </p>
            <p className="text-xs md:text-sm text-stone-500 mt-1">Width</p>
          </div>
        </div>

        {/* Validation error */}
        {!validation.valid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 py-2 px-3 rounded flex items-center gap-2 text-xs text-red-600 bg-red-50">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {validation.error}
          </motion.div>
        )}

        {/* Wheel proximity warning */}
        {hasWheelProximityWarning && validation.valid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 py-2 px-3 rounded flex items-center gap-2 text-xs text-amber-600 bg-amber-50">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            Row within 5cm of wheel edge
          </motion.div>
        )}
      </div>

      {/* Right: Configuration - Takes 2 columns (narrower) */}
      <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:pl-2">
        {/* Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 tracking-tight">Row Config</h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">Configure rows and spacing</p>
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
                className={`flex-1 text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-900">+Seed {size}</span>
                  {isSelected && (
                    <div className="h-3.5 w-3.5 rounded-full bg-stone-900 flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{formatPrice(PRICES.activeRow[size], config.currency)}/row</p>
              </button>
            );
          })}
        </div>

        {/* Cost display */}
        {config.activeRows > 0 && (
          <div className="py-2 px-3 rounded-lg bg-teal-50 border border-teal-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-teal-700">{config.activeRows} active rows</span>
              <span className="text-sm font-semibold text-teal-700">{formatPrice(config.activeRows * rowPrice, config.currency)}</span>
            </div>
            {totalPassiveRows > 0 && (
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-xs text-teal-600">{totalPassiveRows} passive</span>
                <span className="text-xs text-teal-500">included</span>
              </div>
            )}
          </div>
        )}

        {/* Adjustments */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          {/* Active Rows */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600 font-medium">Rows</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // If 3-wheel mode with odd rows, decrease by 1 to get to even
                  // Otherwise decrease by 2 for 3-wheel or 1 for 4-wheel
                  const decrement = is3Wheel && config.activeRows % 2 !== 0 ? 1 : (is3Wheel ? 2 : 1);
                  handleSetRowCount(config.activeRows - decrement);
                }}
                disabled={config.activeRows <= 0}
                className="h-8 w-8 rounded-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-base font-semibold text-stone-900 w-8 text-center">{config.activeRows}</span>
              <button
                onClick={() => {
                  // If 3-wheel mode with odd rows, increase by 1 to get to even
                  // Otherwise increase by 2 for 3-wheel or 1 for 4-wheel
                  if (config.activeRows === 0) {
                    handleSetRowCount(is3Wheel ? 2 : 1);
                  } else {
                    const increment = is3Wheel && config.activeRows % 2 !== 0 ? 1 : (is3Wheel ? 2 : 1);
                    handleSetRowCount(config.activeRows + increment);
                  }
                }}
                disabled={!canAddMoreRows}
                className="h-8 w-8 rounded-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Row Spacing */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600 font-medium">Spacing</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const decreased = config.rowDistance - 10;
                  const newDistance = decreased < minRowDistance ? minRowDistance : decreased;
                  updateConfig({
                    rowDistance: newDistance,
                    rowSpacings: generateRowSpacings(config.activeRows, newDistance)
                  });
                }}
                disabled={config.rowDistance <= minRowDistance}
                className="h-8 w-8 rounded-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-base font-semibold text-stone-900 w-14 text-center">{config.rowDistance / 10}cm</span>
              <button
                onClick={() => {
                  const isAtHalfCm = config.rowDistance % 10 !== 0;
                  const newDistance = isAtHalfCm
                    ? Math.ceil(config.rowDistance / 10) * 10
                    : Math.min(800, config.rowDistance + 10);
                  updateConfig({
                    rowDistance: newDistance,
                    rowSpacings: generateRowSpacings(config.activeRows, newDistance)
                  });
                }}
                disabled={config.rowDistance >= 800}
                className="h-8 w-8 rounded-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Wheel Spacing */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600 font-medium">Wheels</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateConfig({ wheelSpacing: Math.max(WHEEL_CONSTRAINTS.minWheelSpacing, config.wheelSpacing - 100) })}
                disabled={config.wheelSpacing <= WHEEL_CONSTRAINTS.minWheelSpacing}
                className="h-8 w-8 rounded-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-base font-semibold text-stone-900 w-14 text-center">{config.wheelSpacing / 10}cm</span>
              <button
                onClick={() => updateConfig({ wheelSpacing: Math.min(WHEEL_CONSTRAINTS.maxWheelSpacing, config.wheelSpacing + 100) })}
                disabled={config.wheelSpacing >= WHEEL_CONSTRAINTS.maxWheelSpacing}
                className="h-8 w-8 rounded-full border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          {(is3Wheel || hasCustomSpacings) && (
            <div className="pt-1 space-y-0.5">
              {is3Wheel && (
                <p className="text-xs text-stone-400">3-wheel: rows adjust in pairs</p>
              )}
              {hasCustomSpacings && (
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Spacing change resets custom
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="pt-3 border-t border-stone-100">
          <p className="text-xs font-medium text-stone-500 mb-2">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {CROP_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-2 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-[10px] text-stone-600 transition-colors flex items-center gap-1"
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
