/**
 * components/modals/ProfileSettingsModal.tsx
 * CrimeLens AI — Profile & Settings Modal
 */

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
} from "react-native";
import {
  User,
  Shield,
  Globe,
  Bell,
  Lock,
  FileSpreadsheet,
  LogOut,
  Moon,
  Sun,
  X,
  ChevronRight,
  BadgeCheck,
} from "lucide-react-native";

export type ProfileSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  lang: "en" | "kn";
  setLang: (l: "en" | "kn") => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
};

export function ProfileSettingsModal({
  visible,
  onClose,
  lang,
  setLang,
  onLogout,
  onOpenAdmin,
}: ProfileSettingsModalProps) {
  const [darkTheme, setDarkTheme] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [caseUpdates, setCaseUpdates] = useState(true);
  const [reportUpdates, setReportUpdates] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>RK</Text>
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.officerName}>Insp. Rajesh Kumar</Text>
                  <BadgeCheck size={16} color="#0F4C81" />
                </View>
                <Text style={styles.officerRole}>Senior Inspector · Badge KSP-2847</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Officer Details Card */}
            <View style={styles.profileCard}>
              <Text style={styles.cardTitle}>OFFICER PROFILE</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Police Station</Text>
                  <Text style={styles.detailValue}>Electronic City PS</Text>
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>District</Text>
                  <Text style={styles.detailValue}>Bengaluru City</Text>
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Assigned Role</Text>
                  <Text style={styles.detailValue}>Crime Analyst / Senior Officer</Text>
                </View>
              </View>
            </View>

            {/* Application Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>APPLICATION SETTINGS</Text>

              {/* Language Switch */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Globe size={18} color="#0F4C81" />
                  <View>
                    <Text style={styles.settingName}>Interface Language</Text>
                    <Text style={styles.settingSub}>Switch between English & Kannada</Text>
                  </View>
                </View>
                <View style={styles.langToggleBox}>
                  <TouchableOpacity
                    style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
                    onPress={() => setLang("en")}
                  >
                    <Text style={[styles.langBtnText, lang === "en" && styles.langBtnTextActive]}>EN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.langBtn, lang === "kn" && styles.langBtnActive]}
                    onPress={() => setLang("kn")}
                  >
                    <Text style={[styles.langBtnText, lang === "kn" && styles.langBtnTextActive]}>ಕನ್ನಡ</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Theme Mode */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  {darkTheme ? <Moon size={18} color="#0F4C81" /> : <Sun size={18} color="#F59E0B" />}
                  <View>
                    <Text style={styles.settingName}>Color Theme</Text>
                    <Text style={styles.settingSub}>{darkTheme ? "Dark Mode (Classified)" : "Light Mode (Standard KSP Blue)"}</Text>
                  </View>
                </View>
                <Switch
                  value={darkTheme}
                  onValueChange={setDarkTheme}
                  trackColor={{ false: "#CBD5E1", true: "#0F4C81" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Notification Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NOTIFICATIONS & ALERTS</Text>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Bell size={16} color="#EF4444" />
                  <Text style={styles.settingName}>Critical Crime Alerts</Text>
                </View>
                <Switch
                  value={criticalAlerts}
                  onValueChange={setCriticalAlerts}
                  trackColor={{ false: "#CBD5E1", true: "#0F4C81" }}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Bell size={16} color="#0F4C81" />
                  <Text style={styles.settingName}>AI Pattern Alerts</Text>
                </View>
                <Switch value={aiAlerts} onValueChange={setAiAlerts} trackColor={{ false: "#CBD5E1", true: "#0F4C81" }} />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Bell size={16} color="#10B981" />
                  <Text style={styles.settingName}>Case Status Updates</Text>
                </View>
                <Switch
                  value={caseUpdates}
                  onValueChange={setCaseUpdates}
                  trackColor={{ false: "#CBD5E1", true: "#0F4C81" }}
                />
              </View>
            </View>

            {/* System Admin Link (If Admin role) */}
            {onOpenAdmin && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ADMINISTRATION</Text>
                <TouchableOpacity style={styles.navRow} onPress={onOpenAdmin}>
                  <View style={styles.settingLeft}>
                    <Shield size={18} color="#0F4C81" />
                    <View>
                      <Text style={styles.settingName}>System Administration</Text>
                      <Text style={styles.settingSub}>User roles, permissions matrix, and system logs</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}

            {/* Security & Audit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SECURITY & AUDIT</Text>

              <View style={styles.navRow}>
                <View style={styles.settingLeft}>
                  <Lock size={18} color="#0F4C81" />
                  <Text style={styles.settingName}>Two-Factor Authentication (Active)</Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </View>

              <View style={styles.navRow}>
                <View style={styles.settingLeft}>
                  <FileSpreadsheet size={18} color="#0F4C81" />
                  <Text style={styles.settingName}>View My Audit Logs</Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <LogOut size={18} color="#DC2626" />
              <Text style={styles.logoutText}>Secure Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  officerName: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  officerRole: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#0F4C81",
    marginBottom: 10,
    letterSpacing: 1,
  },
  detailGrid: {
    gap: 8,
  },
  detailBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#64748B",
  },
  detailValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F172A",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  settingName: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F172A",
  },
  settingSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  langToggleBox: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: "#0F4C81",
  },
  langBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#475569",
  },
  langBtnTextActive: {
    color: "#FFFFFF",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: "#DC2626",
  },
});
