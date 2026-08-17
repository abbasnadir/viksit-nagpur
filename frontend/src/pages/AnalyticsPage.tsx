import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import {
  RISK_DISTRIBUTION,
  RESPONSE_TIME_DATA,
  WORKLOAD_DATA,
  PERFORMANCE_COMPARISON,
  COMPARISON_METRICS,
} from '../data/mockData';

const COLORS = { Low: '#15803d', Medium: '#d97706', High: '#dc2626' };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 size={15} className="text-navy-700" />
          Analytics Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Performance metrics · Risk analysis · AI vs Baseline comparison
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4">

          {/* Chart 1: Risk Distribution */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Risk Level Distribution
            </h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {RISK_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: '11px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {RISK_DISTRIBUTION.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-slate-600">{d.name} Risk</span>
                    <span className="text-xs font-bold font-mono ml-auto">{d.value}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Total Locations</span>
                    <span className="text-xs font-bold ml-auto">15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Response Time Trend */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Avg. Response Time — Baseline vs AI (minutes)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={RESPONSE_TIME_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} unit="m" />
                <Tooltip contentStyle={{ fontSize: '11px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ai"
                  name="AI Optimised"
                  stroke="#1e3068"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Officer Workload */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Officer Workload Distribution (%)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={WORKLOAD_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} unit="%" />
                <YAxis type="category" dataKey="officer" tick={{ fontSize: 9 }} width={70} />
                <Tooltip contentStyle={{ fontSize: '11px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="workload" name="Workload" radius={[0, 2, 2, 0]}>
                  {WORKLOAD_DATA.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.workload >= 80 ? '#dc2626' : entry.workload >= 60 ? '#d97706' : '#15803d'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Performance Comparison */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              AI vs Baseline — Performance Score (%)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={PERFORMANCE_COMPARISON}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: '11px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="baseline" name="Baseline" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ai" name="AI Optimised" fill="#1e3068" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics table spanning full width */}
          <div className="card p-4 col-span-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Detailed Metrics Comparison
            </h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Baseline (Manual Deployment)</th>
                  <th>AI-Optimised Deployment</th>
                  <th>Unit</th>
                  <th>Improvement</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_METRICS.map(m => {
                  const baseN = typeof m.baseline === 'number' ? m.baseline : parseFloat(m.baseline);
                  const aiN = typeof m.ai === 'number' ? m.ai : parseFloat(m.ai);
                  const diff = m.betterIsLower ? baseN - aiN : aiN - baseN;
                  const pct = baseN !== 0 ? Math.round(Math.abs(diff) / baseN * 100) : 0;
                  const improved = diff > 0;
                  return (
                    <tr key={m.label}>
                      <td className="font-medium text-slate-700">{m.label}</td>
                      <td className="font-mono text-slate-500">{m.baseline}</td>
                      <td className="font-mono font-semibold text-navy-800">{m.ai}</td>
                      <td className="text-xs text-slate-400">{m.unit}</td>
                      <td>
                        <span className={`font-bold text-sm ${improved ? 'text-green-700' : 'text-red-700'}`}>
                          {improved ? '▲' : '▼'} {pct}% {improved ? 'better' : 'worse'}
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
  );
}
