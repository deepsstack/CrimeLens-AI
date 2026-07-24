/**
 * components/investigation/WelcomeCard.tsx
 * CrimeLens AI — AI Investigation Workspace Welcome Card
 *
 * Displays a time-of-day greeting, four example query bullets, a multi-line
 * text input, three icon buttons (Mic / Paperclip / Send), and an optional
 * row of attachment chips.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.5, 17.1, 17.2
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Mic, Paperclip, Send } from "lucide-react-native";
import { T, type Lang } from "../../i18n/investigationTranslations";
import type { Attachment } from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WelcomeCardProps = {
  lang: Lang;
  queryInput: string;
  onQueryChange: (text: string) => void;
  onQuerySubmit: () => void;
  onVoicePress: () => void;
  onAttachmentPress: () => void;
  attachments: Attachment[];
  officerName: string;
  officerRole: string;
  onRemoveAttachment?: (id: string) => void;
  voiceActive?: boolean;
  voiceMessage?: string | null;
  onClearVoiceMessage?: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats a file size (bytes) into a human-readable KB or MB string.
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WelcomeCard({
  lang,
  queryInput,
  onQueryChange,
  onQuerySubmit,
  onVoicePress,
  onAttachmentPress,
  attachments,
  officerName,
  officerRole,
  onRemoveAttachment,
  voiceActive = false,
  voiceMessage = null,
  onClearVoiceMessage,
}: WelcomeCardProps) {
  const t = T[lang];

  return (
    <View style={styles.bar} accessibilityRole="none">
      {/* ── Voice Message Banner (Non-blocking alert/toast) ── */}
      {voiceMessage ? (
        <View style={styles.voiceMessageBanner}>
          <Text style={styles.voiceMessageText} numberOfLines={2}>
            {voiceMessage}
          </Text>
          {onClearVoiceMessage && (
            <TouchableOpacity
              onPress={onClearVoiceMessage}
              style={styles.voiceMessageDismiss}
              accessibilityLabel="Dismiss message"
              accessibilityRole="button"
            >
              <Text style={styles.voiceMessageDismissText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* ── Listening Status Badge ── */}
      {voiceActive && (
        <View style={styles.listeningBadge}>
          <View style={styles.listeningDot} />
          <Text style={styles.listeningText}>
            {lang === "kn" ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ" : "Listening... Speak your query"}
          </Text>
        </View>
      )}

      {/* ── Attachment chips (shown above input when files attached) ── */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentScroll}
          contentContainerStyle={styles.attachmentScrollContent}
        >
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.attachmentChip}>
              <Text style={styles.attachmentName} numberOfLines={1} ellipsizeMode="tail">
                {attachment.name}
              </Text>
              <Text style={styles.attachmentSize}> {formatFileSize(attachment.size)}</Text>
              {onRemoveAttachment && (
                <TouchableOpacity
                  onPress={() => onRemoveAttachment(attachment.id)}
                  style={styles.removeButton}
                  accessibilityLabel={`Remove ${attachment.name}`}
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Input row ── */}
      <View style={styles.inputRow}>
        {/* Paperclip */}
        <TouchableOpacity
          onPress={onAttachmentPress}
          style={styles.sideButton}
          accessibilityLabel="Attach file"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Paperclip size={20} color="#64748B" />
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          style={[styles.textInput, voiceActive && styles.textInputActive]}
          value={queryInput}
          onChangeText={onQueryChange}
          placeholder={voiceActive ? (lang === "kn" ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : t.queryPlaceholder}
          placeholderTextColor={voiceActive ? "#0F4C81" : "#94A3B8"}
          maxLength={500}
          multiline
          onSubmitEditing={onQuerySubmit}
          blurOnSubmit={false}
          accessibilityLabel={t.queryPlaceholder}
          textAlignVertical="top"
        />

        {/* Mic */}
        <TouchableOpacity
          onPress={onVoicePress}
          style={[styles.sideButton, voiceActive && styles.micButtonActive]}
          accessibilityLabel={voiceActive ? "Stop listening" : "Start voice input"}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Mic size={20} color={voiceActive ? "#FFFFFF" : "#64748B"} />
        </TouchableOpacity>

        {/* Send */}
        <TouchableOpacity
          onPress={onQuerySubmit}
          style={[styles.sideButton, styles.sendButton]}
          accessibilityLabel="Submit query"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Pinned input bar — sits above BottomActionBar
  bar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },

  // Horizontal row: attach | input | mic | send
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },

  textInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
    minHeight: 40,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: "top",
  },

  sideButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  micButtonActive: {
    backgroundColor: "#0F4C81",
  },
  sendButton: {
    backgroundColor: POLICE_BLUE,
  },

  // Voice message & status styles
  voiceMessageBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  voiceMessageText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#991B1B",
    flex: 1,
  },
  voiceMessageDismiss: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  voiceMessageDismissText: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "#991B1B",
  },
  listeningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  listeningText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#1E40AF",
  },
  textInputActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },

  // Attachment chips row (above input row)
  attachmentScroll: {
    marginBottom: 8,
  },
  attachmentScrollContent: {
    gap: 8,
    paddingRight: 4,
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 220,
  },
  attachmentName: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: POLICE_BLUE,
    flexShrink: 1,
    maxWidth: 120,
  },
  attachmentSize: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    flexShrink: 0,
  },
  removeButton: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: POLICE_BLUE,
    lineHeight: 16,
    textAlign: "center",
  },
});
