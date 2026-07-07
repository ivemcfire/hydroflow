import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivityRow, AppAlert } from '../models';

// Shows real backend data only: live 'system:alert' WS events (info/critical)
// plus the persisted automation log from GET /api/activities. Alerts are not
// persisted server-side, so the alert list covers this browser session.
@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end fade-in">
      <div
        class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        (click)="closed.emit()"
        (keydown.escape)="closed.emit()"
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
                <p class="text-xs text-slate-500">{{ unreadCount() }} unread · live this session</p>
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
              <button (click)="closed.emit()" class="p-2 hover:bg-white rounded-xl transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Live system:alert events -->
          @for (alert of alerts(); track alert.id; let i = $index) {
            <div
              class="p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md stagger-item"
              [style.animation-delay]="(i * 0.05) + 's'"
              [ngClass]="{
                'bg-white border-slate-100': alert.read,
                'bg-sky-50/50 border-sky-100': !alert.read && alert.severity === 'info',
                'bg-rose-50/50 border-rose-100': !alert.read && alert.severity === 'critical'
              }"
              (click)="markRead.emit(alert.id)"
              (keydown.enter)="markRead.emit(alert.id)"
              tabindex="0"
              role="button"
            >
              <div class="flex items-start gap-3">
                <div class="mt-0.5">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" [ngClass]="{
                    'bg-sky-100 text-sky-600': alert.severity === 'info',
                    'bg-rose-100 text-rose-600': alert.severity === 'critical'
                  }">
                    <mat-icon class="text-sm">{{ alert.severity === 'critical' ? 'error' : 'info' }}</mat-icon>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700 leading-relaxed" [class.font-semibold]="!alert.read">
                    {{ alert.text }}
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
            <div class="flex flex-col items-center justify-center py-10 text-center">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <mat-icon class="text-slate-300 text-3xl h-auto w-auto">notifications_none</mat-icon>
              </div>
              <p class="text-sm text-slate-400 font-medium">No live alerts this session</p>
              <p class="text-xs text-slate-300 mt-1">System alerts arrive over the live link</p>
            </div>
          }

          <!-- Automation log (persisted, from /api/activities) -->
          <div class="pt-4 mt-2 border-t border-slate-100">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Automation log</p>
            @for (activity of activities(); track activity.id) {
              <div class="flex items-start gap-3 px-1 py-2">
                <div class="mt-1">
                  <div class="w-2 h-2 rounded-full" [ngClass]="activity.action === 'Start' ? 'bg-sky-400' : 'bg-slate-300'"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-slate-600">
                    <span class="font-semibold">{{ activity.chain_name }}</span> · {{ activity.action }}
                    <span class="text-slate-400">({{ activity.trigger }})</span>
                  </p>
                  <p class="text-[10px] text-slate-400">{{ activity.timestamp | date:'short' }}</p>
                </div>
              </div>
            } @empty {
              <p class="text-xs text-slate-300 px-1 py-2">No automation activity recorded yet</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPanel {
  alerts = input.required<AppAlert[]>();
  activities = input.required<ActivityRow[]>();
  unreadCount = input.required<number>();
  closed = output<void>();
  markRead = output<string>();
  markAllRead = output<void>();
}
