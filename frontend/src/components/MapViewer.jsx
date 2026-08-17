import React from 'react';
import { Navigation, Compass, Layers, Zap } from 'lucide-react';

export default function MapViewer({ junctions, selectedJunction, onSelectJunction }) {
  // Mapping GPS coordinates to SVG canvas viewBox (79.05 to 79.13 Lng, 21.10 to 21.21 Lat)
  // Origin lat/lng bounding box:
  const minLng = 79.055;
  const maxLng = 79.125;
  const minLat = 21.105;
  const maxLat = 21.205;

  const width = 800;
  const height = 560;

  const getSvgCoords = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * (width - 120) + 60;
    // Invert Y axis for SVG
    const y = height - (((lat - minLat) / (maxLat - minLat)) * (height - 120) + 60);
    return { x, y };
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'severe': return '#f43f5e';
      case 'heavy': return '#fb7185';
      case 'moderate': return '#f59e0b';
      case 'normal':
      default: return '#10b981';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Map Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
            NAGPUR URBAN CORRIDOR TWIN
          </h2>
          <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>
            Interactive GIS Node Grid
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Normal
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Moderate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} /> Congested
          </div>
        </div>
      </div>

      {/* SVG GIS Schematic Visualizer */}
      <div style={{
        background: 'radial-gradient(circle at 50% 50%, #0d1527 0%, #060913 100%)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        height: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Grid Background Effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.8,
          pointerEvents: 'none'
        }} />

        {/* Zero Mile Marker Pin */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Navigation size={12} color="var(--accent-cyan)" />
          <span>Zero Mile Datum (21.1458° N, 79.0882° E)</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          {/* Arterial Connecting Paths */}
          {/* Wardha Road Corridor: Variety -> Rahate -> Ajni -> Chhatrapati */}
          {(() => {
            const sitabuldi = getSvgCoords(21.1466, 79.0831);
            const rahate = getSvgCoords(21.1270, 79.0760);
            const ajni = getSvgCoords(21.1180, 79.0790);
            const chhatrapati = getSvgCoords(21.1105, 79.0690);
            const rbi = getSvgCoords(21.1525, 79.0864);
            const lawCollege = getSvgCoords(21.1528, 79.0620);
            const shankar = getSvgCoords(21.1396, 79.0625);
            const telExchange = getSvgCoords(21.1490, 79.1170);
            const medical = getSvgCoords(21.1340, 79.0970);
            const autoSq = getSvgCoords(21.1980, 79.1020);

            return (
              <g stroke="rgba(6, 182, 212, 0.3)" strokeWidth="3" strokeDasharray="6 4" fill="none">
                {/* Wardha Road Spine */}
                <path d={`M ${sitabuldi.x} ${sitabuldi.y} L ${rahate.x} ${rahate.y} L ${ajni.x} ${ajni.y} L ${chhatrapati.x} ${chhatrapati.y}`} stroke="#06b6d4" strokeWidth="4" opacity="0.6" />
                {/* Central Avenue Corridor */}
                <path d={`M ${rbi.x} ${rbi.y} L ${telExchange.x} ${telExchange.y}`} stroke="#3b82f6" strokeWidth="3" opacity="0.6" />
                {/* WHC Road Corridor */}
                <path d={`M ${lawCollege.x} ${lawCollege.y} L ${shankar.x} ${shankar.y}`} stroke="#8b5cf6" strokeWidth="3" opacity="0.6" />
                {/* Links */}
                <path d={`M ${rbi.x} ${rbi.y} L ${sitabuldi.x} ${sitabuldi.y}`} />
                <path d={`M ${sitabuldi.x} ${sitabuldi.y} L ${lawCollege.x} ${lawCollege.y}`} />
                <path d={`M ${rbi.x} ${rbi.y} L ${autoSq.x} ${autoSq.y}`} stroke="#f59e0b" strokeWidth="2" opacity="0.4" />
                <path d={`M ${rahate.x} ${rahate.y} L ${medical.x} ${medical.y}`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              </g>
            );
          })()}

          {/* Render Junction Nodes */}
          {junctions.map((j) => {
            const { x, y } = getSvgCoords(j.latitude, j.longitude);
            const isSelected = selectedJunction?.id === j.id;
            const color = getStatusColor(j.congestion_level);

            return (
              <g
                key={j.id}
                onClick={() => onSelectJunction(j)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                {/* Outer animated ripple */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 22 : 15}
                  fill={color}
                  opacity="0.2"
                  style={{ animation: 'pulse 2s infinite' }}
                />
                {/* Selected Halo */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                )}
                {/* Core Junction Node */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 10 : 7}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 3 : 1.5}
                  style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
                {/* Label */}
                <text
                  x={x}
                  y={y - 14}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                  fontSize={isSelected ? '11px' : '9px'}
                  fontWeight={isSelected ? '700' : '600'}
                  fontFamily="var(--font-heading)"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                >
                  {j.name.split(' (')[0]}
                </text>
                {/* Live Speed Tag */}
                <text
                  x={x}
                  y={y + 20}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8px"
                  fontFamily="var(--font-mono)"
                >
                  {j.avg_speed_kmh} km/h
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
