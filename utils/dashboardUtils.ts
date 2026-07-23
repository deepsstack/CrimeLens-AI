/**
 * utils/dashboardUtils.ts
 * Pure helper functions for the CrimeLens AI Dashboard.
 *
 * Requirements covered: 4.3, 4.4, 10.3, 2.3, 9.1, 6.1
 */

import type { Priority, TrendPoint } from "../data/mockData";

// Re-export Tab type (matches BottomTabBar / DashboardScreen usage)
export type Tab = "home" | "copilot" | "analytics" | "network" | "reports";

// ─── 1. getStatusColor ──────────────────────────────────────────────────────
/**
 * Maps a FIR priority level to its canonical hex colour.
 *
 * High   → Red    #EF4444  (Requirements 10.3, 4.3)
 * Medium → Amber  #F59E0B  (Requirements 10.3, 4.4)
 * Low    → Green  #10B981  (Requirements 10.3)
 */
export function getStatusColor(priority: Priority): string {
  switch (priority) {
    case "High":
      return "#EF4444";
    case "Medium":
      return "#F59E0B";
    case "Low":
      return "#10B981";
  }
}

// ─── 2. formatBadgeCount ────────────────────────────────────────────────────
/**
 * Formats a numeric count for display in the notification bell badge.
 *
 * n ≤ 99  → numeric string (e.g. "7", "42")
 * n > 99  → "99+"
 *
 * Requirements 2.3, 11.5
 */
export function formatBadgeCount(n: number): string {
  return n > 99 ? "99+" : String(n);
}

// ─── 3. computeDonutSegments ────────────────────────────────────────────────
/**
 * Converts raw category counts into arc-segment descriptors for the donut chart.
 *
 * Each returned segment carries:
 *   - percent  : share of the total (0–100), rounded to two decimal places
 *   - color    : passed through from input
 *   - sweep    : SVG arc sweep angle in degrees (0–360), summing to 360°
 *
 * If the total count is zero all segments receive 0 % / 0° to avoid division
 * by zero.  A floating-point rounding correction is applied to the last
 * segment so that the sweep angles always sum to exactly 360.
 *
 * Requirements 9.1, 9.2
 */
export interface DonutSegment {
  percent: number;
  color: string;
  sweep: number;
}

export function computeDonutSegments(
  categories: Array<{ count: number; color: string }>
): DonutSegment[] {
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  if (total === 0) {
    return categories.map(({ color }) => ({ percent: 0, color, sweep: 0 }));
  }

  let sweepAccumulated = 0;
  const segments: DonutSegment[] = categories.map(({ count, color }, index) => {
    const isLast = index === categories.length - 1;
    const percent = (count / total) * 100;

    // For the last segment use the remainder to avoid floating-point drift
    const sweep = isLast
      ? 360 - sweepAccumulated
      : (count / total) * 360;

    sweepAccumulated += sweep;

    return {
      percent: Math.round(percent * 100) / 100,
      color,
      sweep,
    };
  });

  return segments;
}

// ─── 4. computeTrendPolyline ────────────────────────────────────────────────
/**
 * Converts an array of TrendPoints into a SVG `<Polyline>` points string.
 *
 * Layout:
 *   x → evenly distributed across [0, width]
 *   y → mapped from data value into [0, height], then clamped to that range
 *       (0 = top of chart area; high values map toward 0 = inverted SVG y-axis)
 *
 * Returns a string like "0,120 60,85 120,60 …" suitable for the `points`
 * attribute of a react-native-svg <Polyline>.
 *
 * Edge cases:
 *   - Single point: placed at the horizontal center.
 *   - All equal values: all y-coordinates are placed at height / 2.
 *   - width / height ≤ 0: returns empty string.
 *
 * Requirements 6.1
 */
export function computeTrendPolyline(
  points: TrendPoint[],
  key: keyof Omit<TrendPoint, "label">,
  width: number,
  height: number
): string {
  if (points.length === 0 || width <= 0 || height <= 0) {
    return "";
  }

  const values = points.map((p) => p[key] as number);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  const coords = values.map((val, i) => {
    // Evenly distribute x across the full width
    const x =
      points.length === 1
        ? width / 2
        : (i / (points.length - 1)) * width;

    // Normalise to [0, 1] then flip (SVG y: 0 = top, height = bottom)
    const normalised = range === 0 ? 0.5 : (val - minVal) / range;
    const rawY = height - normalised * height;

    // Clamp to [0, height]
    const y = Math.max(0, Math.min(height, rawY));

    return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
  });

  return coords.join(" ");
}

// ─── 5. getTabStyles ────────────────────────────────────────────────────────
/**
 * Returns a style descriptor array for the five bottom tabs.
 *
 * Exactly one entry has `active: true` — the entry whose tab value matches
 * `activeTab`.  All other entries have `active: false`.
 *
 * Requirements 3.2
 */
const ALL_TABS: Tab[] = ["home", "copilot", "analytics", "network", "reports"];

export interface TabStyle {
  active: boolean;
}

export function getTabStyles(tabs: Tab[], activeTab: Tab): TabStyle[] {
  return tabs.map((tab) => ({ active: tab === activeTab }));
}

export { ALL_TABS };
