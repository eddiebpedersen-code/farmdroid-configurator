"use client";

import { useState } from "react";
import { SeedingMode, calculateRobotSpeed } from "@/lib/configurator-data";

// Daily Capacity Graph Component - Large version for main view
export function CapacityGraphLarge({
  seedingMode,
  plantSpacing,
  workingWidth,
}: {
  seedingMode: SeedingMode;
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
