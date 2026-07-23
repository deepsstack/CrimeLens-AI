/**
 * components/dashboard/DistrictChart.tsx
 *
 * Horizontal bar chart comparing crime counts across Karnataka districts.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

import mockData, { District } from "../../data/mockData";
import { T, Lang } from "../../i18n/dashboardTranslations";

// ── Constants ──────────────────────────────────────────────────────────────

/** Row height (px) per district bar */
const ROW_HEIGHT = 28;

/** Vertical gap between rows */
const ROW_GAP = 6;

/** Left margin reserved for district name labels */
const LABEL_LEFT_WIDTH = 90;

/** Right margin reserved for count labels */
const LABEL_RIGHT_WIDTH = 44;

/** Inner bar height */
const BAR_HEIGHT = 16;

/** Top padding inside the SVG above the first row */
const SVG_PADDING_TOP = 4;

/** Bottom padding inside the SVG below the last row */
const SVG_PADDING_BOTTOM = 4;

/** ID used for the Police Blue → Cyan LinearGradient */
const GRADIENT_ID = "districtBarGradient";

/** Top-3 highlight colour (Requirement 8.3) */
const TOP3_COLOR = "#EF4444";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Sort districts by crimeCount descending and return the sorted array.
 * Original array is not mutated.
 */
function sortedDistricts(districts: District[]): District[] {
  return [...districts].sort((a, b) => b.crimeCount - a.crimeCount);
}

// ── DistrictChart ──────────────────────────────────────────────────────────

export type DistrictChartProps = {
  lang: Lang;
  districtsData?: District[];
};

export function DistrictChart({ lang, districtsData }: DistrictChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const t = T[lang];

  // Sort districts by crimeCount descending (Requirement 8.1)
  const sourceDistricts = districtsData && districtsData.length > 0 ? districtsData : (mockData.districts ?? []);
  const districts = sortedDistricts(sourceDistricts);

  // Maximum crime count — used to scale all bars proportionally
  const maxCount = districts.length > 0 ? districts[0].crimeCount : 1;

  // The drawable bar area width (inside label margins)
  // Card has marginHorizontal:16 and padding:16 on each side = 64px total
  const cardPadding = 64;
  const availableWidth = screenWidth - cardPadding;
  const barAreaWidth = availableWidth - LABEL_LEFT_WIDTH - LABEL_RIGHT_WIDTH;

  // Total SVG height to accommodate all rows
  const svgHeight =
    SVG_PADDING_TOP +
    districts.length * ROW_HEIGHT +
    Math.max(0, districts.length - 1) * ROW_GAP +
    SVG_PADDING_BOTTOM;

  return (
    <View style={styles.card}>
      {/* Card title — Requirement 8.4 */}
      <Text style={styles.cardTitle}>{t.districtChartTitle}</Text>

      {/* SVG bar chart */}
      <Svg
        width={availableWidth}
        height={svgHeight}
        style={styles.svg}
      >
        {/* ── Gradient definition for non-top-3 bars (Requirement 8.2) ── */}
        <Defs>
          <LinearGradient
            id={GRADIENT_ID}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor="#0F4C81" stopOpacity={1} />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
          </LinearGradient>
        </Defs>

        {districts.map((district, index) => {
          const isTop3 = index < 3; // Requirement 8.3
          const barWidth =
            barAreaWidth > 0
              ? Math.max(4, (district.crimeCount / maxCount) * barAreaWidth)
              : 4;

          const rowY =
            SVG_PADDING_TOP + index * (ROW_HEIGHT + ROW_GAP);

          // Vertically centre the bar within the row
          const barY = rowY + (ROW_HEIGHT - BAR_HEIGHT) / 2;

          // District display name respects lang toggle
          const districtName =
            lang === "kn" ? district.nameKn : district.name;

          return (
            <React.Fragment key={district.id}>
              {/* District name label — left of bar */}
              <SvgText
                x={LABEL_LEFT_WIDTH - 6}
                y={barY + BAR_HEIGHT / 2 + 4}
                fontSize={10}
                fontFamily="Inter-Regular"
                fill={isTop3 ? TOP3_COLOR : "#1E293B"}
                textAnchor="end"
              >
                {districtName}
              </SvgText>

              {/* Bar — top-3 solid red, others gradient (Requirements 8.2, 8.3) */}
              <Rect
                x={LABEL_LEFT_WIDTH}
                y={barY}
                width={barWidth}
                height={BAR_HEIGHT}
                rx={4}
                ry={4}
                fill={isTop3 ? TOP3_COLOR : `url(#${GRADIENT_ID})`}
              />

              {/* Crime count label — right of bar (Requirement 8.2) */}
              <SvgText
                x={LABEL_LEFT_WIDTH + barWidth + 6}
                y={barY + BAR_HEIGHT / 2 + 4}
                fontSize={10}
                fontFamily="Inter-Medium"
                fill={isTop3 ? TOP3_COLOR : "#475569"}
                textAnchor="start"
              >
                {district.crimeCount.toLocaleString()}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /** Enterprise card design — Requirement 8.4, 15.4 */
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
  svg: {
    alignSelf: "flex-start",
  },
});
