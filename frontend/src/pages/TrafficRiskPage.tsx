import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  Gauge,
  Clock,
  ChevronRight,
  X,
  Radio,
} from 'lucide-react';
import { useApp } from '../store/appStore';
import { RiskBadge, SeverityBadge } from '../components/common/Badge';

type SortKey = 'riskScore' | 'officersAssigned' | 'activeIncidents' | 'name';

export default function TrafficRiskPage() {
  const { state, selectLocation, setView } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  
  // Local selected location for side panel (default to first or global selected)
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(
    state.selectedLocationId || (state.locations[0]?.id ?? null)
  );

  const filtered = state.locations
    .filter(l => filterLevel === 'All' || l.riskLevel === filterLevel)
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'officersAssigned') return a.officersAssigned - b.officersAssigned;
      if (sortKey === 'activeIncidents') return b.activeIncidents - a.activeIncidents;
      return b.riskScore - a.riskScore;
    });

  const selectedLoc = state.locations.find(l => l.id === localSelectedId) || filtered[0] || null;

  const highCount = state.locations.filter(l => l.riskLevel === 'High').length;
  const mediumCount = state.locations.filter(l => l.riskLevel === 'Medium').length;
  const lowCount = state.locations.filter(l => l.riskLevel === 'Low').length;
  const gapCount = state.locations.filter(l => l.riskLevel === 'High' && l.officersAssigned === 0).length;

  const locIncidents = selectedLoc
    ? state.incidents.filter(i => i.locationId === selectedLoc.id && (i.status === 'Active' || i.status === 'Responding'))
    : [];

  const isGap = selectedLoc ? selectedLoc.riskLevel === 'High' && selectedLoc.officersAssigned === 0 : false;
  const deficit = selectedLoc ? selectedLoc.recommendedOfficers - selectedLoc.officersAssigned : 0;

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

      {/* Main split layout: Table on Left + Location Details Side Panel on Right */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Cleaned Table */}
        <div className="flex-1 card overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}>#</th>
                  <ThHeader col="name" label="Location" />
                  <ThHeader col="riskScore" label="Risk Score" />
                  <th>Risk Level</th>
                  <ThHeader col="officersAssigned" label="Officers" />
                  <th>Recommended</th>
                  <ThHeader col="activeIncidents" label="Incidents" />
                  <th>Traffic Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loc, i) => {
                  const gap = loc.riskLevel === 'High' && loc.officersAssigned === 0;
                  const isSelected = selectedLoc?.id === loc.id;
                  const deficitNum = loc.recommendedOfficers - loc.officersAssigned;

                  return (
                    <tr
                      key={loc.id}
                      onClick={() => setLocalSelectedId(loc.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-navy-50 font-medium'
                          : gap
                          ? 'bg-red-50/70 hover:bg-red-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="font-mono text-slate-400 text-xs">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold text-xs ${isSelected ? 'text-navy-900 font-bold' : 'text-slate-800'}`}>
                            {loc.name}
                          </span>
                          {gap && (
                            <span title="Coverage gap" className="flex-shrink-0 flex items-center">
                              <AlertTriangle size={10} className="text-red-600" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded h-1.5">
                            <div
                              className="h-1.5 rounded"
                              style={{
                                width: `${loc.riskScore}%`,
                                backgroundColor:
                                  loc.riskLevel === 'High'
                                    ? '#dc2626'
                                    : loc.riskLevel === 'Medium'
                                    ? '#d97706'
                                    : '#15803d',
                              }}
                            />
                          </div>
                          <span
                            className="font-mono font-bold"
                            style={{
                              color:
                                loc.riskLevel === 'High'
                                  ? '#b91c1c'
                                  : loc.riskLevel === 'Medium'
                                  ? '#b45309'
                                  : '#15803d',
                            }}
                          >
                            {loc.riskScore}
                          </span>
                        </div>
                      </td>
                      <td>
                        <RiskBadge level={loc.riskLevel} />
                      </td>
                      <td>
                        <span
                          className={`font-mono font-bold ${
                            loc.officersAssigned === 0 ? 'text-red-700' : 'text-slate-700'
                          }`}
                        >
                          {loc.officersAssigned}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-blue-700 font-semibold">{loc.recommendedOfficers}</span>
                        {deficitNum > 0 && (
                          <span className="text-red-600 font-bold ml-1">(-{deficitNum})</span>
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
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalSelectedId(loc.id);
                          }}
                          className={`text-xs px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                            isSelected
                              ? 'bg-navy-800 text-white font-medium'
                              : 'text-blue-700 hover:bg-blue-50 font-medium'
                          }`}
                          style={isSelected ? { backgroundColor: '#1e3068' } : {}}
                        >
                          {isSelected ? 'Selected' : 'Details →'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Details Side Panel */}
        <div className="card flex flex-col overflow-hidden flex-shrink-0" style={{ width: '340px' }}>
          {selectedLoc ? (
            <>
              {/* Panel Header */}
              <div
                className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200"
                style={{ background: '#1e3068' }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Location Details
                  </span>
                </div>
                <button
                  onClick={() => {
                    selectLocation(selectedLoc.id);
                    setView('control-room');
                  }}
                  className="text-xs text-blue-200 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Map View</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Title & Area/Corridor */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">
                    {selectedLoc.name}
                  </h3>
                  <div className="mt-1 bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-xs text-slate-600">
                    <div><span className="text-slate-400 font-semibold uppercase text-[10px]">Area:</span> {selectedLoc.area}</div>
                    <div className="mt-0.5"><span className="text-slate-400 font-semibold uppercase text-[10px]">Corridor:</span> {selectedLoc.corridor}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <RiskBadge level={selectedLoc.riskLevel} score={selectedLoc.riskScore} showScore />
                    {isGap && (
                      <span className="badge badge-red flex items-center gap-1">
                        <AlertTriangle size={9} />
                        COVERAGE GAP
                      </span>
                    )}
                  </div>
                </div>

                {/* Risk Score Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Calculated Risk Index</span>
                    <span className="font-mono font-semibold text-slate-700">{selectedLoc.riskScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded h-2">
                    <div
                      className="h-2 rounded transition-all"
                      style={{
                        width: `${selectedLoc.riskScore}%`,
                        backgroundColor:
                          selectedLoc.riskLevel === 'High'
                            ? '#dc2626'
                            : selectedLoc.riskLevel === 'Medium'
                            ? '#d97706'
                            : '#15803d',
                      }}
                    />
                  </div>
                </div>

                {/* Telemetry Grid: Speed, Queue, Volume, Condition */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Gauge size={12} className="text-navy-700" />
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Live Telemetry
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 border border-slate-100 rounded p-2">
                      <div className="text-xs text-slate-500">Average Speed</div>
                      <div className="text-xs font-semibold font-mono text-slate-800 mt-0.5">
                        {selectedLoc.avgSpeedKmh} km/h
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2">
                      <div className="text-xs text-slate-500">Queue Length</div>
                      <div className="text-xs font-semibold font-mono text-slate-800 mt-0.5">
                        {selectedLoc.queueLengthM} m
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2">
                      <div className="text-xs text-slate-500">Vehicle Volume</div>
                      <div className="text-xs font-semibold font-mono text-slate-800 mt-0.5">
                        {selectedLoc.volumePcuHr} PCU/h
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2">
                      <div className="text-xs text-slate-500">Traffic Flow</div>
                      <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                        {selectedLoc.trafficCondition}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Risk Factors */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Activity size={12} className="text-amber-600" />
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Primary Risk Factors ({selectedLoc.riskFactors.length})
                    </span>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded p-2.5 space-y-1.5">
                    {selectedLoc.riskFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <span className="text-amber-600 font-bold leading-none mt-0.5">•</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Police Coverage Summary */}
                <div className="border border-slate-200 rounded p-2.5">
                  <div className="flex items-center gap-1 mb-2">
                    <Shield size={12} className="text-navy-700" />
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Officer Deployment
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-500">Assigned On Duty</span>
                    <span className={`font-mono font-bold ${selectedLoc.officersAssigned === 0 ? 'text-red-700' : 'text-slate-800'}`}>
                      {selectedLoc.officersAssigned}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-500">AI Target Allocation</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedLoc.recommendedOfficers}
                    </span>
                  </div>
                  {deficit > 0 && (
                    <div className="mt-1.5 text-xs text-red-700 bg-red-50 border border-red-100 rounded p-1.5 font-medium">
                      ⚠ Deficit of {deficit} officer{deficit > 1 ? 's' : ''} at this junction
                    </div>
                  )}
                </div>

                {/* Active Incidents */}
                {locIncidents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <AlertTriangle size={12} className="text-red-600" />
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Active Incidents ({locIncidents.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {locIncidents.map(inc => (
                        <div key={inc.id} className="bg-red-50 border border-red-100 rounded p-2">
                          <div className="flex justify-between">
                            <span className="text-xs font-semibold text-red-800">{inc.type}</span>
                            <SeverityBadge severity={inc.severity} />
                          </div>
                          <p className="text-xs text-red-700 mt-0.5 truncate-2">{inc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MapPin size={28} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Select a Location</p>
              <p className="text-xs text-slate-400 mt-1">
                Click any row in the table to inspect telemetry, area corridor, queue, and risk factors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
