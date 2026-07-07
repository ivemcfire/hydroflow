import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';

// Minimal live-update channel for the dashboard: every envelope is
// {event, payload, ts}. Same shape as chickenFlow's.
let wss: WebSocketServer | null = null;

export function attachWs(server: Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (socket) => {
    socket.on('error', (err) => console.error('[WS] socket error:', err.message));
  });
  console.log('[WS] attached on /ws');
}

export function broadcast(event: string, payload: unknown): void {
  if (!wss) return;
  const msg = JSON.stringify({ event, payload, ts: Date.now() });
  for (const socket of wss.clients) {
    if (socket.readyState === WebSocket.OPEN) socket.send(msg);
  }
}
