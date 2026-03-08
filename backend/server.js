const mqtt = require('mqtt');
const express = require('express');
const { services } = require('./automations');
const db = require('./db');

// Connect to your local MQTT Broker (e.g., Mosquitto on your Fedora or a Pi)
const client = mqtt.connect('mqtt://localhost:1883');

const app = express();
const PORT = 3000;
let latestData = {};

client.on('connect', () => {
    console.log("Connected to HydroFlow MQTT Broker");
    // Subscribe to all sensor status updates
    client.subscribe('hydroflow/stat/#');
});

client.on('message', async (topic, message) => {
    const payload = message.toString();
    const [,,, deviceId, sensorType] = topic.split('/');

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
        // One task calling another!
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

app.get('/', (req, res) => {
    res.json({
        status: 'HydroFlow Backend Active',
        telemetry: latestData
    });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Backend API running at http://localhost:${PORT}`);
});