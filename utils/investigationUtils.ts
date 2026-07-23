/**
 * utils/investigationUtils.ts
 * Pure helper functions for the CrimeLens AI Investigation Workspace.
 *
 * Requirements covered: 2.1, 8.4, 10.2, 11.2, 9.2, 15.1
 */

import type { NodeType, MilestoneStatus, PriorityLevel } from "../data/investigationMockData";
import { T } from "../i18n/investigationTranslations";
import type { Lang } from "../i18n/investigationTranslations";

// ─── 1. getConfidenceColor ──────────────────────────────────────────────────
/**
 * Maps a confidence score (0–100) to its canonical hex colour.
 *
 * >80  → Green  #10B981  (high confidence)
 * 50–80 → Amber  #F59E0B  (moderate confidence)
 * <50  → Red    #EF4444  (low confidence)
 *
 * Validates: Requirements 8.4
 */
export function getConfidenceColor(score: number): string {
  if (score > 80) {
    return "#10B981";
  } else if (score >= 50) {
    return "#F59E0B";
  } else {
    return "#EF4444";
  }
}

// ─── 2. getPriorityColor ────────────────────────────────────────────────────
/**
 * Maps a PriorityLevel to its canonical hex colour.
 *
 * High   → Red    #EF4444
 * Medium → Amber  #F59E0B
 * Low    → Green  #10B981
 *
 * Validates: Requirements 11.2
 */
export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case "High":
      return "#EF4444";
    case "Medium":
      return "#F59E0B";
    case "Low":
      return "#10B981";
  }
}

// ─── 3. getNodeColor ────────────────────────────────────────────────────────
/**
 * Maps a criminal network NodeType to its unique hex colour.
 *
 * accused  → Red     #EF4444
 * victim   → Blue    #3B82F6
 * fir      → Amber   #F59E0B
 * vehicle  → Purple  #A855F7
 * mobile   → Green   #10B981
 * station  → Navy    #0F4C81
 * district → Cyan    #06B6D4
 *
 * Validates: Requirements 9.2
 */
export function getNodeColor(nodeType: NodeType): string {
  switch (nodeType) {
    case "accused":
      return "#EF4444";
    case "victim":
      return "#3B82F6";
    case "fir":
      return "#F59E0B";
    case "vehicle":
      return "#A855F7";
    case "mobile":
      return "#10B981";
    case "station":
      return "#0F4C81";
    case "district":
      return "#06B6D4";
  }
}

// ─── 4. getMilestoneIcon ────────────────────────────────────────────────────
/**
 * Maps a MilestoneStatus to its icon name string.
 *
 * completed   → "check-circle"
 * in_progress → "clock"
 * pending     → "alert-circle"
 *
 * Validates: Requirements 10.2
 */
export function getMilestoneIcon(status: MilestoneStatus): string {
  switch (status) {
    case "completed":
      return "check-circle";
    case "in_progress":
      return "clock";
    case "pending":
      return "alert-circle";
  }
}

// ─── 5. formatTimestamp ─────────────────────────────────────────────────────
/**
 * Returns a human-readable relative or absolute time string for a given Date.
 *
 * - Within the last minute  → "Just now"
 * - Within the last hour    → "X minutes ago"
 * - Within the last 24 hrs  → "X hours ago"
 * - Older                   → absolute time in "DD MMM YYYY, HH:MM AM/PM" format
 *
 * Validates: Requirements 2.1
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  // Absolute format for older dates: "15 Nov 2024, 09:14 AM"
  const day = date.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const minutesPadded = String(minutes).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours12}:${minutesPadded} ${ampm}`;
}

// ─── 6. getGreeting ─────────────────────────────────────────────────────────
/**
 * Returns a time-of-day greeting string in the specified language,
 * appending the officer's role.
 *
 * 00–11 → T[lang].greetingMorning
 * 12–17 → T[lang].greetingAfternoon
 * 18–23 → T[lang].greetingEvening
 *
 * The greeting template and the officerRole are joined with a comma+space
 * (e.g. "Good Morning, Senior Inspector").
 *
 * Validates: Requirements 15.1
 */
export function getGreeting(lang: Lang, officerRole: string): string {
  const hour = new Date().getHours();
  let greetingTemplate: string;

  if (hour >= 0 && hour <= 11) {
    greetingTemplate = T[lang].greetingMorning;
  } else if (hour >= 12 && hour <= 17) {
    greetingTemplate = T[lang].greetingAfternoon;
  } else {
    greetingTemplate = T[lang].greetingEvening;
  }

  // Replace {role} placeholder if present; otherwise append the role
  if (greetingTemplate.includes("{role}")) {
    return greetingTemplate.replace("{role}", officerRole);
  }

  return `${greetingTemplate}, ${officerRole}`;
}
