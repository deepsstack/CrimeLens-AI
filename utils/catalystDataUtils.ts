/**
 * utils/catalystDataUtils.ts
 *
 * Pure utility functions that derive UI data from Catalyst API responses.
 * No mock data is used here — only real Catalyst types are imported.
 *
 * These functions are used by DashboardScreen and AnalyticsScreen to
 * transform raw API payloads into shapes the existing components expect.
 */

import type { FIRCase, Accused, CriminalNetworkResponse } from "../services/crimelensApi";
import type { District, KPICard, FIR, FIRStatus, Priority } from "../data/mockData";
import type { AccusedProfileData } from "../components/modals/AccusedProfileModal";
import type { FIRDetailsData } from "../components/modals/FIRDetailsModal";
import type { SearchResultItem } from "../components/modals/GlobalSearchModal";

// ─── District grid layout (static SVG positioning, Kannada names) ────────────
// These are UI-only layout constants. Only crimeCount / density / topCategory
// are dynamic and derived from Catalyst FIR data.

const DISTRICT_GRID: Array<{
  id: string;
  name: string;
  nameKn: string;
  x: number;
  y: number;
  gridCol: number;
  gridRow: number;
  aliases: string[]; // alternate spellings from Catalyst DISTRICT field
}> = [
  { id: "blr",  name: "Bengaluru",   nameKn: "ಬೆಂಗಳೂರು",  x: 155, y: 200, gridCol: 2, gridRow: 2, aliases: ["bengaluru", "bangalore", "bengaluru urban", "bengaluru city"] },
  { id: "mys",  name: "Mysuru",      nameKn: "ಮೈಸೂರು",    x: 95,  y: 240, gridCol: 1, gridRow: 3, aliases: ["mysuru", "mysore", "mysuru central"] },
  { id: "mng",  name: "Mangaluru",   nameKn: "ಮಂಗಳೂರು",   x: 40,  y: 210, gridCol: 0, gridRow: 2, aliases: ["mangaluru", "mangalore", "mangaluru port"] },
  { id: "hub",  name: "Hubballi",    nameKn: "ಹುಬ್ಬಳ್ಳಿ",   x: 95,  y: 110, gridCol: 1, gridRow: 1, aliases: ["hubballi", "hubli", "hubballi-dharwad"] },
  { id: "blg",  name: "Belagavi",    nameKn: "ಬೆಳಗಾವಿ",   x: 40,  y: 80,  gridCol: 0, gridRow: 0, aliases: ["belagavi", "belgaum"] },
  { id: "klb",  name: "Kalaburagi",  nameKn: "ಕಲಬುರಗಿ",   x: 215, y: 100, gridCol: 3, gridRow: 1, aliases: ["kalaburagi", "gulbarga"] },
  { id: "tum",  name: "Tumakuru",    nameKn: "ತುಮಕೂರು",   x: 155, y: 160, gridCol: 2, gridRow: 1, aliases: ["tumakuru", "tumkur"] },
  { id: "shv",  name: "Shivamogga",  nameKn: "ಶಿವಮೊಗ್ಗ",  x: 95,  y: 160, gridCol: 1, gridRow: 2, aliases: ["shivamogga", "shimoga"] },
  { id: "dwd",  name: "Davanagere",  nameKn: "ದಾವಣಗೆರೆ",  x: 155, y: 110, gridCol: 2, gridRow: 0, aliases: ["davanagere", "davangere"] },
  { id: "bdr",  name: "Bidar",       nameKn: "ಬೀದರ್",     x: 215, y: 55,  gridCol: 3, gridRow: 0, aliases: ["bidar"] },
  { id: "rai",  name: "Raichur",     nameKn: "ರಾಯಚೂರು",   x: 215, y: 150, gridCol: 3, gridRow: 2, aliases: ["raichur"] },
  { id: "hss",  name: "Hassan",      nameKn: "ಹಾಸನ",      x: 40,  y: 160, gridCol: 0, gridRow: 1, aliases: ["hassan"] },
];

// ─── Crime type colour palette (stable across components) ────────────────────

const CRIME_TYPE_COLORS: Record<string, string> = {
  theft:        "#0F4C81",
  "vehicle theft": "#0F4C81",
  "motor vehicle theft": "#0F4C81",
  assault:      "#EF4444",
  "cyber crime": "#06B6D4",
  "cyber fraud": "#06B6D4",
  drug:         "#F59E0B",
  "drug offence": "#F59E0B",
  fraud:        "#8B5CF6",
  robbery:      "#10B981",
  burglary:     "#F97316",
  murder:       "#DC2626",
  kidnapping:   "#7C3AED",
  default:      "#64748B",
};

function crimeTypeColor(crimeType: string): string {
  const lc = crimeType.toLowerCase();
  for (const [key, color] of Object.entries(CRIME_TYPE_COLORS)) {
    if (lc.includes(key)) return color;
  }
  return CRIME_TYPE_COLORS.default;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalise a district name from Catalyst to match our grid entries. */
function resolveDistrictId(catalystDistrict: string): string | null {
  const lc = (catalystDistrict ?? "").toLowerCase().trim();
  for (const d of DISTRICT_GRID) {
    if (d.aliases.some((a) => lc.includes(a) || a.includes(lc))) {
      return d.id;
    }
  }
  return null;
}

/** Compute a human-readable "time elapsed" string from an ISO date string. */
export function computeTimeElapsed(dateStr: string | undefined | null): string {
  if (!dateStr) return "Unknown";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  } catch {
    return dateStr;
  }
}

/** Map a Catalyst STATUS string to the dashboard FIRStatus union. */
function mapStatus(catalystStatus: string | undefined): FIRStatus {
  const s = (catalystStatus ?? "").toLowerCase();
  if (s.includes("closed")) return "Closed";
  if (s.includes("escalat")) return "Escalated";
  if (s.includes("investigation")) return "Under Investigation";
  return "Open";
}

/** Map a Catalyst CASE_PRIORITY string to the dashboard Priority union. */
function mapPriority(catalystPriority: string | undefined): Priority {
  const p = (catalystPriority ?? "").toLowerCase();
  if (p.includes("high")) return "High";
  if (p.includes("low")) return "Low";
  return "Medium";
}

// ─── Map FIRCase → dashboard FIR display type ─────────────────────────────

/**
 * Converts a Catalyst `FIRCase` into the dashboard `FIR` shape used by
 * `FIRSection` and related components.
 *
 * Fields not present in Catalyst (e.g. Kannada translations) are approximated
 * or left as the English value.
 */
export function mapFIRCaseToDisplayFIR(fir: FIRCase, index: number): FIR {
  const dateStr = fir.DATE_REPORTED ?? fir.DATE_OF_OFFENCE ?? fir.INCIDENT_DATE;
  const districtMeta = DISTRICT_GRID.find(
    (d) => resolveDistrictId(fir.DISTRICT) === d.id
  );

  return {
    id: `fir-${index}`,
    number: fir.FIR_NUMBER,
    crimeType: fir.CRIME_TYPE ?? "Unknown",
    crimeTypeKn: fir.CRIME_TYPE ?? "Unknown",
    district: fir.DISTRICT ?? "Unknown",
    districtKn: districtMeta?.nameKn ?? fir.DISTRICT ?? "Unknown",
    timeElapsed: computeTimeElapsed(dateStr),
    status: mapStatus(fir.STATUS),
    priority: mapPriority(fir.CASE_PRIORITY),
    officerAssigned: fir.OFFICER_ASSIGNED ?? "Unassigned",
  };
}

// ─── Derive KPI stats from FIRCase[] ─────────────────────────────────────────

export interface CatalystKPIStats {
  totalFIRs: number;
  activeInvestigations: number;
  highPriority: number;
}

export function deriveKPIStats(firCases: FIRCase[]): CatalystKPIStats {
  let activeInvestigations = 0;
  let highPriority = 0;

  for (const fir of firCases) {
    const status = mapStatus(fir.STATUS);
    if (status === "Open" || status === "Under Investigation") {
      activeInvestigations++;
    }
    if (mapPriority(fir.CASE_PRIORITY) === "High") {
      highPriority++;
    }
  }

  return {
    totalFIRs: firCases.length,
    activeInvestigations,
    highPriority,
  };
}

// ─── Derive District data from FIRCase[] ─────────────────────────────────────

/** Density thresholds (crime count → tier). */
function getDensityTier(count: number, max: number): "low" | "medium" | "high" {
  if (max === 0) return "low";
  const ratio = count / max;
  if (ratio >= 0.6) return "high";
  if (ratio >= 0.3) return "medium";
  return "low";
}

/**
 * Groups FIR cases by district and returns an array of `District` objects
 * compatible with `CrimeMap` and `DistrictChart`.
 *
 * Districts with no Catalyst FIR data retain their grid position but show
 * crimeCount = 0 and density = "low".
 */
export function deriveDistrictsFromFIRs(firCases: FIRCase[]): District[] {
  // Accumulate counts per district id
  const countMap: Record<string, number> = {};
  const topCrimeMap: Record<string, Record<string, number>> = {};

  for (const fir of firCases) {
    const id = resolveDistrictId(fir.DISTRICT);
    if (!id) continue;
    countMap[id] = (countMap[id] ?? 0) + 1;

    if (!topCrimeMap[id]) topCrimeMap[id] = {};
    const ct = fir.CRIME_TYPE ?? "Unknown";
    topCrimeMap[id][ct] = (topCrimeMap[id][ct] ?? 0) + 1;
  }

  const maxCount = Math.max(0, ...Object.values(countMap));

  return DISTRICT_GRID.map((d) => {
    const crimeCount = countMap[d.id] ?? 0;
    const crimesByType = topCrimeMap[d.id] ?? {};
    const topCategory =
      Object.entries(crimesByType).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "Unknown";

    return {
      id: d.id,
      name: d.name,
      nameKn: d.nameKn,
      crimeCount,
      density: getDensityTier(crimeCount, maxCount),
      topCategory,
      x: d.x,
      y: d.y,
      gridCol: d.gridCol,
      gridRow: d.gridRow,
    };
  });
}

// ─── Derive crime category breakdown from FIRCase[] ───────────────────────────

const CATEGORY_DISPLAY_MAP: Array<{
  keys: string[];
  label: string;
  nameKey: string;
  color: string;
}> = [
  { keys: ["theft", "vehicle theft", "motor vehicle", "house burglary", "burglary", "pickpocketing", "chain snatching"],
    label: "Theft", nameKey: "catTheft", color: "#0F4C81" },
  { keys: ["assault", "murder", "grievous hurt"],
    label: "Assault", nameKey: "catAssault", color: "#EF4444" },
  { keys: ["cyber", "online fraud", "phishing"],
    label: "Cyber Crime", nameKey: "catCyber", color: "#06B6D4" },
  { keys: ["drug", "narcotic", "excise"],
    label: "Drug Offence", nameKey: "catDrug", color: "#F59E0B" },
  { keys: ["fraud", "cheating", "financial"],
    label: "Fraud", nameKey: "catFraud", color: "#8B5CF6" },
  { keys: ["robbery", "dacoity", "extortion"],
    label: "Robbery", nameKey: "catRobbery", color: "#10B981" },
];

export function deriveCrimeCategories(
  firCases: FIRCase[]
): Array<{ nameKey: string; count: number; color: string }> {
  const buckets: Record<string, number> = {};
  let otherCount = 0;

  for (const fir of firCases) {
    const ct = (fir.CRIME_TYPE ?? "").toLowerCase();
    let matched = false;
    for (const cat of CATEGORY_DISPLAY_MAP) {
      if (cat.keys.some((k) => ct.includes(k))) {
        buckets[cat.nameKey] = (buckets[cat.nameKey] ?? 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) otherCount++;
  }

  const result = CATEGORY_DISPLAY_MAP.map((cat) => ({
    nameKey: cat.nameKey,
    count: buckets[cat.nameKey] ?? 0,
    color: cat.color,
  })).filter((c) => c.count > 0);

  // If we have unclassified crimes, show under Robbery bucket or a generic one
  if (otherCount > 0) {
    const robIdx = result.findIndex((r) => r.nameKey === "catRobbery");
    if (robIdx >= 0) {
      result[robIdx].count += otherCount;
    } else {
      result.push({ nameKey: "catRobbery", count: otherCount, color: "#10B981" });
    }
  }

  return result.length > 0
    ? result
    : [{ nameKey: "catTheft", count: firCases.length, color: "#0F4C81" }];
}

// ─── Map FIRCase → FIRDetailsData ────────────────────────────────────────────

/**
 * Builds a `FIRDetailsData` object from Catalyst API data.
 *
 * Fields not returned by Catalyst (policeStation, legalSections, etc.) are
 * left undefined so the modal renders gracefully without them.
 */
export function mapFIRCaseToDetailsData(
  fir: FIRCase,
  accusedLinks?: Array<{ involvementRole: string; accused: { FULL_NAME: string } }>
): FIRDetailsData {
  const dateStr = fir.DATE_REPORTED ?? fir.DATE_OF_OFFENCE ?? fir.INCIDENT_DATE;

  const accusedNames: string[] = accusedLinks && accusedLinks.length > 0
    ? accusedLinks.map(
        (al) => `${al.accused.FULL_NAME}${al.involvementRole ? ` (${al.involvementRole})` : ""}`
      )
    : fir.ACCUSED_NAME
    ? [fir.ACCUSED_NAME as string]
    : [];

  return {
    number: fir.FIR_NUMBER,
    crimeType: fir.CRIME_TYPE ?? "Unknown",
    district: fir.DISTRICT ?? "Unknown",
    locationName: fir.LOCATION ?? fir.DISTRICT,
    incidentDate: dateStr ? new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    }) : undefined,
    status: mapStatus(fir.STATUS),
    priority: mapPriority(fir.CASE_PRIORITY),
    officerAssigned: fir.OFFICER_ASSIGNED ?? "Unassigned",
    summary: fir.DESCRIPTION as string | undefined,
    accused: accusedNames,
    victims: fir.VICTIM_NAME ? [fir.VICTIM_NAME as string] : [],
    aiInsightText: "AI analysis is available. Use the Investigate with AI button to run a full investigation query.",
    aiConfidence: 0,
  };
}

// ─── Map Accused → AccusedProfileData ────────────────────────────────────────

/**
 * Builds an `AccusedProfileData` object from Catalyst API data.
 *
 * Some fields (vehicles, phone numbers, frequentLocations, detailed crimeHistory)
 * are not available from the Catalyst accused endpoint and are left empty.
 */
export function mapAccusedToProfileData(
  accused: Accused,
  network?: CriminalNetworkResponse,
  relatedFIRs?: FIRCase[]
): AccusedProfileData {
  const aliases = accused.ALIAS_NAME
    ? [accused.ALIAS_NAME]
    : [];

  const associates: AccusedProfileData["associates"] = network
    ? network.relationships.map((rel) => ({
        name: rel.connectedAccused.FULL_NAME,
        role: rel.relationship.type,
        risk: rel.connectedAccused.RISK_LEVEL ?? "MEDIUM",
      }))
    : accused.KNOWN_ASSOCIATES
    ? (accused.KNOWN_ASSOCIATES as string).split(",").map((n) => ({ name: n.trim() }))
    : [];

  const crimeHistory: AccusedProfileData["crimeHistory"] = relatedFIRs
    ? relatedFIRs.slice(0, 5).map((f) => ({
        firNumber: f.FIR_NUMBER,
        crimeType: f.CRIME_TYPE ?? "Unknown",
        date: f.DATE_REPORTED ?? f.DATE_OF_OFFENCE ?? "Unknown",
        status: f.STATUS ?? "Unknown",
      }))
    : [];

  const riskLevelMap: Record<string, AccusedProfileData["riskLevel"]> = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  };
  const riskLevel: AccusedProfileData["riskLevel"] =
    riskLevelMap[(accused.RISK_LEVEL ?? "").toLowerCase()] ?? "MEDIUM";

  return {
    id: accused.ACCUSED_ID,
    name: accused.FULL_NAME,
    aliases,
    riskLevel,
    status: `RISK_LEVEL: ${accused.RISK_LEVEL ?? "Unknown"}`,
    age: typeof accused.AGE === "number" ? accused.AGE : parseInt(String(accused.AGE)) || undefined,
    gender: accused.GENDER,
    district: accused.DISTRICT ?? "Unknown",
    previousFIRCount: network ? network.connectionCount : crimeHistory.length,
    crimeCategories: crimeHistory.map((h) => h.crimeType).filter(Boolean),
    associates,
    vehicles: [],
    phoneNumbers: [],
    frequentLocations: accused.LAST_KNOWN_LOCATION
      ? [accused.LAST_KNOWN_LOCATION as string]
      : [accused.DISTRICT ?? "Unknown"],
    crimeHistory,
    aiBehavioralPattern: accused.CRIMINAL_HISTORY
      ? {
          text: accused.CRIMINAL_HISTORY as string,
          confidence: 80,
          supportingCasesCount: crimeHistory.length,
          locationsCount: 1,
        }
      : undefined,
  };
}

// ─── Map FIRCase[] + Accused[] → SearchResultItem[] ──────────────────────────

/**
 * Converts Catalyst FIR cases and accused persons into the `SearchResultItem[]`
 * shape consumed by `GlobalSearchModal`.
 */
export function mapToSearchResults(
  firCases: FIRCase[],
  accusedList: Accused[],
  query: string
): SearchResultItem[] {
  const q = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];

  // FIR matches
  for (const fir of firCases) {
    const searchText = [
      fir.FIR_NUMBER,
      fir.CRIME_TYPE,
      fir.DISTRICT,
      fir.OFFICER_ASSIGNED,
      fir.LOCATION,
      fir.STATUS,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (q.length === 0 || searchText.includes(q)) {
      results.push({
        id: `fir-${fir.FIR_NUMBER}`,
        category: "FIR",
        title: fir.FIR_NUMBER,
        subtitle: `${fir.CRIME_TYPE ?? "Unknown"} · ${fir.DISTRICT ?? "Unknown"}`,
        tag: mapPriority(fir.CASE_PRIORITY) === "High" ? "HIGH PRIORITY" : mapStatus(fir.STATUS),
        badgeColor: mapPriority(fir.CASE_PRIORITY) === "High" ? "#EF4444" : "#0F4C81",
        district: fir.DISTRICT,
        details: `Status: ${fir.STATUS ?? "Unknown"} · Officer: ${fir.OFFICER_ASSIGNED ?? "Unassigned"}`,
        crimeType: fir.CRIME_TYPE,
        status: fir.STATUS,
        priority: mapPriority(fir.CASE_PRIORITY) as "Critical" | "High" | "Medium" | "Low",
        date: fir.DATE_REPORTED ?? fir.DATE_OF_OFFENCE ?? fir.INCIDENT_DATE,
      });
    }
  }

  // Accused matches
  for (const accused of accusedList) {
    const searchText = [
      accused.FULL_NAME,
      accused.ALIAS_NAME,
      accused.DISTRICT,
      accused.RISK_LEVEL,
      accused.ADDRESS_INFO,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (q.length === 0 || searchText.includes(q)) {
      const riskLevelMap: Record<string, string> = {
        high: "#EF4444",
        critical: "#DC2626",
        medium: "#F59E0B",
        low: "#10B981",
      };
      const riskColor =
        riskLevelMap[(accused.RISK_LEVEL ?? "").toLowerCase()] ?? "#F59E0B";

      results.push({
        id: `accused-${accused.ACCUSED_ID}`,
        category: "Accused",
        title: accused.FULL_NAME,
        subtitle: [
          accused.ALIAS_NAME ? `Alias: "${accused.ALIAS_NAME}"` : null,
          `ID: ${accused.ACCUSED_ID}`,
        ]
          .filter(Boolean)
          .join(" · "),
        tag: `${accused.RISK_LEVEL ?? "MEDIUM"} RISK`,
        badgeColor: riskColor,
        district: accused.DISTRICT,
        details: [
          accused.ADDRESS_INFO,
          accused.LAST_KNOWN_LOCATION ? `Last seen: ${accused.LAST_KNOWN_LOCATION}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      });
    }
  }

  return results;
}
