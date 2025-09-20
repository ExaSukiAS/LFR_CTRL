# Line Follower Robot Controller

This repository contains the software for an Electron JS-based controller designed to manage and interact with a Bluetooth-enabled line follower robot, typically powered by an ESP32 or similar microcontroller. The application provides both manual control capabilities and advanced data insights for tuning the robot's performance.

## Features

The controller software offers a comprehensive set of features to enhance the line following experience:

### 1. Robot Control Window
*   **Manual Control:** Take direct command of your robot using intuitive keyboard arrow keys.
*   **Speed Adjustment:** Precisely control the robot's speed on the fly.

### 2. Data Insights Window
*   **PID Tuning:** Easily configure Proportional, Integral, and Derivative (PID) constants for optimal line following performance.
*   **Motor Speed Configuration:** Set minimum, maximum, and base motor speeds to suit your robot's hardware and desired behavior.
*   **Real-time IR Sensor Visualization:** An intuitive UI displays real-time readings from all IR sensors, providing immediate feedback on line detection.
*   **Error Graph:** Visualize the robot's position error over time with a dynamic graph, aiding in PID constant adjustment.
*   **Persistent Settings:** All robot settings, including PID values, are automatically saved to `PIDhistory.json` for future reference and quick recall.
*   **Data Push:** A dedicated "PUSH DATA" button allows you to instantly transmit configured PID values and other settings to the robot.
*   **Battery Level Monitor:** Keep track of your robot's power status with a real-time battery voltage display.

## Getting Started

### Prerequisites

*   Node.js and npm installed on your system.
*   An ESP32 or compatible Bluetooth-enabled microcontroller programmed with the appropriate firmware for the line follower robot.

### Installation

1.  **Clone the repository:**
    ```bash
    https://github.com/ExaSukiAS/espLFR.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To start the Electron application, use the following command:

```bash
npm start
```

## ESP32 / Microcontroller Setup

### Bluetooth Connection

The controller connects to your ESP32 via Bluetooth. Ensure your ESP32 is programmed to expose a Bluetooth serial port. Upon launching the application, you will need to select the correct COM port corresponding to your ESP32's Bluetooth connection.

### Data Communication Protocol

The communication between the Electron application and the ESP32 is based on string-formatted data, with values separated by commas.

#### Data Sent FROM Robot TO Controller (Total Length: 29 values)

The robot should send data to the software as a single string, with each value delimited by a comma. The order of data is critical:

| Index | Description            |
| :---- | :--------------------- |
| 0     | IR0 Sensor Value       |
| 1     | IR1 Sensor Value       |
| ...   | ...                    |
| 15    | IR15 Sensor Value      |
| 16    | Error (Position)       |
| 17    | Proportional (Kp) Constant |
| 18    | Integral (Ki) Constant |
| 19    | Derivative (Kd) Constant |
| 20    | Turning Speed          |
| 21    | Max Left Motor Speed   |
| 22    | Max Right Motor Speed  |
| 23    | Base Speed             |
| 24    | Battery Voltage        |
| 25    | Current Following Status (1: Following, 2: Not Following) |
| 26    | Black Stop Duration (ms) |

#### Data Sent FROM Controller TO Robot (Total Length: 15 values)

The software sends data to the ESP32 during manual control or when PID settings are pushed. The data is also a comma-separated string, following this order:

| Index | Description            |
| :---- | :--------------------- |
| 0     | Mode (0: Control, 1: Data Push, 2: Follow Track, 3: Data Collect) |
| 1     | Left Motor Control Speed |
| 2     | Right Motor Control Speed |
| 3     | Proportional (Kp) Constant |
| 4     | Integral (Ki) Constant |
| 5     | Derivative (Kd) Constant |
| 6     | Turning Speed          |
| 7     | Max Left Motor Speed   |
| 8     | Max Right Motor Speed  |
| 9     | Base Speed             |
| 10    | Black Stop Duration (ms) |
| 11    | Turning Delay (ms)     |
| 12    | Max Samples for ML     |
| 13    | Delay Between Samples for ML |
| 14    | Value (`$$##` - for data sending integrity) |


## License

This project is open-source and available under the [MIT License](LICENSE).
