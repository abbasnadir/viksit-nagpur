import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, Radio, MapPin } from 'lucide-react';

export default function Header({ isLive, activeIncidentsCount }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
        }}>
          <Cpu size={24} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              NAGPUR <span style={{ color: 'var(--accent-cyan)' }}>TRAFFIC AI</span>
            </h1>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(6, 182, 212, 0.2)',
              color: 'var(--accent-cyan)',
              fontWeight: 700
            }}>
              v1.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> Zero Mile Urban Mobility & Adaptive Signal Command
          </p>
        </div>
      </div>

      {/* Status & Live Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Live Pulse */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isLive ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            boxShadow: isLive ? '0 0 10px var(--accent-emerald)' : 'none',
            animation: isLive ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isLive ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {isLive ? 'TELEMETRY STREAM LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Incidents Warning */}
        {activeIncidentsCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: 'var(--accent-rose)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <ShieldAlert size={14} />
            <span>{activeIncidentsCount} HIGH BOTTLENECK{activeIncidentsCount > 1 ? 'S' : ''}</span>
          </div>
        )}

        {/* Clock */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          {time} IST
        </div>
      </div>
    </header>
  );
}
