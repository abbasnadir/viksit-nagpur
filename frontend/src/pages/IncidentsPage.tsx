import React, { useState } from 'react';
import { AlertTriangle, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useApp } from '../store/appStore';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import type { IncidentStatus } from '../types';

export default function IncidentsPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<'All' | IncidentStatus>('All');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = state.incidents.filter(i =>
    filter === 'All' ? true : i.status === filter
  );

  const activeCount = state.incidents.filter(i => i.status === 'Active').length;
  const respondingCount = state.incidents.filter(i => i.status === 'Responding').length;
  const monitoringCount = state.incidents.filter(i => i.status === 'Monitoring').length;
  const resolvedCount = state.incidents.filter(i => i.status === 'Resolved').length;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m ago`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-600" />
          Incident Management
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Active and recent incidents · {state.incidents.length} total records · Click any description to view full details
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-3">
          {([
            { label: 'All', count: state.incidents.length },
            { label: 'Active', count: activeCount },
            { label: 'Responding', count: respondingCount },
            { label: 'Monitoring', count: monitoringCount },
            { label: 'Resolved', count: resolvedCount },
          ] as const).map(({ label, count }) => (
            <button
              key={label}
              onClick={() => setFilter(label as 'All' | IncidentStatus)}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-colors
                ${filter === label
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              style={filter === label ? { backgroundColor: '#1e3068' } : {}}
            >
              {label} <span className="ml-1 opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '85px' }}>ID</th>
                <th style={{ width: '130px' }}>Type</th>
                <th style={{ width: '170px' }}>Location</th>
                <th style={{ width: '90px' }}>Severity</th>
                <th style={{ width: '110px' }}>Status</th>
                <th>Description (Click to expand)</th>
                <th style={{ width: '100px' }}>Reported</th>
                <th style={{ width: '110px' }}>Officer</th>
                <th style={{ width: '110px' }}>Est. Clearance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 py-8">
                    No incidents match this filter.
                  </td>
                </tr>
              )}
              {filtered.map(inc => {
                const isExpanded = expandedIds.has(inc.id);
                const shortDesc = inc.shortDescription || inc.description.split('.')[0] || inc.description;

                return (
                  <tr
                    key={inc.id}
                    className={
                      inc.status === 'Active'
                        ? 'bg-red-50/70 hover:bg-red-50'
                        : inc.status === 'Responding'
                        ? 'bg-amber-50/70 hover:bg-amber-50'
                        : 'hover:bg-slate-50'
                    }
                  >
                    <td className="font-mono text-xs text-slate-400 font-semibold">{inc.id}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle
                          size={11}
                          className={
                            inc.severity === 'Critical' || inc.severity === 'Severe'
                              ? 'text-red-600'
                              : inc.severity === 'Moderate'
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }
                        />
                        <span className="font-semibold text-xs text-slate-800">{inc.type}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-800 font-medium">{inc.locationName}</td>
                    <td>
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td>
                      <StatusBadge status={inc.status} />
                    </td>
                    {/* Interactive Concise / Expanded Description */}
                    <td className="max-w-md">
                      <button
                        type="button"
                        onClick={() => toggleExpand(inc.id)}
                        className="text-left w-full group focus:outline-none"
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium group-hover:text-navy-900 transition-colors">
                          <span className="truncate group-hover:underline underline-offset-2">
                            {shortDesc}
                          </span>
                          <span className="flex-shrink-0 text-slate-400 group-hover:text-navy-700 bg-slate-100 group-hover:bg-slate-200 rounded p-0.5 transition-colors">
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </span>
                        </div>
                      </button>

                      {/* Full Expanded Description Drawer */}
                      {isExpanded && (
                        <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded shadow-xs text-xs text-slate-700 space-y-1 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                            <span className="flex items-center gap-1">
                              <Info size={11} className="text-navy-700" />
                              Full Incident Report
                            </span>
                          </div>
                          <p className="pt-1 text-slate-700 leading-relaxed font-normal">
                            {inc.description}
                          </p>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={10} />
                        {formatTime(inc.reportedAt)}
                      </div>
                    </td>
                    <td className="font-mono text-xs">
                      {inc.officerAssigned ? (
                        <span className="badge badge-navy">{inc.officerAssigned}</span>
                      ) : (
                        <span className="text-red-600 font-semibold text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="text-xs">
                      {inc.estimatedClearanceMin ? (
                        <span className="font-mono text-slate-600 font-medium">
                          {inc.estimatedClearanceMin} min
                        </span>
                      ) : (
                        <span className="badge badge-green">Cleared</span>
                      )}
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
