/**
 * components/dashboard/CategoryDonut.tsx
 *
 * Donut chart showing crime category breakdown.
 * Requirements: 9.1, 9.2, 9.3, 9.4
 *
 * Technique:
 *   Each segment is a <Circle> with strokeDasharray = circumference and
 *   strokeDashoffset = circumference - (percent / 100) * circumference.
 *   Segments are sequenced by rotating each circle by the accumulated
 *   sweep angle of all prior segments (starting from -90° so the first
 *   segment begins at the top).
 */

import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import mockData from "../../data/mockData";
import { T, Lang } from "../../i18n/dashboardTranslations";
import { computeDonutSegments, DonutSegment } from "../../utils/dashboardUtils";

// ── Constants ──────────────────────────────────────────────────────────────

/** Donut geometry */
const RADIUS = 70;
const STROKE_WIDTH = 28;
const SVG_SIZE = (RADIUS + STROKE_WIDTH) * 2 + 4; // a little breathing room
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Small gap (in degrees) between segments for visual separation */
const SEGMENT_GAP_DEG = 1.5;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Given a segment's percentage, return the strokeDasharray and
 * strokeDashoffset values for a Circle with the given circumference.
 * A tiny gap is subtracted from the drawn arc to visually separate segments.
 */
function arcProps(
  percent: number,
  gapDeg: number
): { dashArray: string; dashOffset: string } {
  const gapFraction = gapDeg / 360;
  const gapArc = CIRCUMFERENCE * gapFraction;
  const arcLength = Math.max(0, (percent / 100) * CIRCUMFERENCE - gapArc);
  return {
    dashArray: `${CIRCUMFERENCE}`,
    dashOffset: `${CIRCUMFERENCE - arcLength}`,
  };
}

// ── CategoryDonut ──────────────────────────────────────────────────────────

export type CategoryDonutProps = {
  lang: Lang;
  categoriesData?: Array<{ nameKey: string; count: number; color: string }>;
};

export function CategoryDonut({ lang, categoriesData }: CategoryDonutProps) {
  const t = T[lang];
  const { width: screenWidth } = useWindowDimensions();

  // Source data
  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : (mockData.crimeCategories ?? []);

  // Compute segments using the shared utility (Requirement 9.1)
  const segments: DonutSegment[] = computeDonutSegments(
    categories.map(({ count, color }) => ({ count, color }))
  );

  // Total case count for center label (Requirement 9.3)
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  // Build rotation offsets: first segment starts at the top (-90°)
  // and each subsequent segment is offset by the sum of previous sweeps.
  let rotationAccum = -90;
  const segmentRotations: number[] = segments.map((seg) => {
    const rotation = rotationAccum;
    rotationAccum += seg.sweep;
    return rotation;
  });

  return (
    <View style={styles.card}>
      {/* Card title — Requirement 9.4 */}
      <Text style={styles.cardTitle}>{t.categoryChartTitle}</Text>

      {/* ── Donut SVG + center label overlay ── */}
      <View style={styles.chartContainer}>
        <Svg width={SVG_SIZE} height={SVG_SIZE}>
          {segments.map((seg, index) => {
            const { dashArray, dashOffset } = arcProps(seg.percent, SEGMENT_GAP_DEG);
            const rotation = segmentRotations[index];

            return (
              <G
                key={index}
                rotation={rotation}
                origin={`${CX}, ${CY}`}
              >
                <Circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              </G>
            );
          })}
        </Svg>

        {/* Center label — absolutely positioned over the SVG (Requirement 9.3) */}
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={styles.centerCount}>
            {totalCount.toLocaleString()}
          </Text>
          <Text style={styles.centerSubLabel}>{t.categoryTotalCases}</Text>
        </View>
      </View>

      {/* ── Legend grid — Requirement 9.2 ── */}
      <View style={styles.legendGrid}>
        {segments.map((seg, index) => {
          const cat = categories[index];
          const nameKey = cat?.nameKey as keyof typeof t | undefined;
          const categoryName =
            nameKey && nameKey in t ? (t[nameKey] as string) : cat?.nameKey ?? "";
          const pct =
            seg.percent < 1
              ? seg.percent.toFixed(1)
              : Math.round(seg.percent).toString();

          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: seg.color }]} />
              <View style={styles.legendTextGroup}>
                <Text style={styles.legendName} numberOfLines={1}>
                  {categoryName}
                </Text>
                <Text style={styles.legendPercent}>{pct}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /** Enterprise card design — Requirements 9.4, 15.4 */
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

  cardTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 12,
    lineHeight: 20,
  },

  /** Container that stacks the SVG and the center label on top of each other */
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  /** Absolute overlay centering the count + sub-label over the donut hole */
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: SVG_SIZE,
    height: SVG_SIZE,
  },

  /** Total case count — large Rajdhani-Bold numeral (Requirement 9.3) */
  centerCount: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 28,
    color: "#1E293B",
    lineHeight: 34,
  },

  /** "Total Cases" sub-label (Requirement 9.3) */
  centerSubLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
    marginTop: 2,
  },

  /** 2-column legend grid (Requirement 9.2) */
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 8,
  },

  /** Each legend entry occupies ~half the card width */
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    minWidth: 120,
  },

  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
    flexShrink: 0,
  },

  legendTextGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },

  legendName: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    flexShrink: 1,
  },

  legendPercent: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#64748B",
    flexShrink: 0,
  },
});
