/**
 * components/modals/ReportDetailModal.tsx
 * CrimeLens AI — Investigation Report Detail Modal
 */

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import {
  FileText,
  Download,
  Share2,
  Printer,
  X,
  CheckCircle2,
  Brain,
  Network,
  MapPin,
  Clock,
  ShieldAlert,
  User,
  ChevronRight,
} from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export type ReportItem = {
  id: string;
  firNumber: string;
  crimeType: string;
  district: string;
  assignedOfficer: string;
  generatedDate: string;
  status: "Completed" | "Draft" | "Reviewed";
  summaryText?: string;
  accusedName?: string;
  confidenceScore?: number;
};

export type ReportDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  report: ReportItem | null;
  onOpenFIR?: (firNumber: string) => void;
  onOpenNetwork?: (firNumber: string) => void;
  onOpenExplainWhy?: (context: string) => void;
};

export function ReportDetailModal({
  visible,
  onClose,
  report,
  onOpenFIR,
  onOpenNetwork,
  onOpenExplainWhy,
}: ReportDetailModalProps) {
  const [exporting, setExporting] = useState(false);

  if (!report) return null;

  const score = report.confidenceScore || 94;

  const generateHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CrimeLens AI Investigation Report - ${report.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #0F172A; }
        .header { border-bottom: 3px solid #0F4C81; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 24px; font-weight: bold; color: #0F4C81; text-transform: uppercase; }
        .badge { background: #0F4C81; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .section { margin-bottom: 24px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; }
        .section-title { font-size: 14px; font-weight: bold; color: #0F4C81; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .meta-label { font-size: 11px; color: #64748B; font-weight: bold; }
        .meta-val { font-size: 13px; color: #0F172A; font-weight: bold; }
        .disclaimer { background: #FFFBEB; border: 1px solid #FCD34D; padding: 12px; border-radius: 8px; color: #92400E; font-size: 11px; margin-top: 30px; }
        .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 10px; color: #94A3B8; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">CrimeLens AI Investigation Report</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">KARNATAKA STATE POLICE · CLASSIFIED INTELLIGENCE</div>
        </div>
        <div class="badge">${report.id}</div>
      </div>

      <div class="section">
        <div class="section-title">Case & FIR Overview</div>
        <div class="grid">
          <div><span class="meta-label">FIR NUMBER:</span> <span class="meta-val">${report.firNumber}</span></div>
          <div><span class="meta-label">CRIME TYPE:</span> <span class="meta-val">${report.crimeType}</span></div>
          <div><span class="meta-label">DISTRICT:</span> <span class="meta-val">${report.district}</span></div>
          <div><span class="meta-label">ASSIGNED OFFICER:</span> <span class="meta-val">${report.assignedOfficer}</span></div>
          <div><span class="meta-label">GENERATED DATE:</span> <span class="meta-val">${report.generatedDate}</span></div>
          <div><span class="meta-label">AI CONFIDENCE:</span> <span class="meta-val">${score}%</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Executive Summary</div>
        <p style="font-size: 13px; line-height: 1.6; color: #334155;">
          ${report.summaryText || `Detailed automated AI investigation analysis for ${report.firNumber}. Structural crime pattern analysis identified multiple linked historical records and co-accused associates operating across ${report.district}.`}
        </p>
      </div>

      <div class="section">
        <div class="section-title">Suspect Profile & Network Findings</div>
        <p style="font-size: 13px; line-height: 1.5;">
          <strong>Primary Suspect:</strong> ${report.accusedName || "Ravi S."} (HIGH RISK)<br>
          <strong>Known Associates:</strong> Suresh K., Ramesh M.<br>
          <strong>Modus Operandi:</strong> Night-time vehicle theft & burglary with fake registration plates.
        </p>
      </div>

      <div class="section">
        <div class="section-title">Recommended Investigative Actions</div>
        <ul style="font-size: 12px; line-height: 1.6;">
          <li>Issue inter-district look-out alert for suspected vehicle reg KA-01-AB-1234.</li>
          <li>Deploy enhanced patrol team to Electronic City Phase 1 hotspot between 20:00 - 01:00.</li>
          <li>Cross-examine suspect regarding linked cases FIR-2023-01981 and FIR-2022-00411.</li>
        </ul>
      </div>

      <div class="disclaimer">
        <strong>DECISION SUPPORT DISCLAIMER:</strong> AI-generated intelligence is provided strictly for officer decision support and must be reviewed by authorized investigating officers per IT Act 2000.
      </div>

      <div class="footer">
        <div>Karnataka State Police · CrimeLens AI Platform v1.0</div>
        <div>Page 1 of 1 · Audit Tracked</div>
      </div>
    </body>
    </html>
  `;

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("Report Exported", `Report saved to: ${uri}`);
      }
    } catch {
      Alert.alert("Export Error", "Failed to generate report PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = async () => {
    try {
      const html = generateHTML();
      await Print.printAsync({ html });
    } catch {
      Alert.alert("Print Error", "Failed to print report.");
    }
  };

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
                <Text style={styles.reportId}>{report.id}</Text>
                <Text style={styles.reportSub}>
                  {report.firNumber} · Generated on {report.generatedDate}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Report Banner */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerTop}>
                <Text style={styles.bannerTitle}>INVESTIGATION SUMMARY REPORT</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{report.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specText}>District: <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F172A" }}>{report.district}</Text></Text>
                <Text style={styles.specText}>Officer: <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F172A" }}>{report.assignedOfficer}</Text></Text>
                <Text style={styles.specText}>Confidence: <Text style={{ fontFamily: "Inter-SemiBold", color: "#10B981" }}>{score}%</Text></Text>
              </View>
            </View>

            {/* Case Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Incident Summary</Text>
              <Text style={styles.summaryText}>
                {report.summaryText ||
                  `Investigation for ${report.firNumber} (${report.crimeType}) completed using CrimeLens AI cross-district correlation engine. Analysis highlights recurring weekend timing and modus operandi matches across ${report.district}.`}
              </Text>
            </View>

            {/* Accused & Victims */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suspect Profile Findings</Text>
              <View style={styles.profileBox}>
                <User size={16} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.suspectName}>Primary Suspect: {report.accusedName || "Ravi S."}</Text>
                  <Text style={styles.suspectSub}>6 Connected FIRs · 4 Known Associates · High Risk Classification</Text>
                </View>
                {onOpenNetwork && (
                  <TouchableOpacity onPress={() => onOpenNetwork(report.firNumber)}>
                    <Network size={16} color="#0F4C81" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Case Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Case Milestones</Text>
              <View style={styles.milestoneBox}>
                <View style={styles.milestoneItem}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.milestoneText}>FIR Registered & Logged in CrimeLens System</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.milestoneText}>AI Pattern Discovery matched 3 historical FIRs</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.milestoneText}>Geographic Risk Hotspot identified in Electronic City</Text>
                </View>
              </View>
            </View>

            {/* AI Recommendations */}
            <View style={styles.aiBox}>
              <View style={styles.aiBoxHeader}>
                <Brain size={16} color="#0F4C81" />
                <Text style={styles.aiBoxTitle}>Recommended Investigation Actions</Text>
              </View>
              <Text style={styles.aiBullet}>• Issue lookout alert for suspect vehicle reg KA-01-AB-1234.</Text>
              <Text style={styles.aiBullet}>• Increase patrol density in Electronic City Phase 1 tonight.</Text>
              <Text style={styles.aiBullet}>• Coordinate inter-district intelligence with Tumakuru Police Station.</Text>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimerBox}>
              <ShieldAlert size={16} color="#D97706" />
              <Text style={styles.disclaimerText}>
                AI-generated intelligence is provided for decision support and must be reviewed by authorized investigating officers per IT Act 2000.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryAction} onPress={handleExportPDF} disabled={exporting}>
              {exporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Download size={16} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>Export PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={handlePrint}>
              <Printer size={16} color="#0F4C81" />
              <Text style={styles.secondaryActionText}>Print</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={handleExportPDF}>
              <Share2 size={16} color="#0F4C81" />
              <Text style={styles.secondaryActionText}>Share</Text>
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15, 76, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  reportId: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  reportSub: {
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
  bannerCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bannerTitle: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#0F4C81",
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#15803D",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  specText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 6,
  },
  summaryText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
  },
  suspectName: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#991B1B",
  },
  suspectSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#7F1D1D",
  },
  milestoneBox: {
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  milestoneText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
  },
  aiBox: {
    backgroundColor: "rgba(15, 76, 129, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(15, 76, 129, 0.2)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  aiBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiBoxTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F4C81",
  },
  aiBullet: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 4,
  },
  disclaimerBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#92400E",
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  primaryAction: {
    flex: 2,
    backgroundColor: "#0F4C81",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryActionText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  secondaryActionText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F4C81",
  },
});
