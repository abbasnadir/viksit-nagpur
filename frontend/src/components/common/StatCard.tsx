import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  alert?: boolean;
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = '#64748b',
  valueColor,
  alert = false,
}: StatCardProps) {
  return (
    <div
      className={`card px-3 py-2.5 flex items-center gap-2.5 ${alert ? 'border-red-300 bg-red-50' : ''}`}
    >
      {Icon && (
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon size={15} style={{ color: iconColor }} />
        </div>
      )}
      <div className="min-w-0">
        <div
          className="text-lg font-bold leading-tight font-mono"
          style={{ color: valueColor ?? (alert ? '#b91c1c' : '#1e293b') }}
        >
          {value}
        </div>
        <div className="text-xs text-slate-500 leading-tight truncate">{label}</div>
        {sub && <div className="text-xs text-slate-400 leading-tight">{sub}</div>}
      </div>
    </div>
  );
}
