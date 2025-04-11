#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <DFRobotDFPlayerMini.h>
#include <HardwareSerial.h>

const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

WebSocketsServer webSocket = WebSocketsServer(8765);

// BMP180 & MPU6050 (I2C)
Adafruit_BMP085 bmp;
MPU6050 mpu;

// GPS UART1
HardwareSerial GPS(1);
TinyGPSPlus gps;

// MP3 Player UART2
HardwareSerial MP3(2);
DFRobotDFPlayerMini player;

// Pins
const int heartRatePin = 36;
const int squeezePin = 27;
const int ledPin = 13;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Initialize sensors
  Wire.begin(21, 22);
  
  if (!bmp.begin()) {
    Serial.println("BMP180 not found!");
  }
  
  mpu.initialize();
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed!");
  }
  
  GPS.begin(9600, SERIAL_8N1, 17, 16);
  MP3.begin(9600, SERIAL_8N1, 25, 26);
  
  if (player.begin(MP3)) {
    player.volume(25);
  }
  
  pinMode(heartRatePin, INPUT);
  pinMode(squeezePin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  webSocket.loop();
  
  // Read sensor data
  float temperature = bmp.readTemperature();
  int heartRate = readHeartRate();
  double lat = gps.location.lat();
  double lng = gps.location.lng();
  
  // Create JSON object
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["heartRate"] = heartRate;
  doc["location"]["lat"] = lat;
  doc["location"]["lng"] = lng;
  
  // Convert to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send to all connected clients
  webSocket.broadcastTXT(jsonString);
  
  // Update GPS data
  while (GPS.available()) {
    gps.encode(GPS.read());
  }
  
  delay(1000);
}

int readHeartRate() {
  static int readings[10];
  static int idx = 0;
  
  readings[idx] = analogRead(heartRatePin);
  idx = (idx + 1) % 10;
  
  int avg = 0;
  for (int i = 0; i < 10; i++) {
    avg += readings[i];
  }
  avg /= 10;
  
  // Convert analog reading to BPM (simplified)
  return map(avg, 0, 4095, 60, 100);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      Serial.printf("[%u] Connected!\n", num);
      break;
    case WStype_TEXT:
      // Handle incoming messages if needed
      break;
  }
}