/**
 * components/investigation/InvestigationTimeline.tsx
 * CrimeLens AI — Investigation milestone timeline card
 *
 * Vertical timeline with a connecting line (thin View, absolutely positioned).
 * Each milestone entry shows:
 *   - Status icon (CheckCircle / Clock / AlertCircle from lucide-react-native)
 *     on a white circular background that visually "breaks" the connecting line
 *   - Milestone label translated via T[lang][entry.labelKey] — bold, coloured by status
 *   - Timestamp in small gray text
 *   - Short description in small gray Inter-Regular text
 *
 * Status colours:
 *   completed   → Police Blue  #0F4C81
 *   in_progress → Amber        #F59E0B
 *   pending     → Light gray   #D1D5DB
 *
 * White card, borderRadius 12, elevation 2, margin 16, padding 16.
 * Card title uses Police Blue, Inter-SemiBold.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { getMilestoneIcon } from "../../utils/investigationUtils";
import type { TimelineEntry } from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestigationTimelineProps = {
  lang: Lang;
  timeline: TimelineEntry[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";
const AMBER = "#F59E0B";
const LIGHT_GRAY = "#D1D5DB";
const LINE_COLOR = "#E5E7EB";

/** Icon circle diameter — the status icon sits inside a white circle on the line */
const ICON_SIZE = 20;
const ICON_CIRCLE_SIZE = 32;

/** Left offset from card padding edge to the centre of the icon circle */
const LINE_LEFT_OFFSET = 15; // centres the 2px line under the 32px icon circle (16 - 1 = 15)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the hex colour for a given milestone status */
function getMilestoneColor(status: TimelineEntry["status"]): string {
  switch (status) {
    case "completed":
      return POLICE_BLUE;
    case "in_progress":
      return AMBER;
    case "pending":
      return LIGHT_GRAY;
  }
}

/** Returns the lucide icon component for a given milestone status.
 *  Uses getMilestoneIcon() from investigationUtils for the icon name mapping,
 *  then resolves to the actual component.
 *  Validates: Requirements 10.2
 */
function MilestoneIcon({
  status,
  color,
}: {
  status: TimelineEntry["status"];
  color: string;
}) {
  const iconName = getMilestoneIcon(status);

  switch (iconName) {
    case "check-circle":
      return <CheckCircle size={ICON_SIZE} color={color} />;
    case "clock":
      return <Clock size={ICON_SIZE} color={color} />;
    case "alert-circle":
    default:
      return <AlertCircle size={ICON_SIZE} color={color} />;
  }
}

// ─── Milestone Entry Sub-component ───────────────────────────────────────────

type MilestoneEntryProps = {
  entry: TimelineEntry;
  label: string;
  isLast: boolean;
};

function MilestoneEntry({ entry, label, isLast }: MilestoneEntryProps) {
  const color = getMilestoneColor(entry.status);

  return (
    <View
      style={entryStyles.row}
      accessibilityRole="none"
      accessibilityLabel={`${label}, ${entry.timestamp}, ${entry.status}`}
    >
      {/* ── Left column: icon circle + lower segment of connecting line ── */}
      <View style={entryStyles.iconColumn}>
        {/* White circle "breaks" the vertical line visually */}
        <View style={entryStyles.iconCircle}>
          <MilestoneIcon status={entry.status} color={color} />
        </View>

        {/* Vertical line segment below the icon (hidden for last item) */}
        {!isLast && <View style={entryStyles.lineSegment} />}
      </View>

      {/* ── Right column: label, timestamp, description ─────────────────── */}
      <View style={[entryStyles.content, isLast && entryStyles.contentLast]}>
        {/* Milestone label — bold, coloured by status. Req 10.3 */}
        <Text
          style={[entryStyles.milestoneLabel, { color }]}
          numberOfLines={2}
        >
          {label}
        </Text>

        {/* Timestamp — small gray. Req 10.1 */}
        <Text style={entryStyles.timestamp}>{entry.timestamp}</Text>

        {/* Short description — small gray Inter-Regular. Req 10.4 */}
        <Text style={entryStyles.description}>{entry.description}</Text>
      </View>
    </View>
  );
}

const entryStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  // Left column — fixed width to hold icon and line segment
  iconColumn: {
    width: ICON_CIRCLE_SIZE,
    alignItems: "center",
    marginRight: 12,
  },

  // White circular background visually interrupts the connecting line
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    // Thin border so the circle stands out on the white card
    borderWidth: 1.5,
    borderColor: LINE_COLOR,
    zIndex: 1,
  },

  // Thin vertical line running from below the icon to the start of next entry
  lineSegment: {
    flex: 1,
    width: 2,
    backgroundColor: LINE_COLOR,
    minHeight: 16,
  },

  // Content area to the right of the icon column
  content: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  contentLast: {
    paddingBottom: 0,
  },

  milestoneLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  },

  timestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#9CA3AF",
    lineHeight: 16,
    marginBottom: 4,
  },

  description: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export function InvestigationTimeline({
  lang,
  timeline,
}: InvestigationTimelineProps) {
  const t = T[lang];

  return (
    <View style={styles.card} accessibilityRole="none">
      {/* ── Card title ─────────────────────────────────────────────────── */}
      {/* Req 10.1 — "Investigation Timeline" heading in Police Blue */}
      <Text style={styles.title}>{t.timelineTitle}</Text>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Timeline body ──────────────────────────────────────────────── */}
      {/* The absolute-positioned thin line runs behind all icon circles.
          We render it as a thin View inside a relative container so it
          aligns with the centre of each icon circle column.              */}
      <View style={styles.timelineBody}>
        {/* Background connecting line — runs full height of the list */}
        <View
          style={[styles.connectingLine, { left: LINE_LEFT_OFFSET }]}
          pointerEvents="none"
        />

        {/* Milestone entries */}
        {timeline.map((entry, index) => {
          // Resolve translated milestone label; fall back to raw labelKey
          const labelKey = entry.labelKey as keyof typeof t;
          const label =
            typeof t[labelKey] === "string"
              ? (t[labelKey] as string)
              : entry.labelKey;

          return (
            <MilestoneEntry
              key={entry.id}
              entry={entry}
              label={label}
              isLast={index === timeline.length - 1}
            />
          );
        })}
      </View>

      {/* ── Status legend ──────────────────────────────────────────────── */}
      {/* Req 10.3 — colour-coded status labels at the bottom of the card */}
      <View style={styles.legend}>
        <LegendItem color={POLICE_BLUE} label={t.statusCompleted} />
        <LegendItem color={AMBER} label={t.statusInProgress} />
        <LegendItem color={LIGHT_GRAY} label={t.statusPending} />
      </View>
    </View>
  );
}

// ─── Legend Item Sub-component ────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={legendStyles.item}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <Text style={legendStyles.label}>{label}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  label: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // White card, borderRadius 12, elevation 2, margin 16, padding 16
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

  // Card title — Police Blue, Inter-SemiBold/Bold
  title: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: POLICE_BLUE,
    letterSpacing: 0.3,
    lineHeight: 22,
    marginBottom: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },

  // Relative container so the absolute connecting line is scoped here
  timelineBody: {
    position: "relative",
  },

  // Thin absolute line running the full height behind the icon circles
  connectingLine: {
    position: "absolute",
    top: ICON_CIRCLE_SIZE / 2,   // start from mid-point of first icon
    bottom: ICON_CIRCLE_SIZE / 2, // end at mid-point of last icon
    width: 2,
    backgroundColor: LINE_COLOR,
    zIndex: 0,
  },

  // Legend row at the bottom
  legend: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
});
