/**
 * screens/AdminScreen.tsx
 * CrimeLens AI — System Administration Screen
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  Shield,
  Users,
  Lock,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Database,
  Cpu,
  Server,
} from "lucide-react-native";

export type AdminScreenProps = {
  lang?: "en" | "kn";
  onBack?: () => void;
};

export function AdminScreen({ lang = "en", onBack }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "health" | "audit">("roles");

  const rolesMatrix = [
    {
      role: "Investigator",
      badgeColor: "#0F4C81",
      permissions: ["AI Investigation Workspace", "FIR Case Access", "Network Graph Analysis", "Investigation Reports"],
    },
    {
      role: "Crime Analyst",
      badgeColor: "#8B5CF6",
      permissions: ["Crime Analytics & Intelligence", "Hotspot Detection", "Network Analysis", "AI Pattern Discovery"],
    },
    {
      role: "Senior Officer",
      badgeColor: "#F59E0B",
      permissions: ["State Command Dashboard", "Critical Alert Escalations", "Crime Analytics", "Report Review & Approval"],
    },
    {
      role: "Administrator",
      badgeColor: "#EF4444",
      permissions: ["User & Role Management", "Permissions Matrix", "System Health Monitoring", "Complete Audit Logs"],
    },
  ];

  const auditLogs = [
    { officer: "KSP-2847 (Insp. R. Kumar)", action: "Viewed FIR-2024-08431", resource: "FIR Register", time: "15:32:04", status: "Authorized" },
    { officer: "KSP-1102 (SI Priya M.)", action: "Generated Report #RPT-2024-0492", resource: "Reports Engine", time: "15:28:11", status: "Authorized" },
    { officer: "KSP-3901 (CI Suresh T.)", action: "Executed AI Network Query", resource: "AI Copilot Engine", time: "15:15:40", status: "Authorized" },
    { officer: "KSP-2847 (Insp. R. Kumar)", action: "Exported PDF Report", resource: "Storage / PDF", time: "14:55:20", status: "Authorized" },
    { officer: "KSP-0042 (Admin User)", action: "Updated Role Permission Matrix", resource: "RBAC Module", time: "14:10:00", status: "Authorized" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <Shield size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>System Administration</Text>
            <Text style={styles.screenSub}>Enterprise security, role management and system health monitoring</Text>
          </View>
        </View>
      </View>

      {/* Admin Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "roles" && styles.tabItemActive]}
          onPress={() => setActiveTab("roles")}
        >
          <Users size={14} color={activeTab === "roles" ? "#FFFFFF" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "roles" && styles.tabTextActive]}>Roles & RBAC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "health" && styles.tabItemActive]}
          onPress={() => setActiveTab("health")}
        >
          <Activity size={14} color={activeTab === "health" ? "#FFFFFF" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "health" && styles.tabTextActive]}>System Health</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "audit" && styles.tabItemActive]}
          onPress={() => setActiveTab("audit")}
        >
          <FileSpreadsheet size={14} color={activeTab === "audit" ? "#FFFFFF" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "audit" && styles.tabTextActive]}>Audit Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Roles & RBAC */}
      {activeTab === "roles" && (
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Role-Based Access Control (RBAC)</Text>
          <Text style={styles.sectionSub}>Enterprise security permissions tailored for Karnataka State Police</Text>

          <View style={styles.rolesGrid}>
            {rolesMatrix.map((r, idx) => (
              <View key={idx} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <View style={[styles.roleBadge, { backgroundColor: r.badgeColor }]}>
                    <Text style={styles.roleBadgeText}>{r.role.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.roleActiveCount}>Active Users: 240+</Text>
                </View>

                <View style={styles.permList}>
                  {r.permissions.map((perm, pIdx) => (
                    <View key={pIdx} style={styles.permItem}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.permText}>{perm}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tab 2: System Health */}
      {activeTab === "health" && (
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>System Health & Infrastructure</Text>

          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Server size={20} color="#10B981" />
              <Text style={styles.healthVal}>100%</Text>
              <Text style={styles.healthLbl}>KSP Cloud Uptime</Text>
            </View>

            <View style={styles.healthCard}>
              <Database size={20} color="#0F4C81" />
              <Text style={styles.healthVal}>1,100+</Text>
              <Text style={styles.healthLbl}>Synced Police Stations</Text>
            </View>

            <View style={styles.healthCard}>
              <Cpu size={20} color="#8B5CF6" />
              <Text style={styles.healthVal}>24ms</Text>
              <Text style={styles.healthLbl}>AI Inference Speed</Text>
            </View>

            <View style={styles.healthCard}>
              <Lock size={20} color="#10B981" />
              <Text style={styles.healthVal}>256-bit</Text>
              <Text style={styles.healthLbl}>TLS Encryption</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === "audit" && (
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>System Audit Log Register</Text>

          <View style={styles.auditList}>
            {auditLogs.map((log, idx) => (
              <View key={idx} style={styles.auditRow}>
                <View style={styles.auditTop}>
                  <Text style={styles.auditOfficer}>{log.officer}</Text>
                  <Text style={styles.auditTime}>{log.time}</Text>
                </View>
                <Text style={styles.auditAction}>
                  Action: <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F172A" }}>{log.action}</Text> · Resource: {log.resource}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>STATUS: {log.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  titleSection: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 24,
    color: "#0F172A",
  },
  screenSub: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#64748B",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: "#0F4C81",
  },
  tabText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
  },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  sectionSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    marginBottom: 12,
  },
  rolesGrid: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  roleActiveCount: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  permList: {
    gap: 4,
  },
  permItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  permText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#334155",
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  healthCard: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  healthVal: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 22,
    color: "#0F172A",
    marginVertical: 4,
  },
  healthLbl: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },
  auditList: {
    gap: 8,
    marginTop: 8,
  },
  auditRow: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
  },
  auditTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  auditOfficer: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  auditTime: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#94A3B8",
  },
  auditAction: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#334155",
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: "Inter-Bold",
    fontSize: 8,
    color: "#15803D",
  },
});
