/**
 * API Service for Nagpur Traffic AI
 */

const API_BASE = '/api/v1';

export async function fetchCityOverview() {
  const res = await fetch(`${API_BASE}/traffic/overview`);
  if (!res.ok) throw new Error('Failed to fetch city overview');
  return res.json();
}

export async function fetchJunctions() {
  const res = await fetch(`${API_BASE}/traffic/junctions`);
  if (!res.ok) throw new Error('Failed to fetch junctions');
  return res.json();
}

export async function fetchSignalPlan(junctionId) {
  const res = await fetch(`${API_BASE}/signals/plans/${junctionId}`);
  if (!res.ok) throw new Error(`Failed to fetch signal plan for ${junctionId}`);
  return res.json();
}

export async function fetchGreenWavePlan(corridor = 'CORRIDOR_WARDHA_RD') {
  const res = await fetch(`${API_BASE}/signals/green-wave/corridors?corridor=${corridor}`);
  if (!res.ok) throw new Error('Failed to fetch green wave plan');
  return res.json();
}

export async function fetchJunctionForecast(junctionId, horizon = 60) {
  const res = await fetch(`${API_BASE}/predictions/forecast/${junctionId}?horizon_minutes=${horizon}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for ${junctionId}`);
  return res.json();
}

export function createTrafficWebSocket(onMessage, onError) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/traffic`;

  let ws = null;
  let reconnectTimer = null;

  function connect() {
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => console.log('🟢 Connected to Nagpur Traffic AI WebSocket');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.warn('WS message parse error:', e);
        }
      };
      ws.onerror = (err) => {
        if (onError) onError(err);
      };
      ws.onclose = () => {
        console.warn('🔴 WS disconnected. Reconnecting in 3s...');
        reconnectTimer = setTimeout(connect, 3000);
      };
    } catch (err) {
      if (onError) onError(err);
      reconnectTimer = setTimeout(connect, 3000);
    }
  }

  connect();

  return {
    close: () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    }
  };
}
