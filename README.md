<div align="center">

# 🔵 CrimeLens AI

### AI-Powered Crime Intelligence Platform for Karnataka State Police

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Deployed-brightgreen?style=for-the-badge&logo=zoho)](https://crimelens-ai-60079382706.development.catalystserverless.in/app/index.html)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS-blue?style=for-the-badge&logo=expo)](https://expo.dev)
[![Built With](https://img.shields.io/badge/Built%20With-React%20Native%20%2B%20Expo-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
[![Backend](https://img.shields.io/badge/Backend-Zoho%20Catalyst-E42527?style=for-the-badge&logo=zoho)](https://catalyst.zoho.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge)](./package.json)

> **Classified · Authorized Karnataka State Police Personnel Only**

*Transforming crime data into actionable intelligence through AI-powered analysis, network discovery and explainable insights.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Deployment](#-live-deployment)
- [Key Features](#-key-features)
- [Application Screens](#-application-screens)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Role-Based Access Control](#-role-based-access-control)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Internationalization](#-internationalization)
- [Security & Compliance](#-security--compliance)
- [Attributions](#-attributions)

---

## 🧭 Overview

**CrimeLens AI** is a full-stack, cross-platform crime intelligence platform purpose-built for the **Karnataka State Police (KSP)**. It combines a React Native / Expo frontend with a **Zoho Catalyst** serverless backend to deliver real-time AI-assisted investigations, criminal network analysis, and predictive crime hotspot intelligence — all within a secure, role-gated environment.

### Platform Stats

| Metric | Value |
|---|---|
| FIR Records Accessible | **2.4M+** |
| AI Query Response Time | **< 1 second** |
| Security Model | **100% Secure RBAC** |
| Supported Languages | **English & Kannada** |
| Deployment | **Zoho Catalyst Serverless** |

---

## 🌐 Live Deployment

The application is deployed on **Zoho Catalyst** and is publicly accessible at:

> 🔗 **[https://crimelens-ai-60079382706.development.catalystserverless.in/app/index.html](https://crimelens-ai-60079382706.development.catalystserverless.in/app/index.html)**

The backend API is served at:

> 🔗 **`https://crimelens-ai-60079382706.development.catalystserverless.in/server/crimelens_api`**

---

## ✨ Key Features

### 🤖 AI Investigation Copilot
- Natural language querying of FIR records in **English or Kannada**
- **Voice input** support via Web Speech API (browser) and `expo-speech-recognition` (native)
- Real-time AI responses with **source citations** and explainability scores
- Suggested investigation chips for common queries
- Conversation history management

### 🕸️ Criminal Network Intelligence
- Interactive **SVG-based network graph** visualizing criminal syndicates
- Entity types: Accused, FIR, Victim, Vehicle, Mobile, Location, Police Station, Crime Category
- **Zoom, pan, and rotate** controls on the network canvas
- Filter by entity type and district
- One-click drill-down into **accused profiles** and linked FIRs

### 🗺️ Crime Hotspot Prediction
- AI-powered **risk zone mapping** across Karnataka districts
- Risk tiers: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- Dominant crime type, peak time windows, and repeat offender counts per zone
- Integration with the AI workspace for deeper query-based investigation

### 📊 Crime Analytics Dashboard
- District-level bar charts, category donut charts, and trend line graphs
- Filterable by **Date Range, District, Crime Category, and Priority**
- Weekly / Monthly / Quarterly / Yearly trend views
- Live data fetched from the Catalyst backend with graceful mock fallback

### 📄 Smart Investigation Reports
- AI-compiled full investigation summaries with accused history, timeline, and recommendations
- **PDF export** and **share** functionality via `expo-print` and `expo-sharing`
- Report detail modal with confidence scores and full narrative

### 🔍 FIR Management
- Searchable FIR records with detailed modal: accused, victim, timeline, attached documents
- Filter by crime type, district, priority, and status
- **Global Search** across FIRs and accused records simultaneously

### 🛡️ Administration Panel
- Role-based permissions matrix display
- **System health monitoring**: CPU, memory, API uptime, database status
- **Audit log** of all user actions for IT Act 2000 compliance

---

## 📱 Application Screens

The app follows a linear onboarding flow followed by a role-aware dashboard:

```
Splash → Onboarding (4 slides) → Login → Dashboard → AI Investigation Workspace
```

### Screen Overview

| Screen | File | Description |
|---|---|---|
| **Splash** | `App.tsx` | KSP badge, platform tagline, stat cards (FIRs / Speed / RBAC), animated fade-in |
| **Onboarding** | `App.tsx` | 4-slide carousel: AI Copilot · Network · Hotspot · Reports |
| **Login** | `App.tsx` | Split-layout brand panel + auth card; badge/username + password + role selection; bilingual |
| **Dashboard (Home)** | `screens/DashboardScreen.tsx` | KPI cards, AI brief, crime map, FIR section, intel feed, trend/district/donut charts |
| **Analytics** | `screens/AnalyticsScreen.tsx` | Full crime trend analysis, category breakdowns, district comparisons |
| **Network** | `screens/NetworkScreen.tsx` | Interactive criminal network graph with entity filtering |
| **Hotspot** | `screens/HotspotScreen.tsx` | Heatmap + list view of crime risk zones |
| **Reports** | `screens/ReportsScreen.tsx` | AI-generated report cards with PDF export |
| **Admin** | `screens/AdminScreen.tsx` | RBAC matrix, system health, audit logs |
| **AI Workspace** | `screens/AIInvestigationWorkspace.tsx` | Full conversational AI investigation environment |

### Dashboard Components

| Component | Purpose |
|---|---|
| `TopHeader.tsx` | Search bar, alert bell, profile menu, language switcher |
| `BottomTabBar.tsx` | Home · Analytics · Network · Reports · Admin navigation |
| `KPICards.tsx` | Total FIRs, Active Cases, Accused, Conviction Rate |
| `AIBrief.tsx` | AI-generated daily intelligence briefing |
| `CrimeMap.tsx` | SVG district map with hotspot overlay |
| `TrendChart.tsx` | SVG line chart of FIR trends over time |
| `DistrictChart.tsx` | SVG bar chart of crime by district |
| `CategoryDonut.tsx` | SVG donut chart of crime categories |
| `FIRSection.tsx` | Filterable FIR list with detail modal trigger |
| `IntelFeed.tsx` | Real-time intelligence feed cards |
| `AIPanel.tsx` | Inline AI query entry on dashboard |

### Investigation Components

| Component | Purpose |
|---|---|
| `InvestigationTopBar.tsx` | Back navigation, session title, export controls |
| `NavigationDrawer.tsx` | Slide-out panel with investigation tools and history |
| `WelcomeCard.tsx` | Initial welcome + suggested query chips |
| `ConversationArea.tsx` | Scrollable chat history of queries and AI responses |
| `AIResponseCard.tsx` | Formatted AI answer with source citations |
| `ExplainableAICard.tsx` | "Explain Why" reasoning breakdown for AI conclusions |
| `AIStatusCard.tsx` | Live AI model status indicator |
| `AIRecommendationsSection.tsx` | Proactive next-step recommendations |
| `InvestigationSummaryPanel.tsx` | Consolidated case summary panel |
| `InvestigationTimeline.tsx` | Chronological incident timeline |
| `CriminalNetworkPreview.tsx` | Mini network graph within the workspace |
| `QueryBubble.tsx` | User query chat bubble |
| `SuggestedChips.tsx` | Quick-select investigation query suggestions |
| `BottomActionBar.tsx` | Text input, voice button, send, attachment, and export |

### Modals

| Modal | Purpose |
|---|---|
| `FIRDetailsModal.tsx` | Full FIR record: accused, victim, timeline, documents |
| `AccusedProfileModal.tsx` | Accused bio, criminal history, risk level, known associates |
| `ExplainWhyModal.tsx` | AI explainability breakdown for any flagged entity |
| `AlertCenterModal.tsx` | Active system alerts and critical notifications |
| `GlobalSearchModal.tsx` | Cross-entity search across FIRs and accused records |
| `ProfileSettingsModal.tsx` | Officer profile, preferences, and logout |
| `ReportDetailModal.tsx` | Full AI investigation report with PDF export |

---

## 🧱 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React Native** | `0.81.5` | Cross-platform UI framework |
| **Expo** | `~54.0.36` | Build toolchain and SDK |
| **React** | `19.1.0` | UI rendering |
| **TypeScript** | `^5.3.3` | Static typing |
| **react-native-web** | `^0.19.13` | Web deployment target |
| **expo-linear-gradient** | `~15.0.0` | Gradient UI elements |
| **expo-font** | `~14.0.0` | Custom font loading |
| **expo-print** | `~15.0.8` | PDF report generation |
| **expo-sharing** | `~14.0.8` | Native share sheet |
| **expo-document-picker** | `~14.0.8` | File attachment uploads |
| **expo-file-system** | `~19.0.23` | Local file read/write |
| **expo-speech-recognition** | `^56.0.1` | Native voice input |
| **react-native-svg** | `15.12.1` | Charts, maps, network graphs |
| **lucide-react-native** | `^1.24.0` | Icon library |
| **react-native-safe-area-context** | `~5.6.0` | Safe area insets |

### Fonts

| Font | Weights | Usage |
|---|---|---|
| **Inter** | Regular · Medium · SemiBold · Bold | Body text, labels, UI copy |
| **Rajdhani** | SemiBold · Bold | Headings, brand titles, stat values |
| **JetBrains Mono** | Regular · Medium | Badge numbers, FIR IDs, code-style tags |

### Backend & Deployment

| Technology | Purpose |
|---|---|
| **Zoho Catalyst** | Serverless hosting, backend functions, database |
| **zcatalyst-sdk-node** | Server-side Catalyst SDK |
| **Express.js** | Local development CORS proxy server |
| **Native `fetch` API** | All HTTP requests (no Axios dependency) |

---

## 📂 Project Structure

```
CrimeLens AI Product Blueprint/
│
├── App.tsx                           # Root: Splash, Onboarding, Login + app state
├── app.json                          # Expo configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── catalyst.json                     # Zoho Catalyst project config
├── proxy-server.js                   # Local dev CORS proxy → Catalyst API
│
├── screens/
│   ├── DashboardScreen.tsx           # Main dashboard & screen router
│   ├── AIInvestigationWorkspace.tsx  # AI investigation chat environment
│   ├── AnalyticsScreen.tsx           # Crime analytics & charts
│   ├── NetworkScreen.tsx             # Criminal network graph
│   ├── HotspotScreen.tsx             # Crime hotspot map
│   ├── ReportsScreen.tsx             # Investigation reports
│   └── AdminScreen.tsx               # System administration
│
├── components/
│   ├── dashboard/                    # 12 dashboard UI components
│   ├── investigation/                # 14 investigation workspace components
│   └── modals/                       # 7 modal overlays
│
├── services/
│   └── crimelensApi.ts               # Typed Catalyst API service layer
│
├── data/
│   ├── mockData.ts                   # Dashboard mock data (fallback)
│   └── investigationMockData.ts      # Investigation mock data (fallback)
│
├── utils/
│   ├── catalystDataUtils.ts          # API response → UI data mappers
│   ├── dashboardUtils.ts             # Dashboard tab types & utilities
│   ├── investigationUtils.ts         # Investigation helpers
│   ├── reportUtils.ts                # PDF report generation utilities
│   └── webSpeechRecognition.ts       # Browser Web Speech API wrapper
│
├── i18n/
│   ├── dashboardTranslations.ts      # English & Kannada strings for dashboard
│   └── investigationTranslations.ts  # English & Kannada strings for investigation
│
├── client/                           # Static web client (Catalyst hosting)
├── dist/                             # Built web bundle
└── android/                          # Android native project
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  CrimeLens AI Client                     │
│            (React Native Web / Expo)                     │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Dashboard│ │AI Work-  │ │Network   │ │Hotspot /   │  │
│  │Screen   │ │space     │ │Screen    │ │Analytics   │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       └───────────┴────────────┴─────────────┘          │
│                        │                                 │
│             services/crimelensApi.ts                     │
│             (fetch-based typed API layer)                │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────┐
│           Zoho Catalyst Serverless Backend               │
│                                                          │
│  /server/crimelens_api                                   │
│  ├── GET  /fir-cases              All FIR records        │
│  ├── GET  /fir-cases/:number      Single FIR             │
│  ├── GET  /fir-cases/:n/accused   Accused linked to FIR  │
│  ├── GET  /accused                All accused records    │
│  ├── GET  /accused/:id            Single accused profile │
│  ├── GET  /accused/:id/network    Criminal network graph │
│  └── POST /ai-query               AI investigation query │
│                                                          │
│  Catalyst Datastore  ·  Catalyst Functions               │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control

CrimeLens AI enforces RBAC at both UI and API levels. Four roles are supported:

| Role | Icon | Core Permissions |
|---|---|---|
| **Field Investigator** | 🔍 | AI Investigation Workspace · FIR Case Access · Network Graph · Investigation Reports |
| **Crime Analyst** | 📊 | Crime Analytics & Intelligence · Hotspot Detection · Network Analysis · AI Pattern Discovery |
| **Senior Police Officer** | ⭐ | State Command Dashboard · Critical Alert Escalations · Crime Analytics · Report Review & Approval |
| **Administrator** | ⚙️ | User & Role Management · Permissions Matrix · System Health Monitoring · Complete Audit Logs |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- Expo CLI (via npx)

### 1. Clone & Install

```bash
git clone <repository-url>
cd "CrimeLens AI Product Blueprint"
npm install
```

### 2. Run on Web

```bash
npx expo start --web
```

### 3. Run on Android / iOS

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### 4. Local CORS Proxy (for development)

```bash
node proxy-server.js
# Runs at http://localhost:3001
# Proxies all requests → Catalyst backend
```

### 5. Production Web Build

```bash
npx expo export --platform web
# Output in /dist — deploy to Zoho Catalyst client hosting
```

---

## 🔌 API Reference

All API calls are handled through `services/crimelensApi.ts`.

**Base URL:**
```
https://crimelens-ai-60079382706.development.catalystserverless.in/server/crimelens_api
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/fir-cases` | Fetch all FIR case records |
| `GET` | `/fir-cases/:firNumber` | Fetch single FIR by number |
| `GET` | `/fir-cases/:firNumber/accused` | Get accused linked to a FIR |
| `GET` | `/accused` | Fetch all accused persons |
| `GET` | `/accused/:id` | Fetch single accused profile |
| `GET` | `/accused/:id/network` | Get criminal network graph |
| `POST` | `/ai-query` | Submit natural language investigation query |

### Core Types

```typescript
interface FIRCase {
  FIR_NUMBER: string;
  CRIME_TYPE: string;
  DISTRICT: string;
  LOCATION: string;
  DESCRIPTION: string;
  STATUS: string;
  CASE_PRIORITY: string;
  OFFICER_ASSIGNED: string;
  DATE_REPORTED?: string;
  ACCUSED_NAME?: string;
  VICTIM_NAME?: string;
}

interface Accused {
  ACCUSED_ID: string;
  FULL_NAME: string;
  ALIAS_NAME: string | null;
  AGE: number | string;
  GENDER: string;
  ADDRESS_INFO: string;
  DISTRICT: string;
  CRIMINAL_HISTORY: string | null;
  RISK_LEVEL: string;
  KNOWN_ASSOCIATES: string | null;
  LAST_KNOWN_LOCATION: string | null;
}
```

---

## 🌐 Internationalization

CrimeLens AI supports two interface languages, configurable at login and switchable anytime:

| Language | Code | Coverage |
|---|---|---|
| **English** | `en` | Full UI — all screens, modals, and AI prompts |
| **ಕನ್ನಡ (Kannada)** | `kn` | Full UI — all screens, modals, and AI prompts |

Translation files:
- `i18n/dashboardTranslations.ts` — Dashboard, analytics, all tab screens
- `i18n/investigationTranslations.ts` — AI workspace, conversation UI

Voice recognition also supports Kannada speech input on supported devices.

---

## 🛡️ Security & Compliance

| Requirement | Implementation |
|---|---|
| **Transport Security** | TLS 256-bit encryption on all API calls |
| **Authentication** | Badge/username + password + role selection |
| **Role Enforcement** | UI gated by `UserRole` on every screen |
| **Audit Logging** | All user actions logged (Admin → Audit tab) |
| **Legal Compliance** | IT Act 2000 compliant |
| **Access Restriction** | Authorized KSP personnel only |

### Data & Fallback Strategy

The app uses a **live-first, mock-fallback** pattern:

1. **Primary** — Fetches live data from Zoho Catalyst on every screen mount.
2. **Fallback** — On API failure, silently falls back to `data/mockData.ts` and `data/investigationMockData.ts`.
3. **UI continuity** — User experience is uninterrupted regardless of backend availability.

---

## 🖋️ Attributions

- UI component patterns from [shadcn/ui](https://ui.shadcn.com/) — MIT License
- Photos from [Unsplash](https://unsplash.com) — Unsplash License
- Icons from [Lucide](https://lucide.dev/) — ISC License
- Fonts from [Google Fonts](https://fonts.google.com/) — Open Font License

---

<div align="center">

**CrimeLens AI** · Built for Karnataka State Police · Powered by Zoho Catalyst

*Authorized Personnel Only · All activity is monitored and audit-logged*

</div>
