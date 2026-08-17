import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Activity,
  BarChart2,
  MessageSquare,
  MapPin,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../../store/appStore';
import type { NavView } from '../../types';

const NAV_ITEMS: { id: NavView; label: string; icon: LucideIcon }[] = [
  { id: 'control-room',    label: 'Control Room',      icon: LayoutDashboard },
  { id: 'traffic-risk',    label: 'Traffic Risk',       icon: MapPin },
  { id: 'deployment',      label: 'Police Deployment',  icon: Users },
  { id: 'incidents',       label: 'Incidents',          icon: AlertTriangle },
  { id: 'officers',        label: 'Officers',           icon: Activity },
  { id: 'analytics',       label: 'Analytics',          icon: BarChart2 },
  { id: 'citizen-reports', label: 'Citizen Reports',    icon: MessageSquare },
];

export default function Sidebar() {
  const { state, setView } = useApp();

  const activeIncidents = state.incidents.filter(
    i => i.status === 'Active' || i.status === 'Responding'
  ).length;

  const pendingDeployments = state.deployments.filter(d => d.status === 'Pending').length;

  const getBadge = (id: NavView) => {
    if (id === 'incidents' && activeIncidents > 0) return activeIncidents;
    if (id === 'deployment' && pendingDeployments > 0) return pendingDeployments;
    return null;
  };

  return (
    <aside
      className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col"
      style={{ width: '200px' }}
    >
      {/* Sidebar header */}
      <div className="px-3 py-3 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = state.currentView === item.id;
          const badge = getBadge(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors
                ${isActive
                  ? 'bg-navy-50 text-navy-800 border-r-2 border-navy-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <Icon
                size={15}
                className={isActive ? 'text-navy-700' : 'text-slate-400'}
              />
              <span className="flex-1 text-xs">{item.label}</span>
              {badge !== null && (
                <span className="badge badge-red text-xs" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {badge}
                </span>
              )}
              {isActive && (
                <ChevronRight size={12} className="text-navy-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* System info footer */}
      <div className="border-t border-slate-200 px-3 py-3">
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          v2.4.1 · NTP-ITMS
        </p>
        <p className="text-xs text-slate-400">
          MahaIT · Smart City Mission
        </p>
      </div>
    </aside>
  );
}
