import { Injectable, OnDestroy, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ActivityRow,
  AppAlert,
  BackendAlertPayload,
  DeviceSummary,
  LatestReading,
  SensorReadingPayload,
  WsConnectionState,
} from './models';

// Optional environment override for the API/WS origin. Default is same-origin
// (relative /api and /ws — matches the k8s LB / dev-proxy setups). To point a
// build elsewhere, define the global before the bundle loads (e.g.
// `<script>var API_BASE_URL = "http://192.168.100.209:3000";</script>` in
// index.html) or add an angular.json `define` entry for API_BASE_URL.
declare const API_BASE_URL: string;

function apiBase(): string {
  return typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
}

function wsUrl(): string {
  const base = apiBase();
  if (base) {
    return base.replace(/^http/, 'ws').replace(/\/+$/, '') + '/ws';
  }
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

/**
 * Single source of truth for dashboard data, hydrated from the real
 * HydroFlow backend (GET /api/state, /api/activities, POST /api/ai/insight)
 * and kept live over the /ws socket. Replaces the old fake-data
 * SimulationService — there is no synthetic drift or invented hardware here,
 * only what the backend actually reports.
 */
@Injectable({ providedIn: 'root' })
export class StateService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  private _readings = signal<LatestReading[]>([]);
  private _activities = signal<ActivityRow[]>([]);
  private _alerts = signal<AppAlert[]>([]);
  private _wsState = signal<WsConnectionState>('connecting');
  private _aiInsight = signal<string>('');
  private _aiError = signal<string | null>(null);
  private _aiLoading = signal(false);

  readings = this._readings.asReadonly();
  activities = this._activities.asReadonly();
  alerts = this._alerts.asReadonly();
  wsState = this._wsState.asReadonly();
  aiInsight = this._aiInsight.asReadonly();
  aiError = this._aiError.asReadonly();
  aiLoading = this._aiLoading.asReadonly();

  unreadAlertsCount = computed(() => this._alerts().filter((a) => !a.read).length);

  /** Devices are derived purely from what /api/state has returned — never invented. */
  devices = computed<DeviceSummary[]>(() => {
    const byDevice = new Map<string, LatestReading[]>();
    for (const r of this._readings()) {
      const list = byDevice.get(r.device_id) ?? [];
      list.push(r);
      byDevice.set(r.device_id, list);
    }
    return [...byDevice.entries()].map(([deviceId, sensors]) => ({ deviceId, sensors }));
  });

  /** level_low value for a device: 1 = ON (low), 0 = OFF (normal), undefined = never reported. */
  levelLow(deviceId: string): number | null | undefined {
    return this._readings().find((r) => r.device_id === deviceId && r.sensor_type === 'level_low')?.value;
  }

  /** Refilling iff the most recent Refill_Chain activity is a Start with no later Stop. */
  isRefilling = computed(() => this.latestRefillAction() === 'Start');

  /** Per-device refill status: refill activity triggers are "<deviceId> level_low" etc. */
  isDeviceRefilling(deviceId: string): boolean {
    return this.latestRefillAction(deviceId) === 'Start';
  }

  private latestRefillAction(deviceId?: string): string | undefined {
    const chain = this._activities()
      .filter(
        (a) =>
          a.chain_name === 'Refill_Chain' &&
          (!deviceId || a.trigger.startsWith(`${deviceId} `)),
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return chain[0]?.action;
  }

  /** Most recent sensor timestamp across all devices — honest freshness signal. */
  lastReadingAt = computed<string | null>(() => {
    const ts = this._readings().map((r) => new Date(r.timestamp).getTime());
    return ts.length ? new Date(Math.max(...ts)).toISOString() : null;
  });

  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  /** Kick off hydration + the live WS connection. Browser-only (SSR has no socket). */
  start(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.hydrate();
    this.connectWs();
    void this.refreshInsight();
  }

  async hydrate(): Promise<void> {
    try {
      const [state, activities] = await Promise.all([
        this.getJson<LatestReading[]>('/api/state'),
        this.getJson<ActivityRow[]>('/api/activities?limit=50'),
      ]);
      this._readings.set(state);
      this._activities.set(activities);
    } catch (err) {
      console.error('[state] hydrate failed:', err);
    }
  }

  private async getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${apiBase()}${path}`);
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return (await res.json()) as T;
  }

  private connectWs(): void {
    if (!isPlatformBrowser(this.platformId) || this.destroyed) return;
    this._wsState.set('connecting');

    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl());
    } catch (err) {
      console.error('[state] WS construction failed:', err);
      this.scheduleReconnect();
      return;
    }
    this.ws = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this._wsState.set('open');
      // We may have missed events while disconnected — re-sync from source of truth.
      void this.hydrate();
    };

    socket.onmessage = (ev: MessageEvent<string>) => {
      let envelope: { event: string; payload: unknown };
      try {
        envelope = JSON.parse(ev.data);
      } catch {
        return;
      }
      this.handleEnvelope(envelope);
    };

    socket.onclose = () => {
      this._wsState.set('closed');
      this.ws = null;
      if (!this.destroyed) this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.reconnectAttempt, RECONNECT_MAX_MS);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWs();
    }, delay);
    // Node/vitest: don't let a pending reconnect keep the process alive. No-op in browsers.
    (this.reconnectTimer as unknown as { unref?: () => void })?.unref?.();
  }

  private handleEnvelope(envelope: { event: string; payload: unknown }): void {
    if (envelope.event === 'sensor:reading') {
      const reading = envelope.payload as SensorReadingPayload;
      const updated: LatestReading = {
        device_id: reading.deviceId,
        sensor_type: reading.sensorType,
        value: reading.value,
        timestamp: new Date().toISOString(),
      };
      this._readings.update((readings) => {
        const idx = readings.findIndex(
          (r) => r.device_id === updated.device_id && r.sensor_type === updated.sensor_type,
        );
        if (idx === -1) return [...readings, updated];
        const copy = readings.slice();
        copy[idx] = updated;
        return copy;
      });
    } else if (envelope.event === 'system:alert') {
      const payload = envelope.payload as BackendAlertPayload;
      const alert: AppAlert = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        severity: payload.severity,
        text: payload.text,
        read: false,
      };
      this._alerts.update((alerts) => [alert, ...alerts]);
      // Alerts usually coincide with a new activities row (Refill_Chain, fill_timeout) — refresh.
      void this.refreshActivities();
    }
  }

  private async refreshActivities(): Promise<void> {
    try {
      this._activities.set(await this.getJson<ActivityRow[]>('/api/activities?limit=50'));
    } catch (err) {
      console.error('[state] activities refresh failed:', err);
    }
  }

  async refreshInsight(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this._aiLoading.set(true);
    this._aiError.set(null);
    try {
      const res = await fetch(`${apiBase()}/api/ai/insight`, { method: 'POST' });
      if (!res.ok) {
        this._aiError.set('AI offline');
        this._aiInsight.set('');
        return;
      }
      const body = (await res.json()) as { text: string };
      this._aiInsight.set(body.text);
    } catch (err) {
      console.error('[state] insight fetch failed:', err);
      this._aiError.set('AI offline');
      this._aiInsight.set('');
    } finally {
      this._aiLoading.set(false);
    }
  }

  markAlertAsRead(id: string): void {
    this._alerts.update((alerts) => alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  markAllAlertsAsRead(): void {
    this._alerts.update((alerts) => alerts.map((a) => ({ ...a, read: true })));
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
