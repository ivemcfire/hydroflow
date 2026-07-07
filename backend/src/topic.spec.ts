import { describe, it, expect } from 'vitest';
import { parseSensorTopic, normalizeValue } from './topic';

describe('parseSensorTopic', () => {
  it('parses the documented convention', () => {
    expect(parseSensorTopic('hydroflow/tank_A/level_low', 'ON')).toEqual({
      deviceId: 'tank_A',
      sensorType: 'level_low',
      raw: 'ON',
      value: 1,
    });
  });

  it('rejects wrong prefix, wrong depth, and injection-shaped segments', () => {
    expect(parseSensorTopic('chickenflow/tank_A/level_low', 'ON')).toBeNull();
    expect(parseSensorTopic('hydroflow/tank_A', 'ON')).toBeNull();
    expect(parseSensorTopic('hydroflow/tank_A/level/extra', 'ON')).toBeNull();
    expect(parseSensorTopic("hydroflow/tank'; DROP TABLE--/level", 'ON')).toBeNull();
    expect(parseSensorTopic('hydroflow//level_low', 'ON')).toBeNull();
  });

  it('never ingests the outbound command namespace', () => {
    expect(parseSensorTopic('hydroflow/cmd/Pump_Main', 'ON')).toBeNull();
  });
});

describe('normalizeValue', () => {
  it('maps ON/OFF and numeric strings; null for junk', () => {
    expect(normalizeValue('ON')).toBe(1);
    expect(normalizeValue('OFF')).toBe(0);
    expect(normalizeValue('23.5')).toBe(23.5);
    expect(normalizeValue('soggy')).toBeNull();
    expect(normalizeValue('NaN')).toBeNull();
  });
});
