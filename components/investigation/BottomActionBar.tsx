/**
 * components/investigation/BottomActionBar.tsx
 * CrimeLens AI — AI Investigation Workspace Bottom Action Bar
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { FileText, Download, Share2, Mic } from "lucide-react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";

// ─── Types ────────────────────────────────────────────────────────────────────

type BottomActionBarProps = {
  lang: Lang;
  onGenerateReport: () => void;
  onExportPDF: () => void;
  onShareInvestigation: () => void;
  onVoiceInvestigation: () => void;
  isGeneratingReport?: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";
const ICON_COLOR_ACTIVE = POLICE_BLUE;
const ICON_COLOR_DISABLED = "#9CA3AF";
const BAR_HEIGHT = 60;

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomActionBar({
  lang,
  onGenerateReport,
  onExportPDF,
  onShareInvestigation,
  onVoiceInvestigation,
  isGeneratingReport = false,
}: BottomActionBarProps) {
  const t = T[lang];

  return (
    // Requirement 12.1 — fixed-height 60px bar, white background, elevation shadow
    <View style={styles.container} accessibilityRole="toolbar">
      {/* ── Generate Report Button (Requirement 12.2, 12.5) ── */}
      <TouchableOpacity
        onPress={onGenerateReport}
        disabled={isGeneratingReport}
        style={[styles.actionButton, isGeneratingReport && styles.actionButtonDisabled]}
        accessibilityLabel={isGeneratingReport ? t.generatingReport : t.generateReport}
        accessibilityRole="button"
        accessibilityState={{ disabled: isGeneratingReport }}
      >
        {isGeneratingReport ? (
          // Requirement 12.5 — show ActivityIndicator during report generation
          <ActivityIndicator
            size="small"
            color={ICON_COLOR_DISABLED}
            accessibilityLabel="Generating report"
          />
        ) : (
          <FileText size={20} color={ICON_COLOR_ACTIVE} />
        )}
        <Text
          style={[
            styles.actionLabel,
            isGeneratingReport && styles.actionLabelDisabled,
          ]}
          numberOfLines={1}
        >
          {/* Requirement 12.5 — replace label with generatingReport text while generating */}
          {isGeneratingReport ? t.generatingReport : t.generateReport}
        </Text>
      </TouchableOpacity>

      {/* ── Export PDF Button (Requirement 12.3) ── */}
      <TouchableOpacity
        onPress={onExportPDF}
        style={styles.actionButton}
        accessibilityLabel={t.exportPDF}
        accessibilityRole="button"
      >
        <Download size={20} color={ICON_COLOR_ACTIVE} />
        <Text style={styles.actionLabel} numberOfLines={1}>
          {t.exportPDF}
        </Text>
      </TouchableOpacity>

      {/* ── Share Investigation Button (Requirement 12.4) ── */}
      <TouchableOpacity
        onPress={onShareInvestigation}
        style={styles.actionButton}
        accessibilityLabel={t.shareInvestigation}
        accessibilityRole="button"
      >
        <Share2 size={20} color={ICON_COLOR_ACTIVE} />
        <Text style={styles.actionLabel} numberOfLines={1}>
          {t.shareInvestigation}
        </Text>
      </TouchableOpacity>

      {/* ── Voice Investigation Button (Requirement 12.4) ── */}
      <TouchableOpacity
        onPress={onVoiceInvestigation}
        style={styles.actionButton}
        accessibilityLabel={t.voiceInvestigation}
        accessibilityRole="button"
      >
        <Mic size={20} color={ICON_COLOR_ACTIVE} />
        <Text style={styles.actionLabel} numberOfLines={1}>
          {t.voiceInvestigation}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Requirement 12.1 — 60px height, white background, elevation shadow
  container: {
    height: BAR_HEIGHT,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Requirement 12.2 — four buttons in horizontal row
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 3,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },

  actionLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: POLICE_BLUE,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  actionLabelDisabled: {
    color: ICON_COLOR_DISABLED,
  },
});
