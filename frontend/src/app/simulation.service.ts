import { Injectable, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StateService } from './state';

@Injectable({ providedIn: 'root' })
export class SimulationService implements OnDestroy {
    private platformId = inject(PLATFORM_ID);
    private state = inject(StateService);
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private weatherIntervalId: ReturnType<typeof setInterval> | null = null;

    start() {
        if (!isPlatformBrowser(this.platformId)) return;

        // Fluctuate sensor values every 5 seconds
        this.intervalId = setInterval(() => this.tick(), 5000);

        // Check weather-based alerts every 15 seconds
        this.weatherIntervalId = setInterval(() => this.weatherCheck(), 15000);

        // Initial tick after 2 seconds
        setTimeout(() => this.tick(), 2000);
    }

    private tick() {
        const nodes = this.state.nodes();
        for (const node of nodes) {
            for (const comp of node.components) {
                if (comp.type === 'soil_humidity' && comp.value !== undefined) {
                    // Soil humidity drifts down slowly (simulating evaporation), occasional uptick
                    const drift = Math.random() < 0.7 ? -(Math.random() * 3) : (Math.random() * 5);
                    const newVal = Math.max(5, Math.min(100, Math.round(comp.value + drift)));
                    this.state.updateComponent(node.id, comp.id, { value: newVal });

                    // Check threshold rules
                    this.checkThresholdRules(node.id, comp.id, newVal);
                }

                if (comp.type === 'water_level' && comp.value !== undefined) {
                    // Water level slowly decreases when pumps are on
                    const pumpsOn = node.components.some(c => c.type === 'pump' && c.status === 'on');
                    const drift = pumpsOn ? -(Math.random() * 2) : (Math.random() * 0.5);
                    const newVal = Math.max(0, Math.min(100, Math.round(comp.value + drift)));
                    this.state.updateComponent(node.id, comp.id, { value: newVal });

                    // Alert if water level drops below 20%
                    if (newVal < 20 && comp.value >= 20) {
                        this.state.addAlert({
                            nodeId: node.id,
                            message: `⚠️ ${comp.name} on "${node.name}" is critically low (${newVal}%)!`,
                            severity: 'error'
                        });
                    }
                }
            }
        }
    }

    private checkThresholdRules(nodeId: string, sensorId: string, sensorValue: number) {
        const node = this.state.nodes().find(n => n.id === nodeId);
        if (!node) return;

        for (const rule of node.rules) {
            if (rule.type === 'threshold' && rule.active && rule.config.sensorId === sensorId) {
                if (rule.config.threshold !== undefined && sensorValue < rule.config.threshold) {
                    // Auto-trigger: turn on the action component
                    if (rule.config.actionComponentId) {
                        const actionComp = node.components.find(c => c.id === rule.config.actionComponentId);
                        if (actionComp && actionComp.status === 'off') {
                            this.state.updateComponent(nodeId, rule.config.actionComponentId, { status: 'on' });
                            this.state.addAlert({
                                nodeId,
                                message: `🤖 Auto: "${rule.name}" triggered — ${actionComp.name} turned ON (sensor at ${sensorValue}%)`,
                                severity: 'info'
                            });
                        }
                    }
                }
            }
        }
    }

    private weatherCheck() {
        const weather = this.state.weather();
        const nodes = this.state.nodes();

        if (weather.rainProbability > 70) {
            for (const node of nodes) {
                const activePumps = node.components.filter(c => c.type === 'pump' && c.status === 'on');
                if (activePumps.length > 0) {
                    this.state.addAlert({
                        nodeId: node.id,
                        message: `🌧️ Rain probability is ${weather.rainProbability}% — consider turning off pumps on "${node.name}"`,
                        severity: 'warning'
                    });
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.weatherIntervalId) clearInterval(this.weatherIntervalId);
    }
}
