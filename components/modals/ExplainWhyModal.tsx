/**
 * components/modals/ExplainWhyModal.tsx
 * CrimeLens AI — Explainable AI Evidence Modal
 *
 * Provides evidence breakdown, confidence score, matching FIRs, pattern indicators,
 * and responsible AI disclaimers for decision support.
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
  Brain,
  CheckCircle2,
  FileText,
  ShieldAlert,
  X,
  ExternalLink,
  Info,
  Layers,
  Zap,
} from "lucide-react-native";

export type ExplainWhyData = {
  title?: string;
  queryOrContext?: string;
  confidenceScore?: number;
  evidenceItems?: string[];
  sharedFIRs?: string[];
  commonVehicle?: string;
  commonLocations?: string[];
  patternIndicators?: string[];
  explanationText?: string;
};

export type ExplainWhyModalProps = {
  visible: boolean;
  onClose: () => void;
  data: ExplainWhyData | null;
  onOpenFIR?: (firNumber: string) => void;
  onOpenAIWorkspace?: () => void;
};

export function ExplainWhyModal({
  visible,
  onClose,
  data,
  onOpenFIR,
  onOpenAIWorkspace,
}: ExplainWhyModalProps) {
  if (!data) return null;

  const score = data.confidenceScore ?? 91;
  const title = data.title ?? "WHY THIS INTELLIGENCE WAS GENERATED";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBadge}>
                <Brain size={20} color="#0F4C81" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTag}>EXPLAINABLE AI EVIDENCE</Text>
                <Text style={styles.headerTitle}>{title}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Context / Prompt */}
            {data.queryOrContext && (
              <View style={styles.contextBox}>
                <Text style={styles.contextLabel}>TARGET PATTERN / RELATIONSHIP</Text>
                <Text style={styles.contextText}>"{data.queryOrContext}"</Text>
              </View>
            )}

            {/* Confidence Score Bar */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreTop}>
                <Text style={styles.scoreTitle}>AI Confidence Score</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>{score}% High Confidence</Text>
                </View>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${score}%` }]} />
              </View>
              <Text style={styles.scoreSub}>
                Derived from structural pattern matching across Karnataka State FIR database.
              </Text>
            </View>

            {/* Explanation Summary */}
            {data.explanationText && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Intelligence Summary</Text>
                <Text style={styles.explanationText}>{data.explanationText}</Text>
              </View>
            )}

            {/* Key Evidence Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supporting Evidence Breakdown</Text>

              {data.sharedFIRs && data.sharedFIRs.length > 0 && (
                <View style={styles.evidenceItem}>
                  <FileText size={16} color="#0F4C81" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.evidenceTitle}>Shared FIR Records ({data.sharedFIRs.length})</Text>
                    <View style={styles.chipsRow}>
                      {data.sharedFIRs.map((fir) => (
                        <TouchableOpacity
                          key={fir}
                          style={styles.firChip}
                          onPress={() => onOpenFIR && onOpenFIR(fir)}
                        >
                          <Text style={styles.firChipText}>{fir}</Text>
                          <ExternalLink size={10} color="#0F4C81" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {data.commonVehicle && (
                <View style={styles.evidenceItem}>
                  <Zap size={16} color="#0F4C81" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.evidenceTitle}>Common Vehicle Connection</Text>
                    <Text style={styles.evidenceDesc}>
                      Vehicle reg: <Text style={{ fontFamily: "Inter-SemiBold", color: "#0F172A" }}>{data.commonVehicle}</Text> appears across related incident logs.
                    </Text>
                  </View>
                </View>
              )}

              {data.commonLocations && data.commonLocations.length > 0 && (
                <View style={styles.evidenceItem}>
                  <Layers size={16} color="#0F4C81" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.evidenceTitle}>Geographic Overlap ({data.commonLocations.length} Locations)</Text>
                    <Text style={styles.evidenceDesc}>
                      {data.commonLocations.join(" · ")}
                    </Text>
                  </View>
                </View>
              )}

              {data.evidenceItems && data.evidenceItems.map((item, idx) => (
                <View key={idx} style={styles.evidenceItem}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2 }} />
                  <Text style={styles.evidenceDescText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Responsible AI Disclaimer */}
            <View style={styles.disclaimerBox}>
              <ShieldAlert size={18} color="#D97706" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.disclaimerTitle}>DECISION-SUPPORT SYSTEM DISCLAIMER</Text>
                <Text style={styles.disclaimerText}>
                  AI-generated intelligence highlights patterns and relationships for officer assistance. Final investigative determinations, arrests, and legal actions remain strictly under human officer discretion per law.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {onOpenAIWorkspace && (
              <TouchableOpacity style={styles.primaryBtn} onPress={onOpenAIWorkspace}>
                <Brain size={16} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Investigate in AI Workspace</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>Close Explanation</Text>
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
    maxHeight: "88%",
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(15, 76, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTag: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#0F4C81",
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contextBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  contextLabel: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  contextText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#0F172A",
    lineHeight: 18,
  },
  scoreCard: {
    backgroundColor: "rgba(15, 76, 129, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(15, 76, 129, 0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  scoreTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F4C81",
  },
  scoreBadge: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  progressBg: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0F4C81",
    borderRadius: 4,
  },
  scoreSub: {
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
    marginBottom: 10,
  },
  explanationText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
  evidenceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  evidenceTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F172A",
    marginBottom: 4,
  },
  evidenceDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
  },
  evidenceDescText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    flex: 1,
    lineHeight: 18,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  firChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  firChipText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  disclaimerBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#B45309",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#92400E",
    lineHeight: 16,
  },
  footer: {
    flexDirection: "column",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  primaryBtn: {
    backgroundColor: "#0F4C81",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  secondaryBtn: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#475569",
  },
});
