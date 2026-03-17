// File: src/backend/services/mqttService.ts
import mqtt from 'mqtt';
import { db } from '../firebase';
import { addSensorLog } from '../controllers/analyticsController';
import { addActivityLog } from '../controllers/activityController';
import { addNotification } from '../controllers/notificationController';

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const MQTT_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'hydroflow';

let client: mqtt.MqttClient | null = null;

export const initMqtt = () => {
  console.log(`Connecting to MQTT broker: ${MQTT_BROKER}`);
  client = mqtt.connect(MQTT_BROKER);

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to all sensor topics
    client?.subscribe(`${MQTT_TOPIC_PREFIX}/sensors/#`, (err) => {
      if (err) console.error('MQTT subscription error:', err);
      else console.log(`Subscribed to ${MQTT_TOPIC_PREFIX}/sensors/#`);
    });
  });

  client.on('message', async (topic, message) => {
    const payload = message.toString();
    console.log(`MQTT Message: ${topic} -> ${payload}`);

    try {
      // Topic structure: hydroflow/sensors/{nodeId}/{sensorName}
      const parts = topic.split('/');
      if (parts.length >= 4 && parts[1] === 'sensors') {
        const nodeId = parts[2];
        const sensorName = parts[3];
        const value = parseFloat(payload);

        if (!isNaN(value)) {
          // 1. Update Firestore with latest sensor reading
          await addSensorLog(sensorName, value, getUnitForSensor(sensorName), nodeId);

          // 2. Check for critical alerts (simplified logic)
          if (sensorName === 'Tank Level' && value < 10) {
            await addNotification('error', `CRITICAL: Tank Level at ${value}% (via MQTT)`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT error:', err);
  });
};

export const publishSensor = (nodeId: string, sensor: string, value: number) => {
  if (!client) return;
  const topic = `${MQTT_TOPIC_PREFIX}/sensors/${nodeId}/${sensor}`;
  client.publish(topic, value.toString(), { retain: true });
};

export const publishCommand = (nodeId: string, component: string, action: 'ON' | 'OFF') => {
  if (!client) {
    console.warn('MQTT client not initialized');
    return;
  }

  const topic = `${MQTT_TOPIC_PREFIX}/control/${nodeId}/${component}`;
  client.publish(topic, action, { qos: 1 }, (err) => {
    if (err) {
      console.error(`Error publishing to ${topic}:`, err);
    } else {
      console.log(`Published command: ${topic} -> ${action}`);
      addActivityLog('info', `MQTT Command: ${action} sent to ${component} on node ${nodeId}`);
    }
  });
};

const getUnitForSensor = (sensor: string): string => {
  if (sensor.includes('Moisture') || sensor.includes('Level') || sensor.includes('Humidity')) return '%';
  if (sensor.includes('Temp')) return '°C';
  if (sensor.includes('Flow')) return 'L/min';
  return '';
};
