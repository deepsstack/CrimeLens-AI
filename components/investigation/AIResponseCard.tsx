/**
 * components/investigation/AIResponseCard.tsx
 * CrimeLens AI — AI Copilot Intelligence Response Presentation
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { getConfidenceColor, formatTimestamp } from "../../utils/investigationUtils";
import type { FIRReference, OffenderReference, VehicleReference } from "../../data/investigationMockData";
import { Brain, FileText, Users, MapPin, Network, ShieldAlert, CheckCircle2 } from "lucide-react-native";

export type AIResponseCardProps = {
  lang: Lang;
  text: string;
  timestamp: Date;
  confidenceScore: number;
  priority?: string;
  linkedEntities: {
    firs: FIRReference[];
    offenders: OffenderReference[];
    vehicles: VehicleReference[];
    locations: string[];
  };
  summary?: any;
  explainability?: any;
  recommendations?: any;
};

/** A labelled section with icon, title, and bullet items */
function DataSection({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon?: any;
  items: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.headerRow}>
        {Icon ? <Icon size={14} color="#0F4C81" style={{ marginRight: 6 }} /> : null}
        <Text style={sectionStyles.label}>{label}</Text>
      </View>
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
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11.5,
    color: "#0F4C81",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bullet: {
    fontFamily: "Inter-Bold",
    fontSize: 13,
    color: "#0F4C81",
    lineHeight: 18,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 12.5,
    color: "#334155",
    lineHeight: 18,
  },
});

export function AIResponseCard({
  lang,
  text,
  timestamp,
  confidenceScore,
  priority,
  linkedEntities,
  explainability,
  recommendations,
}: AIResponseCardProps) {
  const t = T[lang];
  const confidenceColor = getConfidenceColor(confidenceScore);

  // Derive display lists from linked entities
  const firItems = (linkedEntities?.firs || []).map(
    (f) => `${f.number} — ${f.crimeType} (${f.district}, ${f.date})`
  );
  const offenderItems = (linkedEntities?.offenders || []).map(
    (o) => `${o.name} (${o.priorConvictions} prior conviction${o.priorConvictions !== 1 ? "s" : ""})`
  );
  const locationItems = linkedEntities?.locations || [];

  const crimeTypes = Array.from(
    new Set((linkedEntities?.firs || []).map((f) => f.crimeType))
  );
  const vehicleItems =
    crimeTypes.length > 0
      ? crimeTypes
      : (linkedEntities?.vehicles || []).map((v) => `${v.registration} (${v.type})`);

  const explainabilityItems = explainability?.keyFactors || [];
  const recommendationItems = (recommendations || []).map(
    (r: any) => `${r.title || r.action}: ${r.description || ""}`.trim()
  );

  return (
    <View style={styles.row} accessibilityRole="none">
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          
          {/* Card Top Banner: AI Assessment Header + Priority / Confidence Badges */}
          <View style={styles.cardHeaderBanner}>
            <View style={styles.aiTag}>
              <Brain size={14} color="#0F4C81" />
              <Text style={styles.aiTagText}>AI COPILOT ASSESSMENT</Text>
            </View>

            <View style={styles.badgeGroup}>
              {priority ? (
                <View style={[styles.priorityBadge, priority === "High" && styles.priorityHigh]}>
                  <ShieldAlert size={11} color="white" style={{ marginRight: 4 }} />
                  <Text style={styles.priorityText}>{priority}</Text>
                </View>
              ) : null}

              <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
                <Text style={styles.confidenceBadgeText}>
                  {confidenceScore}% {t.confidence}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Assessment Main Text */}
          <Text style={styles.analysisText}>{text}</Text>

          {/* Visually organized section lists — displayed only when data exists */}
          {firItems.length > 0 && (
            <DataSection label={t.relatedFIRs} icon={FileText} items={firItems} />
          )}

          {offenderItems.length > 0 && (
            <DataSection label={t.repeatOffendersFound} icon={Users} items={offenderItems} />
          )}

          {locationItems.length > 0 && (
            <DataSection label={t.commonLocations} icon={MapPin} items={locationItems} />
          )}

          {vehicleItems.length > 0 && (
            <DataSection label={t.associatedCrimes} icon={Network} items={vehicleItems} />
          )}

          {explainabilityItems.length > 0 && (
            <DataSection label="Explainability Insights" icon={Brain} items={explainabilityItems} />
          )}

          {recommendationItems.length > 0 && (
            <DataSection label="Recommended Actions" icon={CheckCircle2} items={recommendationItems} />
          )}
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatTimestamp(timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  cardWrapper: {
    maxWidth: "92%",
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    position: "relative",
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15,76,129,0.08)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  aiTagText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9.5,
    color: "#0F4C81",
    letterSpacing: 0.8,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityHigh: {
    backgroundColor: "#EF4444",
  },
  priorityText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  confidenceBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confidenceBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 10.5,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  analysisText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 21,
  },
  timestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 16,
    paddingLeft: 2,
  },
});
