import { ChangeDetectionStrategy, Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NodeComponent, AutomationRule, WeatherData, RunMode } from '../models';

@Component({
  selector: 'app-add-rule-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center fade-in">
      <div
        class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        (click)="close.emit()"
        (keydown.escape)="close.emit()"
        tabindex="0"
        role="button"
        aria-label="Close dialog"
      ></div>

      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden slide-in-right">
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-indigo-50 to-sky-50 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <mat-icon>auto_mode</mat-icon>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-800">{{ editRule() ? 'Edit Rule' : 'New Automation Rule' }}</h2>
              <p class="text-xs text-slate-500">Configure smart watering automation</p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

          <!-- Step 1: Rule Name -->
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rule Name</label>
            <input
              type="text"
              [(ngModel)]="ruleName"
              placeholder="e.g. Morning Watering"
              class="edit-input w-full"
            />
          </div>

          <!-- Step 2: Rule Type (When) -->
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">① When to trigger</label>
            <div class="flex gap-2">
              <button
                (click)="ruleType.set('schedule')"
                [ngClass]="ruleType() === 'schedule' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                class="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <mat-icon class="text-sm">schedule</mat-icon>
                On Schedule
              </button>
              <button
                (click)="ruleType.set('threshold')"
                [ngClass]="ruleType() === 'threshold' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                class="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <mat-icon class="text-sm">sensors</mat-icon>
                On Condition
              </button>
            </div>
          </div>

          <!-- Schedule Config -->
          @if (ruleType() === 'schedule') {
            <div class="space-y-4 p-4 bg-slate-50 rounded-2xl">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Start Time</label>
                  <input type="time" [(ngModel)]="startTime" class="edit-input w-full" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Duration (min)</label>
                  <input type="number" [(ngModel)]="duration" min="1" max="120" class="edit-input w-full" />
                </div>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-400 block mb-2">Days</label>
                <div class="flex gap-1.5 flex-wrap">
                  @for (day of allDays; track day) {
                    <button
                      (click)="toggleDay(day)"
                      [ngClass]="selectedDays().includes(day) ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 border border-slate-200'"
                      class="w-10 h-10 rounded-lg text-xs font-bold transition-all active:scale-95"
                    >{{ day }}</button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Condition Config -->
          @if (ruleType() === 'threshold') {
            <div class="space-y-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <mat-icon class="text-sm">rule</mat-icon> Condition
              </p>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Sensor</label>
                  <select [(ngModel)]="conditionSensorId" class="edit-input w-full text-sm">
                    <option value="">Select...</option>
                    @for (sensor of sensors(); track sensor.id) {
                      <option [value]="sensor.id">{{ sensor.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">When</label>
                  <select [(ngModel)]="conditionOperator" class="edit-input w-full text-sm">
                    <option value="below">Drops below</option>
                    <option value="above">Goes above</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Value (%)</label>
                  <input type="number" [(ngModel)]="conditionValue" min="0" max="100" class="edit-input w-full" />
                </div>
              </div>
            </div>
          }

          <!-- Step 3: What to do (Action) -->
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">② What to do</label>
            <div class="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Component</label>
                  <select [(ngModel)]="actionComponentId" class="edit-input w-full text-sm">
                    <option value="">Select...</option>
                    @for (comp of allComponents(); track comp.id) {
                      <option [value]="comp.id">{{ comp.name }} ({{ comp.type.replace('_', ' ') }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Action</label>
                  <select [(ngModel)]="actionValue" class="edit-input w-full text-sm">
                    <option value="on">Turn ON</option>
                    <option value="off">Turn OFF</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Stop condition -->
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">③ Stop when</label>
            <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
              <div class="flex gap-2">
                <button
                  (click)="stopType.set('duration')"
                  [ngClass]="stopType() === 'duration' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 border border-slate-200'"
                  class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                >After duration</button>
                <button
                  (click)="stopType.set('sensor_reaches')"
                  [ngClass]="stopType() === 'sensor_reaches' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 border border-slate-200'"
                  class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                >Sensor reaches</button>
                <button
                  (click)="stopType.set('none')"
                  [ngClass]="stopType() === 'none' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 border border-slate-200'"
                  class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                >Manual only</button>
              </div>

              @if (stopType() === 'duration') {
                <div>
                  <label class="text-xs font-bold text-slate-400 block mb-1">Duration (min)</label>
                  <input type="number" [(ngModel)]="stopDuration" min="1" max="480" class="edit-input w-full" />
                </div>
              }

              @if (stopType() === 'sensor_reaches') {
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs font-bold text-slate-400 block mb-1">Sensor</label>
                    <select [(ngModel)]="stopSensorId" class="edit-input w-full text-sm">
                      <option value="">Select...</option>
                      @for (sensor of sensors(); track sensor.id) {
                        <option [value]="sensor.id">{{ sensor.name }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-xs font-bold text-slate-400 block mb-1">Target value (%)</label>
                    <input type="number" [(ngModel)]="stopSensorValue" min="0" max="100" class="edit-input w-full" />
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Step 5: Run mode -->
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">④ Run mode</label>
            <div class="flex gap-2">
              <button
                (click)="runMode.set('continuous')"
                [ngClass]="runMode() === 'continuous' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                class="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <mat-icon class="text-sm">loop</mat-icon>
                Continuous
              </button>
              <button
                (click)="runMode.set('once')"
                [ngClass]="runMode() === 'once' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                class="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <mat-icon class="text-sm">looks_one</mat-icon>
                Run Once
              </button>
            </div>
            <p class="text-[10px] text-slate-400 mt-1.5">
              {{ runMode() === 'continuous' ? 'Rule triggers every time conditions are met' : 'Rule fires once, then deactivates itself' }}
            </p>
          </div>

          <!-- Weather Warning -->
          @if (weather().rainProbability > 50) {
            <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <mat-icon class="text-amber-500 mt-0.5">cloud</mat-icon>
              <div>
                <p class="text-sm font-semibold text-amber-800">Rain Expected</p>
                <p class="text-xs text-amber-600 mt-0.5">
                  Rain probability is {{ weather().rainProbability }}%. Consider reducing watering or skipping.
                </p>
              </div>
            </div>
          }

          <!-- Summary Preview -->
          @if (isValid()) {
            <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <mat-icon class="text-sm">preview</mat-icon> Summary
              </p>
              <p class="text-sm text-indigo-800 leading-relaxed">{{ getSummary() }}</p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            (click)="close.emit()"
            class="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="saveRule()"
            [disabled]="!isValid()"
            [ngClass]="isValid() ? 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200 cursor-not-allowed'"
            class="px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            {{ editRule() ? 'Save Changes' : 'Create Rule' }}
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddRuleDialog {
  components = input.required<NodeComponent[]>();
  weather = input.required<WeatherData>();
  editRule = input<AutomationRule | null>(null);
  close = output<void>();
  ruleSaved = output<AutomationRule>();

  // Form state
  ruleName = '';
  ruleType = signal<'schedule' | 'threshold'>('schedule');
  runMode = signal<RunMode>('continuous');

  // Schedule
  startTime = '06:00';
  duration = 15;
  allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  selectedDays = signal<string[]>(['Mon', 'Wed', 'Fri']);

  // Condition
  conditionSensorId = '';
  conditionOperator: 'below' | 'above' = 'below';
  conditionValue = 30;

  // Action
  actionComponentId = '';
  actionValue: 'on' | 'off' = 'on';

  // Stop condition
  stopType = signal<'duration' | 'sensor_reaches' | 'none'>('duration');
  stopDuration = 15;
  stopSensorId = '';
  stopSensorValue = 70;

  sensors = () => this.components().filter(c => c.type === 'soil_humidity' || c.type === 'water_level');
  allComponents = () => this.components();

  ngOnInit() {
    const existing = this.editRule();
    if (existing) {
      this.ruleName = existing.name;
      this.ruleType.set(existing.type);
      this.runMode.set(existing.runMode || 'continuous');

      this.actionComponentId = existing.config.actionComponentId || '';
      this.actionValue = existing.config.actionValue || 'on';

      if (existing.type === 'schedule') {
        this.startTime = existing.config.startTime || '06:00';
        this.duration = existing.config.duration || 15;
        this.selectedDays.set(existing.config.days || []);
      } else {
        this.conditionSensorId = existing.config.conditionSensorId || existing.config.sensorId || '';
        this.conditionOperator = existing.config.conditionOperator || 'below';
        this.conditionValue = existing.config.conditionValue || existing.config.threshold || 30;
      }

      const stopType = existing.config.stopConditionType;
      if (stopType) {
        this.stopType.set(stopType);
        if (stopType === 'duration') this.stopDuration = existing.config.stopDuration || 15;
        if (stopType === 'sensor_reaches') {
          this.stopSensorId = existing.config.stopSensorId || '';
          this.stopSensorValue = existing.config.stopSensorValue || 70;
        }
      }
    }
  }

  toggleDay(day: string) {
    this.selectedDays.update(days =>
      days.includes(day) ? days.filter(d => d !== day) : [...days, day]
    );
  }

  isValid(): boolean {
    if (!this.ruleName.trim()) return false;
    if (!this.actionComponentId) return false;
    if (this.ruleType() === 'threshold' && !this.conditionSensorId) return false;
    if (this.ruleType() === 'schedule' && this.selectedDays().length === 0) return false;
    if (this.stopType() === 'sensor_reaches' && !this.stopSensorId) return false;
    return true;
  }

  getSummary(): string {
    const comp = this.components().find(c => c.id === this.actionComponentId);
    const compName = comp ? comp.name : '???';
    const action = this.actionValue === 'on' ? 'Turn ON' : 'Turn OFF';

    let when = '';
    if (this.ruleType() === 'schedule') {
      when = `${this.selectedDays().join(', ')} at ${this.startTime}`;
    } else {
      const sensor = this.sensors().find(s => s.id === this.conditionSensorId);
      when = `when ${sensor?.name ?? '???'} ${this.conditionOperator === 'below' ? 'drops below' : 'goes above'} ${this.conditionValue}%`;
    }

    let stop = '';
    if (this.stopType() === 'duration') {
      stop = ` for ${this.stopDuration} minutes`;
    } else if (this.stopType() === 'sensor_reaches') {
      const ss = this.sensors().find(s => s.id === this.stopSensorId);
      stop = ` until ${ss?.name ?? '???'} reaches ${this.stopSensorValue}%`;
    } else {
      stop = ' until manually stopped';
    }

    const mode = this.runMode() === 'once' ? ' (once)' : '';
    return `${action} "${compName}" ${when}${stop}${mode}`;
  }

  saveRule() {
    if (!this.isValid()) return;

    const rule: AutomationRule = {
      id: this.editRule()?.id || ('r-' + Math.random().toString(36).substring(7)),
      name: this.ruleName,
      type: this.ruleType(),
      active: this.editRule()?.active ?? true,
      runMode: this.runMode(),
      config: {
        // Schedule
        ...(this.ruleType() === 'schedule' ? {
          startTime: this.startTime,
          duration: this.duration,
          days: this.selectedDays(),
        } : {}),
        // Condition
        ...(this.ruleType() === 'threshold' ? {
          conditionSensorId: this.conditionSensorId,
          conditionOperator: this.conditionOperator,
          conditionValue: this.conditionValue,
          // Legacy compat
          threshold: this.conditionValue,
          sensorId: this.conditionSensorId,
        } : {}),
        // Action
        actionComponentId: this.actionComponentId,
        actionValue: this.actionValue,
        // Stop condition
        stopConditionType: this.stopType(),
        ...(this.stopType() === 'duration' ? { stopDuration: this.stopDuration } : {}),
        ...(this.stopType() === 'sensor_reaches' ? {
          stopSensorId: this.stopSensorId,
          stopSensorValue: this.stopSensorValue,
        } : {}),
      }
    };

    this.ruleSaved.emit(rule);
  }
}
