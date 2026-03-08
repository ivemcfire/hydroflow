import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../state';
import { ComponentItem } from './component-item';
import { NodeComponent } from '../models';

@Component({
    selector: 'app-devices-view',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, ComponentItem],
    template: `
    <div class="space-y-6">
      <div class="flex sm:flex-row flex-col justify-between items-start sm:items-end gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <mat-icon class="text-sky-500">precision_manufacturing</mat-icon> Hardware Devices
          </h2>
          <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">All configured components</p>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select [(ngModel)]="filterNodeId" class="edit-input w-full sm:w-auto text-sm">
            <option value="">All Nodes</option>
            @for (node of state.nodes(); track node.id) {
              <option [value]="node.id">{{ node.name }}</option>
            }
          </select>
          <button (click)="openAddDevice()" class="bg-gradient-to-r from-sky-400 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:from-sky-500 hover:to-indigo-600 transition-all active:scale-95 shadow-lg shadow-sky-200 shrink-0">
            <mat-icon class="text-sm">add</mat-icon> Add Device
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (item of filteredComponents(); track item.component.id) {
          <div class="relative group h-full">
            <div class="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none">
              Node: {{ item.nodeName }}
            </div>
            <app-component-item 
              class="h-full block"
              [component]="item.component"
              (toggleStatus)="toggleComponent(item.nodeId, $event)"
              (delete)="deleteComponent(item.nodeId, $event)"
              (nameChanged)="onNameChanged(item.nodeId, $event)"
            />
          </div>
        } @empty {
          <div class="md:col-span-2 lg:col-span-3 text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <mat-icon class="text-slate-300 text-5xl h-auto w-auto mb-3">inventory_2</mat-icon>
            <p class="text-lg font-bold text-slate-500">No devices found</p>
            <p class="text-sm text-slate-400 mt-1">Add devices to your nodes to control them here.</p>
          </div>
        }
      </div>
    </div>

    <!-- Add Device Dialog Overlay -->
    @if (showAddDeviceDialog()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center fade-in">
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" tabindex="-1" role="button" (click)="showAddDeviceDialog.set(false)" (keydown.escape)="showAddDeviceDialog.set(false)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden slide-in-top">
          <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
             <div class="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-200">
                <mat-icon>settings_input_component</mat-icon>
             </div>
             <div>
               <h3 class="text-lg font-bold text-slate-800">Add Device</h3>
               <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">New hardware component</p>
             </div>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Parent Node</label>
              <select [ngModel]="newNodeId()" (ngModelChange)="newNodeId.set($event)" class="edit-input w-full text-sm">
                @for (node of state.nodes(); track node.id) {
                  <option [value]="node.id">{{ node.name }} ({{ node.location }})</option>
                }
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Device Type</label>
              <select [ngModel]="newDeviceType()" (ngModelChange)="newDeviceType.set($event)" class="edit-input w-full text-sm">
                <option value="pump">Water Pump</option>
                <option value="valve">Valve</option>
                <option value="soil_humidity">Soil Humidity Sensor</option>
                <option value="water_level">Water Level Sensor</option>
              </select>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
             <button (click)="showAddDeviceDialog.set(false)" class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-white transition-colors">Cancel</button>
             <button (click)="submitAddDevice()" [disabled]="!newNodeId() || !newDeviceType()" class="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Add Device</button>
          </div>
        </div>
      </div>
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesView {
    state = inject(StateService);

    filterNodeId = signal('');

    filteredComponents = computed(() => {
        const filterId = this.filterNodeId();
        const nodes = this.state.nodes();
        const result: { nodeId: string; nodeName: string; component: NodeComponent }[] = [];

        for (const node of nodes) {
            if (!filterId || filterId === node.id) {
                for (const comp of node.components) {
                    result.push({ nodeId: node.id, nodeName: node.name, component: comp });
                }
            }
        }
        return result;
    });

    // Add Device state
    showAddDeviceDialog = signal(false);
    newNodeId = signal('');
    newDeviceType = signal<'pump' | 'valve' | 'soil_humidity' | 'water_level'>('pump');

    openAddDevice() {
        const nodes = this.state.nodes();
        if (nodes.length > 0) {
            this.newNodeId.set(nodes[0].id);
        }
        this.newDeviceType.set('pump');
        this.showAddDeviceDialog.set(true);
    }

    submitAddDevice() {
        const nodeId = this.newNodeId();
        const type = this.newDeviceType();
        if (!nodeId || !type) return;

        const id = 'c-' + Math.random().toString(36).substring(7);
        const names: Record<string, string> = {
            pump: 'New Pump',
            valve: 'New Valve',
            soil_humidity: 'Soil Sensor',
            water_level: 'Level Sensor'
        };
        const isSensor = type === 'soil_humidity' || type === 'water_level';

        this.state.addComponent(nodeId, {
            id,
            type,
            name: names[type],
            status: isSensor ? 'active' : 'off',
            value: isSensor ? Math.floor(Math.random() * 60) + 30 : undefined,
            unit: isSensor ? '%' : undefined
        });

        this.showAddDeviceDialog.set(false);
    }

    toggleComponent(nodeId: string, component: NodeComponent) {
        if (component.type === 'pump' || component.type === 'valve') {
            const newStatus = component.status === 'on' ? 'off' : 'on';
            this.state.updateComponent(nodeId, component.id, { status: newStatus });
        }
    }

    deleteComponent(nodeId: string, componentId: string) {
        this.state.removeComponent(nodeId, componentId);
    }

    onNameChanged(nodeId: string, event: { id: string; name: string }) {
        this.state.updateComponent(nodeId, event.id, { name: event.name });
    }
}
