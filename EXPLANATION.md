# Project Explanation: Geofence Service

## What is this project?
This is a **Geofencing Service**. Imagine invisible boundaries drawn on a map (like around an airport or a city center). This system tracks vehicles (like taxis) and instantly knows when they cross these boundaries.

## How it works (The "Magic" behind the scenes)

### 1. The Map (Zones)
We defined specific areas using GPS coordinates (Latitude and Longitude).
-   **International Airport**: A rectangular zone.
-   **City Center**: Another rectangular zone.

### 2. The Tracker (Ray-Casting Algorithm)
When a vehicle sends its location, we use a mathematical formula called **Ray-Casting**.
*   **Analogy**: Imagine shooting a laser beam from the vehicle's dot in one direction. If the beam crosses the zone's border an odd number of times (1, 3, 5...), the vehicle is **INSIDE**. If it crosses an even number of times (0, 2, 4...), it's **OUTSIDE**.
*   This is fast and efficient.

### 3. The Brain (State Management)
We keep a record of every vehicle in the system's memory.
*   **Enter Event**: If a car was *outside* 5 seconds ago but is *inside* now -> It just **Entered**.
*   **Exit Event**: If a car was *inside* 5 seconds ago but is *outside* now -> It just **Exited**.

## Production Grade Features
We made this "Production Ready" by adding:
1.  **Type Safety**: Using TypeScript ensures the code is strict and less prone to bugs.
2.  **Validation**: We check every piece of data coming in. If a car sends "hello" instead of a GPS number, we reject it immediately.
3.  **Testing**: We have automated tests that simulate cars driving around to prove the logic works.
4.  **Visual Dashboard**: Instead of just black-and-white text logs, we built a real-time map interface to visualize the data.

## Technology Stack
-   **Backend**: Node.js + Fastify (One of the fastest web frameworks available).
-   **Frontend**: HTML5 + CSS3 (Glassmorphism Design) + Leaflet.js (Maps).
-   **Testing**: Vitest.
