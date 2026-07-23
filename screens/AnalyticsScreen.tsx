import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  Brain,
  AlertTriangle,
  User,
  Network,
  FileText,
  ChevronRight,
  Shield,
  Clock,
  Layers,
  MapPin,
  HelpCircle,
} from "lucide-react-native";
import Svg, { Path, Circle, Rect, Line, Text as SvgText } from "react-native-svg";
import {
  getAllFIRCases,
  getAllAccused,
  type FIRCase,
  type Accused,
} from "../services/crimelensApi";

export type AnalyticsScreenProps = {
  lang?: "en" | "kn";
  onOpenExplainWhy?: (data: any) => void;
  onOpenAccusedProfile?: (name: string) => void;
  onOpenNetwork?: (target: string) => void;
  onOpenAIWorkspace?: (query?: string) => void;
  onOpenHotspot?: (district: string) => void;
};

export function AnalyticsScreen({
  lang = "en",
  onOpenExplainWhy,
  onOpenAccusedProfile,
  onOpenNetwork,
  onOpenAIWorkspace,
  onOpenHotspot,
}: AnalyticsScreenProps) {
  // Filter States
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPriority, setSelectedPriority] = useState("All");

  // Time tab for Trend Chart
  const [trendTab, setTrendTab] = useState<"Weekly" | "Monthly" | "Quarterly" | "Yearly">("Monthly");

  // Selected Category filter for Trend Chart
  const [activeTrendCategory, setActiveTrendCategory] = useState<string>("Theft");

  const [loadingData, setLoadingData] = useState(false);
  const [catalystFIRCases, setCatalystFIRCases] = useState<FIRCase[]>([]);
  const [catalystAccusedList, setCatalystAccusedList] = useState<Accused[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadAnalyticsData() {
      setLoadingData(true);
      try {
        const [firsRes, accusedRes] = await Promise.all([
          getAllFIRCases().catch(() => null),
          getAllAccused().catch(() => null),
        ]);
        if (mounted) {
          if (firsRes?.success && firsRes.data) setCatalystFIRCases(firsRes.data);
          if (accusedRes?.success && accusedRes.data) setCatalystAccusedList(accusedRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics data from Catalyst:", err);
      } finally {
        if (mounted) setLoadingData(false);
      }
    }
    loadAnalyticsData();
    return () => {
      mounted = false;
    };
  }, []);

  const resetFilters = () => {
    setSelectedDateRange("Last 30 Days");
    setSelectedDistrict("All Districts");
    setSelectedCategory("All Categories");
    setSelectedPriority("All");
  };

  const totalCrimesVal = catalystFIRCases.length > 0 ? catalystFIRCases.length.toLocaleString() : "14,820";

  // KPI Data
  const kpis = [
    { title: "Total Crimes", value: totalCrimesVal, trend: "+4.2%", isBad: true, sub: "vs previous period" },
    { title: "Crime Growth Rate", value: "-2.8%", trend: "Good", isBad: false, sub: "quarterly deceleration" },
    { title: "Cases Solved", value: "11,410", trend: "77.0%", isBad: false, sub: "chargesheet clearance" },
    { title: "Repeat Offenders", value: catalystAccusedList.length > 0 ? String(catalystAccusedList.length) : "342", trend: "38 Active", isBad: true, sub: "under surveillance" },
    { title: "Highest Risk District", value: "Blr South", trend: "Critical", isBad: true, sub: "Electronic City & Market" },
    { title: "Emerging Patterns", value: "3 Clusters", trend: "91% Conf", isBad: true, sub: "AI pattern detected" },
  ];

  // District Comparison Data
  const districtData = [
    { name: "Bengaluru", count: 4821, percent: 100, risk: "CRITICAL" },
    { name: "Mysuru", count: 2134, percent: 44, risk: "HIGH" },
    { name: "Hubballi", count: 1823, percent: 38, risk: "HIGH" },
    { name: "Kalaburagi", count: 1654, percent: 34, risk: "MEDIUM" },
    { name: "Mangaluru", count: 1456, percent: 30, risk: "MEDIUM" },
    { name: "Belagavi", count: 1342, percent: 28, risk: "MEDIUM" },
    { name: "Davanagere", count: 1123, percent: 23, risk: "LOW" },
    { name: "Raichur", count: 1089, percent: 22, risk: "LOW" },
    { name: "Tumakuru", count: 987, percent: 20, risk: "LOW" },
    { name: "Shivamogga", count: 876, percent: 18, risk: "LOW" },
  ];

  // Category Distribution
  const categories = [
    { name: "Theft", percent: 32, count: "4,742", color: "#0F4C81" },
    { name: "Cyber Crime", percent: 24, count: "3,556", color: "#06B6D4" },
    { name: "Fraud", percent: 18, count: "2,667", color: "#8B5CF6" },
    { name: "Assault", percent: 14, count: "2,074", color: "#EF4444" },
    { name: "Drug Offence", percent: 8, count: "1,185", color: "#F59E0B" },
    { name: "Robbery", percent: 4, count: "596", color: "#10B981" },
  ];

  // Offender List (built from Catalyst accused list if available)
  const repeatOffenders = catalystAccusedList.length > 0
    ? catalystAccusedList.slice(0, 6).map((a) => ({
        name: a.FULL_NAME,
        firs: (a.KNOWN_ASSOCIATES ? a.KNOWN_ASSOCIATES.split(",").length : 1) + 2,
        crime: a.CRIMINAL_HISTORY ? String(a.CRIMINAL_HISTORY).split(".")[0] : "Repeat Offences",
        districts: a.DISTRICT || "Bengaluru",
        last: a.LAST_KNOWN_LOCATION || "Active",
        risk: a.RISK_LEVEL === "HIGH" ? "HIGH" : "MEDIUM",
      }))
    : [
        { name: "Ravi S.", firs: 6, crime: "Vehicle Theft", districts: "Bengaluru, Tumakuru", last: "2 days ago", risk: "HIGH" },
        { name: "Mohammed K.", firs: 4, crime: "Cyber Fraud", districts: "Kalaburagi, Belagavi", last: "4 days ago", risk: "HIGH" },
        { name: "Suresh K.", firs: 4, crime: "Vehicle Theft", districts: "Bengaluru, Mysuru", last: "1 week ago", risk: "MEDIUM" },
        { name: "Anand M.", firs: 3, crime: "Robbery", districts: "Hubballi, Dharwad", last: "2 weeks ago", risk: "MEDIUM" },
      ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Title Header */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <BarChart2 size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Crime Analytics</Text>
            <Text style={styles.screenSub}>AI-powered crime trends, patterns and investigative intelligence</Text>
          </View>
          <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setFilterOpen(!filterOpen)}>
            <Filter size={16} color="#0F4C81" />
            <Text style={styles.filterToggleText}>{filterOpen ? "Hide Filters" : "Filters"}</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Filters Section */}
        {filterOpen && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterPanelTitle}>COMPACT ANALYTICS FILTERS</Text>
            <View style={styles.filterGrid}>
              <View style={styles.filterBox}>
                <Text style={styles.filterLabel}>Date Range</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optRow}>
                  {["Last 7 Days", "Last 30 Days", "Q3 2024", "YTD"].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.optChip, selectedDateRange === d && styles.optChipActive]}
                      onPress={() => setSelectedDateRange(d)}
                    >
                      <Text style={[styles.optChipText, selectedDateRange === d && styles.optChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterBox}>
                <Text style={styles.filterLabel}>District</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optRow}>
                  {["All Districts", "Bengaluru", "Mysuru", "Hubballi", "Kalaburagi"].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.optChip, selectedDistrict === d && styles.optChipActive]}
                      onPress={() => setSelectedDistrict(d)}
                    >
                      <Text style={[styles.optChipText, selectedDistrict === d && styles.optChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterOpen(false)}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <RefreshCw size={14} color="#64748B" />
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* AI Pattern Insight Card (Prominent WOW Component) */}
      <View style={styles.aiInsightCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiBrainBadge}>
            <Brain size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.aiTitle}>AI Crime Pattern Detected</Text>
              <View style={styles.confChip}>
                <Text style={styles.confText}>91% Confidence</Text>
              </View>
            </View>
            <Text style={styles.aiSub}>Automated structural intelligence recommendation</Text>
          </View>
        </View>

        <Text style={styles.aiMainPattern}>
          "Vehicle theft incidents increased <Text style={{ fontFamily: "Inter-Bold", color: "#EF4444" }}>23%</Text> in Bengaluru South during Friday and Saturday nights over the last four weeks."
        </Text>

        <View style={styles.evidenceGrid}>
          <View style={styles.evidenceChip}>
            <Text style={styles.evidenceVal}>37</Text>
            <Text style={styles.evidenceLbl}>Related FIRs</Text>
          </View>
          <View style={styles.evidenceChip}>
            <Text style={styles.evidenceVal}>4</Text>
            <Text style={styles.evidenceLbl}>Repeat Offenders</Text>
          </View>
          <View style={styles.evidenceChip}>
            <Text style={styles.evidenceVal}>3</Text>
            <Text style={styles.evidenceLbl}>Common Locations</Text>
          </View>
          <View style={styles.evidenceChip}>
            <Text style={styles.evidenceVal}>Fri-Sat</Text>
            <Text style={styles.evidenceLbl}>Weekend Window</Text>
          </View>
        </View>

        <View style={styles.aiActionsRow}>
          <TouchableOpacity
            style={styles.investigateBtn}
            onPress={() => onOpenAIWorkspace && onOpenAIWorkspace("Investigate 23% vehicle theft pattern in Bengaluru South")}
          >
            <Brain size={15} color="#FFFFFF" />
            <Text style={styles.investigateBtnText}>Investigate Pattern</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.explainBtn}
            onPress={() =>
              onOpenExplainWhy &&
              onOpenExplainWhy({
                title: "WHY THIS PATTERN WAS DETECTED",
                queryOrContext: "23% Vehicle Theft Increase in Bengaluru South (Fri-Sat Nights)",
                confidenceScore: 91,
                sharedFIRs: ["FIR-2024-08431", "FIR-2024-08403", "FIR-2024-08399"],
                commonVehicle: "KA-01-AB-1234",
                commonLocations: ["Electronic City Phase 1", "Silk Board Junction", "Bommanahalli"],
                explanationText: "Temporal and spatial clustering analysis discovered high density of vehicle theft complaints originating between 20:00 and 02:00 HRS on weekends. 4 recurring suspects share vehicle ownership records and common location pings.",
              })
            }
          >
            <HelpCircle size={15} color="#0F4C81" />
            <Text style={styles.explainBtnText}>Explain Why</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Analytics KPI Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Statewide Intelligence KPIs</Text>
      </View>

      <View style={styles.kpiGrid}>
        {kpis.map((item, idx) => (
          <View key={idx} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{item.title}</Text>
            <Text style={styles.kpiValue}>{item.value}</Text>
            <View style={styles.kpiBottom}>
              <View style={[styles.trendBadge, { backgroundColor: item.isBad ? "#FEF2F2" : "#DCFCE7" }]}>
                <Text style={[styles.trendBadgeText, { color: item.isBad ? "#EF4444" : "#16A34A" }]}>{item.trend}</Text>
              </View>
              <Text style={styles.kpiSub} numberOfLines={1}>{item.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Crime Trend Analysis (Interactive Chart View) */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Crime Trend Analysis</Text>
            <Text style={styles.chartSub}>Historical trend line by category across Karnataka</Text>
          </View>
          {/* Time Tabs */}
          <View style={styles.timeTabs}>
            {(["Weekly", "Monthly", "Quarterly", "Yearly"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.timeTab, trendTab === tab && styles.timeTabActive]}
                onPress={() => setTrendTab(tab)}
              >
                <Text style={[styles.timeTabText, trendTab === tab && styles.timeTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Legend Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendRow}>
          {["Theft", "Cyber Crime", "Assault", "Fraud", "Drug Offences", "Robbery"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.legendChip, activeTrendCategory === cat && styles.legendChipActive]}
              onPress={() => setActiveTrendCategory(cat)}
            >
              <Text style={[styles.legendChipText, activeTrendCategory === cat && styles.legendChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SVG Trend Graph */}
        <View style={styles.svgContainer}>
          <Svg width="100%" height="160" viewBox="0 0 320 160">
            {/* Grid lines */}
            <Line x1="10" y1="20" x2="310" y2="20" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="10" y1="60" x2="310" y2="60" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="10" y1="100" x2="310" y2="100" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="10" y1="140" x2="310" y2="140" stroke="#E2E8F0" strokeWidth="1" />

            {/* Line Graph Path */}
            <Path
              d="M 10 110 Q 60 70, 110 95 T 210 40 T 310 30"
              fill="none"
              stroke="#0F4C81"
              strokeWidth="3"
            />
            {/* Shaded Area under Curve */}
            <Path
              d="M 10 110 Q 60 70, 110 95 T 210 40 T 310 30 L 310 140 L 10 140 Z"
              fill="rgba(15, 76, 129, 0.08)"
            />

            {/* Key Data Points */}
            <Circle cx="10" cy="110" r="4" fill="#0F4C81" />
            <Circle cx="110" cy="95" r="4" fill="#0F4C81" />
            <Circle cx="210" cy="40" r="4" fill="#0F4C81" />
            <Circle cx="310" cy="30" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />

            {/* Labels */}
            <SvgText x="10" y="155" fontSize="10" fill="#94A3B8">Wk 1</SvgText>
            <SvgText x="110" y="155" fontSize="10" fill="#94A3B8">Wk 2</SvgText>
            <SvgText x="210" y="155" fontSize="10" fill="#94A3B8">Wk 3</SvgText>
            <SvgText x="290" y="155" fontSize="10" fill="#94A3B8">Wk 4</SvgText>

            <SvgText x="270" y="24" fontSize="11" fontWeight="bold" fill="#EF4444">+23% Peak</SvgText>
          </Svg>
        </View>
      </View>

      {/* District Crime Comparison & Category Distribution */}
      <View style={styles.chartsRow}>
        {/* District Comparison */}
        <View style={styles.chartHalfCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>District Crime Comparison</Text>
            <Text style={styles.chartSub}>Top 10 districts by FIR volume</Text>
          </View>

          <View style={styles.districtList}>
            {districtData.map((d, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.districtItem}
                onPress={() => onOpenHotspot && onOpenHotspot(d.name)}
              >
                <View style={styles.districtTop}>
                  <Text style={styles.districtName}>{d.name}</Text>
                  <Text style={styles.districtCount}>{d.count.toLocaleString()}</Text>
                </View>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${d.percent}%`,
                        backgroundColor: d.risk === "CRITICAL" ? "#EF4444" : d.risk === "HIGH" ? "#F59E0B" : "#0F4C81",
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crime Category Donut & Time Patterns */}
        <View style={styles.chartHalfCard}>
          <Text style={styles.chartTitle}>Category & Time Breakdown</Text>

          {/* Donut representation */}
          <View style={styles.catGrid}>
            {categories.map((c, idx) => (
              <View key={idx} style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: c.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{c.name}</Text>
                  <Text style={styles.catCount}>{c.count} ({c.percent}%)</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Time of Day Pattern */}
          <Text style={[styles.chartTitle, { marginTop: 16 }]}>Peak Crime Windows</Text>
          <View style={styles.timePatternGrid}>
            <View style={[styles.timeBox, { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }]}>
              <Text style={styles.timeWindow}>12 AM – 6 AM</Text>
              <Text style={[styles.timeStat, { color: "#EF4444" }]}>28% (Peak)</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeWindow}>6 AM – 12 PM</Text>
              <Text style={styles.timeStat}>15%</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeWindow}>12 PM – 6 PM</Text>
              <Text style={styles.timeStat}>22%</Text>
            </View>
            <View style={[styles.timeBox, { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }]}>
              <Text style={styles.timeWindow}>6 PM – 12 AM</Text>
              <Text style={[styles.timeStat, { color: "#EF4444" }]}>35% (High)</Text>
            </View>
          </View>

          {/* Day of Week Pattern */}
          <Text style={[styles.chartTitle, { marginTop: 14 }]}>Higher Risk Days</Text>
          <View style={styles.daysRow}>
            {["M", "T", "W", "T", "F*", "S*", "S"].map((day, idx) => (
              <View
                key={idx}
                style={[
                  styles.dayBarBox,
                  (day === "F*" || day === "S*") && styles.dayBarBoxHigh,
                ]}
              >
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.riskNote}>* Friday & Saturday nights account for 58% of weekend thefts.</Text>
        </View>
      </View>

      {/* Repeat Offender Analysis Table */}
      <View style={styles.tableCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Repeat Offender Analysis</Text>
          <Text style={styles.chartSub}>Prior conviction targets requiring active surveillance</Text>
        </View>

        <View style={styles.offenderList}>
          {repeatOffenders.map((off, idx) => (
            <View key={idx} style={styles.offenderRow}>
              <View style={styles.offenderInfo}>
                <View style={styles.offenderAvatar}>
                  <User size={16} color="#0F4C81" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.offenderName}>{off.name}</Text>
                    <View style={[styles.riskTag, { backgroundColor: off.risk === "HIGH" ? "#EF4444" : "#F59E0B" }]}>
                      <Text style={styles.riskTagText}>{off.risk}</Text>
                    </View>
                  </View>
                  <Text style={styles.offenderSub}>
                    {off.firs} Prior FIRs · {off.crime} · Active: {off.districts}
                  </Text>
                </View>
              </View>

              <View style={styles.offenderActions}>
                <TouchableOpacity
                  style={styles.offActionBtn}
                  onPress={() => onOpenAccusedProfile && onOpenAccusedProfile(off.name)}
                >
                  <Text style={styles.offActionText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.offActionBtn}
                  onPress={() => onOpenNetwork && onOpenNetwork(off.name)}
                >
                  <Network size={12} color="#0F4C81" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.offActionBtnPrimary}
                  onPress={() => onOpenAIWorkspace && onOpenAIWorkspace(`Investigate repeat offender ${off.name}`)}
                >
                  <Brain size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 24,
    color: "#0F172A",
  },
  screenSub: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#64748B",
  },
  filterToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterToggleText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F4C81",
  },
  filterPanel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  filterPanelTitle: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#0F4C81",
    marginBottom: 10,
    letterSpacing: 1,
  },
  filterGrid: {
    gap: 10,
  },
  filterBox: {
    gap: 4,
  },
  filterLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  optRow: {
    flexDirection: "row",
  },
  optChip: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  optChipActive: {
    backgroundColor: "#0F4C81",
  },
  optChipText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#475569",
  },
  optChipTextActive: {
    color: "#FFFFFF",
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  applyBtn: {
    backgroundColor: "#0F4C81",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  applyBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#64748B",
  },
  aiInsightCard: {
    backgroundColor: "rgba(15, 76, 129, 0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(15, 76, 129, 0.25)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  aiBrainBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F4C81",
  },
  confChip: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  confText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  aiSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  aiMainPattern: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#0F172A",
    lineHeight: 20,
    marginBottom: 12,
  },
  evidenceGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  evidenceChip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15, 76, 129, 0.15)",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
  },
  evidenceVal: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: "#0F4C81",
  },
  evidenceLbl: {
    fontFamily: "Inter-Regular",
    fontSize: 9,
    color: "#64748B",
    textAlign: "center",
  },
  aiActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  investigateBtn: {
    flex: 2,
    backgroundColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  investigateBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  explainBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  explainBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F4C81",
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
  },
  kpiLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  kpiValue: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 22,
    color: "#0F172A",
    marginVertical: 4,
  },
  kpiBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendBadge: {
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  trendBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
  },
  kpiSub: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#94A3B8",
    flex: 1,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  chartTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  chartSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  timeTabs: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 2,
  },
  timeTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeTabActive: {
    backgroundColor: "#0F4C81",
  },
  timeTabText: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: "#475569",
  },
  timeTabTextActive: {
    color: "#FFFFFF",
  },
  legendRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  legendChip: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  legendChipActive: {
    backgroundColor: "rgba(15, 76, 129, 0.12)",
    borderWidth: 1,
    borderColor: "#0F4C81",
  },
  legendChipText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  legendChipTextActive: {
    color: "#0F4C81",
    fontFamily: "Inter-SemiBold",
  },
  svgContainer: {
    alignItems: "center",
  },
  chartsRow: {
    gap: 16,
    marginBottom: 16,
  },
  chartHalfCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },
  districtList: {
    gap: 8,
    marginTop: 8,
  },
  districtItem: {
    gap: 3,
  },
  districtTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  districtName: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F172A",
  },
  districtCount: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  barBg: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  catItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F172A",
  },
  catCount: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
  },
  timePatternGrid: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  timeBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 6,
    alignItems: "center",
  },
  timeWindow: {
    fontFamily: "Inter-Regular",
    fontSize: 9,
    color: "#64748B",
  },
  timeStat: {
    fontFamily: "Inter-Bold",
    fontSize: 11,
    color: "#0F172A",
    marginTop: 2,
  },
  daysRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  dayBarBox: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  dayBarBoxHigh: {
    backgroundColor: "#EF4444",
  },
  dayText: {
    fontFamily: "Inter-Bold",
    fontSize: 11,
    color: "#0F172A",
  },
  riskNote: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#EF4444",
    marginTop: 6,
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },
  offenderList: {
    gap: 8,
    marginTop: 8,
  },
  offenderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
  },
  offenderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  offenderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15, 76, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  offenderName: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F172A",
  },
  offenderSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  riskTag: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  riskTagText: {
    fontFamily: "Inter-Bold",
    fontSize: 8,
    color: "#FFFFFF",
  },
  offenderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  offActionBtn: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  offActionText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  offActionBtnPrimary: {
    backgroundColor: "#0F4C81",
    borderRadius: 8,
    padding: 6,
  },
});
