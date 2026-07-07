import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DeviceSummary } from '../models';

// Real tank state, driven purely by /api/state + WS readings:
// level_low is a float switch — ON (1) means water is BELOW the low probe.
// There is no analog level sensor, so the fill graphic shows honest bands
// (low / above-low / unknown), not a fake percentage.
type TankLevel = 'low' | 'ok' | 'unknown';

@Component({
  selector: 'app-tank-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
      <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div class="flex justify-between items-start mb-4">
        <div class="flex-1 min-w-0 mr-3">
          <h3 class="text-xl font-semibold text-slate-800 group-hover:text-sky-600 transition-colors truncate">{{ device().deviceId }}</h3>
          <p class="text-sm text-slate-500 flex items-center gap-1">
            <mat-icon class="text-xs h-auto w-auto">sensors</mat-icon>
            ESP32 tank sensor
          </p>
        </div>
        <div class="bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 p-2.5 rounded-xl group-hover:shadow-lg group-hover:shadow-sky-100 transition-all">
          <mat-icon>water_drop</mat-icon>
        </div>
      </div>

      <div class="flex gap-5 items-stretch mb-4">
        <!-- Tank visualization: bands, not fake percentages -->
        <div class="relative w-16 h-28 rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50" [ngClass]="{
          'border-rose-200': level() === 'low',
          'border-sky-200': level() === 'ok',
          'border-slate-200': level() === 'unknown'
        }">
          <div class="absolute bottom-0 left-0 right-0 transition-all duration-1000" [ngClass]="{
            'h-[15%] bg-gradient-to-t from-rose-400 to-rose-300': level() === 'low',
            'h-[70%] bg-gradient-to-t from-sky-400 to-sky-300': level() === 'ok',
            'h-0': level() === 'unknown'
          }" [class.animate-pulse]="refilling()"></div>
          <!-- low probe marker -->
          <div class="absolute left-0 right-0 bottom-[20%] border-t border-dashed border-slate-300"></div>
          @if (level() === 'unknown') {
            <div class="absolute inset-0 flex items-center justify-center text-slate-300">
              <mat-icon>question_mark</mat-icon>
            </div>
          }
        </div>

        <div class="flex-1 flex flex-col justify-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg" [ngClass]="{
              'bg-rose-50 text-rose-600': level() === 'low',
              'bg-emerald-50 text-emerald-600': level() === 'ok',
              'bg-slate-100 text-slate-400': level() === 'unknown'
            }">
              {{ level() === 'low' ? 'Water LOW' : level() === 'ok' ? 'Above low probe' : 'No reading yet' }}
            </span>
          </div>
          @if (refilling()) {
            <div class="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <mat-icon class="text-sm animate-spin">autorenew</mat-icon>
              Refill in progress
            </div>
          }
          <p class="text-[10px] text-slate-400 leading-relaxed">
            Float switch only — shows below/above the low probe, not a percentage.
          </p>
        </div>
      </div>

      <!-- Sensor rows: exactly what the backend reports for this device -->
      <div class="space-y-1.5 mb-4">
        @for (sensor of device().sensors; track sensor.sensor_type) {
          <div class="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
            <span class="font-bold text-slate-500 uppercase tracking-wider">{{ sensor.sensor_type }}</span>
            <span class="font-semibold" [ngClass]="{
              'text-rose-600': sensor.value === 1,
              'text-emerald-600': sensor.value === 0,
              'text-slate-400': sensor.value === null
            }">{{ sensor.value === 1 ? 'ON' : sensor.value === 0 ? 'OFF' : '—' }}</span>
          </div>
        }
      </div>

      <div class="flex items-center justify-between text-xs text-slate-400">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" [ngClass]="level() === 'unknown' ? 'bg-slate-300' : 'bg-emerald-400 animate-pulse'"></span>
          {{ level() === 'unknown' ? 'No data' : 'Reporting' }}
        </span>
        <span>Updated {{ lastUpdate() | date:'shortTime' }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TankCard {
  device = input.required<DeviceSummary>();
  refilling = input(false);

  level = computed<TankLevel>(() => {
    const low = this.device().sensors.find((s) => s.sensor_type === 'level_low');
    if (!low || low.value === null) return 'unknown';
    return low.value === 1 ? 'low' : 'ok';
  });

  lastUpdate = computed<string | null>(() => {
    const ts = this.device().sensors.map((s) => new Date(s.timestamp).getTime());
    return ts.length ? new Date(Math.max(...ts)).toISOString() : null;
  });
}
