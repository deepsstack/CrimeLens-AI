/**
 * components/modals/AlertCenterModal.tsx
 * CrimeLens AI — {tr("Intelligence Alert Center", "ಗುಪ್ತಚರ ಎಚ್ಚರಿಕೆ ಕೇಂದ್ರ")} Modal
 */

import React, { useState } from "react";
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
  Bell,
  AlertTriangle,
  Brain,
  ShieldAlert,
  CheckCheck,
  X,
  ChevronRight,
  Filter,
  CheckCircle,
} from "lucide-react-native";

export type AlertItem = {
  id: string;
  type:
  | "Repeat Offender"
  | "Crime Spike"
  | "New Network Link"
  | "High-Risk Zone"
  | "Case Escalated"
  | "Report Ready"
  | "Task Due"
  | "Task Overdue"
  | "New Evidence"
  | "Case Reassigned"
  | "Status Changed";
  severity: "Critical" | "High" | "Medium";
  district: string;
  timestamp: string;
  description: string;
  relatedFIR?: string;
  read?: boolean;
};

export type AlertCenterModalProps = {
  visible: boolean;
  lang?: "en" | "kn";
  onClose: () => void;
  onOpenFIR?: (firNumber: string) => void;
  onOpenAIWorkspace?: () => void;
  onOpenHotspot?: (district: string) => void;
};

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: "alt1",
    type: "Repeat Offender",
    severity: "Critical",
    district: "Bengaluru City",
    timestamp: "10 min ago",
    description: "Known repeat offender Ravi S. (3 prior convictions) sighted near City Market. Immediate apprehension advised.",
    relatedFIR: "FIR-2024-08431",
  },
  {
    id: "alt2",
    type: "Crime Spike",
    severity: "Critical",
    district: "Mysuru Central",
    timestamp: "25 min ago",
    description: "Theft incidents in Mysuru Central up 34% in the last 6 hours. Pattern consistent with organised syndicate activity.",
    relatedFIR: "FIR-2024-08432",
  },
  {
    id: "alt3",
    type: "New Network Link",
    severity: "High",
    district: "Hubballi",
    timestamp: "1 hour ago",
    description: "AI Criminal Network Engine discovered hidden association between Suresh K. and 2 previous vehicle theft cases.",
    relatedFIR: "FIR-2023-01981",
  },
  {
    id: "alt4",
    type: "High-Risk Zone",
    severity: "High",
    district: "Electronic City",
    timestamp: "2 hours ago",
    description: "Electronic City flagged as high-risk zone (Risk Score 87/100) for late-evening motor theft tonight.",
  },
  {
    id: "alt5",
    type: "Case Escalated",
    severity: "Critical",
    district: "Mangaluru Port",
    timestamp: "3 hours ago",
    description: "FIR-2024-08425 (Drug Offence) escalated to Senior Police Officer review due to inter-state narcotics link.",
    relatedFIR: "FIR-2024-08425",
  },
  {
    id: "alt6",
    type: "Report Ready",
    severity: "Medium",
    district: "Belagavi",
    timestamp: "4 hours ago",
    description: "AI Investigation Report #RPT-2024-0492 generated and ready for officer approval.",
  },
  {
    id: "alt7",
    type: "Task Overdue",
    severity: "Critical",
    district: "Bengaluru City",
    timestamp: "5 min ago",
    description: "Investigation task 'Verify CCTV footage' is overdue and requires officer attention.",
    relatedFIR: "FIR-2024-08431",
  },
  {
    id: "alt8",
    type: "New Evidence",
    severity: "High",
    district: "Mysuru Central",
    timestamp: "18 min ago",
    description: "New evidence attachment was added to an active investigation.",
    relatedFIR: "FIR-2024-08432",
  },
  {
    id: "alt9",
    type: "Case Reassigned",
    severity: "High",
    district: "Hubballi",
    timestamp: "40 min ago",
    description: "An active case has been reassigned to a new investigating officer.",
    relatedFIR: "FIR-2023-01981",
  },
  {
    id: "alt10",
    type: "Status Changed",
    severity: "Medium",
    district: "Mangaluru Port",
    timestamp: "1 hour ago",
    description: "Case status changed from Open to Under Investigation.",
    relatedFIR: "FIR-2024-08425",
  },
];

export function AlertCenterModal({
  visible,
  lang = "en",
  onClose,
  onOpenFIR,
  onOpenAIWorkspace,
  onOpenHotspot,
}: AlertCenterModalProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(DEFAULT_ALERTS);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const tr = (en: string, kn: string) => (lang === "kn" ? kn : en);

  const alertTypeLabel = (type: AlertItem["type"]) => {
    const labels: Record<AlertItem["type"], string> = {
      "Repeat Offender": tr("Repeat Offender", "ಪುನರಾವರ್ತಿತ ಆರೋಪಿ"),
      "Crime Spike": tr("Crime Spike", "ಅಪರಾಧ ಏರಿಕೆ"),
      "New Network Link": tr("New Network Link", "ಹೊಸ ಜಾಲ ಸಂಪರ್ಕ"),
      "High-Risk Zone": tr("High-Risk Zone", "ಹೆಚ್ಚಿನ ಅಪಾಯ ಪ್ರದೇಶ"),
      "Case Escalated": tr("Case Escalated", "ಪ್ರಕರಣ ಮೇಲ್ದರ್ಜೆಗೆ"),
      "Report Ready": tr("Report Ready", "ವರದಿ ಸಿದ್ಧ"),
      "Task Due": tr("Task Due", "ಕಾರ್ಯ ಬಾಕಿ"),
      "Task Overdue": tr("Task Overdue", "ಕಾರ್ಯ ಅವಧಿ ಮೀರಿದೆ"),
      "New Evidence": tr("New Evidence", "ಹೊಸ ಸಾಕ್ಷ್ಯ"),
      "Case Reassigned": tr("Case Reassigned", "ಪ್ರಕರಣ ಮರುಹಂಚಿಕೆ"),
      "Status Changed": tr("Status Changed", "ಸ್ಥಿತಿ ಬದಲಾಗಿದೆ"),
    };
    return labels[type];
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === "Critical") return a.severity === "Critical";
    if (activeFilter === "High Priority") return a.severity === "High" || a.severity === "Critical";
    if (activeFilter === "AI Alerts") return a.type === "New Network Link" || a.type === "High-Risk Zone";
    if (activeFilter === "Case Updates")
      return ["Case Escalated", "Report Ready", "Task Due", "Task Overdue", "New Evidence", "Case Reassigned", "Status Changed"].includes(a.type);
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellBadge}>
                <Bell size={20} color="#0F4C81" />
                {unreadCount > 0 && <View style={styles.unreadDot} />}
              </View>
              <View>
                <Text style={styles.headerTitle}>{tr("Intelligence Alert Center", "ಗುಪ್ತಚರ ಎಚ್ಚರಿಕೆ ಕೇಂದ್ರ")}</Text>
                <Text style={styles.headerSub}>
                  {unreadCount} {tr("unread · Real-time police intelligence notifications", "ಓದದವು · ನೈಜ-ಸಮಯ ಪೊಲೀಸ್ ಗುಪ್ತಚರ ಸೂಚನೆಗಳು")}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Filters & Actions */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {["All", "Critical", "High Priority", "AI Alerts", "Case Updates"].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                    {f === "All"
                      ? tr("All", "ಎಲ್ಲಾ")
                      : f === "Critical"
                        ? tr("Critical", "ಗಂಭೀರ")
                        : f === "High Priority"
                          ? tr("High Priority", "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ")
                          : f === "AI Alerts"
                            ? tr("AI Alerts", "AI ಎಚ್ಚರಿಕೆಗಳು")
                            : tr("Case Updates", "ಪ್ರಕರಣ ನವೀಕರಣಗಳು")}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
              <CheckCheck size={14} color="#0F4C81" />
              <Text style={styles.markReadText}>{tr("Mark All Read", "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ")}</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {filteredAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle size={32} color="#10B981" />
                <Text style={styles.emptyTitle}>{tr("No Active Alerts", "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ")}</Text>
                <Text style={styles.emptySub}>{tr("All intelligence notifications have been reviewed.", "ಎಲ್ಲಾ ಗುಪ್ತಚರ ಸೂಚನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.")}</Text>
              </View>
            ) : (
              filteredAlerts.map((item) => {
                const sevColor =
                  item.severity === "Critical"
                    ? "#DC2626"
                    : item.severity === "High"
                      ? "#EA580C"
                      : "#F59E0B";

                return (
                  <View
                    key={item.id}
                    style={[styles.alertCard, item.read && styles.alertCardRead]}
                  >
                    <View style={styles.alertTop}>
                      <View style={styles.alertTypeRow}>
                        <View style={[styles.sevBadge, { backgroundColor: sevColor }]}>
                          <Text style={styles.sevBadgeText}>{item.severity.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.alertType}>{alertTypeLabel(item.type)}</Text>
                      </View>
                      <Text style={styles.alertTime}>{item.timestamp}</Text>
                    </View>

                    <Text style={styles.alertDesc}>{item.description}</Text>

                    <View style={styles.alertBottom}>
                      <Text style={styles.districtTag}>📍 {item.district}</Text>
                      {item.relatedFIR && (
                        <TouchableOpacity
                          style={styles.firChip}
                          onPress={() => onOpenFIR && onOpenFIR(item.relatedFIR!)}
                        >
                          <Text style={styles.firChipText}>{item.relatedFIR}</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.actionsRight}>
                        <TouchableOpacity
                          style={styles.btnAction}
                          onPress={() => {
                            if (item.relatedFIR && onOpenFIR) {
                              onOpenFIR(item.relatedFIR);
                            } else if (onOpenAIWorkspace) {
                              onOpenAIWorkspace();
                            }
                          }}
                        >
                          <Text style={styles.btnActionText}>{tr("Investigate", "ತನಿಖೆ")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.btnDismiss}
                          onPress={() => handleDismiss(item.id)}
                        >
                          <X size={14} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
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
    maxHeight: "90%",
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
  bellBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15, 76, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  headerTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 20,
    color: "#0F172A",
  },
  headerSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  closeBtn: {
    padding: 6,
  },
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  filterRow: {
    gap: 6,
    paddingRight: 12,
  },
  filterChip: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterChipActive: {
    backgroundColor: "#0F4C81",
  },
  filterChipText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  markReadText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#0F4C81",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
    marginTop: 8,
  },
  emptySub: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#64748B",
  },
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  alertCardRead: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
    opacity: 0.85,
  },
  alertTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  alertTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sevBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sevBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  alertType: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F172A",
  },
  alertTime: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#94A3B8",
  },
  alertDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 10,
  },
  alertBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  districtTag: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  firChip: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  firChipText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#0F4C81",
  },
  actionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnAction: {
    backgroundColor: "#0F4C81",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnActionText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  btnDismiss: {
    padding: 4,
  },
});
