import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet, View, Text, TouchableOpacity, TextInput,
  Modal, Pressable, Animated, Easing, KeyboardAvoidingView,
  Platform, ScrollView
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Rajdhani_600SemiBold, Rajdhani_700Bold } from "@expo-google-fonts/rajdhani";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import {
  Eye, EyeOff, ChevronDown, Globe, ArrowRight,
  ChevronLeft, Fingerprint, MapPin, Network, Brain,
  FileText, Lock, User, AlertCircle, Shield, Activity, Zap
} from "lucide-react-native";
import Svg2, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon } from "react-native-svg";
import { DashboardScreen } from "./screens/DashboardScreen";
import { AIInvestigationWorkspace } from "./screens/AIInvestigationWorkspace";

type ScreenState = "splash" | "onboarding" | "login" | "dashboard" | "investigation";
type Lang = "en" | "kn";
export type UserRole = "investigator" | "analyst" | "senior_officer" | "administrator";

/* ── Translations ─────────────────────────── */
const T = {
  en: {
    secureSignIn: "Secure Sign In",
    kspSubtitle: "KARNATAKA STATE POLICE",
    badge: "Badge / Username",
    badgePlaceholder: "KSP badge number or username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    role: "Role",
    selectRole: "Select your role",
    language: "Interface Language",
    forgot: "Forgot password?",
    signIn: "Sign In Securely",
    authenticating: "Authenticating…",
    errorMsg: "Badge number, password, and role are required.",
    accessGranted: "Access Granted",
    loadingDash: "Welcome back. Loading your intelligence dashboard…",
    tls: "TLS 256-bit · Audit Logged · Session Protected",
    selectRoleTitle: "Select Your Role",
    selectLangTitle: "Select Interface Language",
    accessPlatform: "Access Platform",
    restriction: "Restricted access · Karnataka State Police · IT Act 2000",
  },
  kn: {
    secureSignIn: "ಸುರಕ್ಷಿತ ಸೈನ್ ಇನ್",
    kspSubtitle: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್",
    badge: "ಬ್ಯಾಡ್ಜ್ / ಬಳಕೆದಾರ ಹೆಸರು",
    badgePlaceholder: "KSP ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆ ಅಥವಾ ಬಳಕೆದಾರ ಹೆಸರು",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    role: "ಪಾತ್ರ",
    selectRole: "ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ",
    language: "ಇಂಟರ್ಫೇಸ್ ಭಾಷೆ",
    forgot: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?",
    signIn: "ಸುರಕ್ಷಿತವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    authenticating: "ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ…",
    errorMsg: "ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆ, ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಪಾತ್ರ ಅಗತ್ಯ.",
    accessGranted: "ಪ್ರವೇಶ ಮಂಜೂರು",
    loadingDash: "ಸ್ವಾಗತ. ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    tls: "TLS 256-bit · ಆಡಿಟ್ ಲಾಗ್ · ಸೆಷನ್ ಸಂರಕ್ಷಿತ",
    selectRoleTitle: "ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ",
    selectLangTitle: "ಇಂಟರ್ಫೇಸ್ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    accessPlatform: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಪ್ರವೇಶಿಸಿ",
    restriction: "ಸೀಮಿತ ಪ್ರವೇಶ · ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ · IT ಕಾಯ್ದೆ 2000",
  },
};

const SLIDES = [
  { icon: Brain, color: "#3B82F6", bg: "rgba(59,130,246,0.12)", title: "Ask in Your Language", subtitle: "Query crime data in English or Kannada — type or speak. Get instant answers with source citations.", tag: "AI COPILOT" },
  { icon: Network, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", title: "Uncover Hidden Networks", subtitle: "Visualise criminal syndicates spanning multiple districts. Discover kingpins that conventional searches miss.", tag: "CRIMINAL NETWORK" },
  { icon: MapPin, color: "#10B981", bg: "rgba(16,185,129,0.12)", title: "Predict Crime Before It Happens", subtitle: "AI-powered risk zones on live maps. Know where to deploy patrols before incidents occur.", tag: "HOTSPOT INTELLIGENCE" },
  { icon: FileText, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", title: "Reports in Seconds", subtitle: "AI compiles full investigation summaries with accused history, timeline, and recommendations — export to PDF instantly.", tag: "SMART REPORTS" },
];

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: "investigator", label: "Field Investigator", icon: "🔍" },
  { value: "analyst", label: "Crime Analyst", icon: "📊" },
  { value: "senior_officer", label: "Senior Police Officer", icon: "⭐" },
  { value: "administrator", label: "Administrator", icon: "⚙️" },
];
const LANGS = [
  { value: "en", label: "English", native: "English" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

/* ── KSP Police Badge (SVG) ───────────────── */
function KSPBadge({ size = 64 }: { size?: number }) {
  return (
    <Svg2 width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <SvgLinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1E7FD8" />
          <Stop offset="100%" stopColor="#0A3A6B" />
        </SvgLinearGradient>
        <SvgLinearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
        </SvgLinearGradient>
      </Defs>
      {/* 8-point star badge */}
      <Polygon
        points="40,2 46,28 70,28 51,44 58,70 40,55 22,70 29,44 10,28 34,28"
        fill="url(#bg)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
      />
      {/* Inner circle */}
      <Circle cx="40" cy="40" r="17" fill="rgba(4,10,22,0.65)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Shield silhouette */}
      <Path
        d="M40 24 C40 24 29 28.5 29 37 C29 44.5 34.5 50 40 52 C45.5 50 51 44.5 51 37 C51 28.5 40 24 40 24Z"
        fill="url(#shine)"
      />
      {/* Horizontal divider on shield */}
      <Path d="M31 38 Q40 40 49 38" stroke="rgba(10,58,107,0.5)" strokeWidth="1.2" fill="none" />
    </Svg2>
  );
}

/* ── Pulse ring ───────────────────────────── */
function PulseRing({ delay }: { delay: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.55, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ])
    ])).start();
  }, []);
  return <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />;
}

/* ══════════════════════════════════════════ */
/*  SCREEN 1 — SPLASH                         */
/* ══════════════════════════════════════════ */
function SplashScreen({ onNext, lang }: { onNext: () => void; lang: Lang }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }).start();
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const { height, width } = require("react-native").Dimensions.get("window");

  const stats = [
    { icon: Activity, value: "2.4M+", label: "Cases" },
    { icon: Zap, value: "<1s", label: "Speed" },
    { icon: Shield, value: "100%", label: "Secure" },
  ];

  return (
    <View style={styles.splashContainer}>

      {/* Glow — centered at 18% */}
      <View style={[styles.ambientGlow, { top: height * 0.18 - 100, left: width / 2 - 100 }]} />

      {/* Badge — center aligned with glow center */}
      <View style={[styles.badgeAbsolute, { top: height * 0.18 - 55 }]}>
        <PulseRing delay={0} />
        <PulseRing delay={900} />
        <PulseRing delay={1800} />
        <Animated.View style={[styles.orbitRing, { transform: [{ rotate }] }]} />
        <LinearGradient
          colors={["#0D2A4A", "#0F4C81"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.badgeCircle}
        >
          <KSPBadge size={64} />
        </LinearGradient>
      </View>

      {/* Text block — at ~37% from top */}
      <Animated.View style={[styles.splashTextBlock, { top: height * 0.37, opacity: fadeAnim }]}>
        <View style={styles.orgTag}>
          <View style={styles.orgDot} />
          <Text style={styles.orgTagText}>KARNATAKA STATE POLICE · CLASSIFIED</Text>
        </View>
        <Text style={styles.splashTitle}>
          CrimeLens<Text style={{ color: "#3B82F6" }}> AI</Text>
        </Text>
        <Text style={styles.splashMonoSub}>INTELLIGENCE COPILOT PLATFORM</Text>
        <Text style={styles.splashSubtitle}>
          AI-assisted crime investigation, network analysis and predictive intelligence for law enforcement.
        </Text>
        <View style={styles.statsRow}>
          {stats.map(({ icon: Icon, value, label }) => (
            <View key={label} style={styles.statCard}>
              <Icon size={14} color="#3B82F6" />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* CTA — pinned to bottom */}
      <Animated.View style={[styles.splashBottom, { opacity: fadeAnim }]}>
        <View style={styles.pillRow}>
          {["AI Copilot", "Network Analysis", "Hotspot Map", "Predictive AI", "Smart Reports"].map(f => (
            <View key={f} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85}>
          <LinearGradient colors={["#0F4C81", "#1A6DB5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{T[lang].accessPlatform}</Text>
            <ArrowRight size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.restrictionText}>{T[lang].restriction}</Text>
      </Animated.View>
    </View>
  );
}

/* ══════════════════════════════════════════ */
/*  SCREEN 2 — ONBOARDING                     */
/* ══════════════════════════════════════════ */
function OnboardingScreen({ onNext }: { onNext: () => void }) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const Icon = slide.icon;
  const isLast = idx === SLIDES.length - 1;
  const advance = () => isLast ? onNext() : setIdx(i => i + 1);
  const back = () => setIdx(i => Math.max(0, i - 1));

  return (
    <View style={styles.container}>
      <View style={styles.onboardingHeader}>
        <TouchableOpacity onPress={back} style={[styles.backTextButton, { opacity: idx === 0 ? 0 : 1 }]} disabled={idx === 0}>
          <ChevronLeft size={16} color="rgba(240,244,248,0.5)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext}><Text style={styles.skipText}>Skip</Text></TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        <View style={[styles.iconBlob, { backgroundColor: slide.bg, borderColor: `${slide.color}30` }]}>
          <Icon size={52} color={slide.color} />
          <View style={[styles.tagBadge, { backgroundColor: slide.color }]}>
            <Text style={styles.tagBadgeText}>{slide.tag}</Text>
          </View>
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.onboardingBottom}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)}>
              <View style={[styles.dot, { width: i === idx ? 24 : 7, backgroundColor: i === idx ? "#3B82F6" : "rgba(240,244,248,0.25)" }]} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={advance} activeOpacity={0.85}>
          {isLast ? (
            <LinearGradient colors={["#0F4C81", "#1A6DB5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign In to CrimeLens</Text>
              <ArrowRight size={18} color="white" />
            </LinearGradient>
          ) : (
            <View style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Next</Text>
              <ArrowRight size={18} color="rgba(240,244,248,0.8)" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ══════════════════════════════════════════ */
/*  SCREEN 3 — LOGIN                          */
/* ══════════════════════════════════════════ */
function LoginScreen({
  onBack,
  lang,
  setLang,
  onLoginSuccess,
}: {
  onBack: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  onLoginSuccess: (user: { username: string; role: UserRole }) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<UserRole | "">("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selRole = ROLES.find(r => r.value === role);
  const selLang = LANGS.find(l => l.value === lang);

  const handleLogin = () => {
    if (!username || !password || !role) { setError(T[lang].errorMsg); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1800);
  };

  // Navigate to dashboard after brief success animation
  useEffect(() => {
    if (success) {
      const timer = setTimeout(
        () => onLoginSuccess({ username: username.trim(), role: role as UserRole }),
        1200
      );
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCircle}><Text style={{ fontSize: 36, color: "#10B981" }}>✓</Text></View>
        <Text style={styles.successTitle}>{T[lang].accessGranted}</Text>
        <Text style={styles.successSubtitle}>{T[lang].loadingDash}</Text>
        <View style={styles.loaderBarBg}>
          <LinearGradient colors={["#0F4C81", "#3B82F6", "#10B981"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loaderBar} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.loginHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backIconButton}>
            <ChevronLeft size={20} color="rgba(240,244,248,0.7)" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{T[lang].secureSignIn}</Text>
            <Text style={styles.headerSubtitle}>{T[lang].kspSubtitle}</Text>
          </View>
        </View>

        <View style={styles.loginIconContainer}>
          <View style={styles.fingerprintBlob}>
            <Fingerprint size={32} color="#3B82F6" />
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={15} color="#EF4444" style={{ marginTop: 2 }} />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{T[lang].badge}</Text>
          <View style={styles.textInputWrapper}>
            <User size={16} color="rgba(240,244,248,0.3)" style={styles.inputIcon} />
            <TextInput value={username} onChangeText={setUsername} placeholder={T[lang].badgePlaceholder}
              placeholderTextColor="rgba(240,244,248,0.35)" autoCapitalize="none" style={styles.textInput} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{T[lang].password}</Text>
          <View style={styles.textInputWrapper}>
            <Lock size={16} color="rgba(240,244,248,0.3)" style={styles.inputIcon} />
            <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPw}
              placeholder={T[lang].passwordPlaceholder} placeholderTextColor="rgba(240,244,248,0.35)" style={styles.textInput} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.pwToggle}>
              {showPw ? <EyeOff size={16} color="rgba(240,244,248,0.4)" /> : <Eye size={16} color="rgba(240,244,248,0.4)" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{T[lang].role}</Text>
          <TouchableOpacity onPress={() => setRoleOpen(true)} style={styles.selectButton}>
            {selRole ? (
              <View style={styles.selectBtnContent}>
                <Text style={{ marginRight: 6 }}>{selRole.icon}</Text>
                <Text style={styles.selectBtnText}>{selRole.label}</Text>
              </View>
            ) : <Text style={[styles.selectBtnText, { color: "rgba(240,244,248,0.3)" }]}>{T[lang].selectRole}</Text>}
            <ChevronDown size={16} color="rgba(240,244,248,0.4)" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{T[lang].language}</Text>
          <TouchableOpacity onPress={() => setLangOpen(true)} style={styles.selectButton}>
            <View style={styles.selectBtnContent}>
              <Globe size={15} color="rgba(240,244,248,0.4)" style={{ marginRight: 8 }} />
              <Text style={styles.selectBtnText}>{selLang?.label}</Text>
              <Text style={styles.langDivider}>·</Text>
              <Text style={styles.langNative}>{selLang?.native}</Text>
            </View>
            <ChevronDown size={16} color="rgba(240,244,248,0.4)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotBtn}><Text style={styles.forgotText}>{T[lang].forgot}</Text></TouchableOpacity>

        <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
          <LinearGradient colors={["#0F4C81", "#1A6DB5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}>
            <Shield size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>{loading ? T[lang].authenticating : T[lang].signIn}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.protectionStamp}>
          <View style={styles.secureStampDot} />
          <Text style={styles.protectionStampText}>{T[lang].tls}</Text>
        </View>
      </ScrollView>

      <Modal visible={roleOpen} transparent animationType="slide" onRequestClose={() => setRoleOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setRoleOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalSheetTitle}>{T[lang].selectRoleTitle}</Text>
            {ROLES.map(r => (
              <TouchableOpacity key={r.value} onPress={() => { setRole(r.value); setRoleOpen(false); }}
                style={[styles.modalOption, role === r.value && styles.modalOptionSelected]}>
                <Text style={styles.modalOptionIcon}>{r.icon}</Text>
                <Text style={[styles.modalOptionText, role === r.value && { color: "#93C5FD", fontFamily: "Inter-SemiBold" }]}>{r.label}</Text>
                {role === r.value && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={langOpen} transparent animationType="slide" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLangOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalSheetTitle}>{T[lang].selectLangTitle}</Text>
            {LANGS.map(l => (
              <TouchableOpacity key={l.value} onPress={() => { setLang(l.value as Lang); setLangOpen(false); }}
                style={[styles.modalOption, lang === l.value && styles.modalOptionSelected]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[styles.modalOptionText, lang === l.value && { color: "#93C5FD", fontFamily: "Inter-SemiBold" }]}>{l.label}</Text>
                  <Text style={styles.modalLangNative}>({l.native})</Text>
                </View>
                {lang === l.value && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ══════════════════════════════════════════ */
/*  ROOT                                      */
/* ══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState<ScreenState>("splash");
  const [lang, setLang] = useState<Lang>("en");
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: UserRole;
  } | null>(null);

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Rajdhani-SemiBold": Rajdhani_600SemiBold,
    "Rajdhani-Bold": Rajdhani_700Bold,
    "JetBrainsMono-Regular": JetBrainsMono_400Regular,
    "JetBrainsMono-Medium": JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style="light" />
        <Text style={{ fontFamily: undefined, fontSize: 18, color: "#F0F4F8", letterSpacing: 4 }}>CRIMELENS AI</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.rootArea} edges={["top", "bottom"]}>
        <StatusBar style="light" />
        {screen === "splash" && <SplashScreen onNext={() => setScreen("onboarding")} lang={lang} />}
        {screen === "onboarding" && <OnboardingScreen onNext={() => setScreen("login")} />}
        {screen === "login" && (
          <LoginScreen
            onBack={() => setScreen("onboarding")}
            lang={lang}
            setLang={setLang}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setScreen("dashboard");
            }}
          />
        )}
        {screen === "dashboard" && currentUser && (
          <DashboardScreen
            lang={lang}
            setLang={setLang}
            setScreen={setScreen}
            currentUser={currentUser}
          />
        )}
        {screen === "investigation" && currentUser && (
          <AIInvestigationWorkspace
            lang={lang}
            setLang={setLang}
            onBack={() => setScreen("dashboard")}
            currentUser={currentUser}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* ══════════════════════════════════════════ */
/*  STYLES                                    */
/* ══════════════════════════════════════════ */
const styles = StyleSheet.create({
  rootArea: { flex: 1, backgroundColor: "#060E1A" },
  container: { flex: 1, backgroundColor: "#060E1A" },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },

  /* ── Splash layout ── */
  splashContainer: {
    flex: 1,
    backgroundColor: "#060E1A",
  },
  splashTop: {},
  splashMiddle: {},
  splashTextBlock: {
    position: "absolute",
    left: 0, right: 0,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  badgeAbsolute: {
    position: "absolute",
    left: 0, right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  splashBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },

  /* Glow */
  ambientGlow: {
    position: "absolute",
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(15,76,129,0.22)",
  },

  /* Badge */
  badgeWrapper: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  badgeCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(59,130,246,0.45)",
    shadowColor: "#0F4C81", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7, shadowRadius: 20, elevation: 12,
  },
  orbitRing: {
    position: "absolute",
    width: 122, height: 122, borderRadius: 61,
    borderWidth: 1.2, borderStyle: "dashed",
    borderColor: "rgba(59,130,246,0.3)",
  },
  pulseRing: {
    position: "absolute",
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 1.5, borderColor: "rgba(26,109,181,0.35)",
  },

  /* Org tag */
  orgTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(26,109,181,0.12)",
    borderWidth: 1, borderColor: "rgba(26,109,181,0.3)",
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12,
    marginBottom: 10,
  },
  orgDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", marginRight: 7 },
  orgTagText: { fontFamily: "JetBrainsMono-Medium", fontSize: 9, color: "rgba(240,244,248,0.7)", letterSpacing: 1.6 },

  /* Title */
  splashTitle: { fontFamily: "Rajdhani-Bold", fontSize: 40, color: "#F0F4F8", textAlign: "center", letterSpacing: 0.5, marginBottom: 2 },
  splashMonoSub: { fontFamily: "JetBrainsMono-Medium", fontSize: 9, color: "rgba(240,244,248,0.3)", letterSpacing: 2.2, textAlign: "center", marginBottom: 8 },
  splashSubtitle: { fontFamily: "Inter-Regular", fontSize: 13, color: "rgba(240,244,248,0.5)", textAlign: "center", lineHeight: 20, maxWidth: 280, marginBottom: 16 },

  /* Stats */
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 0 },
  statCard: {
    alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, minWidth: 72,
  },
  statValue: { fontFamily: "Rajdhani-Bold", fontSize: 17, color: "#F0F4F8", lineHeight: 18 },
  statLabel: { fontFamily: "Inter-Regular", fontSize: 9.5, color: "rgba(240,244,248,0.4)", textAlign: "center" },

  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },

  pillRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }, featurePill: {
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1, borderColor: "rgba(59,130,246,0.2)",
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10,
  },
  featurePillText: { fontFamily: "Inter-Medium", fontSize: 10, color: "rgba(147,197,253,0.7)" },

  primaryButton: {
    width: "100%", paddingVertical: 16, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  primaryButtonText: { fontFamily: "Rajdhani-Bold", fontSize: 17, color: "white", letterSpacing: 0.6 },
  restrictionText: { fontFamily: "Inter-Regular", fontSize: 11, color: "rgba(240,244,248,0.22)", textAlign: "center", marginTop: 14 },

  /* Onboarding */
  onboardingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingVertical: 12 },
  backTextButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { fontFamily: "Inter-Medium", fontSize: 13, color: "rgba(240,244,248,0.5)" },
  skipText: { fontFamily: "Inter-Medium", fontSize: 13, color: "rgba(240,244,248,0.4)" },
  iconBlob: { width: 110, height: 110, borderRadius: 32, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginBottom: 32, position: "relative" },
  tagBadge: { position: "absolute", top: -8, right: -8, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7 },
  tagBadgeText: { fontFamily: "JetBrainsMono-Medium", fontSize: 8, color: "white", letterSpacing: 1 },
  slideTitle: { fontFamily: "Rajdhani-Bold", fontSize: 28, color: "#F0F4F8", textAlign: "center", marginBottom: 14, letterSpacing: 0.5 },
  slideSubtitle: { fontFamily: "Inter-Regular", fontSize: 14, color: "rgba(240,244,248,0.55)", textAlign: "center", lineHeight: 22, maxWidth: 280 },
  onboardingBottom: { paddingHorizontal: 24, paddingBottom: 24 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20 },
  dot: { height: 7, borderRadius: 4 },
  secondaryButton: { width: "100%", paddingVertical: 16, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryButtonText: { fontFamily: "Rajdhani-Bold", fontSize: 17, color: "white", letterSpacing: 0.6 },

  /* Login */
  loginHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 14, marginBottom: 8 },
  backIconButton: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Rajdhani-Bold", fontSize: 18, color: "#F0F4F8", lineHeight: 20 },
  headerSubtitle: { fontFamily: "JetBrainsMono-Medium", fontSize: 10, color: "rgba(240,244,248,0.4)", letterSpacing: 0.8 },
  loginIconContainer: { alignItems: "center", marginVertical: 10 },
  fingerprintBlob: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(26,109,181,0.15)", borderWidth: 1.5, borderColor: "rgba(26,109,181,0.35)", alignItems: "center", justifyContent: "center" },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", borderRadius: 12, padding: 12, marginBottom: 16 },
  errorBoxText: { fontFamily: "Inter-Regular", fontSize: 12, color: "#FCA5A5", lineHeight: 18, flex: 1 },
  inputGroup: { flexDirection: "column", gap: 6, marginBottom: 16 },
  inputLabel: { fontFamily: "Inter-SemiBold", fontSize: 11, color: "rgba(240,244,248,0.5)", textTransform: "uppercase", letterSpacing: 1.2 },
  textInputWrapper: { position: "relative", flexDirection: "row", alignItems: "center" },
  inputIcon: { position: "absolute", left: 14, zIndex: 10 },
  textInput: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingVertical: 13, paddingLeft: 42, paddingRight: 44, color: "#F0F4F8", fontSize: 14, fontFamily: "Inter-Regular" },
  pwToggle: { position: "absolute", right: 14, zIndex: 10 },
  selectButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14 },
  selectBtnContent: { flexDirection: "row", alignItems: "center" },
  selectBtnText: { fontFamily: "Inter-Regular", fontSize: 14, color: "#F0F4F8" },
  langDivider: { color: "rgba(240,244,248,0.35)", fontSize: 13, marginHorizontal: 8 },
  langNative: { color: "rgba(240,244,248,0.4)", fontSize: 13 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 16 },
  forgotText: { fontFamily: "Inter-Medium", fontSize: 12, color: "#60A5FA" },
  protectionStamp: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 },
  secureStampDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  protectionStampText: { fontFamily: "JetBrainsMono-Medium", fontSize: 10, color: "rgba(240,244,248,0.3)", letterSpacing: 0.6 },

  /* Success */
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  successCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 2, borderColor: "#10B981", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successTitle: { fontFamily: "Rajdhani-Bold", fontSize: 28, color: "#F0F4F8", marginBottom: 8 },
  successSubtitle: { fontFamily: "Inter-Regular", fontSize: 13, color: "rgba(240,244,248,0.5)", textAlign: "center", lineHeight: 20, marginBottom: 32 },
  loaderBarBg: { width: "100%", height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  loaderBar: { width: "70%", height: "100%", borderRadius: 2 },

  /* Modals */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#0F2040", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalSheetTitle: { fontFamily: "Rajdhani-Bold", fontSize: 18, color: "#F0F4F8", marginBottom: 16 },
  modalOption: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  modalOptionSelected: { backgroundColor: "rgba(59,130,246,0.08)", borderRadius: 10, paddingHorizontal: 8, marginHorizontal: -8 },
  modalOptionIcon: { fontSize: 20, marginRight: 12 },
  modalOptionText: { fontFamily: "Inter-Regular", fontSize: 15, color: "#F0F4F8", flex: 1 },
  modalLangNative: { fontFamily: "Inter-Regular", fontSize: 13, color: "rgba(240,244,248,0.4)", marginLeft: 8 },
  checkIcon: { fontSize: 16, color: "#3B82F6", fontFamily: "Inter-Bold" },
});
