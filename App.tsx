import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet, View, Text, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions,
  Animated, Easing
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Rajdhani_600SemiBold, Rajdhani_700Bold } from "@expo-google-fonts/rajdhani";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import {
  Eye, EyeOff, Globe, ArrowRight,
  ChevronLeft, Fingerprint, Network, Brain,
  FileText, Lock, User, AlertCircle, Shield, Activity, Zap, Check, Key, MapPin
} from "lucide-react-native";
import Svg2, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, Line, Rect } from "react-native-svg";
import { DashboardScreen } from "./screens/DashboardScreen";
import { AIInvestigationWorkspace } from "./screens/AIInvestigationWorkspace";

type ScreenState = "splash" | "onboarding" | "login" | "dashboard" | "investigation";
export type Lang = "en" | "kn";
export type UserRole = "investigator" | "analyst" | "senior_officer" | "administrator";

/* ── Translations ─────────────────────────── */
const T = {
  en: {
    welcomeTitle: "Welcome to CrimeLens AI",
    welcomeSub: "Secure access for authorized personnel",
    kspSubtitle: "KARNATAKA STATE POLICE",
    kspPlatform: "Crime Intelligence Platform",
    badge: "Badge / Username",
    badgePlaceholder: "Enter KSP badge number or username",
    password: "Password",
    passwordPlaceholder: "Enter your secure password",
    role: "Select Your Role",
    language: "Interface Language",
    forgot: "Need access help?",
    signIn: "Secure Login",
    authenticating: "Authenticating Credentials…",
    errorMsg: "Please enter badge number, password, and select your role.",
    accessGranted: "Access Granted · Session Authenticated",
    loadingDash: "Welcome back, Officer. Initializing Intelligence Dashboard…",
    tls: "TLS 256-bit Encryption · Audit Logged · IT Act 2000 Compliant",
    restriction: "Authorized Karnataka State Police Personnel Only",
    tagline: "Transforming crime data into actionable intelligence through AI-powered analysis, network discovery and explainable insights.",
    capabilities: [
      { title: "AI-Powered Investigation", desc: "Instant query analysis & automated case intelligence" },
      { title: "Crime Network Intelligence", desc: "Syndicate mapping & entity link discovery" },
      { title: "Explainable & Secure", desc: "Auditable AI conclusions with source citations" },
    ]
  },
  kn: {
    welcomeTitle: "CrimeLens AI ಗೆ ಸ್ವಾಗತ",
    welcomeSub: "ಅಧಿಕೃತ ಸಿಬ್ಬಂದಿಗೆ ಸುರಕ್ಷಿತ ಪ್ರವೇಶ",
    kspSubtitle: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್",
    kspPlatform: "ಅಪರಾಧ ಗುಪ್ತಚರ ವೇದಿಕೆ",
    badge: "ಬ್ಯಾಡ್ಜ್ / ಬಳಕೆದಾರ ಹೆಸರು",
    badgePlaceholder: "KSP ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    role: "ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ",
    language: "ಇಂಟರ್ಫೇಸ್ ಭಾಷೆ",
    forgot: "ಸಹಾಯ ಬೇಕೇ?",
    signIn: "ಸುರಕ್ಷಿತವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    authenticating: "ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ…",
    errorMsg: "ದಯವಿಟ್ಟು ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆ, ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಪಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
    accessGranted: "ಪ್ರವೇಶ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ",
    loadingDash: "ಸ್ವಾಗತ. ನಿಮ್ಮ ಅಪರಾಧ ಗುಪ್ತಚರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    tls: "TLS 256-bit · ಆಡಿಟ್ ಲಾಗ್ · ಸೀಮಿತ ಪ್ರವೇಶ",
    restriction: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಸಿಬ್ಬಂದಿಗೆ ಮಾತ್ರ ಸೀಮಿತ",
    tagline: "ಎಐ-ಆಧಾರಿತ ವಿಶ್ಲೇಷಣೆ, ಜಾಲಬಂಧ ಶೋಧನೆ ಮತ್ತು ಪಾರದರ್ಶಕ ಒಳನೋಟಗಳ ಮೂಲಕ ಅಪರಾಧ ದತ್ತಾಂಶವನ್ನು ಉಪಯುಕ್ತ ಗುಪ್ತಚರ ಮಾಹಿತಿಯಾಗಿ ಪರಿವರ್ತಿಸುವುದು.",
    capabilities: [
      { title: "ಎಐ-ಆಧಾರಿತ ತನಿಖೆ", desc: "ತ್ವರಿತ ಪ್ರಕರಣ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸ್ವಯಂಚಾಲಿತ ಒಳನೋಟಗಳು" },
      { title: "ಅಪರಾಧ ಜಾಲಬಂಧ ಗುಪ್ತಚರ", desc: "ಸಿಂಡಿಕೇಟ್ ಮ್ಯಾಪಿಂಗ್ ಮತ್ತು ಸಂಪರ್ಕ ಶೋಧನೆ" },
      { title: "ಪಾರದರ್ಶಕ ಮತ್ತು ಸುರಕ್ಷಿತ", desc: "ಮೂಲ ಆಧಾರಗಳೊಂದಿಗೆ ದೃಢೀಕೃತ ಎಐ ತೀರ್ಮಾನಗಳು" },
    ]
  },
};

const SLIDES = [
  { icon: Brain, color: "#0F4C81", bg: "rgba(15,76,129,0.08)", title: "Ask in Your Language", subtitle: "Query crime data in English or Kannada — type or speak. Get instant answers with source citations.", tag: "AI COPILOT" },
  { icon: Network, color: "#0F4C81", bg: "rgba(15,76,129,0.08)", title: "Uncover Hidden Networks", subtitle: "Visualise criminal syndicates spanning multiple districts. Discover kingpins that conventional searches miss.", tag: "CRIMINAL NETWORK" },
  { icon: MapPin, color: "#0F4C81", bg: "rgba(15,76,129,0.08)", title: "Predict Crime Before It Happens", subtitle: "AI-powered risk zones on live maps. Know where to deploy patrols before incidents occur.", tag: "HOTSPOT INTELLIGENCE" },
  { icon: FileText, color: "#0F4C81", bg: "rgba(15,76,129,0.08)", title: "Reports in Seconds", subtitle: "AI compiles full investigation summaries with accused history, timeline, and recommendations — export to PDF instantly.", tag: "SMART REPORTS" },
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

/* ── Subtle Network Background SVG ─────────── */
function SubtleNetworkBackground() {
  return (
    <Svg2 width="100%" height="100%" style={StyleSheet.absoluteFillObject} viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <SvgLinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F8FAFC" />
          <Stop offset="100%" stopColor="#EDF4FA" />
        </SvgLinearGradient>
      </Defs>
      <Rect width="800" height="800" fill="url(#bgGrad)" />
      
      {/* Soft Grid Lines */}
      <Path d="M0,100 H800 M0,200 H800 M0,300 H800 M0,400 H800 M0,500 H800 M0,600 H800 M0,700 H800" stroke="#0F4C81" strokeOpacity="0.04" strokeWidth="1" />
      <Path d="M100,0 V800 M200,0 V800 M300,0 V800 M400,0 V800 M500,0 V800 M600,0 V800 M700,0 V800" stroke="#0F4C81" strokeOpacity="0.04" strokeWidth="1" />
      
      {/* Network Connections */}
      <Line x1="120" y1="180" x2="320" y2="140" stroke="#0F4C81" strokeOpacity="0.12" strokeWidth="1.5" strokeDasharray="4,4" />
      <Line x1="320" y1="140" x2="520" y2="240" stroke="#0F4C81" strokeOpacity="0.1" strokeWidth="1.5" />
      <Line x1="320" y1="140" x2="220" y2="400" stroke="#0F4C81" strokeOpacity="0.08" strokeWidth="1.5" />
      <Line x1="520" y1="240" x2="620" y2="460" stroke="#0F4C81" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3,3" />
      <Line x1="220" y1="400" x2="450" y2="500" stroke="#0F4C81" strokeOpacity="0.08" strokeWidth="1.5" />
      <Line x1="450" y1="500" x2="620" y2="460" stroke="#0F4C81" strokeOpacity="0.12" strokeWidth="1.5" />

      {/* Nodes */}
      <Circle cx="120" cy="180" r="5" fill="#0F4C81" fillOpacity="0.15" />
      <Circle cx="320" cy="140" r="7" fill="#0F4C81" fillOpacity="0.22" />
      <Circle cx="520" cy="240" r="6" fill="#1E65A6" fillOpacity="0.25" />
      <Circle cx="220" cy="400" r="5" fill="#0F4C81" fillOpacity="0.15" />
      <Circle cx="450" cy="500" r="8" fill="#0F4C81" fillOpacity="0.2" />
      <Circle cx="620" cy="460" r="6" fill="#1E65A6" fillOpacity="0.18" />
    </Svg2>
  );
}

/* ── KSP Police Badge (SVG) ───────────────── */
function KSPBadge({ size = 64 }: { size?: number }) {
  return (
    <Svg2 width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <SvgLinearGradient id="kspBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1E65A6" />
          <Stop offset="100%" stopColor="#0F4C81" />
        </SvgLinearGradient>
        <SvgLinearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
        </SvgLinearGradient>
      </Defs>
      <Polygon
        points="40,2 46,28 70,28 51,44 58,70 40,55 22,70 29,44 10,28 34,28"
        fill="url(#kspBg)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.2"
      />
      <Circle cx="40" cy="40" r="17" fill="#082A4D" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <Path
        d="M40 24 C40 24 29 28.5 29 37 C29 44.5 34.5 50 40 52 C45.5 50 51 44.5 51 37 C51 28.5 40 24 40 24Z"
        fill="url(#shine)"
      />
      <Path d="M31 38 Q40 40 49 38" stroke="rgba(15,76,129,0.6)" strokeWidth="1.2" fill="none" />
    </Svg2>
  );
}

/* ══════════════════════════════════════════ */
/*  SCREEN 1 — SPLASH                         */
/* ══════════════════════════════════════════ */
function SplashScreen({ onNext, lang }: { onNext: () => void; lang: Lang }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const stats = [
    { icon: Activity, value: "2.4M+", label: "FIR Records" },
    { icon: Zap, value: "<1s", label: "Query Speed" },
    { icon: Shield, value: "100%", label: "Secure RBAC" },
  ];

  return (
    <View style={styles.lightContainer}>
      <SubtleNetworkBackground />
      <Animated.View style={[styles.splashCenter, { opacity: fadeAnim }]}>
        <View style={styles.badgeWrapperLight}>
          <KSPBadge size={72} />
        </View>

        <View style={styles.orgTagLight}>
          <View style={styles.orgDotLight} />
          <Text style={styles.orgTagTextLight}>KARNATAKA STATE POLICE · CLASSIFIED</Text>
        </View>

        <Text style={styles.splashTitleLight}>
          CrimeLens<Text style={{ color: "#0F4C81" }}> AI</Text>
        </Text>
        <Text style={styles.splashSubheadLight}>AI-POWERED CRIME INTELLIGENCE PLATFORM</Text>

        <Text style={styles.splashDescLight}>
          {T[lang].tagline}
        </Text>

        <View style={styles.statsRowLight}>
          {stats.map(({ icon: Icon, value, label }) => (
            <View key={label} style={styles.statCardLight}>
              <Icon size={16} color="#0F4C81" />
              <Text style={styles.statValueLight}>{value}</Text>
              <Text style={styles.statLabelLight}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.splashButtonWrapper}>
          <View style={styles.primaryButtonLight}>
            <Text style={styles.primaryButtonTextLight}>Access Platform</Text>
            <ArrowRight size={18} color="white" />
          </View>
        </TouchableOpacity>

        <Text style={styles.restrictionTextLight}>{T[lang].restriction}</Text>
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
    <View style={styles.lightContainer}>
      <SubtleNetworkBackground />
      <View style={styles.onboardingHeaderLight}>
        <TouchableOpacity onPress={back} style={[styles.backTextButtonLight, { opacity: idx === 0 ? 0 : 1 }]} disabled={idx === 0}>
          <ChevronLeft size={16} color="#0F4C81" />
          <Text style={styles.backTextLight}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext}><Text style={styles.skipTextLight}>Skip</Text></TouchableOpacity>
      </View>

      <View style={styles.centerContainerLight}>
        <View style={styles.iconBlobLight}>
          <Icon size={48} color="#0F4C81" />
          <View style={styles.tagBadgeLight}>
            <Text style={styles.tagBadgeTextLight}>{slide.tag}</Text>
          </View>
        </View>
        <Text style={styles.slideTitleLight}>{slide.title}</Text>
        <Text style={styles.slideSubtitleLight}>{slide.subtitle}</Text>
      </View>

      <View style={styles.onboardingBottomLight}>
        <View style={styles.dotsRowLight}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)}>
              <View style={[styles.dotLight, { width: i === idx ? 28 : 8, backgroundColor: i === idx ? "#0F4C81" : "#CBD5E1" }]} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={advance} activeOpacity={0.85}>
          {isLast ? (
            <View style={styles.primaryButtonLight}>
              <Text style={styles.primaryButtonTextLight}>Sign In to CrimeLens</Text>
              <ArrowRight size={18} color="white" />
            </View>
          ) : (
            <View style={styles.secondaryButtonLight}>
              <Text style={styles.secondaryButtonTextLight}>Next</Text>
              <ArrowRight size={18} color="#0F4C81" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ══════════════════════════════════════════ */
/*  SCREEN 3 — LOGIN (REDESIGNED LIGHT THEME) */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const handleLogin = () => {
    if (!username || !password || !role) {
      setError(T[lang].errorMsg);
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(
        () => onLoginSuccess({ username: username.trim(), role: role as UserRole }),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (success) {
    return (
      <View style={styles.successContainerLight}>
        <SubtleNetworkBackground />
        <View style={styles.successCardLight}>
          <View style={styles.successCircleLight}>
            <Check size={40} color="#0F4C81" />
          </View>
          <Text style={styles.successTitleLight}>{T[lang].accessGranted}</Text>
          <Text style={styles.successSubtitleLight}>{T[lang].loadingDash}</Text>
          <View style={styles.loaderBarBgLight}>
            <LinearGradient
              colors={["#0F4C81", "#1E65A6", "#0F4C81"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loaderBarLight}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.lightContainer}>
      <SubtleNetworkBackground />
      
      <ScrollView contentContainerStyle={styles.loginScrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.loginLayoutContainer, isDesktop && styles.loginSplitLayout]}>

          {/* LEFT SIDE: Brand & Capabilities Introduction */}
          <View style={[styles.leftIntroSection, !isDesktop && styles.leftIntroMobile]}>
            <View style={styles.brandBadgeHeader}>
              <View style={styles.kspLogoBadge}>
                <KSPBadge size={52} />
              </View>
              <View style={styles.brandTitleBox}>
                <Text style={styles.brandTitleText}>
                  CrimeLens<Text style={{ color: "#0F4C81" }}> AI</Text>
                </Text>
                <Text style={styles.brandSubTitleText}>{T[lang].kspSubtitle} · {T[lang].kspPlatform}</Text>
              </View>
            </View>

            <View style={styles.headlineBox}>
              <Text style={styles.headlineText}>
                AI-Powered Crime Intelligence{"\n"}
                <Text style={{ color: "#0F4C81" }}>for Smarter Investigations</Text>
              </Text>
              <Text style={styles.taglineText}>
                "{T[lang].tagline}"
              </Text>
            </View>

            {/* Capability Indicators — Hidden on narrow mobile screens */}
            {isDesktop && (
              <View style={styles.capabilitiesContainer}>
                {T[lang].capabilities.map((cap, i) => (
                  <View key={i} style={styles.capabilityItem}>
                    <View style={styles.capabilityIconCircle}>
                      {i === 0 && <Shield size={18} color="#0F4C81" />}
                      {i === 1 && <Network size={18} color="#0F4C81" />}
                      {i === 2 && <Lock size={18} color="#0F4C81" />}
                    </View>
                    <View style={styles.capabilityTextContent}>
                      <Text style={styles.capabilityTitle}>{cap.title}</Text>
                      <Text style={styles.capabilityDesc}>{cap.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* RIGHT SIDE: Auth Card */}
          <View style={styles.rightCardSection}>
            <View style={styles.authCard}>
              
              {/* Language Selector Top Pill */}
              <View style={styles.langRowPill}>
                <Globe size={13} color="#475569" style={{ marginRight: 6 }} />
                {LANGS.map((l) => {
                  const isActive = lang === l.value;
                  return (
                    <TouchableOpacity
                      key={l.value}
                      onPress={() => setLang(l.value as Lang)}
                      style={[styles.langChip, isActive && styles.langChipActive]}
                    >
                      <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                        {l.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Card Header */}
              <View style={styles.authCardHeader}>
                <Text style={styles.authCardTitle}>{T[lang].welcomeTitle}</Text>
                <Text style={styles.authCardSub}>{T[lang].welcomeSub}</Text>
              </View>

              {error ? (
                <View style={styles.errorBoxLight}>
                  <AlertCircle size={15} color="#DC2626" style={{ marginTop: 2 }} />
                  <Text style={styles.errorTextLight}>{error}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.inputGroupLight}>
                <Text style={styles.inputLabelLight}>{T[lang].badge}</Text>
                <View style={styles.inputWrapperLight}>
                  <User size={18} color="#64748B" style={styles.inputIconLeft} />
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder={T[lang].badgePlaceholder}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    style={styles.textInputLight}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroupLight}>
                <Text style={styles.inputLabelLight}>{T[lang].password}</Text>
                <View style={styles.inputWrapperLight}>
                  <Lock size={18} color="#64748B" style={styles.inputIconLeft} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    placeholder={T[lang].passwordPlaceholder}
                    placeholderTextColor="#94A3B8"
                    style={styles.textInputLight}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.pwToggleLight}>
                    {showPw ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Select Role Chips Grid */}
              <View style={styles.inputGroupLight}>
                <Text style={styles.inputLabelLight}>{T[lang].role}</Text>
                <View style={styles.roleGrid}>
                  {ROLES.map((r) => {
                    const isSelected = role === r.value;
                    return (
                      <TouchableOpacity
                        key={r.value}
                        onPress={() => setRole(r.value)}
                        activeOpacity={0.8}
                        style={[
                          styles.roleCard,
                          isSelected && styles.roleCardSelected,
                        ]}
                      >
                        <View style={styles.roleCardHeader}>
                          <Text style={styles.roleIconText}>{r.icon}</Text>
                          {isSelected ? (
                            <View style={styles.roleCheckBadge}>
                              <Text style={styles.roleCheckText}>✓</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.roleLabelText, isSelected && styles.roleLabelTextSelected]}>
                          {r.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Main Submit Button */}
              <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={{ marginTop: 10 }}>
                <View style={[styles.loginPrimaryButton, loading && { opacity: 0.7 }]}>
                  <Shield size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.loginPrimaryButtonText}>
                    {loading ? T[lang].authenticating : T[lang].signIn}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Footer Security Notice */}
              <View style={styles.securityFooterStamp}>
                <Key size={12} color="#0F4C81" />
                <Text style={styles.securityFooterText}>
                  {T[lang].restriction}
                </Text>
              </View>

              <Text style={styles.tlsSubtext}>
                {T[lang].tls}
              </Text>

            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ══════════════════════════════════════════ */
/*  ROOT APP COMPONENT                        */
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
      <View style={[styles.lightContainer, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar hidden={true} style="dark" />
        <Text style={{ fontFamily: undefined, fontSize: 18, color: "#0F4C81", letterSpacing: 4 }}>CRIMELENS AI</Text>
      </View>
    );
  }

  const isLightScreen = screen === "splash" || screen === "onboarding" || screen === "login";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={isLightScreen ? styles.lightContainer : styles.darkRootArea} edges={["top", "bottom"]}>
        <StatusBar hidden={true} style={isLightScreen ? "dark" : "light"} />
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
/*  STYLES (PREMIUM LIGHT THEME & RESPONSIVE) */
/* ══════════════════════════════════════════ */
const styles = StyleSheet.create({
  darkRootArea: { flex: 1, backgroundColor: "#060E1A" },
  lightContainer: { flex: 1, backgroundColor: "#F8FAFC" },

  /* Splash Light */
  splashCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  badgeWrapperLight: {
    marginBottom: 16,
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  orgTagLight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,76,129,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,76,129,0.18)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  orgDotLight: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#0F4C81", marginRight: 8 },
  orgTagTextLight: { fontFamily: "JetBrainsMono-Medium", fontSize: 10, color: "#0F4C81", letterSpacing: 1.5 },
  splashTitleLight: { fontFamily: "Rajdhani-Bold", fontSize: 44, color: "#0F172A", letterSpacing: 0.5 },
  splashSubheadLight: { fontFamily: "JetBrainsMono-Medium", fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 12 },
  splashDescLight: { fontFamily: "Inter-Regular", fontSize: 14, color: "#334155", textAlign: "center", lineHeight: 22, maxWidth: 440, marginBottom: 24 },
  statsRowLight: { flexDirection: "row", gap: 12, marginBottom: 32 },
  statCardLight: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValueLight: { fontFamily: "Rajdhani-Bold", fontSize: 18, color: "#0F172A", marginTop: 4 },
  statLabelLight: { fontFamily: "Inter-Regular", fontSize: 10, color: "#64748B" },
  splashButtonWrapper: { width: "100%", maxWidth: 320 },
  primaryButtonLight: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "#0F4C81",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonTextLight: { fontFamily: "Rajdhani-Bold", fontSize: 18, color: "white", letterSpacing: 0.5 },
  restrictionTextLight: { fontFamily: "Inter-Regular", fontSize: 11, color: "#64748B", marginTop: 16 },

  /* Onboarding Light */
  onboardingHeaderLight: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingVertical: 16 },
  backTextButtonLight: { flexDirection: "row", alignItems: "center", gap: 4 },
  backTextLight: { fontFamily: "Inter-Medium", fontSize: 13, color: "#0F4C81" },
  skipTextLight: { fontFamily: "Inter-Medium", fontSize: 13, color: "#64748B" },
  centerContainerLight: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  iconBlobLight: { width: 100, height: 100, borderRadius: 28, backgroundColor: "rgba(15,76,129,0.08)", borderWidth: 1.5, borderColor: "rgba(15,76,129,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 28, position: "relative" },
  tagBadgeLight: { position: "absolute", top: -8, right: -8, backgroundColor: "#0F4C81", borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  tagBadgeTextLight: { fontFamily: "JetBrainsMono-Medium", fontSize: 8, color: "white", letterSpacing: 1 },
  slideTitleLight: { fontFamily: "Rajdhani-Bold", fontSize: 28, color: "#0F172A", textAlign: "center", marginBottom: 12 },
  slideSubtitleLight: { fontFamily: "Inter-Regular", fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 22, maxWidth: 360 },
  onboardingBottomLight: { paddingHorizontal: 24, paddingBottom: 24, width: "100%", maxWidth: 440, alignSelf: "center" },
  dotsRowLight: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20 },
  dotLight: { height: 7, borderRadius: 4 },
  secondaryButtonLight: { width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryButtonTextLight: { fontFamily: "Rajdhani-Bold", fontSize: 17, color: "#0F4C81" },

  /* Login Redesign Layout */
  loginScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loginLayoutContainer: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    flexDirection: "column",
    gap: 24,
  },
  loginSplitLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40,
  },

  /* Left Intro Section */
  leftIntroSection: {
    flex: 1,
    paddingRight: 12,
  },
  leftIntroMobile: {
    alignItems: "center",
    textAlign: "center",
    paddingRight: 0,
    marginBottom: 8,
  },
  brandBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  kspLogoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  brandTitleBox: {
    justifyContent: "center",
  },
  brandTitleText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 28,
    color: "#0F172A",
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  brandSubTitleText: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 10,
    color: "#0F4C81",
    letterSpacing: 1,
    marginTop: 2,
  },
  headlineBox: {
    marginBottom: 28,
  },
  headlineText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 32,
    color: "#0F172A",
    lineHeight: 38,
    marginBottom: 10,
  },
  taglineText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    maxWidth: 480,
  },
  capabilitiesContainer: {
    gap: 14,
  },
  capabilityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  capabilityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(15,76,129,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  capabilityTextContent: {
    flex: 1,
  },
  capabilityTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13.5,
    color: "#0F172A",
    marginBottom: 2,
  },
  capabilityDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  /* Right Card Section */
  rightCardSection: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 28,
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  langRowPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  langChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  langChipActive: {
    backgroundColor: "#0F4C81",
  },
  langChipText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#475569",
  },
  langChipTextActive: {
    color: "#FFFFFF",
  },
  authCardHeader: {
    marginBottom: 20,
  },
  authCardTitle: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 24,
    color: "#0F172A",
    lineHeight: 28,
  },
  authCardSub: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  errorBoxLight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorTextLight: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 16,
    flex: 1,
  },
  inputGroupLight: {
    marginBottom: 16,
  },
  inputLabelLight: {
    fontFamily: "Inter-SemiBold",
    fontSize: 11.5,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapperLight: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIconLeft: {
    position: "absolute",
    left: 14,
    zIndex: 10,
  },
  textInputLight: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 42,
    paddingRight: 44,
    color: "#0F172A",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  pwToggleLight: {
    position: "absolute",
    right: 14,
    zIndex: 10,
  },

  /* Role Selection Grid */
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleCard: {
    width: "48.5%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    minHeight: 64,
    justifyContent: "center",
  },
  roleCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#0F4C81",
  },
  roleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  roleIconText: {
    fontSize: 16,
  },
  roleCheckBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
  },
  roleCheckText: {
    color: "white",
    fontSize: 10,
    fontFamily: "Inter-Bold",
  },
  roleLabelText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#475569",
  },
  roleLabelTextSelected: {
    fontFamily: "Inter-SemiBold",
    color: "#0F4C81",
  },

  /* Main Button */
  loginPrimaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0F4C81",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginPrimaryButtonText: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 17,
    color: "white",
    letterSpacing: 0.5,
  },

  /* Security Footer */
  securityFooterStamp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  securityFooterText: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: "#0F4C81",
  },
  tlsSubtext: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 9.5,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
  },

  /* Success Screen */
  successContainerLight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  successCardLight: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 36,
    alignItems: "center",
    maxWidth: 420,
    width: "100%",
    shadowColor: "#0F4C81",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  successCircleLight: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(15,76,129,0.08)",
    borderWidth: 2,
    borderColor: "#0F4C81",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitleLight: {
    fontFamily: "Rajdhani-Bold",
    fontSize: 24,
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitleLight: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  loaderBarBgLight: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  loaderBarLight: {
    width: "100%",
    height: "100%",
  },
});
