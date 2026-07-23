import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, AlertTriangle, Users, Zap } from "lucide-react-native";
import mockData from "../../data/mockData";
import { T } from "../../i18n/dashboardTranslations";
import type { Lang } from "../../i18n/dashboardTranslations";

// Icon lookup map for dynamic resolution from rec.icon string
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  MapPin,
  AlertTriangle,
  Users,
  Zap,
};

type AIBriefProps = {
  lang: Lang;
};

export function AIBrief({ lang }: AIBriefProps) {
  const [actionPressed, setActionPressed] = useState(false);

  const tl = T[lang];
  const { greetingKey, summaryKey, recommendations } = mockData.aiBrief;

  // Safe translation lookup: returns "" instead of undefined if key is missing
  function tr(key: string): string {
    return (tl[key as keyof typeof tl] as string) ?? "";
  }

  return (
    <View style={styles.card}>
      {/* Greeting */}
      <Text style={styles.greeting}>{tr(greetingKey)}</Text>

      {/* Summary paragraph */}
      <Text style={styles.summary}>{tr(summaryKey)}</Text>

      {/* Recommendation rows */}
      <View style={styles.recsContainer}>
        {recommendations.map((rec, index) => {
          const IconComponent = ICON_MAP[rec.icon];
          const title = tr(rec.titleKey);
          const desc = tr(rec.descKey);
          return (
            <View key={index} style={styles.recRow}>
              <View style={styles.iconWrapper}>
                {IconComponent ? (
                  <IconComponent size={20} color="#0F4C81" />
                ) : null}
              </View>
              <View style={styles.recTextContainer}>
                <Text style={styles.recTitle}>{title}</Text>
                <Text style={styles.recDesc} numberOfLines={1}>{desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* View Full Report button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setActionPressed(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{tl.aiBriefViewReport}</Text>
      </TouchableOpacity>

      {/* Confirmation message shown after button press */}
      {actionPressed && (
        <Text style={styles.confirmText}>{tl.aiBriefActionConfirm}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderLeftColor: "#0F4C81",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    padding: 16,
  },
  greeting: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F4C81",
    fontWeight: "700",
  },
  summary: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#475569",
    marginTop: 8,
    lineHeight: 19,
  },
  recsContainer: {
    marginTop: 12,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  recTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  recTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
  },
  recDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  button: {
    backgroundColor: "#0F4C81",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  confirmText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#10B981",
    marginTop: 10,
    textAlign: "center",
  },
});
