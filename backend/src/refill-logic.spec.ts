import { describe, it, expect } from 'vitest';
import {
  onLevelLow,
  onLevelHigh,
  onTick,
  FILL_TIMEOUT_MS,
  type TankStates,
} from './refill-logic';

const T0 = 1_750_000_000_000;

describe('refill chain', () => {
  it('starts refill on level_low: inlet valve + pump ON', () => {
    const states: TankStates = new Map();
    const d = onLevelLow(states, 'tank_A', T0);
    expect(d.commands).toEqual([
      { actuator: 'Valve_tank_A_Inlet', state: 'ON', reason: 'tank_A level_low' },
      { actuator: 'Pump_Main', state: 'ON', reason: 'tank_A level_low' },
    ]);
    expect(states.get('tank_A')).toEqual({ filling: true, fillStartedAt: T0 });
  });

  it('ignores repeated level_low while already filling', () => {
    const states: TankStates = new Map();
    onLevelLow(states, 'tank_A', T0);
    const d = onLevelLow(states, 'tank_A', T0 + 1000);
    expect(d.commands).toHaveLength(0);
    expect(states.get('tank_A')!.fillStartedAt).toBe(T0); // original start kept
  });

  it('stops refill on level_high: valve + pump OFF', () => {
    const states: TankStates = new Map();
    onLevelLow(states, 'tank_A', T0);
    const d = onLevelHigh(states, 'tank_A', T0 + 60_000);
    expect(d.commands.map((c) => c.state)).toEqual(['OFF', 'OFF']);
    expect(states.get('tank_A')!.filling).toBe(false);
  });

  it('ignores level_high when not filling', () => {
    const states: TankStates = new Map();
    const d = onLevelHigh(states, 'tank_A', T0);
    expect(d.commands).toHaveLength(0);
  });

  it('tick fires the fill timeout — the old code could never do this without traffic', () => {
    const states: TankStates = new Map();
    onLevelLow(states, 'tank_A', T0);
    const before = onTick(states, T0 + FILL_TIMEOUT_MS); // exactly at limit: not yet
    expect(before.commands).toHaveLength(0);
    const after = onTick(states, T0 + FILL_TIMEOUT_MS + 1);
    expect(after.commands.map((c) => c.state)).toEqual(['OFF', 'OFF']);
    expect(after.alerts[0]!.severity).toBe('critical');
    expect(states.get('tank_A')!.filling).toBe(false);
  });

  it('tick handles multiple tanks independently', () => {
    const states: TankStates = new Map();
    onLevelLow(states, 'tank_A', T0);
    onLevelLow(states, 'tank_B', T0 + FILL_TIMEOUT_MS);
    const d = onTick(states, T0 + FILL_TIMEOUT_MS + 1);
    expect(d.commands.filter((c) => c.actuator.includes('tank_A'))).toHaveLength(1);
    expect(states.get('tank_B')!.filling).toBe(true); // B still within window
  });
});
