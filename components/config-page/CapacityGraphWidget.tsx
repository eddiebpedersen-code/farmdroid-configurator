"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ConfigPageData } from "@/lib/config-page-types";
import { calculateRobotSpeed } from "@/lib/configurator-data";

interface CapacityGraphWidgetProps {
  data: ConfigPageData;
  className?: string;
}

export function CapacityGraphWidget({ data, className = "" }: CapacityGraphWidgetProps) {
  const t = useTranslations("configPage");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const { config } = data;

  // Use saved values from config (with fallbacks for backward compatibility)
  const workingWidth = config.workingWidth ?? 2000;
  const seedingMode = config.seedingMode ?? "single";
  const plantSpacing = config.plantSpacing ?? 18;
  const speed = calculateRobotSpeed(seedingMode, plantSpacing);
  const workingWidthM = workingWidth / 1000;

  // Generate data points for 12-24 hours
  const dataPoints: { hours: number; capacity: number }[] = [];
  for (let hours = 12; hours <= 24; hours += 2) {
    const capacity = (speed * workingWidthM * hours) / 10000;
    dataPoints.push({ hours, capacity });
  }

  // Dynamic Y-axis maximum based on max capacity (rounded up to nearest 2)
  const maxCapacityValue = Math.max(...dataPoints.map(p => p.capacity));
  const maxCapacity = Math.ceil(maxCapacityValue / 2) * 2 + 2;

  // SVG dimensions - compact version
  const width = 600;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
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

  // Y-axis labels
  const yLabels: number[] = [];
  for (let i = 0; i <= maxCapacity; i += 2) {
    yLabels.push(i);
  }

  // X-axis labels
  const xLabels = [12, 14, 16, 18, 20, 22, 24];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className={`bg-white rounded-xl border border-stone-200 overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900">{t("capacityGraph.title")}</h2>
        <p className="text-sm text-stone-500 mt-1">{t("capacityGraph.subtitle")}</p>
      </div>

      <div className="p-4 md:p-6">
        <div className="bg-stone-50 rounded-xl p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
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
                strokeDasharray="4,4"
                opacity="0.5"
              />
            ))}

            {/* Filled area under line */}
            <path d={areaPath} fill="#0d9488" fillOpacity="0.15" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#0d9488"
              strokeWidth="3"
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
                    r="20"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Visible point */}
                  <circle
                    cx={xScale(p.hours)}
                    cy={yScale(p.capacity)}
                    r={isHovered ? 8 : 6}
                    fill={isHovered ? "#059669" : "#0d9488"}
                    stroke="white"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150"
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={xScale(p.hours) - 55}
                        y={yScale(p.capacity) - 52}
                        width="110"
                        height="42"
                        rx="6"
                        fill="#1c1917"
                        fillOpacity="0.95"
                      />
                      <text
                        x={xScale(p.hours)}
                        y={yScale(p.capacity) - 32}
                        textAnchor="middle"
                        className="text-[14px] fill-white font-medium"
                      >
                        {p.capacity.toFixed(1)} ha/{t("capacityGraph.day")}
                      </text>
                      <text
                        x={xScale(p.hours)}
                        y={yScale(p.capacity) - 16}
                        textAnchor="middle"
                        className="text-[12px] fill-stone-400"
                      >
                        {t("capacityGraph.at")} {p.hours}h/{t("capacityGraph.day")}
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
                x={padding.left - 10}
                y={yScale(y) + 5}
                textAnchor="end"
                className="text-[14px] fill-stone-500"
              >
                {y}
              </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((h) => (
              <text
                key={h}
                x={xScale(h)}
                y={height - padding.bottom + 22}
                textAnchor="middle"
                className="text-[14px] fill-stone-500"
              >
                {h}h
              </text>
            ))}

            {/* Y-axis title */}
            <text
              x={16}
              y={height / 2}
              textAnchor="middle"
              transform={`rotate(-90, 16, ${height / 2})`}
              className="text-[13px] fill-stone-500 font-medium"
            >
              {t("capacityGraph.yAxis")}
            </text>

            {/* X-axis title */}
            <text
              x={width / 2}
              y={height - 8}
              textAnchor="middle"
              className="text-[13px] fill-stone-500 font-medium"
            >
              {t("capacityGraph.xAxis")}
            </text>
          </svg>
        </div>

        {/* Legend / Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-600"></div>
            <span>{t("capacityGraph.workingWidth")}: {(workingWidth / 10).toFixed(0)} cm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-teal-600"></div>
            <span>{t("capacityGraph.estimatedCapacity")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
