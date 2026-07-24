/**
 * components/dashboard/TopHeader.tsx
 * CrimeLens AI — Sticky Top Header
 *
 * Requirements: 2.1 (KSP Blue header), 2.2 (logo + officer badge),
 *               2.3 (notification bell with badge), 2.4 (lang toggle),
 *               2.5 (live date/time), 14.4 (search)
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { Bell, Search, X } from "lucide-react-native";
import { T, type Lang } from "../../i18n/dashboardTranslations";
import mockData from "../../data/mockData";
import { formatBadgeCount } from "../../utils/dashboardUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TopHeaderProps = {
  lang: Lang;
  setLang: (l: Lang) => void;
  alertCount: number;
  searchOpen: boolean;
  searchQuery: string;
  onSearchToggle: () => void;
  onSearchChange: (q: string) => void;
  onBellPress?: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TopHeader({
  lang,
  setLang,
  alertCount,
  searchOpen,
  searchQuery,
  onSearchToggle,
  onSearchChange,
  onBellPress,
  onProfilePress,
  onSearchPress,
}: TopHeaderProps) {
  const t = T[lang];
  const badgeLabel = formatBadgeCount(alertCount);
  const nextLang: Lang = lang === "en" ? "kn" : "en";
  // Show the label for the *other* language (what you'd switch TO)
  const langToggleText = t.langToggleLabel;

  return (
    // Requirement 2.1 — KSP Police Blue #0F4C81 background, zIndex 10 (sticky)
    <View style={styles.container} accessibilityRole="header">
      {/* ── Left: Logo / Search Input ── */}
      {searchOpen ? (
        // Requirement 14.4 — inline search TextInput when open
        <View style={styles.searchRow}>
          <Search size={16} color="rgba(255,255,255,0.6)" style={styles.searchInlineIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.45)"
            autoFocus
            returnKeyType="search"
            accessibilityLabel={t.searchPlaceholder}
          />
          <TouchableOpacity
            onPress={onSearchToggle}
            style={styles.iconButton}
            accessibilityLabel="Close search"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.leftSection}>
          {/* Requirement 2.2 — "CrimeLens AI" logo text + officer badge chip */}
          <Text style={styles.logoText} accessibilityRole="text">
            CrimeLens AI
          </Text>
          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.badgeChip}
            accessibilityLabel={`Badge ${mockData.officerBadge}`}
          >
            <Text style={styles.badgeChipText}>{mockData.officerBadge}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.iconsRow}>
        {/* Requirement 14.4 — search icon button */}
        {!searchOpen && (
          <TouchableOpacity
            onPress={() => {
              if (onSearchPress) onSearchPress();
              else onSearchToggle();
            }}
            style={styles.iconButton}
            accessibilityLabel="Open search"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Search size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        )}

        {/* Requirement 2.3 — notification bell with numeric badge */}
        <TouchableOpacity
          onPress={onBellPress}
          style={styles.bellWrapper}
          accessibilityLabel={`Notifications, ${badgeLabel} alerts`}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bell size={20} color="rgba(255,255,255,0.9)" />
          {alertCount > 0 && (
            <View style={styles.notifBadge} accessibilityElementsHidden>
              <Text style={styles.notifBadgeText}>{badgeLabel}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Requirement 2.4 — EN/KN language toggle */}
        <TouchableOpacity
          onPress={() => setLang(nextLang)}
          style={styles.langToggle}
          accessibilityLabel={`Switch language to ${nextLang === "en" ? "English" : "Kannada"}`}
          accessibilityRole="button"
        >
          <Text style={styles.langToggleText}>{langToggleText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";
const BADGE_RED   = "#EF4444";

const styles = StyleSheet.create({
  container: {
    backgroundColor: POLICE_BLUE,
    // On Android, add a slight top padding if not wrapped in SafeAreaView already;
    // App.tsx wraps everything in SafeAreaView so we only need horizontal padding.
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    // Subtle bottom shadow so it reads as elevated / sticky
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // ── Left: logo + badge ──
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  badgeChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  badgeChipText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.4,
  },

  // ── Right: date-time ──
  rightSection: {
    marginRight: 8,
    alignItems: "flex-end",
  },
  dateTimeText: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.3,
  },

  // ── Icons row ──
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
  },

  // ── Bell + badge ──
  bellWrapper: {
    padding: 6,
    borderRadius: 8,
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 1,
    right: 1,
    backgroundColor: BADGE_RED,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: POLICE_BLUE,
  },
  notifBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#FFFFFF",
    lineHeight: 12,
  },

  // ── Lang toggle ──
  langToggle: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 2,
  },
  langToggleText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },

  // ── Inline search ──
  searchRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    height: 38,
    marginRight: 6,
  },
  searchInlineIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#FFFFFF",
    paddingVertical: 0,   // removes default Android top/bottom padding
    height: 38,
  },
});
