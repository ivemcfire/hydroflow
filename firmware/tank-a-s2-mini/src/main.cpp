#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// --- Wi-Fi & Static IP Configuration ---
const char* ssid     = "Dom na Ayurveda";
const char* password = "Ayurveda12";

IPAddress local_IP(192, 168, 100, 240);
IPAddress gateway(192, 168, 100, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(192, 168, 100, 1);
IPAddress secondaryDNS(8, 8, 8, 8);

// --- MQTT Configuration ---
const char* mqtt_server = "192.168.100.207";
const int mqtt_port     = 1883;
// Topic structured so backend sees "tank_A" as the primary sensor ID
const char* mqtt_topic  = "hydroflow/tank_A/level_low";

// --- Hardware Configuration ---
const int waterSensorPin = 7;

// --- Logic Variables ---
WiFiClient espClient;
PubSubClient client(espClient);

bool lastConfirmedState = false;  // The last state sent to the DB
bool lastRawReading     = false;  // The last direct reading from the pin
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 500; // Time in ms to wait for signal to stabilize

void setup_wifi() {
  delay(10);
  Serial.println("\n--- HydroFlow Sensor Node ---");
  Serial.printf("Connecting to %s...\n", ssid);

  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Static IP failed to configure!");
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a unique client ID for the S2 Mini
    if (client.connect("HydroFlow_S2_TankA")) {
      Serial.println("connected");
    } else {
      Serial.printf("failed, rc=%d. Retrying in 5 seconds...\n", client.state());
      delay(5000);
    }
  }
}

void setup() {
  // S2 Mini Native USB Serial
  Serial.begin(115200);
  
  pinMode(waterSensorPin, INPUT_PULLUP);
  setup_wifi();
  
  client.setServer(mqtt_server, mqtt_port);
  
  // Initial state check
  lastConfirmedState = digitalRead(waterSensorPin);
  lastRawReading = lastConfirmedState;
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Read current physical state of the pin
  bool currentRawReading = digitalRead(waterSensorPin);

  // If the pin changed (due to noise or real water movement), reset the timer
  if (currentRawReading != lastRawReading) {
    lastDebounceTime = millis();
    lastRawReading = currentRawReading;
  }

  // If the signal has been stable for longer than the delay, confirm it
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (currentRawReading != lastConfirmedState) {
      lastConfirmedState = currentRawReading;
      
      // Map Pin Logic: 
      // HIGH (1) = Pullup Active (Dry/No Water) -> "OFF" (Not Low)
      // LOW  (0) = Sensor Closed (Water Detected) -> "ON" (Tank is Low)
      const char* payload = (lastConfirmedState == HIGH) ? "OFF" : "ON";
      
      Serial.printf("State stabilized. Publishing [%s] to %s\n", payload, mqtt_topic);
      client.publish(mqtt_topic, payload, true); // true = Retain message
    }
  }
}