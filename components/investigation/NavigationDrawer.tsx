/**
 * components/investigation/NavigationDrawer.tsx
 * CrimeLens AI — Left Navigation Drawer for AI Investigation Workspace
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import {
  X,
  Clock,
  Bookmark,
  FileText,
  CheckSquare,
  Paperclip,
  Users,
  PlusCircle,
  MessageSquare,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import type { Lang } from "../../i18n/investigationTranslations";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export type SavedInvestigationItem = {
  id: string;
  title: string;
  query?: string;
  createdAt: string;
  officerName?: string;
  officerBadge?: string;
  lang?: Lang;
  messages?: any[];
};

export type NavigationDrawerProps = {
  visible: boolean;
  onClose: () => void;
  lang: Lang;
  savedInvestigations: SavedInvestigationItem[];
  notesCount: number;
  tasksCount: number;
  evidenceCount: number;
  officerName: string;
  officerBadge: string;
  officerRole: string;
  onNewInvestigation: () => void;
  onOpenHistory: () => void;
  onSaveInvestigation: () => void;
  onOpenNotes: () => void;
  onOpenTasks: () => void;
  onOpenEvidence: () => void;
  onOpenCollaboration: () => void;
  onSelectSavedInvestigation: (inv: SavedInvestigationItem) => void;
};

export function NavigationDrawer({
  visible,
  onClose,
  lang,
  savedInvestigations,
  notesCount,
  tasksCount,
  evidenceCount,
  officerName,
  officerBadge,
  officerRole,
  onNewInvestigation,
  onOpenHistory,
  onSaveInvestigation,
  onOpenNotes,
  onOpenTasks,
  onOpenEvidence,
  onOpenCollaboration,
  onSelectSavedInvestigation,
}: NavigationDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!visible) return null;

  const isKn = lang === "kn";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Semi-transparent Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Sliding Drawer Container */}
        <Animated.View
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerTitleBox}>
              <View style={styles.kspLogoBadge}>
                <Shield size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitleText}>
                  CrimeLens<Text style={{ color: "#0F4C81" }}> AI</Text>
                </Text>
                <Text style={styles.headerSubtitleText}>
                  {isKn ? "ಎಐ ತನಿಖಾ ಕೋಶ" : "AI Investigation Drawer"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close drawer"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Drawer Body Scroll */}
          <ScrollView
            style={styles.drawerScroll}
            contentContainerStyle={styles.drawerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Action 1: New Investigation */}
            <TouchableOpacity
              style={styles.newInvestigationBtn}
              onPress={() => {
                onClose();
                onNewInvestigation();
              }}
              activeOpacity={0.8}
            >
              <PlusCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.newInvestigationBtnText}>
                {isKn ? "+ ಹೊಸ ತನಿಖೆ" : "+ New Investigation"}
              </Text>
            </TouchableOpacity>

            {/* Section 1: Investigation Actions / Tools */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {isKn ? "ತನಿಖಾ ಉಪಕರಣಗಳು" : "INVESTIGATION TOOLS"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenHistory();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#EFF6FF" }]}>
                <Clock size={18} color="#1D4ED8" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isKn ? "ತನಿಖಾ ಇತಿಹಾಸ" : "History"}
              </Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{savedInvestigations.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onSaveInvestigation();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#F0FDF4" }]}>
                <Bookmark size={18} color="#15803D" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isKn ? "ತನಿಖೆಯನ್ನು ಉಳಿಸಿ" : "Saved Investigations"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenNotes();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#FEF3C7" }]}>
                <FileText size={18} color="#B45309" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isKn ? "ಅಧಿಕಾರಿ ಟಿಪ್ಪಣಿಗಳು" : "Officer Notes"}
              </Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{notesCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenTasks();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#F3E8FF" }]}>
                <CheckSquare size={18} color="#7E22CE" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isKn ? "ತನಿಖಾ ಕಾರ್ಯಗಳು" : "Investigation Tasks"}
              </Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{tasksCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenEvidence();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#FFF1F2" }]}>
                <Paperclip size={18} color="#BE123C" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isKn ? "ಸಾಕ್ಷ್ಯ / ಲಗತ್ತುಗಳು" : "Evidence / Attachments"}
              </Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{evidenceCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenCollaboration();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#F0F9FF" }]}>
                <Users size={18} color="#0369A1" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isKn ? "ಪ್ರಕರಣ ಸಹಯೋಗ" : "Case Collaboration"}
              </Text>
            </TouchableOpacity>

            {/* Section 2: ChatGPT-style Conversation History */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionHeaderText}>
                {isKn ? "ಇತ್ತೀಚಿನ ತನಿಖೆಗಳು" : "RECENT INVESTIGATIONS"}
              </Text>
            </View>

            {savedInvestigations.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryText}>
                  {isKn ? "ಯಾವುದೇ ಉಳಿಸಿದ ತನಿಖೆಗಳಿಲ್ಲ" : "No saved investigations yet"}
                </Text>
              </View>
            ) : (
              savedInvestigations.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={styles.historyItem}
                  onPress={() => {
                    onClose();
                    onSelectSavedInvestigation(inv);
                  }}
                  activeOpacity={0.7}
                >
                  <MessageSquare size={16} color="#64748B" style={{ marginRight: 10, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyItemTitle} numberOfLines={1}>
                      {inv.title}
                    </Text>
                    <Text style={styles.historyItemMeta} numberOfLines={1}>
                      {inv.createdAt}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer: Current Officer Details */}
          <View style={styles.drawerFooter}>
            <View style={styles.officerAvatarCircle}>
              <Text style={styles.officerInitials}>
                {officerName ? officerName.charAt(0) : "K"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.officerNameText} numberOfLines={1}>
                {officerName || "Insp. V. Kumar"}
              </Text>
              <Text style={styles.officerMetaText} numberOfLines={1}>
                {officerBadge || "KSP-89412"} • {officerRole || "Investigator"}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
  },
  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  kspLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
    letterSpacing: 0.4,
  },
  headerSubtitleText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#EDF2F7",
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  newInvestigationBtn: {
    backgroundColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newInvestigationBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  sectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 12,
    color: "#94A3B8",
    letterSpacing: 1.2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1E293B",
    flex: 1,
  },
  badgeCount: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeCountText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#475569",
  },
  emptyHistoryBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  emptyHistoryText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#94A3B8",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  historyItemTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#0F172A",
  },
  historyItemMeta: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  officerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  officerInitials: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  officerNameText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F172A",
  },
  officerMetaText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
});
