/**
 * utils/reportUtils.ts
 * CrimeLens AI — Report generation utilities
 *
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import type { Message, AIResponseData } from "../screens/AIInvestigationWorkspace";
import type { AIStatus } from "../data/investigationMockData";
import { formatTimestamp } from "./investigationUtils";
import { T } from "../i18n/investigationTranslations";

// ─── ReportData type ─────────────────────────────────────────────────────────

export interface ReportData {
  header: string;
  officerName: string;
  officerBadge: string;
  generatedAt: string;
  messages: Array<{
    type: "query" | "response";
    text: string;
    timestamp: string;
    confidenceScore?: number;
  }>;
  summary?: {
    repeatOffenders: { count: number; names: string[] };
    commonVehicles: { count: number; registrations: string[] };
    knownAssociates: { count: number; names: string[] };
    linkedMobileNumbers: { count: number; anonymizedIds: string[] };
    travelPattern: string;
    frequentLocations: string[];
    previousArrests: number;
    priority: string;
  };
  timeline?: Array<{
    label: string;
    timestamp: string;
    status: string;
    description: string;
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: string;
    action: string;
  }>;
  explainability?: {
    factors: Array<{ label: string; weight: number }>;
    confidenceScore: number;
    explainabilityScore: number;
  };
  aiStatus: { online: boolean; confidenceScore: number; databaseSynced: boolean };
}

// ─── 1. formatReportHeader ───────────────────────────────────────────────────

/**
 * Returns a KSP-branded header string.
 *
 * Example output:
 *   KARNATAKA STATE POLICE — CRIMELENS AI
 *   Investigation Report
 *   Officer: Rajesh Kumar | Badge: KSP-2847
 *   Generated: 15 Nov 2024, 09:14 AM
 */
export function formatReportHeader(
  officerName: string,
  officerBadge: string,
  date: Date
): string {
  const formatted = formatTimestamp(date);
  return (
    `KARNATAKA STATE POLICE — CRIMELENS AI\n` +
    `Investigation Report\n` +
    `Officer: ${officerName} | Badge: ${officerBadge}\n` +
    `Generated: ${formatted}`
  );
}

// ─── 2. compileReportData ────────────────────────────────────────────────────

/**
 * Compiles all conversation messages and the latest AI response's rich data
 * into a flat ReportData object ready for HTML generation.
 *
 * - Always uses English translations (T.en) for label keys.
 * - Formats dates with formatTimestamp.
 */
export function compileReportData(
  messages: Message[],
  aiStatus: AIStatus,
  officerName: string,
  officerBadge: string
): ReportData {
  const en = T.en;
  const now = new Date();

  const header = formatReportHeader(officerName, officerBadge, now);
  const generatedAt = formatTimestamp(now);

  // Map conversation messages
  const compiledMessages: ReportData["messages"] = messages.map((msg) => ({
    type: msg.type,
    text: msg.text,
    timestamp: formatTimestamp(msg.timestamp),
    confidenceScore:
      msg.type === "response" && msg.data ? msg.data.confidenceScore : undefined,
  }));

  // Find the last AI response with data
  let lastData: AIResponseData | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === "response" && messages[i].data) {
      lastData = messages[i].data;
      break;
    }
  }

  // Compile summary
  let summary: ReportData["summary"];
  if (lastData?.summary) {
    const s = lastData.summary;
    summary = {
      repeatOffenders: {
        count: s.repeatOffenders.count,
        names: s.repeatOffenders.names,
      },
      commonVehicles: {
        count: s.commonVehicles.count,
        registrations: s.commonVehicles.registrations,
      },
      knownAssociates: {
        count: s.knownAssociates.count,
        names: s.knownAssociates.names,
      },
      linkedMobileNumbers: {
        count: s.linkedMobileNumbers.count,
        anonymizedIds: s.linkedMobileNumbers.anonymizedIds,
      },
      travelPattern: s.travelPattern,
      frequentLocations: s.frequentLocations,
      previousArrests: s.previousArrests,
      priority: s.priority,
    };
  }

  // Compile timeline — resolve labelKey → English label
  let timeline: ReportData["timeline"];
  if (lastData?.timeline && lastData.timeline.length > 0) {
    timeline = lastData.timeline.map((entry) => ({
      label: (en as unknown as Record<string, string>)[entry.labelKey] ?? entry.labelKey,
      timestamp: entry.timestamp,
      status: entry.status,
      description: entry.description,
    }));
  }

  // Compile recommendations — resolve titleKey/descKey/actionLabelKey → English
  let recommendations: ReportData["recommendations"];
  if (lastData?.recommendations && lastData.recommendations.length > 0) {
    recommendations = lastData.recommendations.map((rec) => ({
      title: (en as unknown as Record<string, string>)[rec.titleKey] ?? rec.titleKey,
      description: (en as unknown as Record<string, string>)[rec.descKey] ?? rec.descKey,
      priority: rec.priority,
      action: (en as unknown as Record<string, string>)[rec.actionLabelKey] ?? rec.actionLabelKey,
    }));
  }

  // Compile explainability — resolve labelKey → English label
  let explainability: ReportData["explainability"];
  if (lastData?.explainability) {
    const exp = lastData.explainability;
    explainability = {
      factors: exp.factors.map((f) => ({
        label: (en as unknown as Record<string, string>)[f.labelKey] ?? f.labelKey,
        weight: f.weight,
      })),
      confidenceScore: exp.confidenceScore,
      explainabilityScore: exp.explainabilityScore,
    };
  }

  return {
    header,
    officerName,
    officerBadge,
    generatedAt,
    messages: compiledMessages,
    summary,
    timeline,
    recommendations,
    explainability,
    aiStatus: {
      online: aiStatus.online,
      confidenceScore: aiStatus.confidenceScore,
      databaseSynced: aiStatus.databaseSynced,
    },
  };
}

// ─── 3. generateReportHTML ───────────────────────────────────────────────────

/**
 * Generates a complete HTML string for use with expo-print.
 * Uses inline styles only — no external CSS.
 * Branding: Police Blue #0F4C81, white background, sans-serif typography.
 */
export function generateReportHTML(data: ReportData): string {
  const priorityColor = (p: string): string => {
    if (p === "High") return "#EF4444";
    if (p === "Medium") return "#F59E0B";
    return "#10B981";
  };

  const statusBadge = (status: string): string => {
    const colors: Record<string, string> = {
      completed: "#10B981",
      in_progress: "#F59E0B",
      pending: "#9CA3AF",
    };
    const labels: Record<string, string> = {
      completed: "Completed",
      in_progress: "In Progress",
      pending: "Pending",
    };
    const color = colors[status] ?? "#9CA3AF";
    const label = labels[status] ?? status;
    return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${label}</span>`;
  };

  // ── Conversation HTML ──────────────────────────────────────────────────────
  const conversationHtml = data.messages
    .map((msg) => {
      if (msg.type === "query") {
        return `
        <div style="text-align:right;margin:10px 0;">
          <div style="display:inline-block;background:#EFF6FF;border-radius:12px 12px 2px 12px;
                      padding:10px 14px;max-width:75%;text-align:left;">
            <p style="margin:0;font-size:13px;color:#1E3A5F;font-family:sans-serif;">${escapeHtml(msg.text)}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#94A3B8;font-family:sans-serif;">${msg.timestamp}</p>
          </div>
        </div>`;
      }
      return `
      <div style="text-align:left;margin:10px 0;">
        <div style="display:inline-block;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:2px 12px 12px 12px;
                    padding:10px 14px;max-width:80%;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          ${msg.confidenceScore !== undefined
            ? `<span style="float:right;background:#10B981;color:#fff;font-size:10px;padding:2px 7px;border-radius:8px;font-family:sans-serif;">${msg.confidenceScore}%</span>`
            : ""}
          <p style="margin:0;font-size:13px;color:#1E3A5F;font-family:sans-serif;">${escapeHtml(msg.text)}</p>
          <p style="margin:4px 0 0;font-size:10px;color:#94A3B8;font-family:sans-serif;">${msg.timestamp}</p>
        </div>
      </div>`;
    })
    .join("");

  // ── Summary HTML ───────────────────────────────────────────────────────────
  let summaryHtml = "";
  if (data.summary) {
    const s = data.summary;
    summaryHtml = `
    <div style="page-break-inside:avoid;margin:20px 0;background:#fff;border-radius:12px;border:1px solid #E2E8F0;padding:20px;">
      <h2 style="color:#0F4C81;font-family:sans-serif;font-size:16px;margin:0 0 14px;border-bottom:2px solid #0F4C81;padding-bottom:8px;">
        Investigation Summary
      </h2>
      <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:13px;">
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;width:45%;">Repeat Offenders</td>
          <td style="padding:6px 0;color:#1E3A5F;font-weight:600;">${s.repeatOffenders.count} — ${s.repeatOffenders.names.join(", ")}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;">Common Vehicles</td>
          <td style="padding:6px 0;color:#1E3A5F;font-weight:600;">${s.commonVehicles.count} — ${s.commonVehicles.registrations.join(", ")}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;">Known Associates</td>
          <td style="padding:6px 0;color:#1E3A5F;font-weight:600;">${s.knownAssociates.count} — ${s.knownAssociates.names.join(", ")}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;">Linked Mobile Numbers</td>
          <td style="padding:6px 0;color:#1E3A5F;font-weight:600;">${s.linkedMobileNumbers.count} — ${s.linkedMobileNumbers.anonymizedIds.join(", ")}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;">Travel Pattern</td>
          <td style="padding:6px 0;color:#1E3A5F;">${escapeHtml(s.travelPattern)}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;">Frequent Locations</td>
          <td style="padding:6px 0;color:#1E3A5F;">${s.frequentLocations.join("; ")}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:6px 0;color:#64748B;">Previous Arrests</td>
          <td style="padding:6px 0;color:#1E3A5F;font-weight:600;">${s.previousArrests}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748B;">Priority</td>
          <td style="padding:6px 0;">
            <span style="background:${priorityColor(s.priority)};color:#fff;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:700;">
              ${escapeHtml(s.priority)}
            </span>
          </td>
        </tr>
      </table>
    </div>`;
  }

  // ── Timeline HTML ──────────────────────────────────────────────────────────
  let timelineHtml = "";
  if (data.timeline && data.timeline.length > 0) {
    const entries = data.timeline
      .map(
        (entry) => `
        <div style="display:flex;margin-bottom:14px;align-items:flex-start;">
          <div style="width:12px;height:12px;border-radius:50%;background:#0F4C81;margin-top:3px;flex-shrink:0;"></div>
          <div style="margin-left:12px;flex:1;border-bottom:1px solid #F1F5F9;padding-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
              <span style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1E3A5F;">${escapeHtml(entry.label)}</span>
              ${statusBadge(entry.status)}
            </div>
            <p style="margin:3px 0 0;font-size:11px;color:#64748B;font-family:sans-serif;">${escapeHtml(entry.timestamp)}</p>
            <p style="margin:3px 0 0;font-size:12px;color:#475569;font-family:sans-serif;">${escapeHtml(entry.description)}</p>
          </div>
        </div>`
      )
      .join("");
    timelineHtml = `
    <div style="page-break-inside:avoid;margin:20px 0;background:#fff;border-radius:12px;border:1px solid #E2E8F0;padding:20px;">
      <h2 style="color:#0F4C81;font-family:sans-serif;font-size:16px;margin:0 0 14px;border-bottom:2px solid #0F4C81;padding-bottom:8px;">
        Investigation Timeline
      </h2>
      <div style="padding-left:0;">${entries}</div>
    </div>`;
  }

  // ── Recommendations HTML ───────────────────────────────────────────────────
  let recommendationsHtml = "";
  if (data.recommendations && data.recommendations.length > 0) {
    const cards = data.recommendations
      .map(
        (rec) => `
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-family:sans-serif;font-size:13px;font-weight:700;color:#1E3A5F;">${escapeHtml(rec.title)}</span>
            <span style="background:${priorityColor(rec.priority)};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${escapeHtml(rec.priority)}</span>
          </div>
          <p style="margin:0 0 8px;font-size:12px;color:#475569;font-family:sans-serif;">${escapeHtml(rec.description)}</p>
          <span style="background:#0F4C81;color:#fff;padding:4px 12px;border-radius:8px;font-size:11px;font-family:sans-serif;">${escapeHtml(rec.action)}</span>
        </div>`
      )
      .join("");
    recommendationsHtml = `
    <div style="page-break-inside:avoid;margin:20px 0;background:#fff;border-radius:12px;border:1px solid #E2E8F0;padding:20px;">
      <h2 style="color:#0F4C81;font-family:sans-serif;font-size:16px;margin:0 0 14px;border-bottom:2px solid #0F4C81;padding-bottom:8px;">
        AI Recommendations
      </h2>
      ${cards}
    </div>`;
  }

  // ── Explainability HTML ────────────────────────────────────────────────────
  let explainabilityHtml = "";
  if (data.explainability) {
    const exp = data.explainability;
    const factors = exp.factors
      .map(
        (f) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F1F5F9;">
          <span style="font-family:sans-serif;font-size:12px;color:#475569;">${escapeHtml(f.label)}</span>
          <span style="font-family:sans-serif;font-size:12px;font-weight:700;color:#0F4C81;">${f.weight}%</span>
        </div>`
      )
      .join("");
    const confColor =
      exp.confidenceScore > 80 ? "#10B981" : exp.confidenceScore >= 50 ? "#F59E0B" : "#EF4444";
    explainabilityHtml = `
    <div style="page-break-inside:avoid;margin:20px 0;background:#fff;border-radius:12px;border:1px solid #E2E8F0;padding:20px;">
      <h2 style="color:#0F4C81;font-family:sans-serif;font-size:16px;margin:0 0 14px;border-bottom:2px solid #0F4C81;padding-bottom:8px;">
        Why did AI reach this conclusion?
      </h2>
      ${factors}
      <div style="margin-top:14px;display:flex;gap:20px;">
        <div style="text-align:center;">
          <p style="margin:0;font-size:11px;color:#64748B;font-family:sans-serif;">Confidence Score</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:${confColor};font-family:sans-serif;">${exp.confidenceScore}%</p>
        </div>
        <div style="text-align:center;">
          <p style="margin:0;font-size:11px;color:#64748B;font-family:sans-serif;">Explainability Score</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0F4C81;font-family:sans-serif;">${exp.explainabilityScore}%</p>
        </div>
      </div>
    </div>`;
  }

  // ── Assemble full HTML ─────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CrimeLens AI — Investigation Report</title>
  <style>
    @page { margin: 20mm 15mm; }
    body { margin: 0; padding: 0; background: #FFFFFF; font-family: sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="background:#FFFFFF;padding:0;margin:0;">

  <!-- ── Header ── -->
  <div style="background:#0F4C81;padding:24px 24px 18px;color:#FFFFFF;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;font-family:sans-serif;">
      Karnataka State Police
    </div>
    <div style="font-size:22px;font-weight:700;margin:4px 0;font-family:sans-serif;">
      CrimeLens AI — Investigation Report
    </div>
    <div style="font-size:13px;opacity:0.85;margin-top:8px;font-family:sans-serif;">
      Officer: <strong>${escapeHtml(data.officerName)}</strong>
      &nbsp;|&nbsp; Badge: <strong>${escapeHtml(data.officerBadge)}</strong>
      &nbsp;|&nbsp; Generated: ${escapeHtml(data.generatedAt)}
    </div>
    <div style="margin-top:6px;font-size:11px;opacity:0.7;font-family:sans-serif;">
      AI Status: ${data.aiStatus.online ? "● Online" : "○ Offline"}
      &nbsp;|&nbsp; Confidence: ${data.aiStatus.confidenceScore}%
      &nbsp;|&nbsp; Database: ${data.aiStatus.databaseSynced ? "Synced" : "Syncing"}
    </div>
  </div>

  <div style="padding:20px 24px;">

    <!-- ── Conversation ── -->
    <div style="margin-bottom:20px;background:#fff;border-radius:12px;border:1px solid #E2E8F0;padding:20px;">
      <h2 style="color:#0F4C81;font-family:sans-serif;font-size:16px;margin:0 0 14px;border-bottom:2px solid #0F4C81;padding-bottom:8px;">
        Investigation Conversation
      </h2>
      ${conversationHtml}
    </div>

    ${summaryHtml}
    ${timelineHtml}
    ${recommendationsHtml}
    ${explainabilityHtml}

  </div>

  <!-- ── Footer ── -->
  <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:12px 24px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#64748B;font-family:sans-serif;">
      Generated by CrimeLens AI — Karnataka State Police | Confidential
    </p>
  </div>

</body>
</html>`;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
