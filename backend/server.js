const mqtt = require('mqtt');
const express = require('express');
const { services } = require('./automations');
const db = require('./db');

// MQTT broker — injected via K8s env var, falls back to MetalLB fixed IP
const MQTT_URL = process.env.MQTT_URL || 'mqtt://192.168.100.207:1883';
const client = mqtt.connect(MQTT_URL);

const app = express();
const PORT = process.env.PORT || 3000;
let latestData = {};

client.on('connect', () => {
    console.log(`[MQTT] Connected to ${MQTT_URL}`);
    // Topic convention: hydroflow/<device_id>/<sensor_type>
    client.subscribe('hydroflow/#');
});

client.on('message', async (topic, message) => {
    const payload = message.toString();
    // Parse: hydroflow/<deviceId>/<sensorType>
    const [, deviceId, sensorType] = topic.split('/');

    latestData[`${deviceId}/${sensorType}`] = payload;
    console.log(`[DATA] ${deviceId} ${sensorType}: ${payload}`);

    // Log telemetry to database
    let value = parseFloat(payload);
    if (isNaN(value)) {
        value = (payload === 'ON') ? 1 : (payload === 'OFF') ? 0 : null;
    }
    await db.query('INSERT INTO telemetry (device_id, sensor_type, value) VALUES ($1, $2, $3)', [deviceId, sensorType, value])
        .catch(err => console.error('[DB] Error logging telemetry:', err));

    // --- The "Chain of Command" Entry Point ---
    if (sensorType === 'level_low' && payload === 'ON') {
        await db.logActivity('Refill_Chain', 'Triggered', `${deviceId} level_low`)
            .catch(err => console.error('[DB] Error logging activity:', err));
        services.checkTankLevels(deviceId, true, false);
    }

    if (sensorType === 'level_high' && payload === 'ON') {
        await db.logActivity('Refill_Chain', 'Stop_Triggered', `${deviceId} level_high`)
            .catch(err => console.error('[DB] Error logging activity:', err));
        services.checkTankLevels(deviceId, false, true);
    }
});

// K8s liveness probe
app.get('/healthz', (req, res) => {
    res.json({ status: 'ok' });
});

// K8s readiness probe — checks DB
app.get('/readyz', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ready', db: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'not ready', db: err.message });
    }
});

app.get('/', (req, res) => {
    res.json({
        status: 'HydroFlow Backend Active',
        telemetry: latestData
    });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Backend API running at http://localhost:${PORT}`);
});
