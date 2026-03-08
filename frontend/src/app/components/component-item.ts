import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NodeComponent, ComponentType } from '../models';

@Component({
  selector: 'app-component-item',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-4 bg-white rounded-xl border border-slate-100 hover:border-sky-200 transition-all duration-300 group ripple-effect">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div [ngClass]="{
            'bg-sky-50 text-sky-500': component().type === 'pump',
            'bg-indigo-50 text-indigo-500': component().type === 'valve',
            'bg-emerald-50 text-emerald-500': component().type === 'soil_humidity',
            'bg-amber-50 text-amber-500': component().type === 'water_level'
          }" class="p-3 rounded-xl transition-all" [class.pulse-glow]="component().status === 'on' || component().status === 'active'">
            <mat-icon>{{ getIcon(component().type) }}</mat-icon>
          </div>
          <div>
            @if (editing()) {
              <input
                type="text"
                [ngModel]="editValue()"
                (ngModelChange)="editValue.set($event)"
                (keydown.enter)="saveName()"
                (keydown.escape)="cancelEdit()"
                (blur)="saveName()"
                class="edit-input text-sm font-semibold"
              />
            } @else {
              <h4
                class="font-semibold text-slate-800 cursor-pointer hover:text-sky-600 transition-colors"
                (dblclick)="startEdit()"
                title="Double-click to rename"
              >{{ component().name }}</h4>
            }
            <p class="text-xs text-slate-400 uppercase tracking-wider font-bold">{{ component().type.replace('_', ' ') }}</p>
          </div>
        </div>

        <div class="flex items-center gap-6">
          @if (component().value !== undefined) {
            <div class="text-right">
              <p class="text-lg font-bold text-slate-700">{{ component().value }}{{ component().unit }}</p>
              <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 liquid-progress">
                <div
                  class="h-full transition-all duration-1000 rounded-full"
                  [ngClass]="{
                    'bg-emerald-400': (component().value ?? 0) > 60,
                    'bg-amber-400': (component().value ?? 0) > 30 && (component().value ?? 0) <= 60,
                    'bg-rose-400': (component().value ?? 0) <= 30
                  }"
                  [style.width.%]="component().value"
                ></div>
              </div>
            </div>
          } @else {
            <button
              (click)="toggleStatus.emit(component())"
              [ngClass]="component().status === 'on' ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' : 'bg-slate-100 text-slate-400'"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              {{ component().status.toUpperCase() }}
            </button>
          }
        </div>
      </div>

      <!-- Delete button at the bottom, separated from toggle -->
      @if (confirmingDelete()) {
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p class="text-xs text-rose-600 font-medium">Remove this component?</p>
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
        <div class="mt-2 pt-2 border-t border-transparent opacity-0 group-hover:opacity-100 group-hover:border-slate-50 transition-all flex justify-end">
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
export class ComponentItem {
  component = input.required<NodeComponent>();
  toggleStatus = output<NodeComponent>();
  delete = output<string>();
  nameChanged = output<{ id: string; name: string }>();

  editing = signal(false);
  editValue = signal('');
  confirmingDelete = signal(false);

  getIcon(type: ComponentType): string {
    switch (type) {
      case 'pump': return 'water';
      case 'valve': return 'plumbing';
      case 'soil_humidity': return 'grass';
      case 'water_level': return 'waves';
      default: return 'settings';
    }
  }

  startEdit() {
    this.editValue.set(this.component().name);
    this.editing.set(true);
  }

  saveName() {
    const newName = this.editValue().trim();
    if (newName && newName !== this.component().name) {
      this.nameChanged.emit({ id: this.component().id, name: newName });
    }
    this.editing.set(false);
  }

  cancelEdit() {
    this.editing.set(false);
  }

  confirmDelete() {
    this.delete.emit(this.component().id);
    this.confirmingDelete.set(false);
  }
}
