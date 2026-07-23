/**
 * components/investigation/ExplainableAICard.tsx
 * CrimeLens AI — Reasoning transparency card showing AI decision factors
 *
 * Displays each ExplainabilityFactor with a contextual icon (lucide-react-native),
 * translated label, and a weight percentage bar.
 * Shows Confidence Score and Explainability Score at the bottom,
 * both coloured via getConfidenceColor().
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import {
  Smartphone,
  Car,
  Camera,
  Clock,
  AlertTriangle,
  Info,
  Cpu,
  FileWarning,
  type LucideIcon,
} from "lucide-react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { getConfidenceColor } from "../../utils/investigationUtils";
import type { ExplainabilityData } from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExplainableAICardProps = {
  lang: Lang;
  data: ExplainabilityData;
};

// ─── Icon map ─────────────────────────────────────────────────────────────────
// Maps the icon string from ExplainabilityFactor to a lucide-react-native component

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Car,
  Camera,
  Clock,
  AlertTriangle,
  Info,
  Cpu,
  FileWarning,
};

/** Resolves an icon string to a LucideIcon, falling back to Info */
function resolveIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Info;
}

// ─── Factor Row Sub-component ─────────────────────────────────────────────────

type FactorRowProps = {
  iconName: string;
  label: string;
  weight: number;
};

function FactorRow({ iconName, label, weight }: FactorRowProps) {
  const IconComponent = resolveIcon(iconName);
  const barColor = getConfidenceColor(weight);

  return (
    <View style={factorStyles.row} accessibilityRole="none">
      {/* Icon */}
      <View style={factorStyles.iconWrapper}>
        <IconComponent size={16} color="#0F4C81" />
      </View>

      {/* Label + bar */}
      <View style={factorStyles.content}>
        <View style={factorStyles.labelRow}>
          <Text style={factorStyles.labelText} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[factorStyles.weightText, { color: barColor }]}>
            {weight}%
          </Text>
        </View>

        {/* Weight bar */}
        <View style={factorStyles.barTrack}>
          <View
            style={[
              factorStyles.barFill,
              { width: `${weight}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const factorStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  labelText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  weightText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 0,
  },
  barTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
});

// ─── Score Row Sub-component ──────────────────────────────────────────────────

type ScoreRowProps = {
  label: string;
  score: number;
};

function ScoreRow({ label, score }: ScoreRowProps) {
  const scoreColor = getConfidenceColor(score);

  return (
    <View style={scoreStyles.row}>
      <Text style={scoreStyles.label}>{label}</Text>
      <View style={[scoreStyles.badge, { backgroundColor: scoreColor }]}>
        <Text style={scoreStyles.badgeText}>{score}%</Text>
      </View>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export function ExplainableAICard({ lang, data }: ExplainableAICardProps) {
  const t = T[lang];

  return (
    <View style={styles.card} accessibilityRole="none">
      {/* ── Title ──────────────────────────────────────────────────────── */}
      {/* Requirement 8.1 */}
      <Text style={styles.title}>{t.explainabilityTitle}</Text>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Factor list ────────────────────────────────────────────────── */}
      {/* Requirements 8.2, 8.3 */}
      <View style={styles.factorList}>
        {data.factors.map((factor, index) => {
          // Translate the label key — fall back to the raw key if not found
          const labelKey = factor.labelKey as keyof typeof t;
          const translatedLabel =
            typeof t[labelKey] === "string"
              ? (t[labelKey] as string)
              : factor.labelKey;

          return (
            <FactorRow
              key={index}
              iconName={factor.icon}
              label={translatedLabel}
              weight={factor.weight}
            />
          );
        })}
      </View>

      {/* ── Score section ──────────────────────────────────────────────── */}
      {/* Requirements 8.4, 8.5 */}
      <View style={styles.scoreDivider} />
      <ScoreRow label={t.confidenceScore} score={data.confidenceScore} />
      <ScoreRow label={t.explainabilityScore} score={data.explainabilityScore} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // White card, border-radius 12, elevation 2
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  title: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: "#0F4C81",
    letterSpacing: 0.3,
    lineHeight: 22,
    marginBottom: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },

  factorList: {
    gap: 0,
  },

  scoreDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: 4,
    marginBottom: 2,
  },
});
