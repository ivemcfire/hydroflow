// Mock commands for now - in a real scenario this would publish MQTT messages
const commands = {
    toggleValve: (id, state) => console.log(`[COMMAND] Valve ${id} -> ${state}`),
    togglePump: (id, state) => console.log(`[COMMAND] Pump ${id} -> ${state}`)
};

const state = {};

function ensureState(tankId) {
    if (!state[tankId]) {
        state[tankId] = { filling: false, lastStart: null };
    }
}

const services = {
    checkTankLevels: async (tankId, sensorLow, sensorHigh) => {
        ensureState(tankId);
        // 1. If water is below 10% and we aren't already filling...
        if (sensorLow === true && !state[tankId].filling) {
            console.log(`[ALERT] ${tankId} is LOW. Triggering Refill Chain...`);
            await services.startRefill(tankId);
        }

        // 2. If water is above 90% and we ARE filling...
        if (sensorHigh === true && state[tankId].filling) {
            console.log(`[SUCCESS] ${tankId} is FULL. Stopping Pump...`);
            await services.stopRefill(tankId);
        }
        
        // 3. SAFETY: If filling for more than 20 mins without hitting 90%
        if (state[tankId].filling && (Date.now() - state[tankId].lastStart > 1200000)) {
            console.error(`[CRITICAL] ${tankId} Fill Timeout! Potential leak or pump failure.`);
            await services.stopRefill(tankId);
            // Trigger another chain!
            // await services.sendEmergencyAlert("Tank Fill Timeout");
        }
    },

    startRefill: async (tankId) => {
        state[tankId].filling = true;
        state[tankId].lastStart = Date.now();
        commands.toggleValve(`Valve_${tankId}_Inlet`, "ON");
        commands.togglePump(`Pump_Main`, "ON");
    },

    stopRefill: async (tankId) => {
        state[tankId].filling = false;
        commands.toggleValve(`Valve_${tankId}_Inlet`, "OFF");
        // Only stop pump if NO OTHER tanks are filling (we can plan this later)
    },

    dryRunProtection: async (waterLevel, pumpId, tankId) => {
        if (waterLevel < 20) {
            console.error(`[SAFETY] Dry Run Protection Triggered! Water Level: ${waterLevel}%`);
            commands.togglePump(pumpId, "OFF");
            if (state[tankId] && state[tankId].filling) {
                await services.stopRefill(tankId);
            }
        }
    }
};

module.exports = { services, state };