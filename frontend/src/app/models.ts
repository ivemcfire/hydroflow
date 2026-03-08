export type ComponentType = 'pump' | 'valve' | 'water_level' | 'soil_humidity';

export interface NodeComponent {
  id: string;
  type: ComponentType;
  name: string;
  status: 'on' | 'off' | 'active' | 'inactive';
  value?: number; // For sensors
  unit?: string;
}

export type RunMode = 'once' | 'continuous';

export interface AutomationRule {
  id: string;
  name: string;
  type: 'schedule' | 'threshold';
  active: boolean;
  runMode: RunMode;
  config: {
    // Schedule
    startTime?: string;
    duration?: number; // minutes
    days?: string[];
    // Condition (threshold)
    conditionSensorId?: string;
    conditionOperator?: 'below' | 'above';
    conditionValue?: number;
    // Action
    actionComponentId?: string;
    actionValue?: 'on' | 'off';
    // Stop condition
    stopConditionType?: 'duration' | 'sensor_reaches' | 'none';
    stopDuration?: number; // minutes
    stopSensorId?: string;
    stopSensorValue?: number;
    // Legacy compat
    threshold?: number;
    sensorId?: string;
  };
}

export interface IrrigationNode {
  id: string;
  name: string;
  location: string;
  components: NodeComponent[];
  rules: AutomationRule[];
  lastUpdate: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  forecast: string;
  rainProbability: number;
  dailyForecast: { day: string; temp: number; icon: string; rainProb: number }[];
}

export interface Alert {
  id: string;
  timestamp: string;
  nodeId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  read: boolean;
}
