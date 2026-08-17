import React, { useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useApp } from '../store/appStore';
import { SeverityBadge, StatusBadge, Badge } from '../components/common/Badge';
import type { IncidentStatus } from '../types';

export default function IncidentsPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<'All' | IncidentStatus>('All');

  const filtered = state.incidents.filter(i =>
    filter === 'All' ? true : i.status === filter
  );

  const activeCount = state.incidents.filter(i => i.status === 'Active').length;
  const respondingCount = state.incidents.filter(i => i.status === 'Responding').length;
  const monitoringCount = state.incidents.filter(i => i.status === 'Monitoring').length;
  const resolvedCount = state.incidents.filter(i => i.status === 'Resolved').length;

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
          Active and recent incidents · {state.incidents.length} total records
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
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Description</th>
                <th>Reported</th>
                <th>Officer</th>
                <th>Est. Clearance</th>
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
              {filtered.map(inc => (
                <tr
                  key={inc.id}
                  className={
                    inc.status === 'Active' ? 'bg-red-50' :
                    inc.status === 'Responding' ? 'bg-amber-50' :
                    ''
                  }
                >
                  <td className="font-mono text-xs text-slate-400">{inc.id}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <AlertTriangle
                        size={10}
                        className={
                          inc.severity === 'Critical' || inc.severity === 'Severe' ? 'text-red-600' :
                          inc.severity === 'Moderate' ? 'text-amber-600' : 'text-slate-400'
                        }
                      />
                      <span className="font-semibold text-xs">{inc.type}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-700 font-medium">{inc.locationName}</td>
                  <td><SeverityBadge severity={inc.severity} /></td>
                  <td><StatusBadge status={inc.status} /></td>
                  <td className="text-xs text-slate-600 max-w-56 truncate-2">{inc.description}</td>
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
                      <span className="font-mono text-slate-600">{inc.estimatedClearanceMin} min</span>
                    ) : (
                      <span className="badge badge-green">Cleared</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
