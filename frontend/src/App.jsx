import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CongestionMetrics from './components/CongestionMetrics';
import MapViewer from './components/MapViewer';
import SignalController from './components/SignalController';
import PredictionPanel from './components/PredictionPanel';
import { fetchJunctions, fetchCityOverview, createTrafficWebSocket } from './services/api';

// Fallback seed junctions for Nagpur if backend is starting
const INITIAL_NAGPUR_JUNCTIONS = [
  {
    id: "J_SITABULDI_VARIETY",
    name: "Variety Square (Sitabuldi)",
    area: "Sitabuldi",
    corridor: "Wardha Road / Amravati Rd Link",
    lanes: 4,
    capacity_pcu_hr: 4200,
    latitude: 21.1466,
    longitude: 79.0831,
    current_volume_pcu_hr: 3100,
    avg_speed_kmh: 22.4,
    queue_length_meters: 42.0,
    congestion_level: "heavy",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 28
  },
  {
    id: "J_SAMVIDHAN_RBI",
    name: "Samvidhan Chowk (RBI Square)",
    area: "Civil Lines",
    corridor: "Central Avenue / Wardha Road North",
    lanes: 6,
    capacity_pcu_hr: 5500,
    latitude: 21.1525,
    longitude: 79.0864,
    current_volume_pcu_hr: 3400,
    avg_speed_kmh: 34.0,
    queue_length_meters: 25.0,
    congestion_level: "moderate",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 18
  },
  {
    id: "J_LAW_COLLEGE",
    name: "Law College Square",
    area: "Dharampeth",
    corridor: "Amravati Road / WHC Road",
    lanes: 4,
    capacity_pcu_hr: 3800,
    latitude: 21.1528,
    longitude: 79.0620,
    current_volume_pcu_hr: 2450,
    avg_speed_kmh: 38.2,
    queue_length_meters: 15.0,
    congestion_level: "normal",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 32
  },
  {
    id: "J_SHANKAR_NAGAR",
    name: "Shankar Nagar Square",
    area: "Dharampeth / Laxmi Nagar",
    corridor: "West High Court (WHC) Road",
    lanes: 4,
    capacity_pcu_hr: 3600,
    latitude: 21.1396,
    longitude: 79.0625,
    current_volume_pcu_hr: 2100,
    avg_speed_kmh: 40.5,
    queue_length_meters: 12.0,
    congestion_level: "normal",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 25
  },
  {
    id: "J_RAHATE_COLONY",
    name: "Rahate Colony Square",
    area: "Dhantoli",
    corridor: "Wardha Road Arterial",
    lanes: 6,
    capacity_pcu_hr: 4800,
    latitude: 21.1270,
    longitude: 79.0760,
    current_volume_pcu_hr: 3850,
    avg_speed_kmh: 21.0,
    queue_length_meters: 50.0,
    congestion_level: "heavy",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 14
  },
  {
    id: "J_AJNI_SQUARE",
    name: "Ajni Square",
    area: "Ajni",
    corridor: "Wardha Road Arterial",
    lanes: 6,
    capacity_pcu_hr: 4900,
    latitude: 21.1180,
    longitude: 79.0790,
    current_volume_pcu_hr: 3300,
    avg_speed_kmh: 31.5,
    queue_length_meters: 28.0,
    congestion_level: "moderate",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 35
  },
  {
    id: "J_CHHATRAPATI_SQ",
    name: "Chhatrapati Square",
    area: "Pratap Nagar",
    corridor: "Wardha Road / Ring Road",
    lanes: 6,
    capacity_pcu_hr: 5200,
    latitude: 21.1105,
    longitude: 79.0690,
    current_volume_pcu_hr: 4100,
    avg_speed_kmh: 19.8,
    queue_length_meters: 55.0,
    congestion_level: "heavy",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 20
  },
  {
    id: "J_MEDICAL_SQUARE",
    name: "Medical Square",
    area: "Medical College Area",
    corridor: "Great Nag Road / Umred Road Link",
    lanes: 4,
    capacity_pcu_hr: 4000,
    latitude: 21.1340,
    longitude: 79.0970,
    current_volume_pcu_hr: 2900,
    avg_speed_kmh: 28.0,
    queue_length_meters: 30.0,
    congestion_level: "moderate",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 12
  },
  {
    id: "J_TEL_EXCHANGE",
    name: "Telephone Exchange Square",
    area: "Gandhibagh / CA Road",
    corridor: "Central Avenue (CA Road)",
    lanes: 4,
    capacity_pcu_hr: 4100,
    latitude: 21.1490,
    longitude: 79.1170,
    current_volume_pcu_hr: 3700,
    avg_speed_kmh: 18.5,
    queue_length_meters: 48.0,
    congestion_level: "heavy",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 22
  },
  {
    id: "J_AUTOMOTIVE_SQ",
    name: "Automotive Square (Kamptee Road)",
    area: "Indora / Kamptee Road",
    corridor: "NH-44 North corridor",
    lanes: 6,
    capacity_pcu_hr: 4600,
    latitude: 21.1980,
    longitude: 79.1020,
    current_volume_pcu_hr: 2200,
    avg_speed_kmh: 44.0,
    queue_length_meters: 10.0,
    congestion_level: "normal",
    active_signal_phase: "NORTH_SOUTH_GREEN",
    green_time_remaining_sec: 38
  }
];

export default function App() {
  const [junctions, setJunctions] = useState(INITIAL_NAGPUR_JUNCTIONS);
  const [kpis, setKpis] = useState(null);
  const [selectedJunction, setSelectedJunction] = useState(INITIAL_NAGPUR_JUNCTIONS[0]);
  const [isLive, setIsLive] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const juncData = await fetchJunctions();
        if (juncData && juncData.length > 0) {
          setJunctions(juncData);
          setSelectedJunction(juncData[0]);
        }
        const overview = await fetchCityOverview();
        if (overview) setKpis(overview);
      } catch (err) {
        console.log('Backend not reached yet, using default initial data.', err);
      }
    }
    loadData();

    // WebSocket subscription
    const wsClient = createTrafficWebSocket(
      (msg) => {
        setIsLive(true);
        if (msg.type === 'INITIAL_STATE') {
          if (msg.junctions) setJunctions(msg.junctions);
          if (msg.kpis) setKpis(msg.kpis);
        } else if (msg.type === 'JUNCTION_UPDATE') {
          setJunctions((prev) =>
            prev.map((j) => (j.id === msg.data.id ? msg.data : j))
          );
          if (selectedJunction?.id === msg.data.id) {
            setSelectedJunction(msg.data);
          }
        }
      },
      () => setIsLive(false)
    );

    return () => wsClient.close();
  }, []);

  const activeIncidents = junctions.filter(
    (j) => j.congestion_level === 'heavy' || j.congestion_level === 'severe'
  ).length;

  return (
    <div className="app-container">
      <Header isLive={isLive} activeIncidentsCount={activeIncidents} />

      <main className="app-main">
        {/* Top KPIs Row */}
        <CongestionMetrics kpis={kpis} junctions={junctions} />

        {/* Core Layout: Map + Controls */}
        <div className="grid-dashboard">
          {/* Left Column: Interactive GIS Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MapViewer
              junctions={junctions}
              selectedJunction={selectedJunction}
              onSelectJunction={(j) => setSelectedJunction(j)}
            />
            {/* AI Prediction Panel */}
            <PredictionPanel selectedJunction={selectedJunction} />
          </div>

          {/* Right Column: Adaptive Signal Optimizer & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <SignalController selectedJunction={selectedJunction} />

            {/* Junction Live Telemetry Snapshot Card */}
            {selectedJunction && (
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  JUNCTION SENSOR TELEMETRY
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Flow Rate</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedJunction.current_volume_pcu_hr} PCU/h</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Avg Speed</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedJunction.avg_speed_kmh} km/h</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Queue Length</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedJunction.queue_length_meters} m</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Status</div>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize', color: selectedJunction.congestion_level === 'heavy' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {selectedJunction.congestion_level}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
