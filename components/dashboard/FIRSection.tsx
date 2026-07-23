/**
 * components/dashboard/FIRSection.tsx
 *
 * Recent FIR Activity section — timeline (top-5) + full table + quick-action modal.
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { Eye, UserCheck, AlertTriangle } from "lucide-react-native";

import { T, Lang } from "../../i18n/dashboardTranslations";
import mockData, { FIR, FIRStatus } from "../../data/mockData";
import { getStatusColor } from "../../utils/dashboardUtils";

// ── Props ──────────────────────────────────────────────────────────────────

export type FIRSectionProps = {
  lang: Lang;
  firsData?: FIR[];
  loading?: boolean;
};

// ── Column widths (table) ──────────────────────────────────────────────────

const COL = {
  number: 140,
  crimeType: 130,
  district: 110,
  status: 140,
  priority: 90,
  officer: 150,
  action: 110,
};

// ── Status colours ─────────────────────────────────────────────────────────

function getStatusTextColor(status: FIRStatus): string {
  switch (status) {
    case "Open":                 return "#0F4C81";
    case "Under Investigation":  return "#F59E0B";
    case "Closed":               return "#10B981";
    case "Escalated":            return "#EF4444";
  }
}

// ── FIRSection ─────────────────────────────────────────────────────────────

export function FIRSection({ lang, firsData, loading }: FIRSectionProps) {
  const t = T[lang];
  const [quickActionFIR, setQuickActionFIR] = useState<FIR | null>(null);

  const allFIRs = firsData && firsData.length > 0 ? firsData : mockData.firs;
  const timelineFIRs = allFIRs.slice(0, 5);

  // Localised helpers
  const crimeTypeLoc = (fir: FIR) =>
    lang === "kn" ? fir.crimeTypeKn : fir.crimeType;
  const districtLoc = (fir: FIR) =>
    lang === "kn" ? fir.districtKn : fir.district;

  const statusLabel = (status: FIRStatus): string => {
    switch (status) {
      case "Open":                return t.firStatusOpen;
      case "Under Investigation": return t.firStatusUnderInvestigation;
      case "Closed":              return t.firStatusClosed;
      case "Escalated":           return t.firStatusEscalated;
    }
  };

  const priorityLabel = (priority: FIR["priority"]): string => {
    switch (priority) {
      case "High":   return t.firPriorityHigh;
      case "Medium": return t.firPriorityMedium;
      case "Low":    return t.firPriorityLow;
    }
  };

  return (
    <View style={styles.card}>
      {/* ── Section title ─────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t.firSectionTitle}</Text>

      {/* ════════════════════════════════════════════════════
          TIMELINE  (Requirement 10.1)
      ════════════════════════════════════════════════════ */}
      <Text style={styles.subTitle}>{t.firTimelineTitle}</Text>

      {timelineFIRs.map((fir, index) => (
        <View key={fir.id}>
          <View style={styles.timelineRow}>
            {/* Priority colour dot */}
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getStatusColor(fir.priority) },
              ]}
            />

            {/* FIR info */}
            <View style={styles.timelineContent}>
              <View style={styles.timelineTop}>
                <Text style={styles.firNumber}>{fir.number}</Text>
                <Text style={styles.timeElapsed}>{fir.timeElapsed}</Text>
              </View>
              <View style={styles.timelineBottom}>
                <Text style={styles.crimeType} numberOfLines={1}>
                  {crimeTypeLoc(fir)}
                </Text>
                <Text style={styles.districtText} numberOfLines={1}>
                  {districtLoc(fir)}
                </Text>
              </View>
            </View>

            {/* Status badge */}
            <View
              style={[
                styles.statusBadge,
                { borderColor: getStatusTextColor(fir.status) },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: getStatusTextColor(fir.status) },
                ]}
                numberOfLines={1}
              >
                {statusLabel(fir.status)}
              </Text>
            </View>
          </View>

          {/* Divider between rows (not after last) */}
          {index < timelineFIRs.length - 1 && (
            <View style={styles.divider} />
          )}
        </View>
      ))}

      {/* ════════════════════════════════════════════════════
          TABLE  (Requirements 10.2, 10.3, 10.4)
      ════════════════════════════════════════════════════ */}
      <Text style={[styles.subTitle, { marginTop: 20 }]}>
        {t.firTableTitle}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, { width: COL.number }]}>
              {t.firColNumber}
            </Text>
            <Text style={[styles.headerCell, { width: COL.crimeType }]}>
              {t.firColCrimeType}
            </Text>
            <Text style={[styles.headerCell, { width: COL.district }]}>
              {t.firColDistrict}
            </Text>
            <Text style={[styles.headerCell, { width: COL.status }]}>
              {t.firColStatus}
            </Text>
            <Text style={[styles.headerCell, { width: COL.priority }]}>
              {t.firColPriority}
            </Text>
            <Text style={[styles.headerCell, { width: COL.officer }]}>
              {t.firColOfficer}
            </Text>
            <Text style={[styles.headerCell, { width: COL.action }]}>
              {t.firColAction}
            </Text>
          </View>

          {/* Data rows */}
          {allFIRs.map((fir, index) => {
            const rowBg = index % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
            return (
              <View
                key={fir.id}
                style={[styles.tableDataRow, { backgroundColor: rowBg }]}
              >
                {/* FIR Number */}
                <Text
                  style={[styles.firNumberCell, { width: COL.number }]}
                  numberOfLines={1}
                >
                  {fir.number}
                </Text>

                {/* Crime Type */}
                <Text
                  style={[styles.dataCell, { width: COL.crimeType }]}
                  numberOfLines={1}
                >
                  {crimeTypeLoc(fir)}
                </Text>

                {/* District */}
                <Text
                  style={[styles.dataCell, { width: COL.district }]}
                  numberOfLines={1}
                >
                  {districtLoc(fir)}
                </Text>

                {/* Status */}
                <View style={{ width: COL.status, justifyContent: "center" }}>
                  <Text
                    style={[
                      styles.dataCellMedium,
                      { color: getStatusTextColor(fir.status) },
                    ]}
                    numberOfLines={1}
                  >
                    {statusLabel(fir.status)}
                  </Text>
                </View>

                {/* Priority — coloured background cell (Requirement 10.3) */}
                <View
                  style={[
                    styles.priorityCell,
                    {
                      width: COL.priority,
                      backgroundColor: getStatusColor(fir.priority),
                    },
                  ]}
                >
                  <Text style={styles.priorityCellText} numberOfLines={1}>
                    {priorityLabel(fir.priority)}
                  </Text>
                </View>

                {/* Officer Assigned */}
                <Text
                  style={[styles.dataCell, { width: COL.officer }]}
                  numberOfLines={1}
                >
                  {fir.officerAssigned}
                </Text>

                {/* Quick Action button (Requirement 10.4) */}
                <View
                  style={{
                    width: COL.action,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 6,
                  }}
                >
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => setQuickActionFIR(fir)}
                    accessibilityLabel={`${t.firQuickAction} ${fir.number}`}
                  >
                    <Text style={styles.quickActionButtonText}>
                      {t.firQuickAction}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ════════════════════════════════════════════════════
          QUICK ACTION MODAL  (Requirement 10.5)
      ════════════════════════════════════════════════════ */}
      <Modal
        visible={quickActionFIR !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setQuickActionFIR(null)}
      >
        {/* Full-screen semi-transparent overlay */}
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setQuickActionFIR(null)}
        >
          {/* Bottom sheet — stop propagation so tapping sheet doesn't close */}
          <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* FIR number subtitle */}
            <Text style={styles.sheetTitle}>{t.firQuickAction}</Text>
            {quickActionFIR && (
              <Text style={styles.sheetSubtitle}>{quickActionFIR.number}</Text>
            )}

            {/* Action: View Details */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setQuickActionFIR(null)}
              accessibilityLabel={t.firActionViewDetails}
            >
              <Eye size={18} color="#0F4C81" strokeWidth={1.8} />
              <Text style={styles.actionButtonText}>
                {t.firActionViewDetails}
              </Text>
            </TouchableOpacity>

            {/* Action: Assign Officer */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setQuickActionFIR(null)}
              accessibilityLabel={t.firActionAssignOfficer}
            >
              <UserCheck size={18} color="#0F4C81" strokeWidth={1.8} />
              <Text style={styles.actionButtonText}>
                {t.firActionAssignOfficer}
              </Text>
            </TouchableOpacity>

            {/* Action: Escalate */}
            <TouchableOpacity
              style={[styles.actionButton, styles.escalateButton]}
              onPress={() => setQuickActionFIR(null)}
              accessibilityLabel={t.firActionEscalate}
            >
              <AlertTriangle size={18} color="#EF4444" strokeWidth={1.8} />
              <Text style={[styles.actionButtonText, styles.escalateText]}>
                {t.firActionEscalate}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Enterprise card ──────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 12,
    lineHeight: 20,
  },

  subTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#374151",
    marginBottom: 10,
    lineHeight: 18,
  },

  // ── Timeline ─────────────────────────────────────────────────────────────
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },

  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },

  timelineContent: {
    flex: 1,
    gap: 2,
  },

  timelineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timelineBottom: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  firNumber: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 17,
  },

  timeElapsed: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
  },

  crimeType: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 16,
    flexShrink: 1,
  },

  districtText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
    flexShrink: 1,
  },

  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
    maxWidth: 130,
  },

  statusBadgeText: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    lineHeight: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 20,
  },

  // ── Table ─────────────────────────────────────────────────────────────────
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  headerCell: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#374151",
    paddingHorizontal: 8,
    lineHeight: 16,
  },

  tableDataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
  },

  firNumberCell: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 12,
    color: "#1E293B",
    paddingHorizontal: 8,
    lineHeight: 16,
  },

  dataCell: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    paddingHorizontal: 8,
    lineHeight: 16,
  },

  dataCellMedium: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    paddingHorizontal: 8,
    lineHeight: 16,
  },

  priorityCell: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "center",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  priorityCellText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#FFFFFF",
    lineHeight: 15,
  },

  quickActionButton: {
    borderWidth: 1,
    borderColor: "#0F4C81",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F4C81",
    lineHeight: 15,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  handleBar: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginBottom: 16,
  },

  sheetTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 22,
    marginBottom: 4,
  },

  sheetSubtitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 14,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 18,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },

  actionButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 18,
  },

  escalateButton: {
    backgroundColor: "#FEF2F2",
  },

  escalateText: {
    color: "#EF4444",
  },
});
