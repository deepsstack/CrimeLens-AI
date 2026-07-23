/**
 * components/investigation/InvestigationTopBar.tsx
 * CrimeLens AI — AI Investigation Workspace Top Bar
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 14.1, 15.1
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Mic, ChevronLeft } from "lucide-react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestigationTopBarProps = {
  lang: Lang;
  setLang: (l: Lang) => void;
  onVoicePress: () => void;
  voiceActive: boolean;
  onBack?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function InvestigationTopBar({
  lang,
  setLang,
  onVoicePress,
  voiceActive,
  onBack,
}: InvestigationTopBarProps) {
  const t = T[lang];
  const nextLang: Lang = lang === "en" ? "kn" : "en";

  // Lang toggle label: bilingual display — always shows both, current lang first
  const langToggleText =
    lang === "en" ? "English | ಕನ್ನಡ" : "ಕನ್ನಡ | English";

  // ── Voice pulse animation ──────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (voiceActive) {
      // Start pulsing loop: scale 1 → 1.2 → 1, opacity 1 → 0.5 → 1
      pulseLoop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.22,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.45,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.current.start();
    } else {
      // Stop and reset to resting state
      if (pulseLoop.current) {
        pulseLoop.current.stop();
        pulseLoop.current = null;
      }
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
    };
  }, [voiceActive, scaleAnim, opacityAnim]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    // Requirement 1.1 — Police Blue #0F4C81 background, sticky zIndex 10
    <View style={styles.container} accessibilityRole="header">
      {/* ── Left: optional back button + title/subtitle ── */}
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.titleColumn}>
          {/* Requirement 1.2 — workspace title in Rajdhani-Bold */}
          <Text style={styles.titleText} numberOfLines={1} accessibilityRole="text">
            {t.workspaceTitle}
          </Text>
          {/* Requirement 1.3 — workspace subtitle in Inter-Regular */}
          <Text style={styles.subtitleText} numberOfLines={1} accessibilityRole="text">
            {t.workspaceSubtitle}
          </Text>
        </View>
      </View>

      {/* ── Right: lang toggle + voice button ── */}
      <View style={styles.rightSection}>
        {/* Requirement 1.4 — Lang_Toggle: same style as TopHeader.tsx */}
        <TouchableOpacity
          onPress={() => setLang(nextLang)}
          style={styles.langToggle}
          accessibilityLabel={`Switch language to ${nextLang === "en" ? "English" : "Kannada"}`}
          accessibilityRole="button"
        >
          <Text style={styles.langToggleText}>{langToggleText}</Text>
        </TouchableOpacity>

        {/* Requirement 1.5 — Voice_Button with Mic icon; pulsing when voiceActive */}
        <TouchableOpacity
          onPress={onVoicePress}
          style={styles.voiceButton}
          accessibilityLabel={voiceActive ? "Stop voice input" : "Start voice input"}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Animated.View
            style={[
              styles.voiceIconWrapper,
              voiceActive && styles.voiceIconWrapperActive,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            <Mic size={20} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";

const styles = StyleSheet.create({
  container: {
    backgroundColor: POLICE_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
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

  // ── Left section ──
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 8,
  },
  backButton: {
    padding: 4,
    borderRadius: 8,
    marginRight: 2,
  },
  titleColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 0.4,
    lineHeight: 22,
  },
  subtitleText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.2,
    lineHeight: 16,
    marginTop: 1,
  },

  // ── Right section ──
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // ── Lang toggle — matches TopHeader.tsx exactly ──
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

  // ── Voice button ──
  voiceButton: {
    padding: 4,
    borderRadius: 8,
  },
  voiceIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceIconWrapperActive: {
    backgroundColor: "rgba(239, 68, 68, 0.35)",
    borderColor: "rgba(239, 68, 68, 0.65)",
  },
});
