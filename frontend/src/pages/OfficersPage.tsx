import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { useApp } from '../store/appStore';
import { AvailabilityBadge, WorkloadBar } from '../components/common/Badge';
import type { OfficerAvailability } from '../types';

export default function OfficersPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<'All' | OfficerAvailability>('All');
  const [search, setSearch] = useState('');

  const filtered = state.officers.filter(o => {
    const matchStatus = filter === 'All' || o.availability === filter;
    const matchSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.badgeNo.toLowerCase().includes(search.toLowerCase()) ||
      o.zone.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const onDuty = state.officers.filter(o => o.availability === 'On Duty').length;
  const available = state.officers.filter(o => o.availability === 'Available').length;
  const onBreak = state.officers.filter(o => o.availability === 'On Break').length;
  const offShift = state.officers.filter(o => o.availability === 'Off Shift').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Activity size={15} className="text-navy-700" />
          Officer Roster
        </h2>
        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {([
              { label: 'All', count: state.officers.length },
              { label: 'On Duty', count: onDuty },
              { label: 'Available', count: available },
              { label: 'On Break', count: onBreak },
              { label: 'Off Shift', count: offShift },
            ] as const).map(({ label, count }) => (
              <button
                key={label}
                onClick={() => setFilter(label as 'All' | OfficerAvailability)}
                className={`px-3 py-1 rounded text-xs font-semibold border transition-colors
                  ${filter === label
                    ? 'bg-navy-800 text-white border-navy-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                style={filter === label ? { backgroundColor: '#1e3068' } : {}}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search name, badge, zone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-auto border border-slate-300 rounded px-2 py-1 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-navy-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Badge No.</th>
                <th>Name</th>
                <th>Rank</th>
                <th>Zone</th>
                <th>Current Assignment</th>
                <th>Availability</th>
                <th>Shift</th>
                <th>Hours on Duty</th>
                <th>Workload</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 py-8">
                    No officers match this filter.
                  </td>
                </tr>
              )}
              {filtered.map(off => (
                <tr key={off.id}>
                  <td className="font-mono text-xs font-semibold text-slate-600">{off.badgeNo}</td>
                  <td className="font-semibold text-xs text-slate-800">{off.name}</td>
                  <td className="text-xs text-slate-500">{off.rank}</td>
                  <td className="text-xs text-slate-500">{off.zone}</td>
                  <td className="text-xs">
                    {off.locationName ? (
                      <span className="text-slate-700 font-medium">{off.locationName}</span>
                    ) : (
                      <span className={`${off.availability === 'Available' ? 'text-green-700 font-semibold' : 'text-slate-400 italic'}`}>
                        {off.availability === 'Available' ? '✓ Available for deployment' : 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td><AvailabilityBadge availability={off.availability} /></td>
                  <td className="font-mono text-xs text-slate-500">{off.shift}</td>
                  <td className="font-mono text-xs text-slate-600">{off.hoursOnDuty} hr</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <WorkloadBar pct={off.workloadPct} />
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{
                          color: off.workloadPct >= 80 ? '#b91c1c' :
                                 off.workloadPct >= 60 ? '#b45309' : '#15803d'
                        }}
                      >
                        {off.workloadPct}%
                      </span>
                    </div>
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
