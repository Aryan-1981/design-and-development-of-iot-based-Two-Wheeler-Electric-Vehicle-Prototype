# Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for Performance Monitoring

A comprehensive, engineering-grade IoT telemetry monitoring dashboard and ESP32 firmware solution for a two-wheeler electric vehicle prototype.

---

## 1. Project Overview & Mandatory Title

**"Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for Performance Monitoring"**

This system acquires real-time telemetry from an ESP32 microcontroller over local Wi-Fi, rendering interactive charts and status indicators for:
- **NPN RPM Sensor (GPIO 5):** Motor shaft rotational speed and pulse counting.
- **DHT11 Climatic Sensor (GPIO 4):** Controller/battery ambient temperature (°C) and relative humidity (%).
- **MPU6050 6-Axis IMU (I2C GPIO 21/22):** Dynamic chassis acceleration (m/s²), gyroscope angular velocity (rad/s), and internal silicon die temperature (°C).
- **Servo Actuator (GPIO 18):** 10-minute non-blocking test sequence tracking commanded angle (0–30°) and output command (180 - angle).
- **Simulated Electrical Values (Voltage & Current):** Clearly isolated and labeled simulated pack voltage (V) and motor ammeter (A).

---

## 2. Hardware Pinout & Wiring

| Hardware Module | ESP32 Pin | Interface / Protocol | Operating Notes |
| :--- | :--- | :--- | :--- |
| **NPN Proximity / RPM Sensor** | **GPIO 5** | Hardware Interrupt (`FALLING`) | Configurable PPR = 1. Internal pullup enabled. |
| **DHT11 Climatic Sensor** | **GPIO 4** | Digital 1-Wire Single-Bus | Read non-blocking every ~2500ms. |
| **MPU6050 IMU SDA** | **GPIO 21** | I2C Data (`Wire.begin(21, 22)`) | Addr `0x68`. ±8g accelerometer, ±500°/s gyro. |
| **MPU6050 IMU SCL** | **GPIO 22** | I2C Clock | 400kHz bus speed. 21Hz digital filter. |
| **Servo Actuator (40 kg-cm)**| **GPIO 18** | PWM (50Hz) | 500–2500µs pulse width. Logical 0–30°. |

---

## 3. ESP32 Firmware Instructions

The firmware is located in [`firmware/ev_esp32_firmware.ino`](file:///Users/ak/Documents/projects/Design%20and%20Development%20of%20IoT-Based%20Two-Wheeler%20Electric%20Vehicle%20Prototype%20for%20Performance%20Monitoring%20%20/firmware/ev_esp32_firmware.ino).

### Requirements & Libraries:
In the Arduino IDE or PlatformIO, install:
- `ESP32Servo` (by Kevin Harrington / John K. Bennett)
- `Adafruit MPU6050` (by Adafruit)
- `Adafruit Unified Sensor` (by Adafruit)
- `DHT sensor library` (by Adafruit)

### Flashing Steps:
1. Open [`firmware/ev_esp32_firmware.ino`](file:///Users/ak/Documents/projects/Design%20and%20Development%20of%20IoT-Based%20Two-Wheeler%20Electric%20Vehicle%20Prototype%20for%20Performance%20Monitoring%20%20/firmware/ev_esp32_firmware.ino) in Arduino IDE.
2. Update your local Wi-Fi SSID and Password:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```
   *(Note: ESP32 only connects to 2.4 GHz Wi-Fi).*
3. Select board: **ESP32 Dev Module** (or your specific ESP32 variant) and select the serial port.
4. Click **Upload**.
5. Open Serial Monitor at **115200 baud**.
6. The ESP32 will print its assigned IP address:
   ```
   [WIFI] Connected successfully!
   [WIFI] IP Address: http://192.168.1.100
   [WIFI] Status Endpoint:  http://192.168.1.100/api/status
   [WIFI] Sensor Endpoint:  http://192.168.1.100/api/sensors
   ```

### Verifying Endpoints in Browser or Terminal:
```bash
# Check device status & hardware init
curl http://192.168.1.100/api/status

# Check live real sensor JSON readings
curl http://192.168.1.100/api/sensors
```

---

## 4. Running the Web Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle (optional verification)
npm run build
```

Open your browser at `http://127.0.0.1:5173/`:
- **Scroll-Controlled Opening Animation:** Scroll down to advance through all 300 sequential 1440p motorcycle video frames; scroll up to reverse.
- **Enter Dashboard:** Click "Explore Telemetry Dashboard" or scroll past the hero container to transition seamlessly into the live sensor dashboard.
- **Configure ESP32 Target IP:** Click the "Config IP" button in the dashboard header to point the dashboard to your ESP32's local Wi-Fi IP address.

---

## 5. Supabase & Vercel Deployment Architecture

### Vercel Deployment:
- Deploy the frontend via standard Vite settings on Vercel.
- Configure public environment variable `VITE_ESP32_BASE_URL` in `.env.example`.
- *Note:* Browsers hosted on public Vercel HTTPS URLs cannot directly access local non-HTTPS private IP addresses (`http://192.168.x.x`) due to browser Mixed Content policies. For remote access outside local Wi-Fi, publish telemetry to Supabase or an MQTT broker as documented in [`src/pages/AboutProjectPage.tsx`](file:///Users/ak/Documents/projects/Design%20and%20Development%20of%20IoT-Based%20Two-Wheeler%20Electric%20Vehicle%20Prototype%20for%20Performance%20Monitoring%20%20/src/pages/AboutProjectPage.tsx).

### Proposed Supabase Schema:
```sql
CREATE TABLE public.vehicle_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    device_id VARCHAR(64) NOT NULL DEFAULT 'ev-esp32-01',
    uptime_ms BIGINT NOT NULL,
    temperature_c NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    dht_valid BOOLEAN DEFAULT false,
    rpm INTEGER,
    pulse_count BIGINT,
    pulses_per_revolution INTEGER DEFAULT 1,
    accel_x_ms2 NUMERIC(7, 3),
    accel_y_ms2 NUMERIC(7, 3),
    accel_z_ms2 NUMERIC(7, 3),
    gyro_x_rads NUMERIC(8, 4),
    gyro_y_rads NUMERIC(8, 4),
    gyro_z_rads NUMERIC(8, 4),
    mpu_temperature_c NUMERIC(5, 2),
    mpu_valid BOOLEAN DEFAULT false,
    servo_commanded_angle SMALLINT,
    servo_output_angle SMALLINT,
    servo_test_active BOOLEAN
);
```
