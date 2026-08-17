import React, { useState, useRef } from 'react';
import { useApp } from '../../store/appStore';
import type { Location } from '../../types';

// SVG roads approximating Nagpur's major corridors within a 500×400 viewBox
const ROADS = [
  // Wardha Road (N-S arterial, western side)
  { d: 'M 175 60 L 175 380', stroke: '#94a3b8', width: 3 },
  // Ring Road (partial)
  { d: 'M 80 250 Q 175 320 280 330 Q 360 340 420 280', stroke: '#94a3b8', width: 2.5 },
  // Central Avenue (CA Road) – E-W
  { d: 'M 60 195 L 420 195', stroke: '#94a3b8', width: 3 },
  // Amravati Road (NW corridor)
  { d: 'M 80 120 L 240 185', stroke: '#94a3b8', width: 2.5 },
  // WHC Road (N-S, Dharampeth)
  { d: 'M 148 120 L 148 290', stroke: '#94a3b8', width: 2 },
  // Umred Road (E)
  { d: 'M 280 195 L 420 220', stroke: '#94a3b8', width: 2 },
  // Kamptee Road (NE)
  { d: 'M 242 185 L 295 80', stroke: '#94a3b8', width: 2 },
  // NH-44 South
  { d: 'M 175 320 L 142 380', stroke: '#94a3b8', width: 2 },
  // Great Nag Road
  { d: 'M 242 195 L 280 225', stroke: '#94a3b8', width: 2 },
  // Mahal/Itwari connector
  { d: 'M 258 185 L 285 195', stroke: '#94a3b8', width: 1.5 },
];

const getRiskColor = (level: string, score: number) => {
  if (level === 'High') return score >= 85 ? '#991b1b' : '#dc2626';
  if (level === 'Medium') return '#d97706';
  return '#15803d';
};

const getRiskFill = (level: string) => {
  if (level === 'High') return '#fee2e2';
  if (level === 'Medium') return '#fef3c7';
  return '#dcfce7';
};

interface Tooltip {
  x: number;
  y: number;
  location: Location;
}

export default function NagpurMap() {
  const { state, selectLocation, coverageGaps } = useApp();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedLocation = state.selectedLocationId
    ? state.locations.find(l => l.id === state.selectedLocationId)
    : null;

  const handleLocationClick = (loc: Location) => {
    selectLocation(loc.id === state.selectedLocationId ? null : loc.id);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGCircleElement>, loc: Location) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 40,
      location: loc,
    });
  };

  const isCoverageGap = (locId: string) => coverageGaps.some(g => g.id === locId);

  return (
    <div className="card flex flex-col" style={{ height: '100%' }}>
      {/* Map header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nagpur City — Risk Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Click a location to inspect</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
            <span className="text-slate-500">Low</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-500">Medium</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            <span className="text-slate-500">High</span>
          </span>
          <span className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <span className="inline-block w-3 h-3 border-2 border-dashed border-red-600 rounded-full" />
            <span className="text-slate-500">No Coverage</span>
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="flex-1 relative overflow-hidden bg-slate-50">
        <svg
          ref={svgRef}
          viewBox="60 60 400 330"
          className="w-full h-full"
          style={{ display: 'block' }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Background */}
          <rect x="60" y="60" width="400" height="330" fill="#f8fafc" />

          {/* Roads */}
          {ROADS.map((r, i) => (
            <path
              key={i}
              d={r.d}
              stroke={r.stroke}
              strokeWidth={r.width}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Location circles */}
          {state.locations.map(loc => {
            const isSelected = loc.id === state.selectedLocationId;
            const gap = isCoverageGap(loc.id);
            const color = getRiskColor(loc.riskLevel, loc.riskScore);
            const fill = getRiskFill(loc.riskLevel);
            const r = loc.riskLevel === 'High' ? 11 : loc.riskLevel === 'Medium' ? 9 : 8;

            return (
              <g key={loc.id}>
                {/* Pulse ring for High risk */}
                {loc.riskLevel === 'High' && (
                  <circle
                    cx={loc.mapX}
                    cy={loc.mapY}
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                )}

                {/* Coverage gap dashed ring */}
                {gap && (
                  <circle
                    cx={loc.mapX}
                    cy={loc.mapY}
                    r={r + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="3,2"
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={loc.mapX}
                    cy={loc.mapY}
                    r={r + 8}
                    fill="none"
                    stroke="#1e3068"
                    strokeWidth={2}
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={loc.mapX}
                  cy={loc.mapY}
                  r={r}
                  fill={isSelected ? color : fill}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleLocationClick(loc)}
                  onMouseMove={e => handleMouseMove(e, loc)}
                  onMouseLeave={() => setTooltip(null)}
                />

                {/* Score label inside circle (only for High) */}
                {loc.riskLevel === 'High' && (
                  <text
                    x={loc.mapX}
                    y={loc.mapY + 4}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill={isSelected ? '#fff' : color}
                    style={{ pointerEvents: 'none' }}
                  >
                    {loc.riskScore}
                  </text>
                )}

                {/* Incident triangle marker */}
                {loc.activeIncidents > 0 && (
                  <text
                    x={loc.mapX + r - 2}
                    y={loc.mapY - r + 2}
                    fontSize="8"
                    fill="#b91c1c"
                    style={{ pointerEvents: 'none' }}
                  >
                    ⚠
                  </text>
                )}

                {/* Officer count badge */}
                {loc.officersAssigned > 0 && (
                  <g>
                    <circle
                      cx={loc.mapX - r + 2}
                      cy={loc.mapY - r + 2}
                      r={5}
                      fill="#1e3068"
                    />
                    <text
                      x={loc.mapX - r + 2}
                      y={loc.mapY - r + 5}
                      textAnchor="middle"
                      fontSize="6"
                      fontWeight="700"
                      fill="#fff"
                      style={{ pointerEvents: 'none' }}
                    >
                      {loc.officersAssigned}
                    </text>
                  </g>
                )}

                {/* Location name label */}
                <text
                  x={loc.mapX}
                  y={loc.mapY + r + 10}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#475569"
                  fontWeight={isSelected ? '700' : '500'}
                  style={{ pointerEvents: 'none' }}
                >
                  {loc.shortName}
                </text>
              </g>
            );
          })}

          {/* Compass */}
          <g transform="translate(440, 80)">
            <circle cx="0" cy="0" r="14" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <text x="0" y="-6" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1e293b">N</text>
            <line x1="0" y1="-3" x2="0" y2="5" stroke="#1e3068" strokeWidth="1.5" />
          </g>

          {/* Scale bar */}
          <g transform="translate(80, 370)">
            <line x1="0" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#94a3b8" strokeWidth="1" />
            <line x1="40" y1="-3" x2="40" y2="3" stroke="#94a3b8" strokeWidth="1" />
            <text x="20" y="-5" textAnchor="middle" fontSize="7" fill="#94a3b8">≈ 2 km</text>
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="map-tooltip"
            style={{ left: tooltip.x + 12, top: tooltip.y }}
          >
            <div className="font-semibold">{tooltip.location.name}</div>
            <div className="text-slate-300 text-xs">
              Risk: <span style={{ color: getRiskColor(tooltip.location.riskLevel, tooltip.location.riskScore) }}>
                {tooltip.location.riskLevel} ({tooltip.location.riskScore})
              </span>
            </div>
            <div className="text-slate-300 text-xs">
              Officers: {tooltip.location.officersAssigned} / {tooltip.location.recommendedOfficers}
              {tooltip.location.officersAssigned === 0 && tooltip.location.riskLevel === 'High' && (
                <span className="ml-1 text-red-400 font-semibold">⚠ NO COVERAGE</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
