// data/mockData.ts — CrimeLens AI Dashboard mock data (Karnataka, India)

export type DensityTier = "low" | "medium" | "high";
export type Priority    = "High" | "Medium" | "Low";
export type Severity    = "Critical" | "High" | "Medium";
export type FIRStatus   = "Open" | "Under Investigation" | "Closed" | "Escalated";

export interface KPICard {
  id: string;
  titleKey: string;
  value: string;
  trend: number;
  trendSemantic: "good" | "bad";
  comparisonLabel: string;
  icon: string;
}

export interface District {
  id: string;
  name: string;
  nameKn: string;
  crimeCount: number;
  density: DensityTier;
  topCategory: string;
  x: number;
  y: number;
  gridCol: number;
  gridRow: number;
}

export interface TrendPoint {
  label: string;
  theft: number;
  assault: number;
  cyber: number;
  drug: number;
}

export interface TrendData {
  weekly: TrendPoint[];
  monthly: TrendPoint[];
  yearly: TrendPoint[];
}

export interface AIRecommendation {
  icon: string;
  titleKey: string;
  descKey: string;
}

export interface AIBrief {
  greetingKey: string;
  summaryKey: string;
  recommendations: AIRecommendation[];
}

export interface FIR {
  id: string;
  number: string;
  crimeType: string;
  crimeTypeKn: string;
  district: string;
  districtKn: string;
  timeElapsed: string;
  status: FIRStatus;
  priority: Priority;
  officerAssigned: string;
}

export interface IntelAlert {
  id: string;
  typeKey: string;
  severity: Severity;
  descKey: string;
  district: string;
  districtKn: string;
  timestamp: string;
}

export interface QuickTool {
  id: string;
  labelKey: string;
  descKey: string;
  icon: string;
  toastKey: string;
}

export interface AIPanelData {
  confidenceScore: number;
  recommendationKey: string;
  lastUpdateLabel: string;
  signals: Array<{ labelKey: string; percent: number; color: string }>;
}

export interface MockData {
  officerName: string;
  officerRole: string;
  officerBadge: string;
  kpiCards: KPICard[];
  districts: District[];
  trendData: TrendData;
  aiBrief: AIBrief;
  firs: FIR[];
  intelFeed: IntelAlert[];
  quickTools: QuickTool[];
  aiPanel: AIPanelData;
  crimeCategories: Array<{ nameKey: string; count: number; color: string }>;
}

const mockData: MockData = {
  officerName: "Rajesh Kumar",
  officerRole: "Senior Inspector",
  officerBadge: "KSP-2847",

  kpiCards: [
    {
      id: "kpi1",
      titleKey: "kpiTotalFIRs",
      value: "1,247",
      trend: 8.3,
      trendSemantic: "bad",
      comparisonLabel: "vs last week",
      icon: "FileText",
    },
    {
      id: "kpi2",
      titleKey: "kpiActiveInvestigations",
      value: "384",
      trend: 3.1,
      trendSemantic: "bad",
      comparisonLabel: "vs last week",
      icon: "Search",
    },
    {
      id: "kpi3",
      titleKey: "kpiHighPriority",
      value: "67",
      trend: 12.5,
      trendSemantic: "bad",
      comparisonLabel: "vs last week",
      icon: "AlertTriangle",
    },
    {
      id: "kpi4",
      titleKey: "kpiCrimeAlerts",
      value: "23",
      trend: -5.2,
      trendSemantic: "good",
      comparisonLabel: "vs yesterday",
      icon: "Bell",
    },
    {
      id: "kpi5",
      titleKey: "kpiPredictedHotspots",
      value: "9",
      trend: 2.0,
      trendSemantic: "bad",
      comparisonLabel: "vs last week",
      icon: "MapPin",
    },
    {
      id: "kpi6",
      titleKey: "kpiTimeSaved",
      value: "18.4h",
      trend: 22.0,
      trendSemantic: "good",
      comparisonLabel: "vs last week",
      icon: "Zap",
    },
  ],

  // 12 Karnataka districts in a 4×3 grid layout for SVG map
  districts: [
    { id: "blr",  name: "Bengaluru",   nameKn: "ಬೆಂಗಳೂರು",  crimeCount: 4821, density: "high",   topCategory: "Theft",         x: 155, y: 200, gridCol: 2, gridRow: 2 },
    { id: "mys",  name: "Mysuru",      nameKn: "ಮೈಸೂರು",    crimeCount: 2134, density: "high",   topCategory: "Assault",       x: 95,  y: 240, gridCol: 1, gridRow: 3 },
    { id: "mng",  name: "Mangaluru",   nameKn: "ಮಂಗಳೂರು",   crimeCount: 1456, density: "medium", topCategory: "Drug Offence",  x: 40,  y: 210, gridCol: 0, gridRow: 2 },
    { id: "hub",  name: "Hubballi",    nameKn: "ಹುಬ್ಬಳ್ಳಿ",   crimeCount: 1823, density: "high",   topCategory: "Theft",         x: 95,  y: 110, gridCol: 1, gridRow: 1 },
    { id: "blg",  name: "Belagavi",    nameKn: "ಬೆಳಗಾವಿ",   crimeCount: 1342, density: "medium", topCategory: "Assault",       x: 40,  y: 80,  gridCol: 0, gridRow: 0 },
    { id: "klb",  name: "Kalaburagi",  nameKn: "ಕಲಬುರಗಿ",   crimeCount: 1654, density: "medium", topCategory: "Cyber Crime",   x: 215, y: 100, gridCol: 3, gridRow: 1 },
    { id: "tum",  name: "Tumakuru",    nameKn: "ತುಮಕೂರು",   crimeCount: 987,  density: "low",    topCategory: "Theft",         x: 155, y: 160, gridCol: 2, gridRow: 1 },
    { id: "shv",  name: "Shivamogga",  nameKn: "ಶಿವಮೊಗ್ಗ",  crimeCount: 876,  density: "low",    topCategory: "Drug Offence",  x: 95,  y: 160, gridCol: 1, gridRow: 2 },
    { id: "dwd",  name: "Davanagere",  nameKn: "ದಾವಣಗೆರೆ",  crimeCount: 1123, density: "medium", topCategory: "Assault",       x: 155, y: 110, gridCol: 2, gridRow: 0 },
    { id: "bdr",  name: "Bidar",       nameKn: "ಬೀದರ್",     crimeCount: 743,  density: "low",    topCategory: "Theft",         x: 215, y: 55,  gridCol: 3, gridRow: 0 },
    { id: "rai",  name: "Raichur",     nameKn: "ರಾಯಚೂರು",   crimeCount: 1089, density: "medium", topCategory: "Drug Offence",  x: 215, y: 150, gridCol: 3, gridRow: 2 },
    { id: "hss",  name: "Hassan",      nameKn: "ಹಾಸನ",      crimeCount: 654,  density: "low",    topCategory: "Theft",         x: 40,  y: 160, gridCol: 0, gridRow: 1 },
  ],

  trendData: {
    weekly: [
      { label: "Mon", theft: 42, assault: 18, cyber: 11, drug: 8 },
      { label: "Tue", theft: 38, assault: 22, cyber: 14, drug: 10 },
      { label: "Wed", theft: 51, assault: 15, cyber: 9,  drug: 7  },
      { label: "Thu", theft: 44, assault: 20, cyber: 16, drug: 12 },
      { label: "Fri", theft: 60, assault: 28, cyber: 21, drug: 15 },
      { label: "Sat", theft: 72, assault: 35, cyber: 18, drug: 19 },
      { label: "Sun", theft: 55, assault: 24, cyber: 13, drug: 11 },
    ],
    monthly: [
      { label: "Wk 1", theft: 280, assault: 110, cyber: 80,  drug: 55  },
      { label: "Wk 2", theft: 320, assault: 130, cyber: 95,  drug: 68  },
      { label: "Wk 3", theft: 295, assault: 118, cyber: 102, drug: 72  },
      { label: "Wk 4", theft: 350, assault: 145, cyber: 88,  drug: 80  },
    ],
    yearly: [
      { label: "Jan", theft: 1100, assault: 480, cyber: 320, drug: 240 },
      { label: "Feb", theft: 980,  assault: 420, cyber: 290, drug: 210 },
      { label: "Mar", theft: 1250, assault: 550, cyber: 380, drug: 280 },
      { label: "Apr", theft: 1180, assault: 510, cyber: 350, drug: 265 },
      { label: "May", theft: 1320, assault: 580, cyber: 410, drug: 300 },
      { label: "Jun", theft: 1450, assault: 620, cyber: 440, drug: 330 },
      { label: "Jul", theft: 1380, assault: 600, cyber: 420, drug: 310 },
      { label: "Aug", theft: 1290, assault: 560, cyber: 390, drug: 290 },
      { label: "Sep", theft: 1150, assault: 500, cyber: 360, drug: 270 },
      { label: "Oct", theft: 1420, assault: 610, cyber: 430, drug: 320 },
      { label: "Nov", theft: 1360, assault: 590, cyber: 400, drug: 305 },
      { label: "Dec", theft: 1480, assault: 640, cyber: 455, drug: 340 },
    ],
  },

  aiBrief: {
    greetingKey: "aiBriefGreeting",
    summaryKey: "aiBriefSummary",
    recommendations: [
      { icon: "MapPin",       titleKey: "aiBriefRec1Title", descKey: "aiBriefRec1Desc" },
      { icon: "AlertTriangle",titleKey: "aiBriefRec2Title", descKey: "aiBriefRec2Desc" },
      { icon: "Users",        titleKey: "aiBriefRec3Title", descKey: "aiBriefRec3Desc" },
      { icon: "Zap",          titleKey: "aiBriefRec4Title", descKey: "aiBriefRec4Desc" },
    ],
  },

  firs: [
    { id: "f1",  number: "FIR-2024-08431", crimeType: "Theft",           crimeTypeKn: "ಕಳ್ಳತನ",          district: "Bengaluru",  districtKn: "ಬೆಂಗಳೂರು", timeElapsed: "2h 15m ago",  status: "Open",                  priority: "High",   officerAssigned: "SI Ramesh K." },
    { id: "f2",  number: "FIR-2024-08432", crimeType: "Cyber Crime",     crimeTypeKn: "ಸೈಬರ್ ಅಪರಾಧ",     district: "Mysuru",     districtKn: "ಮೈಸೂರು",   timeElapsed: "4h 30m ago",  status: "Under Investigation",   priority: "High",   officerAssigned: "SI Priya M."  },
    { id: "f3",  number: "FIR-2024-08429", crimeType: "Assault",         crimeTypeKn: "ಹಲ್ಲೆ",            district: "Hubballi",   districtKn: "ಹುಬ್ಬಳ್ಳಿ",  timeElapsed: "6h 10m ago",  status: "Open",                  priority: "Medium", officerAssigned: "SI Anand B."  },
    { id: "f4",  number: "FIR-2024-08425", crimeType: "Drug Offence",    crimeTypeKn: "ಮಾದಕ ದ್ರವ್ಯ",     district: "Mangaluru",  districtKn: "ಮಂಗಳೂರು",  timeElapsed: "10h ago",     status: "Escalated",             priority: "High",   officerAssigned: "CI Suresh T." },
    { id: "f5",  number: "FIR-2024-08421", crimeType: "Fraud",           crimeTypeKn: "ವಂಚನೆ",           district: "Belagavi",   districtKn: "ಬೆಳಗಾವಿ",  timeElapsed: "14h ago",     status: "Under Investigation",   priority: "Medium", officerAssigned: "SI Kavya R."  },
    { id: "f6",  number: "FIR-2024-08418", crimeType: "Robbery",         crimeTypeKn: "ದರೋಡೆ",           district: "Kalaburagi", districtKn: "ಕಲಬುರಗಿ",  timeElapsed: "18h ago",     status: "Open",                  priority: "High",   officerAssigned: "SI Mohan D."  },
    { id: "f7",  number: "FIR-2024-08415", crimeType: "Missing Person",  crimeTypeKn: "ನಾಪತ್ತೆ ವ್ಯಕ್ತಿ",   district: "Tumakuru",   districtKn: "ತುಮಕೂರು",  timeElapsed: "22h ago",     status: "Open",                  priority: "Medium", officerAssigned: "SI Rekha S."  },
    { id: "f8",  number: "FIR-2024-08410", crimeType: "Extortion",       crimeTypeKn: "ಸುಲಿಗೆ",          district: "Shivamogga", districtKn: "ಶಿವಮೊಗ್ಗ", timeElapsed: "1d ago",      status: "Closed",                priority: "Low",    officerAssigned: "SI Ajay N."   },
    { id: "f9",  number: "FIR-2024-08407", crimeType: "Theft",           crimeTypeKn: "ಕಳ್ಳತನ",          district: "Davanagere", districtKn: "ದಾವಣಗೆರೆ", timeElapsed: "1d 4h ago",   status: "Closed",                priority: "Low",    officerAssigned: "SI Leela P."  },
    { id: "f10", number: "FIR-2024-08403", crimeType: "Cyber Crime",     crimeTypeKn: "ಸೈಬರ್ ಅಪರಾಧ",     district: "Bengaluru",  districtKn: "ಬೆಂಗಳೂರು", timeElapsed: "1d 8h ago",   status: "Under Investigation",   priority: "Medium", officerAssigned: "SI Deepa K."  },
    { id: "f11", number: "FIR-2024-08399", crimeType: "Assault",         crimeTypeKn: "ಹಲ್ಲೆ",            district: "Raichur",    districtKn: "ರಾಯಚೂರು",  timeElapsed: "2d ago",      status: "Open",                  priority: "High",   officerAssigned: "SI Ravi G."   },
  ],

  intelFeed: [
    { id: "i1", typeKey: "intelRepeatOffender",  severity: "Critical", descKey: "intelDesc1", district: "Bengaluru",  districtKn: "ಬೆಂಗಳೂರು", timestamp: "10 min ago"  },
    { id: "i2", typeKey: "intelCrimeSpike",       severity: "Critical", descKey: "intelDesc2", district: "Mysuru",     districtKn: "ಮೈಸೂರು",   timestamp: "25 min ago"  },
    { id: "i3", typeKey: "intelMissingPerson",    severity: "High",     descKey: "intelDesc3", district: "Hubballi",   districtKn: "ಹುಬ್ಬಳ್ಳಿ",  timestamp: "1h ago"      },
    { id: "i4", typeKey: "intelHighRiskZone",     severity: "High",     descKey: "intelDesc4", district: "Mangaluru",  districtKn: "ಮಂಗಳೂರು",  timestamp: "2h ago"      },
    { id: "i5", typeKey: "intelCrimeSpike",       severity: "Medium",   descKey: "intelDesc5", district: "Kalaburagi", districtKn: "ಕಲಬುರಗಿ",  timestamp: "3h ago"      },
    { id: "i6", typeKey: "intelRepeatOffender",   severity: "High",     descKey: "intelDesc6", district: "Belagavi",   districtKn: "ಬೆಳಗಾವಿ",  timestamp: "4h ago"      },
    { id: "i7", typeKey: "intelHighRiskZone",     severity: "Medium",   descKey: "intelDesc7", district: "Raichur",    districtKn: "ರಾಯಚೂರು",  timestamp: "5h ago"      },
  ],

  quickTools: [
    { id: "qt1", labelKey: "qtSearchFIR",       descKey: "qtSearchFIRDesc",       icon: "FileSearch",  toastKey: "toastSearchFIR"       },
    { id: "qt2", labelKey: "qtSearchAccused",   descKey: "qtSearchAccusedDesc",   icon: "UserSearch",  toastKey: "toastSearchAccused"   },
    { id: "qt3", labelKey: "qtGenerateReport",  descKey: "qtGenerateReportDesc",  icon: "FileOutput",  toastKey: "toastGenerateReport"  },
    { id: "qt4", labelKey: "qtCrimePrediction", descKey: "qtCrimePredictionDesc", icon: "Brain",       toastKey: "toastCrimePrediction" },
    { id: "qt5", labelKey: "qtNetworkAnalysis", descKey: "qtNetworkAnalysisDesc", icon: "Network",     toastKey: "toastNetworkAnalysis" },
    { id: "qt6", labelKey: "qtVoiceInvest",     descKey: "qtVoiceInvestDesc",     icon: "Mic",         toastKey: "toastVoiceInvest"     },
  ],

  aiPanel: {
    confidenceScore: 87,
    recommendationKey: "aiPanelRec",
    lastUpdateLabel: "Today, 06:30 AM",
    signals: [
      { labelKey: "signalHistorical", percent: 40, color: "#0F4C81" },
      { labelKey: "signalWeather",    percent: 15, color: "#10B981" },
      { labelKey: "signalEventCal",   percent: 45, color: "#F59E0B" },
    ],
  },

  crimeCategories: [
    { nameKey: "catTheft",      count: 3210, color: "#0F4C81" },
    { nameKey: "catAssault",    count: 1854, color: "#EF4444" },
    { nameKey: "catCyber",      count: 1423, color: "#06B6D4" },
    { nameKey: "catDrug",       count: 1102, color: "#F59E0B" },
    { nameKey: "catFraud",      count: 876,  color: "#8B5CF6" },
    { nameKey: "catRobbery",    count: 542,  color: "#10B981" },
  ],
};

export default mockData;
