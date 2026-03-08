import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AutomationRule } from '../models';

@Component({
  selector: 'app-rule-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 rounded-xl border relative overflow-hidden group transition-all duration-300 hover:shadow-md" [ngClass]="{
      'bg-white border-sky-100': rule().active,
      'bg-slate-50 border-slate-100 opacity-70': !rule().active
    }">
      <!-- Active indicator bar -->
      @if (rule().active) {
        <div class="absolute bottom-0 left-0 right-0 h-0.5 flow-line"></div>
      }

      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" [ngClass]="{
            'bg-indigo-50 text-indigo-500': rule().type === 'schedule',
            'bg-emerald-50 text-emerald-500': rule().type === 'threshold'
          }">
            <mat-icon class="text-sm">{{ rule().type === 'schedule' ? 'schedule' : 'sensors' }}</mat-icon>
          </div>
          <div>
            <h4 class="font-semibold text-slate-700 text-sm">{{ rule().name }}</h4>
            @if (rule().runMode) {
              <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md" [ngClass]="{
                'bg-sky-50 text-sky-500': rule().runMode === 'continuous',
                'bg-amber-50 text-amber-500': rule().runMode === 'once'
              }">{{ rule().runMode }}</span>
            }
          </div>
        </div>
        <button
          (click)="toggleActive.emit(rule())"
          [ngClass]="rule().active ? 'bg-emerald-500' : 'bg-slate-300'"
          class="w-10 h-5 rounded-full relative transition-colors duration-300 flex-shrink-0"
        >
          <div
            [ngClass]="rule().active ? 'translate-x-5' : 'translate-x-1'"
            class="absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm"
          ></div>
        </button>
      </div>

      <div class="text-xs text-slate-500 space-y-1.5">
        @if (rule().type === 'schedule') {
          <p class="flex items-center gap-1.5">
            <mat-icon class="text-[14px] h-auto w-auto text-indigo-400">event</mat-icon>
            {{ rule().config.days?.join(', ') }} at {{ rule().config.startTime }}
          </p>
        } @else {
          <p class="flex items-center gap-1.5">
            <mat-icon class="text-[14px] h-auto w-auto text-emerald-400">speed</mat-icon>
            Trigger {{ rule().config.conditionOperator === 'above' ? 'above' : 'below' }} {{ rule().config.conditionValue ?? rule().config.threshold }}%
          </p>
        }

        <!-- Action -->
        <p class="flex items-center gap-1.5">
          <mat-icon class="text-[14px] h-auto w-auto text-sky-400">{{ rule().config.actionValue === 'on' ? 'power' : 'power_off' }}</mat-icon>
          Turn {{ rule().config.actionValue ?? 'on' | uppercase }}
        </p>

        <!-- Stop condition -->
        @if (rule().config.stopConditionType === 'duration') {
          <p class="flex items-center gap-1.5">
            <mat-icon class="text-[14px] h-auto w-auto text-amber-400">timer</mat-icon>
            Stop after {{ rule().config.stopDuration ?? rule().config.duration }} min
          </p>
        } @else if (rule().config.stopConditionType === 'sensor_reaches') {
          <p class="flex items-center gap-1.5">
            <mat-icon class="text-[14px] h-auto w-auto text-amber-400">gps_fixed</mat-icon>
            Stop at {{ rule().config.stopSensorValue }}%
          </p>
        } @else if (rule().config.stopConditionType === 'none') {
          <p class="flex items-center gap-1.5">
            <mat-icon class="text-[14px] h-auto w-auto text-slate-300">pan_tool</mat-icon>
            Manual stop
          </p>
        }
      </div>

      <!-- Delete at bottom with confirmation -->
      @if (confirmingDelete()) {
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p class="text-xs text-rose-600 font-medium">Delete rule?</p>
          <div class="flex gap-2">
            <button
              (click)="confirmingDelete.set(false)"
              class="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >Cancel</button>
            <button
              (click)="confirmDelete()"
              class="px-3 py-1 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
            >Delete</button>
          </div>
        </div>
      } @else {
        <div class="mt-2 pt-2 border-t border-transparent opacity-0 group-hover:opacity-100 group-hover:border-slate-50 transition-all flex justify-end gap-3">
          <button
            (click)="editRule.emit(rule())"
            class="text-slate-300 hover:text-sky-500 transition-colors flex items-center gap-1 text-xs"
          >
            <mat-icon class="text-sm">edit</mat-icon>
            Edit
          </button>
          <button
            (click)="confirmingDelete.set(true)"
            class="text-slate-300 hover:text-rose-500 transition-colors flex items-center gap-1 text-xs"
          >
            <mat-icon class="text-sm">delete</mat-icon>
            Remove
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleItem {
  rule = input.required<AutomationRule>();
  toggleActive = output<AutomationRule>();
  delete = output<string>();
  editRule = output<AutomationRule>();

  confirmingDelete = signal(false);

  confirmDelete() {
    this.delete.emit(this.rule().id);
    this.confirmingDelete.set(false);
  }
}
