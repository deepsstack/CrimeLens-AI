/**
 * screens/ReportsScreen.tsx
 * CrimeLens AI — Investigation Reports Screen
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Share2,
  Eye,
  Brain,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import { ReportDetailModal, type ReportItem } from "../components/modals/ReportDetailModal";

export type ReportsScreenProps = {
  lang?: "en" | "kn";
  onOpenFIR?: (firNumber: string) => void;
  onOpenNetwork?: (firNumber: string) => void;
  onOpenAIWorkspace?: (query?: string) => void;
};

const MOCK_REPORTS: ReportItem[] = [
  {
    id: "RPT-2024-0492",
    firNumber: "FIR-2024-08431",
    crimeType: "Motor Vehicle Theft",
    district: "Bengaluru South",
    assignedOfficer: "Insp. V. Kumar",
    generatedDate: "2026-07-20",
    status: "Completed",
    accusedName: "Ravi S.",
    confidenceScore: 94,
    summaryText: "Comprehensive investigation report covering overnight vehicle theft incident at Electronic City Phase 1. Linked suspect Ravi S. with 3 prior conviction records.",
  },
  {
    id: "RPT-2024-0488",
    firNumber: "FIR-2024-08432",
    crimeType: "Cyber Financial Fraud",
    district: "Mysuru Central",
    assignedOfficer: "SI Priya M.",
    generatedDate: "2026-07-19",
    status: "Completed",
    accusedName: "Mohammed K.",
    confidenceScore: 91,
    summaryText: "Cyber Cell analysis of phishing syndicate targeting bank account credentials in Mysuru Central zone.",
  },
  {
    id: "RPT-2024-0475",
    firNumber: "FIR-2024-08425",
    crimeType: "Inter-State Drug Offence",
    district: "Mangaluru Port",
    assignedOfficer: "CI Suresh T.",
    generatedDate: "2026-07-18",
    status: "Reviewed",
    accusedName: "Unknown Syndicate",
    confidenceScore: 88,
    summaryText: "Narcotics intelligence summary detailing maritime cargo search operations and suspect vehicle sightings.",
  },
  {
    id: "RPT-2024-0461",
    firNumber: "FIR-2023-01981",
    crimeType: "Armed Burglary",
    district: "Mysuru",
    assignedOfficer: "SI Anand B.",
    generatedDate: "2026-07-15",
    status: "Completed",
    accusedName: "Ravi S. & Co-Accused",
    confidenceScore: 96,
    summaryText: "Historical case summary compiled for chargesheet filing in Mysuru Principal District Court.",
  },
];

export function ReportsScreen({
  lang = "en",
  onOpenFIR,
  onOpenNetwork,
  onOpenAIWorkspace,
}: ReportsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports = MOCK_REPORTS.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.firNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.crimeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateNewReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newReport: ReportItem = {
        id: `RPT-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        firNumber: "FIR-2024-08431",
        crimeType: "AI Comprehensive Investigation",
        district: "Bengaluru City",
        assignedOfficer: "Insp. Rajesh Kumar",
        generatedDate: new Date().toISOString().split("T")[0],
        status: "Completed",
        accusedName: "Ravi S.",
        confidenceScore: 94,
        summaryText: "AI-compiled full investigation summary report covering criminal network links, geographic hotspots, and recommended prosecution actions.",
      };
      setSelectedReport(newReport);
      setDetailModalVisible(true);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <FileText size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Investigation Reports</Text>
            <Text style={styles.screenSub}>AI-assisted investigation documentation and intelligence summaries</Text>
          </View>
        </View>
      </View>

      {/* Generate Report Button */}
      <TouchableOpacity
        style={styles.generateBtn}
        onPress={handleGenerateNewReport}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.generateBtnText}>Generate AI Investigation Report</Text>
            <Brain size={16} color="#FFFFFF" style={{ marginLeft: "auto" }} />
          </>
        )}
      </TouchableOpacity>

      {/* Search & Filter Bar */}
      <View style={styles.searchBox}>
        <Search size={16} color="#0F4C81" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search FIR or Report ID..."
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={16} color="#0F4C81" />
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <View style={styles.reportsSection}>
        <Text style={styles.sectionTitle}>Generated Reports Register ({filteredReports.length})</Text>

        {filteredReports.map((item) => (
          <View key={item.id} style={styles.reportCard}>
            <View style={styles.cardTop}>
              <View style={styles.idGroup}>
                <FileText size={16} color="#0F4C81" />
                <Text style={styles.reportId}>{item.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{item.generatedDate}</Text>
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.firText}>
                FIR: <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F4C81" }}>{item.firNumber}</Text>
              </Text>
              <Text style={styles.metaSub}>
                {item.crimeType} · {item.district}
              </Text>
              <Text style={styles.officerSub}>Officer: {item.assignedOfficer}</Text>
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => {
                  setSelectedReport(item);
                  setDetailModalVisible(true);
                }}
              >
                <Eye size={14} color="#FFFFFF" />
                <Text style={styles.actionPrimaryText}>View Report</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => {
                  setSelectedReport(item);
                  setDetailModalVisible(true);
                }}
              >
                <Download size={14} color="#0F4C81" />
                <Text style={styles.actionSecondaryText}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => {
                  setSelectedReport(item);
                  setDetailModalVisible(true);
                }}
              >
                <Share2 size={14} color="#0F4C81" />
                <Text style={styles.actionSecondaryText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Report Detail Modal */}
      <ReportDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        report={selectedReport}
        onOpenFIR={onOpenFIR}
        onOpenNetwork={onOpenNetwork}
      />
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
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0F4C81",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  generateBtnText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#0F172A",
  },
  filterBtn: {
    padding: 4,
  },
  reportsSection: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 4,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  idGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reportId: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 13,
    color: "#0F172A",
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#15803D",
  },
  dateText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#94A3B8",
  },
  cardMeta: {
    marginBottom: 12,
  },
  firText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#475569",
  },
  metaSub: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F172A",
    marginVertical: 2,
  },
  officerSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionBtnPrimary: {
    flex: 2,
    backgroundColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionPrimaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionSecondaryText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
});
