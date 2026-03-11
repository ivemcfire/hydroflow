// File: src/frontend/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const fetchSystemStatus = async () => {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) throw new Error('Failed to fetch system status');
  return response.json();
};

export const fetchPumps = async () => {
  const response = await fetch(`${API_BASE}/pumps`);
  if (!response.ok) throw new Error('Failed to fetch pumps');
  return response.json();
};

export const togglePump = async (id: string) => {
  const response = await fetch(`${API_BASE}/pumps/${id}/toggle`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to toggle pump');
  return response.json();
};
