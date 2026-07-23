/**
 * components/modals/AccusedProfileModal.tsx
 * CrimeLens AI — Accused Intelligence Profile Modal
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  User,
  ShieldAlert,
  FileText,
  Network,
  Brain,
  Car,
  Phone,
  MapPin,
  Users,
  ChevronRight,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react-native";

export type AccusedProfileData = {
  id: string;
  name: string;
  aliases?: string[];
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  age?: number;
  gender?: string;
  district: string;
  previousFIRCount: number;
  crimeCategories: string[];
  associates: Array<{ name: string; role?: string; risk?: string }>;
  vehicles: string[];
  phoneNumbers: string[];
  frequentLocations: string[];
  crimeHistory: Array<{ firNumber: string; crimeType: string; date: string; status: string }>;
  aiBehavioralPattern?: {
    text: string;
    confidence: number;
    supportingCasesCount: number;
    locationsCount: number;
  };
};

export type AccusedProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  profileData: AccusedProfileData | null;
  onInvestigateAI?: (accusedName: string) => void;
  onOpenNetwork?: (accusedId: string) => void;
  onOpenFIR?: (firNumber: string) => void;
  onGenerateReport?: (accusedName: string) => void;
};

export function AccusedProfileModal({
  visible,
  onClose,
  profileData,
  onInvestigateAI,
  onOpenNetwork,
  onOpenFIR,
  onGenerateReport,
}: AccusedProfileModalProps) {
  if (!profileData) return null;

  const riskColor =
    profileData.riskLevel === "CRITICAL"
      ? "#DC2626"
      : profileData.riskLevel === "HIGH"
      ? "#EF4444"
      : profileData.riskLevel === "MEDIUM"
      ? "#F59E0B"
      : "#10B981";

  const defaultProfile: AccusedProfileData = {
    id: profileData.id || "ACC-8921",
    name: profileData.name || "Ravi S.",
    aliases: profileData.aliases || ["Bullet Ravi", "Ravi Bengaluru"],
    riskLevel: profileData.riskLevel || "HIGH",
    status: profileData.status || "Under Police Surveillance",
    age: profileData.age || 34,
    gender: profileData.gender || "Male",
    district: profileData.district || "Bengaluru City",
    previousFIRCount: profileData.previousFIRCount || 6,
    crimeCategories: profileData.crimeCategories || ["Vehicle Theft", "Burglary", "Robbery"],
    associates: profileData.associates || [
      { name: "Suresh K.", role: "Primary Co-Accused", risk: "HIGH" },
      { name: "Ramesh M.", role: "Receiver of Stolen Goods", risk: "MEDIUM" },
      { name: "Vinay T.", role: "Lookout / Driver", risk: "MEDIUM" },
    ],
    vehicles: profileData.vehicles || ["KA-01-AB-1234 (Black Pulsar)", "KA-05-XY-9876 (White Swift)"],
    phoneNumbers: profileData.phoneNumbers || ["+91 98450-97842", "+91 94481-22345"],
    frequentLocations: profileData.frequentLocations || [
      "Bengaluru City Market",
      "Electronic City Phase 1",
      "Tumakuru National Highway",
    ],
    crimeHistory: profileData.crimeHistory || [
      { firNumber: "FIR-2024-08431", crimeType: "Vehicle Theft", date: "18 Jul 2024", status: "Under Investigation" },
      { firNumber: "FIR-2023-01981", crimeType: "Armed Burglary", date: "04 Nov 2023", status: "Chargesheeted" },
      { firNumber: "FIR-2022-00411", crimeType: "Motor Theft", date: "12 Mar 2022", status: "Convicted / Bailed" },
      { firNumber: "FIR-2021-09812", crimeType: "Robbery", date: "22 Aug 2021", status: "Chargesheeted" },
    ],
    aiBehavioralPattern: profileData.aiBehavioralPattern || {
      text: "Subject activity frequently overlaps with late-evening vehicle theft incidents across Bengaluru and Tumakuru districts.",
      confidence: 92,
      supportingCasesCount: 6,
      locationsCount: 3,
    },
  };

  const p = defaultProfile;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarBox, { borderColor: riskColor }]}>
                <User size={24} color="#0F4C81" />
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{p.name}</Text>
                  <View style={[styles.riskTag, { backgroundColor: riskColor }]}>
                    <Text style={styles.riskTagText}>{p.riskLevel} RISK</Text>
                  </View>
                </View>
                <Text style={styles.subText}>
                  ID: {p.id} · Aliases: {p.aliases?.join(", ")}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Specs */}
            <View style={styles.specGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Current Status</Text>
                <Text style={styles.specValue}>{p.status}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>District</Text>
                <Text style={styles.specValue}>{p.district}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Total FIRs</Text>
                <Text style={[styles.specValue, { color: "#EF4444" }]}>{p.previousFIRCount} Cases</Text>
              </View>
            </View>

            {/* AI Behavioral Pattern Box (Investigative Intelligence) */}
            {p.aiBehavioralPattern && (
              <View style={styles.aiPatternBox}>
                <View style={styles.aiHeader}>
                  <Brain size={18} color="#0F4C81" />
                  <Text style={styles.aiTitle}>AI Behavioral Intelligence</Text>
                  <View style={styles.confBadge}>
                    <Text style={styles.confText}>{p.aiBehavioralPattern.confidence}% Match</Text>
                  </View>
                </View>
                <Text style={styles.aiDesc}>"{p.aiBehavioralPattern.text}"</Text>
                <View style={styles.aiStatsRow}>
                  <Text style={styles.aiStat}>
                    <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F172A" }}>
                      {p.aiBehavioralPattern.supportingCasesCount}
                    </Text>{" "}
                    Supporting Cases
                  </Text>
                  <Text style={styles.aiStat}>·</Text>
                  <Text style={styles.aiStat}>
                    <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F172A" }}>
                      {p.aiBehavioralPattern.locationsCount}
                    </Text>{" "}
                    Overlapping Zones
                  </Text>
                </View>
              </View>
            )}

            {/* Associates & Vehicles */}
            <View style={styles.sectionRow}>
              {/* Associates */}
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.sectionTitle}>Known Associates ({p.associates.length})</Text>
                {p.associates.map((assoc, idx) => (
                  <View key={idx} style={styles.associateItem}>
                    <Users size={12} color="#0F4C81" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assocName}>{assoc.name}</Text>
                      <Text style={styles.assocRole}>{assoc.role || "Associate"}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Vehicles & Phones */}
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.sectionTitle}>Vehicles & Contact</Text>
                {p.vehicles.map((v, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Car size={12} color="#0F4C81" />
                    <Text style={styles.itemRowText} numberOfLines={1}>
                      {v}
                    </Text>
                  </View>
                ))}
                {p.phoneNumbers.map((ph, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Phone size={12} color="#10B981" />
                    <Text style={styles.itemRowText}>{ph}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Frequent Locations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequent Location Clusters</Text>
              <View style={styles.locRow}>
                {p.frequentLocations.map((loc, idx) => (
                  <View key={idx} style={styles.locChip}>
                    <MapPin size={11} color="#0F4C81" />
                    <Text style={styles.locChipText}>{loc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Crime History Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historical FIR Timeline</Text>
              {p.crimeHistory.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.historyCard}
                  onPress={() => onOpenFIR && onOpenFIR(item.firNumber)}
                >
                  <FileText size={16} color="#0F4C81" />
                  <View style={{ flex: 1 }}>
                    <View style={styles.historyTop}>
                      <Text style={styles.historyFir}>{item.firNumber}</Text>
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.historyType}>
                      {item.crimeType} · <Text style={{ color: "#64748B" }}>{item.status}</Text>
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionPrimary}
              onPress={() => onInvestigateAI && onInvestigateAI(p.name)}
            >
              <Brain size={16} color="#FFFFFF" />
              <Text style={styles.actionPrimaryText}>Investigate AI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSecondary}
              onPress={() => onOpenNetwork && onOpenNetwork(p.id)}
            >
              <Network size={16} color="#0F4C81" />
              <Text style={styles.actionSecondaryText}>Network</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSecondary}
              onPress={() => onGenerateReport && onGenerateReport(p.name)}
            >
              <FileText size={16} color="#0F4C81" />
              <Text style={styles.actionSecondaryText}>Report</Text>
            </TouchableOpacity>
          </View>
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
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: "rgba(15, 76, 129, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 20,
    color: "#0F172A",
  },
  riskTag: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  riskTagText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  subText: {
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
  specGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  specBox: {
    flex: 1,
  },
  specLabel: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#64748B",
    marginBottom: 2,
  },
  specValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F172A",
  },
  aiPatternBox: {
    backgroundColor: "rgba(15, 76, 129, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(15, 76, 129, 0.2)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  aiTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F4C81",
    flex: 1,
  },
  confBadge: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  confText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  aiDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 8,
  },
  aiStatsRow: {
    flexDirection: "row",
    gap: 6,
  },
  aiStat: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  section: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 8,
  },
  associateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  assocName: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#0F172A",
  },
  assocRole: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  itemRowText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#334155",
    flex: 1,
  },
  locRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  locChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  locChipText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#334155",
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyFir: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 12,
    color: "#0F4C81",
  },
  historyDate: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
  },
  historyType: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#334155",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionPrimary: {
    flex: 2,
    backgroundColor: "#0F4C81",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionPrimaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionSecondaryText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F4C81",
  },
});
