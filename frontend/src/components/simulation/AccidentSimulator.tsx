import React, { useState } from 'react';
import { Siren, AlertTriangle, ChevronRight, CheckCircle, ArrowRight, RotateCcw, X } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { RiskBadge } from '../common/Badge';

const STEPS = [
  'Trigger Incident',
  'Risk Assessment Updated',
  'Ranking Recalculated',
  'New Deployment Recommended',
  'Approve Redeployment',
  'Redeployment Confirmed',
];

const SIM_LOCATIONS = [
  { id: 'LOC_CHHATRAPATI', name: 'Chhatrapati Square' },
  { id: 'LOC_VARIETY', name: 'Variety Square' },
  { id: 'LOC_RAHATE', name: 'Rahate Colony Square' },
];

export default function AccidentSimulator() {
  const { state, startSimulation, simNextStep, simApproveRedeployment, simReset } = useApp();
  const { simulation } = state;
  const [selectedLocId, setSelectedLocId] = useState('LOC_CHHATRAPATI');
  const [isOpen, setIsOpen] = useState(false);

  const triggerLoc = simulation.triggerLocationId
    ? state.locations.find(l => l.id === simulation.triggerLocationId)
    : null;

  if (!isOpen && !simulation.active) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded border border-red-600 transition-colors"
      >
        <Siren size={14} />
        Simulate Accident
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 bg-red-700 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Siren size={16} className="text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">
              Incident Simulation
            </span>
          </div>
          {!simulation.active && (
            <button onClick={() => setIsOpen(false)} className="text-red-200 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const done = simulation.step >= stepNum;
              const current = simulation.step === stepNum - 1 && simulation.active;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2
                        ${done ? 'bg-green-600 border-green-600 text-white' :
                          current ? 'border-blue-600 text-blue-600' :
                          'border-slate-300 text-slate-400'}`}
                    >
                      {done ? <CheckCircle size={12} /> : stepNum}
                    </div>
                    <span className={`text-xs mt-1 text-center max-w-16 leading-tight
                      ${done ? 'text-green-700' : current ? 'text-blue-700' : 'text-slate-400'}`}
                      style={{ fontSize: '0.6rem' }}>
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 ${done ? 'bg-green-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* Step 0: Pre-simulation (Select location) */}
          {!simulation.active && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  This is a controlled simulation for demonstration purposes only.
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Triggering an incident will update risk scores, recalculate rankings, and generate emergency redeployment recommendations.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  Select Incident Location
                </label>
                <select
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-navy-600"
                  value={selectedLocId}
                  onChange={e => setSelectedLocId(e.target.value)}
                >
                  {SIM_LOCATIONS.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  Incident Type
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700">
                  Multi-vehicle accident — 2 lanes blocked, injury reported, ambulance dispatched
                </div>
              </div>
              <button
                onClick={() => startSimulation(selectedLocId)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold rounded transition-colors"
              >
                <Siren size={14} />
                Trigger Accident Simulation
              </button>
            </div>
          )}

          {/* Step 1: Incident triggered */}
          {simulation.active && simulation.step === 1 && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-red-700" />
                  <span className="text-sm font-bold text-red-800">INCIDENT TRIGGERED</span>
                </div>
                <p className="text-xs text-red-700 font-semibold">{triggerLoc?.name}</p>
                <p className="text-xs text-red-600 mt-1">{simulation.incident?.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-red">Severity: Critical</span>
                  <span className="badge badge-red">Status: Active</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Incident reported at <strong>{triggerLoc?.name}</strong>. Risk assessment engine is recalculating scores for affected corridors.
              </p>
              <button
                onClick={simNextStep}
                className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold rounded transition-colors"
              >
                View Risk Update <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Step 2: Risk change */}
          {simulation.active && simulation.step === 2 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Risk Score Changes</h4>
              <div className="space-y-2">
                {state.locations
                  .filter(l => {
                    const pre = simulation.preRiskScores[l.id];
                    return pre !== undefined && pre !== l.riskScore;
                  })
                  .map(loc => {
                    const pre = simulation.preRiskScores[loc.id] ?? loc.riskScore;
                    const diff = loc.riskScore - pre;
                    return (
                      <div key={loc.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded p-2">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-slate-700">{loc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-slate-500">{pre}</span>
                          <ArrowRight size={10} className="text-slate-400" />
                          <span className="font-mono font-bold text-red-700">{loc.riskScore}</span>
                          <span className="text-red-600 font-semibold">+{diff}</span>
                          <RiskBadge level={loc.riskLevel} />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <button
                onClick={simNextStep}
                className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold rounded transition-colors"
              >
                View Updated Ranking <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Step 3: Ranking */}
          {simulation.active && simulation.step === 3 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">High-Risk Ranking (Updated)</h4>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Location</th>
                      <th>Risk Score</th>
                      <th>Officers</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...state.locations]
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .slice(0, 5)
                      .map((loc, i) => (
                        <tr key={loc.id} className={loc.id === simulation.triggerLocationId ? 'bg-red-50' : ''}>
                          <td className="font-mono font-bold text-slate-500">{i + 1}</td>
                          <td className="font-semibold text-xs">{loc.shortName}</td>
                          <td>
                            <span className="font-mono font-bold" style={{ color: loc.riskLevel === 'High' ? '#dc2626' : '#d97706' }}>
                              {loc.riskScore}
                            </span>
                          </td>
                          <td className="font-mono">{loc.officersAssigned}</td>
                          <td>
                            <RiskBadge level={loc.riskLevel} />
                            {loc.id === simulation.triggerLocationId && (
                              <span className="ml-1 badge badge-red" style={{ fontSize: '0.6rem' }}>↑ NEW</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={simNextStep}
                className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold rounded transition-colors"
              >
                View Redeployment Plan <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Step 4: Redeployment recommendation */}
          {simulation.active && simulation.step === 4 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Emergency Redeployment Recommendation</h4>

              {/* Before/After comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Current Deployment</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{triggerLoc?.name}</span>
                      <span className="font-mono font-bold text-red-700">{triggerLoc?.officersAssigned} officers</span>
                    </div>
                    <div className="text-slate-400">Risk Score: {triggerLoc?.riskScore}</div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs font-bold text-blue-600 mb-2 uppercase">Recommended</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{triggerLoc?.name}</span>
                      <span className="font-mono font-bold text-green-700">{(triggerLoc?.officersAssigned ?? 0) + 1} officers</span>
                    </div>
                    <div className="text-blue-600">Dispatch: NTP-1654 Bhushan Tembhare</div>
                    <div className="text-blue-600">ETA: 7 minutes</div>
                  </div>
                </div>
              </div>

              <div className="bg-navy-50 border border-navy-200 rounded p-3 text-xs text-navy-800">
                <strong>AI Rationale:</strong> Officer Bhushan Tembhare at Zero Mile (low-risk, 3 officers) is the closest available officer.
                Redeployment will reduce response time from 18 min to 7 min at the incident location.
              </div>

              <div className="flex gap-2">
                <button
                  onClick={simApproveRedeployment}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded transition-colors"
                >
                  <CheckCircle size={13} />
                  Approve Redeployment
                </button>
                <button
                  onClick={simNextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
                >
                  Skip <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmed */}
          {simulation.active && simulation.step === 5 && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-800">Redeployment Confirmed</p>
                <p className="text-xs text-green-700 mt-1">
                  Officer NTP-1654 (Bhushan Tembhare) is en route to {triggerLoc?.name}.
                  ETA: <strong>7 minutes</strong>.
                </p>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle size={11} className="text-green-600" />
                  Incident registered in system
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={11} className="text-green-600" />
                  Risk scores updated across affected corridors
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={11} className="text-green-600" />
                  Deployment plan revised and approved
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={11} className="text-green-600" />
                  Officer dispatched to incident location
                </div>
              </div>
              <button
                onClick={simReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
              >
                <RotateCcw size={13} />
                Reset Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
