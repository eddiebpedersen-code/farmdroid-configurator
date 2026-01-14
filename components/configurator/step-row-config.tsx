"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, Plus, Minus, Play, Pause, Grid3X3, Diamond, Info, Layers, Lightbulb, TrendingUp } from "lucide-react";

// Crop icon component for animated plants - shows emoji or seedling
function CropIcon({ seedSize, emoji }: { seedSize: "6mm" | "14mm"; emoji?: string }) {
  const scale = seedSize === "6mm" ? 0.9 : 1.1;
  const fontSize = seedSize === "6mm" ? 14 : 18;

  // If emoji provided and not seedling, show emoji
  if (emoji && emoji !== "🌱") {
    return (
      <text
        fontSize={fontSize}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ userSelect: "none" }}
      >
        {emoji}
      </text>
    );
  }

  // Default seedling SVG
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
  validateRowConfig,
  generateRowSpacings,
  getWheelConfig,
  calculateOptimalWheelSpacing,
} from "@/lib/configurator-data";

// Calculate robot speed based on seeding mode and plant spacing
function calculateRobotSpeed(
  seedingMode: "single" | "group" | "line",
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

// Daily Capacity Graph Component - Large version for main view
function CapacityGraphLarge({
  seedingMode,
  plantSpacing,
  workingWidth,
}: {
  seedingMode: "single" | "group" | "line";
  plantSpacing: number;
  workingWidth: number;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const speed = calculateRobotSpeed(seedingMode, plantSpacing);
  const workingWidthM = workingWidth / 1000;

  // Generate data points for 12-24 hours
  const dataPoints: { hours: number; capacity: number }[] = [];
  for (let hours = 12; hours <= 24; hours++) {
    const capacity = (speed * workingWidthM * hours) / 10000;
    dataPoints.push({ hours, capacity });
  }

  // Fixed Y-axis maximum at 10 hectares
  const maxCapacity = 10;

  // SVG dimensions - match aspect ratio of 2D animation (900x580)
  const width = 900;
  const height = 480;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (hours: number) =>
    padding.left + ((hours - 12) / 12) * graphWidth;
  const yScale = (capacity: number) =>
    height - padding.bottom - (capacity / maxCapacity) * graphHeight;

  // Create path for the line
  const linePath = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.hours)} ${yScale(p.capacity)}`)
    .join(" ");

  // Create path for the filled area
  const areaPath = `${linePath} L ${xScale(24)} ${height - padding.bottom} L ${xScale(12)} ${height - padding.bottom} Z`;

  // Y-axis labels (fixed at 0, 2, 4, 6, 8, 10)
  const yLabels = [0, 2, 4, 6, 8, 10];

  // X-axis labels (12-24 in increments of 2)
  const xLabels = [12, 14, 16, 18, 20, 22, 24];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-stone-50 rounded-xl p-4 md:p-6 flex-1 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[400px]">
          {/* Grid lines - horizontal */}
          {yLabels.map((y) => (
            <line
              key={y}
              x1={padding.left}
              y1={yScale(y)}
              x2={width - padding.right}
              y2={yScale(y)}
              stroke="#e7e5e4"
              strokeWidth="1"
            />
          ))}

          {/* Grid lines - vertical */}
          {xLabels.map((h) => (
            <line
              key={h}
              x1={xScale(h)}
              y1={padding.top}
              x2={xScale(h)}
              y2={height - padding.bottom}
              stroke="#e7e5e4"
              strokeWidth="1"
              strokeDasharray={h === 18 ? "0" : "4,4"}
              opacity={h === 18 ? 0.5 : 0.5}
            />
          ))}

          {/* Filled area under line */}
          <path d={areaPath} fill="#0d9488" fillOpacity="0.15" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0d9488"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points with hover effect */}
          {dataPoints.map((p, idx) => {
            const isHovered = hoveredPoint === idx;
            return (
              <g key={p.hours}>
                {/* Invisible larger hit area for hover */}
                <circle
                  cx={xScale(p.hours)}
                  cy={yScale(p.capacity)}
                  r="25"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Visible point */}
                <circle
                  cx={xScale(p.hours)}
                  cy={yScale(p.capacity)}
                  r={isHovered ? 12 : 8}
                  fill={isHovered ? "#059669" : "#0d9488"}
                  stroke="white"
                  strokeWidth={isHovered ? 4 : 3}
                  className="transition-all duration-150"
                  style={{ pointerEvents: "none" }}
                />
                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={xScale(p.hours) - 70}
                      y={yScale(p.capacity) - 65}
                      width="140"
                      height="50"
                      rx="8"
                      fill="#1c1917"
                      fillOpacity="0.95"
                    />
                    <text
                      x={xScale(p.hours)}
                      y={yScale(p.capacity) - 42}
                      textAnchor="middle"
                      className="text-[16px] fill-white font-medium"
                    >
                      {p.capacity.toFixed(2)} ha/day
                    </text>
                    <text
                      x={xScale(p.hours)}
                      y={yScale(p.capacity) - 22}
                      textAnchor="middle"
                      className="text-[14px] fill-stone-400"
                    >
                      at {p.hours}h/day
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Y-axis labels */}
          {yLabels.map((y) => (
            <text
              key={y}
              x={padding.left - 15}
              y={yScale(y) + 6}
              textAnchor="end"
              className="text-[18px] fill-stone-500"
            >
              {y}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.map((h) => (
            <text
              key={h}
              x={xScale(h)}
              y={height - padding.bottom + 30}
              textAnchor="middle"
              className="text-[18px] fill-stone-500"
            >
              {h}h
            </text>
          ))}

          {/* Y-axis title */}
          <text
            x={22}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 22, ${height / 2})`}
            className="text-[18px] fill-stone-500 font-medium"
          >
            Hectares per day
          </text>

          {/* X-axis title */}
          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            className="text-[18px] fill-stone-500 font-medium"
          >
            Running hours per day
          </text>
        </svg>
      </div>
    </div>
  );
}

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
  const [hoveredSeedUnit, setHoveredSeedUnit] = useState<number | null>(null);
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
  const [seedsPerGroup, setSeedsPerGroup] = useState(3); // seeds per group (2-15)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  // Crop type selection with recommended configurations
  const cropTypes = [
    { id: "sprout", emoji: "🌱", name: "Sprout", seedSize: "6mm" as SeedSize, rows: 6, rowDistance: 450, plantSpacing: 15 },
    { id: "onion", emoji: "🧅", name: "Onion", seedSize: "14mm" as SeedSize, rows: 8, rowDistance: 300, plantSpacing: 12 },
    { id: "sugarbeet", emoji: "🥬", name: "Sugar Beet", seedSize: "6mm" as SeedSize, rows: 6, rowDistance: 500, plantSpacing: 18 },
    { id: "lettuce", emoji: "🥗", name: "Lettuce", seedSize: "14mm" as SeedSize, rows: 6, rowDistance: 400, plantSpacing: 30 },
    { id: "corn", emoji: "🌽", name: "Corn", seedSize: "14mm" as SeedSize, rows: 4, rowDistance: 750, plantSpacing: 20 },
    { id: "greenbean", emoji: "🫛", name: "Green Bean", seedSize: "6mm" as SeedSize, rows: 8, rowDistance: 300, plantSpacing: 10 },
  ];
  const [selectedCrop, setSelectedCrop] = useState(cropTypes[0]);

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
  const svgWidth = 900;
  const svgHeight = 540;
  const margin = { left: 0, right: 0 };
  const rowAreaTop = 0; // Start at top
  const rowAreaBottom = svgHeight; // End at bottom

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

    const newCount = config.activeRows + 1;

    setHoveredGap(null); // Clear hover state before update
    updateConfig({
      activeRows: Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows),
      rowSpacings: newSpacings.slice(0, Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows) - 1),
    });
  }, [config.activeRows, minRowDistance, rowSpan, rowSpacings, updateConfig]);

  const handleAddRowEdge = useCallback((side: "left" | "right") => {
    if (config.activeRows >= ROW_CONSTRAINTS.maxActiveRows) return;

    // Check if adding would exceed max span
    if (rowSpan + config.rowDistance + config.rowDistance > maxWorkingWidth) return;

    const newSpacings = [...rowSpacings];
    if (side === "left") {
      newSpacings.unshift(config.rowDistance);
    } else {
      newSpacings.push(config.rowDistance);
    }

    const newCount = config.activeRows + 1;

    updateConfig({
      activeRows: Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows),
      rowSpacings: newSpacings.slice(0, Math.min(newCount, ROW_CONSTRAINTS.maxActiveRows) - 1),
    });
  }, [config.activeRows, config.rowDistance, rowSpan, rowSpacings, updateConfig]);

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
    setHoveredSeedUnit(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingWheelSide) {
      handleWheelDragMove(e.clientX);
    } else if (draggingRowIdx !== null) {
      handleRowDragMove(e.clientX);
    }
  }, [draggingWheelSide, draggingRowIdx, handleWheelDragMove, handleRowDragMove]);

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
            onMouseLeave={handleDragEnd}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full"
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
                  `}
                </style>
              </g>
                );
              })()}

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
                    // Speed-based animation duration: faster robot = faster animation
                    const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);
                    const animDuration = cropSpacingPx / (robotSpeed / 20);

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
                                  <CropIcon seedSize={config.seedSize} emoji={selectedCrop.emoji} />
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

              {/* Legend - rendered early so tooltips appear on top */}
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
                    {isEditing ? (
                      <foreignObject x={midX - 36} y={spacingY - 8} width={72} height={24}>
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
                          className="w-full h-full text-center text-[12px] font-medium text-stone-700 bg-white border border-stone-300 rounded outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{ fontSize: "12px" }}
                        />
                      </foreignObject>
                    ) : (
                      <g className="cursor-pointer" onClick={() => handleStartEditSpacing(idx)}>
                        {/* Left tick */}
                        <line x1={leftX} y1={spacingY - 7} x2={leftX} y2={spacingY + 7} stroke={isHovered ? "#57534e" : "#78716c"} strokeWidth="1.5" />
                        {/* Horizontal line */}
                        <line x1={leftX} y1={spacingY} x2={rightX} y2={spacingY} stroke={isHovered ? "#57534e" : "#78716c"} strokeWidth="1.5" />
                        {/* Right tick */}
                        <line x1={rightX} y1={spacingY - 7} x2={rightX} y2={spacingY + 7} stroke={isHovered ? "#57534e" : "#78716c"} strokeWidth="1.5" />
                        {/* Label */}
                        <text
                          x={midX}
                          y={spacingY - 12}
                          textAnchor="middle"
                          className={`text-[12px] font-medium transition-colors ${isHovered ? "fill-stone-700" : "fill-stone-600"}`}
                        >
                          {spacing / 10} cm
                        </text>
                      </g>
                    )}

                    {!isEditing && (
                      <rect
                        x={leftX}
                        y={spacingY - 10}
                        width={rightX - leftX}
                        height={35}
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
                  {/* Seeding units on each row - draggable */}
                  {rowPositionsMm.map((rowMm, idx) => {
                    const canDrag = config.activeRows > 1;
                    const isDragging = draggingRowIdx === idx;
                    const isHovered = hoveredSeedUnit === idx || hoveredRow === idx;
                    return (
                      <g
                        key={`seeding-unit-${idx}`}
                        transform={`translate(${mmToX(rowMm)}, ${(rowAreaTop + rowAreaBottom) / 2 - 35})`}
                        className={canDrag ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}
                        onMouseEnter={() => { setHoveredSeedUnit(idx); setHoveredRow(idx); }}
                        onMouseLeave={() => { if (!isDragging) { setHoveredSeedUnit(null); setHoveredRow(null); } }}
                        onMouseDown={canDrag ? (e) => { e.preventDefault(); handleRowDragStart(idx, e.clientX); } : undefined}
                        style={{ opacity: isHovered || isDragging ? 1 : 0.95 }}
                      >
                        <SeedingUnit seedSize={config.seedSize} />
                      </g>
                    );
                  })}
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
                        className={canDrag ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}
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
                        </g>
                      )}

                      {/* Badge circle */}
                      <circle
                        r={14}
                        fill={isHovered || isDragging ? colors.activeRowHover : colors.activeRow}
                        className={canDrag ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}
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
                const isHoveredGap = hoveredGap === idx && draggingRowIdx === null;
                const isDragging = draggingRowIdx !== null;

                // Only hide if gap is really tiny or currently dragging
                if (gapWidth < 15 || !canAddMoreRows) return null;

                // Scale button size based on gap width
                const buttonRadius = Math.min(14, Math.max(8, gapWidth / 3));
                const fontSize = buttonRadius >= 12 ? "16px" : "12px";

                return (
                  <g
                    key={`add-zone-${idx}`}
                    className={isDragging ? "pointer-events-none" : "cursor-pointer"}
                    onMouseEnter={() => !isDragging && setHoveredGap(idx)}
                    onMouseLeave={() => setHoveredGap(null)}
                    onClick={() => !isDragging && handleAddRowAt(idx)}
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
                        <text y={buttonRadius + 20} textAnchor="middle" className="text-[9px] fill-white">Click to insert row</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Direction indicator - on top of animation */}
              <g transform={`translate(${svgCenterX}, ${rowAreaTop + 35})`}>
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
                    y={rowAreaTop + 50}
                    width={wheelWidth}
                    height={wheelHeight}
                    rx={5}
                    fill={hoveredWheel === "front" ? colors.wheelDrag : colors.wheel}
                  />
                  {/* Tooltip on hover */}
                  {hoveredWheel === "front" && (
                    <g transform={`translate(${mmToX(frontWheelMm)}, ${rowAreaTop + 50 + wheelHeight})`}>
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
                    onMouseLeave={() => setHoveredWheel(null)}
                    className="cursor-default"
                  >
                    <rect x={mmToX(leftWheelMm) - wheelWidth/2} y={rowAreaTop + 50} width={wheelWidth} height={wheelHeight} rx={5} fill={hoveredWheel === "frontLeft" ? colors.wheelDrag : colors.wheel} />
                    {/* Tooltip on hover */}
                    {hoveredWheel === "frontLeft" && (
                      <g transform={`translate(${mmToX(leftWheelMm)}, ${rowAreaTop + 50 + wheelHeight})`}>
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
                    onMouseLeave={() => setHoveredWheel(null)}
                    className="cursor-default"
                  >
                    <rect x={mmToX(rightWheelMm) - wheelWidth/2} y={rowAreaTop + 50} width={wheelWidth} height={wheelHeight} rx={5} fill={hoveredWheel === "frontRight" ? colors.wheelDrag : colors.wheel} />
                    {/* Tooltip on hover */}
                    {hoveredWheel === "frontRight" && (
                      <g transform={`translate(${mmToX(rightWheelMm)}, ${rowAreaTop + 50 + wheelHeight})`}>
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
              </g>

              {/* Wheel spacing dimension - positioned below back wheels */}
              <g>
                {/* Dimension line below back wheels */}
                <line x1={mmToX(leftWheelMm)} y1={rowAreaBottom - 55} x2={mmToX(rightWheelMm)} y2={rowAreaBottom - 55} stroke="#78716c" strokeWidth="1.5" />
                {/* Left tick */}
                <line x1={mmToX(leftWheelMm)} y1={rowAreaBottom - 62} x2={mmToX(leftWheelMm)} y2={rowAreaBottom - 48} stroke="#78716c" strokeWidth="1.5" />
                {/* Right tick */}
                <line x1={mmToX(rightWheelMm)} y1={rowAreaBottom - 62} x2={mmToX(rightWheelMm)} y2={rowAreaBottom - 48} stroke="#78716c" strokeWidth="1.5" />
                {/* Label */}
                <text x={svgCenterX} y={rowAreaBottom - 38} textAnchor="middle" className="text-[12px] font-medium fill-stone-600">
                  {config.wheelSpacing / 10} cm
                </text>
              </g>

              {/* ========== TOOLTIP LAYER - renders on top of everything ========== */}


              {/* Back wheel tooltips */}
              {hoveredWheel === "backLeft" && !draggingWheelSide && (
                <g transform={`translate(${mmToX(leftWheelMm)}, ${rowAreaBottom - wheelHeight - 110})`}>
                  <rect x="-40" y="-42" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                  <text y="-28" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                  <text y="-16" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                  <line x1={-wheelWidth/2 + 2} y1="-8" x2={wheelWidth/2 - 2} y2="-8" stroke="white" strokeWidth="1" />
                  <line x1={-wheelWidth/2 + 2} y1="-11" x2={-wheelWidth/2 + 2} y2="-5" stroke="white" strokeWidth="1" />
                  <line x1={wheelWidth/2 - 2} y1="-11" x2={wheelWidth/2 - 2} y2="-5" stroke="white" strokeWidth="1" />
                </g>
              )}
              {hoveredWheel === "backRight" && !draggingWheelSide && (
                <g transform={`translate(${mmToX(rightWheelMm)}, ${rowAreaBottom - wheelHeight - 110})`}>
                  <rect x="-40" y="-42" width="80" height="38" rx="4" fill="#1c1917" fillOpacity="0.95" />
                  <text y="-28" textAnchor="middle" className="text-[10px] fill-white font-medium">Wheel</text>
                  <text y="-16" textAnchor="middle" className="text-[8px] fill-stone-300">17 cm</text>
                  <line x1={-wheelWidth/2 + 2} y1="-8" x2={wheelWidth/2 - 2} y2="-8" stroke="white" strokeWidth="1" />
                  <line x1={-wheelWidth/2 + 2} y1="-11" x2={-wheelWidth/2 + 2} y2="-5" stroke="white" strokeWidth="1" />
                  <line x1={wheelWidth/2 - 2} y1="-11" x2={wheelWidth/2 - 2} y2="-5" stroke="white" strokeWidth="1" />
                </g>
              )}

            </svg>
          </motion.div>
          )}

          {/* Info box - positioned inside bottom right corner */}
          {(() => {
            const speed = calculateRobotSpeed(seedingMode, plantSpacing);
            const workingWidthM = workingWidth / 1000;
            const capacityAt20h = (speed * workingWidthM * 20) / 10000;
            return (
              <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-stone-600 shadow-sm border border-stone-100">
                {speed} m/h · {capacityAt20h.toFixed(2)} ha/day
              </div>
            );
          })()}
        </div>

        {/* Plants per hectare - centered below animation/graph */}
        <div className="flex justify-center mt-3 text-sm text-stone-500 h-6">
          {seedingMode !== "line" ? (() => {
            const rowSpacingM = config.rowDistance / 1000;
            const plantSpacingM = plantSpacing / 100;
            const pointsPerHa = Math.round(10000 / (rowSpacingM * plantSpacingM));
            const seedsPerHa = seedingMode === "group" ? pointsPerHa * seedsPerGroup : pointsPerHa;
            return (
              <>
                {selectedCrop.emoji} <span className="font-medium text-stone-700 mx-1">{seedsPerHa.toLocaleString()}</span> seeds per hectare
              </>
            );
          })() : (
            <span className="text-stone-400">Line seeding - continuous row</span>
          )}
        </div>

          {/* Seeding Controls - Clean aligned layout */}
          <div className="mt-4 space-y-2 max-w-sm mx-auto">
            {/* 1. Seeding Mode */}
            <div className="flex items-center">
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">Mode</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="font-medium">Single:</span> Precision single seeding<br/>
                    <span className="font-medium">Group:</span> Precision group seeding<br/>
                    <span className="font-medium">Line:</span> Continuous line seeding
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center bg-stone-100 rounded-lg p-0.5 w-[168px]">
                  <button
                    onClick={() => setSeedingMode("single")}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      seedingMode === "single"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setSeedingMode("group")}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      seedingMode === "group"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Group
                  </button>
                  <button
                    onClick={() => setSeedingMode("line")}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      seedingMode === "line"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Seeds per Group */}
            <div className={`flex items-center ${seedingMode !== "group" ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">Seeds/Group</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Number of seeds per group when using group seeding mode.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center justify-between w-[168px] bg-stone-100 rounded-lg px-1.5 py-0.5">
                  <button
                    onClick={() => setSeedsPerGroup(Math.max(2, seedsPerGroup - 1))}
                    disabled={seedsPerGroup <= 2 || seedingMode !== "group"}
                    className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold text-stone-900">{seedsPerGroup}</span>
                  <button
                    onClick={() => setSeedsPerGroup(Math.min(15, seedsPerGroup + 1))}
                    disabled={seedsPerGroup >= 15 || seedingMode !== "group"}
                    className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Plant Spacing */}
            <div className={`flex items-center ${seedingMode === "line" ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">Spacing</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Distance between plants along each row. Min 10cm.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center justify-between w-[168px] bg-stone-100 rounded-lg px-1.5 py-0.5">
                  <button
                    onClick={() => setPlantSpacing(Math.max(10, plantSpacing - 1))}
                    disabled={plantSpacing <= 10 || seedingMode === "line"}
                    className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold text-stone-900">{plantSpacing} cm</span>
                  <button
                    onClick={() => setPlantSpacing(Math.min(40, plantSpacing + 1))}
                    disabled={plantSpacing >= 40 || seedingMode === "line"}
                    className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Seeding Pattern */}
            <div className={`flex items-center ${seedingMode === "line" ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-1.5 w-28">
                <span className="text-xs text-stone-500">Pattern</span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-stone-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Grid or diamond formation for optimal plant spacing.
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
                    Grid
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
                    Diamond
                  </button>
                </div>
              </div>
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
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 tracking-tight">+Seed Configuration</h1>
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
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-xs text-teal-600">{totalPassiveRows} passive rows</span>
              <span className="text-xs text-teal-500">{totalPassiveRows > 0 ? "included" : "–"}</span>
            </div>
          </div>
        )}

        {/* Adjustments */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          {/* Active Rows */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-stone-600 font-medium">Rows</span>
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
            <div className="flex items-center justify-between w-[120px] bg-stone-100 rounded-lg px-1.5 py-0.5">
              <button
                onClick={() => {
                  const decrement = is3Wheel && config.activeRows % 2 !== 0 ? 1 : (is3Wheel ? 2 : 1);
                  handleSetRowCount(config.activeRows - decrement);
                }}
                disabled={config.activeRows <= 0}
                className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
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
                className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Row Spacing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-stone-600 font-medium">Spacing</span>
              <span className={`text-[10px] text-amber-500 flex items-center gap-0.5 transition-opacity ${hasCustomSpacings ? "opacity-100" : "opacity-0"}`}>
                <AlertCircle className="h-2.5 w-2.5" />
                resets custom
              </span>
            </div>
            <div className="flex items-center justify-between w-[120px] bg-stone-100 rounded-lg px-1.5 py-0.5">
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
                className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-semibold text-stone-900">{config.rowDistance / 10}cm</span>
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
                className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Wheel Spacing */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600 font-medium">Wheel Spacing</span>
            <div className="flex items-center justify-between w-[120px] bg-stone-100 rounded-lg px-1.5 py-0.5">
              <button
                onClick={() => updateConfig({ wheelSpacing: Math.max(WHEEL_CONSTRAINTS.minWheelSpacing, config.wheelSpacing - 100) })}
                disabled={config.wheelSpacing <= WHEEL_CONSTRAINTS.minWheelSpacing}
                className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-semibold text-stone-900">{config.wheelSpacing / 10}cm</span>
              <button
                onClick={() => updateConfig({ wheelSpacing: Math.min(WHEEL_CONSTRAINTS.maxWheelSpacing, config.wheelSpacing + 100) })}
                disabled={config.wheelSpacing >= WHEEL_CONSTRAINTS.maxWheelSpacing}
                className="h-7 w-7 rounded-md bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-600 transition-all flex items-center justify-center shadow-sm"
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
                <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-teal-50 border border-teal-200">
                  <Check className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                  <span className="text-xs text-teal-700">Optimal wheel spacing for this row config</span>
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
                  Suggested: <strong>{optimal.spacing / 10}cm</strong> — wheels centered between rows
                </span>
              </button>
            );
          })()}

          {/* Working Width */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600 font-medium">Working Width</span>
            <span className="text-base font-semibold text-stone-900">{(workingWidth / 10).toFixed(0)}cm</span>
          </div>

        </div>

        {/* Crop Selection */}
        <div className="pt-3 border-t border-stone-100">
          <p className="text-xs font-medium text-stone-500 mb-2">Crop Type</p>
          <div className={`flex flex-wrap gap-1.5 ${seedingMode === "line" ? "opacity-40 pointer-events-none" : ""}`}>
            {cropTypes.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                disabled={seedingMode === "line"}
                className={`w-9 h-9 rounded-lg text-lg transition-all flex items-center justify-center ${
                  selectedCrop.id === crop.id
                    ? "bg-teal-50 border-2 border-teal-300 scale-105"
                    : "bg-stone-100 hover:bg-stone-200 border-2 border-transparent"
                }`}
                title={crop.name}
              >
                {crop.emoji}
              </button>
            ))}
          </div>

          {/* Selected crop info & apply button */}
          <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">{selectedCrop.emoji} {selectedCrop.name}</span>
            </div>
            <div className="text-xs text-stone-500 space-y-0.5 mb-2.5">
              <div className="flex justify-between">
                <span>Rows</span>
                <span className="text-stone-700">{selectedCrop.rows}</span>
              </div>
              <div className="flex justify-between">
                <span>Row spacing</span>
                <span className="text-stone-700">{selectedCrop.rowDistance / 10}cm</span>
              </div>
              <div className="flex justify-between">
                <span>Plant spacing</span>
                <span className="text-stone-700">{selectedCrop.plantSpacing}cm</span>
              </div>
              <div className="flex justify-between">
                <span>Seed size</span>
                <span className="text-stone-700">{selectedCrop.seedSize}</span>
              </div>
            </div>
            <button
              onClick={() => applyCropConfig(selectedCrop)}
              disabled={seedingMode === "line"}
              className="w-full py-1.5 px-3 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
            >
              Apply {selectedCrop.name} Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
