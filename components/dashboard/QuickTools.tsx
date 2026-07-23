/**
 * components/dashboard/QuickTools.tsx
 *
 * Quick Investigation Tools — 3×2 grid of tool shortcut buttons with toast feedback.
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  FileSearch,
  User,
  FileText,
  Cpu,
  Network,
  Mic,
  LucideIcon,
} from "lucide-react-native";

import { T, Lang } from "../../i18n/dashboardTranslations";
import mockData from "../../data/mockData";

// ── Props ──────────────────────────────────────────────────────────────────

export type QuickToolsProps = {
  lang: Lang;
};

// ── Icon resolver ──────────────────────────────────────────────────────────

function resolveIcon(name: string): LucideIcon {
  switch (name) {
    case "FileSearch":  return FileSearch;
    case "UserSearch":  return User;
    case "FileOutput":  return FileText;
    case "Brain":       return Cpu;
    case "Network":     return Network;
    case "Mic":         return Mic;
    default:            return FileText;
  }
}

// ── QuickTools ─────────────────────────────────────────────────────────────

export function QuickTools({ lang }: QuickToolsProps) {
  const t = T[lang];
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function handleToolPress(toastKey: string) {
    const message = (t[toastKey as keyof typeof t] as string) ?? "";
    // Clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    setToastVisible(true);
    // Auto-dismiss after 2000 ms (Requirement 12.3)
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  }

  return (
    <View style={styles.card}>
      {/* Card title (Requirement 12.4) */}
      <Text style={styles.cardTitle}>{t.quickToolsTitle}</Text>

      {/* 3×2 grid (Requirement 12.1) */}
      <View style={styles.grid}>
        {mockData.quickTools.map((tool) => {
          const IconComponent = resolveIcon(tool.icon);
          const label = (t[tool.labelKey as keyof typeof t] as string) ?? "";
          const desc  = (t[tool.descKey  as keyof typeof t] as string) ?? "";

          return (
            <TouchableOpacity
              key={tool.id}
              style={styles.cell}
              onPress={() => handleToolPress(tool.toastKey)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              {/* Icon (Requirement 12.2) */}
              <View style={styles.iconWrapper}>
                <IconComponent size={24} color="#0F4C81" strokeWidth={1.75} />
              </View>
              {/* Label (Requirement 12.2) */}
              <Text style={styles.cellLabel} numberOfLines={2}>
                {label}
              </Text>
              {/* Sub-description (Requirement 12.2) */}
              <Text style={styles.cellDesc} numberOfLines={2}>
                {desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Toast overlay (Requirement 12.3) */}
      {toastVisible && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </View>
      )}
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

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // ── Individual cell ───────────────────────────────────────────────────────
  cell: {
    width: "33.33%",
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },

  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  cellLabel: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 3,
  },

  cellDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 14,
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  toastText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 18,
  },
});
