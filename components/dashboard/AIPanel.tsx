// components/dashboard/AIPanel.tsx — CrimeLens AI Dashboard
// Req 13: AI Panel — confidence arc, latest recommendation, XAI signals row

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { T, Lang } from "../../i18n/dashboardTranslations";
import mockData from "../../data/mockData";

export type AIPanelProps = {
  lang: Lang;
};

const RADIUS = 54;
const CX = 70;
const CY = 70;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AIPanel({ lang }: AIPanelProps) {
  const t = T[lang];
  const { confidenceScore, recommendationKey, lastUpdateLabel, signals } =
    mockData.aiPanel;

  const strokeDashoffset =
    CIRCUMFERENCE - (confidenceScore / 100) * CIRCUMFERENCE;

  const recommendationText =
    t[recommendationKey as keyof typeof t] ?? "";

  return (
    <View style={styles.card}>
      {/* ── Card title (Req 13.4) ── */}
      <Text style={styles.cardTitle}>{t.aiPanelTitle}</Text>

      {/* ── Confidence Arc (Req 13.1) ── */}
      <View style={styles.arcRow}>
        <View style={styles.arcWrapper}>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            {/* Background track */}
            <Circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              stroke="#E2E8F0"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress arc — starts from top via rotation */}
            <Circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              stroke="#0F4C81"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${CX}, ${CY}`}
            />
          </Svg>

          {/* Score text absolutely centred over SVG */}
          <View style={styles.arcLabelContainer} pointerEvents="none">
            <Text style={styles.arcScore}>{confidenceScore}%</Text>
            <Text style={styles.arcSubLabel}>{t.aiPanelConfidenceLabel}</Text>
          </View>
        </View>

        {/* ── Latest Recommendation (Req 13.2) ── */}
        <View style={styles.recContainer}>
          {/* Header row: "Last Model Update · Today, 06:30 AM" */}
          <Text style={styles.recHeader} numberOfLines={2}>
            {t.aiPanelLastUpdate}
            {"  ·  "}
            {lastUpdateLabel}
          </Text>

          {/* Recommendation text with left accent */}
          <View style={styles.recAccentBox}>
            <Text style={styles.recText}>{recommendationText}</Text>
          </View>
        </View>
      </View>

      {/* ── XAI Signals row (Req 13.3) ── */}
      <View style={styles.xaiSection}>
        <Text style={styles.xaiTitle}>{t.aiPanelXAITitle}</Text>
        <View style={styles.pillRow}>
          {signals.map((signal) => {
            const label =
              t[signal.labelKey as keyof typeof t] ?? signal.labelKey;
            return (
              <View
                key={signal.labelKey}
                style={[styles.pill, { backgroundColor: signal.color }]}
              >
                <Text style={styles.pillText}>
                  {label} {signal.percent}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Enterprise card ────────────────────────────────────────────────
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
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#0F4C81",
    marginBottom: 14,
  },

  // ── Arc + recommendation side-by-side ────────────────────────────
  arcRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  // ── Confidence arc ────────────────────────────────────────────────
  arcWrapper: {
    width: 140,
    height: 140,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  arcLabelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  arcScore: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 24,
    color: "#0F4C81",
    lineHeight: 28,
  },
  arcSubLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
    maxWidth: 80,
  },

  // ── Latest recommendation ─────────────────────────────────────────
  recContainer: {
    flex: 1,
    paddingLeft: 14,
  },
  recHeader: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 16,
  },
  recAccentBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#0F4C81",
    paddingLeft: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 4,
    paddingVertical: 8,
    paddingRight: 8,
    marginTop: 2,
  },
  recText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
  },

  // ── XAI signals ───────────────────────────────────────────────────
  xaiSection: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  xaiTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#FFFFFF",
  },
});
