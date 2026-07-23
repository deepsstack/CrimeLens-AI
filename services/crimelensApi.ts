/**
 * services/crimelensApi.ts
 *
 * CrimeLens AI — Zoho Catalyst backend API service layer.
 *
 * Provides typed fetch wrappers for every backend endpoint.
 * Does NOT import Axios; uses the native fetch API throughout.
 * Does NOT hard-code sample FIR / accused values into logic.
 *
 * Usage:
 *   import { getAllFIRCases, getFIRByNumber } from '../services/crimelensApi';
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

export const API_BASE_URL = "http://localhost:3001";

// ─── Core entity types ────────────────────────────────────────────────────────

/** A single FIR (First Information Report) record returned by the backend. */
export interface FIRCase {
  FIR_NUMBER: string;
  CRIME_TYPE: string;
  DISTRICT: string;
  LOCATION: string;
  DESCRIPTION: string;
  STATUS: string;
  CASE_PRIORITY: string;
  OFFICER_ASSIGNED: string;

  DATE_REPORTED?: string;
  DATE_OF_OFFENCE?: string;
  INCIDENT_DATE?: string;

  ACCUSED_NAME?: string;
  VICTIM_NAME?: string;
  

  [key: string]: unknown;
}

/** An accused person record returned by the backend. */
export interface Accused {
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

/** A relationship descriptor inside a criminal network response. */
export interface NetworkRelationship {
  type: string;
  strength: string;
  relatedFir: string;
  status: string;
  notes: string | null;
}

/** A single connection entry in a criminal-network response. */
export interface CriminalNetworkRelationship {
  relationship: NetworkRelationship;
  connectedAccused: Accused;
}

/**
 * A link between an accused person and a specific FIR,
 * as returned by the /fir-cases/{firNumber}/accused endpoint.
 */
export interface FIRAccusedLink {
  involvementRole: string;
  linkStatus: string;
  accused: Accused;
}

// ─── API response envelope types ─────────────────────────────────────────────

/** Envelope returned by GET /fir-cases */
export interface FIRCasesResponse {
  success: boolean;
  count: number;
  data: FIRCase[];
}

/** Envelope returned by GET /fir-cases/{firNumber} */
export interface FIRCaseResponse {
  success: boolean;
  data: FIRCase;
}

/** Envelope returned by GET /accused */
export interface AccusedListResponse {
  success: boolean;
  count: number;
  data: Accused[];
}

/** Envelope returned by GET /accused/{accusedId} */
export interface AccusedResponse {
  success: boolean;
  data: Accused;
}

/** Envelope returned by GET /fir-cases/{firNumber}/accused */
export interface FIRAccusedResponse {
  success: boolean;
  firNumber: string;
  count: number;
  data: FIRAccusedLink[];
}

/** Envelope returned by GET /network/{accusedId} */
export interface CriminalNetworkResponse {
  success: boolean;
  sourceAccused: Accused;
  connectionCount: number;
  relationships: CriminalNetworkRelationship[];
}

// ─── AI Query types ───────────────────────────────────────────────────────────

/** Request body for POST /ai/query */
export interface AIQueryRequest {
  query: string;
  officerBadge: string;
  language: string;
}

/**
 * The `data` payload that may be nested inside an AI query response.
 * Different queryTypes return different sub-keys; all fields are optional.
 */
export interface AIQueryData {

  /** Populated for FIR_LOOKUP queries */
  fir?: FIRCase;

  /** Populated for ACCUSED_LOOKUP queries */
  accused?: Accused;

  /** Populated for NETWORK_ANALYSIS queries */
  network?: CriminalNetworkResponse;

  /**
   * Populated for crime/location/general FIR search queries.
   * Example:
   * "Show me robbery cases"
   * "Show me cases in Bengaluru Urban"
   */
  cases?: FIRCase[];

  /**
   * Populated for FIR → accused relationship queries.
   */
  accusedLinks?: FIRAccusedLink[];

  /**
   * Used by repeat-offender analysis.
   */
  repeatOffenders?: unknown[];

  /** Any additional backend fields */
  [key: string]: unknown;
}

/** Full response envelope for POST /ai/query */
export interface AIQueryResponse {
  success: boolean;
  queryId: string;
  query: string;
  queryType: string;
  answer: string;
  /** Decimal 0–1 (e.g. 0.99 = 99%) */
  confidenceScore: number;
  relatedFirNumber?: string | null;
  data?: AIQueryData;
  message?: string;
  error?: string;
}

// ─── Generic error shape the backend may return ───────────────────────────────

interface BackendError {
  success: false;
  message?: string;
  error?: string;
}

// ─── Reusable request helper ──────────────────────────────────────────────────

/**
 * Performs a GET request to the given URL and returns the parsed JSON body
 * typed as T.
 *
 * Error handling:
 *  - If the HTTP status is not 2xx, attempts to parse the body for a backend
 *    error message and throws an Error with that message.
 *  - If the response body cannot be parsed as JSON, throws an Error describing
 *    the parse failure.
 */
async function request<T>(url: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  } catch (networkError) {
    // Network-level failure (e.g. no connectivity, DNS failure)
    throw new Error(
      `Network request failed for ${url}: ${networkError instanceof Error
        ? networkError.message
        : String(networkError)
      }`
    );
  }

  // Attempt to parse the body as JSON regardless of status code so that we
  // can surface backend error messages on non-2xx responses.
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // Body is empty or not valid JSON
    if (!response.ok) {
      throw new Error(
        `Request to ${url} failed with HTTP ${response.status} (${response.statusText}) and a non-JSON response body.`
      );
    }
    throw new Error(
      `Request to ${url} succeeded (HTTP ${response.status}) but returned a non-JSON response body.`
    );
  }

  if (!response.ok) {
    // Try to extract a human-readable message from the backend error envelope
    const err = body as BackendError;
    const detail = err?.message ?? err?.error ?? response.statusText;
    throw new Error(
      `Request to ${url} failed with HTTP ${response.status}: ${detail}`
    );
  }

  return body as T;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetches all FIR cases from the backend.
 *
 * @returns {Promise<FIRCasesResponse>} Full response envelope including count
 *   and data array.
 *
 * Endpoint: GET /fir-cases
 */
export async function getAllFIRCases(): Promise<FIRCasesResponse> {
  return request<FIRCasesResponse>(`${API_BASE_URL}/fir-cases`);
}

/**
 * Fetches a single FIR case by its FIR number.
 *
 * @param firNumber - The FIR number string (e.g. "FIR-BLR-2026-0001").
 *   Will be URI-encoded automatically.
 *
 * Endpoint: GET /fir-cases/{firNumber}
 */
export async function getFIRByNumber(
  firNumber: string
): Promise<FIRCaseResponse> {
  const encoded = encodeURIComponent(firNumber);
  return request<FIRCaseResponse>(`${API_BASE_URL}/fir-cases/${encoded}`);
}

/**
 * Fetches all accused person records.
 *
 * @returns {Promise<AccusedListResponse>} Full response envelope with count
 *   and data array.
 *
 * Endpoint: GET /accused
 */
export async function getAllAccused(): Promise<AccusedListResponse> {
  return request<AccusedListResponse>(`${API_BASE_URL}/accused`);
}

/**
 * Fetches a single accused person record by their ID.
 *
 * @param accusedId - The accused person's ID string.
 *   Will be URI-encoded automatically.
 *
 * Endpoint: GET /accused/{accusedId}
 */
export async function getAccusedById(
  accusedId: string
): Promise<AccusedResponse> {
  const encoded = encodeURIComponent(accusedId);
  return request<AccusedResponse>(`${API_BASE_URL}/accused/${encoded}`);
}

/**
 * Fetches all accused persons linked to a specific FIR, including their
 * involvement role and link status.
 *
 * @param firNumber - The FIR number string (e.g. "FIR-BLR-2026-0001").
 *   Will be URI-encoded automatically.
 *
 * Endpoint: GET /fir-cases/{firNumber}/accused
 */
export async function getAccusedByFIR(
  firNumber: string
): Promise<FIRAccusedResponse> {
  const encoded = encodeURIComponent(firNumber);
  return request<FIRAccusedResponse>(
    `${API_BASE_URL}/fir-cases/${encoded}/accused`
  );
}

/**
 * Fetches the criminal network (associations) for a given accused person.
 *
 * @param accusedId - The accused person's ID string.
 *   Will be URI-encoded automatically.
 *
 * Endpoint: GET /network/{accusedId}
 */
export async function getCriminalNetwork(
  accusedId: string
): Promise<CriminalNetworkResponse> {
  const encoded = encodeURIComponent(accusedId);
  return request<CriminalNetworkResponse>(
    `${API_BASE_URL}/network/${encoded}`
  );
}

/**
 * Submits a natural-language investigation query to the Catalyst AI engine.
 *
 * @param queryRequest - The query payload including the officer badge and language.
 *
 * Endpoint: POST /ai/query
 * Content-Type: application/json
 *
 * The backend returns `confidenceScore` as a decimal (0.0–1.0).
 * Multiply by 100 before passing to UI components that expect a percentage.
 */
export async function postAIQuery(
  queryRequest: AIQueryRequest
): Promise<AIQueryResponse> {
  const url = `${API_BASE_URL}/ai/query`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(queryRequest),
    });
  } catch (networkError) {
    throw new Error(
      `Network request failed for ${url}: ${networkError instanceof Error
        ? networkError.message
        : String(networkError)
      }`
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(
        `AI query to ${url} failed with HTTP ${response.status} (${response.statusText}) and a non-JSON response body.`
      );
    }
    throw new Error(
      `AI query to ${url} returned HTTP ${response.status} but with a non-JSON response body.`
    );
  }

  if (!response.ok) {
    const err = body as BackendError;
    const detail = err?.message ?? err?.error ?? response.statusText;
    throw new Error(
      `AI query failed with HTTP ${response.status}: ${detail}`
    );
  }

  return body as AIQueryResponse;
}
