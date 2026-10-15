/*
  Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for Performance Monitoring
  
  Firmware: ev_esp32_firmware.ino
  Target MCU: ESP32 (e.g. NodeMCU ESP-32S / ESP32 DevKit V1)

  HARDWARE PIN ASSIGNMENTS (Preserved exactly):
  - Servo Motor Signal:        GPIO 18 (PWM, 50Hz)
  - NPN RPM Proximity Sensor:   GPIO 5  (Interrupt, FALLING edge)
  - DHT11 Climatic Sensor:     GPIO 4  (Single-wire digital)
  - MPU6050 6-Axis IMU SDA:    GPIO 21 (I2C Data)
  - MPU6050 6-Axis IMU SCL:    GPIO 22 (I2C Clock)

  LIBRARIES REQUIRED:
  - WiFi (Built-in ESP32)
  - WebServer (Built-in ESP32 HTTP Server)
  - Wire (Built-in I2C)
  - ESP32Servo (by Kevin Harrington / John K. Bennett)
  - Adafruit_MPU6050 (by Adafruit)
  - Adafruit_Sensor (Unified sensor driver)
  - DHT sensor library (by Adafruit)

  CORE ARCHITECTURAL FEATURES:
  1. Non-blocking millis()-driven Servo Sequence:
     Preserves exact 10-minute test sequence & logical angles:
     20°, 22°, 28°, 20°, 15°, 30°, 28°, 26°, 15°, 30°, 0°
     Output is reverse mapped: outputAngle = 180 - logicalAngle.
  2. FreeRTOS-safe RPM Calculation:
     Volatile pulse counter safely sampled inside critical section.
     RPM = (pulses * 60000) / (PPR * elapsed_ms). Configurable PPR.
  3. Cached Real-Time Sensor Acquisition:
     DHT11 read every 2500ms; MPU6050 read every 200ms; RPM evaluated every 1000ms.
     HTTP requests return latest cached reading instantly without blocking the I2C bus or DHT.
  4. Full REST HTTP API with CORS:
     - GET /api/status   -> device health, uptime, sensor init states, WiFi RSSI
     - GET /api/sensors  -> latest verified sensor JSON packet (null if sensor uninit/read failed)
*/

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <ESP32Servo.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const char* DEVICE_ID = "ev-esp32-01";
const char* FIRMWARE_VERSION = "2.1.0-NONBLOCKING-HTTP";

// Wi-Fi Credentials - Configure for your local Wi-Fi router / mobile hotspot
// Note: ESP32 only connects to 2.4 GHz Wi-Fi networks.
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Hardware Pins
#define PIN_SERVO      18
#define PIN_RPM_SENSOR 5
#define PIN_DHT        4
#define PIN_I2C_SDA    21
#define PIN_I2C_SCL    22

#define DHTTYPE DHT11

// RPM Sensor Configuration
volatile unsigned long isrPulseCounter = 0;
volatile unsigned long lastIsrMicros = 0;
const unsigned long DEBOUNCE_MICROS = 1000; // 1ms software debounce for noisy NPN optical/magnetic pulses

// Configurable pulses per revolution (defaults to 1 per original project spec)
unsigned int pulsesPerRevolution = 1; 

// ============================================================================
// 2. HARDWARE DRIVERS & GLOBAL OBJECTS
// ============================================================================
Servo throttleServo;
DHT dht(PIN_DHT, DHTTYPE);
Adafruit_MPU6050 mpu;
WebServer server(80);

// Hardware status flags
bool dhtInitialized = false;
bool mpuInitialized = false;
bool servoAttached = false;

// ============================================================================
// 3. CACHED SENSOR TELEMETRY STATE
// ============================================================================
struct SensorState {
  // DHT11
  float temperature_c;
  float humidity_percent;
  bool dht_valid;
  unsigned long last_dht_read_ms;

  // RPM
  long rpm_value;
  unsigned long total_pulse_count;
  bool motor_rotating;
  unsigned long last_rpm_calc_ms;

  // MPU6050
  float accel_x_ms2;
  float accel_y_ms2;
  float accel_z_ms2;
  float gyro_x_rads;
  float gyro_y_rads;
  float gyro_z_rads;
  float mpu_temperature_c;
  bool mpu_valid;
  unsigned long last_mpu_read_ms;

  // Servo
  int commanded_angle_deg;
  int output_angle_deg;
  bool test_active;
  int current_stage_index;
  unsigned long test_start_ms;
  unsigned long test_remaining_ms;
} telemetry;

// Critical section portMUX for atomic RPM reading
portMUX_TYPE isrMux = portMUX_INITIALIZER_UNLOCKED;

// ============================================================================
// 4. NON-BLOCKING SERVO SEQUENCE STATE MACHINE
// ============================================================================
/*
  Original Sequence specification:
  20°, 22°, 28°, 20°, 15°, 30°, 28°, 26°, 15°, 30°, and finally 0°.
  Total sequence duration calibrated to ~10 minutes (600,000 ms) with realistic hold periods.
*/
struct ServoStage {
  int targetAngle;
  int stepDelayMs;
  unsigned long holdDurationMs;
  const char* description;
};

const ServoStage SERVO_STAGES[] = {
  { 20, 80,  50000, "0 -> 20° ACCEL RAMP" },
  { 22, 80,  45000, "20 -> 22° FINE STEP" },
  { 28, 60,  60000, "22 -> 28° CRUISE ACCEL" },
  { 20, 100, 50000, "28 -> 20° DECELERATION" },
  { 15, 100, 45000, "20 -> 15° COASTING" },
  { 30, 60,  70000, "15 -> 30° MID CRUISE POWER" },
  { 28, 80,  45000, "30 -> 28° AERODYNAMIC TRIM" },
  { 26, 80,  45000, "28 -> 26° TRIM RECOVERY" },
  { 15, 100, 50000, "26 -> 15° REGEN COAST" },
  { 30, 60,  80000, "15 -> 30° RE-ACCELERATION" },
  { 0,  120, 30000, "30 -> 0° CONTROLLED STOP" }
};

const int NUM_SERVO_STAGES = sizeof(SERVO_STAGES) / sizeof(SERVO_STAGES[0]);

enum ServoStateEnum {
  SERVO_INIT,
  SERVO_MOVING,
  SERVO_HOLDING,
  SERVO_COMPLETED
};

ServoStateEnum servoState = SERVO_INIT;
int currentServoLogicalAngle = 0;
int currentStageIdx = 0;
unsigned long lastServoStepMs = 0;
unsigned long holdStartMs = 0;
unsigned long totalSequenceDurationMs = 0;

int reverseAngle(int logicalAngle) {
  int clamped = constrain(logicalAngle, 0, 30);
  return 180 - clamped;
}

// ============================================================================
// 5. INTERRUPT SERVICE ROUTINE FOR NPN RPM SENSOR
// ============================================================================
void IRAM_ATTR rpmInterruptHandler() {
  unsigned long currentMicros = micros();
  if (currentMicros - lastIsrMicros >= DEBOUNCE_MICROS) {
    isrPulseCounter++;
    lastIsrMicros = currentMicros;
  }
}

// ============================================================================
// 6. HTTP API HANDLERS WITH CORS
// ============================================================================
void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
}

void handleOptions() {
  sendCorsHeaders();
  server.send(204);
}

void handleGetStatus() {
  sendCorsHeaders();

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"online\":true,";
  json += "\"uptime_ms\":" + String(millis()) + ",";
  json += "\"firmware_version\":\"" + String(FIRMWARE_VERSION) + "\",";
  json += "\"wifi\":{";
  json += "\"ssid\":\"" + WiFi.SSID() + "\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI());
  json += "},";
  json += "\"hardware\":{";
  json += "\"dht11_initialized\":" + String(dhtInitialized ? "true" : "false") + ",";
  json += "\"mpu6050_initialized\":" + String(mpuInitialized ? "true" : "false") + ",";
  json += "\"servo_attached\":" + String(servoAttached ? "true" : "false");
  json += "},";
  json += "\"last_data_timestamp_ms\":" + String(millis());
  json += "}";

  server.send(200, "application/json", json);
}

void handleGetSensors() {
  sendCorsHeaders();

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"uptime_ms\":" + String(millis()) + ",";
  json += "\"timestamp_ms\":" + String(millis()) + ",";

  // DHT11
  json += "\"dht11\":{";
  if (telemetry.dht_valid) {
    json += "\"temperature_c\":" + String(telemetry.temperature_c, 2) + ",";
    json += "\"humidity_percent\":" + String(telemetry.humidity_percent, 2) + ",";
    json += "\"valid\":true";
  } else {
    json += "\"temperature_c\":null,";
    json += "\"humidity_percent\":null,";
    json += "\"valid\":false";
  }
  json += "},";

  // RPM
  json += "\"rpm\":{";
  json += "\"value\":" + String(telemetry.rpm_value) + ",";
  json += "\"pulse_count\":" + String(telemetry.total_pulse_count) + ",";
  json += "\"pulses_per_revolution\":" + String(pulsesPerRevolution) + ",";
  json += "\"motor_rotating\":" + String(telemetry.motor_rotating ? "true" : "false") + ",";
  json += "\"valid\":true";
  json += "},";

  // MPU6050
  json += "\"mpu6050\":{";
  if (telemetry.mpu_valid) {
    json += "\"accel_x_ms2\":" + String(telemetry.accel_x_ms2, 3) + ",";
    json += "\"accel_y_ms2\":" + String(telemetry.accel_y_ms2, 3) + ",";
    json += "\"accel_z_ms2\":" + String(telemetry.accel_z_ms2, 3) + ",";
    json += "\"gyro_x_rads\":" + String(telemetry.gyro_x_rads, 4) + ",";
    json += "\"gyro_y_rads\":" + String(telemetry.gyro_y_rads, 4) + ",";
    json += "\"gyro_z_rads\":" + String(telemetry.gyro_z_rads, 4) + ",";
    json += "\"temperature_c\":" + String(telemetry.mpu_temperature_c, 2) + ",";
    json += "\"valid\":true";
  } else {
    json += "\"accel_x_ms2\":null,";
    json += "\"accel_y_ms2\":null,";
    json += "\"accel_z_ms2\":null,";
    json += "\"gyro_x_rads\":null,";
    json += "\"gyro_y_rads\":null,";
    json += "\"gyro_z_rads\":null,";
    json += "\"temperature_c\":null,";
    json += "\"valid\":false";
  }
  json += "},";

  // Servo
  json += "\"servo\":{";
  json += "\"commanded_angle_deg\":" + String(telemetry.commanded_angle_deg) + ",";
  json += "\"output_angle_deg\":" + String(telemetry.output_angle_deg) + ",";
  json += "\"test_active\":" + String(telemetry.test_active ? "true" : "false") + ",";
  json += "\"current_stage\":\"" + String(SERVO_STAGES[currentStageIdx].description) + "\",";
  json += "\"remaining_duration_ms\":" + String(telemetry.test_remaining_ms);
  json += "}";

  json += "}";

  server.send(200, "application/json", json);
}

void handleNotFound() {
  sendCorsHeaders();
  server.send(404, "application/json", "{\"error\":\"Endpoint not found\"}");
}

// ============================================================================
// 7. SENSOR ACQUISITION ROUTINES (NON-BLOCKING)
// ============================================================================

// DHT11 read (nominally every 2500ms)
void updateDHT11() {
  unsigned long now = millis();
  if (now - telemetry.last_dht_read_ms < 2500) {
    return;
  }
  telemetry.last_dht_read_ms = now;

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    telemetry.dht_valid = false;
    Serial.println("[DHT11] Warning: Failed to read from sensor!");
  } else {
    telemetry.temperature_c = t;
    telemetry.humidity_percent = h;
    telemetry.dht_valid = true;
  }
}

// MPU6050 read (nominally every 200ms)
void updateMPU6050() {
  unsigned long now = millis();
  if (now - telemetry.last_mpu_read_ms < 200) {
    return;
  }
  telemetry.last_mpu_read_ms = now;

  if (!mpuInitialized) {
    telemetry.mpu_valid = false;
    return;
  }

  sensors_event_t a, g, temp;
  if (mpu.getEvent(&a, &g, &temp)) {
    // Accelerometer in m/s² (±8g range configured)
    telemetry.accel_x_ms2 = a.acceleration.x;
    telemetry.accel_y_ms2 = a.acceleration.y;
    telemetry.accel_z_ms2 = a.acceleration.z;

    // Gyroscope in rad/s (±500 deg/s range, Adafruit returns rad/s)
    telemetry.gyro_x_rads = g.gyro.x;
    telemetry.gyro_y_rads = g.gyro.y;
    telemetry.gyro_z_rads = g.gyro.z;

    // Internal die temperature
    telemetry.mpu_temperature_c = temp.temperature;
    telemetry.mpu_valid = true;
  } else {
    telemetry.mpu_valid = false;
  }
}

// NPN RPM calculation (evaluated every 1000ms)
void updateRPM() {
  unsigned long now = millis();
  unsigned long elapsedMs = now - telemetry.last_rpm_calc_ms;
  if (elapsedMs < 1000) {
    return;
  }

  // Atomically grab pulse counter from ISR
  unsigned long pulses;
  portENTER_CRITICAL(&isrMux);
  pulses = isrPulseCounter;
  isrPulseCounter = 0;
  portEXIT_CRITICAL(&isrMux);

  telemetry.last_rpm_calc_ms = now;
  telemetry.total_pulse_count += pulses;

  // RPM Formula: (pulses * 60,000) / (PPR * elapsed_ms)
  if (elapsedMs > 0 && pulsesPerRevolution > 0) {
    telemetry.rpm_value = (long)((pulses * 60000UL) / (pulsesPerRevolution * elapsedMs));
  } else {
    telemetry.rpm_value = 0;
  }

  telemetry.motor_rotating = (telemetry.rpm_value > 0);
}

// Non-blocking servo sequence execution
void updateServoStateMachine() {
  unsigned long now = millis();

  // Calculate remaining sequence duration
  if (telemetry.test_active) {
    unsigned long elapsed = now - telemetry.test_start_ms;
    if (elapsed < totalSequenceDurationMs) {
      telemetry.test_remaining_ms = totalSequenceDurationMs - elapsed;
    } else {
      telemetry.test_remaining_ms = 0;
    }
  } else {
    telemetry.test_remaining_ms = 0;
  }

  switch (servoState) {
    case SERVO_INIT:
      throttleServo.write(reverseAngle(0));
      currentServoLogicalAngle = 0;
      currentStageIdx = 0;
      servoState = SERVO_MOVING;
      lastServoStepMs = now;
      telemetry.test_active = true;
      telemetry.test_start_ms = now;
      Serial.println("\n[SERVO] Non-blocking 10-minute test sequence started.");
      break;

    case SERVO_MOVING: {
      const ServoStage& stage = SERVO_STAGES[currentStageIdx];
      if (now - lastServoStepMs >= (unsigned long)stage.stepDelayMs) {
        lastServoStepMs = now;

        if (currentServoLogicalAngle < stage.targetAngle) {
          currentServoLogicalAngle++;
        } else if (currentServoLogicalAngle > stage.targetAngle) {
          currentServoLogicalAngle--;
        }

        throttleServo.write(reverseAngle(currentServoLogicalAngle));
        telemetry.commanded_angle_deg = currentServoLogicalAngle;
        telemetry.output_angle_deg = reverseAngle(currentServoLogicalAngle);

        if (currentServoLogicalAngle == stage.targetAngle) {
          servoState = SERVO_HOLDING;
          holdStartMs = now;
          Serial.printf("[SERVO] Reached target %d° [%s]. Holding for %lu ms\n",
            stage.targetAngle, stage.description, stage.holdDurationMs);
        }
      }
      break;
    }

    case SERVO_HOLDING: {
      const ServoStage& stage = SERVO_STAGES[currentStageIdx];
      if (now - holdStartMs >= stage.holdDurationMs) {
        currentStageIdx++;
        if (currentStageIdx >= NUM_SERVO_STAGES) {
          servoState = SERVO_COMPLETED;
          telemetry.test_active = false;
          throttleServo.write(reverseAngle(0));
          currentServoLogicalAngle = 0;
          telemetry.commanded_angle_deg = 0;
          telemetry.output_angle_deg = reverseAngle(0);
          Serial.println("\n[SERVO] >>> 10-MINUTE TEST SEQUENCE COMPLETED! Actuator at 0° <<<");
        } else {
          servoState = SERVO_MOVING;
          lastServoStepMs = now;
          Serial.printf("\n[SERVO] Transitioning to Stage %d: %s\n",
            currentStageIdx + 1, SERVO_STAGES[currentStageIdx].description);
        }
      }
      break;
    }

    case SERVO_COMPLETED:
      // Held at 0° idle
      break;
  }
}

// Periodic Serial Monitor diagnostics (every 2000ms)
void printSerialDiagnostics() {
  static unsigned long lastPrintMs = 0;
  if (millis() - lastPrintMs < 2000) return;
  lastPrintMs = millis();

  Serial.println("--------------------------------------------------");
  Serial.printf("UPTIME: %lu ms | IP: %s | WiFi: %s (%d dBm)\n",
    millis(), WiFi.localIP().toString().c_str(), WiFi.SSID().c_str(), WiFi.RSSI());

  if (telemetry.dht_valid) {
    Serial.printf("[DHT11] Temp: %.1f °C | Humidity: %.1f %%\n",
      telemetry.temperature_c, telemetry.humidity_percent);
  } else {
    Serial.println("[DHT11] Status: SENSOR UNAVAILABLE");
  }

  Serial.printf("[RPM] Current: %ld RPM | Pulses: %lu | Motor: %s\n",
    telemetry.rpm_value, telemetry.total_pulse_count,
    telemetry.motor_rotating ? "SPINNING" : "STOPPED");

  if (telemetry.mpu_valid) {
    Serial.printf("[MPU6050] Accel (m/s²): X=%.2f, Y=%.2f, Z=%.2f | Die Temp: %.1f °C\n",
      telemetry.accel_x_ms2, telemetry.accel_y_ms2, telemetry.accel_z_ms2,
      telemetry.mpu_temperature_c);
    Serial.printf("[MPU6050] Gyro (rad/s): X=%.3f, Y=%.3f, Z=%.3f\n",
      telemetry.gyro_x_rads, telemetry.gyro_y_rads, telemetry.gyro_z_rads);
  } else {
    Serial.println("[MPU6050] Status: SENSOR UNAVAILABLE");
  }

  Serial.printf("[SERVO] Logical: %d° | Output: %d° | Active: %s | Stage: %s\n",
    telemetry.commanded_angle_deg, telemetry.output_angle_deg,
    telemetry.test_active ? "YES" : "NO",
    SERVO_STAGES[currentStageIdx].description);
}

// ============================================================================
// 8. SETUP & INITIALIZATION
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=======================================================");
  Serial.println("  DESIGN & DEVELOPMENT OF IOT-BASED TWO-WHEELER EV");
  Serial.println("  PROTOTYPE FOR PERFORMANCE MONITORING - ESP32 FIRMWARE");
  Serial.println("=======================================================");

  // 1. Calculate total sequence duration
  totalSequenceDurationMs = 0;
  for (int i = 0; i < NUM_SERVO_STAGES; i++) {
    int angleDelta = abs(SERVO_STAGES[i].targetAngle - (i == 0 ? 0 : SERVO_STAGES[i-1].targetAngle));
    totalSequenceDurationMs += (angleDelta * SERVO_STAGES[i].stepDelayMs) + SERVO_STAGES[i].holdDurationMs;
  }
  Serial.printf("[INIT] Total calibrated test duration: %lu seconds (~%.1f mins)\n",
    totalSequenceDurationMs / 1000, (float)totalSequenceDurationMs / 60000.0);

  // 2. Initialize NPN RPM Sensor Interrupt
  pinMode(PIN_RPM_SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_RPM_SENSOR), rpmInterruptHandler, FALLING);
  Serial.printf("[INIT] NPN RPM Sensor attached to GPIO %d (FALLING interrupt)\n", PIN_RPM_SENSOR);

  // 3. Initialize DHT11
  dht.begin();
  dhtInitialized = true;
  Serial.printf("[INIT] DHT11 initialized on GPIO %d\n", PIN_DHT);

  // 4. Initialize I2C Bus and MPU6050
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  if (mpu.begin()) {
    mpuInitialized = true;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("[INIT] Adafruit MPU6050 initialized (±8g Accel, ±500 deg/s Gyro, 21Hz Bandwidth)");
  } else {
    mpuInitialized = false;
    Serial.println("[INIT] ERROR: MPU6050 not detected at 0x68. Verify Wire(21, 22) connections.");
  }

  // 5. Initialize Servo Actuator
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  throttleServo.setPeriodHertz(50);
  throttleServo.attach(PIN_SERVO, 500, 2500);
  servoAttached = true;
  throttleServo.write(reverseAngle(0));
  Serial.printf("[INIT] 40 kg-cm Actuator attached to GPIO %d (Reverse mapped 180-angle)\n", PIN_SERVO);

  // 6. Connect to Wi-Fi
  Serial.printf("[WIFI] Connecting to SSID: %s ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Attempt connection up to 15 seconds; continue even if offline so sensor loop runs locally
  unsigned long wifiStartMs = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wifiStartMs < 15000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected successfully!");
    Serial.printf("[WIFI] IP Address: http://%s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WIFI] Status Endpoint:  http://%s/api/status\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WIFI] Sensor Endpoint:  http://%s/api/sensors\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Warning: Wi-Fi connection timed out. Sensors will run in offline mode.");
    Serial.println("[WIFI] Configure correct SSID and Password in the firmware headers.");
  }

  // 7. Configure HTTP Web Server Endpoints
  server.on("/api/status", HTTP_GET, handleGetStatus);
  server.on("/api/sensors", HTTP_GET, handleGetSensors);
  server.on("/api/status", HTTP_OPTIONS, handleOptions);
  server.on("/api/sensors", HTTP_OPTIONS, handleOptions);
  server.onNotFound(handleNotFound);
  server.begin();
  Serial.println("[HTTP] REST Web Server listening on port 80");

  telemetry.last_dht_read_ms = 0;
  telemetry.last_mpu_read_ms = 0;
  telemetry.last_rpm_calc_ms = millis();
}

// ============================================================================
// 9. MAIN LOOP - NON-BLOCKING EXECUTION
// ============================================================================
void loop() {
  // Handle HTTP client requests instantly
  server.handleClient();

  // Acquire sensor data according to sensor-specific nominal frequencies
  updateDHT11();
  updateMPU6050();
  updateRPM();

  // Run non-blocking servo test state machine
  updateServoStateMachine();

  // Output periodic Serial Monitor debugging
  printSerialDiagnostics();

  // Wi-Fi auto-reconnect maintenance
  static unsigned long lastWifiCheckMs = 0;
  if (millis() - lastWifiCheckMs > 10000) {
    lastWifiCheckMs = millis();
    if (WiFi.status() != WL_CONNECTED && strcmp(WIFI_SSID, "YOUR_WIFI_SSID") != 0) {
      Serial.println("[WIFI] Disconnected! Attempting auto-reconnect...");
      WiFi.reconnect();
    }
  }

  // Cooperative task yield
  yield();
}
