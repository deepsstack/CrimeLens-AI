/**
 * components/investigation/CriminalNetworkPreview.tsx
 * CrimeLens AI — SVG criminal network graph preview card
 *
 * Renders a 2D node-edge graph using react-native-svg.
 * Nodes are color-coded by type via getNodeColor().
 * Edges are rendered first (behind nodes), nodes on top.
 * Nodes without explicit x/y are laid out in a circular arrangement.
 * "Open Full Network Analysis" button triggers onOpenFullView().
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  G,
} from "react-native-svg";
import { T, type Lang } from "../../i18n/investigationTranslations";
import { getNodeColor } from "../../utils/investigationUtils";
import type { NetworkGraphData, NetworkNode } from "../../data/investigationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CriminalNetworkPreviewProps = {
  lang: Lang;
  network: NetworkGraphData;
  onOpenFullView: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const POLICE_BLUE = "#0F4C81";
const NODE_RADIUS = 20;
const SVG_HEIGHT = 280;
const SCREEN_WIDTH = Dimensions.get("window").width;
// Card has marginHorizontal 16 + padding 16 on each side = 64px total horizontal space
const SVG_WIDTH = SCREEN_WIDTH - 64;

// ─── Layout Helpers ───────────────────────────────────────────────────────────

/**
 * For nodes missing explicit x/y coordinates, compute positions
 * evenly spaced around a circle centered in the SVG canvas.
 */
function computeNodePositions(
  nodes: NetworkGraphData["nodes"]
): Map<string, { x: number; y: number }> {
  const posMap = new Map<string, { x: number; y: number }>();

  // Collect nodes that need auto-positioning
  const nodesWithPos = nodes.filter((n) => n.x !== undefined && n.y !== undefined);
  const nodesWithoutPos = nodes.filter((n) => n.x === undefined || n.y === undefined);

  // Place nodes with explicit positions directly
  for (const node of nodesWithPos) {
    posMap.set(node.id, { x: node.x!, y: node.y! });
  }

  // Arrange remaining nodes in a circle
  if (nodesWithoutPos.length > 0) {
    const cx = SVG_WIDTH / 2;
    const cy = SVG_HEIGHT / 2;
    // Leave room for node radius + label text (12px below circle)
    const radius = Math.min(cx, cy) - NODE_RADIUS - 22;
    const angleStep = (2 * Math.PI) / nodesWithoutPos.length;

    nodesWithoutPos.forEach((node, i) => {
      const angle = -Math.PI / 2 + i * angleStep; // start from top
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });
  }

  return posMap;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type EdgeElementProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
};

function EdgeElement({ x1, y1, x2, y2, label }: EdgeElementProps) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <G>
      {/* Requirement 9.3 — edge line */}
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#D1D5DB"
        strokeWidth={1.5}
      />
      {/* Optional edge label at midpoint */}
      {label ? (
        <SvgText
          x={midX}
          y={midY - 4}
          fontSize={9}
          fill="#6B7280"
          textAnchor="middle"
          fontFamily={Platform.OS === "ios" ? "System" : "sans-serif"}
        >
          {label}
        </SvgText>
      ) : null}
    </G>
  );
}

type NodeElementProps = {
  node: NetworkNode;
  x: number;
  y: number;
};

function NodeElement({ node, x, y }: NodeElementProps) {
  // Requirement 9.2 — color from getNodeColor
  const fillColor = getNodeColor(node.type);

  // Truncate long labels to avoid overflow
  const displayLabel =
    node.label.length > 12 ? node.label.slice(0, 11) + "…" : node.label;

  return (
    <G>
      {/* Requirement 9.1 — colored circle node */}
      <Circle
        cx={x}
        cy={y}
        r={NODE_RADIUS}
        fill={fillColor}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      {/* Node label centered below the circle */}
      <SvgText
        x={x}
        y={y + NODE_RADIUS + 12}
        fontSize={10}
        fill={POLICE_BLUE}
        textAnchor="middle"
        fontFamily={Platform.OS === "ios" ? "System" : "sans-serif"}
        fontWeight="500"
      >
        {displayLabel}
      </SvgText>
    </G>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CriminalNetworkPreview({
  lang,
  network,
  onOpenFullView,
}: CriminalNetworkPreviewProps) {
  const t = T[lang];

  // Compute final x/y for every node (merge explicit + auto-layout)
  const posMap = useMemo(
    () => computeNodePositions(network.nodes),
    [network.nodes]
  );

  // Build a lookup from node id → node data for edge rendering
  const nodeById = useMemo(() => {
    const m = new Map<string, NetworkNode>();
    for (const node of network.nodes) {
      m.set(node.id, node);
    }
    return m;
  }, [network.nodes]);

  return (
    <View style={styles.card} accessibilityRole="none">
      {/* ── Title ──────────────────────────────────────────────────────── */}
      {/* Requirement 9.1 */}
      <Text style={styles.title}>{t.networkTitle}</Text>

      <View style={styles.divider} />

      {/* ── SVG Graph Canvas ───────────────────────────────────────────── */}
      {/* Requirements 9.1, 9.2, 9.3, 9.4 */}
      <View style={styles.svgContainer}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
          {/* ── Edges rendered FIRST (behind nodes) ── */}
          {network.edges.map((edge, i) => {
            const fromPos = posMap.get(edge.from);
            const toPos = posMap.get(edge.to);
            // Skip edges referencing unknown nodes
            if (!fromPos || !toPos) return null;

            return (
              <EdgeElement
                key={`edge-${i}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                label={edge.label}
              />
            );
          })}

          {/* ── Nodes rendered ON TOP of edges ── */}
          {network.nodes.map((node) => {
            const pos = posMap.get(node.id);
            if (!pos) return null;

            return (
              <NodeElement
                key={`node-${node.id}`}
                node={node}
                x={pos.x}
                y={pos.y}
              />
            );
          })}
        </Svg>
      </View>

      {/* ── Open Full Network Analysis Button ──────────────────────────── */}
      {/* Requirement 9.5 */}
      <TouchableOpacity
        style={styles.fullViewButton}
        onPress={onOpenFullView}
        accessibilityLabel={t.openFullNetwork}
        accessibilityRole="button"
        activeOpacity={0.85}
      >
        <Text style={styles.fullViewButtonText}>{t.openFullNetwork}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // White card, borderRadius 12, elevation 2, margin 16, padding 16
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  title: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 16,
    color: POLICE_BLUE,
    letterSpacing: 0.3,
    lineHeight: 22,
    marginBottom: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },

  svgContainer: {
    alignItems: "center",
    overflow: "hidden",
  },

  // Police Blue background, white text, borderRadius 8, padding 10, full width
  fullViewButton: {
    backgroundColor: POLICE_BLUE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  fullViewButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 0.2,
    lineHeight: 20,
  },
});
