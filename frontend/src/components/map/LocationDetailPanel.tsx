import React from 'react';
import { X, MapPin, AlertTriangle, Users, Activity, Shield, TrendingUp } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { RiskBadge } from '../common/Badge';

export default function LocationDetailPanel() {
  const { state, selectLocation } = useApp();

  if (!state.selectedLocationId) return null;

  const loc = state.locations.find(l => l.id === state.selectedLocationId);
  if (!loc) return null;

  const incidents = state.incidents.filter(
    i => i.locationId === loc.id && (i.status === 'Active' || i.status === 'Responding')
  );

  const isCoverageGap = loc.riskLevel === 'High' && loc.officersAssigned === 0;
  const officerDeficit = loc.recommendedOfficers - loc.officersAssigned;

  return (
    <div className="card flex flex-col overflow-hidden" style={{ height: '100%' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-slate-200"
        style={{ background: '#1e3068' }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Location Detail
          </span>
        </div>
        <button
          onClick={() => selectLocation(null)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Name and risk */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-tight">{loc.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{loc.area} · {loc.corridor}</p>
          <div className="flex items-center gap-2 mt-2">
            <RiskBadge level={loc.riskLevel} score={loc.riskScore} showScore />
            {isCoverageGap && (
              <span className="badge badge-red flex items-center gap-1">
                <AlertTriangle size={9} />
                COVERAGE GAP
              </span>
            )}
          </div>
        </div>

        {/* Risk score bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Risk Score</span>
            <span className="font-mono font-semibold text-slate-700">{loc.riskScore} / 100</span>
          </div>
          <div className="w-full bg-slate-100 rounded h-2">
            <div
              className="h-2 rounded transition-all"
              style={{
                width: `${loc.riskScore}%`,
                backgroundColor: loc.riskLevel === 'High' ? '#dc2626' : loc.riskLevel === 'Medium' ? '#d97706' : '#15803d',
              }}
            />
          </div>
        </div>

        {/* Traffic */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-100 rounded p-2">
            <div className="text-xs text-slate-500">Traffic Condition</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{loc.trafficCondition}</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded p-2">
            <div className="text-xs text-slate-500">Avg Speed</div>
            <div className="text-xs font-semibold font-mono text-slate-700 mt-0.5">{loc.avgSpeedKmh} km/h</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded p-2">
            <div className="text-xs text-slate-500">Volume</div>
            <div className="text-xs font-semibold font-mono text-slate-700 mt-0.5">{loc.volumePcuHr} PCU/hr</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded p-2">
            <div className="text-xs text-slate-500">Queue Length</div>
            <div className="text-xs font-semibold font-mono text-slate-700 mt-0.5">{loc.queueLengthM} m</div>
          </div>
        </div>

        {/* Police Coverage */}
        <div className="border border-slate-200 rounded p-2">
          <div className="flex items-center gap-1 mb-2">
            <Shield size={12} className="text-navy-700" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Police Coverage</span>
          </div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-500">Currently Assigned</span>
            <span className={`text-sm font-bold font-mono ${loc.officersAssigned === 0 ? 'text-red-700' : 'text-slate-800'}`}>
              {loc.officersAssigned}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-500">Recommended</span>
            <span className="text-sm font-bold font-mono text-slate-800">{loc.recommendedOfficers}</span>
          </div>
          {officerDeficit > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-700 bg-red-50 border border-red-100 rounded p-1.5">
              <TrendingUp size={10} />
              <span className="font-medium">{officerDeficit} additional officer{officerDeficit > 1 ? 's' : ''} needed</span>
            </div>
          )}
        </div>

        {/* Active Incidents */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle size={12} className="text-red-600" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Active Incidents ({incidents.length})
            </span>
          </div>
          {incidents.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No active incidents at this location.</p>
          ) : (
            <div className="space-y-1.5">
              {incidents.map(inc => (
                <div key={inc.id} className="bg-red-50 border border-red-100 rounded p-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-red-800">{inc.type}</span>
                    <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>{inc.severity}</span>
                  </div>
                  <p className="text-xs text-red-700 mt-0.5 truncate-2">{inc.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Factors */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Activity size={12} className="text-amber-600" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Risk Factors</span>
          </div>
          <ul className="space-y-1">
            {loc.riskFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                <span className="text-amber-500 mt-0.5">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Deployment summary */}
        <div className="border border-slate-200 rounded p-2">
          <div className="flex items-center gap-1 mb-2">
            <Users size={12} className="text-navy-700" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Deployment</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Current</span>
            <span className="font-semibold">{loc.officersAssigned} officer{loc.officersAssigned !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Recommended (AI)</span>
            <span className="font-semibold text-blue-700">{loc.recommendedOfficers} officer{loc.recommendedOfficers !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
