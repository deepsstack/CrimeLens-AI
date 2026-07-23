import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  Search,
  User,
  FileText,
  Car,
  MapPin,
  Shield,
  Brain,
  Network,
  ChevronRight,
  X,
  Phone,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react-native";
import {
  getAllFIRCases,
  getAllAccused,
  type FIRCase,
  type Accused,
} from "../../services/crimelensApi";
import { mapToSearchResults } from "../../utils/catalystDataUtils";

export type SearchCategory =
  | "All"
  | "FIRs"
  | "Accused"
  | "Victims"
  | "Vehicles"
  | "Locations"
  | "Police Stations";

export type SearchResultItem = {
  id: string;
  category: "FIR" | "Accused" | "Victim" | "Vehicle" | "Location" | "Police Station";
  title: string;
  subtitle: string;
  tag?: string;
  badgeColor?: string;
  relatedFIRsCount?: number;
  district?: string;
  details?: string;
  crimeType?: string;
  status?: string;
  priority?: "Critical" | "High" | "Medium" | "Low";
  date?: string;
};

export type GlobalSearchModalProps = {
  visible: boolean;
  lang?: "en" | "kn";
  onClose: () => void;
  initialQuery?: string;
  onOpenFIR?: (firNumber: string) => void;
  onOpenAccusedProfile?: (accusedName: string) => void;
  onOpenNetwork?: (targetId: string) => void;
  onOpenAIWorkspace?: (query: string) => void;
};

const MOCK_RESULTS: SearchResultItem[] = [
  {
    id: "res1",
    category: "Accused",
    title: "Ravi S.",
    subtitle: "Alias: 'Bullet Ravi' · ID: ACC-8921 · 6 Prior FIRs",
    tag: "HIGH RISK",
    badgeColor: "#EF4444",
    relatedFIRsCount: 6,
    district: "Bengaluru City",
    details: "4 Known Associates · 2 Vehicles (KA-01-AB-1234) · 3 District Connections",
  },
  {
    id: "res2",
    category: "FIR",
    title: "FIR-2024-08431",
    subtitle: "Motor Vehicle Theft · Electronic City PS · 18 Jul 2024",
    tag: "HIGH PRIORITY",
    badgeColor: "#EF4444",
    district: "Bengaluru South",
    details: "Status: Under Investigation · Assigned: SI Ramesh K.",
    crimeType: "Motor Vehicle Theft",
    status: "Under Investigation",
    priority: "High",
    date: "2024-07-18",
  },
  {
    id: "res3",
    category: "Vehicle",
    title: "KA-01-AB-1234",
    subtitle: "Black Bajaj Pulsar 220cc · Linked to 3 Theft FIRs",
    tag: "SUSPECT VEHICLE",
    badgeColor: "#F59E0B",
    district: "Bengaluru / Tumakuru",
    details: "Registered to: Suresh K. (Co-Accused) · Sighted: City Market",
  },
  {
    id: "res4",
    category: "Accused",
    title: "Suresh K.",
    subtitle: "ID: ACC-7412 · Primary Associate of Ravi S.",
    tag: "HIGH RISK",
    badgeColor: "#EF4444",
    relatedFIRsCount: 4,
    district: "Bengaluru / Mysuru",
    details: "3 Shared FIRs with Ravi S. · Known Vehicle Owner",
  },
  {
    id: "res5",
    category: "FIR",
    title: "FIR-2023-01981",
    subtitle: "Armed Burglary · Mysuru Central PS · 04 Nov 2023",
    tag: "CHARGESHEETED",
    badgeColor: "#10B981",
    district: "Mysuru",
    details: "Linked suspect: Ravi S. · Stolen Property Recovered",
    crimeType: "Armed Burglary",
    status: "Chargesheeted",
    priority: "Medium",
    date: "2023-11-04",
  },
  {
    id: "res6",
    category: "Location",
    title: "Electronic City Phase 1",
    subtitle: "Crime Hotspot Zone · Risk Score 87/100",
    tag: "CRIME HOTSPOT",
    badgeColor: "#DC2626",
    district: "Bengaluru South",
    details: "Peak hours: 8 PM - 1 AM · 23% Theft Increase",
  },
  {
    id: "res7",
    category: "Police Station",
    title: "Electronic City Police Station",
    subtitle: "Bengaluru South Division · Station House Officer: Insp. V. Kumar",
    tag: "ACTIVE PS",
    badgeColor: "#0F4C81",
    district: "Bengaluru",
    details: "Jurisdiction over 4 Hotspot Zones · 48 Active Investigations",
  },
];

export function GlobalSearchModal({
  visible,
  lang = "en",
  onClose,
  initialQuery = "",
  onOpenFIR,
  onOpenAccusedProfile,
  onOpenNetwork,
  onOpenAIWorkspace,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [districtFilter, setDistrictFilter] = useState("All");
  const [crimeFilter, setCrimeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [catalystFIRCases, setCatalystFIRCases] = useState<FIRCase[]>([]);
  const [catalystAccusedList, setCatalystAccusedList] = useState<Accused[]>([]);

  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    async function loadSearchData() {
      setLoadingSearch(true);
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
        console.error("Failed to load search data from Catalyst:", err);
      } finally {
        if (mounted) setLoadingSearch(false);
      }
    }
    loadSearchData();
    return () => {
      mounted = false;
    };
  }, [visible]);

  const catalystResults = mapToSearchResults(catalystFIRCases, catalystAccusedList, query);
  const allSearchSource = catalystResults.length > 0
    ? [...catalystResults, ...MOCK_RESULTS.filter((m) => m.category === "Vehicle" || m.category === "Location" || m.category === "Police Station")]
    : MOCK_RESULTS;

  const tr = (en: string, kn: string) => (lang === "kn" ? kn : en);

  const districts = ["All", "Bengaluru", "Mysuru", "Tumakuru"];
  const crimeTypes = ["All", "Motor Vehicle Theft", "Armed Burglary"];
  const statuses = ["All", "Under Investigation", "Chargesheeted"];
  const priorities = ["All", "Critical", "High", "Medium", "Low"];

  const clearFilters = () => {
    setDistrictFilter("All");
    setCrimeFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");
    setFromDate("");
    setToDate("");
  };

  const activeFilterCount = [
    districtFilter !== "All",
    crimeFilter !== "All",
    statusFilter !== "All",
    priorityFilter !== "All",
    fromDate.trim().length > 0,
    toDate.trim().length > 0,
  ].filter(Boolean).length;

  const categories: SearchCategory[] = [
    "All",
    "FIRs",
    "Accused",
    "Victims",
    "Vehicles",
    "Locations",
    "Police Stations",
  ];

  const filteredResults = allSearchSource.filter((item) => {
    // category filter
    if (activeCategory === "FIRs" && item.category !== "FIR") return false;
    if (activeCategory === "Accused" && item.category !== "Accused") return false;
    if (activeCategory === "Vehicles" && item.category !== "Vehicle") return false;
    if (activeCategory === "Locations" && item.category !== "Location") return false;
    if (activeCategory === "Police Stations" && item.category !== "Police Station") return false;

    // #30 — advanced filters
    if (
      districtFilter !== "All" &&
      !(item.district || "").toLowerCase().includes(districtFilter.toLowerCase())
    ) return false;

    if (crimeFilter !== "All" && item.crimeType !== crimeFilter) return false;
    if (statusFilter !== "All" && item.status !== statusFilter) return false;
    if (priorityFilter !== "All" && item.priority !== priorityFilter) return false;

    if (fromDate.trim() && item.date && item.date < fromDate.trim()) return false;
    if (toDate.trim() && item.date && item.date > toDate.trim()) return false;
    if ((fromDate.trim() || toDate.trim()) && !item.date) return false;

    // text search query
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        (item.district && item.district.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Search Bar Header */}
          <View style={styles.searchHeader}>
            <Search size={18} color="#0F4C81" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={tr("Search FIR, accused, vehicle, district or crime...", "FIR, ಆರೋಪಿ, ವಾಹನ, ಜಿಲ್ಲೆ ಅಥವಾ ಅಪರಾಧ ಹುಡುಕಿ...")}
              placeholderTextColor="#94A3B8"
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} style={{ padding: 4 }}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.cancelText}>{tr("Cancel", "ರದ್ದು")}</Text>
            </TouchableOpacity>
          </View>

          {/* Category Chips */}
          <View style={styles.categoriesBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, activeCategory === cat && styles.chipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* #30 — Advanced Search & Filters */}
          <View style={styles.filterToolbar}>
            <TouchableOpacity
              style={[styles.filterToggle, filtersOpen && styles.filterToggleActive]}
              onPress={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal size={15} color={filtersOpen ? "#FFFFFF" : "#0F4C81"} />
              <Text style={[styles.filterToggleText, filtersOpen && styles.filterToggleTextActive]}>
                {tr("Advanced Filters", "ಸುಧಾರಿತ ಫಿಲ್ಟರ್‌ಗಳು")}
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Text>
            </TouchableOpacity>

            {activeFilterCount > 0 && (
              <TouchableOpacity style={styles.clearFilterBtn} onPress={clearFilters}>
                <RotateCcw size={13} color="#64748B" />
                <Text style={styles.clearFilterText}>{tr("Clear", "ತೆರವು")}</Text>
              </TouchableOpacity>
            )}
          </View>

          {filtersOpen && (
            <View style={styles.advancedPanel}>
              <Text style={styles.filterSectionLabel}>{tr("District / Location", "ಜಿಲ್ಲೆ / ಸ್ಥಳ")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                {districts.map((v) => (
                  <TouchableOpacity key={v} style={[styles.filterChip, districtFilter === v && styles.filterChipActive]} onPress={() => setDistrictFilter(v)}>
                    <Text style={[styles.filterChipText, districtFilter === v && styles.filterChipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionLabel}>{tr("Crime Type", "ಅಪರಾಧ ಪ್ರಕಾರ")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                {crimeTypes.map((v) => (
                  <TouchableOpacity key={v} style={[styles.filterChip, crimeFilter === v && styles.filterChipActive]} onPress={() => setCrimeFilter(v)}>
                    <Text style={[styles.filterChipText, crimeFilter === v && styles.filterChipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionLabel}>{tr("Case Status", "ಪ್ರಕರಣ ಸ್ಥಿತಿ")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                {statuses.map((v) => (
                  <TouchableOpacity key={v} style={[styles.filterChip, statusFilter === v && styles.filterChipActive]} onPress={() => setStatusFilter(v)}>
                    <Text style={[styles.filterChipText, statusFilter === v && styles.filterChipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionLabel}>{tr("Priority / Risk", "ಆದ್ಯತೆ / ಅಪಾಯ")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                {priorities.map((v) => (
                  <TouchableOpacity key={v} style={[styles.filterChip, priorityFilter === v && styles.filterChipActive]} onPress={() => setPriorityFilter(v)}>
                    <Text style={[styles.filterChipText, priorityFilter === v && styles.filterChipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionLabel}>{tr("Date Range (YYYY-MM-DD)", "ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ (YYYY-MM-DD)")}</Text>
              <View style={styles.dateRow}>
                <TextInput style={styles.dateInput} value={fromDate} onChangeText={setFromDate} placeholder={tr("From", "ಇಂದ")} placeholderTextColor="#94A3B8" />
                <Text style={styles.dateSeparator}>—</Text>
                <TextInput style={styles.dateInput} value={toDate} onChangeText={setToDate} placeholder={tr("To", "ವರೆಗೆ")} placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.clearAllBtn} onPress={clearFilters}>
                  <Text style={styles.clearAllText}>{tr("Clear Filters", "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => setFiltersOpen(false)}>
                  <Text style={styles.applyBtnText}>{tr("Apply Filters", "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಅನ್ವಯಿಸಿ")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Results Area */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {tr("Showing", "ತೋರಿಸಲಾಗುತ್ತಿದೆ")} {filteredResults.length} {tr("Intelligence Results", "ಗುಪ್ತಚರ ಫಲಿತಾಂಶಗಳು")}
              </Text>
            </View>

            {filteredResults.length === 0 && (
              <View style={styles.emptyState}>
                <Search size={28} color="#94A3B8" />
                <Text style={styles.emptyTitle}>{tr("No matching results", "ಹೊಂದುವ ಫಲಿತಾಂಶಗಳಿಲ್ಲ")}</Text>
                <Text style={styles.emptyText}>{tr("Try changing the search text or clearing some filters.", "ಹುಡುಕಾಟ ಪದ ಅಥವಾ ಕೆಲವು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಬದಲಿಸಿ.")}</Text>
              </View>
            )}

            {filteredResults.map((item) => {
              const Icon =
                item.category === "Accused"
                  ? User
                  : item.category === "FIR"
                    ? FileText
                    : item.category === "Vehicle"
                      ? Car
                      : item.category === "Location"
                        ? MapPin
                        : Shield;

              return (
                <View key={item.id} style={styles.resultCard}>
                  <View style={styles.resultTop}>
                    <View style={styles.iconBox}>
                      <Icon size={18} color="#0F4C81" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.resultTitle}>{item.title}</Text>
                        {item.tag && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: item.badgeColor || "#0F4C81" },
                            ]}
                          >
                            <Text style={styles.badgeText}>{item.tag}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.resultSub}>{item.subtitle}</Text>
                      {item.details && <Text style={styles.resultDetails}>{item.details}</Text>}
                    </View>
                  </View>

                  {/* Quick Action Buttons */}
                  <View style={styles.actionsRow}>
                    {item.category === "Accused" && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onOpenAccusedProfile && onOpenAccusedProfile(item.title)}
                      >
                        <User size={13} color="#0F4C81" />
                        <Text style={styles.actionBtnText}>Open Profile</Text>
                      </TouchableOpacity>
                    )}

                    {item.category === "FIR" && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onOpenFIR && onOpenFIR(item.title)}
                      >
                        <FileText size={13} color="#0F4C81" />
                        <Text style={styles.actionBtnText}>View FIR</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => onOpenNetwork && onOpenNetwork(item.title)}
                    >
                      <Network size={13} color="#0F4C81" />
                      <Text style={styles.actionBtnText}>Network Graph</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      onPress={() =>
                        onOpenAIWorkspace && onOpenAIWorkspace(`Investigate details for ${item.title}`)
                      }
                    >
                      <Brain size={13} color="#FFFFFF" />
                      <Text style={styles.actionBtnPrimaryText}>Investigate AI</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingBottom: 20,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 4,
  },
  closeBtn: {
    paddingHorizontal: 4,
  },
  cancelText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "#64748B",
  },
  categoriesBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 6,
  },
  chip: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: "#0F4C81",
  },
  chipText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#475569",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  filterToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterToggleActive: { backgroundColor: "#0F4C81", borderColor: "#0F4C81" },
  filterToggleText: { fontFamily: "Inter-SemiBold", fontSize: 11, color: "#0F4C81" },
  filterToggleTextActive: { color: "#FFFFFF" },
  clearFilterBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6 },
  clearFilterText: { fontFamily: "Inter-Medium", fontSize: 11, color: "#64748B" },
  advancedPanel: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  filterSectionLabel: { fontFamily: "Inter-SemiBold", fontSize: 11, color: "#334155", marginTop: 7, marginBottom: 6 },
  filterChipRow: { gap: 6, paddingRight: 10 },
  filterChip: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  filterChipActive: { backgroundColor: "#0F4C81", borderColor: "#0F4C81" },
  filterChipText: { fontFamily: "Inter-Medium", fontSize: 10, color: "#475569" },
  filterChipTextActive: { color: "#FFFFFF" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateInput: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontFamily: "Inter-Regular", fontSize: 11, color: "#0F172A" },
  dateSeparator: { color: "#64748B" },
  filterActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  clearAllBtn: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  clearAllText: { fontFamily: "Inter-SemiBold", fontSize: 11, color: "#475569" },
  applyBtn: { backgroundColor: "#0F4C81", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  applyBtnText: { fontFamily: "Inter-SemiBold", fontSize: 11, color: "#FFFFFF" },
  emptyState: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: "Rajdhani-Bold", fontSize: 16, color: "#334155", marginTop: 8 },
  emptyText: { fontFamily: "Inter-Regular", fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 4 },

  body: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  resultsHeader: {
    marginBottom: 8,
  },
  resultsCount: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#64748B",
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  resultTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(15, 76, 129, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  resultTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: "#0F172A",
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  resultSub: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#475569",
    marginBottom: 4,
  },
  resultDetails: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0F4C81",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: "auto",
  },
  actionBtnPrimaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
});
