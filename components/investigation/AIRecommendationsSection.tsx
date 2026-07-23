/**
 * components/investigation/AIRecommendationsSection.tsx
 * CrimeLens AI — AI Recommendations Section
 *
 * Displays AI-generated investigation recommendations.
 *
 * IMPORTANT:
 * Recommendation buttons now directly trigger the real
 * action handler supplied by AIInvestigationWorkspace.
 *
 * The old "Action confirmed." toast has been removed.
 */

import React, {
  useCallback,
} from "react";


import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

import {
  T,
  type Lang,
} from "../../i18n/investigationTranslations";

import type {
  Recommendation,
} from "../../data/investigationMockData";

// ======================================================
// TYPES
// ======================================================

export type AIRecommendationsSectionProps = {
  lang: Lang;

  recommendations:
  Recommendation[];

  onActionPress:
  (
    recommendationId: string
  ) => void;
};

// ======================================================
// PRIORITY COLORS
// ======================================================

function getPriorityColor(
  priority: string
): string {

  const normalized =
    String(
      priority ?? ""
    )
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "high"
  ) {

    return "#EF4444";

  }

  if (
    normalized ===
    "medium"
  ) {

    return "#F59E0B";

  }

  return "#10B981";
}

// ======================================================
// TRANSLATION / RAW-TEXT HELPER
// ======================================================

function getDisplayText(
  t: Record<string, any>,
  key: string
): string {

  if (
    !key
  ) {
    return "";
  }

  const translated =
    t[key];

  if (
    typeof translated ===
    "string"
  ) {

    return translated;

  }

  // Real Catalyst-derived recommendations currently
  // provide readable English text directly in titleKey,
  // descKey and actionLabelKey.
  //
  // If no translation exists, display that raw text.
  return key;
}

// ======================================================
// RECOMMENDATION CARD
// ======================================================

type RecommendationCardProps = {
  recommendation:
  Recommendation;

  t:
  Record<string, any>;

  onActionPress:
  (
    recommendationId: string
  ) => void;
};

function RecommendationCard({
  recommendation,
  t,
  onActionPress,
}: RecommendationCardProps) {

  const priorityColor =
    getPriorityColor(
      recommendation.priority
    );

  // ===================================================
  // DISPLAY TEXT
  // ===================================================

  const title =
    getDisplayText(
      t,
      recommendation.titleKey
    );

  const description =
    getDisplayText(
      t,
      recommendation.descKey
    );

  const actionLabel =
    getDisplayText(
      t,
      recommendation.actionLabelKey
    );

  // ===================================================
  // ACTION
  //
  // IMPORTANT:
  // We no longer display the old "Action confirmed."
  // toast here.
  //
  // The recommendation ID is passed directly to the
  // workspace, where the actual action is handled.
  // ===================================================

  const handlePress =
    useCallback(
      () => {

        onActionPress(
          recommendation.id
        );

      },
      [
        onActionPress,
        recommendation.id,
      ]
    );

  return (

    <View
      style={
        styles.recommendationCard
      }
    >

      {/* =============================================
          PRIORITY BADGE
      ============================================== */}

      <View
        style={[
          styles.priorityBadge,

          {
            backgroundColor:
              priorityColor,
          },
        ]}
      >

        <Text
          style={
            styles.priorityBadgeText
          }
        >

          {recommendation.priority}

        </Text>

      </View>

      {/* =============================================
          TITLE
      ============================================== */}

      <Text
        style={
          styles.recommendationTitle
        }
      >

        {title}

      </Text>

      {/* =============================================
          DESCRIPTION
      ============================================== */}

      <Text
        style={
          styles.recommendationDescription
        }
      >

        {description}

      </Text>

      {/* =============================================
          ACTION BUTTON
      ============================================== */}

      <TouchableOpacity

        style={[
          styles.actionButton,

          {
            borderColor:
              priorityColor,
          },
        ]}

        onPress={
          handlePress
        }

        activeOpacity={
          0.8
        }

        accessibilityRole="button"

        accessibilityLabel={
          actionLabel
        }

      >

        <Text
          style={[
            styles.actionButtonText,

            {
              color:
                priorityColor,
            },
          ]}
        >

          {actionLabel}

        </Text>

      </TouchableOpacity>

    </View>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export function AIRecommendationsSection({
  lang,
  recommendations,
  onActionPress,
}: AIRecommendationsSectionProps) {

  const t =
    T[lang] as Record<
      string,
      any
    >;

  // ===================================================
  // DO NOT DISPLAY EMPTY SECTION
  // ===================================================

  if (
    !recommendations ||
    recommendations.length ===
    0
  ) {

    return null;

  }

  return (

    <View
      style={
        styles.container
      }
      accessibilityRole="none"
    >

      {/* =============================================
          SECTION TITLE
      ============================================== */}

      <Text
        style={
          styles.sectionTitle
        }
      >

        {t.recommendationsTitle ??
          "AI Recommendations"}

      </Text>

      {/* =============================================
          DIVIDER
      ============================================== */}

      <View
        style={
          styles.divider
        }
      />

      {/* =============================================
          RECOMMENDATIONS GRID
      ============================================== */}

      <View
        style={
          styles.grid
        }
      >

        {recommendations.map(
          (
            recommendation
          ) => (

            <RecommendationCard

              key={
                recommendation.id
              }

              recommendation={
                recommendation
              }

              t={
                t
              }

              onActionPress={
                onActionPress
              }

            />

          )
        )}

      </View>

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({

    // ==================================================
    // MAIN CARD
    // ==================================================

    container: {

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        12,

      marginHorizontal:
        16,

      marginVertical:
        8,

      padding:
        16,

      ...Platform.select({

        ios: {

          shadowColor:
            "#000",

          shadowOffset: {
            width:
              0,

            height:
              2,
          },

          shadowOpacity:
            0.08,

          shadowRadius:
            4,

        },

        android: {

          elevation:
            2,

        },

      }),

    },

    // ==================================================
    // TITLE
    // ==================================================

    sectionTitle: {

      fontFamily:
        "Rajdhani-Bold",

      fontSize:
        18,

      color:
        "#0F4C81",

      letterSpacing:
        0.3,

      lineHeight:
        24,

      marginBottom:
        2,

    },

    // ==================================================
    // DIVIDER
    // ==================================================

    divider: {

      height:
        1,

      backgroundColor:
        "#E2E8F0",

      marginVertical:
        12,

    },

    // ==================================================
    // GRID
    // ==================================================

    grid: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

    },

    // ==================================================
    // RECOMMENDATION CARD
    // ==================================================

    recommendationCard: {

      width:
        "48%",

      marginBottom:
        20,

      paddingHorizontal:
        0,

      paddingVertical:
        4,

    },

    // ==================================================
    // PRIORITY BADGE
    // ==================================================

    priorityBadge: {

      alignSelf:
        "flex-start",

      borderRadius:
        8,

      paddingHorizontal:
        9,

      paddingVertical:
        4,

      marginBottom:
        10,

    },

    priorityBadgeText: {

      fontFamily:
        "Inter-Bold",

      fontSize:
        12,

      color:
        "#FFFFFF",

      lineHeight:
        16,

    },

    // ==================================================
    // RECOMMENDATION TITLE
    // ==================================================

    recommendationTitle: {

      fontFamily:
        "Rajdhani-Bold",

      fontSize:
        15,

      color:
        "#0F4C81",

      lineHeight:
        20,

      marginBottom:
        7,

    },

    // ==================================================
    // DESCRIPTION
    // ==================================================

    recommendationDescription: {

      fontFamily:
        "Inter-Regular",

      fontSize:
        13,

      color:
        "#475569",

      lineHeight:
        19,

      marginBottom:
        12,

    },

    // ==================================================
    // ACTION BUTTON
    // ==================================================

    actionButton: {

      borderWidth:
        1,

      borderRadius:
        8,

      paddingVertical:
        8,

      paddingHorizontal:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        "auto",

    },

    actionButtonText: {

      fontFamily:
        "Inter-SemiBold",

      fontSize:
        13,

      lineHeight:
        18,

      textAlign:
        "center",

    },

  });