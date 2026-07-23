/**
 * components/dashboard/BottomTabBar.tsx
 *
 * Fixed bottom navigation bar with five tabs.
 * Requirements: 3.1, 3.2, 3.3
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  Home,
  Bot,
  BarChart2,
  Network,
  FileText,
} from "lucide-react-native";
import type { Lang, DashboardT } from "../../i18n/dashboardTranslations";
import { T } from "../../i18n/dashboardTranslations";
import { getTabStyles, ALL_TABS } from "../../utils/dashboardUtils";

export type Tab = "home" | "copilot" | "analytics" | "network" | "reports";

export type BottomTabBarProps = {
  activeTab: Tab;
  onTabPress: (t: Tab) => void;
  lang: Lang;
  onCopilotPress?: () => void;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVE_COLOR = "#0F4C81";
const INACTIVE_COLOR = "#94A3B8";
const ICON_SIZE = 22;

// ─── Icon map ─────────────────────────────────────────────────────────────────

type TabIconProps = { color: string; size: number };

const TAB_ICONS: Record<Tab, (props: TabIconProps) => React.ReactElement> = {
  home:      ({ color, size }) => <Home      color={color} size={size} strokeWidth={2} />,
  copilot:   ({ color, size }) => <Bot       color={color} size={size} strokeWidth={2} />,
  analytics: ({ color, size }) => <BarChart2 color={color} size={size} strokeWidth={2} />,
  network:   ({ color, size }) => <Network   color={color} size={size} strokeWidth={2} />,
  reports:   ({ color, size }) => <FileText  color={color} size={size} strokeWidth={2} />,
};

// ─── Label resolver ───────────────────────────────────────────────────────────

function getTabLabel(tab: Tab, translations: DashboardT): string {
  const map: Record<Tab, string> = {
    home:      translations.tabHome,
    copilot:   translations.tabCopilot,
    analytics: translations.tabAnalytics,
    network:   translations.tabNetwork,
    reports:   translations.tabReports,
  };
  return map[tab];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomTabBar({ activeTab, onTabPress, lang, onCopilotPress }: BottomTabBarProps) {
  const translations = T[lang];
  const tabStyles = getTabStyles(ALL_TABS, activeTab);

  return (
    <View style={styles.container}>
      {ALL_TABS.map((tab, index) => {
        const isActive = tabStyles[index].active;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        const IconComponent = TAB_ICONS[tab];
        const label = getTabLabel(tab, translations);

        return (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => {
              if (tab === "copilot" && onCopilotPress) {
                onCopilotPress();
              } else {
                onTabPress(tab);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.7}
          >
            <IconComponent color={color} size={ICON_SIZE} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 20,
    // Subtle top border to visually separate from content
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
    // Elevation for Android shadow
    elevation: 8,
    // Shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 6,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
