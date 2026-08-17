import React from 'react';
import {
  AlertTriangle, MapPin, Users, Activity, Clock,
  TrendingUp, Shield, Siren
} from 'lucide-react';
import { useApp } from '../store/appStore';
import NagpurMap from '../components/map/NagpurMap';
import LocationDetailPanel from '../components/map/LocationDetailPanel';
import StatCard from '../components/common/StatCard';
import { RiskBadge, SeverityBadge } from '../components/common/Badge';
import AccidentSimulator from '../components/simulation/AccidentSimulator';

export default function ControlRoomPage() {
  const { state, selectLocation, setView, coverageGaps, highRiskLocations } = useApp();

  const totalOfficers = state.officers.filter(o => o.availability === 'On Duty').length;
  const avgRisk = Math.round(state.locations.reduce((s, l) => s + l.riskScore, 0) / state.locations.length);
  const activeIncidents = state.incidents.filter(i => i.status === 'Active' || i.status === 'Responding').length;
  const avgResponseTime = 7.2;

  const sortedRisk = [...state.locations].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Stats bar ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Control Room Overview</h2>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {/* Simulate Accident */}
          <AccidentSimulator />
        </div>

        <div className="grid grid-cols-6 gap-2">
          <StatCard
            label="Average Risk Score"
            value={avgRisk}
            sub="City-wide"
            icon={Activity}
            iconColor={avgRisk >= 60 ? '#b91c1c' : '#d97706'}
            valueColor={avgRisk >= 60 ? '#b91c1c' : '#d97706'}
          />
          <StatCard
            label="Active Incidents"
            value={activeIncidents}
            icon={AlertTriangle}
            iconColor="#b91c1c"
            alert={activeIncidents > 3}
          />
          <StatCard
            label="High-Risk Locations"
            value={highRiskLocations.length}
            sub={`of ${state.locations.length} total`}
            icon={MapPin}
            iconColor="#dc2626"
            alert={highRiskLocations.length > 3}
          />
          <StatCard
            label="Coverage Gaps"
            value={coverageGaps.length}
            sub="High-risk, 0 officers"
            icon={Shield}
            iconColor="#b91c1c"
            alert={coverageGaps.length > 0}
          />
          <StatCard
            label="Officers On Duty"
            value={totalOfficers}
            sub={`of ${state.officers.length} total`}
            icon={Users}
            iconColor="#1e3068"
          />
          <StatCard
            label="Avg Response Time"
            value={`${avgResponseTime}m`}
            sub="AI deployment"
            icon={Clock}
            iconColor="#15803d"
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Map + Risk Panel */}
        <div className="flex-1 flex gap-3 p-3 overflow-hidden">
          {/* Map */}
          <div className="flex-1 overflow-hidden">
            <NagpurMap />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3 overflow-hidden" style={{ width: '260px' }}>
            {/* Location detail panel */}
            {state.selectedLocationId ? (
              <div className="flex-1 overflow-hidden">
                <LocationDetailPanel />
              </div>
            ) : (
              /* High-risk ranking */
              <div className="flex-1 card overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-red-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Risk Ranking</span>
                  </div>
                  <button
                    className="text-xs text-blue-700 hover:underline"
                    onClick={() => setView('traffic-risk')}
                  >
                    Full view →
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {sortedRisk.map((loc, i) => {
                    const gap = loc.riskLevel === 'High' && loc.officersAssigned === 0;
                    return (
                      <button
                        key={loc.id}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                        onClick={() => selectLocation(loc.id)}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: loc.riskLevel === 'High' ? '#fee2e2' : loc.riskLevel === 'Medium' ? '#fef3c7' : '#dcfce7',
                            color: loc.riskLevel === 'High' ? '#b91c1c' : loc.riskLevel === 'Medium' ? '#b45309' : '#15803d',
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-slate-700 truncate">{loc.shortName}</span>
                            {gap && (
                              <span title="Coverage gap" className="flex-shrink-0 flex items-center">
                                <AlertTriangle size={9} className="text-red-600" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{loc.area}</div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span
                            className="text-sm font-bold font-mono"
                            style={{ color: loc.riskLevel === 'High' ? '#b91c1c' : loc.riskLevel === 'Medium' ? '#b45309' : '#15803d' }}
                          >
                            {loc.riskScore}
                          </span>
                          <RiskBadge level={loc.riskLevel} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coverage Gaps alert */}
            {coverageGaps.length > 0 && (
              <div className="card border-red-200 bg-red-50 p-3 flex-shrink-0">
                <div className="flex items-center gap-1 mb-2">
                  <AlertTriangle size={12} className="text-red-700" />
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wide">
                    Coverage Gaps ({coverageGaps.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {coverageGaps.map(loc => (
                    <button
                      key={loc.id}
                      className="w-full text-left flex justify-between items-center px-2 py-1 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
                      onClick={() => selectLocation(loc.id)}
                    >
                      <span className="text-xs font-semibold text-red-800">{loc.shortName}</span>
                      <span className="text-xs text-red-600 font-mono">Risk: {loc.riskScore}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="mt-2 w-full text-xs text-white bg-red-700 hover:bg-red-800 rounded py-1 transition-colors font-semibold"
                  onClick={() => setView('deployment')}
                >
                  View Deployment Recommendations →
                </button>
              </div>
            )}

            {/* Recent incidents */}
            <div className="card flex-shrink-0 overflow-hidden" style={{ maxHeight: '180px' }}>
              <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Siren size={11} className="text-red-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Incidents</span>
                </div>
                <button
                  className="text-xs text-blue-700 hover:underline"
                  onClick={() => setView('incidents')}
                >
                  All →
                </button>
              </div>
              <div className="overflow-y-auto divide-y divide-slate-100" style={{ maxHeight: '140px' }}>
                {state.incidents.slice(0, 5).map(inc => (
                  <div key={inc.id} className="flex items-center gap-2 px-3 py-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-700 truncate">{inc.type}</span>
                        <SeverityBadge severity={inc.severity} />
                      </div>
                      <div className="text-xs text-slate-400 truncate">{inc.locationName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
