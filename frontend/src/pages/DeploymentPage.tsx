import React from 'react';
import { Users, CheckCircle, X, ArrowRight, BarChart2 } from 'lucide-react';
import { useApp } from '../store/appStore';
import { AvailabilityBadge, WorkloadBar } from '../components/common/Badge';
import RecommendationCard from '../components/deployment/RecommendationCard';
import { COMPARISON_METRICS } from '../data/mockData';

export default function DeploymentPage() {
  const { state } = useApp();

  const pendingCount = state.deployments.filter(d => d.status === 'Pending').length;
  const approvedCount = state.deployments.filter(d => d.status === 'Approved' || d.status === 'Modified').length;
  const rejectedCount = state.deployments.filter(d => d.status === 'Rejected').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users size={15} className="text-navy-700" />
              Police Deployment Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              AI-generated recommendations · Operator review required before execution
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-500">{pendingCount} Pending</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              <span className="text-slate-500">{approvedCount} Approved</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-500">{rejectedCount} Rejected</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left: Officers table */}
        <div className="flex flex-col overflow-hidden border-r border-slate-200" style={{ width: '42%' }}>
          <div className="flex-shrink-0 px-3 py-2 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Officer Status ({state.officers.length} total)
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Badge</th>
                  <th>Name / Rank</th>
                  <th>Assignment</th>
                  <th>Availability</th>
                  <th>Shift</th>
                  <th>Workload</th>
                </tr>
              </thead>
              <tbody>
                {state.officers.map(off => (
                  <tr key={off.id}>
                    <td className="font-mono text-xs text-slate-500">{off.badgeNo}</td>
                    <td>
                      <div className="font-semibold text-xs text-slate-800">{off.name}</div>
                      <div className="text-xs text-slate-400">{off.rank}</div>
                    </td>
                    <td className="text-xs text-slate-600">
                      {off.locationName ? (
                        <span>{off.locationName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td><AvailabilityBadge availability={off.availability} /></td>
                    <td className="font-mono text-xs text-slate-500">{off.shift}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <WorkloadBar pct={off.workloadPct} />
                        <span className="text-xs font-mono text-slate-500">{off.workloadPct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recommendations + Comparison */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Recommendations */}
          <div className="flex-1 overflow-auto p-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1">
              <ArrowRight size={12} className="text-amber-600" />
              AI Deployment Recommendations ({state.deployments.length})
            </h3>
            <div className="space-y-2">
              {state.deployments.map(dep => (
                <RecommendationCard key={dep.id} deployment={dep} />
              ))}
            </div>
          </div>

          {/* Baseline vs AI comparison */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 p-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <BarChart2 size={12} className="text-navy-700" />
              Baseline vs AI Deployment Comparison
            </h3>
            <div className="card overflow-hidden">
              <table className="data-table" style={{ fontSize: '0.72rem' }}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Baseline (Manual)</th>
                    <th>AI Optimised</th>
                    <th>Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_METRICS.map(m => {
                    const baselineNum = typeof m.baseline === 'number' ? m.baseline : parseFloat(m.baseline);
                    const aiNum = typeof m.ai === 'number' ? m.ai : parseFloat(m.ai);
                    const diff = m.betterIsLower
                      ? baselineNum - aiNum
                      : aiNum - baselineNum;
                    const pct = baselineNum !== 0 ? Math.round(Math.abs(diff) / baselineNum * 100) : 0;
                    const improved = diff > 0;

                    return (
                      <tr key={m.label}>
                        <td className="font-medium text-slate-700">{m.label}</td>
                        <td className="font-mono text-slate-500">{m.baseline} {m.unit}</td>
                        <td className="font-mono font-semibold text-navy-800">{m.ai} {m.unit}</td>
                        <td>
                          <span className={`font-semibold text-xs ${improved ? 'text-green-700' : 'text-red-700'}`}>
                            {improved ? '↑' : '↓'} {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
