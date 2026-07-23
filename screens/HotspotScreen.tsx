/**
 * screens/HotspotScreen.tsx
 * CrimeLens AI — Crime Hotspot Intelligence Screen
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  MapPin,
  Filter,
  Brain,
  Clock,
  Shield,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  FileText,
  Navigation,
  Sliders,
} from "lucide-react-native";
import Svg, { Rect, Circle, Text as SvgText, Path, G, Line } from "react-native-svg";

export type HotspotScreenProps = {
  lang?: "en" | "kn";
  initialDistrict?: string;
  onOpenExplainWhy?: (data: any) => void;
  onOpenFIR?: (firNumber: string) => void;
  onOpenAIWorkspace?: (query?: string) => void;
};

export type HotspotLocation = {
  id: string;
  name: string;
  district: string;
  riskScore: number;
  riskTier: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  crimeIncrease: string;
  dominantCrime: string;
  peakWindow: string;
  repeatOffendersCount: number;
  nearbyStation: string;
  x: number;
  y: number;
};

const HOTSPOTS: HotspotLocation[] = [
  {
    id: "h1",
    name: "Electronic City Phase 1",
    district: "Bengaluru South",
    riskScore: 87,
    riskTier: "CRITICAL",
    crimeIncrease: "+23%",
    dominantCrime: "Vehicle Theft",
    peakWindow: "8 PM – 1 AM",
    repeatOffendersCount: 4,
    nearbyStation: "Electronic City Police Station",
    x: 210,
    y: 180,
  },
  {
    id: "h2",
    name: "City Market & Avenue Rd",
    district: "Bengaluru Central",
    riskScore: 82,
    riskTier: "HIGH",
    crimeIncrease: "+18%",
    dominantCrime: "Pickpocketing & Burglary",
    peakWindow: "6 PM – 11 PM",
    repeatOffendersCount: 6,
    nearbyStation: "City Market Police Station",
    x: 180,
    y: 160,
  },
  {
    id: "h3",
    name: "Central Market Zone",
    district: "Mysuru Central",
    riskScore: 76,
    riskTier: "HIGH",
    crimeIncrease: "+15%",
    dominantCrime: "Chain Snatching & Theft",
    peakWindow: "7 PM – 10 PM",
    repeatOffendersCount: 3,
    nearbyStation: "Lashkar Police Station",
    x: 120,
    y: 220,
  },
  {
    id: "h4",
    name: "Market Yard Industrial Area",
    district: "Hubballi",
    riskScore: 71,
    riskTier: "MEDIUM",
    crimeIncrease: "+12%",
    dominantCrime: "Commercial Burglary",
    peakWindow: "11 PM – 4 AM",
    repeatOffendersCount: 2,
    nearbyStation: "Suburban Police Station",
    x: 100,
    y: 100,
  },
];

export function HotspotScreen({
  lang = "en",
  initialDistrict = "Bengaluru South",
  onOpenExplainWhy,
  onOpenFIR,
  onOpenAIWorkspace,
}: HotspotScreenProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotLocation>(HOTSPOTS[0]);
  const [timeHour, setTimeHour] = useState<number>(22); // 10 PM default
  const [filterDistrict, setFilterDistrict] = useState<string>("All");

  const formatHour = (h: number) => {
    if (h === 0) return "12 AM (Midnight)";
    if (h === 12) return "12 PM (Noon)";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <MapPin size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Crime Hotspot Intelligence</Text>
            <Text style={styles.screenSub}>Geospatial crime intelligence and predictive risk monitoring</Text>
          </View>
        </View>
      </View>

      {/* Map Interactive Canvas */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mapTitle}>Karnataka Geospatial Heatmap</Text>
            <Text style={styles.mapSub}>Live risk clusters and predicted patrol target zones</Text>
          </View>
          <View style={styles.liveTag}>
            <Text style={styles.liveTagText}>LIVE RISK FORECAST</Text>
          </View>
        </View>

        {/* SVG Interactive Map */}
        <View style={styles.svgWrapper}>
          <Svg width="100%" height="240" viewBox="0 0 320 240">
            {/* Karnataka Boundary Outline Box */}
            <Rect x="20" y="20" width="280" height="200" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />

            {/* Grid Lines */}
            <Line x1="20" y1="80" x2="300" y2="80" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="20" y1="140" x2="300" y2="140" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="110" y1="20" x2="110" y2="220" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="200" y1="20" x2="200" y2="220" stroke="#F1F5F9" strokeWidth="1" />

            {/* Region Labels */}
            <SvgText x="60" y="50" fontSize="10" fontWeight="bold" fill="#94A3B8">North KA</SvgText>
            <SvgText x="150" y="50" fontSize="10" fontWeight="bold" fill="#94A3B8">Central KA</SvgText>
            <SvgText x="230" y="50" fontSize="10" fontWeight="bold" fill="#94A3B8">South KA</SvgText>

            {/* Hotspot Markers */}
            {HOTSPOTS.map((hs) => {
              const isSelected = hs.id === selectedHotspot.id;
              const color =
                hs.riskTier === "CRITICAL"
                  ? "#DC2626"
                  : hs.riskTier === "HIGH"
                  ? "#EA580C"
                  : "#F59E0B";

              return (
                <G key={hs.id} onPress={() => setSelectedHotspot(hs)}>
                  {/* Outer pulse aura */}
                  <Circle
                    cx={hs.x}
                    cy={hs.y}
                    r={isSelected ? 20 : 14}
                    fill={color}
                    opacity={isSelected ? 0.35 : 0.2}
                  />
                  {/* Core marker */}
                  <Circle
                    cx={hs.x}
                    cy={hs.y}
                    r={isSelected ? 10 : 7}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  {/* Label */}
                  <SvgText
                    x={hs.x}
                    y={hs.y + 18}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#0F172A"
                    textAnchor="middle"
                  >
                    {hs.name.split(" ")[0]}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>

        {/* 24-Hour Time Slider */}
        <View style={styles.sliderBox}>
          <View style={styles.sliderHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Clock size={14} color="#0F4C81" />
              <Text style={styles.sliderTitle}>Time Slider Simulation</Text>
            </View>
            <Text style={styles.sliderTimeVal}>{formatHour(timeHour)}</Text>
          </View>

          <View style={styles.sliderTrack}>
            {[0, 4, 8, 12, 16, 20, 23].map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hourStep, timeHour === h && styles.hourStepActive]}
                onPress={() => setTimeHour(h)}
              >
                <Text style={[styles.hourStepText, timeHour === h && styles.hourStepTextActive]}>
                  {h === 0 ? "12A" : h === 12 ? "12P" : h > 12 ? `${h - 12}P` : `${h}A`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Risk Level Key */}
        <View style={styles.legendRow}>
          <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: "#10B981" }]} /><Text style={styles.legText}>Low</Text></View>
          <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: "#F59E0B" }]} /><Text style={styles.legText}>Medium</Text></View>
          <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: "#EA580C" }]} /><Text style={styles.legText}>High</Text></View>
          <View style={styles.legItem}><View style={[styles.legDot, { backgroundColor: "#DC2626" }]} /><Text style={styles.legText}>Critical</Text></View>
        </View>
      </View>

      {/* Selected Hotspot Details Panel */}
      <View style={styles.detailsCard}>
        <View style={styles.detailsHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.spotTitle}>{selectedHotspot.name}</Text>
              <View style={[styles.riskTag, { backgroundColor: selectedHotspot.riskTier === "CRITICAL" ? "#DC2626" : "#EA580C" }]}>
                <Text style={styles.riskTagText}>{selectedHotspot.riskTier}</Text>
              </View>
            </View>
            <Text style={styles.spotSub}>{selectedHotspot.district} · Station: {selectedHotspot.nearbyStation}</Text>
          </View>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreVal}>{selectedHotspot.riskScore}</Text>
            <Text style={styles.scoreSub}>/100</Text>
          </View>
        </View>

        <View style={styles.specGrid}>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Crime Increase</Text>
            <Text style={[styles.specVal, { color: "#DC2626" }]}>{selectedHotspot.crimeIncrease}</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Dominant Crime</Text>
            <Text style={styles.specVal}>{selectedHotspot.dominantCrime}</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Peak Window</Text>
            <Text style={styles.specVal}>{selectedHotspot.peakWindow}</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>Repeat Offenders</Text>
            <Text style={styles.specVal}>{selectedHotspot.repeatOffendersCount} Active</Text>
          </View>
        </View>
      </View>

      {/* AI Risk Forecast Card (Responsible AI Language) */}
      <View style={styles.aiForecastCard}>
        <View style={styles.aiHeader}>
          <Brain size={18} color="#0F4C81" />
          <Text style={styles.aiTitle}>AI Pattern-Based Risk Forecast</Text>
          <View style={styles.confBadge}>
            <Text style={styles.confText}>88% Confidence</Text>
          </View>
        </View>

        <Text style={styles.aiDesc}>
          "Historical and recent patterns indicate <Text style={{ fontFamily: "Inter-Bold", color: "#0F172A" }}>elevated vehicle-theft risk</Text> in {selectedHotspot.name} tonight between 9 PM and 12:30 AM."
        </Text>

        <View style={styles.responseBox}>
          <Text style={styles.respHeader}>RECOMMENDED POLICE RESPONSE:</Text>
          <Text style={styles.respBullet}>• Increase Patrol Visibility in primary parking sectors.</Text>
          <Text style={styles.respBullet}>• Review Repeat Offender Activity (Ravi S. & associates).</Text>
          <Text style={styles.respBullet}>• Monitor Nearby Hotspots & coordinate with {selectedHotspot.nearbyStation}.</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() =>
              onOpenExplainWhy &&
              onOpenExplainWhy({
                title: "WHY THIS GEOSPATIAL RISK WAS FORECASTED",
                queryOrContext: `Elevated Risk Forecast for ${selectedHotspot.name}`,
                confidenceScore: 88,
                sharedFIRs: ["FIR-2024-08431", "FIR-2024-08403"],
                commonLocations: [selectedHotspot.name, "Silk Board Junction"],
                explanationText: "Geospatial heat-density algorithms correlated 4 recent FIR reports with Friday night 21:00-00:30 window. Atmospheric & historical crime indicators show high structural similarity.",
              })
            }
          >
            <HelpCircle size={14} color="#0F4C81" />
            <Text style={styles.btnSecondaryText}>Explain Forecast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => onOpenFIR && onOpenFIR("FIR-2024-08431")}
          >
            <FileText size={14} color="#0F4C81" />
            <Text style={styles.btnSecondaryText}>Open Cases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => onOpenAIWorkspace && onOpenAIWorkspace(`Investigate risk forecast for ${selectedHotspot.name}`)}
          >
            <Brain size={14} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText}>Start AI Investigation</Text>
          </TouchableOpacity>
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
    marginBottom: 14,
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
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mapTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  mapSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  liveTag: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveTagText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#DC2626",
  },
  svgWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  sliderBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#0F4C81",
  },
  sliderTimeVal: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 12,
    color: "#0F172A",
  },
  sliderTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hourStep: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hourStepActive: {
    backgroundColor: "#0F4C81",
    borderColor: "#0F4C81",
  },
  hourStepText: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: "#475569",
  },
  hourStepTextActive: {
    color: "#FFFFFF",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  legItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legText: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#64748B",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  spotTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  spotSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  riskTag: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  riskTagText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderWidth: 2,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreVal: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#DC2626",
    lineHeight: 18,
  },
  scoreSub: {
    fontFamily: "Inter-Regular",
    fontSize: 8,
    color: "#DC2626",
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  specBox: {
    width: "47%",
  },
  specLabel: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#64748B",
  },
  specVal: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#0F172A",
  },
  aiForecastCard: {
    backgroundColor: "rgba(15, 76, 129, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(15, 76, 129, 0.2)",
    borderRadius: 16,
    padding: 14,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#0F4C81",
    flex: 1,
  },
  confBadge: {
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
  aiDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 10,
  },
  respHeader: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#0F4C81",
    marginBottom: 4,
  },
  responseBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginBottom: 12,
  },
  respBullet: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  btnSecondaryText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  btnPrimary: {
    flex: 1.5,
    backgroundColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  btnPrimaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
});
