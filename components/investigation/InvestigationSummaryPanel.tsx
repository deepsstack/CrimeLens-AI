/**
 * components/investigation/InvestigationSummaryPanel.tsx
 * CrimeLens AI — Structured investigation intelligence summary card
 *
 * White card with 4px Police Blue left border.
 * Eight collapsible sections with 200ms Animated.timing height expansion.
 * Priority badge coloured via getPriorityColor().
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 15.5
 */

import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { getPriorityColor } from "../../utils/investigationUtils";
import type { InvestigationSummary } from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestigationSummaryPanelProps = {
  lang: Lang;
  summary: InvestigationSummary;
};

type SectionId =
  | "repeatOffenders"
  | "commonVehicles"
  | "knownAssociates"
  | "linkedMobiles"
  | "travelPattern"
  | "frequentLocations"
  | "previousArrests"
  | "priority";

// ─── Collapsible Section Sub-component ───────────────────────────────────────

type CollapsibleSectionProps = {
  label: string;
  countLabel: string;
  viewDetailsLabel: string;
  children: React.ReactNode;
};

function CollapsibleSection({
  label,
  countLabel,
  viewDetailsLabel,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    const toValue = expanded ? 0 : 1;
    // 200ms timing as specified in Requirement 15.5
    Animated.timing(animHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(animOpacity, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  }, [expanded, animHeight, animOpacity]);

  // Interpolate height: 0 → auto-equivalent via max-height trick
  const maxHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <View style={sectionStyles.container}>
      {/* Row: label, count, View Details button */}
      <View style={sectionStyles.headerRow}>
        <View style={sectionStyles.labelGroup}>
          <Text style={sectionStyles.labelText}>{label}</Text>
          <Text style={sectionStyles.countText}>{countLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={toggle}
          style={sectionStyles.viewDetailsButton}
          accessibilityLabel={`${viewDetailsLabel} ${label}`}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={sectionStyles.viewDetailsText}>{viewDetailsLabel}</Text>
          {expanded ? (
            <ChevronUp size={14} color="#0F4C81" />
          ) : (
            <ChevronDown size={14} color="#0F4C81" />
          )}
        </TouchableOpacity>
      </View>

      {/* Animated expandable content */}
      <Animated.View
        style={[
          sectionStyles.expandable,
          { maxHeight, opacity: animOpacity, overflow: "hidden" },
        ]}
      >
        <View style={sectionStyles.expandedContent}>{children}</View>
      </Animated.View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  labelText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  countText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 14,
    color: "#0F4C81",
    lineHeight: 18,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    marginLeft: 8,
  },
  viewDetailsText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F4C81",
    lineHeight: 16,
  },
  expandable: {
    overflow: "hidden",
  },
  expandedContent: {
    paddingTop: 8,
    paddingLeft: 4,
    gap: 3,
  },
});

// ─── Detail Item helper ───────────────────────────────────────────────────────

function DetailItem({ text }: { text: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.bullet}>{"•"}</Text>
      <Text style={detailStyles.text}>{text}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  bullet: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#0F4C81",
    lineHeight: 18,
    marginRight: 6,
  },
  text: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export function InvestigationSummaryPanel({
  lang,
  summary,
}: InvestigationSummaryPanelProps) {
  const t = T[lang];
  const priorityColor = getPriorityColor(summary.priority);

  // Localised priority label
  const priorityLabel =
    summary.priority === "High"
      ? t.priorityHigh
      : summary.priority === "Medium"
      ? t.priorityMedium
      : t.priorityLow;

  return (
    <View style={styles.card} accessibilityRole="none">
      {/* ── Title row ──────────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t.summaryTitle}</Text>
      </View>

      {/* ── Section 1: Repeat Offenders ────────────────────────────────── */}
      {/* Requirement 7.2 */}
      <CollapsibleSection
        label={t.repeatOffendersFound}
        countLabel={String(summary.repeatOffenders.count)}
        viewDetailsLabel={t.viewDetails}
      >
        {summary.repeatOffenders.names.map((name, i) => (
          <DetailItem key={i} text={name} />
        ))}
      </CollapsibleSection>

      {/* ── Section 2: Common Vehicles ─────────────────────────────────── */}
      {/* Requirement 7.3 */}
      <CollapsibleSection
        label={t.commonVehicles}
        countLabel={String(summary.commonVehicles.count)}
        viewDetailsLabel={t.viewDetails}
      >
        {summary.commonVehicles.registrations.map((reg, i) => (
          <DetailItem key={i} text={reg} />
        ))}
      </CollapsibleSection>

      {/* ── Section 3: Known Associates ────────────────────────────────── */}
      <CollapsibleSection
        label={t.knownAssociates}
        countLabel={String(summary.knownAssociates.count)}
        viewDetailsLabel={t.viewDetails}
      >
        {summary.knownAssociates.names.map((name, i) => (
          <DetailItem key={i} text={name} />
        ))}
      </CollapsibleSection>

      {/* ── Section 4: Linked Mobile Numbers ──────────────────────────── */}
      <CollapsibleSection
        label={t.linkedMobileNumbers}
        countLabel={String(summary.linkedMobileNumbers.count)}
        viewDetailsLabel={t.viewDetails}
      >
        {summary.linkedMobileNumbers.anonymizedIds.map((id, i) => (
          <DetailItem key={i} text={id} />
        ))}
      </CollapsibleSection>

      {/* ── Section 5: Travel Pattern ──────────────────────────────────── */}
      <CollapsibleSection
        label={t.travelPattern}
        countLabel={""}
        viewDetailsLabel={t.viewDetails}
      >
        <DetailItem text={summary.travelPattern} />
      </CollapsibleSection>

      {/* ── Section 6: Frequent Locations ─────────────────────────────── */}
      <CollapsibleSection
        label={t.frequentLocations}
        countLabel={String(summary.frequentLocations.length)}
        viewDetailsLabel={t.viewDetails}
      >
        {summary.frequentLocations.map((loc, i) => (
          <DetailItem key={i} text={loc} />
        ))}
      </CollapsibleSection>

      {/* ── Section 7: Previous Arrests ────────────────────────────────── */}
      <CollapsibleSection
        label={t.previousArrests}
        countLabel={String(summary.previousArrests)}
        viewDetailsLabel={t.viewDetails}
      >
        <DetailItem
          text={`${summary.previousArrests} arrest${
            summary.previousArrests !== 1 ? "s" : ""
          } on record`}
        />
      </CollapsibleSection>

      {/* ── Section 8: Priority ────────────────────────────────────────── */}
      {/* Requirement 7.4 — priority badge with getPriorityColor() */}
      <CollapsibleSection
        label={t.priority}
        countLabel={""}
        viewDetailsLabel={t.viewDetails}
      >
        <View style={styles.priorityBadgeWrapper}>
          <View
            style={[styles.priorityBadge, { backgroundColor: priorityColor }]}
            accessibilityLabel={`Priority: ${summary.priority}`}
          >
            <Text style={styles.priorityBadgeText}>{priorityLabel}</Text>
          </View>
        </View>
      </CollapsibleSection>

      {/* ── Inline priority badge in the title area too (always visible) ── */}
      <View style={styles.priorityFooter}>
        <Text style={styles.priorityFooterLabel}>{t.priority}: </Text>
        <View
          style={[styles.priorityBadgeSmall, { backgroundColor: priorityColor }]}
        >
          <Text style={styles.priorityBadgeSmallText}>{priorityLabel}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";

const styles = StyleSheet.create({
  // Card: white, Police Blue 4px left border, elevation 2, border-radius 12
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: POLICE_BLUE,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
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

  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 17,
    color: POLICE_BLUE,
    letterSpacing: 0.3,
    lineHeight: 22,
  },

  // Priority badge
  priorityBadgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  priorityBadgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Footer always-visible priority indicator
  priorityFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priorityFooterLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  priorityBadgeSmall: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityBadgeSmallText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
