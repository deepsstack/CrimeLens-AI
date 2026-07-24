/**
 * screens/AIInvestigationWorkspace.tsx
 * CrimeLens AI — AI Investigation Workspace Screen
 *
 * Top-level screen that owns all conversation state, orchestrates
 * investigation component composition, and wires up all handlers.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  Platform,
  Share,
} from "react-native";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

// ── Native speech recognition (expo-speech-recognition) ──────────────────────
// TEMPORARILY DISABLED for Expo Go compatibility.
// The native module requires a custom dev build (npx expo run:android).
// On web, browser SpeechRecognition is used instead (see utils/webSpeechRecognition.ts).
// To re-enable: uncomment the import below and remove the no-op shim further below.
//
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";

import {
  webSpeechRecognizer,
  WebSpeechRecognizer,
} from "../utils/webSpeechRecognition";

// ======================================================
// i18n
// ======================================================

import {
  T,
  type Lang,
} from "../i18n/investigationTranslations";

// ======================================================
// MOCK DATA & TYPES
// ======================================================

import mockData from "../data/investigationMockData";

import type {
  Attachment,
  InvestigationSummary,
  ExplainabilityData,
  NetworkGraphData,
  TimelineEntry,
  Recommendation,
} from "../data/investigationMockData";

// ======================================================
// CATALYST API SERVICE
// ======================================================

import {
  postAIQuery,
} from "../services/crimelensApi";

import type {
  AIQueryResponse,
} from "../services/crimelensApi";

// ======================================================
// INVESTIGATION COMPONENTS
// ======================================================

import {
  InvestigationTopBar,
} from "../components/investigation/InvestigationTopBar";

import {
  NavigationDrawer,
} from "../components/investigation/NavigationDrawer";

import {
  WelcomeCard,
} from "../components/investigation/WelcomeCard";

import {
  SuggestedChips,
} from "../components/investigation/SuggestedChips";

import {
  QueryBubble,
} from "../components/investigation/QueryBubble";

import {
  AIResponseCard,
} from "../components/investigation/AIResponseCard";

import {
  InvestigationSummaryPanel,
} from "../components/investigation/InvestigationSummaryPanel";

import {
  ExplainableAICard,
} from "../components/investigation/ExplainableAICard";

import {
  CriminalNetworkPreview,
} from "../components/investigation/CriminalNetworkPreview";

import {
  InvestigationTimeline,
} from "../components/investigation/InvestigationTimeline";

import {
  AIRecommendationsSection,
} from "../components/investigation/AIRecommendationsSection";

import {
  BottomActionBar,
} from "../components/investigation/BottomActionBar";

import {
  AIStatusCard,
} from "../components/investigation/AIStatusCard";

// ======================================================
// NATIVE SPEECH RECOGNITION — TEMPORARILY DISABLED
// (Expo Go compatibility: native module requires custom dev build)
//
// No-op shim replaces ExpoSpeechRecognitionModule and
// useSpeechRecognitionEvent so that:
//   • Expo Go loads without crashing
//   • Web voice (window.SpeechRecognition) continues working
//   • All native call-sites are safely silenced
//
// To re-enable: comment out this shim block and uncomment
// the import at the top of the file.
// ======================================================
const ExpoSpeechRecognitionModule = {
  start: (_opts: unknown) => { /* no-op */ },
  stop:  () =>              { /* no-op */ },
  abort: () =>              { /* no-op */ },
  requestPermissionsAsync: async () => ({ granted: false as const }),
};
function useSpeechRecognitionEvent(
  _eventName: string,
  _handler: (...args: any[]) => void
): void {
  // no-op — native speech module is disabled for Expo Go
}

// ======================================================
// LOCAL TYPES
// ======================================================

export type Message = {
  id: string;
  type: "query" | "response";
  text: string;
  timestamp: Date;
  data?: AIResponseData;
};

export type AIResponseData = {
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

  summary?: InvestigationSummary;
  explainability?: ExplainabilityData;
  network?: NetworkGraphData;
  timeline?: TimelineEntry[];
  recommendations?: Recommendation[];
};

// ======================================================
// #23 — SAVED INVESTIGATION TYPE
// ======================================================

type OfficerNote = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  officerName: string;
  officerBadge: string;
  pinned: boolean;
};

type InvestigationTaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed";

type InvestigationTaskPriority =
  | "High"
  | "Medium"
  | "Low";

type InvestigationTask = {
  id: string;
  text: string;
  status: InvestigationTaskStatus;
  priority: InvestigationTaskPriority;
  dueDate?: string;
  assignedOfficerName: string;
  assignedOfficerBadge: string;
  createdAt: string;
  updatedAt?: string;
};

type EvidenceType = "Photo" | "Document" | "CCTV" | "Other";

type InvestigationEvidence = {
  id: string;
  evidenceId: string;
  title: string;
  description: string;
  type: EvidenceType;
  fileName: string;
  fileUri: string;
  mimeType?: string;
  fileSize?: number;
  officerName: string;
  officerBadge: string;
  createdAt: string;
};

type CaseStatus = "Open" | "Under Investigation" | "Escalated" | "Closed";

type CaseActivity = {
  id: string;
  action: "Assigned" | "Reassigned" | "Status Changed" | "Handover";
  description: string;
  officerName: string;
  officerBadge: string;
  createdAt: string;
};

type CaseCollaboration = {
  status: CaseStatus;
  assignedOfficerName: string;
  assignedOfficerBadge: string;
  handoverNote: string;
  updatedAt: string;
  activity: CaseActivity[];
};

type SavedInvestigation = {
  id: string;
  title: string;
  query: string;
  createdAt: string;
  officerName: string;
  officerBadge: string;
  lang: Lang;
  messages: Message[];
  notes?: OfficerNote[];
  tasks?: InvestigationTask[];
  evidence?: InvestigationEvidence[];
  collaboration?: CaseCollaboration;
};

const SAVED_INVESTIGATIONS_KEY =
  "crimelens_saved_investigations_v1";

// ======================================================
// #28 — ROLE-BASED ACCESS CONTROL (RBAC)
// ======================================================

// ======================================================
// PROPS
// ======================================================

export type UserRole =
  | "investigator"
  | "analyst"
  | "senior_officer"
  | "administrator";

export type AuthenticatedUser = {
  username: string;
  role: UserRole;
};

type Permission =
  | "save"
  | "notes"
  | "tasks"
  | "evidence"
  | "collaboration"
  | "reassign"
  | "status"
  | "report"
  | "share";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  investigator: [
    "save", "notes", "tasks", "evidence",
    "collaboration", "report", "share",
  ],
  analyst: [
    "report", "share",
  ],
  senior_officer: [
    "save", "notes", "tasks", "evidence",
    "collaboration", "reassign", "status",
    "report", "share",
  ],
  administrator: [
    "save", "notes", "tasks", "evidence",
    "collaboration", "reassign", "status",
    "report", "share",
  ],
};

export type AIInvestigationWorkspaceProps = {
  lang: Lang;
  setLang: (l: Lang) => void;
  onBack?: () => void;
  currentUser: AuthenticatedUser;
};

// ======================================================
// HELPERS
// ======================================================

function uid(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

// ======================================================
// PRELOADED EXAMPLE CONVERSATION
// ======================================================

function buildPreloadedMessages(): Message[] {
  return [];
}

// ======================================================
// MAP CATALYST RESPONSE → UI DATA
// ======================================================

function mapCatalystResponse(
  apiResp: AIQueryResponse,
  lang: Lang
): AIResponseData {

  const kn =
    lang === "kn";

  const bilingual = (
    english: string,
    kannada: string
  ): string =>
    kn ? kannada : english;

  const translateRelationship = (
    value: string
  ): string => {
    if (!kn) return value;

    const normalized =
      value.trim().toLowerCase();

    if (normalized === "known associate") {
      return "ತಿಳಿದ ಸಹಚರ";
    }

    if (normalized === "connected") {
      return "ಸಂಪರ್ಕಿತ";
    }

    return value;
  };

  // ===================================================
  // CONFIDENCE SCORE
  // ===================================================

  const rawConfidence =
    Number(
      apiResp.confidenceScore ?? 0
    );

  const confidencePct =
    rawConfidence <= 1
      ? Math.round(
        Math.min(
          100,
          Math.max(
            0,
            rawConfidence * 100
          )
        )
      )
      : Math.round(
        Math.min(
          100,
          Math.max(
            0,
            rawConfidence
          )
        )
      );

  // ===================================================
  // BACKEND RESPONSE DATA
  // ===================================================

  const responseData: any =
    apiResp.data ?? {};

  const firRefs:
    AIResponseData["linkedEntities"]["firs"] =
    [];

  const offenders:
    AIResponseData["linkedEntities"]["offenders"] =
    [];

  const vehicles:
    AIResponseData["linkedEntities"]["vehicles"] =
    [];

  const locations: string[] = [];

  // Keep original records so priority/risk can be
  // calculated from the REAL Catalyst records.
  const sourceFirRecords: any[] = [];
  const sourceAccusedRecords: any[] = [];

  // ===================================================
  // DUPLICATE PREVENTION
  // ===================================================

  const seenFirs =
    new Set<string>();

  const seenOffenders =
    new Set<string>();

  const seenLocations =
    new Set<string>();

  // ===================================================
  // ADD LOCATION
  // ===================================================

  const addLocation = (
    location?: string | null
  ) => {

    const value =
      String(
        location ?? ""
      ).trim();

    if (
      !value ||
      seenLocations.has(value)
    ) {
      return;
    }

    seenLocations.add(value);

    locations.push(value);
  };

  // ===================================================
  // ADD FIR
  // ===================================================

  const addFir = (
    fir: any
  ) => {

    if (!fir) {
      return;
    }

    const number =
      String(
        fir.FIR_NUMBER ??
        fir.firNumber ??
        fir.number ??
        ""
      ).trim();

    if (
      !number ||
      seenFirs.has(number)
    ) {
      return;
    }

    seenFirs.add(number);

    sourceFirRecords.push(fir);

    // -------------------------------------------------
    // CRIME TYPE
    // -------------------------------------------------

    const crimeType =
      String(
        fir.CRIME_TYPE ??
        fir.crimeType ??
        fir.OFFENCE_TYPE ??
        fir.offenceType ??
        ""
      ).trim();

    // -------------------------------------------------
    // DISTRICT
    // -------------------------------------------------

    const district =
      String(
        fir.DISTRICT ??
        fir.district ??
        ""
      ).trim();

    // -------------------------------------------------
    // LOCATION
    // -------------------------------------------------

    const location =
      String(
        fir.LOCATION ??
        fir.location ??
        fir.INCIDENT_LOCATION ??
        fir.incidentLocation ??
        ""
      ).trim();

    // -------------------------------------------------
    // DATE
    // -------------------------------------------------

    const rawDate =
      fir.DATE_REPORTED ??
      fir.dateReported ??
      fir.INCIDENT_DATE ??
      fir.incidentDate ??
      fir.DATE_OF_OFFENCE ??
      fir.dateOfOffence ??
      fir.date ??
      "";

    const date =
      rawDate
        ? String(rawDate)
          .split(" ")[0]
        : "";

    // -------------------------------------------------
    // ADD FIR TO UI
    // -------------------------------------------------

    firRefs.push({
      number,
      crimeType,
      crimeTypeKn: "",
      district,
      districtKn: "",
      date,
    });

    // -------------------------------------------------
    // ADD LOCATION INFORMATION
    // -------------------------------------------------

    addLocation(location);

    addLocation(district);
  };

  // ===================================================
  // ADD ACCUSED / OFFENDER
  // ===================================================

  const addAccused = (
    accused: any,
    linkedFIRs: string[] = []
  ) => {

    if (!accused) {
      return;
    }

    const id =
      String(
        accused.ACCUSED_ID ??
        accused.accusedId ??
        accused.id ??
        ""
      ).trim();

    if (!id) {
      return;
    }

    // If this offender already exists, merge any new
    // FIR links instead of creating a duplicate.
    const existingOffender =
      offenders.find(
        (offender) =>
          offender.id === id
      );

    if (existingOffender) {

      linkedFIRs.forEach(
        (firNumber) => {

          if (
            firNumber &&
            !existingOffender.linkedFIRs.includes(
              firNumber
            )
          ) {

            existingOffender.linkedFIRs.push(
              firNumber
            );

          }
        }
      );

      return;
    }

    seenOffenders.add(id);

    sourceAccusedRecords.push(accused);

    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    const name =
      String(
        accused.FULL_NAME ??
        accused.fullName ??
        accused.name ??
        accused.ALIAS_NAME ??
        accused.aliasName ??
        "Unknown"
      ).trim();

    // -------------------------------------------------
    // ADD OFFENDER
    // -------------------------------------------------

    offenders.push({
      id,

      name,

      priorConvictions:
        Number(
          accused.PRIOR_CONVICTIONS ??
          accused.priorConvictions ??
          0
        ),

      linkedFIRs:
        Array.from(
          new Set(
            linkedFIRs.filter(
              Boolean
            )
          )
        ),
    });

    // -------------------------------------------------
    // LOCATIONS
    // -------------------------------------------------

    addLocation(
      accused.LAST_KNOWN_LOCATION ??
      accused.lastKnownLocation
    );

    addLocation(
      accused.DISTRICT ??
      accused.district
    );
  };

  // ===================================================
  // 1. SINGLE FIR LOOKUP
  // ===================================================

  if (
    responseData.fir
  ) {

    addFir(
      responseData.fir
    );

  }

  // ===================================================
  // 2. MULTIPLE FIR / FIR SEARCH RESULTS
  // ===================================================

  const possibleFirArrays = [

    responseData.firs,

    responseData.cases,

    responseData.matches,

    responseData.firCases,

    responseData.relatedFirs,

    responseData.relatedFIRs,

  ];

  for (
    const possibleArray
    of possibleFirArrays
  ) {

    if (
      Array.isArray(
        possibleArray
      )
    ) {

      possibleArray.forEach(
        addFir
      );

    }
  }

  // ===================================================
  // 3. SINGLE ACCUSED LOOKUP
  // ===================================================

  if (
    responseData.accused
  ) {

    addAccused(
      responseData.accused
    );

  }

  // ===================================================
  // 4. FIR → ACCUSED RECORDS
  // ===================================================

  const accusedArrays = [

    responseData.accusedList,

    responseData.accusedProfiles,

    responseData.linkedAccused,

    responseData.accusedRecords,

  ];

  for (
    const possibleArray
    of accusedArrays
  ) {

    if (
      !Array.isArray(
        possibleArray
      )
    ) {
      continue;
    }

    possibleArray.forEach(
      (item: any) => {

        const accused =
          item?.accused ??
          item?.ACCUSED ??
          item;

        const linkedFir =
          item?.FIR_NUMBER ??
          item?.firNumber ??
          apiResp.relatedFirNumber;

        addAccused(
          accused,

          linkedFir
            ? [
              String(
                linkedFir
              ),
            ]
            : []
        );

      }
    );
  }

  // ===================================================
  // 5. REPEAT OFFENDER ANALYSIS
  // ===================================================

  const repeatOffenderArrays = [

    responseData.repeatOffenders,

    responseData.repeatOffenderRecords,

    responseData.offenders,

  ];

  for (
    const possibleArray
    of repeatOffenderArrays
  ) {

    if (
      !Array.isArray(
        possibleArray
      )
    ) {
      continue;
    }

    possibleArray.forEach(
      (item: any) => {

        const accused =
          item?.accused ??
          item?.profile ??
          item;

        const linkedFIRsRaw =
          item?.linkedFIRs ??
          item?.linkedFirs ??
          item?.firNumbers ??
          item?.FIR_NUMBERS ??
          [];

        const linkedFIRs =
          Array.isArray(
            linkedFIRsRaw
          )
            ? linkedFIRsRaw.map(
              (value: any) =>
                String(value)
            )
            : [];

        addAccused(
          accused,
          linkedFIRs
        );

      }
    );
  }

  // ===================================================
  // 6. CRIMINAL NETWORK DATA
  // ===================================================

  const networkData =
    responseData.network ??
    responseData.criminalNetwork ??
    (
      responseData.sourceAccused &&
        Array.isArray(
          responseData.relationships
        )
        ? responseData
        : undefined
    );

  if (
    networkData
  ) {

    // -------------------------------------------------
    // SOURCE ACCUSED
    // -------------------------------------------------

    if (
      networkData.sourceAccused
    ) {

      addAccused(
        networkData.sourceAccused
      );

    }

    // -------------------------------------------------
    // CONNECTED ACCUSED
    // -------------------------------------------------

    if (
      Array.isArray(
        networkData.relationships
      )
    ) {

      networkData.relationships.forEach(
        (
          relationshipItem: any
        ) => {

          const connectedAccused =
            relationshipItem
              ?.connectedAccused;

          if (
            !connectedAccused
          ) {
            return;
          }

          const relatedFir =
            relationshipItem
              ?.relationship
              ?.relatedFir;

          addAccused(
            connectedAccused,

            relatedFir
              ? [
                String(
                  relatedFir
                ),
              ]
              : []
          );

        }
      );
    }
  }
  // ===================================================
  // BUILD REAL CRIMINAL NETWORK GRAPH
  // ===================================================

  let realNetwork:
    NetworkGraphData |
    undefined =
    undefined;

  if (
    networkData &&
    networkData.sourceAccused
  ) {

    const graphNodes: any[] = [];
    const graphEdges: any[] = [];

    const addedNodeIds =
      new Set<string>();

    // -------------------------------------------------
    // SOURCE ACCUSED NODE
    // -------------------------------------------------

    const source =
      networkData.sourceAccused;

    const sourceId =
      String(
        source.ACCUSED_ID ??
        source.accusedId ??
        source.id ??
        ""
      ).trim();

    const sourceName =
      String(
        source.FULL_NAME ??
        source.fullName ??
        source.name ??
        source.ALIAS_NAME ??
        source.aliasName ??
        sourceId ??
        "Unknown"
      ).trim() || "Unknown";

    if (sourceId) {

      graphNodes.push({
        id:
          sourceId,

        label:
          sourceName,

        type:
          "accused",
      });

      addedNodeIds.add(
        sourceId
      );
    }

    // -------------------------------------------------
    // CONNECTED ACCUSED NODES + EDGES
    // -------------------------------------------------

    if (
      Array.isArray(
        networkData.relationships
      )
    ) {

      networkData.relationships.forEach(
        (
          relationshipItem: any
        ) => {

          const connected =
            relationshipItem
              ?.connectedAccused;

          if (
            !connected
          ) {
            return;
          }

          const connectedId =
            String(
              connected.ACCUSED_ID ??
              connected.accusedId ??
              connected.id ??
              ""
            ).trim();

          const connectedName =
            String(
              connected.FULL_NAME ??
              connected.fullName ??
              connected.name ??
              connected.ALIAS_NAME ??
              connected.aliasName ??
              connectedId ??
              "Unknown"
            ).trim() || "Unknown";

          if (
            !connectedId
          ) {
            return;
          }

          // ---------------------------------------------
          // ADD CONNECTED ACCUSED NODE
          // ---------------------------------------------

          if (
            !addedNodeIds.has(
              connectedId
            )
          ) {

            graphNodes.push({
              id:
                connectedId,

              label:
                connectedName,

              type:
                "accused",
            });

            addedNodeIds.add(
              connectedId
            );
          }

          // ---------------------------------------------
          // RELATIONSHIP
          // ---------------------------------------------

          const relationship =
            relationshipItem
              ?.relationship ??
            {};

          const rawRelationType =
            String(
              relationship.type ??
              relationship.RELATION_TYPE ??
              "Connected"
            ).trim();

          const relationType =
            translateRelationship(
              rawRelationType
            );

          // ---------------------------------------------
          // ADD EDGE
          // ---------------------------------------------

          if (
            sourceId &&
            connectedId
          ) {

            graphEdges.push({
              from:
                sourceId,

              to:
                connectedId,

              label:
                relationType,

              type:
                relationType,

              strength:
                relationship.strength ??
                relationship.STRENGTH ??
                undefined,

              relatedFir:
                relationship.relatedFir ??
                relationship.RELATED_FIR ??
                undefined,

              status:
                relationship.status ??
                relationship.STATUS ??
                undefined,

              notes:
                relationship.notes ??
                relationship.NOTES ??
                undefined,
            });

          }
        }
      );
    }

    // -------------------------------------------------
    // CREATE NETWORK ONLY WHEN DATA EXISTS
    // -------------------------------------------------

    if (
      graphNodes.length >
      0
    ) {

      realNetwork = {
        nodes:
          graphNodes,

        edges:
          graphEdges,
      };

    }
  }

  // ===================================================
  // 7. BUILD REAL INVESTIGATION SUMMARY
  // ===================================================

  // ---------------------------------------------------
  // REPEAT OFFENDERS
  //
  // A repeat offender here means that the real backend
  // response shows the accused linked to > 1 FIR.
  // ---------------------------------------------------

  const repeatOffenderDetails =
    offenders.filter(
      (offender) =>
        offender.linkedFIRs.length >
        1
    );

  const repeatOffenderNames =
    repeatOffenderDetails.map(
      (offender) =>
        offender.name
    );

  // ---------------------------------------------------
  // KNOWN ASSOCIATES
  //
  // Derived only from real CRIME_NETWORK relationships.
  // ---------------------------------------------------

  const associateNames: string[] =
    [];

  const seenAssociateNames =
    new Set<string>();

  if (
    networkData &&
    Array.isArray(
      networkData.relationships
    )
  ) {

    networkData.relationships.forEach(
      (
        relationshipItem: any
      ) => {

        const connectedAccused =
          relationshipItem
            ?.connectedAccused;

        if (
          !connectedAccused
        ) {
          return;
        }

        const associateName =
          String(
            connectedAccused.FULL_NAME ??
            connectedAccused.fullName ??
            connectedAccused.name ??
            connectedAccused.ALIAS_NAME ??
            connectedAccused.aliasName ??
            ""
          ).trim();

        if (
          !associateName ||
          seenAssociateNames.has(
            associateName
          )
        ) {
          return;
        }

        seenAssociateNames.add(
          associateName
        );

        associateNames.push(
          associateName
        );

      }
    );
  }

  // ---------------------------------------------------
  // PRIORITY
  //
  // Priority is derived from real FIR priority and/or
  // accused risk level.
  // ---------------------------------------------------

  let summaryPriority:
    "High" |
    "Medium" |
    "Low" =
    "Low";

  const priorityValues:
    string[] =
    [];

  sourceFirRecords.forEach(
    (fir: any) => {

      const value =
        String(
          fir.CASE_PRIORITY ??
          fir.casePriority ??
          fir.PRIORITY ??
          fir.priority ??
          ""
        )
          .trim()
          .toLowerCase();

      if (value) {
        priorityValues.push(
          value
        );
      }

    }
  );

  sourceAccusedRecords.forEach(
    (accused: any) => {

      const value =
        String(
          accused.RISK_LEVEL ??
          accused.riskLevel ??
          ""
        )
          .trim()
          .toLowerCase();

      if (value) {
        priorityValues.push(
          value
        );
      }

    }
  );

  if (
    priorityValues.includes(
      "high"
    )
  ) {

    summaryPriority =
      "High";

  } else if (
    priorityValues.includes(
      "medium"
    )
  ) {

    summaryPriority =
      "Medium";

  } else {

    summaryPriority =
      "Low";

  }

  // ---------------------------------------------------
  // TRAVEL / LOCATION PATTERN
  // ---------------------------------------------------

  const travelPattern =
    locations.length > 1
      ? locations.join(
        " → "
      )
      : locations.length === 1
        ? locations[0]
        : bilingual(
          "No travel pattern identified from available records",
          "ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳಿಂದ ಯಾವುದೇ ಸಂಚಾರ ಮಾದರಿ ಗುರುತಿಸಲಾಗಿಲ್ಲ"
        );

  // ---------------------------------------------------
  // SHOULD SUMMARY BE DISPLAYED?
  //
  // Do not show an empty Investigation Summary for
  // unsupported/general queries.
  // ---------------------------------------------------

  const hasInvestigationData =
    firRefs.length > 0 ||
    offenders.length > 0 ||
    locations.length > 0 ||
    associateNames.length > 0;

  // ---------------------------------------------------
  // REAL SUMMARY OBJECT
  // ---------------------------------------------------

  const realSummary:
    InvestigationSummary |
    undefined =
    hasInvestigationData
      ? {

        repeatOffenders: {

          count:
            repeatOffenderDetails.length,

          names:
            repeatOffenderNames,

          details:
            repeatOffenderDetails,

        },

        commonVehicles: {

          // Real vehicle evidence has not yet been
          // connected unless vehicles are populated.
          count:
            vehicles.length,

          registrations:
            vehicles.map(
              (vehicle) =>
                vehicle.registration
            ),

          details:
            vehicles,

        },

        knownAssociates: {

          count:
            associateNames.length,

          names:
            associateNames,

        },

        linkedMobileNumbers: {

          // Real mobile/CDR evidence has not yet
          // been connected.
          count:
            0,

          anonymizedIds:
            [],

        },

        travelPattern,

        frequentLocations:
          locations,

        // Real arrest-history data has not yet been
        // connected, therefore we must not invent it.
        previousArrests:
          0,

        priority:
          summaryPriority,

      }
      : undefined;

  // ===================================================
  // 8. BUILD REAL EXPLAINABILITY DATA
  // ===================================================

  const explainabilityFactors: ExplainabilityData["factors"] = [];

  if (firRefs.length > 0) {
    explainabilityFactors.push({
      labelKey: bilingual(`${firRefs.length} FIR record(s) matched`, `${firRefs.length} FIR ದಾಖಲೆ(ಗಳು) ಹೊಂದಿಕೆಯಾಗಿವೆ`),
      icon: "FileWarning",
      weight: 95,
    });
  }

  if (offenders.length > 0) {
    explainabilityFactors.push({
      labelKey: bilingual(`${offenders.length} accused/offender record(s) matched`, `${offenders.length} ಆರೋಪಿ/ಅಪರಾಧಿ ದಾಖಲೆ(ಗಳು) ಹೊಂದಿಕೆಯಾಗಿವೆ`),
      icon: "AlertTriangle",
      weight: 92,
    });
  }

  if (repeatOffenderDetails.length > 0) {
    const highestLinkedFirCount =
      repeatOffenderDetails.reduce(
        (highest, offender) =>
          Math.max(highest, offender.linkedFIRs.length),
        0
      );

    explainabilityFactors.push({
      labelKey:
        highestLinkedFirCount > 0
          ? bilingual(`Repeat-offender pattern across ${highestLinkedFirCount} FIR record(s)`, `${highestLinkedFirCount} FIR ದಾಖಲೆಗಳಲ್ಲಿ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ ಮಾದರಿ ಕಂಡುಬಂದಿದೆ`)
          : bilingual("Repeat-offender pattern detected", "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ ಮಾದರಿ ಕಂಡುಬಂದಿದೆ"),
      icon: "AlertTriangle",
      weight: 97,
    });
  }

  if (
    networkData &&
    Array.isArray(networkData.relationships) &&
    networkData.relationships.length > 0
  ) {
    explainabilityFactors.push({
      labelKey:
        bilingual(`${networkData.relationships.length} criminal-network connection(s) found`, `${networkData.relationships.length} ಅಪರಾಧ ಜಾಲ ಸಂಪರ್ಕ(ಗಳು) ಕಂಡುಬಂದಿವೆ`),
      icon: "Cpu",
      weight: 96,
    });
  }

  if (locations.length > 0) {
    explainabilityFactors.push({
      labelKey: bilingual(`${locations.length} relevant location(s) identified`, `${locations.length} ಸಂಬಂಧಿತ ಸ್ಥಳ(ಗಳು) ಗುರುತಿಸಲಾಗಿದೆ`),
      icon: "Info",
      weight: 90,
    });
  }

  if (sourceFirRecords.length > 0) {
    const crimeTypes =
      Array.from(
        new Set(
          sourceFirRecords
            .map((fir: any) =>
              String(
                fir.CRIME_TYPE ??
                fir.crimeType ??
                fir.OFFENCE_TYPE ??
                fir.offenceType ??
                ""
              ).trim()
            )
            .filter(Boolean)
        )
      );

    if (crimeTypes.length > 0) {
      explainabilityFactors.push({
        labelKey: bilingual(`Crime classification: ${crimeTypes.join(", ")}`, `ಅಪರಾಧ ವರ್ಗೀಕರಣ: ${crimeTypes.join(", ")}`),
        icon: "FileWarning",
        weight: 94,
      });
    }
  }

  const realExplainability:
    ExplainabilityData |
    undefined =
    explainabilityFactors.length > 0
      ? {
        factors: explainabilityFactors,
        confidenceScore: confidencePct,
        explainabilityScore: Math.round(
          explainabilityFactors.reduce(
            (total, factor) =>
              total + Number(factor.weight ?? 0),
            0
          ) / explainabilityFactors.length
        ),
      }
      : undefined;

  // ===================================================
  // 9. BUILD REAL INVESTIGATION TIMELINE
  // ===================================================

  const realTimeline: TimelineEntry[] = [];

  const seenTimelineEntries =
    new Set<string>();

  // ---------------------------------------------------
  // DATE / TIME HELPERS
  // ---------------------------------------------------

  const normalizeTimelineTimestamp = (
    value: any
  ): string => {

    const raw =
      String(
        value ?? ""
      ).trim();

    if (!raw) {
      return "";
    }

    // Catalyst timestamps may look like:
    // 2026-07-21 16:35:25:772
    // Convert only the separator needed for Date parsing.
    const normalized =
      raw.replace(
        /^(\d{4}-\d{2}-\d{2})\s/,
        "$1T"
      );

    const parsed =
      new Date(normalized);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed.toISOString();
    }

    // If parsing is not supported by the runtime,
    // preserve the real backend value instead of
    // inventing a timestamp.
    return raw;
  };

  const addTimelineEntry = (
    id: string,
    labelKey: string,
    timestampValue: any,
    description: string,
    status:
      "completed" |
      "in_progress" |
      "pending"
  ) => {

    const timestamp =
      normalizeTimelineTimestamp(
        timestampValue
      );

    if (!timestamp) {
      return;
    }

    const dedupeKey =
      `${id}|${timestamp}`;

    if (
      seenTimelineEntries.has(
        dedupeKey
      )
    ) {
      return;
    }

    seenTimelineEntries.add(
      dedupeKey
    );

    realTimeline.push({
      id,
      labelKey,
      timestamp,
      description,
      status,
    });
  };

  // ---------------------------------------------------
  // FIR-DERIVED EVENTS
  //
  // Only events with an actual backend timestamp are
  // added. No dates are fabricated.
  // ---------------------------------------------------

  sourceFirRecords.forEach(
    (
      fir: any,
      index: number
    ) => {

      const firNumber =
        String(
          fir.FIR_NUMBER ??
          fir.firNumber ??
          `FIR-${index + 1}`
        ).trim();

      const crimeType =
        String(
          fir.CRIME_TYPE ??
          fir.crimeType ??
          fir.OFFENCE_TYPE ??
          fir.offenceType ??
          ""
        ).trim();

      const location =
        String(
          fir.LOCATION ??
          fir.location ??
          fir.INCIDENT_LOCATION ??
          fir.incidentLocation ??
          ""
        ).trim();

      const district =
        String(
          fir.DISTRICT ??
          fir.district ??
          ""
        ).trim();

      const caseStatus =
        String(
          fir.CASE_STATUS ??
          fir.caseStatus ??
          fir.STATUS ??
          fir.status ??
          ""
        ).trim();

      // -----------------------------------------------
      // INCIDENT / OFFENCE DATE
      // -----------------------------------------------

      const incidentDate =
        fir.INCIDENT_DATE ??
        fir.incidentDate ??
        fir.DATE_OF_OFFENCE ??
        fir.dateOfOffence ??
        fir.OFFENCE_DATE ??
        fir.offenceDate;

      if (incidentDate) {

        const incidentDescriptionParts =
          [
            crimeType
              ? `${crimeType} incident`
              : "Incident",

            location ||
              district
              ? `at ${location || district}`
              : "",

            firNumber
              ? `(${firNumber})`
              : "",
          ]
            .filter(Boolean)
            .join(" ");

        addTimelineEntry(
          `${firNumber}-incident`,
          bilingual(
            "Incident / Offence",
            "ಘಟನೆ / ಅಪರಾಧ"
          ),
          incidentDate,
          incidentDescriptionParts,
          "completed"
        );
      }

      // -----------------------------------------------
      // FIR REPORTED DATE
      // -----------------------------------------------

      const reportedDate =
        fir.DATE_REPORTED ??
        fir.dateReported ??
        fir.REPORTED_DATE ??
        fir.reportedDate;

      if (reportedDate) {

        addTimelineEntry(
          `${firNumber}-reported`,
          bilingual(
            "FIR Reported",
            "FIR ವರದಿಯಾಗಿದೆ"
          ),
          reportedDate,
          kn
            ? `${firNumber}${district ? ` ${district} ನಲ್ಲಿ` : ""} ವರದಿಯಾಗಿದೆ.`
            : `${firNumber} was reported${district ? ` in ${district}` : ""}.`,
          "completed"
        );
      }

      // -----------------------------------------------
      // RECORD CREATED / CASE REGISTERED
      // -----------------------------------------------

      const createdTime =
        fir.CREATEDTIME ??
        fir.createdTime ??
        fir.CREATED_TIME ??
        fir.createdAt;

      if (createdTime) {

        addTimelineEntry(
          `${firNumber}-created`,
          bilingual(
            "Case Registered",
            "ಪ್ರಕರಣ ನೋಂದಾಯಿಸಲಾಗಿದೆ"
          ),
          createdTime,
          bilingual(
            `${firNumber} record was created in the investigation database.`,
            `${firNumber} ದಾಖಲೆಯನ್ನು ತನಿಖಾ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ರಚಿಸಲಾಗಿದೆ.`
          ),
          "completed"
        );
      }

      // -----------------------------------------------
      // LAST MODIFIED / INVESTIGATION UPDATED
      // -----------------------------------------------

      const modifiedTime =
        fir.MODIFIEDTIME ??
        fir.modifiedTime ??
        fir.MODIFIED_TIME ??
        fir.updatedAt;

      if (modifiedTime) {

        const normalizedStatus =
          caseStatus.toLowerCase();

        const timelineStatus:
          "completed" |
          "in_progress" |
          "pending" =
          normalizedStatus.includes(
            "under investigation"
          ) ||
            normalizedStatus.includes(
              "investigat"
            ) ||
            normalizedStatus.includes(
              "active"
            )
            ? "in_progress"
            : normalizedStatus.includes(
              "pending"
            )
              ? "pending"
              : "completed";

        addTimelineEntry(
          `${firNumber}-updated`,
          caseStatus ||
          bilingual(
            "Investigation Updated",
            "ತನಿಖೆ ನವೀಕರಿಸಲಾಗಿದೆ"
          ),
          modifiedTime,
          caseStatus
            ? bilingual(
              `${firNumber} status: ${caseStatus}.`,
              `${firNumber} ಸ್ಥಿತಿ: ${caseStatus}.`
            )
            : bilingual(
              `${firNumber} investigation record was updated.`,
              `${firNumber} ತನಿಖಾ ದಾಖಲೆಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.`
            ),
          timelineStatus
        );
      }
    }
  );

  // ---------------------------------------------------
  // ACCUSED RECORD EVENTS
  //
  // These are included only when Catalyst provides
  // CREATEDTIME / MODIFIEDTIME on the accused record.
  // ---------------------------------------------------

  sourceAccusedRecords.forEach(
    (
      accused: any,
      index: number
    ) => {

      const accusedId =
        String(
          accused.ACCUSED_ID ??
          accused.accusedId ??
          accused.id ??
          `ACC-${index + 1}`
        ).trim();

      const accusedName =
        String(
          accused.FULL_NAME ??
          accused.fullName ??
          accused.name ??
          accused.ALIAS_NAME ??
          accused.aliasName ??
          accusedId
        ).trim();

      const createdTime =
        accused.CREATEDTIME ??
        accused.createdTime ??
        accused.CREATED_TIME ??
        accused.createdAt;

      if (createdTime) {

        addTimelineEntry(
          `${accusedId}-created`,
          bilingual(
            "Accused Record Added",
            "ಆರೋಪಿ ದಾಖಲೆ ಸೇರಿಸಲಾಗಿದೆ"
          ),
          createdTime,
          bilingual(
            `${accusedName} (${accusedId}) was added to the accused records.`,
            `${accusedName} (${accusedId}) ಅವರನ್ನು ಆರೋಪಿ ದಾಖಲೆಗಳಿಗೆ ಸೇರಿಸಲಾಗಿದೆ.`
          ),
          "completed"
        );
      }

      const modifiedTime =
        accused.MODIFIEDTIME ??
        accused.modifiedTime ??
        accused.MODIFIED_TIME ??
        accused.updatedAt;

      if (modifiedTime) {

        addTimelineEntry(
          `${accusedId}-updated`,
          bilingual(
            "Accused Record Updated",
            "ಆರೋಪಿ ದಾಖಲೆ ನವೀಕರಿಸಲಾಗಿದೆ"
          ),
          modifiedTime,
          bilingual(
            `${accusedName} (${accusedId}) record was updated.`,
            `${accusedName} (${accusedId}) ಅವರ ದಾಖಲೆಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.`
          ),
          "completed"
        );
      }
    }
  );

  // ---------------------------------------------------
  // SORT CHRONOLOGICALLY WHEN TIMESTAMPS ARE PARSEABLE
  // ---------------------------------------------------

  realTimeline.sort(
    (
      a,
      b
    ) => {

      const aTime =
        new Date(
          a.timestamp
        ).getTime();

      const bTime =
        new Date(
          b.timestamp
        ).getTime();

      if (
        Number.isNaN(aTime) ||
        Number.isNaN(bTime)
      ) {
        return 0;
      }

      return aTime - bTime;
    }
  );

  // ===================================================
  // 10. BUILD REAL AI RECOMMENDATIONS
  // ===================================================

  const realRecommendations:
    Recommendation[] =
    [];

  const seenRecommendationIds =
    new Set<string>();

  const addRecommendation = (
    recommendation: Recommendation
  ) => {

    if (
      seenRecommendationIds.has(
        recommendation.id
      )
    ) {
      return;
    }

    seenRecommendationIds.add(
      recommendation.id
    );

    realRecommendations.push(
      recommendation
    );
  };

  // ---------------------------------------------------
  // HIGH-PRIORITY / HIGH-RISK RECORD REVIEW
  // ---------------------------------------------------

  if (
    summaryPriority ===
    "High"
  ) {

    addRecommendation({
      id:
        "review-high-priority-records",

      titleKey:
        bilingual(
          "Review High-Priority Records",
          "ಹೆಚ್ಚಿನ ಆದ್ಯತೆಯ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),

      descKey:
        firRefs.length > 0
          ? bilingual(
            `Review the ${firRefs.length} high-priority or high-risk investigation record(s) returned by the current query.`,
            `ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆಯಿಂದ ದೊರೆತ ${firRefs.length} ಹೆಚ್ಚಿನ ಆದ್ಯತೆ ಅಥವಾ ಹೆಚ್ಚಿನ ಅಪಾಯದ ತನಿಖಾ ದಾಖಲೆ(ಗಳನ್ನು) ಪರಿಶೀಲಿಸಿ.`
          )
          : bilingual(
            "Review the high-risk accused record(s) returned by the current query.",
            "ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆಯಿಂದ ದೊರೆತ ಹೆಚ್ಚಿನ ಅಪಾಯದ ಆರೋಪಿ ದಾಖಲೆ(ಗಳನ್ನು) ಪರಿಶೀಲಿಸಿ."
          ),

      priority:
        "High",

      actionLabelKey:
        bilingual(
          "Review Records",
          "ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),
    });
  }

  // ---------------------------------------------------
  // REPEAT-OFFENDER LINK REVIEW
  // ---------------------------------------------------

  if (
    repeatOffenderDetails.length >
    0
  ) {

    const highestLinkedFirCount =
      repeatOffenderDetails.reduce(
        (
          highest,
          offender
        ) =>
          Math.max(
            highest,
            offender.linkedFIRs.length
          ),
        0
      );

    addRecommendation({
      id:
        "review-repeat-offender-links",

      titleKey:
        bilingual(
          "Review Repeat-Offender Links",
          "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),

      descKey:
        bilingual(
          `Review the FIR associations for ${repeatOffenderDetails.length} accused record(s) linked to multiple cases${highestLinkedFirCount > 0 ? `, including up to ${highestLinkedFirCount} FIR records` : ""}.`,
          `ಬಹು ಪ್ರಕರಣಗಳಿಗೆ ಸಂಪರ್ಕಗೊಂಡ ${repeatOffenderDetails.length} ಆರೋಪಿ ದಾಖಲೆ(ಗಳ) FIR ಸಂಬಂಧಗಳನ್ನು ಪರಿಶೀಲಿಸಿ${highestLinkedFirCount > 0 ? `; ಗರಿಷ್ಠ ${highestLinkedFirCount} FIR ದಾಖಲೆಗಳವರೆಗೆ` : ""}.`
        ),

      priority:
        "High",

      actionLabelKey:
        bilingual(
          "Review FIR Links",
          "FIR ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),
    });
  }

  // ---------------------------------------------------
  // CRIMINAL-NETWORK RELATIONSHIP REVIEW
  // ---------------------------------------------------

  if (
    networkData &&
    Array.isArray(
      networkData.relationships
    ) &&
    networkData.relationships.length >
    0
  ) {

    addRecommendation({
      id:
        "review-network-connections",

      titleKey:
        bilingual(
          "Review Network Connections",
          "ಜಾಲ ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),

      descKey:
        bilingual(
          `Examine ${networkData.relationships.length} recorded criminal-network connection(s) and verify the associated relationship and FIR information.`,
          `ದಾಖಲಾದ ${networkData.relationships.length} ಅಪರಾಧ ಜಾಲ ಸಂಪರ್ಕ(ಗಳನ್ನು) ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಂಬಂಧಿತ ಸಂಬಂಧ ಹಾಗೂ FIR ಮಾಹಿತಿಯನ್ನು ದೃಢೀಕರಿಸಿ.`
        ),

      priority:
        "High",

      actionLabelKey:
        bilingual(
          "Review Connections",
          "ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),
    });
  }

  // ---------------------------------------------------
  // LOCATION PATTERN REVIEW
  // ---------------------------------------------------

  if (
    locations.length >
    1
  ) {

    addRecommendation({
      id:
        "review-location-patterns",

      titleKey:
        bilingual(
          "Review Location Patterns",
          "ಸ್ಥಳ ಮಾದರಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),

      descKey:
        bilingual(
          `Compare the ${locations.length} relevant locations identified in the retrieved investigation records for recurring geographic patterns.`,
          `ಮರುಕಳಿಸುವ ಭೌಗೋಳಿಕ ಮಾದರಿಗಳಿಗಾಗಿ ತನಿಖಾ ದಾಖಲೆಗಳಲ್ಲಿ ಗುರುತಿಸಲಾದ ${locations.length} ಸಂಬಂಧಿತ ಸ್ಥಳಗಳನ್ನು ಹೋಲಿಸಿ.`
        ),

      priority:
        "Medium",

      actionLabelKey:
        bilingual(
          "Review Locations",
          "ಸ್ಥಳಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
        ),
    });
  }

  // ---------------------------------------------------
  // FIR / CASE STATUS REVIEW
  // ---------------------------------------------------

  const activeInvestigationFirs =
    sourceFirRecords.filter(
      (
        fir: any
      ) => {

        const status =
          String(
            fir.CASE_STATUS ??
            fir.caseStatus ??
            fir.STATUS ??
            fir.status ??
            ""
          )
            .trim()
            .toLowerCase();

        return (
          status.includes(
            "under investigation"
          ) ||
          status.includes(
            "investigat"
          ) ||
          status.includes(
            "active"
          ) ||
          status.includes(
            "pending"
          )
        );
      }
    );

  if (
    activeInvestigationFirs.length >
    0
  ) {

    addRecommendation({
      id:
        "review-active-investigations",

      titleKey:
        bilingual("Review Active Investigation", "ಸಕ್ರಿಯ ತನಿಖೆಯನ್ನು ಪರಿಶೀಲಿಸಿ"),

      descKey:
        bilingual(`Review the current status and linked records for ${activeInvestigationFirs.length} active or pending FIR case(s).`, `${activeInvestigationFirs.length} ಸಕ್ರಿಯ ಅಥವಾ ಬಾಕಿ ಇರುವ FIR ಪ್ರಕರಣ(ಗಳ) ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ ಮತ್ತು ಸಂಪರ್ಕಿತ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`),

      priority:
        summaryPriority === "High"
          ? "High"
          : "Medium",

      actionLabelKey:
        bilingual("Review Case Status", "ಪ್ರಕರಣದ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ"),
    });
  }

  // ---------------------------------------------------
  // GENERAL FIR EVIDENCE REVIEW
  // ---------------------------------------------------

  if (
    firRefs.length >
    0 &&
    realRecommendations.length ===
    0
  ) {

    addRecommendation({
      id:
        "review-linked-fir-evidence",

      titleKey:
        bilingual("Review Linked FIR Evidence", "ಸಂಪರ್ಕಿತ FIR ಸಾಕ್ಷ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿ"),

      descKey:
        bilingual(`Review the available evidence and linked entities for ${firRefs.length} FIR record(s) returned by the current query.`, `ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆಯಿಂದ ದೊರೆತ ${firRefs.length} FIR ದಾಖಲೆ(ಗಳ) ಲಭ್ಯವಿರುವ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಸಂಪರ್ಕಿತ ಘಟಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`),

      priority:
        "Medium",

      actionLabelKey:
        bilingual("Review FIR", "FIR ಪರಿಶೀಲಿಸಿ"),
    });
  }

  // ---------------------------------------------------
  // GENERAL ACCUSED RECORD REVIEW
  // ---------------------------------------------------

  if (
    offenders.length >
    0 &&
    realRecommendations.length ===
    0
  ) {

    addRecommendation({
      id:
        "review-accused-records",

      titleKey:
        bilingual("Review Accused Records", "ಆರೋಪಿ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"),

      descKey:
        bilingual(`Review the available profile, FIR associations, risk information, and recorded links for ${offenders.length} accused record(s).`, `${offenders.length} ಆರೋಪಿ ದಾಖಲೆ(ಗಳ) ಲಭ್ಯವಿರುವ ಪ್ರೊಫೈಲ್, FIR ಸಂಬಂಧಗಳು, ಅಪಾಯ ಮಾಹಿತಿ ಮತ್ತು ದಾಖಲಾದ ಸಂಪರ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`),

      priority:
        summaryPriority,

      actionLabelKey:
        bilingual("Review Accused", "ಆರೋಪಿಯನ್ನು ಪರಿಶೀಲಿಸಿ"),
    });
  }

  // ===================================================
  // IMPORTANT
  //
  // We DO NOT create an incomplete FIR entity using
  // only apiResp.relatedFirNumber.
  //
  // This prevents blank frontend entries such as:
  //
  // FIR-BLR-2026-0001 — (, )
  //
  // FIR cards are created only when actual FIR metadata
  // exists in apiResp.data.
  // ===================================================

  // ===================================================
  // RETURN UI DATA
  // ===================================================

  return {

    confidenceScore:
      confidencePct,

    linkedEntities: {

      firs:
        firRefs,

      offenders,

      vehicles,

      locations,

    },

    // REAL CATALYST-DERIVED SUMMARY
    summary:
      realSummary,

    // REAL CATALYST-DERIVED EXPLAINABILITY
    explainability:
      realExplainability,

    network:
      realNetwork,

    timeline:
      realTimeline.length > 0
        ? realTimeline
        : undefined,

    recommendations:
      realRecommendations.length > 0
        ? realRecommendations
        : undefined,
  };
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export function AIInvestigationWorkspace({
  lang,
  setLang,
  onBack,
  currentUser,
}: AIInvestigationWorkspaceProps) {

  const t =
    T[lang];

  const [
    drawerVisible,
    setDrawerVisible,
  ] = useState<boolean>(false);

  const [
    messages,
    setMessages,
  ] = useState<Message[]>(
    () =>
      buildPreloadedMessages()
  );

  const [
    queryInput,
    setQueryInput,
  ] = useState<string>("");

  const [
    isProcessing,
    setIsProcessing,
  ] = useState<boolean>(
    false
  );

  const [
    attachments,
    setAttachments,
  ] = useState<Attachment[]>(
    []
  );

  const [
    voiceRecording,
    setVoiceRecording,
  ] = useState<boolean>(
    false
  );

  const [
    voiceMessage,
    setVoiceMessage,
  ] = useState<string | null>(
    null
  );

  const [
    isGeneratingReport,
    setIsGeneratingReport,
  ] = useState<boolean>(
    false
  );

  const [
    reportUri,
    setReportUri,
  ] = useState<string | null>(
    null
  );

  const [
    reportVisible,
    setReportVisible,
  ] = useState<boolean>(
    false
  );

  const [
    reportCountdown,
    setReportCountdown,
  ] = useState<number>(
    5
  );

  const [
    isExampleConversation,
    setIsExampleConversation,
  ] = useState<boolean>(
    true
  );

  // ===================================================
  // #23 — INVESTIGATION HISTORY & SAVED CASES
  // ===================================================

  const [
    savedInvestigations,
    setSavedInvestigations,
  ] = useState<SavedInvestigation[]>(
    []
  );

  const [
    historyVisible,
    setHistoryVisible,
  ] = useState<boolean>(
    false
  );

  const [
    historySearch,
    setHistorySearch,
  ] = useState<string>(
    ""
  );

  const [
    savedCasesLoaded,
    setSavedCasesLoaded,
  ] = useState<boolean>(
    false
  );
  // ===================================================
  // #24 — OFFICER NOTES & PINNED FINDINGS
  // ===================================================

  const [notesVisible, setNotesVisible] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>("");
  const [noteSearch, setNoteSearch] = useState<string>("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<OfficerNote[]>([]);
  const [activeSavedInvestigationId, setActiveSavedInvestigationId] =
    useState<string | null>(null);

  // ===================================================
  // #25 — CASE TASKS & INVESTIGATION CHECKLIST
  // ===================================================

  const [tasksVisible, setTasksVisible] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<string>("");
  const [taskSearch, setTaskSearch] = useState<string>("");
  const [taskStatusFilter, setTaskStatusFilter] =
    useState<"All" | InvestigationTaskStatus>("All");
  const [taskPriority, setTaskPriority] =
    useState<InvestigationTaskPriority>("Medium");
  const [taskStatus, setTaskStatus] =
    useState<InvestigationTaskStatus>("Pending");
  const [taskDueDate, setTaskDueDate] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [currentTasks, setCurrentTasks] = useState<InvestigationTask[]>([]);

  // ===================================================
  // #26 — EVIDENCE & ATTACHMENTS
  // ===================================================

  const [evidenceVisible, setEvidenceVisible] = useState<boolean>(false);
  const [currentEvidence, setCurrentEvidence] = useState<InvestigationEvidence[]>([]);
  const [evidenceTitle, setEvidenceTitle] = useState<string>("");
  const [evidenceDescription, setEvidenceDescription] = useState<string>("");
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("Document");
  const [evidenceSearch, setEvidenceSearch] = useState<string>("");
  const [evidenceFilter, setEvidenceFilter] = useState<"All" | EvidenceType>("All");
  const [selectedEvidenceFile, setSelectedEvidenceFile] = useState<{
    name: string;
    uri: string;
    mimeType?: string;
    size?: number;
  } | null>(null);

  // ===================================================
  // #27 — CASE COLLABORATION & HANDOVER
  // ===================================================

  const [collaborationVisible, setCollaborationVisible] = useState<boolean>(false);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>("Open");
  const [assignedOfficerName, setAssignedOfficerName] = useState<string>(mockData.officerName);
  const [assignedOfficerBadge, setAssignedOfficerBadge] = useState<string>(mockData.officerBadge);
  const [handoverNote, setHandoverNote] = useState<string>("");
  const [caseActivity, setCaseActivity] = useState<CaseActivity[]>([]);

  // ===================================================
  // #28 — LOGIN-BASED ROLE ACCESS CONTROL
  // ===================================================

  const currentUserRole: UserRole = currentUser.role;

  const hasPermission = useCallback(
    (permission: Permission): boolean =>
      ROLE_PERMISSIONS[currentUserRole].includes(permission),
    [currentUserRole]
  );

  const showAccessDenied = useCallback(
    (_permission?: Permission) => {
      Alert.alert(
        lang === "kn" ? "ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ" : "Access Restricted",
        lang === "kn"
          ? `ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪಾತ್ರ (${currentUserRole}) ಈ ಕ್ರಿಯೆಗೆ ಅನುಮತಿ ಹೊಂದಿಲ್ಲ.`
          : `Your current role (${currentUserRole}) does not have permission for this action.`
      );
    },
    [lang, currentUserRole]
  );

  const requirePermission = useCallback(
    (permission: Permission): boolean => {
      if (hasPermission(permission)) return true;
      showAccessDenied(permission);
      return false;
    },
    [hasPermission, showAccessDenied]
  );

  // ===================================================
  // FULL NETWORK ANALYSIS MODAL
  // ===================================================
  const [
    fullNetworkVisible,
    setFullNetworkVisible,
  ] = useState<boolean>(
    false
  );
  const [
    selectedNetwork,
    setSelectedNetwork,
  ] = useState<NetworkGraphData | null>(
    null
  );
  // ===================================================
  // RECOMMENDATION DETAILS MODAL
  // ===================================================
  const [
    recommendationModalVisible,
    setRecommendationModalVisible,
  ] = useState<boolean>(
    false
  );

  const [
    recommendationModalTitle,
    setRecommendationModalTitle,
  ] = useState<string>(
    ""
  );

  const [
    recommendationModalContent,
    setRecommendationModalContent,
  ] = useState<string>(
    ""
  );

  const openRecommendationModal =
    useCallback(
      (
        title: string,
        content: string
      ) => {

        setRecommendationModalTitle(
          title
        );

        setRecommendationModalContent(
          content
        );

        setRecommendationModalVisible(
          true
        );

      },
      []
    );

  // ===================================================
  // #23 — PERSISTENT SAVED INVESTIGATION STORAGE
  // ===================================================

  const readSavedInvestigations =
    useCallback(
      async (): Promise<SavedInvestigation[]> => {

        try {

          let raw:
            string |
            null =
            null;

          if (
            Platform.OS === "web"
          ) {

            raw =
              window.localStorage.getItem(
                SAVED_INVESTIGATIONS_KEY
              );

          } else {

            const storageUri =
              `${FileSystem.documentDirectory}crimelens_saved_investigations.json`;

            const info =
              await FileSystem.getInfoAsync(
                storageUri
              );

            if (
              info.exists
            ) {

              raw =
                await FileSystem.readAsStringAsync(
                  storageUri
                );
            }
          }

          if (!raw) {
            return [];
          }

          const parsed =
            JSON.parse(raw) as SavedInvestigation[];

          if (
            !Array.isArray(parsed)
          ) {
            return [];
          }

          return parsed.map(
            (item) => ({
              ...item,
              notes:
                Array.isArray(item.notes)
                  ? item.notes
                  : [],
              tasks:
                Array.isArray(item.tasks)
                  ? item.tasks
                  : [],
              evidence:
                Array.isArray(item.evidence)
                  ? item.evidence
                  : [],
              collaboration:
                item.collaboration
                  ? {
                    status: item.collaboration.status ?? "Open",
                    assignedOfficerName:
                      item.collaboration.assignedOfficerName ?? item.officerName,
                    assignedOfficerBadge:
                      item.collaboration.assignedOfficerBadge ?? item.officerBadge,
                    handoverNote: item.collaboration.handoverNote ?? "",
                    updatedAt: item.collaboration.updatedAt ?? item.createdAt,
                    activity: Array.isArray(item.collaboration.activity)
                      ? item.collaboration.activity
                      : [],
                  }
                  : undefined,
              messages:
                (item.messages ?? []).map(
                  (message) => ({
                    ...message,
                    timestamp:
                      new Date(
                        message.timestamp
                      ),
                  })
                ),
            })
          );

        } catch (
        error
        ) {

          console.error(
            "CrimeLens saved-case load failed:",
            error
          );

          return [];
        }
      },
      []
    );

  const writeSavedInvestigations =
    useCallback(
      async (
        cases: SavedInvestigation[]
      ) => {

        const serialized =
          JSON.stringify(cases);

        if (
          Platform.OS === "web"
        ) {

          window.localStorage.setItem(
            SAVED_INVESTIGATIONS_KEY,
            serialized
          );

          return;
        }

        const storageUri =
          `${FileSystem.documentDirectory}crimelens_saved_investigations.json`;

        await FileSystem.writeAsStringAsync(
          storageUri,
          serialized
        );
      },
      []
    );

  useEffect(
    () => {

      let mounted =
        true;

      void readSavedInvestigations()
        .then(
          (cases) => {

            if (
              mounted
            ) {

              setSavedInvestigations(
                cases
              );

              setSavedCasesLoaded(
                true
              );
            }
          }
        );

      return () => {
        mounted =
          false;
      };
    },
    [
      readSavedInvestigations,
    ]
  );

  const handleSaveInvestigation =
    useCallback(
      async () => {

        if (!requirePermission("save")) return;

        try {

          const latestResponseIndex =
            [...messages]
              .map(
                (
                  message,
                  index
                ) => ({
                  message,
                  index,
                })
              )
              .reverse()
              .find(
                ({ message }) =>
                  message.type ===
                  "response" &&
                  Boolean(
                    message.data
                  )
              )?.index;

          if (
            latestResponseIndex ===
            undefined
          ) {

            Alert.alert(
              "",
              lang === "kn"
                ? "ಉಳಿಸುವ ಮೊದಲು ತನಿಖಾ ಪ್ರಶ್ನೆಯನ್ನು ಚಲಾಯಿಸಿ."
                : "Run an investigation query before saving."
            );

            return;
          }

          let queryIndex =
            -1;

          for (
            let index =
              latestResponseIndex - 1;
            index >= 0;
            index -= 1
          ) {

            if (
              messages[index].type ===
              "query"
            ) {

              queryIndex =
                index;

              break;
            }
          }

          if (
            queryIndex <
            0
          ) {
            return;
          }

          const caseMessages =
            messages.slice(
              queryIndex,
              latestResponseIndex + 1
            );

          const query =
            messages[queryIndex].text;

          const response =
            messages[
            latestResponseIndex
            ];

          const offender =
            response.data
              ?.linkedEntities
              .offenders[0];

          const fir =
            response.data
              ?.linkedEntities
              .firs[0];

          const title =
            offender
              ? `${offender.name} (${offender.id})`
              : fir
                ? fir.number
                : query.length >
                  52
                  ? `${query.slice(
                    0,
                    52
                  )}…`
                  : query;

          const newCase:
            SavedInvestigation =
          {
            id:
              uid(),

            title,

            query,

            createdAt:
              new Date()
                .toISOString(),

            officerName:
              mockData.officerName,

            officerBadge:
              mockData.officerBadge,

            lang,

            messages:
              caseMessages,

            notes:
              currentNotes,

            tasks:
              currentTasks,

            evidence:
              currentEvidence,

            collaboration: {
              status: caseStatus,
              assignedOfficerName,
              assignedOfficerBadge,
              handoverNote,
              updatedAt: new Date().toISOString(),
              activity: caseActivity,
            },
          };

          const next =
            [
              newCase,
              ...savedInvestigations,
            ];

          await writeSavedInvestigations(
            next
          );

          setSavedInvestigations(
            next
          );

          Alert.alert(
            "",
            lang === "kn"
              ? "ತನಿಖೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ."
              : "Investigation saved."
          );

        } catch (
        error
        ) {

          console.error(
            "CrimeLens save investigation failed:",
            error
          );

          Alert.alert(
            "",
            lang === "kn"
              ? "ತನಿಖೆಯನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
              : "Unable to save the investigation."
          );
        }
      },
      [
        messages,
        savedInvestigations,
        writeSavedInvestigations,
        lang,
        currentNotes,
        currentTasks,
        currentEvidence,
        caseStatus,
        assignedOfficerName,
        assignedOfficerBadge,
        handoverNote,
        caseActivity,
      ]
    );

  const handleOpenSavedInvestigation =
    useCallback(
      (
        saved:
          SavedInvestigation
      ) => {

        const restoredMessages =
          saved.messages.map(
            (message) => ({
              ...message,
              timestamp:
                new Date(
                  message.timestamp
                ),
            })
          );

        setMessages(
          restoredMessages
        );

        messagesRef.current =
          restoredMessages;

        setIsExampleConversation(
          false
        );

        exampleConversationRef.current =
          false;

        setReportUri(
          null
        );

        setQueryInput(
          ""
        );

        setCurrentNotes(
          saved.notes ?? []
        );

        setActiveSavedInvestigationId(
          saved.id
        );

        setCurrentTasks(
          saved.tasks ?? []
        );

        setCurrentEvidence(
          saved.evidence ?? []
        );

        setCaseStatus(saved.collaboration?.status ?? "Open");
        setAssignedOfficerName(
          saved.collaboration?.assignedOfficerName ?? saved.officerName
        );
        setAssignedOfficerBadge(
          saved.collaboration?.assignedOfficerBadge ?? saved.officerBadge
        );
        setHandoverNote(saved.collaboration?.handoverNote ?? "");
        setCaseActivity(saved.collaboration?.activity ?? []);

        if (
          saved.lang !==
          lang
        ) {

          setLang(
            saved.lang
          );
        }

        setHistoryVisible(
          false
        );
      },
      [
        lang,
        setLang,
      ]
    );

  const handleDeleteSavedInvestigation =
    useCallback(
      (
        saved:
          SavedInvestigation
      ) => {

        Alert.alert(
          lang === "kn"
            ? "ಉಳಿಸಿದ ತನಿಖೆಯನ್ನು ಅಳಿಸುವುದೇ?"
            : "Delete saved investigation?",

          lang === "kn"
            ? `"${saved.title}" ಅನ್ನು ಅಳಿಸಲಾಗುತ್ತದೆ.`
            : `"${saved.title}" will be removed.`,

          [
            {
              text:
                lang === "kn"
                  ? "ರದ್ದುಮಾಡಿ"
                  : "Cancel",

              style:
                "cancel",
            },
            {
              text:
                lang === "kn"
                  ? "ಅಳಿಸಿ"
                  : "Delete",

              style:
                "destructive",

              onPress:
                () => {

                  void (
                    async () => {

                      try {

                        const next =
                          savedInvestigations.filter(
                            (item) =>
                              item.id !==
                              saved.id
                          );

                        await writeSavedInvestigations(
                          next
                        );

                        setSavedInvestigations(
                          next
                        );

                      } catch (
                      error
                      ) {

                        console.error(
                          "CrimeLens delete saved investigation failed:",
                          error
                        );
                      }
                    }
                  )();
                },
            },
          ]
        );
      },
      [
        savedInvestigations,
        writeSavedInvestigations,
        lang,
      ]
    );

  const filteredSavedInvestigations =
    savedInvestigations.filter(
      (saved) => {

        const term =
          historySearch
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        const searchable =
          [
            saved.title,
            saved.query,
            saved.officerName,
            saved.officerBadge,
            ...(saved.notes ?? []).flatMap(
              (note) => [
                note.text,
                note.officerName,
                note.officerBadge,
              ]
            ),
            ...(saved.tasks ?? []).flatMap(
              (task) => [
                task.text,
                task.status,
                task.priority,
                task.dueDate ?? "",
                task.assignedOfficerName,
                task.assignedOfficerBadge,
              ]
            ),
            ...(saved.evidence ?? []).flatMap(
              (item) => [
                item.evidenceId,
                item.title,
                item.description,
                item.type,
                item.fileName,
                item.officerName,
                item.officerBadge,
              ]
            ),
            ...saved.messages.flatMap(
              (message) => {

                const data =
                  message.data;

                if (!data) {
                  return [
                    message.text,
                  ];
                }

                return [
                  message.text,

                  ...data.linkedEntities.offenders.flatMap(
                    (offender) => [
                      offender.name,
                      offender.id,
                      ...offender.linkedFIRs,
                    ]
                  ),

                  ...data.linkedEntities.firs.flatMap(
                    (fir) => [
                      fir.number,
                      fir.crimeType,
                      fir.crimeTypeKn,
                      fir.district,
                      fir.districtKn,
                    ]
                  ),

                  ...data.linkedEntities.vehicles.map(
                    (vehicle) =>
                      vehicle.registration
                  ),

                  ...data.linkedEntities.locations,
                ];
              }
            ),
          ]
            .join(" ")
            .toLowerCase();

        return searchable.includes(
          term
        );
      }
    );

  // ===================================================
  // #24 — OFFICER NOTE HANDLERS
  // ===================================================

  const persistCurrentNotes = useCallback(
    async (nextNotes: OfficerNote[]) => {
      setCurrentNotes(nextNotes);

      if (!activeSavedInvestigationId) return;

      const nextCases = savedInvestigations.map((saved) =>
        saved.id === activeSavedInvestigationId
          ? { ...saved, notes: nextNotes }
          : saved
      );

      await writeSavedInvestigations(nextCases);
      setSavedInvestigations(nextCases);
    },
    [activeSavedInvestigationId, savedInvestigations, writeSavedInvestigations]
  );

  const resetNoteEditor = useCallback(() => {
    setNoteInput("");
    setEditingNoteId(null);
  }, []);

  const handleSaveOfficerNote = useCallback(async () => {
    if (!requirePermission("notes")) return;
    const value = noteInput.trim();

    if (!value) {
      Alert.alert(
        "",
        lang === "kn"
          ? "ದಯವಿಟ್ಟು ಅಧಿಕಾರಿಯ ಟಿಪ್ಪಣಿಯನ್ನು ನಮೂದಿಸಿ."
          : "Enter an officer note before saving."
      );
      return;
    }

    try {
      const now = new Date().toISOString();

      const nextNotes: OfficerNote[] = editingNoteId
        ? currentNotes.map((note) =>
          note.id === editingNoteId
            ? { ...note, text: value, updatedAt: now }
            : note
        )
        : [
          {
            id: uid(),
            text: value,
            createdAt: now,
            officerName: mockData.officerName,
            officerBadge: mockData.officerBadge,
            pinned: false,
          },
          ...currentNotes,
        ];

      await persistCurrentNotes(nextNotes);
      resetNoteEditor();
    } catch (error) {
      console.error("CrimeLens officer-note save failed:", error);
      Alert.alert(
        "",
        lang === "kn"
          ? "ಅಧಿಕಾರಿಯ ಟಿಪ್ಪಣಿಯನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
          : "Unable to save the officer note."
      );
    }
  }, [noteInput, editingNoteId, currentNotes, persistCurrentNotes, resetNoteEditor, lang]);

  const handleEditOfficerNote = useCallback((note: OfficerNote) => {
    setEditingNoteId(note.id);
    setNoteInput(note.text);
  }, []);

  const handleTogglePinnedNote = useCallback(async (note: OfficerNote) => {
    const nextNotes = currentNotes.map((item) =>
      item.id === note.id
        ? { ...item, pinned: !item.pinned, updatedAt: new Date().toISOString() }
        : item
    );
    await persistCurrentNotes(nextNotes);
  }, [currentNotes, persistCurrentNotes]);

  const handleDeleteOfficerNote = useCallback((note: OfficerNote) => {
    Alert.alert(
      lang === "kn" ? "ಅಧಿಕಾರಿಯ ಟಿಪ್ಪಣಿಯನ್ನು ಅಳಿಸುವುದೇ?" : "Delete officer note?",
      lang === "kn" ? "ಈ ಟಿಪ್ಪಣಿಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ." : "This note will be permanently removed.",
      [
        { text: lang === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel", style: "cancel" },
        {
          text: lang === "kn" ? "ಅಳಿಸಿ" : "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const nextNotes = currentNotes.filter((item) => item.id !== note.id);
              await persistCurrentNotes(nextNotes);
              if (editingNoteId === note.id) resetNoteEditor();
            })();
          },
        },
      ]
    );
  }, [currentNotes, persistCurrentNotes, editingNoteId, resetNoteEditor, lang]);

  const filteredOfficerNotes = currentNotes
    .filter((note) => {
      const term = noteSearch.trim().toLowerCase();
      if (!term) return true;
      return [note.text, note.officerName, note.officerBadge]
        .join(" ")
        .toLowerCase()
        .includes(term);
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  // ===================================================
  // #25 — INVESTIGATION TASK HANDLERS
  // ===================================================

  const persistCurrentTasks = useCallback(
    async (nextTasks: InvestigationTask[]) => {
      setCurrentTasks(nextTasks);

      if (!activeSavedInvestigationId) return;

      const nextCases = savedInvestigations.map((saved) =>
        saved.id === activeSavedInvestigationId
          ? { ...saved, tasks: nextTasks }
          : saved
      );

      await writeSavedInvestigations(nextCases);
      setSavedInvestigations(nextCases);
    },
    [activeSavedInvestigationId, savedInvestigations, writeSavedInvestigations]
  );

  const resetTaskEditor = useCallback(() => {
    setTaskInput("");
    setTaskPriority("Medium");
    setTaskStatus("Pending");
    setTaskDueDate("");
    setEditingTaskId(null);
  }, []);

  const handleSaveInvestigationTask = useCallback(async () => {
    if (!requirePermission("tasks")) return;
    const value = taskInput.trim();
    const dueDateValue = taskDueDate.trim();

    if (!value) {
      Alert.alert(
        "",
        lang === "kn"
          ? "ದಯವಿಟ್ಟು ತನಿಖಾ ಕಾರ್ಯವನ್ನು ನಮೂದಿಸಿ."
          : "Enter an investigation task before saving."
      );
      return;
    }

    if (
      dueDateValue &&
      !/^\\d{4}-\\d{2}-\\d{2}$/.test(dueDateValue)
    ) {
      Alert.alert(
        "",
        lang === "kn"
          ? "ಕೊನೆಯ ದಿನಾಂಕವನ್ನು YYYY-MM-DD ರೂಪದಲ್ಲಿ ನಮೂದಿಸಿ."
          : "Enter the due date in YYYY-MM-DD format."
      );
      return;
    }

    try {
      const now = new Date().toISOString();

      const nextTasks: InvestigationTask[] = editingTaskId
        ? currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
              ...task,
              text: value,
              status: taskStatus,
              priority: taskPriority,
              dueDate: dueDateValue || undefined,
              updatedAt: now,
            }
            : task
        )
        : [
          {
            id: uid(),
            text: value,
            status: taskStatus,
            priority: taskPriority,
            dueDate: dueDateValue || undefined,
            assignedOfficerName: mockData.officerName,
            assignedOfficerBadge: mockData.officerBadge,
            createdAt: now,
          },
          ...currentTasks,
        ];

      await persistCurrentTasks(nextTasks);
      resetTaskEditor();
    } catch (error) {
      console.error("CrimeLens investigation-task save failed:", error);
      Alert.alert(
        "",
        lang === "kn"
          ? "ತನಿಖಾ ಕಾರ್ಯವನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
          : "Unable to save the investigation task."
      );
    }
  }, [
    taskInput,
    taskDueDate,
    taskStatus,
    taskPriority,
    editingTaskId,
    currentTasks,
    persistCurrentTasks,
    resetTaskEditor,
    lang,
  ]);

  const handleEditInvestigationTask = useCallback(
    (task: InvestigationTask) => {
      setEditingTaskId(task.id);
      setTaskInput(task.text);
      setTaskStatus(task.status);
      setTaskPriority(task.priority);
      setTaskDueDate(task.dueDate ?? "");
    },
    []
  );

  const handleCycleTaskStatus = useCallback(
    async (task: InvestigationTask) => {
      const nextStatus: InvestigationTaskStatus =
        task.status === "Pending"
          ? "In Progress"
          : task.status === "In Progress"
            ? "Completed"
            : "Pending";

      const nextTasks = currentTasks.map((item) =>
        item.id === task.id
          ? {
            ...item,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          }
          : item
      );

      await persistCurrentTasks(nextTasks);
    },
    [currentTasks, persistCurrentTasks]
  );

  const handleDeleteInvestigationTask = useCallback(
    (task: InvestigationTask) => {
      Alert.alert(
        lang === "kn" ? "ತನಿಖಾ ಕಾರ್ಯವನ್ನು ಅಳಿಸುವುದೇ?" : "Delete investigation task?",
        lang === "kn"
          ? "ಈ ಕಾರ್ಯವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ."
          : "This task will be permanently removed.",
        [
          {
            text: lang === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel",
            style: "cancel",
          },
          {
            text: lang === "kn" ? "ಅಳಿಸಿ" : "Delete",
            style: "destructive",
            onPress: () => {
              void (async () => {
                const nextTasks = currentTasks.filter(
                  (item) => item.id !== task.id
                );

                await persistCurrentTasks(nextTasks);

                if (editingTaskId === task.id) {
                  resetTaskEditor();
                }
              })();
            },
          },
        ]
      );
    },
    [
      currentTasks,
      persistCurrentTasks,
      editingTaskId,
      resetTaskEditor,
      lang,
    ]
  );

  const filteredInvestigationTasks = currentTasks
    .filter((task) => {
      if (
        taskStatusFilter !== "All" &&
        task.status !== taskStatusFilter
      ) {
        return false;
      }

      const term = taskSearch.trim().toLowerCase();

      if (!term) return true;

      return [
        task.text,
        task.status,
        task.priority,
        task.dueDate ?? "",
        task.assignedOfficerName,
        task.assignedOfficerBadge,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    })
    .sort((a, b) => {
      const priorityRank = {
        High: 0,
        Medium: 1,
        Low: 2,
      } as const;

      return priorityRank[a.priority] - priorityRank[b.priority];
    });

  const completedTaskCount =
    currentTasks.filter(
      (task) => task.status === "Completed"
    ).length;

  const taskProgressPercent =
    currentTasks.length > 0
      ? Math.round(
        (completedTaskCount / currentTasks.length) * 100
      )
      : 0;

  // ===================================================
  // #26 — EVIDENCE HANDLERS
  // ===================================================

  const persistCurrentEvidence = useCallback(
    async (nextEvidence: InvestigationEvidence[]) => {
      setCurrentEvidence(nextEvidence);

      if (!activeSavedInvestigationId) return;

      const nextCases = savedInvestigations.map((saved) =>
        saved.id === activeSavedInvestigationId
          ? { ...saved, evidence: nextEvidence }
          : saved
      );

      await writeSavedInvestigations(nextCases);
      setSavedInvestigations(nextCases);
    },
    [activeSavedInvestigationId, savedInvestigations, writeSavedInvestigations]
  );

  const resetEvidenceComposer = useCallback(() => {
    setEvidenceTitle("");
    setEvidenceDescription("");
    setEvidenceType("Document");
    setSelectedEvidenceFile(null);
  }, []);

  const handlePickEvidenceFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "video/*", "text/*"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      setSelectedEvidenceFile({
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
      });

      if (!evidenceTitle.trim()) {
        setEvidenceTitle(asset.name.replace(/\.[^/.]+$/, ""));
      }

      if (asset.mimeType?.startsWith("image/")) {
        setEvidenceType("Photo");
      } else if (asset.mimeType?.startsWith("video/")) {
        setEvidenceType("CCTV");
      } else if (asset.mimeType === "application/pdf") {
        setEvidenceType("Document");
      }
    } catch (error) {
      console.error("CrimeLens evidence picker failed:", error);
      Alert.alert(
        "",
        lang === "kn"
          ? "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
          : "Unable to select the evidence file."
      );
    }
  }, [evidenceTitle, lang]);

  const handleSaveEvidence = useCallback(async () => {
    if (!requirePermission("evidence")) return;
    const title = evidenceTitle.trim();

    if (!selectedEvidenceFile) {
      Alert.alert(
        "",
        lang === "kn"
          ? "ಮೊದಲು ಸಾಕ್ಷ್ಯ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ."
          : "Select an evidence file first."
      );
      return;
    }

    if (!title) {
      Alert.alert(
        "",
        lang === "kn"
          ? "ಸಾಕ್ಷ್ಯಕ್ಕೆ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ."
          : "Enter a title for the evidence."
      );
      return;
    }

    try {
      const nextNumber =
        currentEvidence.reduce((maxValue, item) => {
          const parsed = Number(item.evidenceId.replace(/\D/g, ""));
          return Number.isFinite(parsed) ? Math.max(maxValue, parsed) : maxValue;
        }, 0) + 1;

      const item: InvestigationEvidence = {
        id: uid(),
        evidenceId: `EVD-${String(nextNumber).padStart(4, "0")}`,
        title,
        description: evidenceDescription.trim(),
        type: evidenceType,
        fileName: selectedEvidenceFile.name,
        fileUri: selectedEvidenceFile.uri,
        mimeType: selectedEvidenceFile.mimeType,
        fileSize: selectedEvidenceFile.size,
        officerName: mockData.officerName,
        officerBadge: mockData.officerBadge,
        createdAt: new Date().toISOString(),
      };

      await persistCurrentEvidence([item, ...currentEvidence]);
      resetEvidenceComposer();
    } catch (error) {
      console.error("CrimeLens evidence save failed:", error);
      Alert.alert(
        "",
        lang === "kn"
          ? "ಸಾಕ್ಷ್ಯವನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
          : "Unable to save the evidence."
      );
    }
  }, [
    evidenceTitle,
    evidenceDescription,
    evidenceType,
    selectedEvidenceFile,
    currentEvidence,
    persistCurrentEvidence,
    resetEvidenceComposer,
    lang,
  ]);

  const handleOpenEvidence = useCallback(async (item: InvestigationEvidence) => {
    try {
      if (Platform.OS === "web") {
        window.open(item.fileUri, "_blank", "noopener,noreferrer");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(item.fileUri, {
          dialogTitle:
            lang === "kn"
              ? `${item.evidenceId} ತೆರೆಯಿರಿ`
              : `Open ${item.evidenceId}`,
        });
        return;
      }

      Alert.alert(
        "",
        lang === "kn"
          ? "ಈ ಸಾಧನದಲ್ಲಿ ಫೈಲ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
          : "Unable to open this file on the device."
      );
    } catch (error) {
      console.error("CrimeLens evidence open failed:", error);
    }
  }, [lang]);

  const handleDeleteEvidence = useCallback(
    (item: InvestigationEvidence) => {
      Alert.alert(
        lang === "kn" ? "ಸಾಕ್ಷ್ಯವನ್ನು ಅಳಿಸುವುದೇ?" : "Delete evidence?",
        lang === "kn"
          ? `${item.evidenceId} ಅನ್ನು ಈ ತನಿಖೆಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.`
          : `${item.evidenceId} will be removed from this investigation.`,
        [
          {
            text: lang === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel",
            style: "cancel",
          },
          {
            text: lang === "kn" ? "ಅಳಿಸಿ" : "Delete",
            style: "destructive",
            onPress: () => {
              void persistCurrentEvidence(
                currentEvidence.filter((entry) => entry.id !== item.id)
              );
            },
          },
        ]
      );
    },
    [currentEvidence, persistCurrentEvidence, lang]
  );

  const filteredEvidence = currentEvidence
    .filter((item) => {
      if (evidenceFilter !== "All" && item.type !== evidenceFilter) return false;

      const term = evidenceSearch.trim().toLowerCase();
      if (!term) return true;

      return [
        item.evidenceId,
        item.title,
        item.description,
        item.type,
        item.fileName,
        item.officerName,
        item.officerBadge,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // ===================================================
  // #27 — CASE COLLABORATION & HANDOVER HANDLERS
  // ===================================================

  const persistCaseCollaboration = useCallback(
    async (next: CaseCollaboration) => {
      setCaseStatus(next.status);
      setAssignedOfficerName(next.assignedOfficerName);
      setAssignedOfficerBadge(next.assignedOfficerBadge);
      setHandoverNote(next.handoverNote);
      setCaseActivity(next.activity);

      if (!activeSavedInvestigationId) return;

      const nextCases = savedInvestigations.map((saved) =>
        saved.id === activeSavedInvestigationId
          ? { ...saved, collaboration: next }
          : saved
      );

      await writeSavedInvestigations(nextCases);
      setSavedInvestigations(nextCases);
    },
    [activeSavedInvestigationId, savedInvestigations, writeSavedInvestigations]
  );

  const handleSaveCaseCollaboration = useCallback(async () => {
    const officerName = assignedOfficerName.trim();
    const officerBadge = assignedOfficerBadge.trim();
    const note = handoverNote.trim();

    if (!officerName || !officerBadge) {
      Alert.alert(
        "",
        lang === "kn"
          ? "ನಿಯೋಜಿತ ಅಧಿಕಾರಿಯ ಹೆಸರು ಮತ್ತು ಬ್ಯಾಡ್ಜ್ ID ನಮೂದಿಸಿ."
          : "Enter the assigned officer name and badge ID."
      );
      return;
    }

    const now = new Date().toISOString();
    const previousSaved = activeSavedInvestigationId
      ? savedInvestigations.find((item) => item.id === activeSavedInvestigationId)
      : undefined;
    const previous = previousSaved?.collaboration;

    const nextActivity = [...caseActivity];

    if (
      !previous ||
      previous.assignedOfficerName !== officerName ||
      previous.assignedOfficerBadge !== officerBadge
    ) {
      nextActivity.unshift({
        id: uid(),
        action: previous ? "Reassigned" : "Assigned",
        description:
          lang === "kn"
            ? `ಪ್ರಕರಣವನ್ನು ${officerName} (${officerBadge}) ಅವರಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ.`
            : `Case assigned to ${officerName} (${officerBadge}).`,
        officerName: mockData.officerName,
        officerBadge: mockData.officerBadge,
        createdAt: now,
      });
    }

    if (!previous || previous.status !== caseStatus) {
      nextActivity.unshift({
        id: uid(),
        action: "Status Changed",
        description:
          lang === "kn"
            ? `ಪ್ರಕರಣದ ಸ್ಥಿತಿಯನ್ನು ${caseStatus} ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.`
            : `Case status changed to ${caseStatus}.`,
        officerName: mockData.officerName,
        officerBadge: mockData.officerBadge,
        createdAt: now,
      });
    }

    if (note && (!previous || previous.handoverNote !== note)) {
      nextActivity.unshift({
        id: uid(),
        action: "Handover",
        description:
          lang === "kn"
            ? `ಹಸ್ತಾಂತರ ಟಿಪ್ಪಣಿ: ${note}`
            : `Handover note: ${note}`,
        officerName: mockData.officerName,
        officerBadge: mockData.officerBadge,
        createdAt: now,
      });
    }

    await persistCaseCollaboration({
      status: caseStatus,
      assignedOfficerName: officerName,
      assignedOfficerBadge: officerBadge,
      handoverNote: note,
      updatedAt: now,
      activity: nextActivity,
    });

    Alert.alert(
      "",
      lang === "kn"
        ? "ಪ್ರಕರಣದ ಸಹಯೋಗ ವಿವರಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ."
        : "Case collaboration details saved."
    );
  }, [
    assignedOfficerName,
    assignedOfficerBadge,
    handoverNote,
    caseStatus,
    caseActivity,
    activeSavedInvestigationId,
    savedInvestigations,
    persistCaseCollaboration,
    lang,
  ]);

  // ===================================================
  // REFS
  // ===================================================

  const scrollViewRef =
    useRef<ScrollView>(
      null
    );

  // ===================================================
  // VOICE REFS
  // ===================================================

  // Keeps the final recognised text available across
  // native speech-recognition events without depending
  // on asynchronous React state updates.
  const voiceTranscriptRef =
    useRef<string>("");

  // Prevents the same voice result from being submitted
  // more than once if the recogniser emits repeated
  // final/end events on a device.
  const voiceSubmittedRef =
    useRef<boolean>(false);

  // Always points to the latest conversation state so a
  // speech event can safely submit after recording ends.
  const messagesRef =
    useRef<Message[]>(messages);

  const exampleConversationRef =
    useRef<boolean>(
      isExampleConversation
    );

  useEffect(
    () => {
      messagesRef.current =
        messages;
    },
    [messages]
  );

  useEffect(
    () => {
      exampleConversationRef.current =
        isExampleConversation;
    },
    [isExampleConversation]
  );

  // ===================================================
  // AUTO SCROLL
  // ===================================================

  useEffect(
    () => {

      const timer =
        setTimeout(
          () => {

            scrollViewRef
              .current
              ?.scrollToEnd({
                animated: true,
              });

          },
          100
        );

      return () =>
        clearTimeout(timer);

    },
    [messages]
  );

  // ===================================================
  // SUBMIT QUERY
  // ===================================================

  const submitQuery =
    useCallback(

      async (
        trimmed: string,
        baseMessages: Message[]
      ) => {

        const queryMessage:
          Message = {

          id:
            uid(),

          type:
            "query",

          text:
            trimmed,

          timestamp:
            new Date(),

        };

        setMessages([
          ...baseMessages,
          queryMessage,
        ]);

        setQueryInput("");

        setIsProcessing(true);

        try {

          // =============================================
          // REAL CATALYST REQUEST
          // =============================================

          const apiResp =
            await postAIQuery({

              query:
                trimmed,

              officerBadge:
                "KSP-1001",

              language:
                lang === "kn"
                  ? "Kannada"
                  : "English",

            });

          // =============================================
          // MAP REAL RESPONSE
          // =============================================

          const mappedData =
            mapCatalystResponse(
              apiResp,
              lang
            );

          const responseMessage:
            Message = {

            id:
              uid(),

            type:
              "response",

            text:
              apiResp.answer ??
              "Analysis complete.",

            timestamp:
              new Date(),

            data:
              mappedData,

          };

          setMessages(
            (prev) => [
              ...prev,
              responseMessage,
            ]
          );

        } catch (
        err
        ) {

          console.error(
            "CrimeLens AI query failed:",
            err
          );

          const errorMessage:
            Message = {

            id:
              uid(),

            type:
              "response",

            text:
              "Unable to retrieve investigation data. Please try again.",

            timestamp:
              new Date(),

            data: {

              confidenceScore:
                0,

              linkedEntities: {

                firs:
                  [],

                offenders:
                  [],

                vehicles:
                  [],

                locations:
                  [],

              },

            },

          };

          setMessages(
            (prev) => [
              ...prev,
              errorMessage,
            ]
          );

        } finally {

          setIsProcessing(
            false
          );

        }
      },

      [lang]
    );

  // ===================================================
  // NORMAL QUERY SUBMIT
  // ===================================================

  const handleQuerySubmit =
    useCallback(
      () => {

        const trimmed =
          queryInput.trim();

        if (
          !trimmed
        ) {
          return;
        }

        if (
          trimmed.length >
          500
        ) {

          Alert.alert(
            "",
            t.errorAttachmentType
          );

          return;
        }

        let baseMessages:
          Message[] =
          messages;

        if (
          isExampleConversation
        ) {

          baseMessages =
            [];

          setIsExampleConversation(
            false
          );

        }

        void submitQuery(
          trimmed,
          baseMessages
        );

      },
      [
        queryInput,
        messages,
        isExampleConversation,
        t,
        submitQuery,
      ]
    );

  // ===================================================
  // SUGGESTED CHIP
  // ===================================================

  const handleChipPress =
    useCallback(

      (
        chipId: string,
        queryTemplate: string
      ) => {

        const trimmed =
          queryTemplate.trim();

        if (
          !trimmed ||
          trimmed.length >
          500
        ) {
          return;
        }

        let baseMessages:
          Message[] =
          messages;

        if (
          isExampleConversation
        ) {

          baseMessages =
            [];

          setIsExampleConversation(
            false
          );

        }

        void submitQuery(
          trimmed,
          baseMessages
        );

      },

      [
        messages,
        isExampleConversation,
        submitQuery,
      ]
    );

  // ===================================================
  // VOICE — ANDROID / iOS / WEB
  // ===================================================

  const submitVoiceTranscript =
    useCallback(
      (
        transcript: string
      ) => {

        const trimmed =
          transcript.trim();

        if (
          !trimmed ||
          voiceSubmittedRef.current
        ) {
          return;
        }

        if (
          trimmed.length >
          500
        ) {

          Alert.alert(
            "",
            t.errorAttachmentType
          );

          return;
        }

        voiceSubmittedRef.current =
          true;

        setVoiceRecording(
          false
        );

        setQueryInput(
          trimmed
        );

        let baseMessages:
          Message[] =
          messagesRef.current;

        if (
          exampleConversationRef.current
        ) {

          baseMessages =
            [];

          exampleConversationRef.current =
            false;

          setIsExampleConversation(
            false
          );
        }

        void submitQuery(
          trimmed,
          baseMessages
        );

      },
      [
        submitQuery,
        t,
      ]
    );

  // Final and interim recognition results are delivered
  // here on Android, iOS and supported web browsers.
  useSpeechRecognitionEvent(
    "result",
    (event) => {

      if (Platform.OS === "web") return;

      const transcript =
        String(
          event.results?.[0]
            ?.transcript ?? ""
        ).trim();

      if (!transcript) {
        return;
      }

      voiceTranscriptRef.current =
        transcript;

      // Show speech in the normal query input while the
      // officer is speaking.
      setQueryInput(
        transcript
      );

      if (
        event.isFinal
      ) {

        submitVoiceTranscript(
          transcript
        );
      }
    }
  );

  useSpeechRecognitionEvent(
    "start",
    () => {

      if (Platform.OS === "web") return;

      setVoiceRecording(
        true
      );
    }
  );

  useSpeechRecognitionEvent(
    "end",
    () => {

      if (Platform.OS === "web") return;

      setVoiceRecording(
        false
      );

      // Some Android speech services may finish without
      // a separate final callback. Submit the latest
      // recognised text as a safe fallback.
      if (
        voiceTranscriptRef.current &&
        !voiceSubmittedRef.current
      ) {

        submitVoiceTranscript(
          voiceTranscriptRef.current
        );
      }
    }
  );

  useSpeechRecognitionEvent(
    "error",
    (event) => {

      if (Platform.OS === "web") return;

      console.error(
        "Speech recognition failed:",
        event.error,
        event.message
      );

      setVoiceRecording(
        false
      );

      const error =
        String(
          event.error ?? ""
        );

      // "aborted" is expected when the officer manually
      // stops listening, so do not show it as a failure.
      if (
        error === "aborted"
      ) {
        return;
      }

      const message =
        error === "not-allowed"
          ? (
            lang === "kn"
              ? "ಧ್ವನಿ ತನಿಖೆಯನ್ನು ಬಳಸಲು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ."
              : "Please allow microphone access to use voice investigation."
          )
          : (
            lang === "kn"
              ? "ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
              : "Speech could not be recognised. Please try again."
          );

      Alert.alert(
        "",
        message
      );
    }
  );

  const handleVoicePress =
    useCallback(
      async () => {

        if (Platform.OS === "web") {
          setVoiceMessage(null);

          if (voiceRecording) {
            webSpeechRecognizer.stop();
            setVoiceRecording(false);
            return;
          }

          if (!WebSpeechRecognizer.isSupported()) {
            const unsupportedMsg =
              lang === "kn"
                ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ."
                : "Voice input is not supported in this browser. Please type your query.";
            setVoiceMessage(unsupportedMsg);
            return;
          }

          webSpeechRecognizer.start({
            lang,
            onStart: () => {
              setVoiceRecording(true);
            },
            onResult: (transcript) => {
              // Populate input field for review/edit without auto-submitting
              setQueryInput(transcript);
            },
            onEnd: () => {
              setVoiceRecording(false);
            },
            onError: (_errType, msg) => {
              setVoiceRecording(false);
              setVoiceMessage(msg);
            },
          });

          return;
        }

        // ── NATIVE SPEECH TEMPORARILY DISABLED (Expo Go) ─────────────────
        // Native expo-speech-recognition requires a custom dev build.
        // Show a non-blocking informational message instead of crashing.
        const nativeDisabledMsg =
          lang === "kn"
            ? "ಧ್ವನಿ ಇನ್‌ಪುಟ್ CrimeLens ವೆಬ್ ಆವೃತ್ತಿಯಲ್ಲಿ ಲಭ್ಯವಿದೆ."
            : "Voice input is available in the CrimeLens web version.";
        setVoiceMessage(nativeDisabledMsg);
        // ─────────────────────────────────────────────────────────────────
      },
      [
        voiceRecording,
        lang,
      ]
    );

  // Stop an active recogniser when this screen is
  // unmounted so the microphone cannot remain active.
  useEffect(
    () => {

      return () => {

        if (Platform.OS === "web") {
          webSpeechRecognizer.stop();
        } else {
          // Native speech is temporarily disabled — nothing to clean up.
        }
      };
    },
    []
  );

  // ===================================================
  // ATTACHMENT
  // ===================================================

  const handleAttachmentPress =
    useCallback(
      () => {

        if (
          attachments.length >=
          3
        ) {

          Alert.alert(
            "",
            t.errorAttachmentSize
          );

          return;
        }

        const mockFile:
          Attachment = {

          id:
            uid(),

          name:
            `evidence_${attachments.length +
            1
            }.jpg`,

          type:
            "image/jpeg",

          uri:
            "mock://evidence.jpg",

          size:
            1.5 *
            1024 *
            1024,

        };

        const currentTotalSize =
          attachments.reduce(
            (
              sum,
              attachment
            ) =>
              sum +
              attachment.size,
            0
          );

        if (
          currentTotalSize +
          mockFile.size >
          10 *
          1024 *
          1024
        ) {

          Alert.alert(
            "",
            t.errorAttachmentSize
          );

          return;
        }

        setAttachments(
          (prev) => [
            ...prev,
            mockFile,
          ]
        );

      },

      [
        attachments,
        t,
      ]
    );

  // ===================================================
  // REMOVE ATTACHMENT
  // ===================================================

  const handleRemoveAttachment =
    useCallback(
      (
        id: string
      ) => {

        setAttachments(
          (prev) =>
            prev.filter(
              (attachment) =>
                attachment.id !==
                id
            )
        );

      },
      []
    );

  // ===================================================
  // #21 — COMPLETE INVESTIGATION REPORT
  // ===================================================

  const escapeReportHTML =
    useCallback(
      (value: unknown): string =>
        String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;"),
      []
    );

  const buildCompleteReportHTML =
    useCallback(
      (): string => {

        const kn =
          lang === "kn";

        const label = (
          en: string,
          ka: string
        ) =>
          kn ? ka : en;

        const priorityLabel = (
          value: string
        ) => {
          if (!kn) return value;

          if (value === "High") {
            return "ಹೆಚ್ಚು";
          }

          if (value === "Medium") {
            return "ಮಧ್ಯಮ";
          }

          if (value === "Low") {
            return "ಕಡಿಮೆ";
          }

          return value;
        };

        const statusLabel = (
          value: string
        ) => {
          if (!kn) return value;

          if (value === "completed") {
            return "ಪೂರ್ಣಗೊಂಡಿದೆ";
          }

          if (value === "in_progress") {
            return "ಪ್ರಗತಿಯಲ್ಲಿದೆ";
          }

          if (value === "pending") {
            return "ಬಾಕಿ ಉಳಿದಿದೆ";
          }

          return value;
        };

        const responseMessages =
          messages.filter(
            (message) =>
              message.type === "response" &&
              message.data
          );

        const queryMessages =
          messages.filter(
            (message) =>
              message.type === "query"
          );

        const latestResponse =
          [...responseMessages]
            .reverse()
            .find(
              (message) =>
                message.data
            );

        const data =
          latestResponse?.data;

        const latestQuery =
          [...queryMessages]
            .reverse()[0];

        const generatedAt =
          new Date().toLocaleString(
            kn ? "kn-IN" : "en-IN"
          );

        const renderList = (
          values: string[]
        ) =>
          values.length > 0
            ? `<ul>${values
              .map(
                (value) =>
                  `<li>${escapeReportHTML(value)}</li>`
              )
              .join("")}</ul>`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No data available.",
                "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`;

        const firRows =
          data?.linkedEntities.firs
            .map(
              (fir) => `
                <tr>
                  <td>${escapeReportHTML(fir.number)}</td>
                  <td>${escapeReportHTML(
                kn
                  ? fir.crimeTypeKn ||
                  fir.crimeType
                  : fir.crimeType
              )}</td>
                  <td>${escapeReportHTML(
                kn
                  ? fir.districtKn ||
                  fir.district
                  : fir.district
              )}</td>
                  <td>${escapeReportHTML(fir.date)}</td>
                </tr>`
            )
            .join("") ?? "";

        const offenderRows =
          data?.linkedEntities.offenders
            .map(
              (offender) => `
                <tr>
                  <td>${escapeReportHTML(offender.name)}</td>
                  <td>${escapeReportHTML(offender.id)}</td>
                  <td>${escapeReportHTML(
                offender.priorConvictions
              )}</td>
                  <td>${escapeReportHTML(
                offender.linkedFIRs.join(", ") ||
                "-"
              )}</td>
                </tr>`
            )
            .join("") ?? "";

        const vehicleRows =
          data?.linkedEntities.vehicles
            .map(
              (vehicle) => `
                <tr>
                  <td>${escapeReportHTML(vehicle.registration)}</td>
                  <td>${escapeReportHTML(vehicle.type)}</td>
                  <td>${escapeReportHTML(
                vehicle.associatedFIRs.join(", ") ||
                "-"
              )}</td>
                </tr>`
            )
            .join("") ?? "";

        const summary =
          data?.summary;

        const explainability =
          data?.explainability;

        const network =
          data?.network;

        const timeline =
          data?.timeline ?? [];

        const recommendations =
          data?.recommendations ?? [];

        const networkNodeName =
          (id: string) =>
            network?.nodes.find(
              (node) =>
                node.id === id
            )?.label ?? id;

        const conversationHTML =
          messages
            .map(
              (message) => `
                <div class="conversation-item">
                  <div class="conversation-label">
                    ${escapeReportHTML(
                message.type === "query"
                  ? label(
                    "Officer Query",
                    "ಅಧಿಕಾರಿಯ ಪ್ರಶ್ನೆ"
                  )
                  : label(
                    "CrimeLens AI Response",
                    "CrimeLens AI ಪ್ರತಿಕ್ರಿಯೆ"
                  )
              )}
                  </div>
                  <div>${escapeReportHTML(message.text)}</div>
                  <div class="small">
                    ${escapeReportHTML(
                message.timestamp.toLocaleString(
                  kn
                    ? "kn-IN"
                    : "en-IN"
                )
              )}
                  </div>
                </div>`
            )
            .join("");

        return `<!DOCTYPE html>
<html lang="${kn ? "kn" : "en"}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { margin: 28px; }
  body {
    font-family: Arial, "Noto Sans Kannada", "Noto Sans", sans-serif;
    color: #172033;
    font-size: 12px;
    line-height: 1.45;
  }
  h1 {
    color: #0F4C81;
    margin: 0 0 4px;
    font-size: 24px;
  }
  h2 {
    color: #1E3A5F;
    border-bottom: 1px solid #D8E1EA;
    padding-bottom: 5px;
    margin-top: 24px;
    font-size: 16px;
  }
  h3 {
    color: #334155;
    margin: 14px 0 6px;
    font-size: 13px;
  }
  .header {
    border-bottom: 3px solid #0F4C81;
    padding-bottom: 12px;
    margin-bottom: 18px;
  }
  .meta {
    color: #64748B;
    margin-top: 3px;
  }
  .answer {
    background: #F1F5F9;
    border-left: 4px solid #0F4C81;
    padding: 10px 12px;
    margin-top: 8px;
  }
  .grid {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .grid-row {
    display: table-row;
  }
  .grid-cell {
    display: table-cell;
    padding: 7px;
    border: 1px solid #E2E8F0;
    vertical-align: top;
  }
  .metric {
    font-size: 18px;
    font-weight: bold;
    color: #0F4C81;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 7px;
  }
  th, td {
    border: 1px solid #D8E1EA;
    padding: 6px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #EEF4F8;
    color: #1E3A5F;
  }
  ul {
    margin: 5px 0 5px 18px;
    padding: 0;
  }
  .muted, .small {
    color: #64748B;
  }
  .small {
    font-size: 10px;
    margin-top: 3px;
  }
  .network-edge,
  .timeline-item,
  .recommendation,
  .conversation-item {
    border: 1px solid #E2E8F0;
    padding: 9px;
    margin: 7px 0;
    page-break-inside: avoid;
  }
  .conversation-label {
    font-weight: bold;
    color: #1E3A5F;
    margin-bottom: 4px;
  }
  .footer-note {
    margin-top: 26px;
    padding-top: 10px;
    border-top: 1px solid #CBD5E1;
    color: #64748B;
    font-size: 10px;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>CrimeLens AI</h1>
    <div><strong>${escapeReportHTML(
          label(
            "Investigation Intelligence Report",
            "ತನಿಖಾ ಗುಪ್ತಚರ ವರದಿ"
          )
        )}</strong></div>
    <div class="meta">
      ${escapeReportHTML(
          label(
            "Generated",
            "ರಚಿಸಿದ ಸಮಯ"
          )
        )}: ${escapeReportHTML(generatedAt)}
    </div>
    <div class="meta">
      ${escapeReportHTML(
          label(
            "Officer",
            "ಅಧಿಕಾರಿ"
          )
        )}: ${escapeReportHTML(mockData.officerName)}
      &nbsp; | &nbsp;
      ${escapeReportHTML(
          label(
            "Badge",
            "ಬ್ಯಾಡ್ಜ್"
          )
        )}: ${escapeReportHTML(mockData.officerBadge)}
    </div>
  </div>

  <h2>${escapeReportHTML(
          label(
            "Current Investigation",
            "ಪ್ರಸ್ತುತ ತನಿಖೆ"
          )
        )}</h2>

  <p><strong>${escapeReportHTML(
          label(
            "Query",
            "ಪ್ರಶ್ನೆ"
          )
        )}:</strong>
  ${escapeReportHTML(
          latestQuery?.text ??
          label(
            "No query available",
            "ಪ್ರಶ್ನೆ ಲಭ್ಯವಿಲ್ಲ"
          )
        )}</p>

  <div class="answer">
    <strong>${escapeReportHTML(
          label(
            "AI Analysis",
            "AI ವಿಶ್ಲೇಷಣೆ"
          )
        )}</strong><br />
    ${escapeReportHTML(
          latestResponse?.text ??
          label(
            "No analysis available.",
            "ವಿಶ್ಲೇಷಣೆ ಲಭ್ಯವಿಲ್ಲ."
          )
        )}
  </div>

  <h2>${escapeReportHTML(
          label(
            "Linked Investigation Data",
            "ಸಂಪರ್ಕಿತ ತನಿಖಾ ಮಾಹಿತಿ"
          )
        )}</h2>

  <h3>${escapeReportHTML(
          label(
            "FIR Records",
            "FIR ದಾಖಲೆಗಳು"
          )
        )}</h3>
  ${firRows
            ? `<table>
          <thead>
            <tr>
              <th>FIR</th>
              <th>${escapeReportHTML(
              label(
                "Crime Type",
                "ಅಪರಾಧ ಪ್ರಕಾರ"
              )
            )}</th>
              <th>${escapeReportHTML(
              label(
                "District",
                "ಜಿಲ್ಲೆ"
              )
            )}</th>
              <th>${escapeReportHTML(
              label(
                "Date",
                "ದಿನಾಂಕ"
              )
            )}</th>
            </tr>
          </thead>
          <tbody>${firRows}</tbody>
        </table>`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No FIR metadata returned for this query.",
                "ಈ ಪ್ರಶ್ನೆಗೆ FIR ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h3>${escapeReportHTML(
            label(
              "Accused / Offender Records",
              "ಆರೋಪಿ / ಅಪರಾಧಿ ದಾಖಲೆಗಳು"
            )
          )}</h3>
  ${offenderRows
            ? `<table>
          <thead>
            <tr>
              <th>${escapeReportHTML(label("Name", "ಹೆಸರು"))}</th>
              <th>${escapeReportHTML(label("Accused ID", "ಆರೋಪಿ ID"))}</th>
              <th>${escapeReportHTML(label("Prior Convictions", "ಹಿಂದಿನ ದೋಷಾರೋಪಣೆಗಳು"))}</th>
              <th>${escapeReportHTML(label("Linked FIRs", "ಸಂಪರ್ಕಿತ FIRಗಳು"))}</th>
            </tr>
          </thead>
          <tbody>${offenderRows}</tbody>
        </table>`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No accused records returned.",
                "ಆರೋಪಿ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h3>${escapeReportHTML(label("Vehicles", "ವಾಹನಗಳು"))}</h3>
  ${vehicleRows
            ? `<table>
          <thead>
            <tr>
              <th>${escapeReportHTML(label("Registration", "ನೋಂದಣಿ"))}</th>
              <th>${escapeReportHTML(label("Type", "ಪ್ರಕಾರ"))}</th>
              <th>${escapeReportHTML(label("Associated FIRs", "ಸಂಬಂಧಿತ FIRಗಳು"))}</th>
            </tr>
          </thead>
          <tbody>${vehicleRows}</tbody>
        </table>`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No vehicle evidence returned.",
                "ವಾಹನ ಸಾಕ್ಷ್ಯ ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h3>${escapeReportHTML(label("Locations", "ಸ್ಥಳಗಳು"))}</h3>
  ${renderList(data?.linkedEntities.locations ?? [])}

  <h2>${escapeReportHTML(
            label(
              "Investigation Summary",
              "ತನಿಖಾ ಸಾರಾಂಶ"
            )
          )}</h2>

  ${summary
            ? `<div class="grid">
          <div class="grid-row">
            <div class="grid-cell">
              ${escapeReportHTML(label("Repeat Offenders", "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು"))}
              <div class="metric">${summary.repeatOffenders.count}</div>
            </div>
            <div class="grid-cell">
              ${escapeReportHTML(label("Known Associates", "ತಿಳಿದ ಸಹಚರರು"))}
              <div class="metric">${summary.knownAssociates.count}</div>
            </div>
            <div class="grid-cell">
              ${escapeReportHTML(label("Frequent Locations", "ಆಗಾಗ ತೆರಳುವ ಸ್ಥಳಗಳು"))}
              <div class="metric">${summary.frequentLocations.length}</div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-cell">
              ${escapeReportHTML(label("Vehicles", "ವಾಹನಗಳು"))}
              <div class="metric">${summary.commonVehicles.count}</div>
            </div>
            <div class="grid-cell">
              ${escapeReportHTML(label("Previous Arrests", "ಹಿಂದಿನ ಬಂಧನಗಳು"))}
              <div class="metric">${summary.previousArrests}</div>
            </div>
            <div class="grid-cell">
              ${escapeReportHTML(label("Priority", "ಆದ್ಯತೆ"))}
              <div class="metric">${escapeReportHTML(
              priorityLabel(summary.priority)
            )}</div>
            </div>
          </div>
        </div>
        <p><strong>${escapeReportHTML(
              label(
                "Travel Pattern",
                "ಚಲನ ಮಾದರಿ"
              )
            )}:</strong> ${escapeReportHTML(summary.travelPattern)}</p>
        ${renderList(summary.frequentLocations)}`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No investigation summary is available for this query.",
                "ಈ ಪ್ರಶ್ನೆಗೆ ತನಿಖಾ ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h2>${escapeReportHTML(
            label(
              "Explainability & Confidence",
              "ವ್ಯಾಖ್ಯಾನ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹತೆ"
            )
          )}</h2>

  ${explainability
            ? `
        <p>
          <strong>${escapeReportHTML(label("Confidence Score", "ವಿಶ್ವಾಸಾರ್ಹತೆ ಅಂಕ"))}:</strong>
          ${escapeReportHTML(explainability.confidenceScore)}%
          &nbsp; | &nbsp;
          <strong>${escapeReportHTML(label("Explainability Score", "ವ್ಯಾಖ್ಯಾನ ಅಂಕ"))}:</strong>
          ${escapeReportHTML(explainability.explainabilityScore)}%
        </p>
        ${renderList(
              explainability.factors.map(
                (factor) =>
                  `${factor.labelKey} — ${factor.weight}%`
              )
            )}`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No explainability factors are available.",
                "ವ್ಯಾಖ್ಯಾನ ಅಂಶಗಳು ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h2>${escapeReportHTML(
            label(
              "Criminal Network",
              "ಅಪರಾಧ ಜಾಲ"
            )
          )}</h2>

  ${network && network.nodes.length > 0
            ? `
        <h3>${escapeReportHTML(label("Network Members", "ಜಾಲದ ಸದಸ್ಯರು"))}</h3>
        ${renderList(
              network.nodes.map(
                (node) =>
                  `${node.label} (${node.id})`
              )
            )}
        <h3>${escapeReportHTML(label("Relationships", "ಸಂಬಂಧಗಳು"))}</h3>
        ${network.edges.length > 0
              ? network.edges
                .map(
                  (edge) => {

                    // The existing NetworkGraphData type only
                    // exposes the core graph fields. Catalyst
                    // relationship metadata is still attached
                    // at runtime by mapCatalystResponseToMessageData.
                    // Read those optional report-only fields
                    // without changing the working graph type.
                    const reportEdge =
                      edge as typeof edge & {
                        type?: string;
                        strength?: number | string;
                        status?: string;
                        relatedFir?: string;
                        notes?: string;
                      };

                    return `
                    <div class="network-edge">
                      <strong>${escapeReportHTML(
                      networkNodeName(reportEdge.from)
                    )} → ${escapeReportHTML(
                      networkNodeName(reportEdge.to)
                    )}</strong><br />
                      ${escapeReportHTML(label("Relationship", "ಸಂಬಂಧ"))}: ${escapeReportHTML(reportEdge.label ?? reportEdge.type ?? "-")}<br />
                      ${escapeReportHTML(label("Strength", "ಬಲ"))}: ${escapeReportHTML(reportEdge.strength ?? "-")}${reportEdge.strength ? "%" : ""}<br />
                      ${escapeReportHTML(label("Status", "ಸ್ಥಿತಿ"))}: ${escapeReportHTML(reportEdge.status ?? "-")}<br />
                      ${escapeReportHTML(label("Related FIR", "ಸಂಬಂಧಿತ FIR"))}: ${escapeReportHTML(reportEdge.relatedFir ?? "-")}<br />
                      ${escapeReportHTML(label("Notes", "ಟಿಪ್ಪಣಿಗಳು"))}: ${escapeReportHTML(reportEdge.notes ?? "-")}
                    </div>`;
                  }
                )
                .join("")
              : `<p class="muted">${escapeReportHTML(
                label(
                  "No network relationships returned.",
                  "ಜಾಲ ಸಂಬಂಧಗಳು ಲಭ್ಯವಿಲ್ಲ."
                )
              )}</p>`
            }`
            : `<p class="muted">${escapeReportHTML(
              label(
                "No criminal-network data is available for this query.",
                "ಈ ಪ್ರಶ್ನೆಗೆ ಅಪರಾಧ ಜಾಲದ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h2>${escapeReportHTML(
            label(
              "Investigation Timeline",
              "ತನಿಖಾ ಕಾಲರೇಖೆ"
            )
          )}</h2>

  ${timeline.length > 0
            ? timeline
              .map(
                (entry) => `
              <div class="timeline-item">
                <strong>${escapeReportHTML(entry.labelKey)}</strong><br />
                ${escapeReportHTML(entry.timestamp)}<br />
                ${escapeReportHTML(entry.description)}<br />
                <span class="small">${escapeReportHTML(
                  statusLabel(entry.status)
                )}</span>
              </div>`
              )
              .join("")
            : `<p class="muted">${escapeReportHTML(
              label(
                "No timeline events are available.",
                "ಕಾಲರೇಖೆಯ ಘಟನೆಗಳು ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h2>${escapeReportHTML(
            label(
              "AI Recommendations",
              "AI ಶಿಫಾರಸುಗಳು"
            )
          )}</h2>

  ${recommendations.length > 0
            ? recommendations
              .map(
                (recommendation) => `
              <div class="recommendation">
                <strong>${escapeReportHTML(recommendation.titleKey)}</strong>
                — ${escapeReportHTML(
                  priorityLabel(recommendation.priority)
                )}<br />
                ${escapeReportHTML(recommendation.descKey)}
              </div>`
              )
              .join("")
            : `<p class="muted">${escapeReportHTML(
              label(
                "No AI recommendations are available.",
                "AI ಶಿಫಾರಸುಗಳು ಲಭ್ಯವಿಲ್ಲ."
              )
            )}</p>`
          }

  <h2>${escapeReportHTML(
            label(
              "Conversation Record",
              "ಸಂಭಾಷಣೆ ದಾಖಲೆ"
            )
          )}</h2>
  ${conversationHTML}

  <div class="footer-note">
    ${escapeReportHTML(
            label(
              "CrimeLens AI decision-support output. Investigation findings should be verified against authorized police records and evidence before operational use.",
              "CrimeLens AI ನಿರ್ಧಾರ-ಬೆಂಬಲ ಫಲಿತಾಂಶ. ಕಾರ್ಯಾಚರಣೆಯ ಬಳಕೆಗೆ ಮೊದಲು ತನಿಖಾ ಫಲಿತಾಂಶಗಳನ್ನು ಅಧಿಕೃತ ಪೊಲೀಸ್ ದಾಖಲೆಗಳು ಮತ್ತು ಸಾಕ್ಷ್ಯಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಬೇಕು."
            )
          )}
  </div>
</body>
</html>`;
      },
      [
        lang,
        messages,
        escapeReportHTML,
      ]
    );

  // ===================================================
  // GENERATE REPORT
  // ===================================================

  const handleGenerateReport =
    useCallback(
      async () => {

        if (
          isGeneratingReport
        ) {
          return;
        }

        setIsGeneratingReport(
          true
        );

        setReportCountdown(
          5
        );

        let count =
          5;

        const interval =
          setInterval(
            () => {

              count -=
                1;

              setReportCountdown(
                count
              );

              if (
                count <=
                0
              ) {

                clearInterval(
                  interval
                );

              }

            },
            1000
          );

        try {

          const html =
            buildCompleteReportHTML();

          const {
            uri,
          } =
            await Print.printToFileAsync(
              {
                html,
                base64:
                  false,
              }
            );

          setReportUri(
            uri
          );

          setReportVisible(
            true
          );

        } catch {

          Alert.alert(
            "",
            t.retry
          );

        } finally {

          clearInterval(
            interval
          );

          setIsGeneratingReport(
            false
          );

          setReportCountdown(
            5
          );

        }
      },

      [
        isGeneratingReport,
        messages,
        t,
        buildCompleteReportHTML,
      ]
    );

  // ===================================================
  // EXPORT PDF
  // ===================================================

  const handleExportPDF =
    useCallback(
      async () => {

        try {

          const html =
            buildCompleteReportHTML();

          // =============================================
          // WEB
          // =============================================

          if (
            Platform.OS === "web"
          ) {

            const reportWindow =
              window.open(
                "",
                "_blank"
              );

            if (
              !reportWindow
            ) {

              Alert.alert(
                "",
                "Please allow pop-ups to export the report."
              );

              return;
            }

            reportWindow.document.open();

            reportWindow.document.write(
              html
            );

            reportWindow.document.close();

            reportWindow.focus();

            // Wait for the report HTML to finish rendering
            // before opening the browser PDF dialog.
            setTimeout(
              () => {

                reportWindow.print();

              },
              500
            );

            return;
          }

          // =============================================
          // ANDROID / IOS
          // =============================================

          const result =
            await Print.printToFileAsync({
              html,
            });

          setReportUri(
            result.uri
          );

          if (
            await Sharing.isAvailableAsync()
          ) {

            await Sharing.shareAsync(
              result.uri,
              {
                mimeType:
                  "application/pdf",

                dialogTitle:
                  lang === "kn"
                    ? "CrimeLens AI ತನಿಖಾ ವರದಿ"
                    : "CrimeLens AI Investigation Report",

                UTI:
                  "com.adobe.pdf",
              }
            );

          } else {

            Alert.alert(
              "",
              lang === "kn"
                ? "PDF ವರದಿ ರಚಿಸಲಾಗಿದೆ."
                : "PDF investigation report generated."
            );

          }

        } catch (
        error
        ) {

          console.error(
            "PDF export failed:",
            error
          );

          Alert.alert(
            "",
            lang === "kn"
              ? "PDF ವರದಿಯನ್ನು ರಫ್ತು ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
              : "Unable to export the PDF report."
          );

        }

      },
      [
        buildCompleteReportHTML,
        lang,
      ]
    );
  // ===================================================
  // #22 — SHARE CURRENT INVESTIGATION
  // ===================================================

  const handleShareInvestigation =
    useCallback(
      async () => {

        try {

          const kn =
            lang === "kn";

          const label = (
            english: string,
            kannada: string
          ) =>
            kn
              ? kannada
              : english;

          const priorityLabel = (
            value: string
          ) => {

            if (!kn) {
              return value;
            }

            if (value === "High") {
              return "ಹೆಚ್ಚು";
            }

            if (value === "Medium") {
              return "ಮಧ್ಯಮ";
            }

            if (value === "Low") {
              return "ಕಡಿಮೆ";
            }

            return value;
          };

          // Use the latest REAL response that contains
          // mapped investigation data.
          const latestResponse =
            [...messages]
              .reverse()
              .find(
                (message) =>
                  message.type === "response" &&
                  Boolean(message.data)
              );

          if (
            !latestResponse ||
            !latestResponse.data
          ) {

            Alert.alert(
              "",
              label(
                "Run an investigation query before sharing.",
                "ಹಂಚಿಕೊಳ್ಳುವ ಮೊದಲು ತನಿಖಾ ಪ್ರಶ್ನೆಯನ್ನು ಚಲಾಯಿಸಿ."
              )
            );

            return;
          }

          // Match the latest response to the query that
          // immediately preceded it instead of sharing
          // an unrelated older query.
          const responseIndex =
            messages.findIndex(
              (message) =>
                message.id ===
                latestResponse.id
            );

          let latestQuery:
            Message |
            undefined;

          for (
            let index =
              responseIndex - 1;
            index >= 0;
            index -= 1
          ) {

            if (
              messages[index].type ===
              "query"
            ) {

              latestQuery =
                messages[index];

              break;
            }
          }

          const data =
            latestResponse.data;

          const summary =
            data.summary;

          const explainability =
            data.explainability;

          const network =
            data.network;

          const lines:
            string[] =
            [];

          lines.push(
            "CrimeLens AI"
          );

          lines.push(
            label(
              "Investigation Summary",
              "ತನಿಖಾ ಸಾರಾಂಶ"
            )
          );

          lines.push("");

          lines.push(
            `${label(
              "Query",
              "ಪ್ರಶ್ನೆ"
            )}: ${latestQuery?.text ??
            label(
              "Not available",
              "ಲಭ್ಯವಿಲ್ಲ"
            )
            }`
          );

          lines.push("");

          lines.push(
            `${label(
              "AI Conclusion",
              "AI ತೀರ್ಮಾನ"
            )}: ${latestResponse.text}`
          );

          lines.push("");

          // ---------------------------------------------
          // PRIORITY + CONFIDENCE + EXPLAINABILITY
          // ---------------------------------------------

          if (summary) {

            lines.push(
              `${label(
                "Priority",
                "ಆದ್ಯತೆ"
              )}: ${priorityLabel(
                summary.priority
              )}`
            );
          }

          lines.push(
            `${label(
              "Confidence Score",
              "ವಿಶ್ವಾಸಾರ್ಹತೆ ಅಂಕ"
            )}: ${data.confidenceScore}%`
          );

          if (explainability) {

            lines.push(
              `${label(
                "Explainability Score",
                "ವ್ಯಾಖ್ಯಾನ ಅಂಕ"
              )}: ${explainability.explainabilityScore}%`
            );
          }

          // ---------------------------------------------
          // ACCUSED / OFFENDERS
          // ---------------------------------------------

          if (
            data.linkedEntities.offenders.length >
            0
          ) {

            lines.push("");
            lines.push(
              `${label(
                "Accused / Offenders",
                "ಆರೋಪಿ / ಅಪರಾಧಿಗಳು"
              )}:`
            );

            data.linkedEntities.offenders.forEach(
              (offender) => {

                const firText =
                  offender.linkedFIRs.length >
                    0
                    ? ` | FIR: ${offender.linkedFIRs.join(", ")}`
                    : "";

                lines.push(
                  `• ${offender.name} (${offender.id})${firText}`
                );
              }
            );
          }

          // ---------------------------------------------
          // FIR RECORDS
          // ---------------------------------------------

          if (
            data.linkedEntities.firs.length >
            0
          ) {

            lines.push("");
            lines.push(
              `${label(
                "FIR Records",
                "FIR ದಾಖಲೆಗಳು"
              )}:`
            );

            data.linkedEntities.firs.forEach(
              (fir) => {

                const details =
                  [
                    kn
                      ? fir.crimeTypeKn ||
                      fir.crimeType
                      : fir.crimeType,

                    kn
                      ? fir.districtKn ||
                      fir.district
                      : fir.district,

                    fir.date,
                  ]
                    .filter(Boolean)
                    .join(" | ");

                lines.push(
                  `• ${fir.number}${details
                    ? ` — ${details}`
                    : ""
                  }`
                );
              }
            );
          }

          // ---------------------------------------------
          // VEHICLES
          // ---------------------------------------------

          if (
            data.linkedEntities.vehicles.length >
            0
          ) {

            lines.push("");
            lines.push(
              `${label(
                "Vehicles",
                "ವಾಹನಗಳು"
              )}:`
            );

            data.linkedEntities.vehicles.forEach(
              (vehicle) => {

                lines.push(
                  `• ${vehicle.registration}${vehicle.type
                    ? ` — ${vehicle.type}`
                    : ""
                  }`
                );
              }
            );
          }

          // ---------------------------------------------
          // LOCATIONS
          // ---------------------------------------------

          if (
            data.linkedEntities.locations.length >
            0
          ) {

            lines.push("");
            lines.push(
              `${label(
                "Locations",
                "ಸ್ಥಳಗಳು"
              )}:`
            );

            data.linkedEntities.locations.forEach(
              (location) => {

                lines.push(
                  `• ${location}`
                );
              }
            );
          }

          // ---------------------------------------------
          // CRIMINAL NETWORK CONNECTIONS
          // ---------------------------------------------

          if (
            network &&
            network.edges.length >
            0
          ) {

            const networkNodeName =
              (id: string) =>
                network.nodes.find(
                  (node) =>
                    node.id === id
                )?.label ?? id;

            lines.push("");
            lines.push(
              `${label(
                "Criminal Network Connections",
                "ಅಪರಾಧ ಜಾಲ ಸಂಪರ್ಕಗಳು"
              )}:`
            );

            network.edges.forEach(
              (edge) => {

                lines.push(
                  `• ${networkNodeName(
                    edge.from
                  )} → ${networkNodeName(
                    edge.to
                  )}${edge.label
                    ? ` — ${edge.label}`
                    : ""
                  }`
                );
              }
            );
          }

          // ---------------------------------------------
          // SUMMARY COUNTS
          // ---------------------------------------------

          if (summary) {

            lines.push("");
            lines.push(
              `${label(
                "Known Associates",
                "ತಿಳಿದ ಸಹಚರರು"
              )}: ${summary.knownAssociates.count}`
            );

            lines.push(
              `${label(
                "Repeat Offenders",
                "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು"
              )}: ${summary.repeatOffenders.count}`
            );

            lines.push(
              `${label(
                "Frequent Locations",
                "ಆಗಾಗ ತೆರಳುವ ಸ್ಥಳಗಳು"
              )}: ${summary.frequentLocations.length}`
            );
          }

          lines.push("");
          lines.push(
            label(
              "CrimeLens AI is a decision-support tool. Verify critical findings against official investigation records.",
              "CrimeLens AI ನಿರ್ಧಾರ-ಸಹಾಯಕ ಸಾಧನವಾಗಿದೆ. ಪ್ರಮುಖ ಕಂಡುಬಂದ ಮಾಹಿತಿಯನ್ನು ಅಧಿಕೃತ ತನಿಖಾ ದಾಖಲೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ."
            )
          );

          const shareMessage =
            lines.join("\n");

          const shareTitle =
            label(
              "CrimeLens AI Investigation Summary",
              "CrimeLens AI ತನಿಖಾ ಸಾರಾಂಶ"
            );

          // =============================================
          // WEB SHARE
          // =============================================

          if (
            Platform.OS === "web"
          ) {

            const webNavigator =
              navigator as Navigator & {
                share?: (
                  data: {
                    title?: string;
                    text?: string;
                  }
                ) => Promise<void>;
              };

            if (
              typeof webNavigator.share ===
              "function"
            ) {

              await webNavigator.share({
                title:
                  shareTitle,

                text:
                  shareMessage,
              });

              return;
            }

            // Desktop browsers that do not expose the
            // Web Share API still get a useful fallback.
            if (
              navigator.clipboard &&
              typeof navigator.clipboard.writeText ===
              "function"
            ) {

              await navigator.clipboard.writeText(
                shareMessage
              );

              Alert.alert(
                "",
                label(
                  "Investigation summary copied to clipboard.",
                  "ತನಿಖಾ ಸಾರಾಂಶವನ್ನು ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ."
                )
              );

              return;
            }

            Alert.alert(
              "",
              label(
                "Sharing is not supported by this browser.",
                "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಹಂಚಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ."
              )
            );

            return;
          }

          // =============================================
          // ANDROID / IOS NATIVE SHARE SHEET
          //
          // React Native Share opens the phone's native
          // chooser, allowing installed targets such as
          // WhatsApp, Messages, email, etc.
          // =============================================

          await Share.share(
            {
              title:
                shareTitle,

              message:
                shareMessage,
            },
            {
              dialogTitle:
                shareTitle,
            }
          );

        } catch (
        error
        ) {

          console.error(
            "CrimeLens investigation share failed:",
            error
          );

          Alert.alert(
            "",
            lang === "kn"
              ? "ತನಿಖಾ ಸಾರಾಂಶವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
              : "Unable to share the investigation summary. Please try again."
          );
        }
      },
      [
        messages,
        lang,
      ]
    );

  // ===================================================
  // FULL NETWORK
  // ===================================================

  const handleOpenFullNetwork =
    useCallback(
      (
        network?: NetworkGraphData
      ) => {

        if (
          !network ||
          network.nodes.length === 0
        ) {

          Alert.alert(
            t.networkTitle,
            lang === "kn" ? "ಈ ಫಲಿತಾಂಶಕ್ಕೆ ಅಪರಾಧ ಜಾಲದ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ." : "No criminal-network data is available for this result."
          );

          return;
        }

        setSelectedNetwork(
          network
        );

        setFullNetworkVisible(
          true
        );

      },
      [t]
    );

  // ===================================================
  // RENDER CONVERSATION
  // ===================================================

  function renderConversation() {

    if (
      messages.length ===
      0
    ) {
      return null;
    }

    return (
      <>
        {messages.map(
          (msg) => {

            // ===========================================
            // QUERY
            // ===========================================

            if (
              msg.type ===
              "query"
            ) {

              return (
                <QueryBubble

                  key={
                    msg.id
                  }

                  text={
                    msg.text
                  }

                  timestamp={
                    msg.timestamp
                  }

                />
              );
            }

            // ===========================================
            // AI RESPONSE
            // ===========================================

            const data =
              msg.data;

            if (
              !data
            ) {
              return null;
            }

            return (

              <React.Fragment
                key={
                  msg.id
                }
              >

                <AIResponseCard

                  lang={
                    lang
                  }

                  text={
                    msg.text
                  }

                  timestamp={
                    msg.timestamp
                  }

                  confidenceScore={
                    data.confidenceScore
                  }

                  linkedEntities={
                    data.linkedEntities
                  }

                />

                {/* =====================================
                    INVESTIGATION SUMMARY
                ====================================== */}

                {data.summary && (

                  <InvestigationSummaryPanel

                    lang={
                      lang
                    }

                    summary={
                      data.summary
                    }

                  />

                )}

                {/* =====================================
                    EXPLAINABLE AI
                ====================================== */}

                {data.explainability && (

                  <ExplainableAICard

                    lang={
                      lang
                    }

                    data={
                      data.explainability
                    }

                  />

                )}

                {/* =====================================
                    CRIMINAL NETWORK
                ====================================== */}

                {data.network && (

                  <CriminalNetworkPreview

                    lang={
                      lang
                    }

                    network={
                      data.network
                    }

                    onOpenFullView={
                      () =>
                        handleOpenFullNetwork(
                          data.network
                        )
                    }

                  />

                )}

                {/* =====================================
                    TIMELINE
                ====================================== */}

                {data.timeline &&
                  data.timeline.length >
                  0 && (

                    <InvestigationTimeline

                      lang={
                        lang
                      }

                      timeline={
                        data.timeline
                      }

                    />

                  )}

                {/* =====================================
                    AI RECOMMENDATIONS
                ====================================== */}

                {data.recommendations &&
                  data.recommendations.length >
                  0 && (

                    <AIRecommendationsSection

                      lang={
                        lang
                      }

                      recommendations={
                        data.recommendations
                      }

                      onActionPress={
                        (recId) => {

                          const firs =
                            data.linkedEntities.firs;

                          const offenders =
                            data.linkedEntities.offenders;

                          const locations =
                            data.linkedEntities.locations;

                          // =================================
                          // REVIEW HIGH-PRIORITY RECORDS
                          // =================================

                          if (
                            recId ===
                            "review-high-priority-records"
                          ) {

                            const firText =
                              firs.length > 0
                                ? firs
                                  .map(
                                    (fir) =>
                                      `${fir.number} — ${fir.crimeType || "Crime type unavailable"}${fir.district ? ` (${fir.district})` : ""}`
                                  )
                                  .join("\n")
                                : "";

                            const accusedText =
                              offenders.length > 0
                                ? offenders
                                  .map(
                                    (offender) =>
                                      `${offender.name} (${offender.id})`
                                  )
                                  .join("\n")
                                : "";

                            openRecommendationModal(
                              "High-Priority Records",
                              [
                                firText,
                                accusedText,
                              ]
                                .filter(Boolean)
                                .join("\n\n") ||
                              "No linked high-priority records are available in this result."
                            );

                            return;
                          }

                          // =================================
                          // REVIEW REPEAT-OFFENDER FIR LINKS
                          // =================================

                          if (
                            recId ===
                            "review-repeat-offender-links"
                          ) {

                            const repeatOffenders =
                              offenders.filter(
                                (offender) =>
                                  offender.linkedFIRs.length >
                                  1
                              );

                            const details =
                              repeatOffenders
                                .map(
                                  (offender) =>
                                    `${offender.name} (${offender.id})\nLinked FIRs: ${offender.linkedFIRs.join(", ")}`
                                )
                                .join("\n\n");

                            openRecommendationModal(
                              "Repeat-Offender FIR Links",
                              details ||
                              "No multiple-FIR links are available in this result."
                            );

                            return;
                          }

                          // =================================
                          // REVIEW LOCATIONS
                          // =================================

                          if (
                            recId ===
                            "review-location-patterns"
                          ) {

                            const details =
                              locations.length > 0
                                ? locations
                                  .map(
                                    (location, index) =>
                                      `${index + 1}. ${location}`
                                  )
                                  .join("\n")
                                : "No relevant locations are available in this result.";

                            openRecommendationModal(
                              "Location Patterns",
                              details
                            );

                            return;
                          }

                          // =================================
                          // REVIEW ACTIVE CASE STATUS
                          // =================================

                          if (
                            recId ===
                            "review-active-investigations"
                          ) {

                            const timelineStatuses =
                              (data.timeline ?? [])
                                .filter(
                                  (entry) =>
                                    entry.status ===
                                    "in_progress" ||
                                    entry.status ===
                                    "pending"
                                )
                                .map(
                                  (entry) =>
                                    `${entry.labelKey}\n${entry.description}`
                                );

                            const details =
                              timelineStatuses.length >
                                0
                                ? timelineStatuses.join(
                                  "\n\n"
                                )
                                : firs.length > 0
                                  ? firs
                                    .map(
                                      (fir) =>
                                        `${fir.number} — review current case status`
                                    )
                                    .join("\n")
                                  : "No active case-status information is available in this result.";

                            openRecommendationModal(
                              "Active Investigation Status",
                              details
                            );

                            return;
                          }

                          // =================================
                          // REVIEW NETWORK CONNECTIONS
                          // =================================

                          if (
                            recId ===
                            "review-network-connections"
                          ) {

                            const network =
                              data.network;

                            const details =
                              network &&
                                network.nodes.length >
                                0
                                ? [
                                  `Nodes: ${network.nodes
                                    .map(
                                      (node) =>
                                        node.label
                                    )
                                    .join(", ")}`,
                                  network.edges.length >
                                    0
                                    ? `Connections:\n${network.edges
                                      .map(
                                        (edge) =>
                                          `${edge.from} → ${edge.to}${edge.label ? ` (${edge.label})` : ""}`
                                      )
                                      .join("\n")}`
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join("\n\n")
                                : "No criminal-network connections are available in this result.";

                            openRecommendationModal(
                              "Network Connections",
                              details
                            );

                            return;
                          }

                          // =================================
                          // GENERAL FIR REVIEW
                          // =================================

                          if (
                            recId ===
                            "review-linked-fir-evidence"
                          ) {

                            const details =
                              firs.length > 0
                                ? firs
                                  .map(
                                    (fir) =>
                                      `${fir.number} — ${fir.crimeType || "Crime type unavailable"}${fir.district ? ` (${fir.district})` : ""}`
                                  )
                                  .join("\n")
                                : "No FIR records are available in this result.";

                            openRecommendationModal(
                              "Linked FIR Evidence",
                              details
                            );

                            return;
                          }

                          // =================================
                          // GENERAL ACCUSED REVIEW
                          // =================================

                          if (
                            recId ===
                            "review-accused-records"
                          ) {

                            const details =
                              offenders.length > 0
                                ? offenders
                                  .map(
                                    (offender) =>
                                      `${offender.name} (${offender.id})${offender.linkedFIRs.length > 0 ? `\nLinked FIRs: ${offender.linkedFIRs.join(", ")}` : ""}`
                                  )
                                  .join("\n\n")
                                : "No accused records are available in this result.";

                            openRecommendationModal(
                              "Accused Records",
                              details
                            );

                            return;
                          }

                          openRecommendationModal(
                            "Recommendation",
                            "No additional review details are available for this recommendation."
                          );
                        }
                      }

                    />

                  )}

              </React.Fragment>
            );
          }
        )}
      </>
    );
  }

  // ===================================================
  // PROCESSING INDICATOR
  // ===================================================

  function renderProcessingIndicator() {

    if (
      !isProcessing
    ) {
      return null;
    }

    return (

      <View
        style={
          styles.processingRow
        }
      >

        <ActivityIndicator

          size="small"

          color="#0F4C81"

        />

        <Text
          style={
            styles.processingText
          }
        >

          {t.aiAnalysing}

        </Text>

      </View>
    );
  }

  // ===================================================
  // AI STATUS
  // ===================================================

  const aiStatus =
    mockData.aiStatus;

  // ===================================================
  // RENDER
  // ===================================================

  return (

    <View
      style={
        styles.container
      }
    >

      {/* ===============================================
          TOP BAR
      ================================================ */}

      <InvestigationTopBar

        lang={
          lang
        }

        setLang={
          setLang
        }

        onVoicePress={
          handleVoicePress
        }

        voiceActive={
          voiceRecording
        }

        onBack={
          onBack
        }

        onMenuPress={
          () => setDrawerVisible(true)
        }

      />

      <NavigationDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        lang={lang}
        savedInvestigations={savedInvestigations}
        notesCount={currentNotes.length}
        tasksCount={currentTasks.length}
        evidenceCount={currentEvidence.length}
        officerName={mockData.officerName}
        officerBadge={mockData.officerBadge}
        officerRole={mockData.officerRole}
        onNewInvestigation={() => {
          setMessages([]);
          setQueryInput("");
        }}
        onOpenHistory={() => setHistoryVisible(true)}
        onSaveInvestigation={handleSaveInvestigation}
        onOpenNotes={() => {
          resetNoteEditor();
          setNoteSearch("");
          setNotesVisible(true);
        }}
        onOpenTasks={() => {
          resetTaskEditor();
          setTaskSearch("");
          setTaskStatusFilter("All");
          setTasksVisible(true);
        }}
        onOpenEvidence={() => {
          resetEvidenceComposer();
          setEvidenceSearch("");
          setEvidenceFilter("All");
          setEvidenceVisible(true);
        }}
        onOpenCollaboration={() => setCollaborationVisible(true)}
        onSelectSavedInvestigation={(inv) => {
          setHistoryVisible(true);
        }}
      />

      {/* ===============================================
          REPORT GENERATION BANNER
      ================================================ */}

      {isGeneratingReport && (

        <View
          style={
            styles.reportBanner
          }
        >

          <ActivityIndicator

            size="small"

            color="#FFFFFF"

          />

          <Text
            style={
              styles.reportBannerText
            }
          >

            {t.generatingReport}

            {reportCountdown >
              0
              ? ` ${reportCountdown}s`
              : ""}

          </Text>

        </View>

      )}

      {/* ===============================================
          CHAT AREA
      ================================================ */}

      <ScrollView

        ref={
          scrollViewRef
        }

        style={
          styles.scrollView
        }

        contentContainerStyle={
          styles.scrollContent
        }

        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"

      >

        {/* =============================================
            SUGGESTED CHIPS
        ============================================== */}

        <SuggestedChips

          lang={
            lang
          }

          onChipPress={
            handleChipPress
          }

        />

        {/* =============================================
            CONVERSATION
        ============================================== */}

        {renderConversation()}

        {/* =============================================
            PROCESSING
        ============================================== */}

        {renderProcessingIndicator()}

        <View
          style={
            styles.bottomPadding
          }
        />

      </ScrollView>

      {/* ===============================================
          INPUT BAR
      ================================================ */}

      <WelcomeCard

        lang={
          lang
        }

        queryInput={
          queryInput
        }

        onQueryChange={
          setQueryInput
        }

        onQuerySubmit={
          handleQuerySubmit
        }

        onVoicePress={
          handleVoicePress
        }

        onAttachmentPress={
          handleAttachmentPress
        }

        attachments={
          attachments
        }

        officerName={
          mockData.officerName
        }

        officerRole={
          mockData.officerRole
        }

        onRemoveAttachment={
          handleRemoveAttachment
        }

        voiceActive={
          voiceRecording
        }

        voiceMessage={
          voiceMessage
        }

        onClearVoiceMessage={
          () => setVoiceMessage(null)
        }

      />

      {/* ===============================================
          BOTTOM ACTION BAR
      ================================================ */}

      <BottomActionBar

        lang={
          lang
        }

        onGenerateReport={
          handleGenerateReport
        }

        onExportPDF={
          handleExportPDF
        }

        onShareInvestigation={
          handleShareInvestigation
        }

        onVoiceInvestigation={
          handleVoicePress
        }

        isGeneratingReport={
          isGeneratingReport
        }

      />



      {/* ===============================================
          #23 — INVESTIGATION HISTORY MODAL
      ================================================ */}

      {/* =================================================
          #27 — CASE COLLABORATION & HANDOVER MODAL
          ================================================= */}

      <Modal
        visible={collaborationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollaborationVisible(false)}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalCard}>
            <View style={styles.historyModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyModalTitle}>
                  {lang === "kn" ? "ಪ್ರಕರಣ ಸಹಯೋಗ ಮತ್ತು ಹಸ್ತಾಂತರ" : "Case Collaboration & Handover"}
                </Text>
                <Text style={styles.historyModalSubtitle}>
                  {lang === "kn"
                    ? "ಪ್ರಕರಣದ ಹೊಣೆಗಾರಿಕೆ, ಸ್ಥಿತಿ ಮತ್ತು ಅಧಿಕಾರಿ ಹಸ್ತಾಂತರವನ್ನು ದಾಖಲಿಸಿ."
                    : "Track case ownership, status and officer handover."}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.historyCloseButton}
                onPress={() => setCollaborationVisible(false)}
              >
                <Text style={styles.historyCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.collaborationScroll}
              contentContainerStyle={styles.collaborationContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <View style={styles.collaborationSummaryCard}>
                <Text style={styles.collaborationLabel}>
                  {lang === "kn" ? "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ" : "Current Status"}
                </Text>
                <Text style={styles.collaborationValue}>
                  {caseStatus}
                </Text>

                <Text style={[styles.collaborationLabel, { marginTop: 10 }]}>
                  {lang === "kn" ? "ನಿಯೋಜಿತ ಅಧಿಕಾರಿ" : "Assigned Officer"}
                </Text>
                <Text style={styles.collaborationValue}>
                  {assignedOfficerName} • {assignedOfficerBadge}
                </Text>
              </View>

              <Text style={styles.collaborationSectionTitle}>
                {lang === "kn" ? "ಪ್ರಕರಣದ ಸ್ಥಿತಿ" : "Case Status"}
              </Text>

              <View style={styles.collaborationChoiceRow}>
                {(["Open", "Under Investigation", "Escalated", "Closed"] as CaseStatus[]).map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.collaborationChoiceButton,
                        caseStatus === status && styles.collaborationChoiceButtonActive,
                      ]}
                      onPress={() => setCaseStatus(status)}
                    >
                      <Text
                        style={[
                          styles.collaborationChoiceText,
                          caseStatus === status && styles.collaborationChoiceTextActive,
                        ]}
                      >
                        {lang === "kn"
                          ? status === "Open"
                            ? "ತೆರೆದಿದೆ"
                            : status === "Under Investigation"
                              ? "ತನಿಖೆಯಲ್ಲಿದೆ"
                              : status === "Escalated"
                                ? "ಮೇಲ್ದರ್ಜೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ"
                                : "ಮುಚ್ಚಲಾಗಿದೆ"
                          : status}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={styles.collaborationSectionTitle}>
                {lang === "kn" ? "ನಿಯೋಜನೆ / ಮರುನಿಯೋಜನೆ" : "Assign / Reassign"}
              </Text>

              <TextInput
                value={assignedOfficerName}
                onChangeText={setAssignedOfficerName}
                placeholder={lang === "kn" ? "ಅಧಿಕಾರಿಯ ಹೆಸರು" : "Officer name"}
                placeholderTextColor="#94A3B8"
                style={styles.collaborationInput}
              />

              <TextInput
                value={assignedOfficerBadge}
                onChangeText={setAssignedOfficerBadge}
                placeholder={lang === "kn" ? "ಬ್ಯಾಡ್ಜ್ ID" : "Badge ID"}
                placeholderTextColor="#94A3B8"
                style={styles.collaborationInput}
              />

              <Text style={styles.collaborationSectionTitle}>
                {lang === "kn" ? "ಹಸ್ತಾಂತರ ಟಿಪ್ಪಣಿ" : "Handover Note"}
              </Text>

              <TextInput
                value={handoverNote}
                onChangeText={setHandoverNote}
                multiline
                maxLength={1000}
                placeholder={
                  lang === "kn"
                    ? "ಮುಂದಿನ ಅಧಿಕಾರಿಗೆ ಅಗತ್ಯವಾದ ತನಿಖಾ ಮಾಹಿತಿ..."
                    : "Investigation context the next officer needs..."
                }
                placeholderTextColor="#94A3B8"
                style={[styles.collaborationInput, styles.collaborationNoteInput]}
              />

              <TouchableOpacity
                style={styles.collaborationSaveButton}
                onPress={() => void handleSaveCaseCollaboration()}
              >
                <Text style={styles.collaborationSaveButtonText}>
                  {lang === "kn" ? "ಸಹಯೋಗ ವಿವರಗಳನ್ನು ಉಳಿಸಿ" : "Save Collaboration"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.collaborationSectionTitle}>
                {lang === "kn" ? "ಚಟುವಟಿಕೆ ದಾಖಲೆ" : "Activity Log"}
              </Text>

              {caseActivity.length === 0 ? (
                <View style={styles.historyEmptyState}>
                  <Text style={styles.historyEmptyTitle}>
                    {lang === "kn" ? "ಇನ್ನೂ ಚಟುವಟಿಕೆ ಇಲ್ಲ" : "No activity yet"}
                  </Text>
                  <Text style={styles.historyEmptyText}>
                    {lang === "kn"
                      ? "ನಿಯೋಜನೆ, ಸ್ಥಿತಿ ಅಥವಾ ಹಸ್ತಾಂತರ ಬದಲಾವಣೆಗಳನ್ನು ಇಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ."
                      : "Assignments, status changes and handovers will appear here."}
                  </Text>
                </View>
              ) : (
                caseActivity.map((entry) => (
                  <View key={entry.id} style={styles.collaborationActivityCard}>
                    <Text style={styles.collaborationActivityAction}>
                      {entry.action}
                    </Text>
                    <Text style={styles.collaborationActivityDescription}>
                      {entry.description}
                    </Text>
                    <Text style={styles.collaborationActivityMeta}>
                      {entry.officerName} • {entry.officerBadge} •{" "}
                      {new Date(entry.createdAt).toLocaleString(
                        lang === "kn" ? "kn-IN" : "en-IN"
                      )}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =================================================
          #26 — EVIDENCE & ATTACHMENTS MODAL
          ================================================= */}

      <Modal
        visible={evidenceVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          resetEvidenceComposer();
          setEvidenceVisible(false);
        }}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalCard}>
            <View style={styles.historyModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyModalTitle}>
                  {lang === "kn" ? "ಸಾಕ್ಷ್ಯ / ಲಗತ್ತುಗಳು" : "Evidence / Attachments"}
                </Text>
                <Text style={styles.historyModalSubtitle}>
                  {lang === "kn"
                    ? "ಅಧಿಕಾರಿ ಸೇರಿಸಿದ ಫೈಲ್‌ಗಳು — AI ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾದ ಸಾಕ್ಷ್ಯ ಎಂದು ಪರಿಗಣಿಸಬೇಡಿ."
                    : "Officer-supplied files — not automatically verified by AI."}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.historyCloseButton}
                onPress={() => {
                  resetEvidenceComposer();
                  setEvidenceVisible(false);
                }}
              >
                <Text style={styles.historyCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.evidenceModalScroll}
              contentContainerStyle={styles.evidenceModalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <View style={styles.evidenceComposer}>
                <Text style={styles.evidenceComposerTitle}>
                  {lang === "kn" ? "ಹೊಸ ಸಾಕ್ಷ್ಯ ಸೇರಿಸಿ" : "Add Evidence"}
                </Text>

                <TouchableOpacity
                  style={styles.evidencePickButton}
                  onPress={() => void handlePickEvidenceFile()}
                >
                  <Text style={styles.evidencePickButtonText}>
                    {selectedEvidenceFile
                      ? selectedEvidenceFile.name
                      : (lang === "kn" ? "ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ" : "Choose File")}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  value={evidenceTitle}
                  onChangeText={setEvidenceTitle}
                  placeholder={lang === "kn" ? "ಸಾಕ್ಷ್ಯದ ಶೀರ್ಷಿಕೆ" : "Evidence title"}
                  placeholderTextColor="#94A3B8"
                  style={styles.evidenceInput}
                />

                <TextInput
                  value={evidenceDescription}
                  onChangeText={setEvidenceDescription}
                  multiline
                  maxLength={700}
                  placeholder={
                    lang === "kn"
                      ? "ವಿವರಣೆ / ತನಿಖಾ ಸಂದರ್ಭ..."
                      : "Description / investigation context..."
                  }
                  placeholderTextColor="#94A3B8"
                  style={[styles.evidenceInput, styles.evidenceDescriptionInput]}
                />

                <Text style={styles.evidenceFieldLabel}>
                  {lang === "kn" ? "ಸಾಕ್ಷ್ಯದ ಪ್ರಕಾರ" : "Evidence Type"}
                </Text>

                <View style={styles.evidenceChoiceRow}>
                  {(["Photo", "Document", "CCTV", "Other"] as EvidenceType[]).map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.evidenceChoiceButton,
                          evidenceType === type && styles.evidenceChoiceButtonActive,
                        ]}
                        onPress={() => setEvidenceType(type)}
                      >
                        <Text
                          style={[
                            styles.evidenceChoiceText,
                            evidenceType === type && styles.evidenceChoiceTextActive,
                          ]}
                        >
                          {lang === "kn"
                            ? type === "Photo"
                              ? "ಫೋಟೋ"
                              : type === "Document"
                                ? "ದಾಖಲೆ"
                                : type === "CCTV"
                                  ? "CCTV"
                                  : "ಇತರೆ"
                            : type}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <Text style={styles.evidenceOfficerText}>
                  {lang === "kn" ? "ಸೇರಿಸುವ ಅಧಿಕಾರಿ" : "Adding Officer"}:{" "}
                  {mockData.officerName} • {mockData.officerBadge}
                </Text>

                <TouchableOpacity
                  style={styles.evidenceSaveButton}
                  onPress={() => void handleSaveEvidence()}
                >
                  <Text style={styles.evidenceSaveButtonText}>
                    {lang === "kn" ? "ಸಾಕ್ಷ್ಯವನ್ನು ಉಳಿಸಿ" : "Save Evidence"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={evidenceSearch}
                onChangeText={setEvidenceSearch}
                placeholder={
                  lang === "kn"
                    ? "ID, ಶೀರ್ಷಿಕೆ ಅಥವಾ ಫೈಲ್ ಮೂಲಕ ಹುಡುಕಿ..."
                    : "Search by ID, title or file..."
                }
                placeholderTextColor="#94A3B8"
                style={styles.historySearchInput}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.evidenceFilterScroll}
                contentContainerStyle={styles.evidenceChoiceRow}
              >
                {(["All", "Photo", "Document", "CCTV", "Other"] as const).map(
                  (filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.evidenceChoiceButton,
                        evidenceFilter === filter &&
                        styles.evidenceChoiceButtonActive,
                      ]}
                      onPress={() => setEvidenceFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.evidenceChoiceText,
                          evidenceFilter === filter &&
                          styles.evidenceChoiceTextActive,
                        ]}
                      >
                        {lang === "kn"
                          ? filter === "All"
                            ? "ಎಲ್ಲಾ"
                            : filter === "Photo"
                              ? "ಫೋಟೋ"
                              : filter === "Document"
                                ? "ದಾಖಲೆ"
                                : filter === "CCTV"
                                  ? "CCTV"
                                  : "ಇತರೆ"
                          : filter}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

              {filteredEvidence.length === 0 ? (
                <View style={styles.historyEmptyState}>
                  <Text style={styles.historyEmptyTitle}>
                    {lang === "kn" ? "ಯಾವುದೇ ಸಾಕ್ಷ್ಯ ಕಂಡುಬಂದಿಲ್ಲ" : "No evidence found"}
                  </Text>
                  <Text style={styles.historyEmptyText}>
                    {lang === "kn"
                      ? "ಈ ತನಿಖೆಗೆ ಮೊದಲ ಫೈಲ್ ಅನ್ನು ಸೇರಿಸಿ."
                      : "Attach the first file to this investigation."}
                  </Text>
                </View>
              ) : (
                filteredEvidence.map((item) => (
                  <View key={item.id} style={styles.evidenceCard}>
                    <View style={styles.evidenceCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.evidenceIdText}>{item.evidenceId}</Text>
                        <Text style={styles.evidenceTitleText}>{item.title}</Text>
                      </View>
                      <Text style={styles.evidenceTypeBadge}>
                        {lang === "kn"
                          ? item.type === "Photo"
                            ? "ಫೋಟೋ"
                            : item.type === "Document"
                              ? "ದಾಖಲೆ"
                              : item.type === "CCTV"
                                ? "CCTV"
                                : "ಇತರೆ"
                          : item.type}
                      </Text>
                    </View>

                    {item.description ? (
                      <Text style={styles.evidenceDescriptionText}>
                        {item.description}
                      </Text>
                    ) : null}

                    <Text style={styles.evidenceFileText}>{item.fileName}</Text>
                    <Text style={styles.evidenceMetaText}>
                      {item.officerName} • {item.officerBadge} •{" "}
                      {new Date(item.createdAt).toLocaleString(
                        lang === "kn" ? "kn-IN" : "en-IN"
                      )}
                    </Text>

                    <View style={styles.evidenceActions}>
                      <TouchableOpacity
                        style={styles.evidenceSmallButton}
                        onPress={() => void handleOpenEvidence(item)}
                      >
                        <Text style={styles.evidenceSmallButtonText}>
                          {lang === "kn" ? "ತೆರೆಯಿರಿ" : "Open"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.evidenceSmallButton,
                          styles.evidenceDeleteButton,
                        ]}
                        onPress={() => handleDeleteEvidence(item)}
                      >
                        <Text style={styles.evidenceDeleteText}>
                          {lang === "kn" ? "ಅಳಿಸಿ" : "Delete"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =================================================
          #25 — INVESTIGATION TASKS MODAL
          ================================================= */}

      <Modal
        visible={tasksVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          resetTaskEditor();
          setTasksVisible(false);
        }}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalCard}>
            <View style={styles.historyModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyModalTitle}>
                  {lang === "kn"
                    ? "ತನಿಖಾ ಕಾರ್ಯಗಳು"
                    : "Investigation Tasks"}
                </Text>

                <Text style={styles.historyModalSubtitle}>
                  {lang === "kn"
                    ? "ಅಧಿಕಾರಿಗಳು ನಿಗದಿಪಡಿಸಿದ ಕಾರ್ಯಗಳು — AI ಶಿಫಾರಸುಗಳಿಂದ ಪ್ರತ್ಯೇಕ."
                    : "Officer-assigned actions kept separate from AI recommendations."}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.historyCloseButton}
                onPress={() => {
                  resetTaskEditor();
                  setTasksVisible(false);
                }}
              >
                <Text style={styles.historyCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.taskModalScroll}
              contentContainerStyle={styles.taskModalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              <View style={styles.taskProgressCard}>
                <View style={styles.taskProgressHeader}>
                  <Text style={styles.taskProgressTitle}>
                    {lang === "kn" ? "ಪ್ರಕರಣದ ಪ್ರಗತಿ" : "Case Progress"}
                  </Text>
                  <Text style={styles.taskProgressValue}>
                    {completedTaskCount}/{currentTasks.length} • {taskProgressPercent}%
                  </Text>
                </View>

                <View style={styles.taskProgressTrack}>
                  <View
                    style={[
                      styles.taskProgressFill,
                      { width: `${taskProgressPercent}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.taskComposer}>
                <Text style={styles.taskComposerTitle}>
                  {editingTaskId
                    ? (lang === "kn" ? "ಕಾರ್ಯವನ್ನು ಸಂಪಾದಿಸಿ" : "Edit Task")
                    : (lang === "kn" ? "ಹೊಸ ತನಿಖಾ ಕಾರ್ಯ" : "New Investigation Task")}
                </Text>

                <TextInput
                  value={taskInput}
                  onChangeText={setTaskInput}
                  multiline
                  maxLength={600}
                  placeholder={
                    lang === "kn"
                      ? "ಉದಾ: ಡೊಮ್ಲೂರ್ CCTV ದೃಶ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
                      : "e.g. Verify CCTV footage from Domlur"
                  }
                  placeholderTextColor="#94A3B8"
                  style={styles.taskInput}
                />

                <Text style={styles.taskFieldLabel}>
                  {lang === "kn" ? "ಆದ್ಯತೆ" : "Priority"}
                </Text>

                <View style={styles.taskChoiceRow}>
                  {(["High", "Medium", "Low"] as InvestigationTaskPriority[]).map(
                    (priority) => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.taskChoiceButton,
                          taskPriority === priority &&
                          styles.taskChoiceButtonActive,
                        ]}
                        onPress={() => setTaskPriority(priority)}
                      >
                        <Text
                          style={[
                            styles.taskChoiceText,
                            taskPriority === priority &&
                            styles.taskChoiceTextActive,
                          ]}
                        >
                          {lang === "kn"
                            ? priority === "High"
                              ? "ಹೆಚ್ಚು"
                              : priority === "Medium"
                                ? "ಮಧ್ಯಮ"
                                : "ಕಡಿಮೆ"
                            : priority}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <Text style={styles.taskFieldLabel}>
                  {lang === "kn" ? "ಸ್ಥಿತಿ" : "Status"}
                </Text>

                <View style={styles.taskChoiceRow}>
                  {(["Pending", "In Progress", "Completed"] as InvestigationTaskStatus[]).map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.taskChoiceButton,
                          taskStatus === status &&
                          styles.taskChoiceButtonActive,
                        ]}
                        onPress={() => setTaskStatus(status)}
                      >
                        <Text
                          style={[
                            styles.taskChoiceText,
                            taskStatus === status &&
                            styles.taskChoiceTextActive,
                          ]}
                        >
                          {lang === "kn"
                            ? status === "Pending"
                              ? "ಬಾಕಿ"
                              : status === "In Progress"
                                ? "ಪ್ರಗತಿಯಲ್ಲಿ"
                                : "ಪೂರ್ಣಗೊಂಡಿದೆ"
                            : status}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <Text style={styles.taskFieldLabel}>
                  {lang === "kn"
                    ? "ಕೊನೆಯ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)"
                    : "Due Date (optional)"}
                </Text>

                <TextInput
                  value={taskDueDate}
                  onChangeText={setTaskDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  style={styles.taskDueDateInput}
                  autoCapitalize="none"
                />

                <Text style={styles.taskAssignmentText}>
                  {lang === "kn" ? "ನಿಯೋಜಿತ ಅಧಿಕಾರಿ" : "Assigned Officer"}:{" "}
                  {mockData.officerName} • {mockData.officerBadge}
                </Text>

                <View style={styles.taskComposerActions}>
                  {editingTaskId ? (
                    <TouchableOpacity
                      style={styles.taskCancelButton}
                      onPress={resetTaskEditor}
                    >
                      <Text style={styles.taskCancelText}>
                        {lang === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.taskSaveButton}
                    onPress={() => void handleSaveInvestigationTask()}
                  >
                    <Text style={styles.taskSaveText}>
                      {editingTaskId
                        ? (lang === "kn" ? "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ" : "Save Changes")
                        : (lang === "kn" ? "ಕಾರ್ಯವನ್ನು ಉಳಿಸಿ" : "Save Task")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                value={taskSearch}
                onChangeText={setTaskSearch}
                placeholder={
                  lang === "kn"
                    ? "ಕಾರ್ಯಗಳನ್ನು ಹುಡುಕಿ..."
                    : "Search tasks..."
                }
                placeholderTextColor="#94A3B8"
                style={styles.historySearchInput}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.taskFilterScroll}
                contentContainerStyle={styles.taskFilterRow}
              >
                {(["All", "Pending", "In Progress", "Completed"] as const).map(
                  (filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.taskFilterButton,
                        taskStatusFilter === filter &&
                        styles.taskFilterButtonActive,
                      ]}
                      onPress={() => setTaskStatusFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.taskFilterText,
                          taskStatusFilter === filter &&
                          styles.taskFilterTextActive,
                        ]}
                      >
                        {lang === "kn"
                          ? filter === "All"
                            ? "ಎಲ್ಲಾ"
                            : filter === "Pending"
                              ? "ಬಾಕಿ"
                              : filter === "In Progress"
                                ? "ಪ್ರಗತಿಯಲ್ಲಿ"
                                : "ಪೂರ್ಣಗೊಂಡಿದೆ"
                          : filter}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

              {filteredInvestigationTasks.length === 0 ? (
                <View style={styles.historyEmptyState}>
                  <Text style={styles.historyEmptyTitle}>
                    {lang === "kn"
                      ? "ಯಾವುದೇ ಕಾರ್ಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
                      : "No investigation tasks found"}
                  </Text>
                  <Text style={styles.historyEmptyText}>
                    {lang === "kn"
                      ? "ಈ ಪ್ರಕರಣಕ್ಕೆ ಮೊದಲ ತನಿಖಾ ಕಾರ್ಯವನ್ನು ಸೇರಿಸಿ."
                      : "Add the first officer-assigned task for this case."}
                  </Text>
                </View>
              ) : (
                filteredInvestigationTasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskCardText}>{task.text}</Text>
                        <Text style={styles.taskCardMeta}>
                          {task.assignedOfficerName} • {task.assignedOfficerBadge}
                        </Text>
                      </View>

                      <Text style={styles.taskPriorityBadge}>
                        {lang === "kn"
                          ? task.priority === "High"
                            ? "ಹೆಚ್ಚು"
                            : task.priority === "Medium"
                              ? "ಮಧ್ಯಮ"
                              : "ಕಡಿಮೆ"
                          : task.priority}
                      </Text>
                    </View>

                    <Text style={styles.taskStatusText}>
                      {lang === "kn" ? "ಸ್ಥಿತಿ" : "Status"}:{" "}
                      {lang === "kn"
                        ? task.status === "Pending"
                          ? "ಬಾಕಿ"
                          : task.status === "In Progress"
                            ? "ಪ್ರಗತಿಯಲ್ಲಿ"
                            : "ಪೂರ್ಣಗೊಂಡಿದೆ"
                        : task.status}
                    </Text>

                    {task.dueDate ? (
                      <Text style={styles.taskDueText}>
                        {lang === "kn" ? "ಕೊನೆಯ ದಿನಾಂಕ" : "Due"}: {task.dueDate}
                      </Text>
                    ) : null}

                    <Text style={styles.taskTimestamp}>
                      {new Date(task.updatedAt ?? task.createdAt).toLocaleString(
                        lang === "kn" ? "kn-IN" : "en-IN"
                      )}
                      {task.updatedAt
                        ? (lang === "kn" ? " • ನವೀಕರಿಸಲಾಗಿದೆ" : " • updated")
                        : ""}
                    </Text>

                    <View style={styles.taskCardActions}>
                      <TouchableOpacity
                        style={styles.taskSmallButton}
                        onPress={() => void handleCycleTaskStatus(task)}
                      >
                        <Text style={styles.taskSmallButtonText}>
                          {lang === "kn" ? "ಮುಂದಿನ ಸ್ಥಿತಿ" : "Next Status"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.taskSmallButton}
                        onPress={() => handleEditInvestigationTask(task)}
                      >
                        <Text style={styles.taskSmallButtonText}>
                          {lang === "kn" ? "ಸಂಪಾದಿಸಿ" : "Edit"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.taskSmallButton, styles.taskDeleteButton]}
                        onPress={() => handleDeleteInvestigationTask(task)}
                      >
                        <Text style={styles.taskDeleteText}>
                          {lang === "kn" ? "ಅಳಿಸಿ" : "Delete"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* #24 — OFFICER NOTES MODAL */}
      <Modal
        visible={notesVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          resetNoteEditor();
          setNotesVisible(false);
        }}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalCard}>
            <View style={styles.historyModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyModalTitle}>
                  {lang === "kn" ? "ಅಧಿಕಾರಿ ಟಿಪ್ಪಣಿಗಳು" : "Officer Notes"}
                </Text>
                <Text style={styles.historyModalSubtitle}>
                  {lang === "kn"
                    ? "AI ಫಲಿತಾಂಶಗಳಿಂದ ಪ್ರತ್ಯೇಕವಾದ ಅಧಿಕಾರಿಯ ತನಿಖಾ ಟಿಪ್ಪಣಿಗಳು."
                    : "Investigator-authored notes kept separate from AI findings."}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.historyCloseButton}
                onPress={() => {
                  resetNoteEditor();
                  setNotesVisible(false);
                }}
              >
                <Text style={styles.historyCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.officerNoteComposer}>
              <Text style={styles.officerNoteLabel}>
                {editingNoteId
                  ? (lang === "kn" ? "ಟಿಪ್ಪಣಿಯನ್ನು ಸಂಪಾದಿಸಿ" : "Edit officer note")
                  : (lang === "kn" ? "ಹೊಸ ಅಧಿಕಾರಿಯ ಟಿಪ್ಪಣಿ" : "New officer note")}
              </Text>

              <TextInput
                value={noteInput}
                onChangeText={setNoteInput}
                multiline
                maxLength={1200}
                placeholder={lang === "kn" ? "ತನಿಖೆಯ ಟಿಪ್ಪಣಿಯನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ..." : "Add an investigation note..."}
                placeholderTextColor="#94A3B8"
                style={styles.officerNoteInput}
              />

              <View style={styles.officerNoteComposerActions}>
                {editingNoteId ? (
                  <TouchableOpacity style={styles.officerNoteCancelButton} onPress={resetNoteEditor}>
                    <Text style={styles.officerNoteCancelText}>{lang === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel"}</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.officerNoteSaveButton}
                  onPress={() => void handleSaveOfficerNote()}
                >
                  <Text style={styles.officerNoteSaveText}>
                    {editingNoteId
                      ? (lang === "kn" ? "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ" : "Save Changes")
                      : (lang === "kn" ? "ಟಿಪ್ಪಣಿಯನ್ನು ಉಳಿಸಿ" : "Save Note")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              value={noteSearch}
              onChangeText={setNoteSearch}
              placeholder={lang === "kn" ? "ಟಿಪ್ಪಣಿಗಳಲ್ಲಿ ಹುಡುಕಿ..." : "Search officer notes..."}
              placeholderTextColor="#94A3B8"
              style={styles.historySearchInput}
            />

            <ScrollView style={styles.historyList} keyboardShouldPersistTaps="handled">
              {filteredOfficerNotes.length === 0 ? (
                <View style={styles.historyEmptyState}>
                  <Text style={styles.historyEmptyTitle}>
                    {lang === "kn" ? "ಯಾವುದೇ ಟಿಪ್ಪಣಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : "No officer notes found"}
                  </Text>
                  <Text style={styles.historyEmptyText}>
                    {lang === "kn" ? "ಈ ತನಿಖೆಗೆ ಮೊದಲ ಅಧಿಕಾರಿಯ ಟಿಪ್ಪಣಿಯನ್ನು ಸೇರಿಸಿ." : "Add the first investigator-authored note for this investigation."}
                  </Text>
                </View>
              ) : (
                filteredOfficerNotes.map((note) => (
                  <View
                    key={note.id}
                    style={[styles.officerNoteCard, note.pinned && styles.officerNoteCardPinned]}
                  >
                    <View style={styles.officerNoteCardHeader}>
                      <Text style={styles.officerNoteMeta}>{note.officerName} • {note.officerBadge}</Text>
                      {note.pinned ? (
                        <Text style={styles.officerNotePinnedLabel}>{lang === "kn" ? "ಪ್ರಮುಖ" : "PINNED"}</Text>
                      ) : null}
                    </View>

                    <Text style={styles.officerNoteText}>{note.text}</Text>

                    <Text style={styles.officerNoteTimestamp}>
                      {new Date(note.updatedAt ?? note.createdAt).toLocaleString(lang === "kn" ? "kn-IN" : "en-IN")}
                      {note.updatedAt ? (lang === "kn" ? " • ಸಂಪಾದಿಸಲಾಗಿದೆ" : " • edited") : ""}
                    </Text>

                    <View style={styles.officerNoteActions}>
                      <TouchableOpacity style={styles.officerNoteSmallButton} onPress={() => void handleTogglePinnedNote(note)}>
                        <Text style={styles.officerNoteSmallButtonText}>
                          {note.pinned ? (lang === "kn" ? "ಅನ್‌ಪಿನ್" : "Unpin") : (lang === "kn" ? "ಪಿನ್ ಮಾಡಿ" : "Pin")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.officerNoteSmallButton} onPress={() => handleEditOfficerNote(note)}>
                        <Text style={styles.officerNoteSmallButtonText}>{lang === "kn" ? "ಸಂಪಾದಿಸಿ" : "Edit"}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.officerNoteSmallButton, styles.officerNoteDeleteButton]}
                        onPress={() => handleDeleteOfficerNote(note)}
                      >
                        <Text style={styles.officerNoteDeleteText}>{lang === "kn" ? "ಅಳಿಸಿ" : "Delete"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={
          historyVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          () =>
            setHistoryVisible(
              false
            )
        }
      >

        <View
          style={
            styles.historyModalOverlay
          }
        >

          <View
            style={
              styles.historyModalCard
            }
          >

            <View
              style={
                styles.historyModalHeader
              }
            >

              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={
                    styles.historyModalTitle
                  }
                >
                  {lang === "kn"
                    ? "ಉಳಿಸಿದ ತನಿಖೆಗಳು"
                    : "Saved Investigations"}
                </Text>

                <Text
                  style={
                    styles.historyModalSubtitle
                  }
                >
                  {lang === "kn"
                    ? "ಹಿಂದಿನ ಪ್ರಕರಣವನ್ನು ಹುಡುಕಿ ಮತ್ತು ಮತ್ತೆ ತೆರೆಯಿರಿ."
                    : "Search and reopen a previous investigation."}
                </Text>

              </View>

              <TouchableOpacity
                style={
                  styles.historyCloseButton
                }
                onPress={
                  () =>
                    setHistoryVisible(
                      false
                    )
                }
                accessibilityRole="button"
                accessibilityLabel="Close investigation history"
              >
                <Text
                  style={
                    styles.historyCloseButtonText
                  }
                >
                  ×
                </Text>
              </TouchableOpacity>

            </View>

            <TextInput
              value={
                historySearch
              }
              onChangeText={
                setHistorySearch
              }
              placeholder={
                lang === "kn"
                  ? "ಹೆಸರು, ACC ID, FIR, ಸ್ಥಳ ಹುಡುಕಿ..."
                  : "Search name, ACC ID, FIR, location..."
              }
              placeholderTextColor="#94A3B8"
              style={
                styles.historySearchInput
              }
              autoCapitalize="none"
              autoCorrect={
                false
              }
            />

            <ScrollView
              style={
                styles.historyList
              }
              contentContainerStyle={
                styles.historyListContent
              }
              showsVerticalScrollIndicator={
                true
              }
            >

              {!savedCasesLoaded ? (

                <View
                  style={
                    styles.historyEmptyState
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#0F4C81"
                  />
                </View>

              ) : filteredSavedInvestigations.length ===
                0 ? (

                <View
                  style={
                    styles.historyEmptyState
                  }
                >

                  <Text
                    style={
                      styles.historyEmptyTitle
                    }
                  >
                    {historySearch.trim()
                      ? (
                        lang === "kn"
                          ? "ಹೊಂದುವ ತನಿಖೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
                          : "No matching investigations"
                      )
                      : (
                        lang === "kn"
                          ? "ಇನ್ನೂ ಉಳಿಸಿದ ತನಿಖೆಗಳಿಲ್ಲ"
                          : "No saved investigations yet"
                      )}
                  </Text>

                  <Text
                    style={
                      styles.historyEmptyText
                    }
                  >
                    {lang === "kn"
                      ? "ಪ್ರಸ್ತುತ ಫಲಿತಾಂಶವನ್ನು ಉಳಿಸಲು “ತನಿಖೆ ಉಳಿಸಿ” ಬಳಸಿ."
                      : "Use “Save Investigation” to store the current result."}
                  </Text>

                </View>

              ) : (

                filteredSavedInvestigations.map(
                  (saved) => {

                    const savedResponse =
                      [...saved.messages]
                        .reverse()
                        .find(
                          (message) =>
                            message.type ===
                            "response" &&
                            Boolean(
                              message.data
                            )
                        );

                    const priority =
                      savedResponse
                        ?.data
                        ?.summary
                        ?.priority;

                    const confidence =
                      savedResponse
                        ?.data
                        ?.confidenceScore;

                    return (

                      <View
                        key={
                          saved.id
                        }
                        style={
                          styles.historyCaseCard
                        }
                      >

                        <TouchableOpacity
                          style={{
                            flex: 1,
                          }}
                          onPress={
                            () =>
                              handleOpenSavedInvestigation(
                                saved
                              )
                          }
                          accessibilityRole="button"
                        >

                          <Text
                            style={
                              styles.historyCaseTitle
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {saved.title}
                          </Text>

                          <Text
                            style={
                              styles.historyCaseQuery
                            }
                            numberOfLines={
                              2
                            }
                          >
                            {saved.query}
                          </Text>

                          <Text
                            style={
                              styles.historyCaseMeta
                            }
                          >
                            {new Date(
                              saved.createdAt
                            ).toLocaleString(
                              lang === "kn"
                                ? "kn-IN"
                                : "en-IN"
                            )}
                          </Text>

                          <Text
                            style={
                              styles.historyCaseMeta
                            }
                          >
                            {saved.officerName} • {saved.officerBadge}
                          </Text>

                          {(priority ||
                            confidence !==
                            undefined) && (

                              <Text
                                style={
                                  styles.historyCaseStats
                                }
                              >
                                {priority
                                  ? `${lang === "kn"
                                    ? "ಆದ್ಯತೆ"
                                    : "Priority"
                                  }: ${priority}`
                                  : ""}
                                {priority &&
                                  confidence !==
                                  undefined
                                  ? "  •  "
                                  : ""}
                                {confidence !==
                                  undefined
                                  ? `${lang === "kn"
                                    ? "ವಿಶ್ವಾಸಾರ್ಹತೆ"
                                    : "Confidence"
                                  }: ${confidence}%`
                                  : ""}
                              </Text>

                            )}

                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.historyDeleteButton
                          }
                          onPress={
                            () =>
                              handleDeleteSavedInvestigation(
                                saved
                              )
                          }
                          accessibilityRole="button"
                          accessibilityLabel={
                            lang === "kn"
                              ? "ಉಳಿಸಿದ ತನಿಖೆಯನ್ನು ಅಳಿಸಿ"
                              : "Delete saved investigation"
                          }
                        >
                          <Text
                            style={
                              styles.historyDeleteButtonText
                            }
                          >
                            {lang === "kn"
                              ? "ಅಳಿಸಿ"
                              : "Delete"}
                          </Text>
                        </TouchableOpacity>

                      </View>
                    );
                  }
                )
              )}

            </ScrollView>

          </View>

        </View>

      </Modal>

      {/* ===============================================
          REPORT SUCCESS MODAL
      ================================================ */}

      <Modal

        visible={
          reportVisible
        }

        transparent

        animationType="fade"

        onRequestClose={
          () =>
            setReportVisible(
              false
            )
        }

      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalCard
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >

              {t.reportGenerated}

            </Text>

            {/* DOWNLOAD PDF */}

            <TouchableOpacity

              style={
                styles.modalButtonPrimary
              }

              onPress={
                async () => {

                  setReportVisible(
                    false
                  );

                  await handleExportPDF();

                }
              }

              accessibilityRole="button"

              accessibilityLabel="Download PDF"

            >

              <Text
                style={
                  styles.modalButtonPrimaryText
                }
              >

                {lang === "kn"
                  ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
                  : "Download PDF"}

              </Text>

            </TouchableOpacity>

            {/* SHARE REPORT */}

            <TouchableOpacity

              style={
                styles.modalButtonPrimary
              }

              onPress={
                async () => {

                  setReportVisible(
                    false
                  );

                  await handleShareInvestigation();

                }
              }

              accessibilityRole="button"

              accessibilityLabel="Share Report"

            >

              <Text
                style={
                  styles.modalButtonPrimaryText
                }
              >

                {lang === "kn"
                  ? "ವರದಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ"
                  : "Share Report"}

              </Text>

            </TouchableOpacity>

            {/* CLOSE */}

            <TouchableOpacity

              style={
                styles.modalButtonSecondary
              }

              onPress={
                () =>
                  setReportVisible(
                    false
                  )
              }

              accessibilityRole="button"

              accessibilityLabel="Close"

            >

              <Text
                style={
                  styles.modalButtonSecondaryText
                }
              >

                {t.close}

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>
      {/* ===============================================
    FULL NETWORK ANALYSIS MODAL
=============================================== */}

      <Modal

        visible={
          fullNetworkVisible
        }

        transparent

        animationType="fade"

        onRequestClose={
          () =>
            setFullNetworkVisible(
              false
            )
        }

      >

        <View
          style={
            styles.fullNetworkModalOverlay
          }
        >

          <View
            style={
              styles.fullNetworkModalCard
            }
          >

            {/* TITLE */}

            <Text
              style={
                styles.fullNetworkModalTitle
              }
            >

              Full Criminal Network Analysis

            </Text>

            {/* NETWORK SUMMARY */}

            {selectedNetwork && (

              <Text
                style={
                  styles.fullNetworkModalSubtitle
                }
              >

                {selectedNetwork.nodes.length} {lang === "kn" ? "ಆರೋಪಿಗಳು" : "accused"} •{" "}
                {selectedNetwork.edges.length} {lang === "kn" ? "ಸಂಪರ್ಕ(ಗಳು)" : "connection(s)"}

              </Text>

            )}

            {/* SCROLLABLE CONTENT */}

            <ScrollView

              style={
                styles.fullNetworkModalScroll
              }

              contentContainerStyle={
                styles.fullNetworkModalScrollContent
              }

              showsVerticalScrollIndicator={
                true
              }

            >

              {/* ===========================================
            NETWORK NODES
        ============================================ */}

              {selectedNetwork &&
                selectedNetwork.nodes.length >
                0 && (

                  <View
                    style={
                      styles.fullNetworkSection
                    }
                  >

                    <Text
                      style={
                        styles.fullNetworkSectionTitle
                      }
                    >

                      Accused in Network

                    </Text>

                    {selectedNetwork.nodes.map(
                      (
                        node,
                        index
                      ) => (

                        <View

                          key={
                            `${node.id}-${index}`
                          }

                          style={
                            styles.fullNetworkNodeCard
                          }

                        >

                          <Text
                            style={
                              styles.fullNetworkNodeName
                            }
                          >

                            {node.label}

                          </Text>

                          <Text
                            style={
                              styles.fullNetworkNodeInfo
                            }
                          >

                            {lang === "kn" ? "ಆರೋಪಿ ID" : "Accused ID"}: {node.id}

                          </Text>

                          <Text
                            style={
                              styles.fullNetworkNodeInfo
                            }
                          >

                            {lang === "kn" ? "ಪ್ರಕಾರ" : "Type"}: {node.type || (lang === "kn" ? "ಆರೋಪಿ" : "accused")}

                          </Text>

                        </View>

                      )
                    )}

                  </View>

                )}

              {/* ===========================================
            RELATIONSHIPS
        ============================================ */}

              {selectedNetwork &&
                selectedNetwork.edges.length >
                0 && (

                  <View
                    style={
                      styles.fullNetworkSection
                    }
                  >

                    <Text
                      style={
                        styles.fullNetworkSectionTitle
                      }
                    >

                      Relationship Details

                    </Text>

                    {selectedNetwork.edges.map(
                      (
                        edge: any,
                        index
                      ) => {

                        const fromNode =
                          selectedNetwork.nodes.find(
                            (node) =>
                              node.id ===
                              edge.from
                          );

                        const toNode =
                          selectedNetwork.nodes.find(
                            (node) =>
                              node.id ===
                              edge.to
                          );

                        return (

                          <View

                            key={
                              `${edge.from}-${edge.to}-${index}`
                            }

                            style={
                              styles.fullNetworkRelationshipCard
                            }

                          >

                            <Text
                              style={
                                styles.fullNetworkRelationshipTitle
                              }
                            >

                              {fromNode?.label ||
                                edge.from}

                              {" → "}

                              {toNode?.label ||
                                edge.to}

                            </Text>

                            <View
                              style={
                                styles.fullNetworkDetailRow
                              }
                            >

                              <Text
                                style={
                                  styles.fullNetworkDetailLabel
                                }
                              >

                                Relationship

                              </Text>

                              <Text
                                style={
                                  styles.fullNetworkDetailValue
                                }
                              >

                                {edge.type ||
                                  edge.label ||
                                  "Connected"}

                              </Text>

                            </View>

                            <View
                              style={
                                styles.fullNetworkDetailRow
                              }
                            >

                              <Text
                                style={
                                  styles.fullNetworkDetailLabel
                                }
                              >

                                Strength

                              </Text>

                              <Text
                                style={
                                  styles.fullNetworkDetailValue
                                }
                              >

                                {edge.strength
                                  ? `${edge.strength}%`
                                  : (lang === "kn" ? "ಲಭ್ಯವಿಲ್ಲ" : "Not available")}

                              </Text>

                            </View>

                            <View
                              style={
                                styles.fullNetworkDetailRow
                              }
                            >

                              <Text
                                style={
                                  styles.fullNetworkDetailLabel
                                }
                              >

                                Status

                              </Text>

                              <Text
                                style={
                                  styles.fullNetworkDetailValue
                                }
                              >

                                {edge.status ||
                                  (lang === "kn" ? "ಲಭ್ಯವಿಲ್ಲ" : "Not available")}

                              </Text>

                            </View>

                            <View
                              style={
                                styles.fullNetworkDetailRow
                              }
                            >

                              <Text
                                style={
                                  styles.fullNetworkDetailLabel
                                }
                              >

                                Related FIR

                              </Text>

                              <Text
                                style={
                                  styles.fullNetworkDetailValue
                                }
                              >

                                {edge.relatedFir ||
                                  (lang === "kn" ? "ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ" : "Not linked")}

                              </Text>

                            </View>

                            {edge.notes ? (

                              <View
                                style={
                                  styles.fullNetworkNotesContainer
                                }
                              >

                                <Text
                                  style={
                                    styles.fullNetworkDetailLabel
                                  }
                                >

                                  Investigation Notes

                                </Text>

                                <Text
                                  style={
                                    styles.fullNetworkNotesText
                                  }
                                >

                                  {edge.notes}

                                </Text>

                              </View>

                            ) : null}

                          </View>

                        );

                      }
                    )}

                  </View>

                )}

              {/* NO RELATIONSHIPS */}

              {selectedNetwork &&
                selectedNetwork.edges.length ===
                0 && (

                  <Text
                    style={
                      styles.fullNetworkEmptyText
                    }
                  >

                    No relationship records are available for this network.

                  </Text>

                )}

            </ScrollView>

            {/* CLOSE */}

            <TouchableOpacity

              style={
                styles.fullNetworkCloseButton
              }

              onPress={
                () =>
                  setFullNetworkVisible(
                    false
                  )
              }

              accessibilityRole="button"

              accessibilityLabel="Close full network analysis"

            >

              <Text
                style={
                  styles.fullNetworkCloseButtonText
                }
              >

                {lang === "kn" ? "ಮುಚ್ಚಿ" : "Close"}

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>
      {/* ===============================================
          RECOMMENDATION DETAILS MODAL
      ================================================ */}

      <Modal

        visible={
          recommendationModalVisible
        }

        transparent

        animationType="fade"

        onRequestClose={
          () =>
            setRecommendationModalVisible(
              false
            )
        }

      >

        <View
          style={
            styles.recommendationModalOverlay
          }
        >

          <View
            style={
              styles.recommendationModalCard
            }
          >

            <Text
              style={
                styles.recommendationModalTitle
              }
            >

              {recommendationModalTitle}

            </Text>

            <ScrollView

              style={
                styles.recommendationModalScroll
              }

              contentContainerStyle={
                styles.recommendationModalScrollContent
              }

              showsVerticalScrollIndicator={
                true
              }

            >

              <Text
                style={
                  styles.recommendationModalContent
                }
              >

                {recommendationModalContent}

              </Text>

            </ScrollView>

            <TouchableOpacity

              style={
                styles.recommendationModalCloseButton
              }

              onPress={
                () =>
                  setRecommendationModalVisible(
                    false
                  )
              }

              accessibilityRole="button"

              accessibilityLabel="Close recommendation details"

            >

              <Text
                style={
                  styles.recommendationModalCloseButtonText
                }
              >

                {lang === "kn" ? "ಮುಚ್ಚಿ" : "Close"}

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    // #28 — RBAC
    rbacPanel: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: "#F8FAFC",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    rbacLabel: {
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
      color: "#334155",
    },
    rbacRoleButton: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginRight: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      backgroundColor: "#FFFFFF",
    },
    rbacRoleButtonActive: {
      backgroundColor: "#0B5A91",
      borderColor: "#0B5A91",
    },
    rbacRoleButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#334155",
    },
    rbacRoleButtonTextActive: {
      color: "#FFFFFF",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingTop: 8,
      paddingHorizontal: 0,
      paddingBottom: 8,
    },

    // ==================================================
    // #23 — SAVE / INVESTIGATION HISTORY
    // ==================================================

    historyActionBar: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        10,
      paddingHorizontal:
        16,
      paddingVertical:
        9,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth:
        1,
      borderBottomColor:
        "#E2E8F0",
    },

    historyActionButton: {
      flex:
        1,
      backgroundColor:
        "#0F4C81",
      borderRadius:
        9,
      paddingVertical:
        10,
      paddingHorizontal:
        12,
      alignItems:
        "center",
    },

    historyActionButtonText: {
      fontFamily:
        "Inter-SemiBold",
      fontSize:
        12,
      color:
        "#FFFFFF",
    },

    historyActionButtonSecondary: {
      flex:
        1,
      backgroundColor:
        "#F8FAFC",
      borderWidth:
        1,
      borderColor:
        "#CBD5E1",
      borderRadius:
        9,
      paddingVertical:
        9,
      paddingHorizontal:
        12,
      alignItems:
        "center",
    },

    historyActionButtonSecondaryText: {
      fontFamily:
        "Inter-SemiBold",
      fontSize:
        12,
      color:
        "#0F4C81",
    },

    historyModalOverlay: {
      flex:
        1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal:
        18,
      paddingVertical:
        24,
    },

    historyModalCard: {
      width:
        "100%",
      maxWidth:
        680,
      maxHeight:
        "88%",
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        14,
      padding:
        18,
      shadowColor:
        "#000",
      shadowOffset: {
        width:
          0,
        height:
          4,
      },
      shadowOpacity:
        0.15,
      shadowRadius:
        10,
      elevation:
        8,
    },

    historyModalHeader: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        12,
      marginBottom:
        14,
    },

    historyModalTitle: {
      fontFamily:
        "Rajdhani-Bold",
      fontSize:
        21,
      color:
        "#0F4C81",
    },

    historyModalSubtitle: {
      fontFamily:
        "Inter-Regular",
      fontSize:
        12,
      lineHeight:
        17,
      color:
        "#64748B",
      marginTop:
        2,
    },

    historyCloseButton: {
      width:
        34,
      height:
        34,
      borderRadius:
        17,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    historyCloseButtonText: {
      fontFamily:
        "Inter-SemiBold",
      fontSize:
        22,
      lineHeight:
        24,
      color:
        "#475569",
    },

    historySearchInput: {
      borderWidth:
        1,
      borderColor:
        "#CBD5E1",
      borderRadius:
        10,
      paddingHorizontal:
        13,
      paddingVertical:
        10,
      fontFamily:
        "Inter-Regular",
      fontSize:
        13,
      color:
        "#1E293B",
      backgroundColor:
        "#F8FAFC",
      marginBottom:
        12,
    },

    historyList: {
      flexGrow:
        0,
    },

    historyListContent: {
      paddingBottom:
        4,
    },

    historyEmptyState: {
      minHeight:
        150,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        24,
    },

    historyEmptyTitle: {
      fontFamily:
        "Inter-SemiBold",
      fontSize:
        14,
      color:
        "#334155",
      textAlign:
        "center",
    },

    historyEmptyText: {
      fontFamily:
        "Inter-Regular",
      fontSize:
        12,
      lineHeight:
        18,
      color:
        "#64748B",
      textAlign:
        "center",
      marginTop:
        6,
    },

    historyCaseCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        12,
      borderWidth:
        1,
      borderColor:
        "#E2E8F0",
      borderRadius:
        11,
      padding:
        13,
      marginBottom:
        10,
      backgroundColor:
        "#FFFFFF",
    },

    historyCaseTitle: {
      fontFamily:
        "Inter-SemiBold",
      fontSize:
        14,
      color:
        "#1E3A5F",
    },

    historyCaseQuery: {
      fontFamily:
        "Inter-Regular",
      fontSize:
        12,
      lineHeight:
        17,
      color:
        "#475569",
      marginTop:
        3,
    },

    historyCaseMeta: {
      fontFamily:
        "Inter-Regular",
      fontSize:
        10,
      color:
        "#94A3B8",
      marginTop:
        4,
    },

    historyCaseStats: {
      fontFamily:
        "Inter-Medium",
      fontSize:
        11,
      color:
        "#0F4C81",
      marginTop:
        5,
    },

    historyDeleteButton: {
      borderWidth:
        1,
      borderColor:
        "#FCA5A5",
      backgroundColor:
        "#FEF2F2",
      borderRadius:
        8,
      paddingHorizontal:
        10,
      paddingVertical:
        8,
    },

    historyDeleteButtonText: {
      fontFamily:
        "Inter-SemiBold",
      fontSize:
        11,
      color:
        "#B91C1C",
    },

    // ==================================================
    // PROCESSING
    // ==================================================

    processingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      paddingHorizontal:
        20,

      paddingVertical:
        12,
    },

    processingText: {
      fontFamily:
        "Inter-Regular",

      fontSize:
        13,

      color:
        "#64748B",

      lineHeight:
        18,

      fontStyle:
        "italic",
    },

    bottomPadding: {
      height:
        16,
    },

    // ==================================================
    // REPORT BANNER
    // ==================================================

    reportBanner: {
      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#0F4C81",

      paddingVertical:
        10,

      paddingHorizontal:
        16,

      gap:
        8,
    },

    reportBannerText: {
      fontFamily:
        "Inter-Medium",

      fontSize:
        13,

      color:
        "#FFFFFF",

      flex:
        1,
    },

    // ==================================================
    // MODAL
    // ==================================================

    modalOverlay: {
      flex:
        1,

      backgroundColor:
        "rgba(0,0,0,0.45)",

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal:
        24,
    },

    modalCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius:
        12,

      padding:
        24,

      width:
        "100%",

      shadowColor:
        "#000",

      shadowOffset: {
        width:
          0,

        height:
          4,
      },

      shadowOpacity:
        0.15,

      shadowRadius:
        10,

      elevation:
        8,
    },

    modalTitle: {
      fontFamily:
        "Inter-SemiBold",

      fontSize:
        16,

      color:
        "#1E3A5F",

      marginBottom:
        20,

      textAlign:
        "center",
    },

    modalButtonPrimary: {
      backgroundColor:
        "#0F4C81",

      borderRadius:
        10,

      paddingVertical:
        13,

      alignItems:
        "center",

      marginBottom:
        10,
    },

    modalButtonPrimaryText: {
      fontFamily:
        "Inter-SemiBold",

      fontSize:
        14,

      color:
        "#FFFFFF",
    },

    modalButtonSecondary: {
      borderWidth:
        1,

      borderColor:
        "#CBD5E1",

      borderRadius:
        10,

      paddingVertical:
        12,

      alignItems:
        "center",

      marginTop:
        2,
    },

    modalButtonSecondaryText: {
      fontFamily:
        "Inter-Medium",

      fontSize:
        14,

      color:
        "#64748B",
    },


    // ==================================================
    // FULL NETWORK ANALYSIS MODAL
    // ==================================================

    fullNetworkModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 24,
    },

    fullNetworkModalCard: {
      width: "100%",
      maxWidth: 650,
      maxHeight: "88%",
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      padding: 20,

      shadowColor: "#000",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },

    fullNetworkModalTitle: {
      fontFamily: "Rajdhani-Bold",
      fontSize: 20,
      color: "#0F4C81",
      textAlign: "center",
    },

    fullNetworkModalSubtitle: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      color: "#64748B",
      textAlign: "center",
      marginTop: 5,
      marginBottom: 16,
    },

    fullNetworkModalScroll: {
      flexGrow: 0,
    },

    fullNetworkModalScrollContent: {
      paddingBottom: 8,
    },

    fullNetworkSection: {
      marginBottom: 18,
    },

    fullNetworkSectionTitle: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
      color: "#1E3A5F",
      marginBottom: 10,
    },

    fullNetworkNodeCard: {
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
    },

    fullNetworkNodeName: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
      color: "#0F4C81",
      marginBottom: 4,
    },

    fullNetworkNodeInfo: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    fullNetworkRelationshipCard: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    },

    fullNetworkRelationshipTitle: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
      lineHeight: 20,
      color: "#1E293B",
      marginBottom: 10,
    },

    fullNetworkDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 4,
    },

    fullNetworkDetailLabel: {
      fontFamily: "Inter-Medium",
      fontSize: 12,
      color: "#64748B",
      marginRight: 12,
    },

    fullNetworkDetailValue: {
      flex: 1,
      fontFamily: "Inter-Regular",
      fontSize: 12,
      lineHeight: 18,
      color: "#334155",
      textAlign: "right",
    },

    fullNetworkNotesContainer: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#E2E8F0",
    },

    fullNetworkNotesText: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      lineHeight: 18,
      color: "#334155",
      marginTop: 5,
    },

    fullNetworkEmptyText: {
      fontFamily: "Inter-Regular",
      fontSize: 13,
      lineHeight: 20,
      color: "#64748B",
      textAlign: "center",
      paddingVertical: 20,
    },

    fullNetworkCloseButton: {
      backgroundColor: "#0F4C81",
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },

    fullNetworkCloseButtonText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
      color: "#FFFFFF",
    },
    // ==================================================
    // RECOMMENDATION DETAILS MODAL
    // ==================================================

    recommendationModalOverlay: {
      flex:
        1,

      backgroundColor:
        "rgba(0,0,0,0.45)",

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal:
        24,
    },

    recommendationModalCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius:
        12,

      padding:
        24,

      width:
        "100%",

      maxWidth:
        560,

      maxHeight:
        "78%",

      shadowColor:
        "#000",

      shadowOffset: {
        width:
          0,

        height:
          4,
      },

      shadowOpacity:
        0.15,

      shadowRadius:
        10,

      elevation:
        8,
    },

    recommendationModalTitle: {
      fontFamily:
        "Inter-SemiBold",

      fontSize:
        16,

      color:
        "#1E3A5F",

      marginBottom:
        16,

      textAlign:
        "center",
    },

    recommendationModalScroll: {
      maxHeight:
        380,
    },

    recommendationModalScrollContent: {
      paddingBottom:
        8,
    },

    recommendationModalContent: {
      fontFamily:
        "Inter-Regular",

      fontSize:
        14,

      lineHeight:
        22,

      color:
        "#334155",
    },

    recommendationModalCloseButton: {
      backgroundColor:
        "#0F4C81",

      borderRadius:
        10,

      paddingVertical:
        13,

      alignItems:
        "center",

      marginTop:
        18,
    },

    recommendationModalCloseButtonText: {
      fontFamily:
        "Inter-SemiBold",

      fontSize:
        14,

      color:
        "#f9f9f9f1",
    },

    officerNotesButton: {
      marginTop: 10,
    },

    officerNotesButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    officerNoteComposer: {
      marginTop: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
    },

    officerNoteLabel: {
      color: "#0F4C81",
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
    },

    officerNoteInput: {
      minHeight: 92,
      maxHeight: 160,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      color: "#172033",
      paddingHorizontal: 12,
      paddingVertical: 10,
      textAlignVertical: "top",
    },

    officerNoteComposerActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 10,
    },

    officerNoteSaveButton: {
      backgroundColor: "#0F4C81",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    officerNoteSaveText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    officerNoteCancelButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: "#FFFFFF",
    },

    officerNoteCancelText: {
      color: "#475569",
      fontWeight: "700",
    },

    officerNoteCard: {
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      backgroundColor: "#FFFFFF",
    },

    officerNoteCardPinned: {
      borderWidth: 2,
      borderColor: "#0F4C81",
    },

    officerNoteCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },

    officerNoteMeta: {
      flex: 1,
      color: "#64748B",
      fontSize: 12,
    },

    officerNotePinnedLabel: {
      color: "#0F4C81",
      fontSize: 11,
      fontWeight: "800",
    },

    officerNoteText: {
      color: "#172033",
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
    },

    officerNoteTimestamp: {
      color: "#94A3B8",
      fontSize: 11,
      marginTop: 8,
    },

    officerNoteActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },

    officerNoteSmallButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    officerNoteSmallButtonText: {
      color: "#0F4C81",
      fontSize: 12,
      fontWeight: "700",
    },

    officerNoteDeleteButton: {
      borderColor: "#FCA5A5",
    },

    officerNoteDeleteText: {
      color: "#DC2626",
      fontSize: 12,
      fontWeight: "700",
    },

    investigationTasksButton: {
      marginTop: 10,
    },

    investigationTasksButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    taskProgressCard: {
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },

    taskProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    taskProgressTitle: {
      color: "#334155",
      fontSize: 13,
      fontWeight: "700",
    },

    taskProgressValue: {
      color: "#0F4C81",
      fontSize: 13,
      fontWeight: "800",
    },

    taskProgressTrack: {
      height: 8,
      marginTop: 9,
      borderRadius: 999,
      backgroundColor: "#CBD5E1",
      overflow: "hidden",
    },

    taskProgressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#0F4C81",
    },

    taskComposer: {
      marginTop: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
    },

    taskComposerTitle: {
      color: "#0F4C81",
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
    },

    taskInput: {
      minHeight: 72,
      maxHeight: 130,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 11,
      backgroundColor: "#FFFFFF",
      color: "#172033",
      paddingHorizontal: 12,
      paddingVertical: 10,
      textAlignVertical: "top",
    },

    taskFieldLabel: {
      marginTop: 11,
      marginBottom: 6,
      color: "#475569",
      fontSize: 12,
      fontWeight: "700",
    },

    taskChoiceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },

    taskChoiceButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    taskChoiceButtonActive: {
      backgroundColor: "#0F4C81",
      borderColor: "#0F4C81",
    },

    taskChoiceText: {
      color: "#475569",
      fontSize: 11,
      fontWeight: "700",
    },

    taskChoiceTextActive: {
      color: "#FFFFFF",
    },

    taskDueDateInput: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      color: "#172033",
      paddingHorizontal: 12,
      paddingVertical: 9,
    },

    taskAssignmentText: {
      marginTop: 10,
      color: "#64748B",
      fontSize: 11,
    },

    taskComposerActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 12,
    },

    taskSaveButton: {
      backgroundColor: "#0F4C81",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    taskSaveText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    taskCancelButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: "#FFFFFF",
    },

    taskCancelText: {
      color: "#475569",
      fontWeight: "700",
    },

    taskFilterScroll: {
      flexGrow: 0,
      marginBottom: 9,
    },

    taskFilterRow: {
      gap: 7,
      paddingRight: 8,
    },

    taskFilterButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    taskFilterButtonActive: {
      borderColor: "#0F4C81",
      backgroundColor: "#EAF2F8",
    },

    taskFilterText: {
      color: "#64748B",
      fontSize: 11,
      fontWeight: "700",
    },

    taskFilterTextActive: {
      color: "#0F4C81",
    },

    taskCard: {
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 13,
      padding: 13,
      marginBottom: 10,
      backgroundColor: "#FFFFFF",
    },

    taskCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 9,
    },

    taskCardText: {
      color: "#172033",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
    },

    taskCardMeta: {
      color: "#64748B",
      fontSize: 11,
      marginTop: 5,
    },

    taskPriorityBadge: {
      color: "#0F4C81",
      fontSize: 11,
      fontWeight: "800",
      backgroundColor: "#EAF2F8",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
    },

    taskStatusText: {
      marginTop: 9,
      color: "#334155",
      fontSize: 12,
      fontWeight: "700",
    },

    taskDueText: {
      marginTop: 4,
      color: "#475569",
      fontSize: 11,
    },

    taskTimestamp: {
      marginTop: 5,
      color: "#94A3B8",
      fontSize: 10,
    },

    taskCardActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 11,
    },

    taskSmallButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    taskSmallButtonText: {
      color: "#0F4C81",
      fontSize: 11,
      fontWeight: "700",
    },

    taskDeleteButton: {
      borderColor: "#FCA5A5",
    },

    taskDeleteText: {
      color: "#DC2626",
      fontSize: 11,
      fontWeight: "700",
    },

    taskModalScroll: {
      flex: 1,
      minHeight: 0,
    },

    taskModalScrollContent: {
      paddingBottom: 28,
    },

    evidenceButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    evidenceModalScroll: {
      flex: 1,
      minHeight: 0,
    },

    evidenceModalContent: {
      paddingBottom: 28,
    },

    evidenceComposer: {
      padding: 14,
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
      marginBottom: 12,
    },

    evidenceComposerTitle: {
      color: "#0F4C81",
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 9,
    },

    evidencePickButton: {
      borderWidth: 1,
      borderColor: "#0F4C81",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "#FFFFFF",
      marginBottom: 9,
    },

    evidencePickButtonText: {
      color: "#0F4C81",
      fontSize: 12,
      fontWeight: "700",
    },

    evidenceInput: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      color: "#172033",
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginBottom: 9,
    },

    evidenceDescriptionInput: {
      minHeight: 72,
      textAlignVertical: "top",
    },

    evidenceFieldLabel: {
      color: "#475569",
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 7,
    },

    evidenceChoiceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },

    evidenceChoiceButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    evidenceChoiceButtonActive: {
      borderColor: "#0F4C81",
      backgroundColor: "#0F4C81",
    },

    evidenceChoiceText: {
      color: "#475569",
      fontSize: 11,
      fontWeight: "700",
    },

    evidenceChoiceTextActive: {
      color: "#FFFFFF",
    },

    evidenceOfficerText: {
      color: "#64748B",
      fontSize: 11,
      marginTop: 10,
    },

    evidenceSaveButton: {
      alignSelf: "flex-end",
      backgroundColor: "#0F4C81",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 12,
    },

    evidenceSaveButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    evidenceFilterScroll: {
      flexGrow: 0,
      marginBottom: 10,
    },

    evidenceCard: {
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 13,
      padding: 13,
      marginBottom: 10,
      backgroundColor: "#FFFFFF",
    },

    evidenceCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },

    evidenceIdText: {
      color: "#0F4C81",
      fontSize: 11,
      fontWeight: "800",
    },

    evidenceTitleText: {
      color: "#172033",
      fontSize: 14,
      fontWeight: "700",
      marginTop: 3,
    },

    evidenceTypeBadge: {
      color: "#0F4C81",
      backgroundColor: "#EAF2F8",
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 5,
      fontSize: 10,
      fontWeight: "800",
    },

    evidenceDescriptionText: {
      color: "#475569",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 8,
    },

    evidenceFileText: {
      color: "#334155",
      fontSize: 11,
      fontWeight: "700",
      marginTop: 8,
    },

    evidenceMetaText: {
      color: "#94A3B8",
      fontSize: 10,
      marginTop: 5,
    },

    evidenceActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 10,
    },

    evidenceSmallButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    evidenceSmallButtonText: {
      color: "#0F4C81",
      fontSize: 11,
      fontWeight: "700",
    },

    evidenceDeleteButton: {
      borderColor: "#FCA5A5",
    },

    evidenceDeleteText: {
      color: "#DC2626",
      fontSize: 11,
      fontWeight: "700",
    },

    collaborationButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    collaborationScroll: {
      flex: 1,
      minHeight: 0,
    },

    collaborationContent: {
      paddingBottom: 28,
    },

    collaborationSummaryCard: {
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 13,
      padding: 13,
      backgroundColor: "#F8FAFC",
      marginBottom: 14,
    },

    collaborationLabel: {
      color: "#64748B",
      fontSize: 11,
      fontWeight: "700",
    },

    collaborationValue: {
      color: "#172033",
      fontSize: 14,
      fontWeight: "700",
      marginTop: 3,
    },

    collaborationSectionTitle: {
      color: "#0F4C81",
      fontSize: 13,
      fontWeight: "800",
      marginTop: 10,
      marginBottom: 8,
    },

    collaborationChoiceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginBottom: 10,
    },

    collaborationChoiceButton: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor: "#FFFFFF",
    },

    collaborationChoiceButtonActive: {
      borderColor: "#0F4C81",
      backgroundColor: "#0F4C81",
    },

    collaborationChoiceText: {
      color: "#475569",
      fontSize: 11,
      fontWeight: "700",
    },

    collaborationChoiceTextActive: {
      color: "#FFFFFF",
    },

    collaborationInput: {
      borderWidth: 1,
      borderColor: "#CBD5E1",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      color: "#172033",
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginBottom: 9,
    },

    collaborationNoteInput: {
      minHeight: 86,
      textAlignVertical: "top",
    },

    collaborationSaveButton: {
      alignSelf: "flex-end",
      backgroundColor: "#0F4C81",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 4,
      marginBottom: 8,
    },

    collaborationSaveButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    collaborationActivityCard: {
      borderWidth: 1,
      borderColor: "#D8E1EA",
      borderRadius: 12,
      padding: 12,
      backgroundColor: "#FFFFFF",
      marginBottom: 9,
    },

    collaborationActivityAction: {
      color: "#0F4C81",
      fontSize: 11,
      fontWeight: "800",
    },

    collaborationActivityDescription: {
      color: "#334155",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },

    collaborationActivityMeta: {
      color: "#94A3B8",
      fontSize: 10,
      marginTop: 6,
    },






  });