// data/investigationMockData.ts — CrimeLens AI Investigation Workspace mock data (Karnataka, India)

// ─── Union types ──────────────────────────────────────────────────────────────

export type NodeType =
  | 'accused'
  | 'victim'
  | 'fir'
  | 'vehicle'
  | 'mobile'
  | 'station'
  | 'district';

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

// ─── Core entity interfaces ───────────────────────────────────────────────────

export interface Attachment {
  id: string;
  name: string;
  type: string;
  uri: string;
  size: number; // bytes
}

export interface FIRReference {
  number: string;
  crimeType: string;
  crimeTypeKn: string;
  district: string;
  districtKn: string;
  date: string;
}

export interface OffenderReference {
  id: string;
  name: string;
  priorConvictions: number;
  linkedFIRs: string[];
}

export interface VehicleReference {
  registration: string;
  type: string;
  associatedFIRs: string[];
}

// ─── Investigation summary ────────────────────────────────────────────────────

export interface InvestigationSummary {
  repeatOffenders: {
    count: number;
    names: string[];
    details: OffenderReference[];
  };
  commonVehicles: {
    count: number;
    registrations: string[];
    details: VehicleReference[];
  };
  knownAssociates: {
    count: number;
    names: string[];
  };
  linkedMobileNumbers: {
    count: number;
    anonymizedIds: string[];
  };
  travelPattern: string;
  frequentLocations: string[];
  previousArrests: number;
  priority: PriorityLevel;
}

// ─── Explainability ───────────────────────────────────────────────────────────

export interface ExplainabilityFactor {
  labelKey: string;
  weight: number;
  icon: string;
}

export interface ExplainabilityData {
  factors: ExplainabilityFactor[];
  confidenceScore: number;
  explainabilityScore: number;
}

// ─── Network graph ────────────────────────────────────────────────────────────

export interface NetworkNode {
  id: string;
  type: NodeType;
  label: string;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  from: string;
  to: string;
  label?: string;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id: string;
  labelKey: string;
  timestamp: string;
  status: MilestoneStatus;
  description: string;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  titleKey: string;
  descKey: string;
  priority: PriorityLevel;
  actionLabelKey: string;
}

// ─── Query / response ─────────────────────────────────────────────────────────

export interface InvestigationQuery {
  id: string;
  text: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface InvestigationResponse {
  id: string;
  queryId: string;
  text: string;
  timestamp: Date;
  confidenceScore: number;
  linkedEntities: {
    firs: FIRReference[];
    offenders: OffenderReference[];
    vehicles: VehicleReference[];
    locations: string[];
  };
  summary?: InvestigationSummary;
  explainability?: ExplainabilityData;
  network?: NetworkGraphData;
  timeline?: TimelineEntry[];
  recommendations?: Recommendation[];
}

// ─── Chips / example queries ──────────────────────────────────────────────────

export interface SuggestedChip {
  id: string;
  labelKey: string;
  queryTemplate: string;
  icon: string;
}

export interface ExampleQuery {
  id: string;
  textKey: string;
}

// ─── AI status ────────────────────────────────────────────────────────────────

export interface AIStatus {
  online: boolean;
  confidenceScore: number;
  databaseSynced: boolean;
  lastUpdated: Date;
}

// ─── Top-level mock data container ───────────────────────────────────────────

export interface InvestigationMockData {
  officerName: string;
  officerRole: string;
  officerBadge: string;
  exampleQueries: ExampleQuery[];
  suggestedChips: SuggestedChip[];
  preloadedConversation: {
    query: InvestigationQuery;
    response: InvestigationResponse;
  };
  aiStatus: AIStatus;
}

// ─── Static mock data ─────────────────────────────────────────────────────────

export const mockData: InvestigationMockData = {
  officerName: 'Rajesh Kumar',
  officerRole: 'Senior Inspector',
  officerBadge: 'KSP-2847',

  // 4 example queries shown in the WelcomeCard
  exampleQueries: [
    {
      id: 'eq1',
      textKey: 'exampleQuery1', // "Find all repeat offenders linked to FIR-2024-08431"
    },
    {
      id: 'eq2',
      textKey: 'exampleQuery2', // "Show crime hotspots in Bengaluru for the last 30 days"
    },
    {
      id: 'eq3',
      textKey: 'exampleQuery3', // "Link all FIRs involving KA-01-AB-1234 vehicle"
    },
    {
      id: 'eq4',
      textKey: 'exampleQuery4', // "Identify suspects appearing across multiple theft cases in Tumakuru"
    },
  ],

  // 8 suggested chips for quick investigation shortcuts
  suggestedChips: [
    {
      id: 'chip1',
      labelKey: 'chipRepeatOffenders',
      queryTemplate: 'Find all repeat offenders with more than 2 FIRs in the last 12 months',
      icon: 'UserX',
    },
    {
      id: 'chip2',
      labelKey: 'chipCrimeHotspots',
      queryTemplate: 'Show crime hotspots across Karnataka districts for the last 30 days',
      icon: 'MapPin',
    },
    {
      id: 'chip3',
      labelKey: 'chipRelatedFIRs',
      queryTemplate: 'Find all FIRs related to FIR-2024-08431 across districts',
      icon: 'FileText',
    },
    {
      id: 'chip4',
      labelKey: 'chipDrugNetworks',
      queryTemplate: 'Identify drug trafficking networks operating in Bengaluru and Mysuru',
      icon: 'AlertTriangle',
    },
    {
      id: 'chip5',
      labelKey: 'chipCyberCrime',
      queryTemplate: 'Analyse cyber crime patterns and identify repeat cyber offenders',
      icon: 'Monitor',
    },
    {
      id: 'chip6',
      labelKey: 'chipMissingPersons',
      queryTemplate: 'Show all missing persons cases filed in the last 90 days with no resolution',
      icon: 'Users',
    },
    {
      id: 'chip7',
      labelKey: 'chipVehicleTheft',
      queryTemplate: 'Find all vehicle theft cases and cross-reference with CCTV and ANPR data',
      icon: 'Car',
    },
    {
      id: 'chip8',
      labelKey: 'chipGenerateReport',
      queryTemplate: 'Generate a comprehensive investigation report for current session',
      icon: 'Download',
    },
  ],

  // Full preloaded conversation (Requirement 20.2 – 20.4)
  preloadedConversation: {
    query: {
      id: 'preload-query-1',
      text: 'Find all repeat offenders connected to FIR-2024-08431',
      timestamp: new Date('2024-11-15T09:14:00'),
      attachments: [],
    },

    response: {
      id: 'preload-response-1',
      queryId: 'preload-query-1',
      text:
        'Analysis completed. I found 3 connected offenders across 3 related FIRs. ' +
        'Related FIRs: FIR-2023-01981, FIR-2024-08120, FIR-2022-00411. ' +
        'Common Locations: Bengaluru, Tumakuru. ' +
        'Associated Crimes: Vehicle Theft, House Burglary. ' +
        'Confidence: 92%.',
      timestamp: new Date('2024-11-15T09:14:03'),
      confidenceScore: 92,

      linkedEntities: {
        firs: [
          {
            number: 'FIR-2023-01981',
            crimeType: 'Vehicle Theft',
            crimeTypeKn: 'ವಾಹನ ಕಳ್ಳತನ',
            district: 'Bengaluru',
            districtKn: 'ಬೆಂಗಳೂರು',
            date: '2023-08-22',
          },
          {
            number: 'FIR-2024-08120',
            crimeType: 'House Burglary',
            crimeTypeKn: 'ಮನೆ ಕಳ್ಳತನ',
            district: 'Tumakuru',
            districtKn: 'ತುಮಕೂರು',
            date: '2024-03-11',
          },
          {
            number: 'FIR-2022-00411',
            crimeType: 'Vehicle Theft',
            crimeTypeKn: 'ವಾಹನ ಕಳ್ಳತನ',
            district: 'Bengaluru',
            districtKn: 'ಬೆಂಗಳೂರು',
            date: '2022-11-05',
          },
        ],
        offenders: [
          {
            id: 'off1',
            name: 'Suresh Babu',
            priorConvictions: 3,
            linkedFIRs: ['FIR-2024-08431', 'FIR-2023-01981', 'FIR-2022-00411'],
          },
          {
            id: 'off2',
            name: 'Mohan Gowda',
            priorConvictions: 2,
            linkedFIRs: ['FIR-2024-08431', 'FIR-2024-08120'],
          },
          {
            id: 'off3',
            name: 'Ravi Shankar',
            priorConvictions: 1,
            linkedFIRs: ['FIR-2024-08431', 'FIR-2023-01981'],
          },
        ],
        vehicles: [
          {
            registration: 'KA-01-AB-1234',
            type: 'Motorcycle',
            associatedFIRs: ['FIR-2024-08431', 'FIR-2023-01981'],
          },
          {
            registration: 'KA-03-MN-5678',
            type: 'Auto Rickshaw',
            associatedFIRs: ['FIR-2024-08120'],
          },
        ],
        locations: ['Bengaluru', 'Tumakuru', 'Electronic City', 'Hebbal', 'Nelamangala'],
      },

      // Investigation Summary (Requirement 7.1, 20.3)
      summary: {
        repeatOffenders: {
          count: 3,
          names: ['Suresh Babu', 'Mohan Gowda', 'Ravi Shankar'],
          details: [
            {
              id: 'off1',
              name: 'Suresh Babu',
              priorConvictions: 3,
              linkedFIRs: ['FIR-2024-08431', 'FIR-2023-01981', 'FIR-2022-00411'],
            },
            {
              id: 'off2',
              name: 'Mohan Gowda',
              priorConvictions: 2,
              linkedFIRs: ['FIR-2024-08431', 'FIR-2024-08120'],
            },
            {
              id: 'off3',
              name: 'Ravi Shankar',
              priorConvictions: 1,
              linkedFIRs: ['FIR-2024-08431', 'FIR-2023-01981'],
            },
          ],
        },
        commonVehicles: {
          count: 2,
          registrations: ['KA-01-AB-1234', 'KA-03-MN-5678'],
          details: [
            {
              registration: 'KA-01-AB-1234',
              type: 'Motorcycle',
              associatedFIRs: ['FIR-2024-08431', 'FIR-2023-01981'],
            },
            {
              registration: 'KA-03-MN-5678',
              type: 'Auto Rickshaw',
              associatedFIRs: ['FIR-2024-08120'],
            },
          ],
        },
        knownAssociates: {
          count: 4,
          names: ['Suresh Babu', 'Mohan Gowda', 'Ravi Shankar', 'Anil Kumar'],
        },
        linkedMobileNumbers: {
          count: 5,
          anonymizedIds: ['9XXXXX8821', '9XXXXX3301', '8XXXXX4409', '7XXXXX9912', '9XXXXX0055'],
        },
        travelPattern: 'Bengaluru → Tumakuru → Nelamangala corridor (recurring)',
        frequentLocations: [
          'Electronic City, Bengaluru',
          'Hebbal Flyover Area',
          'Tumakuru Bus Stand',
          'Nelamangala Toll Gate',
          'Peenya Industrial Area',
        ],
        previousArrests: 6,
        priority: 'High',
      },

      // Explainability (Requirement 8.1 – 8.5, 20.4)
      explainability: {
        factors: [
          {
            labelKey: 'factorRepeatedMobile',
            weight: 88,
            icon: 'Smartphone',
          },
          {
            labelKey: 'factorSharedVehicle',
            weight: 94,
            icon: 'Car',
          },
          {
            labelKey: 'factorSameIMEI',
            weight: 76,
            icon: 'Cpu',
          },
          {
            labelKey: 'factorCCTVMatch',
            weight: 82,
            icon: 'Camera',
          },
          {
            labelKey: 'factorCrimeTiming',
            weight: 79,
            icon: 'Clock',
          },
          {
            labelKey: 'factorHistoricalConviction',
            weight: 91,
            icon: 'FileWarning',
          },
        ],
        confidenceScore: 92,
        explainabilityScore: 85,
      },

      // Criminal Network (Requirement 9.1 – 9.5)
      network: {
        nodes: [
          { id: 'n1', type: 'accused',  label: 'Suresh Babu',     x: 160, y: 60  },
          { id: 'n2', type: 'accused',  label: 'Mohan Gowda',     x: 280, y: 60  },
          { id: 'n3', type: 'accused',  label: 'Ravi Shankar',    x: 220, y: 150 },
          { id: 'n4', type: 'victim',   label: 'Ramesh Hegde',    x: 80,  y: 160 },
          { id: 'n5', type: 'fir',      label: 'FIR-2024-08431',  x: 160, y: 240 },
          { id: 'n6', type: 'fir',      label: 'FIR-2023-01981',  x: 60,  y: 300 },
          { id: 'n7', type: 'fir',      label: 'FIR-2024-08120',  x: 260, y: 300 },
          { id: 'n8', type: 'vehicle',  label: 'KA-01-AB-1234',   x: 320, y: 180 },
          { id: 'n9', type: 'mobile',   label: '9XXXXX8821',      x: 100, y: 80  },
          { id: 'n10', type: 'station', label: 'Bengaluru East PS', x: 360, y: 240 },
          { id: 'n11', type: 'district', label: 'Tumakuru',        x: 220, y: 350 },
        ],
        edges: [
          { from: 'n1', to: 'n5',  label: 'accused in'   },
          { from: 'n2', to: 'n5',  label: 'accused in'   },
          { from: 'n3', to: 'n5',  label: 'accused in'   },
          { from: 'n1', to: 'n6',  label: 'linked'       },
          { from: 'n3', to: 'n6',  label: 'linked'       },
          { from: 'n2', to: 'n7',  label: 'linked'       },
          { from: 'n4', to: 'n5',  label: 'victim'       },
          { from: 'n8', to: 'n5',  label: 'registered'   },
          { from: 'n8', to: 'n6',  label: 'seen at'      },
          { from: 'n9', to: 'n1',  label: 'used by'      },
          { from: 'n9', to: 'n2',  label: 'used by'      },
          { from: 'n5', to: 'n10', label: 'filed at'     },
          { from: 'n7', to: 'n11', label: 'district'     },
          { from: 'n1', to: 'n3',  label: 'co-accused'   },
        ],
      },

      // Timeline (Requirement 10.1 – 10.4)
      timeline: [
        {
          id: 'tl1',
          labelKey: 'milestoneRegistered',
          timestamp: '15 Nov 2024, 07:00 AM',
          status: 'completed',
          description: 'FIR-2024-08431 registered at Bengaluru East Police Station by SI Ramesh K.',
        },
        {
          id: 'tl2',
          labelKey: 'milestoneEvidence',
          timestamp: '15 Nov 2024, 09:30 AM',
          status: 'completed',
          description: 'CCTV footage, ANPR records, and mobile call detail records uploaded.',
        },
        {
          id: 'tl3',
          labelKey: 'milestoneSuspect',
          timestamp: '15 Nov 2024, 11:45 AM',
          status: 'completed',
          description: 'Three suspects identified: Suresh Babu, Mohan Gowda, Ravi Shankar.',
        },
        {
          id: 'tl4',
          labelKey: 'milestoneNetwork',
          timestamp: '15 Nov 2024, 02:15 PM',
          status: 'in_progress',
          description:
            'AI network analysis linking suspects across FIR-2023-01981, FIR-2024-08120, FIR-2022-00411.',
        },
        {
          id: 'tl5',
          labelKey: 'milestoneChargesheet',
          timestamp: 'Pending',
          status: 'pending',
          description: 'Chargesheet preparation pending completion of network analysis.',
        },
        {
          id: 'tl6',
          labelKey: 'milestoneActive',
          timestamp: 'Ongoing',
          status: 'in_progress',
          description: 'Case actively under investigation. Priority: High.',
        },
      ],

      // Recommendations (Requirement 11.1 – 11.5)
      recommendations: [
        {
          id: 'rec1',
          titleKey: 'recSurveillance',
          descKey: 'recSurveillanceDesc',
          priority: 'High',
          actionLabelKey: 'recSurveillanceAction',
        },
        {
          id: 'rec2',
          titleKey: 'recVehicleInvestigate',
          descKey: 'recVehicleInvestigateDesc',
          priority: 'High',
          actionLabelKey: 'recVehicleInvestigateAction',
        },
        {
          id: 'rec3',
          titleKey: 'recReviewFIR',
          descKey: 'recReviewFIRDesc',
          priority: 'Medium',
          actionLabelKey: 'recReviewFIRAction',
        },
        {
          id: 'rec4',
          titleKey: 'recCoordinateCyber',
          descKey: 'recCoordinateCyberDesc',
          priority: 'Medium',
          actionLabelKey: 'recCoordinateCyberAction',
        },
        {
          id: 'rec5',
          titleKey: 'recEscalate',
          descKey: 'recEscalateDesc',
          priority: 'High',
          actionLabelKey: 'recEscalateAction',
        },
      ],
    },
  },

  // AI Status Card data (Requirement 13.1 – 13.5)
  aiStatus: {
    online: true,
    confidenceScore: 92,
    databaseSynced: true,
    lastUpdated: new Date('2024-11-15T09:14:03'),
  },
};

export default mockData;
