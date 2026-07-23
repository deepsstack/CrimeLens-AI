/**
 * components/investigation/QueryBubble.tsx
 * CrimeLens AI — Officer query message bubble (right-aligned)
 *
 * Requirements: 5.1
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { formatTimestamp } from "../../utils/investigationUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QueryBubbleProps = {
  text: string;
  timestamp: Date;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QueryBubble({ text, timestamp }: QueryBubbleProps) {
  return (
    // Outer row — right-aligned via alignItems / justifyContent
    <View style={styles.row} accessibilityRole="none">
      <View style={styles.bubbleWrapper}>
        {/* Message bubble */}
        <View style={styles.bubble} accessibilityRole="text">
          <Text style={styles.messageText}>{text}</Text>
        </View>

        {/* Timestamp below bubble, right-aligned */}
        <Text style={styles.timestamp} accessibilityRole="text">
          {formatTimestamp(timestamp)}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Outer container — push content to the right
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginVertical: 6,
  },

  // Wrapper limits bubble width to ~80% of screen
  bubbleWrapper: {
    maxWidth: "80%",
    alignItems: "flex-end",
  },

  // Bubble
  bubble: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    // Asymmetric corners: sharp top-right for "outgoing" feel
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    // Subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  // Message text — Rajdhani-SemiBold as specified
  messageText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 15,
    color: "#1E293B",
    lineHeight: 21,
    letterSpacing: 0.1,
  },

  // Timestamp — Inter-Regular, 12px, gray
  timestamp: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 16,
  },
});
