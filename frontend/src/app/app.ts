import { ChangeDetectionStrategy, Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from './state';
import { TankCard } from './components/tank-card';
import { AlertsPanel } from './components/alerts-panel';
import { DevicesView } from './components/devices-view';
import { animate, stagger } from 'motion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule, TankCard, AlertsPanel, DevicesView],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  state = inject(StateService);
  private platformId = inject(PLATFORM_ID);

  showAlerts = signal(false);
  currentView = signal<'dashboard' | 'devices'>('dashboard');

  constructor() {
    // Hydrate from the backend and open the live WS link (browser only).
    this.state.start();

    // Entry animation when device cards first appear.
    effect(() => {
      if (isPlatformBrowser(this.platformId) && this.state.devices().length > 0) {
        setTimeout(() => {
          animate('.tank-grid-item', { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.1), duration: 0.5 });
        }, 100);
      }
    });
  }

  refreshInsights() {
    void this.state.refreshInsight();
  }

  toggleAlerts() {
    this.showAlerts.update((v) => !v);
  }

  markAlertRead(id: string) {
    this.state.markAlertAsRead(id);
  }

  markAllAlertsRead() {
    this.state.markAllAlertsAsRead();
  }
}
