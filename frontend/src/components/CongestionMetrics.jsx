import React from 'react';
import { Gauge, Zap, TrendingUp, AlertTriangle, Car, Truck } from 'lucide-react';

export default function CongestionMetrics({ kpis, junctions }) {
  const avgSpeed = kpis?.city_average_speed_kmh || 32.4;
  const congestionIdx = kpis?.overall_congestion_index || 48.0;
  const activeJunctions = junctions?.length || 10;
  const bottlenecks = kpis?.active_bottlenecks_count || 0;

  // Aggregate vehicle counts
  const totalVehicles = junctions.reduce((acc, j) => {
    if (!j.vehicle_counts) return acc;
    return {
      two_wheeler: acc.two_wheeler + (j.vehicle_counts.two_wheeler || 0),
      car: acc.car + (j.vehicle_counts.car || 0),
      auto: acc.auto + (j.vehicle_counts.auto_rickshaw || 0),
      bus_truck: acc.bus_truck + (j.vehicle_counts.bus || 0) + (j.vehicle_counts.truck || 0)
    };
  }, { two_wheeler: 0, car: 0, auto: 0, bus_truck: 0 });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
      {/* Metric 1: Avg Speed */}
      <div className="glass-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CITY AVERAGE SPEED</span>
          <Gauge size={18} color="var(--accent-cyan)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {avgSpeed.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>km/h</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: avgSpeed > 30 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
          {avgSpeed > 30 ? '↑ +4.2 km/h vs peak baseline' : '↓ Sluggish corridor flow'}
        </div>
      </div>

      {/* Metric 2: Congestion Index */}
      <div className="glass-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONGESTION INDEX</span>
          <TrendingUp size={18} color="var(--accent-amber)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: congestionIdx > 70 ? 'var(--accent-rose)' : congestionIdx > 45 ? 'var(--accent-amber)' : 'var(--accent-emerald)'
          }}>
            {congestionIdx.toFixed(0)}%
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Load</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, congestionIdx)}%`,
            background: congestionIdx > 70 ? 'var(--accent-rose)' : congestionIdx > 45 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Metric 3: Active Signals */}
      <div className="glass-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MONITORED JUNCTIONS</span>
          <Zap size={18} color="var(--accent-emerald)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {activeJunctions}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Adaptive Nodes</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          3 Green Waves Active (Wardha Rd, CA Rd)
        </div>
      </div>

      {/* Metric 4: Bottlenecks */}
      <div className="glass-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE BOTTLENECKS</span>
          <AlertTriangle size={18} color={bottlenecks > 0 ? "var(--accent-rose)" : "var(--accent-emerald)"} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: bottlenecks > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
          }}>
            {bottlenecks}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Intersections</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: bottlenecks > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
          {bottlenecks > 0 ? 'Adaptive intervention triggered' : 'All corridors flowing smoothly'}
        </div>
      </div>
    </div>
  );
}
