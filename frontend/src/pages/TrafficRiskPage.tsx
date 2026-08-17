import React, { useState } from 'react';
import { MapPin, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../store/appStore';
import { RiskBadge } from '../components/common/Badge';

type SortKey = 'riskScore' | 'officersAssigned' | 'activeIncidents' | 'name';

export default function TrafficRiskPage() {
  const { state, selectLocation, setView } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [filterLevel, setFilterLevel] = useState<string>('All');

  const filtered = state.locations
    .filter(l => filterLevel === 'All' || l.riskLevel === filterLevel)
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'officersAssigned') return a.officersAssigned - b.officersAssigned;
      if (sortKey === 'activeIncidents') return b.activeIncidents - a.activeIncidents;
      return b.riskScore - a.riskScore;
    });

  const highCount = state.locations.filter(l => l.riskLevel === 'High').length;
  const mediumCount = state.locations.filter(l => l.riskLevel === 'Medium').length;
  const lowCount = state.locations.filter(l => l.riskLevel === 'Low').length;
  const gapCount = state.locations.filter(l => l.riskLevel === 'High' && l.officersAssigned === 0).length;

  const ThHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="cursor-pointer hover:bg-slate-100 select-none"
      onClick={() => setSortKey(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === col && <span className="text-navy-600">↓</span>}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={15} className="text-navy-700" />
              Traffic Risk Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All {state.locations.length} monitored locations · Sorted by risk score
            </p>
          </div>
          <button
            className="text-xs text-white bg-navy-800 hover:bg-navy-900 px-3 py-1.5 rounded font-semibold transition-colors"
            style={{ backgroundColor: '#1e3068' }}
            onClick={() => setView('deployment')}
          >
            → Police Deployment
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2 mt-3">
          {[
            { label: 'All', count: state.locations.length, color: 'slate' },
            { label: 'High', count: highCount, color: 'red' },
            { label: 'Medium', count: mediumCount, color: 'amber' },
            { label: 'Low', count: lowCount, color: 'green' },
          ].map(({ label, count, color }) => (
            <button
              key={label}
              onClick={() => setFilterLevel(label === 'All' ? 'All' : label)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold border transition-colors
                ${filterLevel === (label === 'All' ? 'All' : label)
                  ? color === 'red' ? 'bg-red-600 text-white border-red-600' :
                    color === 'amber' ? 'bg-amber-600 text-white border-amber-600' :
                    color === 'green' ? 'bg-green-700 text-white border-green-700' :
                    'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold
                ${filterLevel === (label === 'All' ? 'All' : label) ? 'bg-white/20' : 'bg-slate-100'}`}
              >
                {count}
              </span>
            </button>
          ))}

          {gapCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-700 ml-auto">
              <AlertTriangle size={11} />
              {gapCount} Coverage Gap{gapCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>#</th>
                <ThHeader col="name" label="Location" />
                <th>Area / Corridor</th>
                <ThHeader col="riskScore" label="Risk Score" />
                <th>Risk Level</th>
                <ThHeader col="officersAssigned" label="Officers" />
                <th>Recommended</th>
                <ThHeader col="activeIncidents" label="Incidents" />
                <th>Traffic</th>
                <th>Speed</th>
                <th>Queue</th>
                <th>Primary Risk Factors</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loc, i) => {
                const gap = loc.riskLevel === 'High' && loc.officersAssigned === 0;
                const deficit = loc.recommendedOfficers - loc.officersAssigned;
                return (
                  <tr
                    key={loc.id}
                    className={gap ? 'bg-red-50' : ''}
                  >
                    <td className="font-mono text-slate-400 text-xs">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-800">{loc.name}</span>
                        {gap && (
                          <span title="Coverage gap" className="flex-shrink-0 flex items-center">
                            <AlertTriangle size={10} className="text-red-600" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-slate-500 text-xs">
                      <div>{loc.area}</div>
                      <div className="text-slate-400">{loc.corridor}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded h-1.5">
                          <div
                            className="h-1.5 rounded"
                            style={{
                              width: `${loc.riskScore}%`,
                              backgroundColor: loc.riskLevel === 'High' ? '#dc2626' : loc.riskLevel === 'Medium' ? '#d97706' : '#15803d',
                            }}
                          />
                        </div>
                        <span
                          className="font-mono font-bold"
                          style={{ color: loc.riskLevel === 'High' ? '#b91c1c' : loc.riskLevel === 'Medium' ? '#b45309' : '#15803d' }}
                        >
                          {loc.riskScore}
                        </span>
                      </div>
                    </td>
                    <td><RiskBadge level={loc.riskLevel} /></td>
                    <td>
                      <span className={`font-mono font-bold ${loc.officersAssigned === 0 ? 'text-red-700' : 'text-slate-700'}`}>
                        {loc.officersAssigned}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-blue-700 font-semibold">{loc.recommendedOfficers}</span>
                      {deficit > 0 && (
                        <span className="text-red-600 font-bold ml-1">(-{deficit})</span>
                      )}
                    </td>
                    <td>
                      {loc.activeIncidents > 0 ? (
                        <span className="badge badge-red">{loc.activeIncidents}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-600">{loc.trafficCondition}</td>
                    <td className="font-mono text-xs">{loc.avgSpeedKmh} km/h</td>
                    <td className="font-mono text-xs">{loc.queueLengthM} m</td>
                    <td className="text-xs text-slate-500 max-w-48">
                      {loc.riskFactors.slice(0, 2).map((f, fi) => (
                        <div key={fi} className="flex items-start gap-1">
                          <span className="text-amber-500 flex-shrink-0">•</span>
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <button
                        onClick={() => { selectLocation(loc.id); setView('control-room'); }}
                        className="text-xs text-blue-700 hover:text-blue-900 font-medium whitespace-nowrap"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
