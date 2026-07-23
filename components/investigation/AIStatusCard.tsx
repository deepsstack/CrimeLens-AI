/**
 * components/investigation/AIStatusCard.tsx
 * CrimeLens AI — AI Investigation Workspace AI Status Floating Card
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { formatTimestamp } from "../../utils/investigationUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AIStatusCardProps = {
  lang: Lang;
  status: "online" | "offline";
  confidenceScore: number;
  databaseSynced: boolean;
  lastUpdated: Date;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_ONLINE = "#10B981";
const COLOR_OFFLINE = "#EF4444";
const POLICE_BLUE = "#0F4C81";

// ─── Component ────────────────────────────────────────────────────────────────

export function AIStatusCard({
  lang,
  status,
  confidenceScore,
  databaseSynced,
  lastUpdated,
}: AIStatusCardProps) {
  const t = T[lang];

  // Requirement 13.5 — update the displayed timestamp every 60 seconds
  const [formattedTime, setFormattedTime] = useState<string>(() =>
    formatTimestamp(lastUpdated)
  );

  useEffect(() => {
    // Initial format whenever lastUpdated prop changes
    setFormattedTime(formatTimestamp(lastUpdated));

    // Refresh display every 60 seconds so relative timestamps stay current
    const interval = setInterval(() => {
      setFormattedTime(formatTimestamp(lastUpdated));
    }, 60_000);

    // Requirement 13.5 — clear interval on unmount
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isOnline = status === "online";

  return (
    // Requirement 13.1 — floating card positioned bottom-right
    // Requirement 13.2 — semi-transparent white bg (opacity 0.95), shadow, border-radius 12
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel={isOnline ? t.aiStatusOnline : t.aiStatusOffline}
    >
      {/* ── Status row: dot + label (Requirement 13.3) ── */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? COLOR_ONLINE : COLOR_OFFLINE },
          ]}
          accessibilityLabel={isOnline ? "Online" : "Offline"}
        />
        <Text style={styles.statusText}>
          {isOnline ? t.aiStatusOnline : t.aiStatusOffline}
        </Text>
      </View>

      {/* ── Confidence score (Requirement 13.4) ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{t.confidence}</Text>
        <Text style={styles.infoValue}>{confidenceScore}%</Text>
      </View>

      {/* ── Database sync status (Requirement 13.4) ── */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoValue, { color: databaseSynced ? COLOR_ONLINE : "#F59E0B" }]}>
          {databaseSynced ? t.databaseSynced : t.databaseSyncing}
        </Text>
      </View>

      {/* ── Last updated (Requirement 13.4, 13.5) ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{t.lastUpdated}: </Text>
        <Text style={styles.infoTimestamp}>{formattedTime}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Requirement 13.1 — absolute position, bottom: 80, right: 16
  // Requirement 13.2 — semi-transparent white (0.95), border-radius 12, shadow
  container: {
    position: "absolute",
    bottom: 80,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // ── Status indicator row ──
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  // Requirement 13.3 — green dot for online, red for offline
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: POLICE_BLUE,
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  // ── Info rows ──
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#6B7280",
    letterSpacing: 0.1,
  },
  infoValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: POLICE_BLUE,
    letterSpacing: 0.1,
  },
  infoTimestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#374151",
    letterSpacing: 0.1,
    flexShrink: 1,
  },
});
