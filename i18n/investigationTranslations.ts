// i18n/investigationTranslations.ts — CrimeLens AI Investigation Workspace translations

export type Lang = "en" | "kn";

export interface InvestigationT {
  // Top Bar
  workspaceTitle: string;
  workspaceSubtitle: string;

  // Welcome Card
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  askPrompt: string;
  queryPlaceholder: string;
  exampleQuery1: string;
  exampleQuery2: string;
  exampleQuery3: string;
  exampleQuery4: string;

  // Chips
  chipRepeatOffenders: string;
  chipCrimeHotspots: string;
  chipRelatedFIRs: string;
  chipDrugNetworks: string;
  chipCyberCrime: string;
  chipMissingPersons: string;
  chipVehicleTheft: string;
  chipGenerateReport: string;

  // AI Response
  analysisCompleted: string;
  foundConnections: string;
  relatedFIRs: string;
  commonLocations: string;
  associatedCrimes: string;
  confidence: string;

  // Investigation Summary
  summaryTitle: string;
  repeatOffendersFound: string;
  commonVehicles: string;
  knownAssociates: string;
  linkedMobileNumbers: string;
  travelPattern: string;
  frequentLocations: string;
  previousArrests: string;
  priority: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  viewDetails: string;

  // Explainable AI
  explainabilityTitle: string;
  confidenceScore: string;
  explainabilityScore: string;
  factorRepeatedMobile: string;
  factorSharedVehicle: string;
  factorSameIMEI: string;
  factorCCTVMatch: string;
  factorCrimeTiming: string;
  factorHistoricalConviction: string;

  // Network Preview
  networkTitle: string;
  openFullNetwork: string;
  nodeAccused: string;
  nodeVictim: string;
  nodeFIR: string;
  nodeVehicle: string;
  nodeMobile: string;
  nodeStation: string;
  nodeDistrict: string;

  // Timeline
  timelineTitle: string;
  milestoneRegistered: string;
  milestoneEvidence: string;
  milestoneSuspect: string;
  milestoneNetwork: string;
  milestoneChargesheet: string;
  milestoneActive: string;
  statusCompleted: string;
  statusInProgress: string;
  statusPending: string;

  // Recommendations
  recommendationsTitle: string;
  recSurveillance: string;
  recSurveillanceDesc: string;
  recSurveillanceAction: string;
  recVehicleInvestigate: string;
  recVehicleInvestigateDesc: string;
  recVehicleInvestigateAction: string;
  recReviewFIR: string;
  recReviewFIRDesc: string;
  recReviewFIRAction: string;
  recCoordinateCyber: string;
  recCoordinateCyberDesc: string;
  recCoordinateCyberAction: string;
  recEscalate: string;
  recEscalateDesc: string;
  recEscalateAction: string;

  // Action Bar
  generateReport: string;
  exportPDF: string;
  shareInvestigation: string;
  voiceInvestigation: string;

  // AI Status
  aiStatusOnline: string;
  aiStatusOffline: string;
  databaseSynced: string;
  databaseSyncing: string;
  lastUpdated: string;

  // Processing
  aiAnalysing: string;
  generatingReport: string;
  exportingPDF: string;

  // Errors
  errorMicrophonePermission: string;
  errorAttachmentSize: string;
  errorAttachmentType: string;
  errorNetworkOffline: string;

  // Success
  reportGenerated: string;
  pdfExported: string;
  investigationShared: string;
  actionConfirmed: string;

  // General
  submit: string;
  cancel: string;
  close: string;
  retry: string;
}

export const T: Record<Lang, InvestigationT> = {
  // ─── English ───────────────────────────────────────────────────────────────
  en: {
    // Top Bar
    workspaceTitle: "AI Investigation Workspace",
    workspaceSubtitle: "Agentic Crime Intelligence Assistant",

    // Welcome Card
    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    askPrompt: "Ask investigative questions in natural language.",
    queryPlaceholder: "Ask anything about Karnataka crime data...",
    exampleQuery1: "Find all repeat offenders linked to FIR-2024-08431",
    exampleQuery2: "Show crime hotspots in Bengaluru for the last 30 days",
    exampleQuery3: "Link all FIRs involving vehicle KA-01-AB-1234",
    exampleQuery4: "Identify suspects appearing across multiple theft cases in Tumakuru",

    // Chips
    chipRepeatOffenders: "Repeat Offenders",
    chipCrimeHotspots: "Crime Hotspots",
    chipRelatedFIRs: "Related FIRs",
    chipDrugNetworks: "Drug Networks",
    chipCyberCrime: "Cyber Crime",
    chipMissingPersons: "Missing Persons",
    chipVehicleTheft: "Vehicle Theft",
    chipGenerateReport: "Generate Report",

    // AI Response
    analysisCompleted: "Analysis completed.",
    foundConnections: "connected offenders found",
    relatedFIRs: "Related FIRs",
    commonLocations: "Common Locations",
    associatedCrimes: "Associated Crimes",
    confidence: "Confidence",

    // Investigation Summary
    summaryTitle: "Investigation Summary",
    repeatOffendersFound: "Repeat Offenders Found",
    commonVehicles: "Common Vehicles",
    knownAssociates: "Known Associates",
    linkedMobileNumbers: "Linked Mobile Numbers",
    travelPattern: "Travel Pattern",
    frequentLocations: "Frequent Locations",
    previousArrests: "Previous Arrests",
    priority: "Priority",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    viewDetails: "View Details",

    // Explainable AI
    explainabilityTitle: "Why did AI reach this conclusion?",
    confidenceScore: "Confidence Score",
    explainabilityScore: "Explainability Score",
    factorRepeatedMobile: "Repeated mobile number across FIRs",
    factorSharedVehicle: "Shared vehicle registration",
    factorSameIMEI: "Same phone IMEI detected",
    factorCCTVMatch: "Common CCTV appearance",
    factorCrimeTiming: "Similar crime timing pattern",
    factorHistoricalConviction: "Historical conviction record",

    // Network Preview
    networkTitle: "Criminal Network Preview",
    openFullNetwork: "Open Full Network Analysis",
    nodeAccused: "Accused",
    nodeVictim: "Victim",
    nodeFIR: "FIR",
    nodeVehicle: "Vehicle",
    nodeMobile: "Mobile",
    nodeStation: "Police Station",
    nodeDistrict: "District",

    // Timeline
    timelineTitle: "Investigation Timeline",
    milestoneRegistered: "FIR Registered",
    milestoneEvidence: "Evidence Uploaded",
    milestoneSuspect: "Suspect Identified",
    milestoneNetwork: "Network Linked",
    milestoneChargesheet: "Chargesheet Filed",
    milestoneActive: "Case Active",
    statusCompleted: "Completed",
    statusInProgress: "In Progress",
    statusPending: "Pending",

    // Recommendations
    recommendationsTitle: "AI Recommendations",
    recSurveillance: "Increase Surveillance",
    recSurveillanceDesc: "Increase surveillance near Electronic City due to repeat offender activity.",
    recSurveillanceAction: "Deploy Patrol",
    recVehicleInvestigate: "Investigate Vehicle",
    recVehicleInvestigateDesc: "Investigate vehicle KA-01-AB-1234 linked to multiple theft FIRs.",
    recVehicleInvestigateAction: "View Vehicle",
    recReviewFIR: "Review FIR",
    recReviewFIRDesc: "Review FIR-2023-01981 for connections to current investigation.",
    recReviewFIRAction: "Review FIR",
    recCoordinateCyber: "Coordinate Cyber Cell",
    recCoordinateCyberDesc: "Coordinate with Mysuru Cyber Cell for mobile data analysis.",
    recCoordinateCyberAction: "Contact Cell",
    recEscalate: "Escalate Investigation",
    recEscalateDesc: "Escalate investigation to senior officer due to high-priority network.",
    recEscalateAction: "Escalate",

    // Action Bar
    generateReport: "Generate Report",
    exportPDF: "Export PDF",
    shareInvestigation: "Share",
    voiceInvestigation: "Voice",

    // AI Status
    aiStatusOnline: "AI Status: Online",
    aiStatusOffline: "AI Status: Offline",
    databaseSynced: "Database Synced",
    databaseSyncing: "Database Syncing...",
    lastUpdated: "Last Updated",

    // Processing
    aiAnalysing: "AI is analysing...",
    generatingReport: "Generating report...",
    exportingPDF: "Exporting PDF...",

    // Errors
    errorMicrophonePermission: "Microphone access denied. Please enable microphone permission in settings or use text input.",
    errorAttachmentSize: "File exceeds 10 MB limit. Please select a smaller file.",
    errorAttachmentType: "Unsupported file type. Please select an image (PNG, JPG) or PDF.",
    errorNetworkOffline: "Network offline. Query will be retried when connection is restored.",

    // Success
    reportGenerated: "Investigation report generated successfully.",
    pdfExported: "PDF exported to device storage.",
    investigationShared: "Investigation shared successfully.",
    actionConfirmed: "Action confirmed.",

    // General
    submit: "Submit",
    cancel: "Cancel",
    close: "Close",
    retry: "Retry",
  },

  // ─── Kannada ───────────────────────────────────────────────────────────────
  kn: {
    // Top Bar
    workspaceTitle: "AI ತನಿಖೆ ವಿಭಾಗ",
    workspaceSubtitle: "ಏಜೆಂಟಿಕ್ ಅಪರಾಧ ಗುಪ್ತಚರ ಸಹಾಯಕ",

    // Welcome Card
    greetingMorning: "ಶುಭ ಬೆಳಿಗ್ಗೆ",
    greetingAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ",
    greetingEvening: "ಶುಭ ಸಂಜೆ",
    askPrompt: "ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ತನಿಖಾ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
    queryPlaceholder: "ಕರ್ನಾಟಕ ಅಪರಾಧ ದತ್ತಾಂಶದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...",
    exampleQuery1: "FIR-2024-08431 ಗೆ ಸಂಬಂಧಿಸಿದ ಎಲ್ಲಾ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳನ್ನು ಹುಡುಕಿ",
    exampleQuery2: "ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ ಬೆಂಗಳೂರಿನ ಅಪರಾಧ ಕೇಂದ್ರಗಳನ್ನು ತೋರಿಸಿ",
    exampleQuery3: "KA-01-AB-1234 ವಾಹನ ಒಳಗೊಂಡ ಎಲ್ಲಾ FIR ಗಳನ್ನು ಲಿಂಕ್ ಮಾಡಿ",
    exampleQuery4: "ತುಮಕೂರಿನಲ್ಲಿ ಅನೇಕ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳಲ್ಲಿ ಕಾಣಿಸಿಕೊಂಡ ಶಂಕಿತರನ್ನು ಗುರುತಿಸಿ",

    // Chips
    chipRepeatOffenders: "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು",
    chipCrimeHotspots: "ಅಪರಾಧ ಕೇಂದ್ರಗಳು",
    chipRelatedFIRs: "ಸಂಬಂಧಿತ FIR ಗಳು",
    chipDrugNetworks: "ಮಾದಕ ದ್ರವ್ಯ ಜಾಲಗಳು",
    chipCyberCrime: "ಸೈಬರ್ ಅಪರಾಧ",
    chipMissingPersons: "ನಾಪತ್ತೆ ವ್ಯಕ್ತಿಗಳು",
    chipVehicleTheft: "ವಾಹನ ಕಳ್ಳತನ",
    chipGenerateReport: "ವರದಿ ತಯಾರಿಸಿ",

    // AI Response
    analysisCompleted: "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ.",
    foundConnections: "ಸಂಬಂಧಿತ ಅಪರಾಧಿಗಳು ಕಂಡುಬಂದಿದ್ದಾರೆ",
    relatedFIRs: "ಸಂಬಂಧಿತ FIR ಗಳು",
    commonLocations: "ಸಾಮಾನ್ಯ ಸ್ಥಳಗಳು",
    associatedCrimes: "ಸಂಬಂಧಿತ ಅಪರಾಧಗಳು",
    confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ",

    // Investigation Summary
    summaryTitle: "ತನಿಖಾ ಸಾರಾಂಶ",
    repeatOffendersFound: "ಕಂಡುಬಂದ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು",
    commonVehicles: "ಸಾಮಾನ್ಯ ವಾಹನಗಳು",
    knownAssociates: "ತಿಳಿದ ಸಹಚರರು",
    linkedMobileNumbers: "ಸಂಬಂಧಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗಳು",
    travelPattern: "ಚಲನ ಮಾದರಿ",
    frequentLocations: "ಆಗಾಗ ತೆರಳುವ ಸ್ಥಳಗಳು",
    previousArrests: "ಹಿಂದಿನ ಬಂಧನಗಳು",
    priority: "ಆದ್ಯತೆ",
    priorityHigh: "ಹೆಚ್ಚು",
    priorityMedium: "ಮಧ್ಯಮ",
    priorityLow: "ಕಡಿಮೆ",
    viewDetails: "ವಿವರಗಳು ನೋಡಿ",

    // Explainable AI
    explainabilityTitle: "AI ಈ ತೀರ್ಮಾನಕ್ಕೆ ಹೇಗೆ ಬಂದಿತು?",
    confidenceScore: "ವಿಶ್ವಾಸಾರ್ಹತೆ ಅಂಕ",
    explainabilityScore: "ವ್ಯಾಖ್ಯಾನ ಅಂಕ",
    factorRepeatedMobile: "FIR ಗಳಲ್ಲಿ ಪುನರಾವರ್ತಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    factorSharedVehicle: "ಹಂಚಿಕೊಂಡ ವಾಹನ ನೋಂದಣಿ",
    factorSameIMEI: "ಒಂದೇ ಫೋನ್ IMEI ಪತ್ತೆ",
    factorCCTVMatch: "ಸಾಮಾನ್ಯ CCTV ಸೆರೆ",
    factorCrimeTiming: "ಹೋಲುವ ಅಪರಾಧ ಸಮಯ ಮಾದರಿ",
    factorHistoricalConviction: "ಐತಿಹಾಸಿಕ ಶಿಕ್ಷೆ ದಾಖಲೆ",

    // Network Preview
    networkTitle: "ಅಪರಾಧ ಜಾಲ ಪೂರ್ವವೀಕ್ಷಣೆ",
    openFullNetwork: "ಪೂರ್ಣ ಜಾಲ ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಿರಿ",
    nodeAccused: "ಆರೋಪಿ",
    nodeVictim: "ಸಂತ್ರಸ್ತ",
    nodeFIR: "FIR",
    nodeVehicle: "ವಾಹನ",
    nodeMobile: "ಮೊಬೈಲ್",
    nodeStation: "ಪೊಲೀಸ್ ಠಾಣೆ",
    nodeDistrict: "ಜಿಲ್ಲೆ",

    // Timeline
    timelineTitle: "ತನಿಖಾ ಕಾಲರೇಖೆ",
    milestoneRegistered: "FIR ನೋಂದಾಯಿಸಲಾಗಿದೆ",
    milestoneEvidence: "ಸಾಕ್ಷ್ಯ ಅಪ್‌ಲೋಡ್",
    milestoneSuspect: "ಶಂಕಿತ ಗುರುತಿಸಲಾಗಿದೆ",
    milestoneNetwork: "ಜಾಲ ಲಿಂಕ್ ಮಾಡಲಾಗಿದೆ",
    milestoneChargesheet: "ಆರೋಪಪಟ್ಟಿ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    milestoneActive: "ಪ್ರಕರಣ ಸಕ್ರಿಯ",
    statusCompleted: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    statusInProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    statusPending: "ಬಾಕಿ ಉಳಿದಿದೆ",

    // Recommendations
    recommendationsTitle: "AI ಶಿಫಾರಸುಗಳು",
    recSurveillance: "ನಿಗಾ ಹೆಚ್ಚಿಸಿ",
    recSurveillanceDesc: "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ ಚಟುವಟಿಕೆಯಿಂದ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ಬಳಿ ನಿಗಾ ಹೆಚ್ಚಿಸಿ.",
    recSurveillanceAction: "ಗಸ್ತು ಕಳುಹಿಸಿ",
    recVehicleInvestigate: "ವಾಹನ ತನಿಖೆ",
    recVehicleInvestigateDesc: "ಬಹು ಕಳ್ಳತನ FIR ಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ KA-01-AB-1234 ವಾಹನ ತನಿಖೆ ಮಾಡಿ.",
    recVehicleInvestigateAction: "ವಾಹನ ನೋಡಿ",
    recReviewFIR: "FIR ಪರಿಶೀಲಿಸಿ",
    recReviewFIRDesc: "ಪ್ರಸ್ತುತ ತನಿಖೆಗೆ ಸಂಬಂಧಗಳಿಗಾಗಿ FIR-2023-01981 ಪರಿಶೀಲಿಸಿ.",
    recReviewFIRAction: "FIR ನೋಡಿ",
    recCoordinateCyber: "ಸೈಬರ್ ಸೆಲ್ ಸಮನ್ವಯ",
    recCoordinateCyberDesc: "ಮೊಬೈಲ್ ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಮೈಸೂರು ಸೈಬರ್ ಸೆಲ್‌ನೊಂದಿಗೆ ಸಮನ್ವಯ ಮಾಡಿ.",
    recCoordinateCyberAction: "ಸೆಲ್ ಸಂಪರ್ಕಿಸಿ",
    recEscalate: "ತನಿಖೆ ಮೇಲ್ಮಟ್ಟಕ್ಕೆ",
    recEscalateDesc: "ಹೆಚ್ಚು ಆದ್ಯತೆಯ ಜಾಲದಿಂದ ಹಿರಿಯ ಅಧಿಕಾರಿಗೆ ತನಿಖೆ ಮೇಲ್ಮಟ್ಟಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
    recEscalateAction: "ಮೇಲ್ಮಟ್ಟ ಮಾಡಿ",

    // Action Bar
    generateReport: "ವರದಿ ತಯಾರಿಸಿ",
    exportPDF: "PDF ರಫ್ತು",
    shareInvestigation: "ಹಂಚಿಕೊಳ್ಳಿ",
    voiceInvestigation: "ಧ್ವನಿ",

    // AI Status
    aiStatusOnline: "AI ಸ್ಥಿತಿ: ಆನ್‌ಲೈನ್",
    aiStatusOffline: "AI ಸ್ಥಿತಿ: ಆಫ್‌ಲೈನ್",
    databaseSynced: "ಡೇಟಾಬೇಸ್ ಸಿಂಕ್ ಆಗಿದೆ",
    databaseSyncing: "ಡೇಟಾಬೇಸ್ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...",
    lastUpdated: "ಕೊನೆಯ ನವೀಕರಣ",

    // Processing
    aiAnalysing: "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    generatingReport: "ವರದಿ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...",
    exportingPDF: "PDF ರಫ್ತು ಮಾಡಲಾಗುತ್ತಿದೆ...",

    // Errors
    errorMicrophonePermission: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ ಅನುಮತಿ ಸಕ್ರಿಯಗೊಳಿಸಿ ಅಥವಾ ಪಠ್ಯ ಇನ್‌ಪುಟ್ ಬಳಸಿ.",
    errorAttachmentSize: "ಫೈಲ್ 10 MB ಮಿತಿ ಮೀರಿದೆ. ಚಿಕ್ಕ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ.",
    errorAttachmentType: "ಬೆಂಬಲಿಸದ ಫೈಲ್ ಪ್ರಕಾರ. ಚಿತ್ರ (PNG, JPG) ಅಥವಾ PDF ಆಯ್ಕೆ ಮಾಡಿ.",
    errorNetworkOffline: "ನೆಟ್‌ವರ್ಕ್ ಆಫ್‌ಲೈನ್. ಸಂಪರ್ಕ ಮರಳಿ ಬಂದಾಗ ಪ್ರಶ್ನೆ ಮರು ಪ್ರಯತ್ನಿಸಲಾಗುತ್ತದೆ.",

    // Success
    reportGenerated: "ತನಿಖಾ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ತಯಾರಾಗಿದೆ.",
    pdfExported: "PDF ಸಾಧನ ಸಂಗ್ರಹಕ್ಕೆ ರಫ್ತು ಮಾಡಲಾಗಿದೆ.",
    investigationShared: "ತನಿಖೆ ಯಶಸ್ವಿಯಾಗಿ ಹಂಚಿಕೊಳ್ಳಲಾಗಿದೆ.",
    actionConfirmed: "ಕ್ರಿಯೆ ದೃಢಪಡಿಸಲಾಗಿದೆ.",

    // General
    submit: "ಸಲ್ಲಿಸಿ",
    cancel: "ರದ್ದು",
    close: "ಮುಚ್ಚಿ",
    retry: "ಮರು ಪ್ರಯತ್ನ",
  },
};

export default T;
