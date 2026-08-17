import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  AppState,
  NavView,
  SimulationStep,
  DeploymentAssignment,
  Incident,
  Location,
} from '../types';
import {
  LOCATIONS,
  OFFICERS,
  INCIDENTS,
  INITIAL_DEPLOYMENTS,
} from '../data/mockData';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialSimIncident: Incident = {
  id: 'INC_SIM',
  type: 'Accident',
  locationId: 'LOC_CHHATRAPATI',
  locationName: 'Chhatrapati Square',
  severity: 'Critical',
  shortDescription: '[SIM] 2-Lane Blockage Crash',
  description: '[SIMULATED] Multi-vehicle accident at Chhatrapati Square. Two lanes blocked. Ambulance requested.',
  reportedAt: new Date().toISOString(),
  status: 'Active',
  officerAssigned: null,
  estimatedClearanceMin: 30,
};

const INITIAL_STATE: AppState = {
  isLoggedIn: false,
  operatorName: 'Insp. A. Deshmukh',
  currentView: 'control-room',
  selectedLocationId: null,
  locations: LOCATIONS,
  officers: OFFICERS,
  incidents: INCIDENTS,
  deployments: INITIAL_DEPLOYMENTS,
  simulation: {
    active: false,
    step: 0,
    triggerLocationId: null,
    incident: null,
    preRiskScores: {},
    redeploymentApproved: false,
  },
  lastUpdated: new Date(),
};

// ─── Action Types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_VIEW'; payload: NavView }
  | { type: 'SELECT_LOCATION'; payload: string | null }
  | { type: 'APPROVE_DEPLOYMENT'; payload: string }
  | { type: 'REJECT_DEPLOYMENT'; payload: string }
  | { type: 'MODIFY_DEPLOYMENT'; payload: { id: string; toLocationId: string; toLocationName: string; reason: string } }
  | { type: 'SIM_START'; payload: { locationId: string } }
  | { type: 'SIM_NEXT_STEP' }
  | { type: 'SIM_APPROVE_REDEPLOYMENT' }
  | { type: 'SIM_RESET' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true };

    case 'LOGOUT':
      return { ...state, isLoggedIn: false };

    case 'SET_VIEW':
      return { ...state, currentView: action.payload, selectedLocationId: null };

    case 'SELECT_LOCATION':
      return { ...state, selectedLocationId: action.payload };

    case 'APPROVE_DEPLOYMENT': {
      const updatedDeps = state.deployments.map(d =>
        d.id === action.payload ? { ...d, status: 'Approved' as const } : d
      );
      // Update officer location
      const dep = state.deployments.find(d => d.id === action.payload);
      const updatedOfficers = dep
        ? state.officers.map(o =>
            o.id === dep.officerId
              ? { ...o, locationId: dep.toLocationId, locationName: dep.toLocationName, availability: 'On Duty' as const, workloadPct: Math.min(o.workloadPct + 15, 95) }
              : o
          )
        : state.officers;
      // Update location officer count
      const updatedLocations = dep
        ? state.locations.map(loc => {
            if (loc.id === dep.toLocationId)
              return { ...loc, officersAssigned: loc.officersAssigned + 1 };
            if (dep.fromLocationId && loc.id === dep.fromLocationId)
              return { ...loc, officersAssigned: Math.max(0, loc.officersAssigned - 1) };
            return loc;
          })
        : state.locations;
      return { ...state, deployments: updatedDeps, officers: updatedOfficers, locations: updatedLocations, lastUpdated: new Date() };
    }

    case 'REJECT_DEPLOYMENT':
      return {
        ...state,
        deployments: state.deployments.map(d =>
          d.id === action.payload ? { ...d, status: 'Rejected' as const } : d
        ),
        lastUpdated: new Date(),
      };

    case 'MODIFY_DEPLOYMENT':
      return {
        ...state,
        deployments: state.deployments.map(d =>
          d.id === action.payload.id
            ? { ...d, toLocationId: action.payload.toLocationId, toLocationName: action.payload.toLocationName, reason: action.payload.reason, status: 'Modified' as const }
            : d
        ),
        lastUpdated: new Date(),
      };

    case 'SIM_START': {
      const preRiskScores: Record<string, number> = {};
      state.locations.forEach(l => { preRiskScores[l.id] = l.riskScore; });

      // Increase risk at trigger location and neighbors
      const updatedLocations = state.locations.map(loc => {
        if (loc.id === action.payload.locationId) {
          return { ...loc, riskScore: Math.min(100, loc.riskScore + 20), riskLevel: 'High' as const, activeIncidents: loc.activeIncidents + 1, trafficCondition: 'Severely Congested' };
        }
        // Nearby locations also affected
        if (['LOC_RAHATE', 'LOC_AJNI'].includes(loc.id)) {
          const newScore = Math.min(100, loc.riskScore + 10);
          return { ...loc, riskScore: newScore, riskLevel: newScore >= 70 ? 'High' as const : 'Medium' as const };
        }
        return loc;
      });

      const simIncident = { ...initialSimIncident, reportedAt: new Date().toISOString(), locationId: action.payload.locationId };

      return {
        ...state,
        simulation: {
          active: true,
          step: 1,
          triggerLocationId: action.payload.locationId,
          incident: simIncident,
          preRiskScores,
          redeploymentApproved: false,
        },
        locations: updatedLocations,
        incidents: [simIncident, ...state.incidents],
        lastUpdated: new Date(),
      };
    }

    case 'SIM_NEXT_STEP': {
      const nextStep = Math.min(5, state.simulation.step + 1) as SimulationStep;
      return {
        ...state,
        simulation: { ...state.simulation, step: nextStep },
      };
    }

    case 'SIM_APPROVE_REDEPLOYMENT': {
      // Add a redeployment assignment
      const redeployment: DeploymentAssignment = {
        id: 'DEP_SIM_001',
        officerId: 'OFF_019',
        officerName: 'Bhushan Tembhare',
        officerBadge: 'NTP-1654',
        fromLocationId: 'LOC_NAGPUR_CENTRAL',
        fromLocationName: 'Zero Mile',
        toLocationId: state.simulation.triggerLocationId ?? 'LOC_CHHATRAPATI',
        toLocationName: state.locations.find(l => l.id === state.simulation.triggerLocationId)?.name ?? 'Chhatrapati Square',
        priority: 'Critical',
        etaMinutes: 7,
        reason: '[Emergency Redeployment] Major accident at location. Immediate officer dispatch required.',
        status: 'Approved',
        isAI: true,
      };
      // Update location officer count
      const updatedLocations = state.locations.map(loc => {
        if (loc.id === state.simulation.triggerLocationId)
          return { ...loc, officersAssigned: loc.officersAssigned + 1 };
        return loc;
      });
      return {
        ...state,
        simulation: { ...state.simulation, step: 5, redeploymentApproved: true },
        deployments: [redeployment, ...state.deployments],
        locations: updatedLocations,
        lastUpdated: new Date(),
      };
    }

    case 'SIM_RESET': {
      // Restore pre-simulation risk scores
      const restoredLocations = state.locations.map(loc => {
        const pre = state.simulation.preRiskScores[loc.id];
        if (pre !== undefined) return { ...loc, riskScore: pre };
        return loc;
      });
      return {
        ...state,
        simulation: { active: false, step: 0, triggerLocationId: null, incident: null, preRiskScores: {}, redeploymentApproved: false },
        locations: restoredLocations,
        incidents: state.incidents.filter(i => i.id !== 'INC_SIM'),
        lastUpdated: new Date(),
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  login: () => void;
  logout: () => void;
  setView: (v: NavView) => void;
  selectLocation: (id: string | null) => void;
  approveDeployment: (id: string) => void;
  rejectDeployment: (id: string) => void;
  modifyDeployment: (id: string, toLocationId: string, toLocationName: string, reason: string) => void;
  startSimulation: (locationId: string) => void;
  simNextStep: () => void;
  simApproveRedeployment: () => void;
  simReset: () => void;
  // Derived helpers
  getLocation: (id: string) => Location | undefined;
  highRiskLocations: Location[];
  coverageGaps: Location[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const login = useCallback(() => dispatch({ type: 'LOGIN' }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const setView = useCallback((v: NavView) => dispatch({ type: 'SET_VIEW', payload: v }), []);
  const selectLocation = useCallback((id: string | null) => dispatch({ type: 'SELECT_LOCATION', payload: id }), []);
  const approveDeployment = useCallback((id: string) => dispatch({ type: 'APPROVE_DEPLOYMENT', payload: id }), []);
  const rejectDeployment = useCallback((id: string) => dispatch({ type: 'REJECT_DEPLOYMENT', payload: id }), []);
  const modifyDeployment = useCallback((id: string, toLocationId: string, toLocationName: string, reason: string) =>
    dispatch({ type: 'MODIFY_DEPLOYMENT', payload: { id, toLocationId, toLocationName, reason } }), []);
  const startSimulation = useCallback((locationId: string) => dispatch({ type: 'SIM_START', payload: { locationId } }), []);
  const simNextStep = useCallback(() => dispatch({ type: 'SIM_NEXT_STEP' }), []);
  const simApproveRedeployment = useCallback(() => dispatch({ type: 'SIM_APPROVE_REDEPLOYMENT' }), []);
  const simReset = useCallback(() => dispatch({ type: 'SIM_RESET' }), []);
  const getLocation = useCallback((id: string) => state.locations.find(l => l.id === id), [state.locations]);

  const highRiskLocations = state.locations.filter(l => l.riskLevel === 'High');
  const coverageGaps = state.locations.filter(l => l.riskLevel === 'High' && l.officersAssigned === 0);

  const value: AppContextValue = {
    state, login, logout, setView, selectLocation,
    approveDeployment, rejectDeployment, modifyDeployment,
    startSimulation, simNextStep, simApproveRedeployment, simReset,
    getLocation, highRiskLocations, coverageGaps,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
