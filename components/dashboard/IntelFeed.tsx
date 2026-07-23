/**
 * components/dashboard/IntelFeed.tsx
 *
 * Real-Time Intelligence Feed — vertically scrollable list of alert cards.
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { AlertTriangle, AlertCircle, Info } from "lucide-react-native";

import { T, Lang } from "../../i18n/dashboardTranslations";
import mockData, { Severity } from "../../data/mockData";

// ── Props ──────────────────────────────────────────────────────────────────

export type IntelFeedProps = {
  lang: Lang;
};

// ── Severity colour config ─────────────────────────────────────────────────

type SeverityConfig = {
  borderColor: string;
  backgroundColor: string;
  badgeColor: string;
};

function getSeverityConfig(severity: Severity): SeverityConfig {
  switch (severity) {
    case "Critical":
      return {
        borderColor: "#EF4444",
        backgroundColor: "#FEF2F2",
        badgeColor: "#EF4444",
      };
    case "High":
      return {
        borderColor: "#F59E0B",
        backgroundColor: "#FFFBEB",
        badgeColor: "#F59E0B",
      };
    case "Medium":
      return {
        borderColor: "#06B6D4",
        backgroundColor: "#ECFEFF",
        badgeColor: "#06B6D4",
      };
  }
}

// ── Severity icon ──────────────────────────────────────────────────────────

function SeverityIcon({ severity, color }: { severity: Severity; color: string }) {
  const props = { size: 14, color, strokeWidth: 2 };
  switch (severity) {
    case "Critical": return <AlertTriangle {...props} />;
    case "High":     return <AlertCircle  {...props} />;
    case "Medium":   return <Info         {...props} />;
  }
}

// ── IntelFeed ──────────────────────────────────────────────────────────────

export function IntelFeed({ lang }: IntelFeedProps) {
  const t = T[lang];

  return (
    <View style={styles.card}>
      {/* Card container title (Requirement 11.4) */}
      <Text style={styles.cardTitle}>{t.intelFeedTitle}</Text>

      {/* Vertically scrollable list (Requirement 11.4) */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {mockData.intelFeed.map((alert, index) => {
          const config = getSeverityConfig(alert.severity);

          // Translated fields — fallback to "" to prevent undefined in <Text>
          const typeLabel    = (t[alert.typeKey as keyof typeof t] as string) ?? "";
          const description  = (t[alert.descKey as keyof typeof t] as string) ?? "";
          const district     = (lang === "kn" ? alert.districtKn : alert.district) ?? "";

          // Severity label
          const severityLabel =
            alert.severity === "Critical"
              ? t.intelSeverityCritical
              : alert.severity === "High"
              ? t.intelSeverityHigh
              : t.intelSeverityMedium;

          return (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  borderLeftColor: config.borderColor,
                  backgroundColor: config.backgroundColor,
                },
                index > 0 && styles.alertCardSpacing,
              ]}
            >
              {/* ── Top row: type label + severity badge ── */}
              <View style={styles.topRow}>
                <Text style={styles.typeLabel} numberOfLines={1}>
                  {typeLabel}
                </Text>

                {/* Severity badge (pill) — Requirement 11.2 */}
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: config.badgeColor },
                  ]}
                >
                  <SeverityIcon severity={alert.severity} color="#FFFFFF" />
                  <Text style={styles.severityBadgeText}>{severityLabel}</Text>
                </View>
              </View>

              {/* ── Description — Requirement 11.2 ── */}
              <Text style={styles.description}>{description}</Text>

              {/* ── Bottom row: district + timestamp — Requirement 11.2 ── */}
              <View style={styles.bottomRow}>
                <Text style={styles.district}>{district}</Text>
                <Text style={styles.timestamp}>{alert.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Outer enterprise card ─────────────────────────────────────────────────
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

  scrollArea: {
    maxHeight: 480,
  },

  // ── Individual alert card ─────────────────────────────────────────────────
  alertCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
  },

  alertCardSpacing: {
    marginTop: 10,
  },

  // ── Top row ───────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },

  typeLabel: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 18,
    flex: 1,
  },

  // Pill-shaped severity badge
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    flexShrink: 0,
  },

  severityBadgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
    lineHeight: 15,
  },

  // ── Description ───────────────────────────────────────────────────────────
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },

  // ── Bottom row ────────────────────────────────────────────────────────────
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  district: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#0F4C81",
    lineHeight: 15,
  },

  timestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
});
