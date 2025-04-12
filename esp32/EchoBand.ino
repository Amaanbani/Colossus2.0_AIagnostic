#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_BMP085_U.h>
#include <Adafruit_MPU6050.h>
#include <DFRobotDFPlayerMini.h>

// ====== WiFi Config ======
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// ====== WebSocket ======
WebSocketsServer webSocket = WebSocketsServer(8765);

// ====== Sensors ======
Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);
Adafruit_MPU6050 mpu;

// ====== GPS (UART1) ======
HardwareSerial GPS(1);

// ====== DFPlayer Mini (UART2) ======
HardwareSerial MP3(2);
DFRobotDFPlayerMini player;

// ====== Pins ======
#define HEART_SENSOR_PIN 34
#define LED_PIN 13

// ====== Heart Rate Detection ======
int threshold = 350;
int sensorValue = 0;
unsigned long lastBeatTime = 0;
unsigned long beatCooldown = 500;
int bpm = 0;
bool beatDetected = false;

// ====== Timers ======
unsigned long lastSend = 0;
unsigned long dfplayerTimer = 0;

// ====== WebSocket Event Declaration ======
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);

String latestGPS = "";

void setup() {
  Serial.begin(115200);
  pinMode(HEART_SENSOR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.println(WiFi.localIP());

  // WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // I2C Init
  Wire.begin(21, 22);

  // BMP180
  if (!bmp.begin()) {
    Serial.println("BMP180 not found!");
  }

  // MPU6050
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found!");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // GPS UART1 (GPIO 17 TX, 16 RX)
  GPS.begin(9600, SERIAL_8N1, 17, 16);

  // DFPlayer Mini UART2 (GPIO 25 TX, 26 RX)
  MP3.begin(9600, SERIAL_8N1, 25, 26);
  if (player.begin(MP3)) {
    player.volume(25);
    player.play(2);  // Welcome sound
    dfplayerTimer = millis();
  } else {
    Serial.println("DFPlayer failed to start.");
  }
}

void loop() {
  webSocket.loop();

  // Heart Rate Sensor
  sensorValue = analogRead(HEART_SENSOR_PIN);
  unsigned long currentTime = millis();
  if (sensorValue > threshold && !beatDetected && currentTime - lastBeatTime > beatCooldown) {
    bpm = 60000 / (currentTime - lastBeatTime);
    lastBeatTime = currentTime;
    beatDetected = true;
  } else if (sensorValue < threshold) {
    beatDetected = false;
  }

  // BMP180 Readings
  sensors_event_t bmp_event;
  float temperature = 0, pressure = 0, altitude = 0;
  bmp.getEvent(&bmp_event);
  if (bmp_event.pressure) {
    bmp.getTemperature(&temperature);
    pressure = bmp_event.pressure;
    altitude = bmp.pressureToAltitude(1013.25, pressure);
  }

  // MPU6050 Readings
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Read raw GPS NMEA sentence
  while (GPS.available()) {
    char c = GPS.read();
    if (c == '$') latestGPS = ""; // new sentence
    latestGPS += c;
  }

  // DFPlayer track rotation
  if (millis() - dfplayerTimer > 9000) {
    dfplayerTimer = millis();
    player.next();
  }

  // Send JSON via WebSocket
  if (millis() - lastSend > 1000) {
    lastSend = millis();

    StaticJsonDocument<512> doc;
    doc["bpm"] = bpm;
    doc["temperature"] = temperature;
    doc["pressure"] = pressure;
    doc["altitude"] = altitude;

    JsonArray accel = doc.createNestedArray("accel");
    accel.add(a.acceleration.x);
    accel.add(a.acceleration.y);
    accel.add(a.acceleration.z);

    JsonArray gyro = doc.createNestedArray("gyro");
    gyro.add(g.gyro.x);
    gyro.add(g.gyro.y);
    gyro.add(g.gyro.z);

    doc["mpuTemp"] = temp.temperature;

    // Send raw GPS sentence (parse on frontend or later in firmware)
    doc["gpsRaw"] = latestGPS;

    String output;
    serializeJson(doc, output);
    webSocket.broadcastTXT(output);
  }

  delay(50);
}

// WebSocket Event Handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      Serial.printf("[%u] Connected!\n", num);
      break;
    case WStype_TEXT:
      Serial.printf("[%u] Message: %s\n", num, payload);
      break;
  }
}
