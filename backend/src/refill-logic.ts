// Tank refill chain — pure state machine, no I/O. The bridge feeds it sensor
// events, index.ts feeds it clock ticks, and it returns the commands/alerts
// to execute. This replaces the old automations.js, whose fill-timeout could
// only fire when a message happened to arrive and whose commands were
// console.log mocks.

export const FILL_TIMEOUT_MS = 20 * 60 * 1000;

export interface TankState {
  filling: boolean;
  fillStartedAt: number | null;
}

export interface ActuatorCommand {
  actuator: string;
  state: 'ON' | 'OFF';
  reason: string;
}

export interface Activity {
  chain: string;
  action: string;
  trigger: string;
}

export interface RefillDecision {
  commands: ActuatorCommand[];
  activities: Activity[];
  alerts: { severity: 'info' | 'critical'; text: string }[];
}

const EMPTY: RefillDecision = { commands: [], activities: [], alerts: [] };

export type TankStates = Map<string, TankState>;

function tank(states: TankStates, tankId: string): TankState {
  let s = states.get(tankId);
  if (!s) {
    s = { filling: false, fillStartedAt: null };
    states.set(tankId, s);
  }
  return s;
}

function startRefill(tankId: string, s: TankState, now: number, trigger: string): RefillDecision {
  s.filling = true;
  s.fillStartedAt = now;
  return {
    commands: [
      { actuator: `Valve_${tankId}_Inlet`, state: 'ON', reason: trigger },
      { actuator: 'Pump_Main', state: 'ON', reason: trigger },
    ],
    activities: [{ chain: 'Refill_Chain', action: 'Start', trigger }],
    alerts: [{ severity: 'info', text: `${tankId} is LOW — refill started.` }],
  };
}

function stopRefill(tankId: string, s: TankState, trigger: string, alert: RefillDecision['alerts'][number]): RefillDecision {
  s.filling = false;
  s.fillStartedAt = null;
  return {
    commands: [
      { actuator: `Valve_${tankId}_Inlet`, state: 'OFF', reason: trigger },
      { actuator: 'Pump_Main', state: 'OFF', reason: trigger },
    ],
    activities: [{ chain: 'Refill_Chain', action: 'Stop', trigger }],
    alerts: [alert],
  };
}

// level_low reads ON when the water is below the low probe.
export function onLevelLow(states: TankStates, tankId: string, now: number): RefillDecision {
  const s = tank(states, tankId);
  if (s.filling) return EMPTY; // already refilling — repeat sensor reports are normal
  return startRefill(tankId, s, now, `${tankId} level_low`);
}

// level_high reads ON when the water reaches the high probe.
export function onLevelHigh(states: TankStates, tankId: string, _now: number): RefillDecision {
  const s = tank(states, tankId);
  if (!s.filling) return EMPTY; // full without us filling — nothing to stop
  return stopRefill(tankId, s, `${tankId} level_high`, {
    severity: 'info',
    text: `${tankId} is FULL — refill stopped.`,
  });
}

// Clock sweep — runs on a timer regardless of sensor traffic, so a dead
// sensor can no longer leave the pump running forever.
export function onTick(states: TankStates, now: number): RefillDecision {
  const out: RefillDecision = { commands: [], activities: [], alerts: [] };
  for (const [tankId, s] of states) {
    if (s.filling && s.fillStartedAt !== null && now - s.fillStartedAt > FILL_TIMEOUT_MS) {
      const d = stopRefill(tankId, s, `${tankId} fill_timeout`, {
        severity: 'critical',
        text: `${tankId} fill timeout after ${FILL_TIMEOUT_MS / 60000} min — potential leak, dry pump, or dead level_high sensor. Pump stopped.`,
      });
      out.commands.push(...d.commands);
      out.activities.push(...d.activities);
      out.alerts.push(...d.alerts);
    }
  }
  return out;
}
