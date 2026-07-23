/**
 * screens/NetworkScreen.tsx
 * CrimeLens AI — Criminal Network Analysis Screen
 */

import React, { useState, useEffect } from "react";
import {
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
  Network,
  Search,
  Filter,
  User,
  FileText,
  Car,
  Phone,
  MapPin,
  Shield,
  Tag,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Brain,
  ChevronRight,
  HelpCircle,
  X,
  Layers,
} from "lucide-react-native";
import Svg, { Line, Circle, G, Text as SvgText, Rect } from "react-native-svg";
import {
  getAllAccused,
  getCriminalNetwork,
  type Accused,
  type CriminalNetworkResponse,
} from "../services/crimelensApi";

export type NetworkScreenProps = {
  lang?: "en" | "kn";
  onOpenExplainWhy?: (data: any) => void;
  onOpenAccusedProfile?: (name: string) => void;
  onOpenFIR?: (firNumber: string) => void;
  onOpenAIWorkspace?: (query?: string) => void;
};

export type EntityType =
  | "Accused"
  | "FIR"
  | "Victim"
  | "Vehicle"
  | "Mobile"
  | "Location"
  | "Police Station"
  | "Crime Category";

export function NetworkScreen({
  lang = "en",
  onOpenExplainWhy,
  onOpenAccusedProfile,
  onOpenFIR,
  onOpenAIWorkspace,
}: NetworkScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("Ravi S.");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [catalystNetwork, setCatalystNetwork] = useState<CriminalNetworkResponse | null>(null);

  // Default fallback nodes
  const defaultNodes = [
    { id: "ravi", label: "Ravi S.", type: "Accused", x: 160, y: 150, risk: "HIGH", color: "#EF4444" },
    { id: "suresh", label: "Suresh K.", type: "Accused", x: 260, y: 90, risk: "HIGH", color: "#EF4444" },
    { id: "fir1", label: "FIR-2024-08431", type: "FIR", x: 60, y: 80, risk: "CRITICAL", color: "#0F4C81" },
    { id: "fir2", label: "FIR-2023-01981", type: "FIR", x: 60, y: 150, risk: "HIGH", color: "#0F4C81" },
    { id: "fir3", label: "FIR-2022-00411", type: "FIR", x: 60, y: 220, risk: "MEDIUM", color: "#0F4C81" },
    { id: "vehicle", label: "KA-01-AB-1234", type: "Vehicle", x: 260, y: 170, risk: "SUSPECT", color: "#F59E0B" },
    { id: "mobile", label: "Ending 7842", type: "Mobile", x: 250, y: 240, risk: "INFO", color: "#10B981" },
    { id: "location", label: "City Market", type: "Location", x: 160, y: 260, risk: "HOTSPOT", color: "#8B5CF6" },
    { id: "crime", label: "Vehicle Theft", type: "Crime Category", x: 160, y: 40, risk: "CATEGORY", color: "#06B6D4" },
  ];

  const defaultEdges = [
    { from: "ravi", to: "fir1" },
    { from: "ravi", to: "fir2" },
    { from: "ravi", to: "fir3" },
    { from: "ravi", to: "suresh" },
    { from: "ravi", to: "vehicle" },
    { from: "ravi", to: "mobile" },
    { from: "ravi", to: "location" },
    { from: "ravi", to: "crime" },
    { from: "suresh", to: "vehicle" },
    { from: "suresh", to: "fir1" },
  ];

  // Load network from Catalyst when screen mounts or search query changes
  useEffect(() => {
    let mounted = true;
    async function loadNetworkData() {
      setLoadingNetwork(true);
      try {
        const accusedListRes = await getAllAccused();
        if (accusedListRes.success && accusedListRes.data.length > 0) {
          const queryText = searchQuery.toLowerCase().trim();
          let target = accusedListRes.data[0];
          if (queryText) {
            const matched = accusedListRes.data.find(
              (a) =>
                a.FULL_NAME.toLowerCase().includes(queryText) ||
                (a.ALIAS_NAME && a.ALIAS_NAME.toLowerCase().includes(queryText))
            );
            if (matched) target = matched;
          }

          const netRes = await getCriminalNetwork(target.ACCUSED_ID);
          if (mounted && netRes.success) {
            setCatalystNetwork(netRes);
            setSelectedEntity(netRes.sourceAccused.FULL_NAME);
          }
        }
      } catch (err) {
        console.error("Failed to fetch criminal network from Catalyst:", err);
      } finally {
        if (mounted) setLoadingNetwork(false);
      }
    }
    loadNetworkData();
    return () => {
      mounted = false;
    };
  }, [searchQuery]);

  // Construct dynamic graph from Catalyst network
  let nodes = defaultNodes;
  let edges = defaultEdges;

  if (catalystNetwork && catalystNetwork.sourceAccused) {
    const src = catalystNetwork.sourceAccused;
    const rels = catalystNetwork.relationships || [];

    const dynamicNodes: typeof defaultNodes = [
      {
        id: `node-${src.ACCUSED_ID}`,
        label: src.FULL_NAME,
        type: "Accused",
        x: 160,
        y: 140,
        risk: src.RISK_LEVEL ?? "HIGH",
        color: "#EF4444",
      },
    ];

    const dynamicEdges: typeof defaultEdges = [];

    // Radial layout around center (160, 140)
    const centerX = 160;
    const centerY = 140;
    const radius = 100;
    const count = rels.length;

    rels.forEach((rel, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, count);
      const nx = Math.round(centerX + radius * Math.cos(angle));
      const ny = Math.round(centerY + radius * Math.sin(angle));
      const conn = rel.connectedAccused;
      const nodeId = `node-${conn.ACCUSED_ID}`;

      dynamicNodes.push({
        id: nodeId,
        label: conn.FULL_NAME,
        type: "Accused",
        x: Math.max(30, Math.min(290, nx)),
        y: Math.max(30, Math.min(250, ny)),
        risk: conn.RISK_LEVEL ?? "MEDIUM",
        color: conn.RISK_LEVEL === "HIGH" ? "#EF4444" : "#F59E0B",
      });

      dynamicEdges.push({
        from: `node-${src.ACCUSED_ID}`,
        to: nodeId,
      });

      // Add FIR node if related FIR is present
      if (rel.relationship.relatedFir) {
        const firNodeId = `fir-${rel.relationship.relatedFir}`;
        if (!dynamicNodes.some((n) => n.id === firNodeId)) {
          dynamicNodes.push({
            id: firNodeId,
            label: rel.relationship.relatedFir,
            type: "FIR",
            x: Math.max(30, Math.min(290, nx + 25)),
            y: Math.max(30, Math.min(250, ny + 20)),
            risk: "HIGH",
            color: "#0F4C81",
          });
          dynamicEdges.push({ from: nodeId, to: firNodeId });
        }
      }
    });

    nodes = dynamicNodes;
    edges = dynamicEdges;
  }

  const selectedNodeData = nodes.find((n) => n.label === selectedEntity) || nodes[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Title Bar */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <Network size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Criminal Network Analysis</Text>
            <Text style={styles.screenSub}>Discover hidden relationships across crime records</Text>
          </View>
        </View>
      </View>

      {/* Universal Network Search */}
      <View style={styles.searchBox}>
        <Search size={16} color="#0F4C81" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search accused, FIR, mobile number, vehicle or location..."
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltersOpen(!filtersOpen)}>
          <Filter size={16} color="#0F4C81" />
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {filtersOpen && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterPanelTitle}>NETWORK GRAPH FILTERS</Text>
          <View style={styles.filterGrid}>
            <Text style={styles.filterSub}>Entity Type: Accused · FIR · Vehicle · Location</Text>
            <Text style={styles.filterSub}>Relationship Depth: 1st & 2nd Degree Links</Text>
            <Text style={styles.filterSub}>District: Bengaluru City · Mysuru</Text>
          </View>
        </View>
      )}

      {/* Interactive Network Graph Box (WOW Component) */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View style={styles.graphTitleRow}>
            <Text style={styles.graphTitle}>Syndicate Relationship Graph</Text>
            <View style={styles.liveChip}>
              <Text style={styles.liveChipText}>9 ENTITIES CONNECTED</Text>
            </View>
          </View>

          {/* Graph Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}>
              <ZoomIn size={14} color="#0F4C81" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}>
              <ZoomOut size={14} color="#0F4C81" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => setZoomLevel(1)}>
              <RotateCcw size={14} color="#0F4C81" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn}>
              <Maximize2 size={14} color="#0F4C81" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SVG Network Canvas */}
        <View style={styles.svgWrapper}>
          <Svg width="100%" height="280" viewBox="0 0 320 280">
            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from)!;
              const toNode = nodes.find((n) => n.id === edge.to)!;
              return (
                <Line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={fromNode.id === "ravi" && toNode.id === "suresh" ? "#EF4444" : "#CBD5E1"}
                  strokeWidth={fromNode.id === "ravi" && toNode.id === "suresh" ? "2.5" : "1.5"}
                  strokeDasharray={edge.from === "suresh" ? "4,4" : undefined}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = node.label === selectedEntity;
              const r = isSelected ? 22 : 18;

              return (
                <G key={node.id} onPress={() => setSelectedEntity(node.label)}>
                  {/* Outer aura ring if selected */}
                  {isSelected && (
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 6}
                      fill="rgba(15, 76, 129, 0.15)"
                      stroke="#0F4C81"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Main Node Circle */}
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={node.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* Label Text */}
                  <SvgText
                    x={node.x}
                    y={node.y + r + 12}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#0F172A"
                    textAnchor="middle"
                  >
                    {node.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>

        {/* Network Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendHeader}>ENTITY LEGEND:</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.legendLabel}>Accused</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#0F4C81" }]} />
              <Text style={styles.legendLabel}>FIR</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.legendLabel}>Vehicle</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.legendLabel}>Mobile</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#8B5CF6" }]} />
              <Text style={styles.legendLabel}>Location</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: "#06B6D4" }]} />
              <Text style={styles.legendLabel}>Category</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Node Details Panel */}
      <View style={styles.nodeCard}>
        <View style={styles.nodeHeader}>
          <View style={styles.nodeTitleRow}>
            <User size={18} color="#EF4444" />
            <Text style={styles.nodeTitle}>{selectedNodeData.label}</Text>
            <View style={styles.riskTag}>
              <Text style={styles.riskTagText}>{selectedNodeData.risk} RISK</Text>
            </View>
          </View>
          <Text style={styles.nodeSub}>Selected Central Node Entity</Text>
        </View>

        <View style={styles.specGrid}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Previous FIRs</Text>
            <Text style={styles.specVal}>6 Cases</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Known Associates</Text>
            <Text style={styles.specVal}>4 Identified</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Active Districts</Text>
            <Text style={styles.specVal}>3 (Blr, Mys, Tum)</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Last Incident</Text>
            <Text style={styles.specVal}>2 Days Ago</Text>
          </View>
        </View>

        <View style={styles.nodeActions}>
          <TouchableOpacity
            style={styles.nodeBtnPrimary}
            onPress={() => onOpenAccusedProfile && onOpenAccusedProfile(selectedNodeData.label)}
          >
            <User size={14} color="#FFFFFF" />
            <Text style={styles.nodeBtnPrimaryText}>View Full Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nodeBtnSecondary}
            onPress={() => onOpenAIWorkspace && onOpenAIWorkspace(`Investigate network for ${selectedNodeData.label}`)}
          >
            <Brain size={14} color="#0F4C81" />
            <Text style={styles.nodeBtnSecondaryText}>Investigate AI</Text>
          </TouchableOpacity>

          {selectedNodeData.type === "FIR" && (
            <TouchableOpacity
              style={styles.nodeBtnSecondary}
              onPress={() => onOpenFIR && onOpenFIR(selectedNodeData.label)}
            >
              <FileText size={14} color="#0F4C81" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* AI Network Intelligence Card */}
      <View style={styles.aiNetworkCard}>
        <View style={styles.aiHeader}>
          <Brain size={18} color="#0F4C81" />
          <Text style={styles.aiTitle}>AI Hidden Relationship Discovery</Text>
          <View style={styles.confBadge}>
            <Text style={styles.confText}>94% Confidence</Text>
          </View>
        </View>

        <Text style={styles.aiText}>
          "Ravi S. and Suresh K. appear across three separate FIRs involving the same vehicle (KA-01-AB-1234) and overlapping location patterns near Bengaluru City Market."
        </Text>

        <View style={styles.evidenceRow}>
          <Text style={styles.evidenceText}>✔ 3 Shared FIRs</Text>
          <Text style={styles.evidenceText}>✔ 1 Common Vehicle</Text>
          <Text style={styles.evidenceText}>✔ 2 Overlapping Locations</Text>
        </View>

        <View style={styles.aiActionsRow}>
          <TouchableOpacity
            style={styles.explainBtn}
            onPress={() =>
              onOpenExplainWhy &&
              onOpenExplainWhy({
                title: "WHY THIS CRIMINAL CONNECTION WAS DISCOVERED",
                queryOrContext: "Ravi S. & Suresh K. Syndicate Link",
                confidenceScore: 94,
                sharedFIRs: ["FIR-2024-08431", "FIR-2023-01981", "FIR-2022-00411"],
                commonVehicle: "KA-01-AB-1234",
                commonLocations: ["Bengaluru City Market", "Electronic City"],
                explanationText: "Graph link prediction algorithms identified structural co-occurrence across 3 independent case files over 24 months. Vehicle registration matches co-accused ownership records.",
              })
            }
          >
            <HelpCircle size={14} color="#0F4C81" />
            <Text style={styles.explainBtnText}>Explain Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => onOpenAIWorkspace && onOpenAIWorkspace("Start full syndicate investigation for Ravi S. and Suresh K.")}
          >
            <Brain size={14} color="#FFFFFF" />
            <Text style={styles.startBtnText}>Start Investigation</Text>
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
    marginBottom: 12,
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#0F172A",
  },
  filterBtn: {
    padding: 4,
  },
  filterPanel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  filterPanelTitle: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#0F4C81",
    marginBottom: 6,
  },
  filterGrid: {
    gap: 4,
  },
  filterSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  graphCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  graphHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  graphTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  graphTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  liveChip: {
    backgroundColor: "rgba(15, 76, 129, 0.1)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveChipText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#0F4C81",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 4,
  },
  ctrlBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  svgWrapper: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  legendContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  legendHeader: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: "#475569",
  },
  nodeCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  nodeHeader: {
    marginBottom: 10,
  },
  nodeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nodeTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  nodeSub: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  riskTag: {
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  riskTagText: {
    fontFamily: "Inter-Bold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  specItem: {
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
  nodeActions: {
    flexDirection: "row",
    gap: 8,
  },
  nodeBtnPrimary: {
    flex: 2,
    backgroundColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nodeBtnPrimaryText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  nodeBtnSecondary: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  nodeBtnSecondaryText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#0F4C81",
  },
  aiNetworkCard: {
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
  aiText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  evidenceText: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: "#0F4C81",
  },
  aiActionsRow: {
    flexDirection: "row",
    gap: 8,
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
  startBtn: {
    flex: 1,
    backgroundColor: "#0F4C81",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  startBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
});
