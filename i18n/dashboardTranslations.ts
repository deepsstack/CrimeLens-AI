// i18n/dashboardTranslations.ts — CrimeLens AI Dashboard translations (EN / KN)

export type Lang = "en" | "kn";

export interface DashboardT {
  // ── Top Header ──────────────────────────────────────────────────────
  headerTitle: string;
  headerSubtitle: string;
  searchPlaceholder: string;
  langToggleLabel: string;

  // ── Bottom Tab Bar ───────────────────────────────────────────────────
  tabHome: string;
  tabCopilot: string;
  tabAnalytics: string;
  tabNetwork: string;
  tabReports: string;

  // ── KPI Card titles ──────────────────────────────────────────────────
  kpiTotalFIRs: string;
  kpiActiveInvestigations: string;
  kpiHighPriority: string;
  kpiCrimeAlerts: string;
  kpiPredictedHotspots: string;
  kpiTimeSaved: string;
  vsLastWeek: string;
  vsYesterday: string;

  // ── Crime Map ────────────────────────────────────────────────────────
  mapTitle: string;
  mapLegendLow: string;
  mapLegendMedium: string;
  mapLegendHigh: string;
  mapHotspot: string;
  mapDistrictCrimes: string;
  mapTopCategory: string;
  mapDensityLabel: string;

  // ── Trend Chart ──────────────────────────────────────────────────────
  trendTitle: string;
  trendWeekly: string;
  trendMonthly: string;
  trendYearly: string;
  trendTheft: string;
  trendAssault: string;
  trendCyber: string;
  trendDrug: string;
  trendCases: string;

  // ── AI Brief ─────────────────────────────────────────────────────────
  aiBriefGreeting: string;
  aiBriefSummary: string;
  aiBriefRec1Title: string;
  aiBriefRec1Desc: string;
  aiBriefRec2Title: string;
  aiBriefRec2Desc: string;
  aiBriefRec3Title: string;
  aiBriefRec3Desc: string;
  aiBriefRec4Title: string;
  aiBriefRec4Desc: string;
  aiBriefViewReport: string;
  aiBriefDeployPatrol: string;
  aiBriefActionConfirm: string;

  // ── District Chart ───────────────────────────────────────────────────
  districtChartTitle: string;

  // ── Category Donut ───────────────────────────────────────────────────
  categoryChartTitle: string;
  categoryTotalCases: string;
  catTheft: string;
  catAssault: string;
  catCyber: string;
  catDrug: string;
  catFraud: string;
  catRobbery: string;

  // ── FIR Section ──────────────────────────────────────────────────────
  firSectionTitle: string;
  firTimelineTitle: string;
  firTableTitle: string;
  firColNumber: string;
  firColCrimeType: string;
  firColDistrict: string;
  firColStatus: string;
  firColPriority: string;
  firColOfficer: string;
  firColAction: string;
  firQuickAction: string;
  firActionViewDetails: string;
  firActionAssignOfficer: string;
  firActionEscalate: string;
  firStatusOpen: string;
  firStatusUnderInvestigation: string;
  firStatusClosed: string;
  firStatusEscalated: string;
  firPriorityHigh: string;
  firPriorityMedium: string;
  firPriorityLow: string;

  // ── Intel Feed ───────────────────────────────────────────────────────
  intelFeedTitle: string;
  intelRepeatOffender: string;
  intelCrimeSpike: string;
  intelMissingPerson: string;
  intelHighRiskZone: string;
  intelSeverityCritical: string;
  intelSeverityHigh: string;
  intelSeverityMedium: string;
  intelDesc1: string;
  intelDesc2: string;
  intelDesc3: string;
  intelDesc4: string;
  intelDesc5: string;
  intelDesc6: string;
  intelDesc7: string;

  // ── Quick Tools ──────────────────────────────────────────────────────
  quickToolsTitle: string;
  qtSearchFIR: string;
  qtSearchFIRDesc: string;
  qtSearchAccused: string;
  qtSearchAccusedDesc: string;
  qtGenerateReport: string;
  qtGenerateReportDesc: string;
  qtCrimePrediction: string;
  qtCrimePredictionDesc: string;
  qtNetworkAnalysis: string;
  qtNetworkAnalysisDesc: string;
  qtVoiceInvest: string;
  qtVoiceInvestDesc: string;
  toastSearchFIR: string;
  toastSearchAccused: string;
  toastGenerateReport: string;
  toastCrimePrediction: string;
  toastNetworkAnalysis: string;
  toastVoiceInvest: string;

  // ── AI Panel ─────────────────────────────────────────────────────────
  aiPanelTitle: string;
  aiPanelConfidenceLabel: string;
  aiPanelRec: string;
  aiPanelLastUpdate: string;
  aiPanelXAITitle: string;
  signalHistorical: string;
  signalWeather: string;
  signalEventCal: string;

  // ── Placeholder tabs ─────────────────────────────────────────────────
  placeholderComingSoon: string;

  // ── General / shared ─────────────────────────────────────────────────
  loading: string;
  noData: string;
  close: string;
  dismiss: string;
}

export const T: Record<Lang, DashboardT> = {
  /* ═══════════════════════════════════════════════════════════
     ENGLISH
  ═══════════════════════════════════════════════════════════ */
  en: {
    // ── Top Header ────────────────────────────────────────────
    headerTitle:      "CrimeLens AI",
    headerSubtitle:   "Karnataka State Police · Intelligence Command",
    searchPlaceholder:"Search FIRs, suspects, districts…",
    langToggleLabel:  "KN",

    // ── Bottom Tab Bar ────────────────────────────────────────
    tabHome:      "Dashboard",
    tabCopilot:   "AI Investigation",
    tabAnalytics: "Analytics",
    tabNetwork:   "Network",
    tabReports:   "Reports",

    // ── KPI Card titles ───────────────────────────────────────
    kpiTotalFIRs:            "Total FIRs Registered",
    kpiActiveInvestigations: "Active Investigations",
    kpiHighPriority:         "High Priority Cases",
    kpiCrimeAlerts:          "Crime Alerts Today",
    kpiPredictedHotspots:    "Predicted Hotspots",
    kpiTimeSaved:            "Investigation Time Saved (AI)",
    vsLastWeek:              "vs last week",
    vsYesterday:             "vs yesterday",

    // ── Crime Map ─────────────────────────────────────────────
    mapTitle:          "Karnataka Crime Intelligence Map",
    mapLegendLow:      "Low",
    mapLegendMedium:   "Medium",
    mapLegendHigh:     "High",
    mapHotspot:        "Hotspot",
    mapDistrictCrimes: "Crimes",
    mapTopCategory:    "Top Category",
    mapDensityLabel:   "Density",

    // ── Trend Chart ───────────────────────────────────────────
    trendTitle:   "Crime Trend Analytics",
    trendWeekly:  "Weekly",
    trendMonthly: "Monthly",
    trendYearly:  "Yearly",
    trendTheft:   "Theft",
    trendAssault: "Assault",
    trendCyber:   "Cyber Crime",
    trendDrug:    "Drug Offence",
    trendCases:   "Cases",

    // ── AI Brief ──────────────────────────────────────────────
    aiBriefGreeting:    "Good Morning, Inspector.",
    aiBriefSummary:     "Overnight analysis identified a 12.5% spike in high-priority cases across Bengaluru and Mysuru. Theft incidents peaked on Friday–Saturday. Cyber crime reports in Kalaburagi rose by 18%. Recommend increased patrol deployment in hotspot zones and immediate review of escalated FIRs.",
    aiBriefRec1Title:   "Deploy Patrols to Hotspot Zones",
    aiBriefRec1Desc:    "Bengaluru North and Mysuru Central show elevated risk — recommend immediate patrol reinforcement.",
    aiBriefRec2Title:   "Review Escalated FIRs",
    aiBriefRec2Desc:    "4 FIRs escalated overnight require senior officer review within 2 hours.",
    aiBriefRec3Title:   "Cross-District Coordination",
    aiBriefRec3Desc:    "Repeat offender pattern spans Belagavi and Hubballi — coordinate inter-district intelligence sharing.",
    aiBriefRec4Title:   "Activate Cyber Cell Alert",
    aiBriefRec4Desc:    "Kalaburagi cyber crime spike warrants immediate Cyber Cell activation and suspect profiling.",
    aiBriefViewReport:  "View Full Report",
    aiBriefDeployPatrol:"Deploy Patrol",
    aiBriefActionConfirm: "Action confirmed. Patrol deployment initiated.",

    // ── District Chart ────────────────────────────────────────
    districtChartTitle: "District Crime Comparison",

    // ── Category Donut ────────────────────────────────────────
    categoryChartTitle: "Crime Category Breakdown",
    categoryTotalCases: "Total Cases",
    catTheft:    "Theft",
    catAssault:  "Assault",
    catCyber:    "Cyber Crime",
    catDrug:     "Drug Offence",
    catFraud:    "Fraud",
    catRobbery:  "Robbery",

    // ── FIR Section ───────────────────────────────────────────
    firSectionTitle:            "Recent FIR Activity",
    firTimelineTitle:           "Recent Timeline",
    firTableTitle:              "FIR Register",
    firColNumber:               "FIR Number",
    firColCrimeType:            "Crime Type",
    firColDistrict:             "District",
    firColStatus:               "Status",
    firColPriority:             "Priority",
    firColOfficer:              "Officer Assigned",
    firColAction:               "Quick Action",
    firQuickAction:             "Quick Action",
    firActionViewDetails:       "View Details",
    firActionAssignOfficer:     "Assign Officer",
    firActionEscalate:          "Escalate",
    firStatusOpen:              "Open",
    firStatusUnderInvestigation:"Under Investigation",
    firStatusClosed:            "Closed",
    firStatusEscalated:         "Escalated",
    firPriorityHigh:            "High",
    firPriorityMedium:          "Medium",
    firPriorityLow:             "Low",

    // ── Intel Feed ────────────────────────────────────────────
    intelFeedTitle:        "Real-Time Intelligence Feed",
    intelRepeatOffender:   "Repeat Offender Alert",
    intelCrimeSpike:       "Crime Spike Detected",
    intelMissingPerson:    "Missing Person Match",
    intelHighRiskZone:     "High Risk Zone Warning",
    intelSeverityCritical: "Critical",
    intelSeverityHigh:     "High",
    intelSeverityMedium:   "Medium",
    intelDesc1: "Known repeat offender Ravi S. (3 prior convictions) sighted near Bengaluru City Market. Immediate apprehension advised.",
    intelDesc2: "Theft incidents in Mysuru Central up 34% in the last 6 hours. Pattern consistent with organised gang activity.",
    intelDesc3: "Missing person case FIR-2024-08415 matched to CCTV footage at Hubballi Bus Stand. Last seen 08:42 AM.",
    intelDesc4: "Mangaluru Port Zone flagged as high-risk following intelligence on suspected narcotics movement. Enhanced vigilance required.",
    intelDesc5: "Kalaburagi district reports 5 cyber fraud complaints in 3 hours. Linked to phishing network — Cyber Cell notified.",
    intelDesc6: "Repeat offender Mohammed K. linked to 2 recent theft cases in Belagavi. Warrant issued. Coordinate with local units.",
    intelDesc7: "Raichur industrial area shows elevated crime risk per AI model. Patrol redeployment recommended before nightfall.",

    // ── Quick Tools ───────────────────────────────────────────
    quickToolsTitle:       "Quick Investigation Tools",
    qtSearchFIR:           "Search FIR",
    qtSearchFIRDesc:       "Lookup by FIR number or crime type",
    qtSearchAccused:       "Search Accused",
    qtSearchAccusedDesc:   "Search suspect database by name or ID",
    qtGenerateReport:      "Generate AI Report",
    qtGenerateReportDesc:  "AI-compiled investigation summary",
    qtCrimePrediction:     "Crime Prediction",
    qtCrimePredictionDesc: "Run predictive model for risk zones",
    qtNetworkAnalysis:     "Network Analysis",
    qtNetworkAnalysisDesc: "Map criminal network connections",
    qtVoiceInvest:         "Voice Investigation",
    qtVoiceInvestDesc:     "Query investigation data by voice",
    toastSearchFIR:        "Opening FIR Search…",
    toastSearchAccused:    "Searching Accused Database…",
    toastGenerateReport:   "Generating AI Investigation Report…",
    toastCrimePrediction:  "Launching Crime Prediction Model…",
    toastNetworkAnalysis:  "Loading Criminal Network Analysis…",
    toastVoiceInvest:      "Activating Voice Investigation Mode…",

    // ── AI Panel ──────────────────────────────────────────────
    aiPanelTitle:          "AI Intelligence Engine",
    aiPanelConfidenceLabel:"Confidence Score",
    aiPanelRec:            "Increase patrol density in Bengaluru North and Mysuru Central zones. High theft probability predicted for Friday–Saturday 20:00–02:00.",
    aiPanelLastUpdate:     "Last Model Update",
    aiPanelXAITitle:       "Explainable AI Signals",
    signalHistorical:      "Historical Patterns",
    signalWeather:         "Weather",
    signalEventCal:        "Event Calendar",

    // ── Placeholder tabs ──────────────────────────────────────
    placeholderComingSoon: "This workspace is coming soon.",

    // ── General / shared ──────────────────────────────────────
    loading: "Loading…",
    noData:  "No data available",
    close:   "Close",
    dismiss: "Dismiss",
  },

  /* ═══════════════════════════════════════════════════════════
     KANNADA
  ═══════════════════════════════════════════════════════════ */
  kn: {
    // ── Top Header ────────────────────────────────────────────
    headerTitle:      "ಕ್ರೈಮ್‌ಲೆನ್ಸ್ AI",
    headerSubtitle:   "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ · ಗುಪ್ತಚರ ಕಮಾಂಡ್",
    searchPlaceholder:"FIR, ಅನುಮಾನಿತರು, ಜಿಲ್ಲೆಗಳನ್ನು ಹುಡುಕಿ…",
    langToggleLabel:  "EN",

    // ── Bottom Tab Bar ────────────────────────────────────────
    tabHome:      "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    tabCopilot:   "AI ತನಿಖೆ",
    tabAnalytics: "ವಿಶ್ಲೇಷಣೆ",
    tabNetwork:   "ನೆಟ್‌ವರ್ಕ್",
    tabReports:   "ವರದಿಗಳು",

    // ── KPI Card titles ───────────────────────────────────────
    kpiTotalFIRs:            "ನೋಂದಾಯಿಸಲಾದ ಒಟ್ಟು FIR ಗಳು",
    kpiActiveInvestigations: "ಸಕ್ರಿಯ ತನಿಖೆಗಳು",
    kpiHighPriority:         "ಹೆಚ್ಚು ಆದ್ಯತೆಯ ಪ್ರಕರಣಗಳು",
    kpiCrimeAlerts:          "ಇಂದಿನ ಅಪರಾಧ ಎಚ್ಚರಿಕೆಗಳು",
    kpiPredictedHotspots:    "ಅಂದಾಜು ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",
    kpiTimeSaved:            "AI ತನಿಖಾ ಸಮಯ ಉಳಿತಾಯ",
    vsLastWeek:              "ಕಳೆದ ವಾರಕ್ಕೆ ಹೋಲಿಸಿ",
    vsYesterday:             "ನಿನ್ನೆಗೆ ಹೋಲಿಸಿ",

    // ── Crime Map ─────────────────────────────────────────────
    mapTitle:          "ಕರ್ನಾಟಕ ಅಪರಾಧ ಗುಪ್ತಚರ ನಕ್ಷೆ",
    mapLegendLow:      "ಕಡಿಮೆ",
    mapLegendMedium:   "ಮಧ್ಯಮ",
    mapLegendHigh:     "ಹೆಚ್ಚು",
    mapHotspot:        "ಹಾಟ್‌ಸ್ಪಾಟ್",
    mapDistrictCrimes: "ಅಪರಾಧಗಳು",
    mapTopCategory:    "ಮುಖ್ಯ ವರ್ಗ",
    mapDensityLabel:   "ಸಾಂದ್ರತೆ",

    // ── Trend Chart ───────────────────────────────────────────
    trendTitle:   "ಅಪರಾಧ ಪ್ರವೃತ್ತಿ ವಿಶ್ಲೇಷಣೆ",
    trendWeekly:  "ವಾರಿಕ",
    trendMonthly: "ಮಾಸಿಕ",
    trendYearly:  "ವಾರ್ಷಿಕ",
    trendTheft:   "ಕಳ್ಳತನ",
    trendAssault: "ಹಲ್ಲೆ",
    trendCyber:   "ಸೈಬರ್ ಅಪರಾಧ",
    trendDrug:    "ಮಾದಕ ದ್ರವ್ಯ",
    trendCases:   "ಪ್ರಕರಣಗಳು",

    // ── AI Brief ──────────────────────────────────────────────
    aiBriefGreeting:    "ಶುಭ ಬೆಳಗು, ಇನ್ಸ್‌ಪೆಕ್ಟರ್.",
    aiBriefSummary:     "ರಾತ್ರೋರಾತ್ರಿ ವಿಶ್ಲೇಷಣೆಯು ಬೆಂಗಳೂರು ಮತ್ತು ಮೈಸೂರಿನಲ್ಲಿ ಹೆಚ್ಚು ಆದ್ಯತೆಯ ಪ್ರಕರಣಗಳಲ್ಲಿ 12.5% ಏರಿಕೆ ಗುರುತಿಸಿದೆ. ಕದ್ದ ಘಟನೆಗಳು ಶುಕ್ರ-ಶನಿವಾರ ಗರಿಷ್ಠ ಮಟ್ಟ ತಲುಪಿವೆ. ಕಲಬುರಗಿಯಲ್ಲಿ ಸೈಬರ್ ಅಪರಾಧ ವರದಿಗಳು 18% ಏರಿವೆ. ಹಾಟ್‌ಸ್ಪಾಟ್ ವಲಯಗಳಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಗಸ್ತು ನಿಯೋಜಿಸಲು ಮತ್ತು ಏರ್ಪಡಿಸಲಾದ FIR ಗಳನ್ನು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
    aiBriefRec1Title:   "ಹಾಟ್‌ಸ್ಪಾಟ್ ವಲಯಗಳಿಗೆ ಗಸ್ತು ನಿಯೋಜಿಸಿ",
    aiBriefRec1Desc:    "ಬೆಂಗಳೂರು ಉತ್ತರ ಮತ್ತು ಮೈಸೂರು ಮಧ್ಯ ಅಧಿಕ ಅಪಾಯದ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದು ತಕ್ಷಣ ಗಸ್ತು ಬಲಪಡಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
    aiBriefRec2Title:   "ಏರ್ಪಡಿಸಿದ FIR ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    aiBriefRec2Desc:    "ರಾತ್ರೋರಾತ್ರಿ ಏರ್ಪಡಿಸಲಾದ 4 FIR ಗಳಿಗೆ 2 ಗಂಟೆಗಳೊಳಗೆ ಹಿರಿಯ ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ ಅಗತ್ಯ.",
    aiBriefRec3Title:   "ಅಂತರ-ಜಿಲ್ಲಾ ಸಮನ್ವಯ",
    aiBriefRec3Desc:    "ಬೆಳಗಾವಿ ಮತ್ತು ಹುಬ್ಬಳ್ಳಿ ನಡುವೆ ಮರಳಿ ಅಪರಾಧ ಮಾಡುವ ವ್ಯಕ್ತಿಯ ಮಾದರಿ ಇದೆ — ಅಂತರ-ಜಿಲ್ಲಾ ಗುಪ್ತಚರ ಹಂಚಿಕೆ ಸಂಘಟಿಸಿ.",
    aiBriefRec4Title:   "ಸೈಬರ್ ಸೆಲ್ ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯಗೊಳಿಸಿ",
    aiBriefRec4Desc:    "ಕಲಬುರಗಿ ಸೈಬರ್ ಅಪರಾಧ ಏರಿಕೆಗೆ ತಕ್ಷಣ ಸೈಬರ್ ಸೆಲ್ ಸಕ್ರಿಯಗೊಳಿಸಿ ಮತ್ತು ಅನುಮಾನಿತರ ಪ್ರೊಫೈಲಿಂಗ್ ಮಾಡಬೇಕು.",
    aiBriefViewReport:  "ಪೂರ್ಣ ವರದಿ ವೀಕ್ಷಿಸಿ",
    aiBriefDeployPatrol:"ಗಸ್ತು ನಿಯೋಜಿಸಿ",
    aiBriefActionConfirm: "ಕ್ರಿಯೆ ದೃಢಪಡಿಸಲಾಗಿದೆ. ಗಸ್ತು ನಿಯೋಜನೆ ಆರಂಭಿಸಲಾಗಿದೆ.",

    // ── District Chart ────────────────────────────────────────
    districtChartTitle: "ಜಿಲ್ಲಾ ಅಪರಾಧ ಹೋಲಿಕೆ",

    // ── Category Donut ────────────────────────────────────────
    categoryChartTitle: "ಅಪರಾಧ ವರ್ಗ ವಿಭಜನೆ",
    categoryTotalCases: "ಒಟ್ಟು ಪ್ರಕರಣಗಳು",
    catTheft:    "ಕಳ್ಳತನ",
    catAssault:  "ಹಲ್ಲೆ",
    catCyber:    "ಸೈಬರ್ ಅಪರಾಧ",
    catDrug:     "ಮಾದಕ ದ್ರವ್ಯ",
    catFraud:    "ವಂಚನೆ",
    catRobbery:  "ದರೋಡೆ",

    // ── FIR Section ───────────────────────────────────────────
    firSectionTitle:            "ಇತ್ತೀಚಿನ FIR ಚಟುವಟಿಕೆ",
    firTimelineTitle:           "ಇತ್ತೀಚಿನ ಸಮಯಕ್ರಮ",
    firTableTitle:              "FIR ನೋಂದಣಿ",
    firColNumber:               "FIR ಸಂಖ್ಯೆ",
    firColCrimeType:            "ಅಪರಾಧ ವಿಧ",
    firColDistrict:             "ಜಿಲ್ಲೆ",
    firColStatus:               "ಸ್ಥಿತಿ",
    firColPriority:             "ಆದ್ಯತೆ",
    firColOfficer:              "ನಿಯೋಜಿತ ಅಧಿಕಾರಿ",
    firColAction:               "ತ್ವರಿತ ಕ್ರಿಯೆ",
    firQuickAction:             "ತ್ವರಿತ ಕ್ರಿಯೆ",
    firActionViewDetails:       "ವಿವರ ವೀಕ್ಷಿಸಿ",
    firActionAssignOfficer:     "ಅಧಿಕಾರಿ ನಿಯೋಜಿಸಿ",
    firActionEscalate:          "ಮೇಲ್ಮಟ್ಟಕ್ಕೆ ಕಳುಹಿಸಿ",
    firStatusOpen:              "ತೆರೆದಿದೆ",
    firStatusUnderInvestigation:"ತನಿಖೆ ನಡೆಯುತ್ತಿದೆ",
    firStatusClosed:            "ಮುಕ್ತಾಯ",
    firStatusEscalated:         "ಏರ್ಪಡಿಸಲಾಗಿದೆ",
    firPriorityHigh:            "ಹೆಚ್ಚು",
    firPriorityMedium:          "ಮಧ್ಯಮ",
    firPriorityLow:             "ಕಡಿಮೆ",

    // ── Intel Feed ────────────────────────────────────────────
    intelFeedTitle:        "ನೈಜ-ಸಮಯ ಗುಪ್ತಚರ ಫೀಡ್",
    intelRepeatOffender:   "ಮರುಳಿ ಅಪರಾಧಿ ಎಚ್ಚರಿಕೆ",
    intelCrimeSpike:       "ಅಪರಾಧ ಹೆಚ್ಚಳ ಪತ್ತೆ",
    intelMissingPerson:    "ನಾಪತ್ತೆ ವ್ಯಕ್ತಿ ಹೊಂದಾಣಿಕೆ",
    intelHighRiskZone:     "ಅಧಿಕ ಅಪಾಯ ವಲಯ ಎಚ್ಚರಿಕೆ",
    intelSeverityCritical: "ತೀವ್ರ",
    intelSeverityHigh:     "ಹೆಚ್ಚು",
    intelSeverityMedium:   "ಮಧ್ಯಮ",
    intelDesc1: "ಪರಿಚಿತ ಮರಳಿ ಅಪರಾಧಿ ರವಿ ಎಸ್. (3 ಹಿಂದಿನ ಅಪರಾಧಗಳು) ಬೆಂಗಳೂರು ಸಿಟಿ ಮಾರ್ಕೆಟ್ ಸಮೀಪ ಕಾಣಿಸಿಕೊಂಡಿದ್ದಾರೆ. ತಕ್ಷಣ ಬಂಧನ ಸಲಹೆ ಮಾಡಲಾಗಿದೆ.",
    intelDesc2: "ಮೈಸೂರು ಮಧ್ಯ ಭಾಗದಲ್ಲಿ ಕಳೆದ 6 ಗಂಟೆಗಳಲ್ಲಿ ಕಳ್ಳತನ ಘಟನೆಗಳು 34% ಹೆಚ್ಚಾಗಿವೆ. ಸಂಘಟಿತ ಗ್ಯಾಂಗ್ ಚಟುವಟಿಕೆಯ ಲಕ್ಷಣಗಳು ಕಾಣಿಸಿವೆ.",
    intelDesc3: "ನಾಪತ್ತೆ ವ್ಯಕ್ತಿ ಪ್ರಕರಣ FIR-2024-08415 ಹುಬ್ಬಳ್ಳಿ ಬಸ್ ನಿಲ್ದಾಣದ CCTV ತಸ್ವೀರಿನಲ್ಲಿ ಹೊಂದಾಣಿಕೆ. ಕೊನೆಯ ಬಾರಿ 08:42 ಬೆಳಗ್ಗೆ ಕಾಣಿಸಿದ್ದಾರೆ.",
    intelDesc4: "ಮಂಗಳೂರು ಬಂದರು ವಲಯವನ್ನು ಸಂಶಯಾಸ್ಪದ ಮಾದಕ ದ್ರವ್ಯ ಸಾಗಾಣಿಕೆ ಗುಪ್ತಚರ ಮಾಹಿತಿ ಆಧಾರದಲ್ಲಿ ಅಧಿಕ ಅಪಾಯಕಾರಿ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. ಹೆಚ್ಚುವರಿ ಕಾವಲು ಅಗತ್ಯ.",
    intelDesc5: "ಕಲಬುರಗಿ ಜಿಲ್ಲೆಯಲ್ಲಿ 3 ಗಂಟೆಗಳಲ್ಲಿ 5 ಸೈಬರ್ ವಂಚನೆ ದೂರುಗಳು ದಾಖಲಾಗಿವೆ. ಫಿಶಿಂಗ್ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸಂಬಂಧ — ಸೈಬರ್ ಸೆಲ್‌ಗೆ ತಿಳಿಸಲಾಗಿದೆ.",
    intelDesc6: "ಬೆಳಗಾವಿಯ ಮರಳಿ ಅಪರಾಧಿ ಮೊಹಮ್ಮದ್ ಕೆ. ಇತ್ತೀಚಿನ 2 ಕಳ್ಳತನ ಪ್ರಕರಣಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ್ದಾರೆ. ವಾರಂಟ್ ಜಾರಿ. ಸ್ಥಳೀಯ ಘಟಕಗಳೊಂದಿಗೆ ಸಮನ್ವಯ ಸಾಧಿಸಿ.",
    intelDesc7: "AI ಮಾದರಿ ಪ್ರಕಾರ ರಾಯಚೂರು ಕೈಗಾರಿಕಾ ಪ್ರದೇಶದಲ್ಲಿ ಅಧಿಕ ಅಪರಾಧ ಅಪಾಯ ಕಂಡುಬಂದಿದೆ. ರಾತ್ರಿ ಬೀಳುವ ಮೊದಲು ಗಸ್ತು ಮರು-ನಿಯೋಜನೆ ಶಿಫಾರಸು.",

    // ── Quick Tools ───────────────────────────────────────────
    quickToolsTitle:       "ತ್ವರಿತ ತನಿಖಾ ಉಪಕರಣಗಳು",
    qtSearchFIR:           "FIR ಹುಡುಕಿ",
    qtSearchFIRDesc:       "FIR ಸಂಖ್ಯೆ ಅಥವಾ ಅಪರಾಧ ವಿಧದಿಂದ ಹುಡುಕಿ",
    qtSearchAccused:       "ಅನುಮಾನಿತ ಹುಡುಕಿ",
    qtSearchAccusedDesc:   "ಹೆಸರು ಅಥವಾ ID ಯಿಂದ ಅನುಮಾನಿತ ಡೇಟಾಬೇಸ್ ಹುಡುಕಿ",
    qtGenerateReport:      "AI ವರದಿ ರಚಿಸಿ",
    qtGenerateReportDesc:  "AI-ಸಂಕಲಿತ ತನಿಖಾ ಸಾರಾಂಶ",
    qtCrimePrediction:     "ಅಪರಾಧ ಮುನ್ಸೂಚನೆ",
    qtCrimePredictionDesc: "ಅಪಾಯ ವಲಯಗಳಿಗೆ ಭವಿಷ್ಯ ಮಾದರಿ ಚಾಲಿಸಿ",
    qtNetworkAnalysis:     "ನೆಟ್‌ವರ್ಕ್ ವಿಶ್ಲೇಷಣೆ",
    qtNetworkAnalysisDesc: "ಅಪರಾಧ ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕಗಳ ನಕ್ಷೆ",
    qtVoiceInvest:         "ಧ್ವನಿ ತನಿಖೆ",
    qtVoiceInvestDesc:     "ಧ್ವನಿ ಮೂಲಕ ತನಿಖಾ ಡೇಟಾ ಪ್ರಶ್ನಿಸಿ",
    toastSearchFIR:        "FIR ಹುಡುಕಾಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ…",
    toastSearchAccused:    "ಅನುಮಾನಿತ ಡೇಟಾಬೇಸ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
    toastGenerateReport:   "AI ತನಿಖಾ ವರದಿ ರಚಿಸಲಾಗುತ್ತಿದೆ…",
    toastCrimePrediction:  "ಅಪರಾಧ ಮುನ್ಸೂಚನಾ ಮಾದರಿ ಆರಂಭಿಸಲಾಗುತ್ತಿದೆ…",
    toastNetworkAnalysis:  "ಅಪರಾಧ ನೆಟ್‌ವರ್ಕ್ ವಿಶ್ಲೇಷಣೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    toastVoiceInvest:      "ಧ್ವನಿ ತನಿಖಾ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ…",

    // ── AI Panel ──────────────────────────────────────────────
    aiPanelTitle:          "AI ಗುಪ್ತಚರ ಎಂಜಿನ್",
    aiPanelConfidenceLabel:"ವಿಶ್ವಾಸ ಅಂಕ",
    aiPanelRec:            "ಬೆಂಗಳೂರು ಉತ್ತರ ಮತ್ತು ಮೈಸೂರು ಮಧ್ಯ ವಲಯಗಳಲ್ಲಿ ಗಸ್ತು ಸಾಂದ್ರತೆ ಹೆಚ್ಚಿಸಿ. ಶುಕ್ರ-ಶನಿವಾರ 20:00–02:00 ಸಮಯದಲ್ಲಿ ಅಧಿಕ ಕಳ್ಳತನ ಸಂಭಾವ್ಯತೆ ಅಂದಾಜು.",
    aiPanelLastUpdate:     "ಕೊನೆಯ ಮಾದರಿ ನವೀಕರಣ",
    aiPanelXAITitle:       "ವಿವರಣಾತ್ಮಕ AI ಸಂಕೇತಗಳು",
    signalHistorical:      "ಐತಿಹಾಸಿಕ ಮಾದರಿಗಳು",
    signalWeather:         "ಹವಾಮಾನ",
    signalEventCal:        "ಕಾರ್ಯಕ್ರಮ ಕ್ಯಾಲೆಂಡರ್",

    // ── Placeholder tabs ──────────────────────────────────────
    placeholderComingSoon: "ಈ ವರ್ಕ್‌ಸ್ಪೇಸ್ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ.",

    // ── General / shared ──────────────────────────────────────
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    noData:  "ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ",
    close:   "ಮುಚ್ಚಿ",
    dismiss: "ವಜಾಗೊಳಿಸಿ",
  },
};
