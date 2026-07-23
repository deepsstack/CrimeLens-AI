/**
 * components/investigation/AIResponseCard.tsx
 * CrimeLens AI — AI analysis response bubble (left-aligned)
 *
 * Requirements: 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 8.4
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { getConfidenceColor, formatTimestamp } from "../../utils/investigationUtils";
import type { FIRReference, OffenderReference, VehicleReference } from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIResponseCardProps = {
  lang: Lang;
  text: string;
  timestamp: Date;
  confidenceScore: number;
  linkedEntities: {
    firs: FIRReference[];
    offenders: OffenderReference[];
    vehicles: VehicleReference[];
    locations: string[];
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A labelled section with a list of bullet items */
function DataSection({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.label}>{label}</Text>
      {items.map((item, index) => (
        <View key={index} style={sectionStyles.bulletRow}>
          <Text style={sectionStyles.bullet}>{"•"}</Text>
          <Text style={sectionStyles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#64748B",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
    paddingLeft: 2,
  },
  bullet: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#0F4C81",
    lineHeight: 19,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 19,
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function AIResponseCard({
  lang,
  text,
  timestamp,
  confidenceScore,
  linkedEntities,
}: AIResponseCardProps) {
  const t = T[lang];
  const confidenceColor = getConfidenceColor(confidenceScore);

  // Derive display lists from linked entities
  const firItems = linkedEntities.firs.map(
    (f) => `${f.number} — ${f.crimeType} (${f.district}, ${f.date})`
  );
  const offenderItems = linkedEntities.offenders.map(
    (o) => `${o.name} (${o.priorConvictions} prior conviction${o.priorConvictions !== 1 ? "s" : ""})`
  );
  const locationItems = linkedEntities.locations;

  // Associated crimes: collect unique crime types from FIRs, fall back to vehicles if empty
  const crimeTypes = Array.from(
    new Set(linkedEntities.firs.map((f) => f.crimeType))
  );
  const vehicleItems =
    crimeTypes.length > 0
      ? crimeTypes
      : linkedEntities.vehicles.map((v) => `${v.registration} (${v.type})`);

  return (
    <View style={styles.row} accessibilityRole="none">
      <View style={styles.cardWrapper}>
        {/* ── Card ─────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Confidence badge — top right (absolute) */}
          {/* Requirement 8.4 */}
          <View
            style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
            accessibilityLabel={`Confidence: ${confidenceScore}%`}
          >
            <Text style={styles.confidenceBadgeText}>
              {confidenceScore}%
            </Text>
          </View>

          {/* Analysis text */}
          {/* Requirement 6.1 */}
          <Text style={styles.analysisText}>{text}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Structured data sections — Requirements 6.2, 6.3, 6.4, 6.5 */}
          <DataSection label={t.relatedFIRs} items={firItems} />
          <DataSection
            label={t.repeatOffendersFound}
            items={offenderItems}
          />
          <DataSection label={t.commonLocations} items={locationItems} />
          <DataSection label={t.associatedCrimes} items={vehicleItems} />
        </View>

        {/* Timestamp below card */}
        <Text style={styles.timestamp}>
          {formatTimestamp(timestamp)}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Outer row — left-aligned
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginVertical: 6,
  },

  // Wrapper limits card width
  cardWrapper: {
    maxWidth: "90%",
    alignItems: "flex-start",
  },

  // Card — white, elevation 2, border-radius 12
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderTopLeftRadius: 4, // "incoming" message shape
    padding: 14,
    // Asymmetric corner for chat-bubble feel
    position: "relative",
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

  // Confidence badge — absolute top-right
  confidenceBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 1,
  },
  confidenceBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Analysis text — main body
  analysisText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
    paddingRight: 56, // leave room for confidence badge
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },

  // Timestamp
  timestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 16,
    paddingLeft: 2,
  },
});
