#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>

// --- Configuration ---
#define VALVE_PIN 25
#define MY_NODE_ID 1            // Unique ID for this worker node
#define WATCHDOG_TIMEOUT 30000  // 30 seconds safety timeout

// --- Command Definitions ---
#define CMD_HEARTBEAT 0  // System_OK signal
#define CMD_OPEN      1
#define CMD_CLOSE     2

// --- Data Structure ---
// Must match the Controller's structure
typedef struct struct_message {
    uint8_t target_id;
    uint8_t command;
    float value;
} struct_message;

struct_message incomingData;

// --- Global Variables ---
unsigned long lastHeartbeatTime = 0;
bool valveState = false; // false = closed, true = open

// --- Function Prototypes ---
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len);
void openValve();
void closeValve();

void setup() {
    // Initialize Serial for debugging
    Serial.begin(115200);
    Serial.println("--- ESP32 Worker Node Initializing ---");

    // Initialize Valve Pin
    pinMode(VALVE_PIN, OUTPUT);
    closeValve(); // Default to safe state (closed)

    // Initialize WiFi in Station Mode
    WiFi.mode(WIFI_STA);

    // Initialize ESP-NOW
    if (esp_now_init() != ESP_OK) {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    // Register Receive Callback
    esp_now_register_recv_cb(OnDataRecv);

    Serial.print("Worker Node Ready. ID: ");
    Serial.println(MY_NODE_ID);
    Serial.print("MAC Address: ");
    Serial.println(WiFi.macAddress());

    // Initialize heartbeat timer
    lastHeartbeatTime = millis();
}

void loop() {
    // Safety Watchdog: Check if System_OK heartbeat is lost
    if (millis() - lastHeartbeatTime > WATCHDOG_TIMEOUT) {
        if (valveState) {
            Serial.println("SAFETY WATCHDOG: System_OK lost! Closing valve.");
            closeValve();
        }
    }
    delay(100);
}

void OnDataRecv(const uint8_t * mac, const uint8_t *incomingDataBytes, int len) {
    if (len != sizeof(struct_message)) return;
    memcpy(&incomingData, incomingDataBytes, sizeof(incomingData));

    // Filter commands for this node ID
    if (incomingData.target_id != MY_NODE_ID) return;

    switch (incomingData.command) {
        case CMD_HEARTBEAT:
            lastHeartbeatTime = millis();
            // Serial.println("Heartbeat received"); // Optional debug
            break;
        case CMD_OPEN:
            Serial.println("CMD: Open Valve");
            openValve();
            break;
        case CMD_CLOSE:
            Serial.println("CMD: Close Valve");
            closeValve();
            break;
    }
}

void openValve() {
    digitalWrite(VALVE_PIN, HIGH);
    valveState = true;
}

void closeValve() {
    digitalWrite(VALVE_PIN, LOW);
    valveState = false;
}