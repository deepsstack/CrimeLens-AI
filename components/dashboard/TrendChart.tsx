/**
 * components/dashboard/TrendChart.tsx
 *
 * Multi-line SVG trend chart for the CrimeLens AI Dashboard.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Svg, { Polyline, Line, Text as SvgText } from "react-native-svg";

import mockData, { TrendPoint } from "../../data/mockData";
import { T, Lang } from "../../i18n/dashboardTranslations";
import { computeTrendPolyline } from "../../utils/dashboardUtils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TrendChartProps = {
  lang: Lang;
};

type Period = "weekly" | "monthly" | "yearly";

// ── Constants ─────────────────────────────────────────────────────────────────

const SERIES_CONFIG: Array<{
  key: keyof Omit<TrendPoint, "label">;
  color: string;
  labelKey: "trendTheft" | "trendAssault" | "trendCyber" | "trendDrug";
}> = [
  { key: "theft",   color: "#EF4444", labelKey: "trendTheft"   },
  { key: "assault", color: "#F59E0B", labelKey: "trendAssault"  },
  { key: "cyber",   color: "#06B6D4", labelKey: "trendCyber"    },
  { key: "drug",    color: "#10B981", labelKey: "trendDrug"     },
];

// Y-axis label count (inclusive of 0 and max)
const Y_TICK_COUNT = 5;

// Chart drawing area insets (space reserved for axes / labels)
const CHART_PADDING = { top: 12, right: 12, bottom: 32, left: 44 };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive the overall max value across all four series for a given period. */
function getMaxValue(points: TrendPoint[]): number {
  let max = 0;
  for (const pt of points) {
    if (pt.theft   > max) max = pt.theft;
    if (pt.assault > max) max = pt.assault;
    if (pt.cyber   > max) max = pt.cyber;
    if (pt.drug    > max) max = pt.drug;
  }
  return max;
}

/**
 * Generate Y-axis tick values between 0 and max, evenly spaced.
 * Returns an array of Y_TICK_COUNT numbers.
 */
function buildYTicks(max: number): number[] {
  if (max === 0) {
    return Array.from({ length: Y_TICK_COUNT }, () => 0);
  }
  const step = max / (Y_TICK_COUNT - 1);
  return Array.from({ length: Y_TICK_COUNT }, (_, i) =>
    Math.round(step * i)
  );
}

/**
 * Map a data value to a Y pixel coordinate within the chart drawing area.
 * 0 → bottom (chartH), max → top (0).
 */
function valueToY(value: number, max: number, chartH: number): number {
  if (max === 0) return chartH / 2;
  return chartH - (value / max) * chartH;
}

// ── TrendChart ────────────────────────────────────────────────────────────────

export function TrendChart({ lang }: TrendChartProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const { width: screenWidth } = useWindowDimensions();

  const t = T[lang];
  const points = mockData.trendData[period];

  // SVG container dimensions derived from screen width
  const svgWidth  = screenWidth - 32 - 32; // card horizontal margin + padding
  const svgHeight = 200;

  // Drawing area (inside axes)
  const chartW = svgWidth  - CHART_PADDING.left - CHART_PADDING.right;
  const chartH = svgHeight - CHART_PADDING.top  - CHART_PADDING.bottom;

  const maxVal = getMaxValue(points);
  const yTicks = buildYTicks(maxVal);

  // Period toggle config
  const PERIODS: Array<{ value: Period; label: string }> = [
    { value: "weekly",  label: t.trendWeekly  },
    { value: "monthly", label: t.trendMonthly },
    { value: "yearly",  label: t.trendYearly  },
  ];

  return (
    <View style={styles.card}>
      {/* ── Card title ── */}
      <Text style={styles.cardTitle}>{t.trendTitle}</Text>

      {/* ── Period toggle buttons ── */}
      <View style={styles.toggleRow}>
        {PERIODS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.toggleBtn,
              period === value && styles.toggleBtnActive,
            ]}
            onPress={() => setPeriod(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: period === value }}
          >
            <Text
              style={[
                styles.toggleBtnText,
                period === value && styles.toggleBtnTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── SVG Chart ── */}
      <View style={styles.chartContainer}>
        <Svg width={svgWidth} height={svgHeight}>
          {/* Y-axis grid lines and labels */}
          {yTicks.map((tick, i) => {
            const y = CHART_PADDING.top + valueToY(tick, maxVal, chartH);
            return (
              <React.Fragment key={`ytick-${i}`}>
                {/* Horizontal grid line */}
                <Line
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={CHART_PADDING.left + chartW}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                  strokeDasharray={i === 0 ? undefined : "4,3"}
                />
                {/* Y-axis label */}
                <SvgText
                  x={CHART_PADDING.left - 6}
                  y={y + 4}
                  fontSize={9}
                  fontFamily="Inter-Regular"
                  fill="#94A3B8"
                  textAnchor="end"
                >
                  {tick >= 1000
                    ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k`
                    : String(tick)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* X-axis baseline */}
          <Line
            x1={CHART_PADDING.left}
            y1={CHART_PADDING.top + chartH}
            x2={CHART_PADDING.left + chartW}
            y2={CHART_PADDING.top + chartH}
            stroke="#CBD5E1"
            strokeWidth={1}
          />

          {/* X-axis labels */}
          {points.map((pt, i) => {
            const x =
              CHART_PADDING.left +
              (points.length === 1
                ? chartW / 2
                : (i / (points.length - 1)) * chartW);
            return (
              <SvgText
                key={`xlabel-${i}`}
                x={x}
                y={svgHeight - 6}
                fontSize={9}
                fontFamily="Inter-Regular"
                fill="#94A3B8"
                textAnchor="middle"
              >
                {pt.label}
              </SvgText>
            );
          })}

          {/* Data polylines — one per series */}
          {SERIES_CONFIG.map(({ key, color }) => {
            // computeTrendPolyline returns coords relative to [0, chartW] × [0, chartH]
            // We need to offset them by CHART_PADDING.left / top
            const rawPoints = computeTrendPolyline(points, key, chartW, chartH);
            if (!rawPoints) return null;

            // Shift each coordinate by the chart offset
            const shiftedPoints = rawPoints
              .split(" ")
              .map((pair) => {
                const [px, py] = pair.split(",").map(Number);
                return `${px + CHART_PADDING.left},${py + CHART_PADDING.top}`;
              })
              .join(" ");

            return (
              <Polyline
                key={key}
                points={shiftedPoints}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </Svg>
      </View>

      {/* ── Legend row ── */}
      <View style={styles.legendRow}>
        {SERIES_CONFIG.map(({ key, color, labelKey }) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{t[labelKey]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Requirement 6.5 — enterprise card design
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  // Card title
  cardTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 12,
    lineHeight: 20,
  },

  // Period toggle row (Requirement 6.2)
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  toggleBtnActive: {
    backgroundColor: "#0F4C81", // Police Blue
  },
  toggleBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#475569",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },

  // Chart SVG wrapper
  chartContainer: {
    overflow: "hidden",
  },

  // Legend row (Requirement 6.4)
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
});
