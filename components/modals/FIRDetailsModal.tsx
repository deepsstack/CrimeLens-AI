/**
 * components/modals/FIRDetailsModal.tsx
 * CrimeLens AI — FIR Investigation Details Modal
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
  FileText,
  MapPin,
  User,
  Shield,
  Clock,
  AlertCircle,
  Brain,
  Network,
  Share2,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react-native";

export type FIRDetailsData = {
  number: string;
  crimeType: string;
  crimeHead?: string;
  district: string;
  policeStation?: string;
  incidentDate?: string;
  incidentTime?: string;
  status: "Open" | "Under Investigation" | "Closed" | "Escalated";
  priority: "High" | "Medium" | "Low";
  officerAssigned: string;
  summary?: string;
  accused?: string[];
  victims?: string[];
  complainant?: string;
  legalSections?: string[];
  locationName?: string;
  gpsCoords?: string;
  timelineSteps?: Array<{ step: string; status: "completed" | "active" | "pending"; date?: string }>;
  relatedFIRs?: string[];
  aiInsightText?: string;
  aiConfidence?: number;
};

export type FIRDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  firData: FIRDetailsData | null;
  onInvestigateAI?: (firNumber: string) => void;
  onOpenNetwork?: (firNumber: string) => void;
  onGenerateReport?: (firNumber: string) => void;
  onOpenExplainWhy?: (context: string) => void;
  onOpenAccusedProfile?: (accusedName: string) => void;
};

export function FIRDetailsModal({
  visible,
  onClose,
  firData,
  onInvestigateAI,
  onOpenNetwork,
  onGenerateReport,
  onOpenExplainWhy,
  onOpenAccusedProfile,
}: FIRDetailsModalProps) {
  if (!firData) return null;

  const number = firData.number;
  const status = firData.status;
  const priority = firData.priority;

  const statusBg =
    status === "Escalated"
      ? "#FEE2E2"
      : status === "Open"
      ? "#FEF3C7"
      : status === "Under Investigation"
      ? "#E0F2FE"
      : "#DCFCE7";
  const statusColor =
    status === "Escalated"
      ? "#EF4444"
      : status === "Open"
      ? "#D97706"
      : status === "Under Investigation"
      ? "#0F4C81"
      : "#10B981";

  const priorityColor = priority === "High" ? "#EF4444" : priority === "Medium" ? "#F59E0B" : "#10B981";

  const defaultTimeline = firData.timelineSteps || [
    { step: "FIR Registered", status: "completed", date: "18 Jul 2024, 09:30 AM" },
    { step: "Investigation Started", status: "completed", date: "18 Jul 2024, 11:15 AM" },
    { step: "Evidence Collected", status: "completed", date: "19 Jul 2024, 02:40 PM" },
    { step: "Suspect Identified", status: "active", date: "20 Jul 2024, 10:00 AM" },
    { step: "Chargesheet Filing", status: "pending", date: "Pending Senior Review" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconChip}>
                <FileText size={20} color="#0F4C81" />
              </View>
              <View>
                <View style={styles.topMeta}>
                  <Text style={styles.firNumber}>{number}</Text>
                  <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
                    <Text style={[styles.priorityText, { color: priorityColor }]}>{priority} Priority</Text>
                  </View>
                </View>
                <Text style={styles.crimeCategory}>
                  {firData.crimeType} {firData.crimeHead ? `· ${firData.crimeHead}` : ""}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status & Officer Strip */}
            <View style={styles.metaStrip}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Status</Text>
                <View style={[styles.statusChip, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                </View>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>District & Station</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {firData.district} · {firData.policeStation || "Central PS"}
                </Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Assigned Officer</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {firData.officerAssigned}
                </Text>
              </View>
            </View>

            {/* Case Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Case Summary</Text>
              <Text style={styles.summaryText}>
                {firData.summary ||
                  `Incident reported on ${firData.incidentDate || "18 Jul 2024"} at ${
                    firData.incidentTime || "23:15 HRS"
                  }. Complainant reported illegal entry and motor vehicle theft from designated parking bay. Preliminary physical evidence collected; CCTV footage undergoing AI forensic analysis.`}
              </Text>
            </View>

            {/* Involved Entities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Involved Entities</Text>
              <View style={styles.entityGrid}>
                {/* Accused */}
                <View style={styles.entityCard}>
                  <Text style={styles.entityLabel}>Accused / Suspects</Text>
                  {(firData.accused || ["Ravi S. (Primary)", "Suresh K. (Associate)"]).map((acc, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.accusedChip}
                      onPress={() => onOpenAccusedProfile && onOpenAccusedProfile(acc.replace(/\s*\(.*\)/, ""))}
                    >
                      <User size={13} color="#EF4444" />
                      <Text style={styles.accusedChipText}>{acc}</Text>
                      <ChevronRight size={12} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Complainant & Victim */}
                <View style={styles.entityCard}>
                  <Text style={styles.entityLabel}>Complainant & Victim</Text>
                  <Text style={styles.entityText}>Complainant: {firData.complainant || "Meena S."}</Text>
                  <Text style={styles.entityText}>Victims: {(firData.victims || ["Anand R."]).join(", ")}</Text>
                </View>
              </View>
            </View>

            {/* Legal Sections & Location */}
            <View style={styles.sectionRow}>
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.sectionTitle}>Legal Sections</Text>
                <View style={styles.sectionsRow}>
                  {(firData.legalSections || ["IPC Sec 379", "IPC Sec 411", "IPC Sec 34"]).map((sec) => (
                    <View key={sec} style={styles.secTag}>
                      <Text style={styles.secTagText}>{sec}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.sectionTitle}>Location & GPS</Text>
                <View style={styles.locBox}>
                  <MapPin size={14} color="#0F4C81" />
                  <Text style={styles.locText} numberOfLines={2}>
                    {firData.locationName || "Electronic City Phase 1"} ({firData.gpsCoords || "12.8399° N, 77.6770° E"})
                  </Text>
                </View>
              </View>
            </View>

            {/* Case Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Case Progression Timeline</Text>
              <View style={styles.timelineList}>
                {defaultTimeline.map((item, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineIconCol}>
                      <View
                        style={[
                          styles.timelineDot,
                          item.status === "completed"
                            ? styles.dotDone
                            : item.status === "active"
                            ? styles.dotActive
                            : styles.dotPending,
                        ]}
                      >
                        {item.status === "completed" && <CheckCircle2 size={10} color="#FFFFFF" />}
                      </View>
                      {idx < defaultTimeline.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStepName}>{item.step}</Text>
                      {item.date && <Text style={styles.timelineStepDate}>{item.date}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Case Insight */}
            <View style={styles.aiInsightCard}>
              <View style={styles.aiHeader}>
                <Brain size={18} color="#0F4C81" />
                <Text style={styles.aiTitle}>AI CrimeLens Insight</Text>
                <View style={styles.confidenceChip}>
                  <Text style={styles.confidenceText}>{firData.aiConfidence || 89}% Confidence</Text>
                </View>
              </View>
              <Text style={styles.aiText}>
                {firData.aiInsightText ||
                  "Three historical FIRs (FIR-2023-01981, FIR-2022-00411) demonstrate high similarity in incident location, night timing (22:00–02:00 HRS), and recurring modus operandi linked to suspect Ravi S."}
              </Text>
              <View style={styles.aiActionsRow}>
                <TouchableOpacity
                  style={styles.explainBtn}
                  onPress={() =>
                    onOpenExplainWhy &&
                    onOpenExplainWhy(
                      firData.aiInsightText || `Pattern analysis for ${number}`
                    )
                  }
                >
                  <Text style={styles.explainBtnText}>Explain Why</Text>
                </TouchableOpacity>
                {firData.relatedFIRs && firData.relatedFIRs.length > 0 && (
                  <Text style={styles.relatedCount}>
                    {firData.relatedFIRs.length} Related FIRs linked
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => onInvestigateAI && onInvestigateAI(number)}
            >
              <Brain size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>Investigate with AI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => onOpenNetwork && onOpenNetwork(number)}
            >
              <Network size={16} color="#0F4C81" />
              <Text style={styles.actionBtnSecondaryText}>Open Network</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => onGenerateReport && onGenerateReport(number)}
            >
              <FileText size={16} color="#0F4C81" />
              <Text style={styles.actionBtnSecondaryText}>Report</Text>
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
  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(15, 76, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  topMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  firNumber: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 20,
    color: "#0F172A",
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 10,
  },
  crimeCategory: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#64748B",
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  metaStrip: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  metaBox: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F172A",
  },
  statusChip: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
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
  summaryText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
  },
  entityGrid: {
    gap: 8,
  },
  entityCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
  },
  entityLabel: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#64748B",
    marginBottom: 6,
  },
  accusedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
  },
  accusedChipText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#991B1B",
    flex: 1,
  },
  entityText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    marginBottom: 2,
  },
  sectionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  secTag: {
    backgroundColor: "rgba(15, 76, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(15, 76, 129, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  secTagText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  locBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 8,
  },
  locText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#334155",
    flex: 1,
    lineHeight: 16,
  },
  timelineList: {
    paddingLeft: 6,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  timelineIconCol: {
    alignItems: "center",
    width: 18,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: {
    backgroundColor: "#10B981",
  },
  dotActive: {
    backgroundColor: "#0F4C81",
  },
  dotPending: {
    backgroundColor: "#CBD5E1",
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E2E8F0",
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepName: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F172A",
  },
  timelineStepDate: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  aiInsightCard: {
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
    marginBottom: 8,
  },
  aiTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F4C81",
    flex: 1,
  },
  confidenceChip: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  confidenceText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  aiText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 10,
  },
  aiActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  explainBtn: {
    backgroundColor: "#0F4C81",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  explainBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  relatedCount: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionBtnPrimary: {
    flex: 2,
    backgroundColor: "#0F4C81",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionBtnSecondaryText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F4C81",
  },
});
