import React from 'react';
import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
}

export function RiskBadge({ level, score, showScore = false }: RiskBadgeProps) {
  const cls =
    level === 'High' ? 'badge-red' :
    level === 'Medium' ? 'badge-amber' :
    'badge-green';

  return (
    <span className={`badge ${cls}`}>
      {level}{showScore && score !== undefined ? ` (${score})` : ''}
    </span>
  );
}

// ─── Generic Status Badge ─────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'amber' | 'green' | 'blue' | 'slate' | 'navy';
}

export function Badge({ children, variant = 'slate' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>{children}</span>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

export function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity === 'Critical' ? 'badge-red' :
    severity === 'Severe' ? 'badge-red' :
    severity === 'Moderate' ? 'badge-amber' :
    'badge-slate';
  return <span className={`badge ${cls}`}>{severity}</span>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Active' ? 'badge-red' :
    status === 'Responding' ? 'badge-amber' :
    status === 'Monitoring' ? 'badge-blue' :
    status === 'Resolved' ? 'badge-green' :
    'badge-slate';
  return <span className={`badge ${cls}`}>{status}</span>;
}

// ─── Availability Badge ───────────────────────────────────────────────────────

export function AvailabilityBadge({ availability }: { availability: string }) {
  const cls =
    availability === 'Available' ? 'badge-green' :
    availability === 'On Duty' ? 'badge-blue' :
    availability === 'On Break' ? 'badge-amber' :
    'badge-slate';
  return <span className={`badge ${cls}`}>{availability}</span>;
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === 'Critical' ? 'badge-red' :
    priority === 'High' ? 'badge-amber' :
    priority === 'Medium' ? 'badge-blue' :
    'badge-slate';
  return <span className={`badge ${cls}`}>{priority}</span>;
}

// ─── Workload Bar ─────────────────────────────────────────────────────────────

export function WorkloadBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#b91c1c' : pct >= 60 ? '#b45309' : '#15803d';
  return (
    <div className="workload-bar" style={{ width: '80px' }}>
      <div
        className="workload-bar-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
