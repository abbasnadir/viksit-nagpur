// ─── Core Domain Types ───────────────────────────────────────────────────────

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type IncidentType = 'Accident' | 'Congestion' | 'Road Work' | 'Signal Failure' | 'Blockage' | 'Road Damage' | 'Crowd';
export type IncidentSeverity = 'Minor' | 'Moderate' | 'Severe' | 'Critical';
export type IncidentStatus = 'Active' | 'Responding' | 'Resolved' | 'Monitoring';
export type OfficerAvailability = 'Available' | 'On Duty' | 'Off Shift' | 'On Break';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RecommendationAction = 'Approve' | 'Modify' | 'Reject';

// ─── Location ────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  shortName: string;
  area: string;
  corridor: string;
  lat: number;
  lng: number;
  // Map position (normalised 0-100 SVG units)
  mapX: number;
  mapY: number;
  riskScore: number;       // 0–100
  riskLevel: RiskLevel;
  officersAssigned: number;
  recommendedOfficers: number;
  activeIncidents: number;
  trafficCondition: string;
  riskFactors: string[];
  avgSpeedKmh: number;
  volumePcuHr: number;
  queueLengthM: number;
}

// ─── Officer ─────────────────────────────────────────────────────────────────

export interface Officer {
  id: string;
  badgeNo: string;
  name: string;
  rank: string;
  zone: string;
  locationId: string | null;
  locationName: string | null;
  availability: OfficerAvailability;
  shift: string;           // e.g. "06:00–14:00"
  hoursOnDuty: number;
  workloadPct: number;     // 0–100
  phone: string;
}

// ─── Incident ────────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  type: IncidentType;
  locationId: string;
  locationName: string;
  severity: IncidentSeverity;
  shortDescription?: string;
  description: string;
  reportedAt: string;      // ISO string
  status: IncidentStatus;
  officerAssigned: string | null;
  estimatedClearanceMin: number | null;
}

// ─── Deployment ──────────────────────────────────────────────────────────────

export interface DeploymentAssignment {
  id: string;
  officerId: string;
  officerName: string;
  officerBadge: string;
  fromLocationId: string | null;
  fromLocationName: string | null;
  toLocationId: string;
  toLocationName: string;
  priority: Priority;
  etaMinutes: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Modified' | 'Rejected';
  isAI: boolean;
}

// ─── Comparison Metrics ──────────────────────────────────────────────────────

export interface ComparisonMetrics {
  label: string;
  baseline: number | string;
  ai: number | string;
  unit: string;
  betterIsLower: boolean;
}

// ─── Simulation State ────────────────────────────────────────────────────────

export type SimulationStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface SimulationState {
  active: boolean;
  step: SimulationStep;
  triggerLocationId: string | null;
  incident: Incident | null;
  preRiskScores: Record<string, number>;
  redeploymentApproved: boolean;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type NavView =
  | 'control-room'
  | 'traffic-risk'
  | 'deployment'
  | 'incidents'
  | 'officers'
  | 'analytics'
  | 'citizen-reports';

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  isLoggedIn: boolean;
  operatorName: string;
  currentView: NavView;
  selectedLocationId: string | null;
  locations: Location[];
  officers: Officer[];
  incidents: Incident[];
  deployments: DeploymentAssignment[];
  simulation: SimulationState;
  lastUpdated: Date;
}

// ─── Citizen Report ──────────────────────────────────────────────────────────

export interface CitizenReport {
  type: string;
  location: string;
  description: string;
  contactPhone: string;
  imageFile: File | null;
}
