import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import mockData, { District } from "../../data/mockData";
import { T, Lang } from "../../i18n/dashboardTranslations";

// Animated circle for pulsing hotspot markers
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type CrimeMapProps = {
  lang: Lang;
  districtsData?: District[];
};

// Grid layout constants
const CELL_SIZE = 60;
const GAP = 6;
const SVG_WIDTH = 4 * (CELL_SIZE + GAP) - GAP;   // 258
const SVG_HEIGHT = 4 * (CELL_SIZE + GAP) - GAP;   // 258

// Density colour mapping
const DENSITY_COLORS: Record<string, string> = {
  low:    "#BFDBFE",
  medium: "#FDE68A",
  high:   "#FECACA",
};

// Cell centre helpers
function cellCX(gridCol: number): number {
  return gridCol * (CELL_SIZE + GAP) + CELL_SIZE / 2;
}
function cellCY(gridRow: number): number {
  return gridRow * (CELL_SIZE + GAP) + CELL_SIZE / 2;
}

// Abbreviate district name to fit in a small cell
function abbrev(name: string): string {
  // Take first 6 characters if the name is long
  return name.length > 6 ? name.slice(0, 6) + "." : name;
}

// ── Pulsing circle component ──────────────────────────────────────────────────
function PulsingHotspot({ cx, cy }: { cx: number; cy: number }) {
  const radius  = useRef(new Animated.Value(8)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(radius,  { toValue: 14, duration: 800, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(radius,  { toValue: 8,  duration: 800, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: false }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [radius, opacity]);

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={radius}
      fill="#EF4444"
      opacity={opacity}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CrimeMap({ lang, districtsData }: CrimeMapProps): React.ReactElement {
  const t = T[lang];
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const districts = districtsData && districtsData.length > 0 ? districtsData : mockData.districts;
  const highDistricts = districts.filter((d) => d.density === "high");

  return (
    <View style={styles.card}>
      {/* Card title */}
      <Text style={styles.cardTitle}>{t.mapTitle}</Text>

      {/* SVG Karnataka district grid */}
      <View style={styles.mapWrapper}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
          {/* District cells */}
          {districts.map((d) => {
            const x = d.gridCol * (CELL_SIZE + GAP);
            const y = d.gridRow * (CELL_SIZE + GAP);
            return (
              <Rect
                key={d.id}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={6}
                fill={DENSITY_COLORS[d.density] ?? "#E5E7EB"}
                onPress={() => setSelectedDistrict(d)}
              />
            );
          })}

          {/* Pulsing hotspot circles over high-density districts */}
          {highDistricts.map((d) => (
            <PulsingHotspot
              key={`hotspot-${d.id}`}
              cx={cellCX(d.gridCol)}
              cy={cellCY(d.gridRow)}
            />
          ))}
        </Svg>

        {/* District name labels rendered as RN Text overlaid on the SVG */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {mockData.districts.map((d) => {
            const x = d.gridCol * (CELL_SIZE + GAP);
            const y = d.gridRow * (CELL_SIZE + GAP);
            return (
              <View
                key={`label-${d.id}`}
                style={[
                  styles.cellLabelContainer,
                  { left: x, top: y, width: CELL_SIZE, height: CELL_SIZE },
                ]}
              >
                <Text style={styles.cellLabel} numberOfLines={2}>
                  {abbrev(lang === "kn" ? d.nameKn : d.name)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Tap targets as transparent TouchableOpacity overlays */}
        <View style={StyleSheet.absoluteFill}>
          {mockData.districts.map((d) => {
            const x = d.gridCol * (CELL_SIZE + GAP);
            const y = d.gridRow * (CELL_SIZE + GAP);
            return (
              <TouchableOpacity
                key={`tap-${d.id}`}
                style={[
                  styles.tapTarget,
                  { left: x, top: y, width: CELL_SIZE, height: CELL_SIZE },
                ]}
                onPress={() => setSelectedDistrict(d)}
                activeOpacity={0.7}
              />
            );
          })}
        </View>
      </View>

      {/* Density legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: DENSITY_COLORS.low }]} />
          <Text style={styles.legendLabel}>{t.mapLegendLow}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: DENSITY_COLORS.medium }]} />
          <Text style={styles.legendLabel}>{t.mapLegendMedium}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: DENSITY_COLORS.high }]} />
          <Text style={styles.legendLabel}>{t.mapLegendHigh}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.hotspotSwatch]} />
          <Text style={styles.legendLabel}>{t.mapHotspot}</Text>
        </View>
      </View>

      {/* Selected district overlay card */}
      {selectedDistrict !== null && (
        <View style={styles.overlayCard}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayTitle}>
              {lang === "kn" ? selectedDistrict.nameKn : selectedDistrict.name}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedDistrict(null)}
              style={styles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeButtonText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.overlayRow}>
            <Text style={styles.overlayLabel}>{t.mapDistrictCrimes}:</Text>
            <Text style={styles.overlayValue}>
              {selectedDistrict.crimeCount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.overlayRow}>
            <Text style={styles.overlayLabel}>{t.mapTopCategory}:</Text>
            <Text style={styles.overlayValue}>{selectedDistrict.topCategory}</Text>
          </View>
          <View style={styles.overlayRow}>
            <Text style={styles.overlayLabel}>{t.mapDensityLabel}:</Text>
            <View
              style={[
                styles.densityBadge,
                { backgroundColor: DENSITY_COLORS[selectedDistrict.density] },
              ]}
            >
              <Text style={styles.densityBadgeText}>
                {selectedDistrict.density === "low"
                  ? t.mapLegendLow
                  : selectedDistrict.density === "medium"
                  ? t.mapLegendMedium
                  : t.mapLegendHigh}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#0F4C81",
    marginBottom: 12,
  },
  mapWrapper: {
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
    alignSelf: "center",
  },
  cellLabelContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cellLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 8,
    color: "#1E3A5F",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  tapTarget: {
    position: "absolute",
    backgroundColor: "transparent",
    borderRadius: 6,
  },
  // Legend
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  hotspotSwatch: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
    borderRadius: 7,
  },
  legendLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#64748B",
  },
  // Overlay card
  overlayCard: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  overlayTitle: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 15,
    color: "#0F4C81",
    flex: 1,
  },
  closeButton: {
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  closeButtonText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#FFFFFF",
  },
  overlayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  overlayLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#64748B",
    width: 100,
  },
  overlayValue: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
  },
  densityBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  densityBadgeText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: "#374151",
  },
});
