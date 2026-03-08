import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WeatherData } from '../models';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="glass-card rounded-2xl p-2 flex justify-between items-center overflow-x-auto scrollbar-hide">
      @for (day of weather().dailyForecast; track day.day) {
        <div class="flex flex-col items-center justify-center min-w-[3.5rem] p-2 rounded-xl transition-all hover:bg-white/50 cursor-default group">
          <span class="text-[10px] font-bold text-slate-500 mb-1 group-hover:text-slate-700 transition-colors">{{ day.day }}</span>
          <mat-icon class="text-[20px] h-auto w-auto mb-1" [ngClass]="{
            'text-yellow-500': day.icon.includes('sunny'),
            'text-sky-400': !day.icon.includes('sunny')
          }">{{ day.icon }}</mat-icon>
          <span class="text-xs font-bold text-slate-800">{{ day.temp }}°</span>
          @if (day.rainProb > 0) {
            <span class="text-[9px] font-bold text-sky-500 mt-0.5">{{ day.rainProb }}%</span>
          } @else {
            <span class="text-[9px] font-bold text-transparent mt-0.5">-</span>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherWidget {
  weather = input.required<WeatherData>();

  getWeatherIcon(): string {
    const condition = this.weather().condition.toLowerCase();
    if (condition.includes('sunny') || condition.includes('clear')) return 'light_mode';
    if (condition.includes('rain')) return 'water_drop';
    if (condition.includes('cloud')) return 'cloud';
    if (condition.includes('storm')) return 'thunderstorm';
    return 'cloud';
  }
}
