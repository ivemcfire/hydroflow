import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../state';

// Honest hardware inventory. "Live" lists exactly what /api/state reports
// (today: one ESP32 tank sensor). "Planned" lists the actuators the backend's
// Refill_Chain already publishes MQTT commands for (Pump_Main, tank inlet
// valves) — no firmware subscribes yet, so they are display-only and clearly
// marked. Nothing here is toggleable: there is no backend endpoint for
// manual actuator control.
@Component({
  selector: 'app-devices-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <mat-icon class="text-sky-500">precision_manufacturing</mat-icon> Hardware
        </h2>
        <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">What is physically on the bench today</p>
      </div>

      <!-- Live devices: exactly what /api/state reports -->
      <section>
        <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (device of state.devices(); track device.deviceId) {
            <div class="glass-card rounded-2xl p-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-emerald-50 text-emerald-500 p-3 rounded-xl">
                  <mat-icon>memory</mat-icon>
                </div>
                <div>
                  <h4 class="font-semibold text-slate-800">{{ device.deviceId }}</h4>
                  <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ESP32-S2 float sensor</p>
                </div>
              </div>
              <div class="space-y-1.5">
                @for (sensor of device.sensors; track sensor.sensor_type) {
                  <div class="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                    <span class="font-bold text-slate-500 uppercase tracking-wider">{{ sensor.sensor_type }}</span>
                    <span class="flex items-center gap-2">
                      <span class="font-semibold" [ngClass]="{
                        'text-rose-600': sensor.value === 1,
                        'text-emerald-600': sensor.value === 0,
                        'text-slate-400': sensor.value === null
                      }">{{ sensor.value === 1 ? 'ON' : sensor.value === 0 ? 'OFF' : '—' }}</span>
                      <span class="text-slate-300">{{ sensor.timestamp | date:'shortTime' }}</span>
                    </span>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="md:col-span-2 lg:col-span-3 text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <mat-icon class="text-slate-300 text-5xl h-auto w-auto mb-3">sensors_off</mat-icon>
              <p class="text-lg font-bold text-slate-500">No devices reporting</p>
              <p class="text-sm text-slate-400 mt-1">Devices appear here as soon as the backend receives their telemetry.</p>
            </div>
          }
        </div>
      </section>

      <!-- Planned hardware: backend automation targets with no physical device yet -->
      <section>
        <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-slate-300"></span> Planned — no hardware yet
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of plannedHardware; track item.name) {
            <div class="rounded-2xl p-5 border-2 border-dashed border-slate-200 bg-slate-50/50 opacity-75">
              <div class="flex items-center gap-3 mb-2">
                <div class="bg-slate-100 text-slate-400 p-3 rounded-xl">
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <div>
                  <h4 class="font-semibold text-slate-500">{{ item.name }}</h4>
                  <p class="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Planned — no hardware yet</p>
                </div>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">{{ item.note }}</p>
            </div>
          }
        </div>
        <p class="text-xs text-slate-400 mt-4 leading-relaxed max-w-2xl">
          The backend's refill automation already publishes MQTT commands to
          <code class="bg-slate-100 px-1 rounded">hydroflow/cmd/&lt;actuator&gt;</code> for these — nothing
          subscribes yet. Manual toggles will appear once actuator firmware exists and the backend exposes
          a control endpoint.
        </p>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesView {
  state = inject(StateService);

  // Names match the backend's ActuatorCommand targets (backend/src/refill-logic.ts).
  plannedHardware = [
    { name: 'Pump_Main', icon: 'water_pump', note: 'Refill pump. Commanded by Refill_Chain; no pump node built yet.' },
    { name: 'Valve_tank_A_Inlet', icon: 'valve', note: 'Tank A inlet valve. Commanded by Refill_Chain; ESP-NOW valve node still on the bench.' },
    { name: 'tank_A level_high probe', icon: 'waves', note: 'High float switch to stop refills. Firmware topic reserved (hydroflow/tank_A/level_high).' },
  ];
}
