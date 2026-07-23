/**
 * components/dashboard/KPICards.tsx
 *
 * Horizontally-scrollable KPI card row for the CrimeLens AI Dashboard.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import {
  FileText,
  Search,
  AlertTriangle,
  Bell,
  MapPin,
  Zap,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from "lucide-react-native";

import mockData, { KPICard } from "../../data/mockData";
import { T, Lang } from "../../i18n/dashboardTranslations";

// ── Icon registry ─────────────────────────────────────────────────────────────
// Maps the string icon names used in mockData to actual lucide components.
const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Search,
  AlertTriangle,
  Bell,
  MapPin,
  Zap,
};

// Fallback when an unknown icon name appears in the data
const FallbackIcon: LucideIcon = FileText;

// ── Colour helpers ────────────────────────────────────────────────────────────
/**
 * Returns the trend colour based on trendSemantic and the sign of the value.
 * bad  → Amber #F59E0B  (neutral warning) or Red #EF4444 (large negative move)
 * good → Green #10B981
 *
 * Per the spec: "Amber/Red for bad, Green for good".
 * We use Red when the absolute trend value ≥ 10 and semantic is "bad",
 * otherwise Amber, matching requirements 4.3 & 4.4.
 */
function getTrendColor(card: KPICard): string {
  if (card.trendSemantic === "good") return "#10B981";
  // bad — use Red for high-magnitude bad trends, Amber otherwise
  return Math.abs(card.trend) >= 10 ? "#EF4444" : "#F59E0B";
}

// ── KPICardItem ───────────────────────────────────────────────────────────────
interface KPICardItemProps {
  card: KPICard;
  lang: Lang;
}

function KPICardItem({ card, lang }: KPICardItemProps) {
  const IconComponent: LucideIcon = ICON_MAP[card.icon] ?? FallbackIcon;
  const trendColor = getTrendColor(card);
  const isPositiveTrend = card.trend >= 0;
  const trendArrow = isPositiveTrend ? "▲" : "▼";
  const trendDisplay = `${trendArrow} ${Math.abs(card.trend)}%`;

  // Resolve translated title — falls back to empty string if key is missing
  const title = (T[lang] as unknown as Record<string, string>)[card.titleKey] ?? "";

  return (
    <View style={styles.card}>
      {/* Icon row */}
      <View style={styles.iconRow}>
        <IconComponent size={20} color="#0F4C81" strokeWidth={1.8} />
      </View>

      {/* Metric value */}
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
        {card.value}
      </Text>

      {/* Trend row */}
      <Text style={[styles.trendText, { color: trendColor }]} numberOfLines={1}>
        {trendDisplay}
      </Text>

      {/* Translated title */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

// ── KPICards ──────────────────────────────────────────────────────────────────
export type KPICardsProps = {
  lang: Lang;
  kpiStats?: {
    totalFIRs: number;
    activeInvestigations: number;
    highPriority: number;
  };
};

export function KPICards({ lang, kpiStats }: KPICardsProps) {
  const cards = mockData.kpiCards.map((c) => {
    if (!kpiStats) return c;
    if (c.id === "kpi-1") return { ...c, value: kpiStats.totalFIRs.toLocaleString() };
    if (c.id === "kpi-2") return { ...c, value: kpiStats.activeInvestigations.toLocaleString() };
    if (c.id === "kpi-3") return { ...c, value: kpiStats.highPriority.toLocaleString() };
    return c;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      {cards.map((card) => (
        <KPICardItem key={card.id} card={card} lang={lang} />
      ))}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  card: {
    width: 140,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
    justifyContent: "space-between",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricValue: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 22,
    color: "#1E293B",
    lineHeight: 26,
  },
  trendText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    lineHeight: 14,
  },
  cardTitle: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
    lineHeight: 13,
  },
});
