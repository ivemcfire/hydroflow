import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Alert } from '../models';

@Component({
    selector: 'app-alerts-panel',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="fixed inset-0 z-50 flex justify-end fade-in">
      <div
        class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        (click)="close.emit()"
        (keydown.escape)="close.emit()"
        tabindex="0"
        role="button"
        aria-label="Close alerts panel"
      ></div>

      <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden slide-in-right">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-amber-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <mat-icon>notifications_active</mat-icon>
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-800">Alerts</h2>
                <p class="text-xs text-slate-500">{{ unreadCount() }} unread</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              @if (alerts().length > 0) {
                <button
                  (click)="markAllRead.emit()"
                  class="text-xs font-bold text-sky-500 hover:text-sky-600 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  Mark all read
                </button>
              }
              <button (click)="close.emit()" class="p-2 hover:bg-white rounded-xl transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Alert List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          @for (alert of alerts(); track alert.id; let i = $index) {
            <div
              class="p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md stagger-item"
              [style.animation-delay]="(i * 0.05) + 's'"
              [ngClass]="{
                'bg-white border-slate-100': alert.read,
                'bg-sky-50/50 border-sky-100': !alert.read && alert.severity === 'info',
                'bg-amber-50/50 border-amber-100': !alert.read && alert.severity === 'warning',
                'bg-rose-50/50 border-rose-100': !alert.read && alert.severity === 'error'
              }"
              (click)="markRead.emit(alert.id)"
            >
              <div class="flex items-start gap-3">
                <div class="mt-0.5">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" [ngClass]="{
                    'bg-sky-100 text-sky-600': alert.severity === 'info',
                    'bg-amber-100 text-amber-600': alert.severity === 'warning',
                    'bg-rose-100 text-rose-600': alert.severity === 'error'
                  }">
                    <mat-icon class="text-sm">{{
                      alert.severity === 'info' ? 'info' :
                      alert.severity === 'warning' ? 'warning' : 'error'
                    }}</mat-icon>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700 leading-relaxed" [class.font-semibold]="!alert.read">
                    {{ alert.message }}
                  </p>
                  <p class="text-[10px] text-slate-400 mt-1">
                    {{ alert.timestamp | date:'short' }}
                  </p>
                </div>
                @if (!alert.read) {
                  <div class="w-2 h-2 rounded-full bg-sky-500 mt-2 flex-shrink-0"></div>
                }
              </div>
            </div>
          } @empty {
            <div class="flex flex-col items-center justify-center py-20 text-center">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <mat-icon class="text-slate-300 text-3xl h-auto w-auto">notifications_none</mat-icon>
              </div>
              <p class="text-sm text-slate-400 font-medium">No alerts yet</p>
              <p class="text-xs text-slate-300 mt-1">System alerts will appear here</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsPanel {
    alerts = input.required<Alert[]>();
    unreadCount = input.required<number>();
    close = output<void>();
    markRead = output<string>();
    markAllRead = output<void>();
}
