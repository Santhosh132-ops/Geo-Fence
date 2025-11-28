# Geofence Event Processing Service

A robust, production-grade Node.js service for tracking vehicles and detecting geofence boundary crossings.

## 🚀 Features
-   **Real-time Geofencing**: Uses Ray-Casting algorithm for efficient point-in-polygon detection.
-   **Interactive Dashboard**: Live map visualization using Leaflet.js.
-   **High Performance**: Built on Fastify with JSON Schema validation.
-   **Type Safe**: 100% TypeScript codebase.

## 🛠️ Setup & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Open Dashboard**:
    Visit [http://localhost:3000](http://localhost:3000)

4.  **Run Tests**:
    ```bash
    npm test
    ```

## 🏗️ Design Decisions

### Architecture
-   **Layered Structure**: Separated `domain` (logic), `routes` (API), and `config` (data) for maintainability.
-   **In-Memory Store**: Used `Map<string, VehicleStatus>` for O(1) access time. This meets the challenge requirements for speed and simplicity but is designed to be replaceable with Redis.

### Algorithms
-   **Ray-Casting**: Chosen over heavy GIS libraries (like Turf.js) to keep the bundle size small and performance high for simple polygon checks.

## 🔮 Future Improvements (Given more time)
1.  **Persistence**: Replace in-memory storage with **Redis** (for speed) and **PostgreSQL/PostGIS** (for historical data and complex spatial queries).
2.  **Authentication**: Add API Key or JWT authentication to secure the endpoints.
3.  **Scalability**: Dockerize the application and deploy it to a Kubernetes cluster.
4.  **Event Streaming**: Integrate **Apache Kafka** or **RabbitMQ** to handle millions of events asynchronously instead of HTTP.
5.  **Complex Zones**: Support circular zones and complex multi-polygons.

## 📦 API Documentation

### `POST /events`
Submit a telemetry update.
```json
{
  "vehicleId": "taxi-001",
  "timestamp": "2023-11-28T10:00:00Z",
  "location": { "lat": 51.470, "lng": -0.450 }
}
```

### `GET /vehicles/:id`
Get current status.
```json
{
  "vehicleId": "taxi-001",
  "currentZoneId": "airport",
  "state": "inside"
}
```
