import React from 'react';
import { Shield, Clock, Wifi, Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/appStore';

export default function Header() {
  const { state, logout } = useApp();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const activeIncidents = state.incidents.filter(i => i.status === 'Active' || i.status === 'Responding').length;

  return (
    <header className="flex-shrink-0 bg-navy-900 text-white border-b border-navy-800" style={{ height: '56px' }}>
      <div className="flex items-center h-full px-4">
        {/* Emblem + Brand */}
        <div className="flex items-center gap-3 border-r border-navy-700 pr-4">
          {/* Government emblem placeholder */}
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-navy-900" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight tracking-wide">VIKSIT NAGPUR</div>
            <div className="text-xs text-navy-300 leading-tight">Intelligent Traffic Management System</div>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 border-r border-navy-700 px-4">
          <span className="flex items-center gap-1 text-xs">
            <Wifi size={12} className="text-green-400" />
            <span className="text-green-400 font-medium">SYSTEM ONLINE</span>
          </span>
        </div>

        {/* Sub-heading */}
        <div className="px-4 border-r border-navy-700">
          <span className="text-xs text-navy-300 font-medium uppercase tracking-wider">
            Nagpur Traffic Police · Control Room
          </span>
        </div>

        <div className="flex-1" />

        {/* Active Incidents indicator */}
        {activeIncidents > 0 && (
          <div className="flex items-center gap-1.5 bg-red-900/60 border border-red-700 px-3 py-1 rounded mr-4">
            <Bell size={12} className="text-red-400" />
            <span className="text-xs font-semibold text-red-300">{activeIncidents} ACTIVE INCIDENTS</span>
          </div>
        )}

        {/* Date/Time */}
        <div className="flex items-center gap-2 border-r border-navy-700 pr-4 mr-4">
          <Clock size={13} className="text-navy-400" />
          <div className="text-right">
            <div className="text-xs font-mono font-medium leading-tight">{formatTime(time)}</div>
            <div className="text-xs text-navy-400 leading-tight">{formatDate(time)}</div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-navy-400 border-r border-navy-700 pr-4 mr-4">
          <span className="block">Last updated</span>
          <span className="font-mono text-navy-300">
            {state.lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>

        {/* Operator */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-navy-200 hover:text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <span>{state.operatorName}</span>
          <ChevronDown size={12} className="text-navy-400" />
        </button>
      </div>
    </header>
  );
}
