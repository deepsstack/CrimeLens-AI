/**
 * components/investigation/SuggestedChips.tsx
 * CrimeLens AI — AI Investigation Workspace Suggested Chips
 *
 * Horizontal scrollable row of eight quick-action investigation chips.
 * Inactive chips: light gray background with Police Blue text.
 * Active/pressed chip: Police Blue background with white text.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import mockData from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SuggestedChipsProps = {
  lang: Lang;
  onChipPress: (chipId: string, queryTemplate: string) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SuggestedChips({ lang, onChipPress }: SuggestedChipsProps) {
  // Requirement 3.3 — local state tracks the currently active chip
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  const chips = mockData.suggestedChips; // 8 chips from mock data
  const t = T[lang];

  return (
    // Requirement 3.1 — horizontal ScrollView, no scroll indicator
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessibilityRole="none"
    >
      {chips.map((chip) => {
        const isActive = chip.id === activeChipId;

        // Requirement 3.2 — active/inactive chip styles
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => {
              // Requirement 3.3 — set active chip and call parent handler
              setActiveChipId(chip.id);
              onChipPress(chip.id, chip.queryTemplate);
            }}
            style={[
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
            ]}
            accessibilityLabel={
              (t as unknown as Record<string, string>)[chip.labelKey] ?? chip.labelKey
            }
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.75}
          >
            {/* Requirement 3.4 — chip label from T[lang][chip.labelKey] */}
            <Text
              style={[
                styles.chipLabel,
                isActive ? styles.chipLabelActive : styles.chipLabelInactive,
              ]}
              numberOfLines={1}
            >
              {(t as unknown as Record<string, string>)[chip.labelKey] ?? chip.labelKey}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Outer scroll ────────────────────────────────────────────────────────
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  // ── Individual chip ─────────────────────────────────────────────────────
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    // Prevent chips from wrapping
    flexShrink: 0,
  },
  chipInactive: {
    backgroundColor: "#F3F4F6",
  },
  chipActive: {
    backgroundColor: POLICE_BLUE,
  },

  // ── Chip label ──────────────────────────────────────────────────────────
  chipLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  chipLabelInactive: {
    color: POLICE_BLUE,
  },
  chipLabelActive: {
    color: "#FFFFFF",
  },
});
