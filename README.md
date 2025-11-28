# 🌍 Geofence Event Processing Service

A robust, production-grade Node.js service for tracking vehicles and detecting geofence boundary crossings in real-time. This project simulates a sophisticated fleet management system capable of tracking vehicles across iconic London landmarks.

---

## 🛠️ Tech Stack

This project leverages a modern, high-performance technology stack:

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/) (v20+)
-   **Framework**: [Fastify](https://fastify.dev/) (Low overhead, high performance)
-   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing for reliability)
-   **Validation**: [TypeBox](https://github.com/sinclair/typebox) (JSON Schema validation)
-   **Testing**: [Vitest](https://vitest.dev/) (Unit & Integration testing)

### Frontend
-   **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
-   **Maps**: [Leaflet.js](https://leafletjs.com/) (Interactive maps)
-   **Tiles**: [OpenStreetMap](https://www.openstreetmap.org/)
-   **Routing**: [OSRM API](http://project-osrm.org/) (Real-world road navigation)

### Deployment
-   **Platform**: [Vercel](https://vercel.com/) (Serverless Functions)

---

## 🚀 Features

### 1. Real-Time Geofencing
-   **Ray-Casting Algorithm**: Efficient Point-in-Polygon detection to instantly determine if a vehicle is inside a zone.
-   **Event Sourcing**: Processes telemetry events (`lat`, `lng`, `timestamp`) and emits state transitions (`ENTER`, `EXIT`).

### 2. Smart Navigation & Routing
-   **Grand Tour Mode**: Automatically drives a simulated vehicle through 8+ iconic London landmarks (Buckingham Palace, Tower of London, etc.).
-   **Custom Point-to-Point**: Select a **Start** and **Destination**, and the system calculates a route.
-   **Strict "Distance Sum" Logic**: The route generator intelligently includes *only* intermediate zones that are strictly along the path (within a 10% detour limit), ensuring logical and direct routes.

### 3. Robust Detection Engine
-   **Immediate Entry**: Instantly detects when a vehicle enters a zone for responsive feedback.
-   **Debounced Exit**: Requires 3 consecutive confirmations before marking a vehicle as "Exited" to prevent flickering due to GPS jitter.
-   **Slash-on-Exit**: Visual feedback (strikethrough) is applied *only* when the vehicle physically leaves a zone.

### 4. Interactive Dashboard
-   **Live Map**: Visualizes zones, vehicle position, and active route path.
-   **Route Progress Overlay**: Shows a dynamic itinerary list that updates in real-time as you drive.
-   **Toast Alerts**: Displays "Alert :" notifications for zone transitions.
-   **Terminal**: A built-in command-line interface to manually send API requests (`curl` style).

---

## 🧪 How to Test

### Prerequisites
-   Node.js installed.
-   Internet connection (for Map tiles and OSRM routing).

### Step-by-Step Guide

1.  **Installation**:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` in your browser.

3.  **Test Auto-Drive (Grand Tour)**:
    -   Click the **"Start Grand Tour"** button.
    -   Watch the car drive through London.
    -   Observe the **Itinerary List** on the top right. Zones will turn **Blue** when entered and **Green (Slashed)** when exited.

4.  **Test Custom Route**:
    -   Select **"Hyde Park"** as Start.
    -   Select **"Tower of London"** as Destination.
    -   Click **"Start Trip"**.
    -   Notice that **"City Center"** is automatically added as an intermediate stop because it lies on the path.
    -   Notice that **"London Eye"** is *excluded* because it would require a detour.

5.  **Test Manual Input (Terminal)**:
    -   Open the **Terminal** tab in the UI.
    -   Paste a command like:
        ```bash
        curl -X POST http://localhost:3000/events -d '{"vehicleId": "taxi-001", "location": {"lat": 51.5014, "lng": -0.1419}}'
        ```
    -   See the response and map update instantly.

---

## 🎯 Project Outcome

This project demonstrates a **production-ready** approach to geospatial services. It solves common challenges like:
-   **GPS Jitter**: Handled via debounce logic.
-   **Route Ambiguity**: Solved via "Distance Sum" filtering.
-   **Performance**: Optimized using Fastify and efficient algorithms.
-   **UX**: Provides clear, immediate feedback through a polished UI.

---

## 🌍 Real-Life Use Cases

1.  **Logistics & Supply Chain**: Automatically track when delivery trucks enter/exit warehouses or distribution centers to trigger inventory updates.
2.  **Ride-Sharing**: Detect when a taxi enters a congestion zone (like Central London) to automatically apply surcharges.
3.  **Parental Control / Safety**: Alert parents when a child arrives at school or leaves a safe zone.
4.  **Tourism**: Create interactive city tours where an app narrates facts as tourists enter specific landmarks (similar to the "Grand Tour" feature).
5.  **Asset Tracking**: Monitor high-value assets (construction equipment, containers) to ensure they stay within designated sites.

---

## 📜 License
ISC
