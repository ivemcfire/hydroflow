import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IrrigationNode } from '../models';

@Component({
  selector: 'app-node-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div
      class="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer group relative overflow-hidden ripple-effect"
      [class.hover:-translate-y-1]="!editing()"
      (click)="onCardClick($event)"
      tabindex="0"
      (keydown.enter)="nodeSelect.emit(node())"
    >
      <!-- Waterfall accent on hover -->
      <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="absolute bottom-0 left-0 right-0 h-1 flow-line opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div class="flex justify-between items-start mb-4">
        <div class="flex-1 min-w-0 mr-3">
          @if (editing()) {
            <input
              type="text"
              [ngModel]="editName()"
              (ngModelChange)="editName.set($event)"
              (keydown.enter)="saveEdit()"
              (keydown.escape)="cancelEdit()"
              (click)="$event.stopPropagation()"
              class="edit-input text-lg font-semibold w-full mb-1"
              placeholder="Node name"
            />
            <input
              type="text"
              [ngModel]="editLocation()"
              (ngModelChange)="editLocation.set($event)"
              (keydown.enter)="saveEdit()"
              (keydown.escape)="cancelEdit()"
              (click)="$event.stopPropagation()"
              class="edit-input text-sm w-full"
              placeholder="Zone / Location"
            />
            <div class="flex gap-2 mt-2">
              <button
                (click)="saveEdit(); $event.stopPropagation()"
                class="px-3 py-1 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
              >Save</button>
              <button
                (click)="cancelEdit(); $event.stopPropagation()"
                class="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >Cancel</button>
            </div>
          } @else {
            <h3 class="text-xl font-semibold text-slate-800 group-hover:text-sky-600 transition-colors truncate">{{ node().name }}</h3>
            <p class="text-sm text-slate-500 flex items-center gap-1">
              <mat-icon class="text-xs h-auto w-auto">location_on</mat-icon>
              {{ node().location }}
            </p>
          }
        </div>
        <div class="flex items-center gap-1.5">
          @if (!editing()) {
            <button
              (click)="startEdit(); $event.stopPropagation()"
              class="p-1.5 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Edit name & zone"
            >
              <mat-icon class="text-sm">edit</mat-icon>
            </button>
          }
          <div class="bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 p-2.5 rounded-xl group-hover:shadow-lg group-hover:shadow-sky-100 transition-all">
            <mat-icon>hub</mat-icon>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-slate-50 p-3 rounded-xl text-center">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Devices</p>
          <p class="text-lg font-semibold text-slate-700">{{ node().components.length }}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-xl text-center">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Rules</p>
          <p class="text-lg font-semibold text-slate-700">{{ node().rules.length }}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-xl text-center">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Active</p>
          <p class="text-lg font-semibold" [ngClass]="{
            'text-emerald-600': getActiveCount() > 0,
            'text-slate-400': getActiveCount() === 0
          }">{{ getActiveCount() }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-400">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Online
        </span>
        <span>Updated {{ node().lastUpdate | date:'shortTime' }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeCard {
  node = input.required<IrrigationNode>();
  nodeSelect = output<IrrigationNode>();
  nodeUpdated = output<{ id: string; name: string; location: string }>();

  editing = signal(false);
  editName = signal('');
  editLocation = signal('');

  getActiveCount(): number {
    return this.node().components.filter(c => c.status === 'on' || c.status === 'active').length;
  }

  onCardClick(event: Event) {
    if (!this.editing()) {
      this.nodeSelect.emit(this.node());
    }
  }

  startEdit() {
    this.editName.set(this.node().name);
    this.editLocation.set(this.node().location);
    this.editing.set(true);
  }

  saveEdit() {
    const name = this.editName().trim();
    const location = this.editLocation().trim();
    if (name) {
      this.nodeUpdated.emit({ id: this.node().id, name, location: location || 'Unassigned' });
    }
    this.editing.set(false);
  }

  cancelEdit() {
    this.editing.set(false);
  }
}
