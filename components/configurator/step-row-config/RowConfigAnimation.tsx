"use client";

import { useState } from "react";
import { ConfiguratorState, SeedingMode, SeedSize, generateRowSpacings, calculateRobotSpeed, calculateBetweenPassSpacing, getWheelConfig, calculateDailyCapacity } from "@/lib/configurator-data";
import { CropIcon } from "./CropIcon";
import { SeedingUnit } from "./SeedingUnit";
import { WheelTrack } from "./WheelTrack";
import { TractorWheel } from "./TractorWheel";

interface RowConfigAnimationProps {
  config: ConfiguratorState;
  seedingMode?: SeedingMode;
  plantSpacing?: number;
  seedsPerGroup?: number;
  workingWidth?: number;
  cropEmoji?: string;
  isReadOnly?: boolean;
  isStatic?: boolean; // When true, renders as a static screenshot (no animation, no controls)
  useInches?: boolean;
  className?: string;
}

/**
 * Reusable 2D row configuration visualization component.
 * Can be used in both the configurator (interactive) and config page (static snapshot).
 */
export function RowConfigAnimation({
  config,
  seedingMode: seedingModeProp,
  plantSpacing: plantSpacingProp,
  seedsPerGroup: seedsPerGroupProp,
  workingWidth: workingWidthProp,
  cropEmoji = "🌱",
  isReadOnly = true,
  isStatic = false,
  useInches = false,
  className = "",
}: RowConfigAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  // Unit conversion helpers
  const MM_PER_INCH = 25.4;
  const unitLabel = useInches ? "in" : "cm";
  const mmToDisplay = (mm: number, decimals = 1): string => {
    if (useInches) return (mm / MM_PER_INCH).toFixed(decimals);
    return (mm / 10).toFixed(decimals);
  };
  // When isStatic is true, never animate regardless of play state
  const isAnimating = !isStatic && isPlaying;

  // Use props or fall back to config values
  const seedingMode = seedingModeProp ?? config.seedingMode ?? "single";
  const plantSpacing = plantSpacingProp ?? config.plantSpacing ?? 18;
  const seedsPerGroup = seedsPerGroupProp ?? config.seedsPerGroup ?? 1;

  // Get row spacings
  const rowSpacings = config.rowSpacings?.length === config.activeRows - 1
    ? config.rowSpacings
    : generateRowSpacings(config.activeRows, config.rowDistance);

  // Calculate row span and positions
  const rowSpan = rowSpacings.reduce((sum, s) => sum + s, 0);
  const rowPositionsMm: number[] = [];
  let pos = -rowSpan / 2;
  for (let i = 0; i < config.activeRows; i++) {
    rowPositionsMm.push(pos);
    if (i < rowSpacings.length) pos += rowSpacings[i];
  }

  // Working width
  const calculatedBetweenPass = calculateBetweenPassSpacing(rowSpacings, config.rowDistance);
  const workingWidth = workingWidthProp ?? config.workingWidth ?? (rowSpan + calculatedBetweenPass);

  // Previous pass row positions
  const previousPassRowsMm = rowPositionsMm.map(mm => mm - workingWidth);

  // Wheel positions
  const leftWheelMm = -config.wheelSpacing / 2;
  const rightWheelMm = config.wheelSpacing / 2;

  // Wheel configuration
  const wheelConfig = getWheelConfig(config.frontWheel);
  const is3Wheel = wheelConfig === "3-wheel";
  const frontWheelMm = is3Wheel ? 0 : null; // Center position for 3-wheel

  // SVG dimensions - match exactly with step-row-config.tsx
  const svgWidth = 990;
  const svgHeight = 594;
  const margin = { left: 0, right: 0 };
  const rowAreaTop = 80;
  const rowAreaBottom = svgHeight;

  // Fixed scale for mm to px conversion - match step-row-config.tsx
  const pxPerMm = 0.22;
  const svgCenterX = svgWidth / 2;

  const mmToX = (mm: number) => svgCenterX + mm * pxPerMm;

  // Passive row calculation
  const passiveMinSpacing = 225;
  const passiveThreshold = 450;
  const getPassiveRowsInGap = (spacing: number): number => {
    if (spacing < passiveThreshold) return 0;
    return Math.floor(spacing / passiveMinSpacing) - 1;
  };

  // Calculate passive row positions
  const passiveRowPositions: number[] = [];
  for (let i = 0; i < rowSpacings.length; i++) {
    const spacing = rowSpacings[i];
    const passiveCount = getPassiveRowsInGap(spacing);
    if (passiveCount > 0) {
      const leftRowMm = rowPositionsMm[i];
      const passiveSpacing = spacing / (passiveCount + 1);
      for (let j = 1; j <= passiveCount; j++) {
        passiveRowPositions.push(leftRowMm + j * passiveSpacing);
      }
    }
  }

  const innerPassiveCount = rowSpacings.reduce((sum, s) => sum + getPassiveRowsInGap(s), 0);
  const hasAnyPassive = innerPassiveCount > 0;
  const rightOuterPassiveMm = hasAnyPassive
    ? rowPositionsMm[rowPositionsMm.length - 1] + config.rowDistance / 2
    : null;

  // Animation parameters
  const robotSpeed = calculateRobotSpeed(seedingMode, plantSpacing);

  // Colors
  const colors = {
    activeRow: "#0d9488",
    activeRowHover: "#0f766e",
    passiveRow: "#94a3b8",
  };

  // Wheel dimensions
  const wheelWidth = 26;
  const wheelHeight = 84;

  // Crop animation parameters
  const cropSpacingPx = plantSpacing * 3.5;
  const cropsStartY = (rowAreaTop + rowAreaBottom) / 2 + 38;
  const cropsEndY = rowAreaBottom;
  const visibleHeight = cropsEndY - cropsStartY;
  const numCropRows = Math.ceil(visibleHeight / cropSpacingPx) + 3;

  const fullFieldHeight = rowAreaBottom - rowAreaTop;
  const fullFieldNumRows = Math.ceil(fullFieldHeight / cropSpacingPx) + 3;
  const gridAlignOffset = ((cropsStartY - rowAreaTop) % cropSpacingPx + cropSpacingPx) % cropSpacingPx;
  const prevPassStartY = rowAreaTop + gridAlignOffset - cropSpacingPx;

  const animDuration = cropSpacingPx / (robotSpeed / 20);
  const soilDuration = 800 / robotSpeed;

  // Visible previous pass rows - only show rows that would be visible within the field area
  // Field extends from x=0 to x=svgWidth, so minimum visible mm is calculated from leftmost pixel
  const visibleMinMm = (margin.left - svgCenterX) / pxPerMm;
  const visibleMaxMm = (svgWidth - margin.right - svgCenterX) / pxPerMm;
  const visiblePrevPassRows = previousPassRowsMm.filter(mm => mm >= visibleMinMm && mm <= visibleMaxMm);

  // Group patterns
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

  // Front and back wheel Y positions - match step-row-config.tsx
  const frontWheelY = 105;
  const backWheelY = rowAreaBottom - wheelHeight - 60;

  // For static mode, crop the top whitespace by adjusting viewBox
  const viewBoxY = isStatic ? 85 : 0;
  const viewBoxHeight = isStatic ? svgHeight - 85 : svgHeight;

  return (
    <div className={`relative ${className}`} style={{ overflow: "hidden" }}>
      <svg
        viewBox={`0 ${viewBoxY} ${svgWidth} ${viewBoxHeight}`}
        className="w-full h-full"
        style={{ overflow: "hidden" }}
      >
        {/* Background */}
        <rect
          x={margin.left}
          y={rowAreaTop}
          width={svgWidth - margin.left - margin.right}
          height={rowAreaBottom - rowAreaTop}
          fill="#f5f5f4"
          rx="6"
        />

        {/* Clip paths */}
        <defs>
          <clipPath id="animRowAreaClip">
            <rect x={margin.left} y={rowAreaTop} width={svgWidth - margin.left - margin.right} height={rowAreaBottom - rowAreaTop} rx="6" />
          </clipPath>
          <clipPath id="animCropsClip">
            <rect x={margin.left} y={(rowAreaTop + rowAreaBottom) / 2 + 38} width={svgWidth - margin.left - margin.right} height={(rowAreaBottom - rowAreaTop) / 2 - 15} rx="6" />
          </clipPath>
          {/* Strict clip for previous pass elements - ensures nothing renders outside field */}
          <clipPath id="animFieldClip">
            <rect x={margin.left} y={rowAreaTop} width={svgWidth - margin.left - margin.right} height={rowAreaBottom - rowAreaTop} />
          </clipPath>
        </defs>

        {/* Animated soil texture */}
        <g clipPath="url(#animRowAreaClip)" style={{ pointerEvents: "none" }}>
          <g style={{ animation: isAnimating ? `soilScroll ${soilDuration.toFixed(2)}s linear infinite` : "none" }}>
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
          <style>{`
            @keyframes soilScroll { from { transform: translateY(0); } to { transform: translateY(40px); } }
            @keyframes cropScroll { from { transform: translateY(0); } to { transform: translateY(${cropSpacingPx}px); } }
            @keyframes lineScroll { from { transform: translateY(0); } to { transform: translateY(${3 * 3.5}px); } }
          `}</style>
        </g>

        {/* Animated crops */}
        {config.activeRows > 0 && (
          <g clipPath="url(#animRowAreaClip)" style={{ pointerEvents: "none" }}>
            {seedingMode === "line" ? (
              <>
                {/* Line mode - previous pass */}
                {visiblePrevPassRows.length > 0 && (
                  <g style={{ animation: isAnimating ? `lineScroll ${(3 * 3.5) / (robotSpeed / 20)}s linear infinite` : "none" }}>
                    {Array.from({ length: Math.ceil(fullFieldHeight / (3 * 3.5)) + 3 }).map((_, rowIdx) => {
                      const lineStartY = rowAreaTop + (((cropsStartY - rowAreaTop) % (3 * 3.5) + (3 * 3.5)) % (3 * 3.5)) - (3 * 3.5);
                      const baseY = lineStartY + rowIdx * (3 * 3.5);
                      return visiblePrevPassRows.map((rowMm, colIdx) => (
                        <g key={`prev-line-${rowIdx}-${colIdx}`} transform={`translate(${mmToX(rowMm)}, ${baseY}) scale(0.6)`} opacity={0.35}>
                          <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                        </g>
                      ));
                    })}
                  </g>
                )}
                {/* Line mode - current pass */}
                <g clipPath="url(#animCropsClip)">
                  <g style={{ animation: isAnimating ? `lineScroll ${(3 * 3.5) / (robotSpeed / 20)}s linear infinite` : "none" }}>
                    {Array.from({ length: Math.ceil(visibleHeight / (3 * 3.5)) + 3 }).map((_, rowIdx) => {
                      const baseY = cropsStartY - (3 * 3.5) + rowIdx * (3 * 3.5);
                      return rowPositionsMm.map((rowMm, colIdx) => (
                        <g key={`line-${rowIdx}-${colIdx}`} transform={`translate(${mmToX(rowMm)}, ${baseY}) scale(0.6)`} opacity={1}>
                          <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                        </g>
                      ));
                    })}
                  </g>
                </g>
              </>
            ) : (
              <>
                {/* Single/Group mode - previous pass */}
                {visiblePrevPassRows.length > 0 && (
                  <g style={{ animation: isAnimating ? `cropScroll ${animDuration}s linear infinite` : "none" }}>
                    {Array.from({ length: fullFieldNumRows }).map((_, rowIdx) => {
                      const baseY = prevPassStartY + rowIdx * cropSpacingPx;
                      return visiblePrevPassRows.map((rowMm, colIdx) => {
                        const x = mmToX(rowMm);
                        if (seedingMode === "group") {
                          return (
                            <g key={`prev-crop-${rowIdx}-${colIdx}`} transform={`translate(${x}, ${baseY})`} opacity={0.35}>
                              {groupOffsets.map((offset, i) => (
                                <g key={i} transform={`translate(${offset.dx}, ${offset.dy}) scale(${groupScale})`}>
                                  <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                                </g>
                              ))}
                            </g>
                          );
                        }
                        return (
                          <g key={`prev-crop-${rowIdx}-${colIdx}`} transform={`translate(${x}, ${baseY}) scale(0.7)`} opacity={0.35}>
                            <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                          </g>
                        );
                      });
                    })}
                  </g>
                )}
                {/* Single/Group mode - current pass */}
                <g clipPath="url(#animCropsClip)">
                  <g style={{ animation: isAnimating ? `cropScroll ${animDuration}s linear infinite` : "none" }}>
                    {Array.from({ length: numCropRows }).map((_, rowIdx) => {
                      const baseY = cropsStartY - cropSpacingPx + rowIdx * cropSpacingPx;
                      return rowPositionsMm.map((rowMm, colIdx) => {
                        const x = mmToX(rowMm);
                        if (seedingMode === "group") {
                          return (
                            <g key={`crop-${rowIdx}-${colIdx}`} transform={`translate(${x}, ${baseY})`} opacity={1}>
                              {groupOffsets.map((offset, i) => (
                                <g key={i} transform={`translate(${offset.dx}, ${offset.dy}) scale(${groupScale})`}>
                                  <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                                </g>
                              ))}
                            </g>
                          );
                        }
                        return (
                          <g key={`crop-${rowIdx}-${colIdx}`} transform={`translate(${x}, ${baseY}) scale(0.7)`} opacity={1}>
                            <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                          </g>
                        );
                      });
                    })}
                  </g>
                </g>
              </>
            )}
          </g>
        )}

        {/* Legend - match step-row-config.tsx exactly */}
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
                {[0, 7, 14, 21].map((xPos, i) => (
                  <g key={i} transform={`translate(${xPos}, 0) scale(0.45)`}>
                    <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                  </g>
                ))}
              </g>
              <text x="28" y="52" className="text-[10px] fill-stone-600">Seed line</text>
            </>
          ) : seedingMode === "group" ? (
            <>
              <g transform="translate(10, 48)">
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
                      <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
                    </g>
                  ));
                })()}
              </g>
              <text x="28" y="52" className="text-[10px] fill-stone-600">Portion</text>
            </>
          ) : (
            <>
              <g transform="translate(10, 48)">
                <CropIcon seedSize={config.seedSize} emoji={cropEmoji} />
              </g>
              <text x="28" y="52" className="text-[10px] fill-stone-600">Crop</text>
            </>
          )}
        </g>

        {/* Pause button - only show when not static */}
        {!isStatic && (
          <g
            transform={`translate(${svgWidth - margin.right - 45}, ${rowAreaTop + 25})`}
            className="cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <rect x="-18" y="-18" width="36" height="36" rx="18" fill="white" fillOpacity="0.95" stroke="#d6d3d1" strokeWidth="1.5" />
            {isPlaying ? (
              <>
                <rect x="-6" y="-8" width="4" height="16" rx="1" fill="#78716c" />
                <rect x="2" y="-8" width="4" height="16" rx="1" fill="#78716c" />
              </>
            ) : (
              <polygon points="-4,-8 -4,8 8,0" fill="#78716c" />
            )}
          </g>
        )}

        {/* Spacing labels */}
        {rowSpacings.map((spacing, idx) => {
          const leftX = mmToX(rowPositionsMm[idx]);
          const rightX = mmToX(rowPositionsMm[idx + 1]);
          const midX = (leftX + rightX) / 2;
          const gapPx = rightX - leftX;
          if (gapPx < 40) return null;
          const spacingY = rowAreaTop + 135;
          return (
            <g key={`spacing-label-${idx}`}>
              <line x1={leftX} y1={spacingY - 7} x2={leftX} y2={spacingY + 7} stroke="#78716c" strokeWidth="1.5" />
              <line x1={leftX} y1={spacingY} x2={rightX} y2={spacingY} stroke="#78716c" strokeWidth="1.5" />
              <line x1={rightX} y1={spacingY - 7} x2={rightX} y2={spacingY + 7} stroke="#78716c" strokeWidth="1.5" />
              <text x={midX} y={spacingY - 12} textAnchor="middle" className="text-[12px] font-medium fill-stone-600">
                {mmToDisplay(spacing)} {unitLabel}
              </text>
            </g>
          );
        })}

        {/* Wheel tracks */}
        {(() => {
          const frontTrackStartY = frontWheelY + wheelHeight;
          const frontTrackLength = rowAreaBottom - frontTrackStartY + 20;
          const backTrackStartY = backWheelY + wheelHeight;
          const backTrackLength = rowAreaBottom - backTrackStartY + 20;
          return (
            <g>
              {is3Wheel && frontWheelMm !== null ? (
                <WheelTrack x={mmToX(frontWheelMm) - wheelWidth/2} y={frontTrackStartY} width={wheelWidth} trackLength={frontTrackLength} isAnimating={isAnimating} robotSpeed={robotSpeed} id="anim-front-center" />
              ) : (
                <>
                  <WheelTrack x={mmToX(leftWheelMm) - wheelWidth/2} y={frontTrackStartY} width={wheelWidth} trackLength={frontTrackLength} isAnimating={isAnimating} robotSpeed={robotSpeed} id="anim-front-left" />
                  <WheelTrack x={mmToX(rightWheelMm) - wheelWidth/2} y={frontTrackStartY} width={wheelWidth} trackLength={frontTrackLength} isAnimating={isAnimating} robotSpeed={robotSpeed} id="anim-front-right" />
                </>
              )}
              <WheelTrack x={mmToX(leftWheelMm) - wheelWidth/2} y={backTrackStartY} width={wheelWidth} trackLength={backTrackLength} isAnimating={isAnimating} robotSpeed={robotSpeed} id="anim-back-left" />
              <WheelTrack x={mmToX(rightWheelMm) - wheelWidth/2} y={backTrackStartY} width={wheelWidth} trackLength={backTrackLength} isAnimating={isAnimating} robotSpeed={robotSpeed} id="anim-back-right" />
            </g>
          );
        })()}

        {/* Toolbeam and seeding units */}
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
            {rowPositionsMm.map((rowMm, idx) => (
              <g key={`seeding-unit-${idx}`} transform={`translate(${mmToX(rowMm)}, ${(rowAreaTop + rowAreaBottom) / 2 - 35})`}>
                <SeedingUnit seedSize={config.seedSize} />
              </g>
            ))}
          </g>
        )}

        {/* Active row badges */}
        {rowPositionsMm.map((rowMm, idx) => (
          <g key={`row-badge-${idx}`} transform={`translate(${mmToX(rowMm)}, ${(rowAreaTop + rowAreaBottom) / 2 - 75})`}>
            <circle r={14} fill={colors.activeRow} />
            <text y="5" textAnchor="middle" className="text-[12px] fill-white font-semibold">{idx + 1}</text>
          </g>
        ))}

        {/* Passive row lines */}
        {/* Passive rows - match step-row-config.tsx: from rowAreaTop to rowAreaBottom */}
        {passiveRowPositions.map((mm, idx) => (
          <line key={`passive-${idx}`} x1={mmToX(mm)} y1={rowAreaTop} x2={mmToX(mm)} y2={rowAreaBottom} stroke={colors.passiveRow} strokeWidth={1.5} strokeDasharray="8,5" />
        ))}
        {rightOuterPassiveMm && (
          <line x1={mmToX(rightOuterPassiveMm)} y1={rowAreaTop} x2={mmToX(rightOuterPassiveMm)} y2={rowAreaBottom} stroke={colors.passiveRow} strokeWidth={1.5} strokeDasharray="8,5" />
        )}

        {/* Wheels */}
        {is3Wheel && frontWheelMm !== null && (
          <g transform={`translate(${mmToX(frontWheelMm) - wheelWidth/2}, ${frontWheelY})`}>
            <TractorWheel width={wheelWidth} height={wheelHeight} isAnimating={isAnimating} robotSpeed={robotSpeed} />
          </g>
        )}
        {!is3Wheel && (
          <>
            <g transform={`translate(${mmToX(leftWheelMm) - wheelWidth/2}, ${frontWheelY})`}>
              <TractorWheel width={wheelWidth} height={wheelHeight} isAnimating={isAnimating} robotSpeed={robotSpeed} />
            </g>
            <g transform={`translate(${mmToX(rightWheelMm) - wheelWidth/2}, ${frontWheelY})`}>
              <TractorWheel width={wheelWidth} height={wheelHeight} isAnimating={isAnimating} robotSpeed={robotSpeed} />
            </g>
          </>
        )}
        <g transform={`translate(${mmToX(leftWheelMm) - wheelWidth/2}, ${backWheelY})`}>
          <TractorWheel width={wheelWidth} height={wheelHeight} isAnimating={isAnimating} robotSpeed={robotSpeed} />
        </g>
        <g transform={`translate(${mmToX(rightWheelMm) - wheelWidth/2}, ${backWheelY})`}>
          <TractorWheel width={wheelWidth} height={wheelHeight} isAnimating={isAnimating} robotSpeed={robotSpeed} />
        </g>

      </svg>

      {/* Info box - positioned inside bottom right corner like step-row-config.tsx */}
      {(() => {
        const maxCapacity = calculateDailyCapacity(robotSpeed, workingWidth, 24);
        return (
          <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-stone-600 shadow-sm border border-stone-100">
            {robotSpeed} m/h · up to {maxCapacity.toFixed(2)} ha/day
          </div>
        );
      })()}
    </div>
  );
}
