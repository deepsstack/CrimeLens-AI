/**
 * screens/DashboardScreen.tsx
 * CrimeLens AI — Main Dashboard & Workspace Router
 */

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

// ── i18n & types ──────────────────────────────────────────────────────────────
import { T } from "../i18n/dashboardTranslations";
import type { Lang } from "../i18n/dashboardTranslations";
import type { Tab } from "../utils/dashboardUtils";

// ── Catalyst API & Data Utils ──────────────────────────────────────────────────
import {
  getAllFIRCases,
  getFIRByNumber,
  getAccusedByFIR,
  getAllAccused,
  getAccusedById,
  getCriminalNetwork,
  type FIRCase,
  type Accused,
} from "../services/crimelensApi";
import {
  mapFIRCaseToDisplayFIR,
  deriveKPIStats,
  deriveDistrictsFromFIRs,
  deriveCrimeCategories,
  mapFIRCaseToDetailsData,
  mapAccusedToProfileData,
} from "../utils/catalystDataUtils";

// ── Mock data ─────────────────────────────────────────────────────────────────
import mockData from "../data/mockData";

// ── Layout components ─────────────────────────────────────────────────────────
import { TopHeader } from "../components/dashboard/TopHeader";
import { BottomTabBar } from "../components/dashboard/BottomTabBar";

// ── Content components ────────────────────────────────────────────────────────
import { KPICards } from "../components/dashboard/KPICards";
import { CrimeMap } from "../components/dashboard/CrimeMap";
import { AIBrief } from "../components/dashboard/AIBrief";
import { TrendChart } from "../components/dashboard/TrendChart";
import { DistrictChart } from "../components/dashboard/DistrictChart";
import { CategoryDonut } from "../components/dashboard/CategoryDonut";
import { FIRSection } from "../components/dashboard/FIRSection";
import { IntelFeed } from "../components/dashboard/IntelFeed";
import { QuickTools } from "../components/dashboard/QuickTools";
import { AIPanel } from "../components/dashboard/AIPanel";

// ── Additional Screens ────────────────────────────────────────────────────────
import { AnalyticsScreen } from "./AnalyticsScreen";
import { NetworkScreen } from "./NetworkScreen";
import { HotspotScreen } from "./HotspotScreen";
import { ReportsScreen } from "./ReportsScreen";
import { AdminScreen } from "./AdminScreen";

// ── Modals ────────────────────────────────────────────────────────────────────
import { ExplainWhyModal, type ExplainWhyData } from "../components/modals/ExplainWhyModal";
import { FIRDetailsModal, type FIRDetailsData } from "../components/modals/FIRDetailsModal";
import { AccusedProfileModal, type AccusedProfileData } from "../components/modals/AccusedProfileModal";
import { AlertCenterModal } from "../components/modals/AlertCenterModal";
import { GlobalSearchModal } from "../components/modals/GlobalSearchModal";
import { ProfileSettingsModal } from "../components/modals/ProfileSettingsModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "investigator"
  | "analyst"
  | "senior_officer"
  | "administrator";

export type AuthenticatedUser = {
  username: string;
  role: UserRole;
};

export type DashboardProps = {
  lang: Lang;
  setLang: (l: Lang) => void;
  setScreen: (screen: "splash" | "onboarding" | "login" | "dashboard" | "investigation") => void;
  currentUser: AuthenticatedUser;
};

// ─── DashboardScreen Component ────────────────────────────────────────────────

export function DashboardScreen({ lang, setLang, setScreen, currentUser }: DashboardProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Custom view state (hotspot, admin)
  const [subView, setSubView] = useState<"none" | "hotspot" | "admin">("none");

  // Search state
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [explainWhyVisible, setExplainWhyVisible] = useState(false);
  const [explainWhyData, setExplainWhyData] = useState<ExplainWhyData | null>(null);

  const [firDetailsVisible, setFirDetailsVisible] = useState(false);
  const [selectedFIRData, setSelectedFIRData] = useState<FIRDetailsData | null>(null);

  const [accusedProfileVisible, setAccusedProfileVisible] = useState(false);
  const [selectedAccusedData, setSelectedAccusedData] = useState<AccusedProfileData | null>(null);

  const [alertCenterVisible, setAlertCenterVisible] = useState(false);
  const [globalSearchVisible, setGlobalSearchVisible] = useState(false);
  const [profileSettingsVisible, setProfileSettingsVisible] = useState(false);

  // ── Catalyst Real Data State ───────────────────────────────────────────────
  const [catalystFIRCases, setCatalystFIRCases] = useState<FIRCase[]>([]);
  const [catalystAccused, setCatalystAccused] = useState<Accused[]>([]);
  const [loadingCatalyst, setLoadingCatalyst] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function loadCatalystData() {
      try {
        const [firsRes, accusedRes] = await Promise.all([
          getAllFIRCases().catch(() => null),
          getAllAccused().catch(() => null),
        ]);
        if (mounted) {
          if (firsRes?.success && firsRes.data) {
            setCatalystFIRCases(firsRes.data);
          }
          if (accusedRes?.success && accusedRes.data) {
            setCatalystAccused(accusedRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to load Catalyst dashboard data:", err);
      } finally {
        if (mounted) setLoadingCatalyst(false);
      }
    }
    loadCatalystData();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived statistics from Catalyst FIR cases
  const displayFIRs = catalystFIRCases.map(mapFIRCaseToDisplayFIR);
  const kpiStats = deriveKPIStats(catalystFIRCases);
  const derivedDistricts = deriveDistrictsFromFIRs(catalystFIRCases);
  const derivedCategories = deriveCrimeCategories(catalystFIRCases);

  const alertCount = mockData.intelFeed.length;

  // ── Helper Handlers ────────────────────────────────────────────────────────
  const openExplainWhy = (data?: any) => {
    if (data && typeof data === "object") {
      setExplainWhyData(data);
    } else {
      setExplainWhyData({
        title: "WHY THIS PATTERN / INSIGHT WAS IDENTIFIED",
        queryOrContext: typeof data === "string" ? data : "Crime Pattern Analysis",
        confidenceScore: 91,
        sharedFIRs: ["FIR-2024-08431", "FIR-2023-01981", "FIR-2022-00411"],
        commonVehicle: "KA-01-AB-1234",
        commonLocations: ["Bengaluru City Market", "Electronic City Phase 1"],
        explanationText: "Structural correlation algorithms matched historical incident records, time windows (20:00–02:00 HRS), and recurring accused associations across Karnataka State Police database.",
      });
    }
    setExplainWhyVisible(true);
  };

  const openFIRDetails = async (firNumber: string) => {
    // Attempt to fetch live FIR case & linked accused from Catalyst first
    try {
      const [firRes, accusedRes] = await Promise.all([
        getFIRByNumber(firNumber).catch(() => null),
        getAccusedByFIR(firNumber).catch(() => null),
      ]);

      if (firRes?.success && firRes.data) {
        const detailsData = mapFIRCaseToDetailsData(
          firRes.data,
          accusedRes?.success ? accusedRes.data : undefined
        );
        setSelectedFIRData(detailsData);
        setFirDetailsVisible(true);
        return;
      }
    } catch {
      // Fallback below
    }

    // Fallback if not found in Catalyst endpoint
    const found = mockData.firs.find((f) => f.number === firNumber);
    const firData: FIRDetailsData = {
      number: firNumber,
      crimeType: found ? found.crimeType : "Vehicle Theft",
      crimeHead: "IPC Sec 379",
      district: found ? found.district : "Bengaluru South",
      policeStation: "Electronic City PS",
      incidentDate: "18 Jul 2024",
      incidentTime: "23:15 HRS",
      status: found ? (found.status as any) : "Under Investigation",
      priority: found ? (found.priority as any) : "High",
      officerAssigned: found ? found.officerAssigned : "Insp. V. Kumar",
      summary: "Incident reported involving illegal entry and motor vehicle theft.",
      accused: ["Ravi S. (Primary)", "Suresh K. (Associate)"],
      victims: ["Anand R."],
      complainant: "Meena S.",
      legalSections: ["IPC Sec 379", "IPC Sec 411"],
      locationName: "Electronic City Phase 1",
      gpsCoords: "12.8399° N, 77.6770° E",
      relatedFIRs: [],
      aiInsightText: "Catalyst intelligence record matched.",
      aiConfidence: 90,
    };
    setSelectedFIRData(firData);
    setFirDetailsVisible(true);
  };

  const openAccusedProfile = async (accusedName: string) => {
    // Attempt to find accused in loaded catalystAccused or fetch directly
    const target = catalystAccused.find(
      (a) => a.FULL_NAME.toLowerCase().includes((accusedName || "").toLowerCase()) ||
             (a.ALIAS_NAME && a.ALIAS_NAME.toLowerCase().includes((accusedName || "").toLowerCase()))
    );

    if (target) {
      try {
        const networkRes = await getCriminalNetwork(target.ACCUSED_ID).catch(() => null);
        const profile = mapAccusedToProfileData(
          target,
          networkRes?.success ? networkRes : undefined
        );
        setSelectedAccusedData(profile);
        setAccusedProfileVisible(true);
        return;
      } catch {
        // Fallback
      }
    }

    // Fallback if not matched in Catalyst
    const profData: AccusedProfileData = {
      id: "ACC-8921",
      name: accusedName || "Ravi S.",
      aliases: ["Bullet Ravi"],
      riskLevel: "HIGH",
      status: "Under Police Surveillance",
      age: 34,
      gender: "Male",
      district: "Bengaluru City",
      previousFIRCount: 6,
      crimeCategories: ["Vehicle Theft", "Burglary"],
      associates: [
        { name: "Suresh K.", role: "Primary Co-Accused", risk: "HIGH" },
      ],
      vehicles: ["KA-01-AB-1234 (Black Pulsar)"],
      phoneNumbers: ["+91 98450-97842"],
      frequentLocations: ["Bengaluru City Market", "Electronic City Phase 1"],
      crimeHistory: [
        { firNumber: "FIR-2024-08431", crimeType: "Vehicle Theft", date: "18 Jul 2024", status: "Under Investigation" },
      ],
      aiBehavioralPattern: {
        text: "Subject activity frequently overlaps with late-evening vehicle theft incidents.",
        confidence: 92,
        supportingCasesCount: 6,
        locationsCount: 3,
      },
    };
    setSelectedAccusedData(profData);
    setAccusedProfileVisible(true);
  };

  const handleOpenAIWorkspace = (query?: string) => {
    setScreen("investigation");
  };

  const openHotspotScreen = (districtName?: string) => {
    setSubView("hotspot");
  };

  // #28 — RBAC helpers
  const isAdministrator = currentUser.role === "administrator";

  const handleOpenAdmin = () => {
    if (!isAdministrator) return;
    setSubView("admin");
  };

  // ── Render Active Screen Content ───────────────────────────────────────────
  function renderMainContent() {
    if (subView === "hotspot") {
      return (
        <HotspotScreen
          lang={lang}
          onOpenExplainWhy={openExplainWhy}
          onOpenFIR={openFIRDetails}
          onOpenAIWorkspace={handleOpenAIWorkspace}
        />
      );
    }

    if (subView === "admin") {
      if (!isAdministrator) {
        return null;
      }
      return <AdminScreen lang={lang} onBack={() => setSubView("none")} />;
    }

    if (activeTab === "home") {
      return (
        <>
          <KPICards lang={lang} kpiStats={kpiStats} />
          <CrimeMap lang={lang} districtsData={derivedDistricts} />
          <AIBrief lang={lang} />
          <TrendChart lang={lang} />
          <DistrictChart lang={lang} districtsData={derivedDistricts} />
          <CategoryDonut lang={lang} categoriesData={derivedCategories} />
          <FIRSection lang={lang} firsData={displayFIRs} loading={loadingCatalyst} />
          <IntelFeed lang={lang} />
          <QuickTools lang={lang} />
          <AIPanel lang={lang} />
        </>
      );
    }

    if (activeTab === "analytics") {
      return (
        <AnalyticsScreen
          lang={lang}
          onOpenExplainWhy={openExplainWhy}
          onOpenAccusedProfile={openAccusedProfile}
          onOpenNetwork={(t) => {
            setActiveTab("network");
          }}
          onOpenAIWorkspace={handleOpenAIWorkspace}
          onOpenHotspot={openHotspotScreen}
        />
      );
    }

    if (activeTab === "network") {
      return (
        <NetworkScreen
          lang={lang}
          onOpenExplainWhy={openExplainWhy}
          onOpenAccusedProfile={openAccusedProfile}
          onOpenFIR={openFIRDetails}
          onOpenAIWorkspace={handleOpenAIWorkspace}
        />
      );
    }

    if (activeTab === "reports") {
      return (
        <ReportsScreen
          lang={lang}
          onOpenFIR={openFIRDetails}
          onOpenNetwork={(t) => setActiveTab("network")}
          onOpenAIWorkspace={handleOpenAIWorkspace}
        />
      );
    }

    return null;
  }

  return (
    <View style={styles.container}>
      {/* Sticky Top Header */}
      <TopHeader
        lang={lang}
        setLang={setLang}
        alertCount={alertCount}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        onSearchChange={setSearchQuery}
        onBellPress={() => setAlertCenterVisible(true)}
        onProfilePress={() => setProfileSettingsVisible(true)}
        onSearchPress={() => setGlobalSearchVisible(true)}
      />

      {/* Main Body ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderMainContent()}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={(tab) => {
          setSubView("none");
          setActiveTab(tab);
        }}
        lang={lang}
        onCopilotPress={() => setScreen("investigation")}
      />

      {/* Global Modals */}
      <ExplainWhyModal
        visible={explainWhyVisible}
        onClose={() => setExplainWhyVisible(false)}
        data={explainWhyData}
        onOpenFIR={openFIRDetails}
        onOpenAIWorkspace={handleOpenAIWorkspace}
      />

      <FIRDetailsModal
        visible={firDetailsVisible}
        onClose={() => setFirDetailsVisible(false)}
        firData={selectedFIRData}
        onInvestigateAI={handleOpenAIWorkspace}
        onOpenNetwork={(fir) => {
          setFirDetailsVisible(false);
          setActiveTab("network");
        }}
        onGenerateReport={(fir) => {
          setFirDetailsVisible(false);
          setActiveTab("reports");
        }}
        onOpenExplainWhy={openExplainWhy}
        onOpenAccusedProfile={openAccusedProfile}
      />

      <AccusedProfileModal
        visible={accusedProfileVisible}
        onClose={() => setAccusedProfileVisible(false)}
        profileData={selectedAccusedData}
        onInvestigateAI={handleOpenAIWorkspace}
        onOpenNetwork={(id) => {
          setAccusedProfileVisible(false);
          setActiveTab("network");
        }}
        onOpenFIR={openFIRDetails}
        onGenerateReport={(name) => {
          setAccusedProfileVisible(false);
          setActiveTab("reports");
        }}
      />

      <AlertCenterModal
        visible={alertCenterVisible}
        onClose={() => setAlertCenterVisible(false)}
        onOpenFIR={openFIRDetails}
        onOpenAIWorkspace={handleOpenAIWorkspace}
        onOpenHotspot={openHotspotScreen}
      />

      <GlobalSearchModal
        visible={globalSearchVisible}
        lang={lang}
        onClose={() => setGlobalSearchVisible(false)}
        initialQuery={searchQuery}
        onOpenFIR={openFIRDetails}
        onOpenAccusedProfile={openAccusedProfile}
        onOpenNetwork={(target) => {
          setGlobalSearchVisible(false);
          setActiveTab("network");
        }}
        onOpenAIWorkspace={handleOpenAIWorkspace}
      />

      <ProfileSettingsModal
        visible={profileSettingsVisible}
        onClose={() => setProfileSettingsVisible(false)}
        lang={lang}
        setLang={setLang}
        onLogout={() => {
          setProfileSettingsVisible(false);
          setScreen("login");
        }}
        onOpenAdmin={() => {
          setProfileSettingsVisible(false);
          handleOpenAdmin();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
});
