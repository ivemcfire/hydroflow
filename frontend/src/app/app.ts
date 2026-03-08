import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from './state';
import { GeminiService } from './gemini.service';
import { SimulationService } from './simulation.service';
import { IrrigationNode, NodeComponent, AutomationRule } from './models';
import { NodeCard } from './components/node-card';
import { WeatherWidget } from './components/weather-widget';
import { ComponentItem } from './components/component-item';
import { RuleItem } from './components/rule-item';
import { AlertsPanel } from './components/alerts-panel';
import { AddRuleDialog } from './components/add-rule-dialog';
import { DevicesView } from './components/devices-view';
import { animate, stagger } from "motion";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NodeCard,
    WeatherWidget,
    ComponentItem,
    RuleItem,
    AlertsPanel,
    AddRuleDialog,
    DevicesView
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  state = inject(StateService);
  gemini = inject(GeminiService);
  private simulation = inject(SimulationService);
  private platformId = inject(PLATFORM_ID);

  selectedNodeId = signal<string | null>(null);
  selectedNode = computed(() =>
    this.state.nodes().find(n => n.id === this.selectedNodeId()) || null
  );

  aiInsights = signal<string>('Analyzing your system...');
  isAnalyzing = signal(false);

  // UI state
  showAlerts = signal(false);
  showAddRule = signal(false);
  editingNode = signal(false);
  editName = signal('');
  editLocation = signal('');
  confirmingNodeDelete = signal(false);

  editingRule = signal<AutomationRule | null>(null);

  currentView = signal<'dashboard' | 'devices'>('dashboard');

  constructor() {
    // Start simulation
    this.simulation.start();

    // Initial AI insight
    this.refreshInsights();

    // Animation effect
    effect(() => {
      if (isPlatformBrowser(this.platformId) && this.state.nodes().length > 0) {
        setTimeout(() => {
          animate(
            ".node-grid-item",
            { opacity: [0, 1], y: [20, 0] },
            { delay: stagger(0.1), duration: 0.5 }
          );
        }, 100);
      }
    });
  }

  async refreshInsights() {
    this.isAnalyzing.set(true);
    const insights = await this.gemini.getIrrigationInsights(this.state.nodes(), this.state.weather());
    this.aiInsights.set(insights);
    this.isAnalyzing.set(false);
  }

  selectNode(node: IrrigationNode) {
    this.selectedNodeId.set(node.id);
    this.editingNode.set(false);
    if (isPlatformBrowser(this.platformId)) {
      animate(
        ".detail-panel",
        { x: [50, 0], opacity: [0, 1] },
        { duration: 0.4, ease: "easeOut" }
      );
    }
  }

  closeDetail() {
    this.editingNode.set(false);
    this.closeAddRule();
    if (isPlatformBrowser(this.platformId)) {
      animate(
        ".detail-panel",
        { x: [0, 50], opacity: [1, 0] },
        { duration: 0.3 }
      ).finished.then(() => this.selectedNodeId.set(null));
    } else {
      this.selectedNodeId.set(null);
    }
  }

  onNodeCardUpdated(update: { id: string; name: string; location: string }) {
    this.state.updateNode(update.id, { name: update.name, location: update.location });
  }

  toggleComponent(nodeId: string, component: NodeComponent) {
    const newStatus = component.status === 'on' ? 'off' : 'on';
    this.state.updateComponent(nodeId, component.id, { status: newStatus });

    if (newStatus === 'on') {
      this.state.addAlert({
        nodeId,
        message: `${component.name} was turned ON manually.`,
        severity: 'info'
      });
    }
  }

  addQuickNode() {
    const id = 'node-' + Math.random().toString(36).substring(7);
    this.state.addNode({
      id,
      name: 'New Zone ' + (this.state.nodes().length + 1),
      location: 'Unassigned',
      lastUpdate: new Date().toISOString(),
      components: [],
      rules: []
    });
  }

  addComponent(nodeId: string, type: 'pump' | 'valve' | 'soil_humidity' | 'water_level') {
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
  }

  askDeleteNode() {
    this.confirmingNodeDelete.set(true);
  }

  confirmNodeDelete(id: string) {
    this.state.removeNode(id);
    this.confirmingNodeDelete.set(false);
    if (this.selectedNodeId() === id) this.selectedNodeId.set(null);
  }

  cancelNodeDelete() {
    this.confirmingNodeDelete.set(false);
  }

  deleteComponent(nodeId: string, componentId: string) {
    this.state.removeComponent(nodeId, componentId);
  }

  toggleRule(nodeId: string, rule: AutomationRule) {
    this.state.updateRule(nodeId, rule.id, { active: !rule.active });
  }

  deleteRule(nodeId: string, ruleId: string) {
    this.state.removeRule(nodeId, ruleId);
  }

  // ── Node Editing ──
  startEditNode() {
    const node = this.selectedNode();
    if (node) {
      this.editName.set(node.name);
      this.editLocation.set(node.location);
      this.editingNode.set(true);
    }
  }

  saveNodeEdits() {
    const node = this.selectedNode();
    if (node) {
      this.state.updateNode(node.id, {
        name: this.editName(),
        location: this.editLocation()
      });
    }
    this.editingNode.set(false);
  }

  cancelEditNode() {
    this.editingNode.set(false);
  }

  // ── Alerts ──
  toggleAlerts() {
    this.showAlerts.update(v => !v);
  }

  markAlertRead(id: string) {
    this.state.markAlertAsRead(id);
  }

  markAllAlertsRead() {
    this.state.markAllAlertsAsRead();
  }

  // ── Add/Edit Rule ──
  openAddRule() {
    this.editingRule.set(null);
    this.showAddRule.set(true);
  }

  editRule(rule: AutomationRule) {
    this.editingRule.set(rule);
    this.showAddRule.set(true);
  }

  closeAddRule() {
    this.showAddRule.set(false);
    this.editingRule.set(null);
  }

  onRuleSaved(rule: AutomationRule) {
    const node = this.selectedNode();
    if (node) {
      if (this.editingRule()) {
        this.state.updateRule(node.id, rule.id, {
          name: rule.name,
          type: rule.type,
          active: rule.active,
          runMode: rule.runMode,
          config: rule.config
        });
        this.state.addAlert({
          nodeId: node.id,
          message: `Rule "${rule.name}" updated on "${node.name}"`,
          severity: 'info'
        });
      } else {
        this.state.addRule(node.id, rule);
        this.state.addAlert({
          nodeId: node.id,
          message: `New rule "${rule.name}" created on "${node.name}"`,
          severity: 'info'
        });
      }
    }
    this.closeAddRule();
  }

  // ── Component Name Edit ──
  onComponentNameChanged(nodeId: string, event: { id: string; name: string }) {
    this.state.updateComponent(nodeId, event.id, { name: event.name });
  }
}
