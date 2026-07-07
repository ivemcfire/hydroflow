import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StateService } from './state';
import { ActivityRow, LatestReading } from './models';
import { FakeWebSocket, jsonResponse } from './testing/fakes';

const READINGS: LatestReading[] = [
  { device_id: 'tank_A', sensor_type: 'level_low', value: 1, timestamp: '2026-07-05T10:00:00Z' },
];

const ACTIVITIES: ActivityRow[] = [
  { id: 2, timestamp: '2026-07-05T10:00:05Z', chain_name: 'Refill_Chain', action: 'Start', trigger: 'tank_A level_low' },
  { id: 1, timestamp: '2026-07-05T09:00:00Z', chain_name: 'Refill_Chain', action: 'Stop', trigger: 'tank_A level_high' },
];

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/api/state')) return jsonResponse(READINGS);
        if (url.includes('/api/activities')) return jsonResponse(ACTIVITIES);
        if (url.includes('/api/ai/insight')) return jsonResponse({ error: 'GEMINI_API_KEY not configured' }, 503);
        throw new Error(`unexpected fetch ${url}`);
      }),
    );
    vi.stubGlobal('WebSocket', FakeWebSocket);
    service = TestBed.inject(StateService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    FakeWebSocket.instances.length = 0;
  });

  it('hydrates readings and activities from the backend', async () => {
    service.start();
    await vi.waitFor(() => expect(service.readings().length).toBe(1));

    expect(service.devices()).toEqual([{ deviceId: 'tank_A', sensors: READINGS }]);
    expect(service.levelLow('tank_A')).toBe(1);
    expect(service.activities().length).toBe(2);
  });

  it('infers refill-in-progress from the latest Refill_Chain activity', async () => {
    service.start();
    await vi.waitFor(() => expect(service.activities().length).toBe(2));

    expect(service.isRefilling()).toBe(true);
    expect(service.isDeviceRefilling('tank_A')).toBe(true);
    expect(service.isDeviceRefilling('tank_B')).toBe(false);
  });

  it('renders backend 503 as AI offline', async () => {
    service.start();
    await vi.waitFor(() => expect(service.aiLoading()).toBe(false));

    expect(service.aiError()).toBe('AI offline');
    expect(service.aiInsight()).toBe('');
  });

  it('applies sensor:reading WS envelopes to the latest state', async () => {
    service.start();
    await vi.waitFor(() => expect(service.readings().length).toBe(1));

    const ws = FakeWebSocket.instances[0];
    ws.onmessage?.({
      data: JSON.stringify({
        event: 'sensor:reading',
        payload: { deviceId: 'tank_A', sensorType: 'level_low', raw: 'OFF', value: 0 },
        ts: Date.now(),
      }),
    });

    expect(service.levelLow('tank_A')).toBe(0);
    expect(service.readings().length).toBe(1); // updated in place, not appended
  });

  it('collects system:alert WS envelopes as unread alerts', async () => {
    service.start();
    await vi.waitFor(() => expect(service.readings().length).toBe(1));

    const ws = FakeWebSocket.instances[0];
    ws.onmessage?.({
      data: JSON.stringify({
        event: 'system:alert',
        payload: { severity: 'critical', text: 'tank_A fill timeout' },
        ts: Date.now(),
      }),
    });

    expect(service.alerts().length).toBe(1);
    expect(service.alerts()[0].severity).toBe('critical');
    expect(service.unreadAlertsCount()).toBe(1);

    service.markAllAlertsAsRead();
    expect(service.unreadAlertsCount()).toBe(0);
  });
});
