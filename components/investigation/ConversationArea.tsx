/**
 * components/investigation/ConversationArea.tsx
 * CrimeLens AI — Scrollable conversation Q&A history
 *
 * Renders all messages in a ScrollView (not FlatList) so all content
 * mounts at once. Each message group animates in with 300 ms fade-in +
 * slide-up on mount (Animated.timing, useNativeDriver).
 *
 * When isProcessing === true, renders an animated three-dot typing
 * indicator at the bottom of the list.
 *
 * Auto-scrolls to bottom when messages.length changes. Also exposes
 * scrollToBottom() via useImperativeHandle on the forwarded ref.
 *
 * Requirements: 4.2, 4.3, 5.1 – 5.5, 15.2, 15.4, 20.1
 */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";

// ── Sub-components ────────────────────────────────────────────────────────────
import { QueryBubble } from "./QueryBubble";
import { AIResponseCard } from "./AIResponseCard";
import { InvestigationSummaryPanel } from "./InvestigationSummaryPanel";
import { ExplainableAICard } from "./ExplainableAICard";
import { CriminalNetworkPreview } from "./CriminalNetworkPreview";
import { InvestigationTimeline } from "./InvestigationTimeline";
import { AIRecommendationsSection } from "./AIRecommendationsSection";

// ── i18n ──────────────────────────────────────────────────────────────────────
import type { Lang } from "../../i18n/investigationTranslations";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Data payload attached to AI response messages.
 * Mirrors AIResponseData in AIInvestigationWorkspace.tsx.
 */
type AIResponseData = {
  confidenceScore: number;
  linkedEntities: {
    firs: Array<{
      number: string;
      crimeType: string;
      crimeTypeKn: string;
      district: string;
      districtKn: string;
      date: string;
    }>;
    offenders: Array<{
      id: string;
      name: string;
      priorConvictions: number;
      linkedFIRs: string[];
    }>;
    vehicles: Array<{
      registration: string;
      type: string;
      associatedFIRs: string[];
    }>;
    locations: string[];
  };
  summary?: any;
  explainability?: any;
  network?: any;
  timeline?: any;
  recommendations?: any[];
};

/** A single message in the conversation history */
type Message = {
  id: string;
  type: "query" | "response";
  text: string;
  timestamp: Date;
  data?: AIResponseData;
};

type ConversationAreaProps = {
  lang: Lang;
  messages: Message[];
  isProcessing: boolean;
  /** Called when the officer presses a recommendation action button */
  onRecommendationActionPress?: (recId: string) => void;
  /** Called when "Open Full Network Analysis" is pressed */
  onOpenFullNetwork?: () => void;
};

/** Handle exposed to parent via forwardRef */
export type ConversationAreaHandle = {
  scrollToBottom: () => void;
};

// ─── Animated message wrapper ─────────────────────────────────────────────────

/**
 * AnimatedMessageItem
 *
 * Wraps any message group and animates it into view on mount with a 300 ms
 * fade-in + slide-up transition using Animated.timing (no native driver for
 * translateY on older RN versions with layoutAnimation, but useNativeDriver
 * is safe here with opacity + transform).
 *
 * Requirement 15.4
 */
type AnimatedMessageItemProps = {
  children: React.ReactNode;
};

function AnimatedMessageItem({ children }: AnimatedMessageItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    // 300 ms fade-in + slide-up on mount
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
    >
      {children}
    </Animated.View>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

/**
 * TypingIndicator
 *
 * Three animated dots. Each dot fades in/out sequentially using
 * Animated.loop + Animated.sequence with staggered delays.
 *
 * Requirement 15.2
 */
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const makePulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          // wait for other dots to cycle before repeating
          Animated.delay(600 - delay > 0 ? 600 - delay : 0),
        ])
      );

    const a1 = makePulse(dot1, 0);
    const a2 = makePulse(dot2, 200);
    const a3 = makePulse(dot3, 400);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={typingStyles.row} accessibilityLabel="AI is processing" accessibilityRole="none">
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View
          key={i}
          style={[typingStyles.dot, { opacity: anim }]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F4C81",
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const ConversationArea = forwardRef<ConversationAreaHandle, ConversationAreaProps>(
  (
    {
      lang,
      messages,
      isProcessing,
      onRecommendationActionPress,
      onOpenFullNetwork,
    },
    ref
  ) => {
    const scrollViewRef = useRef<ScrollView>(null);

    // ── Expose scrollToBottom via imperative handle ─────────────────────────
    useImperativeHandle(ref, () => ({
      scrollToBottom() {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      },
    }));

    // ── Auto-scroll on new messages ─────────────────────────────────────────
    // Requirement 5.4
    useEffect(() => {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150); // short delay to let layout settle
      return () => clearTimeout(timer);
    }, [messages.length]);

    // ── Noop fallbacks ──────────────────────────────────────────────────────
    const handleRecommendationAction = onRecommendationActionPress ?? (() => {});
    const handleOpenNetwork = onOpenFullNetwork ?? (() => {});

    // ── Render ──────────────────────────────────────────────────────────────
    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Disable nested scrolling conflicts on Android
        nestedScrollEnabled
      >
        {messages.map((msg) => {
          if (msg.type === "query") {
            // ── Officer query bubble ──────────────────────────────────────
            // Requirement 5.1
            return (
              <AnimatedMessageItem key={msg.id}>
                <QueryBubble
                  text={msg.text}
                  timestamp={msg.timestamp}
                />
              </AnimatedMessageItem>
            );
          }

          // ── AI response group ───────────────────────────────────────────
          // Requirements 5.2, 5.3, 5.5
          const data = msg.data;
          if (!data) return null;

          return (
            <AnimatedMessageItem key={msg.id}>
              {/* AI Response Card — always rendered for response type */}
              {/* Requirement 5.2, 5.3, 6.x */}
              <AIResponseCard
                lang={lang}
                text={msg.text}
                timestamp={msg.timestamp}
                confidenceScore={data.confidenceScore}
                linkedEntities={data.linkedEntities}
              />

              {/* Investigation Summary Panel */}
              {/* Requirement 7.4 */}
              {data.summary ? (
                <InvestigationSummaryPanel
                  lang={lang}
                  summary={data.summary}
                />
              ) : null}

              {/* Explainable AI Card */}
              {/* Requirement 8.5 */}
              {data.explainability ? (
                <ExplainableAICard
                  lang={lang}
                  data={data.explainability}
                />
              ) : null}

              {/* Criminal Network Preview */}
              {/* Requirement 9.5 */}
              {data.network ? (
                <CriminalNetworkPreview
                  lang={lang}
                  network={data.network}
                  onOpenFullView={handleOpenNetwork}
                />
              ) : null}

              {/* Investigation Timeline */}
              {/* Requirement 10.4 */}
              {data.timeline && data.timeline.length > 0 ? (
                <InvestigationTimeline
                  lang={lang}
                  timeline={data.timeline}
                />
              ) : null}

              {/* AI Recommendations Section */}
              {/* Requirement 11.5 */}
              {data.recommendations && data.recommendations.length > 0 ? (
                <AIRecommendationsSection
                  lang={lang}
                  recommendations={data.recommendations}
                  onActionPress={handleRecommendationAction}
                />
              ) : null}
            </AnimatedMessageItem>
          );
        })}

        {/* AI typing indicator — shown while isProcessing === true */}
        {/* Requirement 15.2, 4.3 */}
        {isProcessing ? <TypingIndicator /> : null}
      </ScrollView>
    );
  }
);

ConversationArea.displayName = "ConversationArea";

export default ConversationArea;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
});
