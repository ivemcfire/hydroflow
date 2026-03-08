import { Injectable, signal, computed } from '@angular/core';
import { IrrigationNode, NodeComponent, AutomationRule, Alert, WeatherData } from './models';

@Injectable({ providedIn: 'root' })
export class StateService {
  private _nodes = signal<IrrigationNode[]>([
    {
      id: 'node-1',
      name: 'North Garden',
      location: 'Backyard North',
      lastUpdate: new Date().toISOString(),
      components: [
        { id: 'p1', type: 'pump', name: 'Main Pump', status: 'off' },
        { id: 'v1', type: 'valve', name: 'Zone 1 Valve', status: 'off' },
        { id: 's1', type: 'soil_humidity', name: 'Flower Bed Sensor', status: 'active', value: 35, unit: '%' },
        { id: 's2', type: 'water_level', name: 'Tank Level', status: 'active', value: 85, unit: '%' }
      ],
      rules: [
        {
          id: 'r1',
          name: 'Morning Watering',
          type: 'schedule',
          active: true,
          runMode: 'continuous' as const,
          config: { startTime: '06:00', duration: 15, days: ['Mon', 'Wed', 'Fri'], actionComponentId: 'p1', actionValue: 'on', stopConditionType: 'duration' as const, stopDuration: 15 }
        }
      ]
    },
    {
      id: 'node-2',
      name: 'South Greenhouse',
      location: 'Greenhouse Area',
      lastUpdate: new Date().toISOString(),
      components: [
        { id: 'p2', type: 'pump', name: 'Greenhouse Pump', status: 'on' },
        { id: 's3', type: 'soil_humidity', name: 'Tomato Bed Sensor', status: 'active', value: 22, unit: '%' }
      ],
      rules: []
    }
  ]);

  private _alerts = signal<Alert[]>([]);
  private _weather = signal<WeatherData>((() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days: string[] = [];
    const today = new Date().getDay();
    for (let i = 0; i < 7; i++) {
      days.push(daysOfWeek[(today + i) % 7]);
    }

    return {
      temp: 24,
      condition: 'Sunny',
      humidity: 45,
      forecast: 'Clear sky for the next 24 hours',
      rainProbability: 5,
      dailyForecast: [
        { day: days[0], temp: 24, icon: 'wb_sunny', rainProb: 5 },
        { day: days[1], temp: 26, icon: 'wb_sunny', rainProb: 0 },
        { day: days[2], temp: 22, icon: 'partly_cloudy_day', rainProb: 20 },
        { day: days[3], temp: 19, icon: 'water_drop', rainProb: 80 },
        { day: days[4], temp: 20, icon: 'cloud', rainProb: 40 },
        { day: days[5], temp: 23, icon: 'partly_cloudy_day', rainProb: 10 },
        { day: days[6], temp: 25, icon: 'wb_sunny', rainProb: 0 }
      ]
    };
  })());

  nodes = this._nodes.asReadonly();
  alerts = this._alerts.asReadonly();
  weather = this._weather.asReadonly();

  unreadAlertsCount = computed(() => this._alerts().filter(a => !a.read).length);

  activePumps = computed(() => {
    const all = this._nodes().flatMap(n => n.components.filter(c => c.type === 'pump'));
    return { active: all.filter(p => p.status === 'on').length, total: all.length };
  });

  averageWaterLevel = computed(() => {
    const sensors = this._nodes().flatMap(n => n.components.filter(c => c.type === 'water_level' && c.value !== undefined));
    if (sensors.length === 0) return 0;
    return Math.round(sensors.reduce((sum, s) => sum + (s.value || 0), 0) / sensors.length);
  });

  totalActiveRules = computed(() => {
    return this._nodes().flatMap(n => n.rules.filter(r => r.active)).length;
  });

  markAllAlertsAsRead() {
    this._alerts.update(alerts => alerts.map(a => ({ ...a, read: true })));
  }

  addNode(node: IrrigationNode) {
    this._nodes.update(nodes => [...nodes, node]);
  }

  updateNode(id: string, updates: Partial<IrrigationNode>) {
    this._nodes.update(nodes => nodes.map(n => n.id === id ? { ...n, ...updates, lastUpdate: new Date().toISOString() } : n));
  }

  removeNode(id: string) {
    this._nodes.update(nodes => nodes.map(n => n.id === id ? { ...n, id: 'DELETED' } : n).filter(n => n.id !== 'DELETED'));
  }

  addComponent(nodeId: string, component: NodeComponent) {
    this._nodes.update(nodes => nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, components: [...n.components, component], lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  }

  updateComponent(nodeId: string, componentId: string, updates: Partial<NodeComponent>) {
    this._nodes.update(nodes => nodes.map(n => {
      if (n.id === nodeId) {
        const components = n.components.map(c => c.id === componentId ? { ...c, ...updates } : c);
        return { ...n, components, lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  }

  removeComponent(nodeId: string, componentId: string) {
    this._nodes.update(nodes => nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, components: n.components.filter(c => c.id !== componentId), lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  }

  addRule(nodeId: string, rule: AutomationRule) {
    this._nodes.update(nodes => nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, rules: [...n.rules, rule], lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  }

  updateRule(nodeId: string, ruleId: string, updates: Partial<AutomationRule>) {
    this._nodes.update(nodes => nodes.map(n => {
      if (n.id === nodeId) {
        const rules = n.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
        return { ...n, rules, lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  }

  removeRule(nodeId: string, ruleId: string) {
    this._nodes.update(nodes => nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, rules: n.rules.filter(r => r.id !== ruleId), lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  }

  addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      read: false
    };
    this._alerts.update(alerts => [newAlert, ...alerts]);
  }

  markAlertAsRead(id: string) {
    this._alerts.update(alerts => alerts.map(a => a.id === id ? { ...a, read: true } : a));
  }

  updateWeather(weather: WeatherData) {
    this._weather.set(weather);
  }
}
