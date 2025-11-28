# Geofence Event Processing Service

A real-time vehicle tracking and geofencing system built with Node.js, TypeScript, and Fastify. This project demonstrates production-grade geofence monitoring with an interactive web dashboard for visualizing vehicle movements across London's iconic landmarks.

🌐 **Live Demo**: [https://geo-fence.onrender.com/](https://geo-fence.onrender.com/)

---

## 🎯 Project Overview

This service processes vehicle location events and determines whether vehicles are inside or outside predefined geographic zones (geofences). It features a sophisticated web dashboard with real-time simulation, point-to-point navigation, and visual route tracking.

### Key Features

- **Real-time Geofence Detection**: Accurate point-in-polygon algorithm for zone boundary detection
- **Interactive Map Dashboard**: Built with Leaflet.js showing live vehicle positions and zone boundaries
- **Smart Route Planning**: Point-to-point navigation with automatic intermediate zone detection
- **Auto-Drive Simulation**: Realistic vehicle movement along actual London roads using OSRM routing
- **Route Progress Tracking**: Visual feedback showing completed, current, and upcoming zones
- **Robust Zone Transitions**: Debounce logic to handle GPS jitter and ensure accurate state changes
- **RESTful API**: Clean endpoints for event processing and vehicle status queries

---

## 🏗️ Architecture & Design Decisions

### Tech Stack Rationale

**Backend: Node.js + TypeScript + Fastify**
- **TypeScript**: Chosen for type safety and better developer experience. Critical for maintaining data integrity in geospatial calculations.
- **Fastify**: Selected over Express for its superior performance (~65% faster) and built-in TypeScript support. Geofencing requires low-latency event processing.
- **TypeBox**: Provides runtime validation with compile-time type inference, ensuring API contracts are enforced.

**Frontend: Vanilla JavaScript + Leaflet.js**
- **No Framework**: Kept lightweight to minimize bundle size and maximize performance. The UI is simple enough that a framework would add unnecessary overhead.
- **Leaflet.js**: Industry-standard mapping library with excellent polygon rendering and marker management.
- **OSRM API**: Open-source routing engine for realistic road-based navigation (vs straight-line paths).

**Deployment: Render**
- **Why Render**: Provides a free tier with automatic deployments from GitHub. While it has cold starts (~30-60s after inactivity), it offers reliable Node.js hosting without configuration complexity.
- **Alternative Considered**: Vercel was tested but proved incompatible with persistent server architecture (designed for serverless functions, not long-running servers).

### Architectural Approach

**1. Domain-Driven Design**
```
src/
├── domain/          # Core business logic (geofencing, state management)
├── routes/          # API endpoints (events, vehicles)
├── config/          # Zone definitions
└── server.ts        # Application entry point
```

**2. In-Memory State Management**
- Vehicle states are stored in-memory for fast access
- Acceptable for demo/prototype; would use Redis/PostgreSQL in production
- Enables sub-millisecond response times for status queries

**3. Point-in-Polygon Algorithm**
- Implemented ray-casting algorithm for accurate polygon containment checks
- Handles complex polygon shapes (not just rectangles)
- O(n) complexity where n = polygon vertices (acceptable for small zones)

**4. Robust Zone Transition Logic**
- **Debounce Mechanism**: Requires 3 consecutive detections before confirming zone change (prevents GPS jitter)
- **Sequential Progress**: Route steps only advance in order (prevents out-of-sequence updates)
- **Distance Sum Filtering**: Intermediate zones must be within 10% of direct path distance (prevents illogical detours)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or 20+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Santhosh132-ops/Geo-Fence.git
cd Geo-Fence

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

This uses `tsx` for hot-reloading during development.

---

## 📡 API Documentation

### POST `/events`
Submit a vehicle location event.

**Request Body:**
```json
{
  "vehicleId": "taxi-001",
  "timestamp": "2024-11-28T10:30:00Z",
  "location": {
    "lat": 51.5074,
    "lng": -0.1278
  }
}
```

**Response:**
```json
{
  "vehicleId": "taxi-001",
  "currentZoneId": "city_center",
  "state": "inside",
  "lastSeen": "2024-11-28T10:30:00Z",
  "location": { "lat": 51.5074, "lng": -0.1278 },
  "transition": {
    "from": null,
    "to": "city_center",
    "timestamp": "2024-11-28T10:30:00Z"
  }
}
```

### GET `/vehicles/:id`
Query current status of a vehicle.

**Response:**
```json
{
  "vehicleId": "taxi-001",
  "currentZoneId": "city_center",
  "state": "inside",
  "lastSeen": "2024-11-28T10:30:00Z",
  "location": { "lat": 51.5074, "lng": -0.1278 }
}
```

### GET `/zones`
Retrieve all defined geofence zones.

**Response:**
```json
[
  {
    "id": "city_center",
    "name": "City Center",
    "polygon": [
      { "lat": 51.5150, "lng": -0.1300 },
      { "lat": 51.5150, "lng": -0.1200 },
      ...
    ]
  }
]
```

---

## 🗺️ Using the Dashboard

### Auto-Drive Simulation
1. Click **"Start Auto-Drive"** to begin a pre-programmed tour of London landmarks
2. Watch the vehicle move along realistic roads
3. Observe zone transitions with toast notifications
4. Track progress in the route overlay (top-right of map)

### Custom Route Planning
1. Select a **Start Point** from the dropdown
2. Select a **Destination Point**
3. Click **"Start Trip"**
4. The system automatically calculates intermediate zones along the optimal path
5. Vehicle follows the route with visual progress tracking

### Manual Testing
Use the terminal panel to send custom API requests:
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "taxi-001",
    "timestamp": "2024-11-28T10:30:00Z",
    "location": {"lat": 51.5074, "lng": -0.1278}
  }'
```

---

## 🧪 Testing Approach

### Automated Tests
```bash
npm test
```

Tests cover:
- Point-in-polygon algorithm accuracy
- Zone transition state machine
- API endpoint validation
- Edge cases (boundary conditions, GPS jitter)

### Manual Verification
1. **Zone Boundaries**: Verified by visual inspection on map
2. **Route Accuracy**: Tested with multiple start/destination combinations
3. **Debounce Logic**: Confirmed by rapid location updates near zone edges
4. **Performance**: Tested with 100+ rapid events (< 5ms response time)

---

## 🏙️ Defined Zones

The system monitors 9 iconic London landmarks:

| Zone ID | Name | Description |
|---------|------|-------------|
| `tower_of_london` | Tower of London | Historic castle on the Thames |
| `london_eye` | London Eye | Giant Ferris wheel |
| `buckingham_palace` | Buckingham Palace | Royal residence |
| `british_museum` | British Museum | World-famous museum |
| `the_shard` | The Shard | Tallest building in UK |
| `westminster_abbey` | Westminster Abbey | Gothic church |
| `st_pauls` | St Paul's Cathedral | Iconic dome cathedral |
| `hyde_park` | Hyde Park | Large central park |
| `city_center` | City Center | Financial district |

---

## 🔧 Configuration

### Adding New Zones

Edit `src/config/zones.ts`:

```typescript
{
  id: 'new_zone',
  name: 'Display Name',
  polygon: [
    { lat: 51.5074, lng: -0.1278 },
    { lat: 51.5084, lng: -0.1268 },
    // ... more vertices (clockwise or counter-clockwise)
  ]
}
```

**Tips:**
- Use at least 4 vertices for accurate boundaries
- Avoid overlapping zones (causes ambiguous detections)
- Keep polygons convex when possible (better performance)

### Tuning Debounce Logic

In `public/app.js`, adjust:
```javascript
const ZONE_CONFIRMATION_THRESHOLD = 3; // Number of consecutive detections
```

Higher values = more stable but slower transitions  
Lower values = faster but more sensitive to GPS noise

---

## 🚀 Deployment

### Render (Current)

The project is deployed on Render with the following configuration:

**Build Command**: `npm install && npm run build`  
**Start Command**: `npm start`  
**Environment**: Node.js 20

**Note**: Free tier has cold starts (~30-60 seconds) after 15 minutes of inactivity. First request wakes the server, subsequent requests are fast.

### Alternative Platforms

**Koyeb**: Similar to Render, free tier available  
**Railway**: No longer free but offers $5 credit  
**Heroku**: Paid only (free tier discontinued)

---

## 📊 Performance Characteristics

- **Event Processing**: < 5ms average latency
- **Status Query**: < 2ms average latency
- **Zone Detection**: O(n) where n = polygon vertices (~0.1ms for typical zones)
- **Memory Usage**: ~50MB baseline + ~1KB per tracked vehicle
- **Concurrent Vehicles**: Tested up to 100 simultaneous vehicles

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Persistent Storage**: PostgreSQL + PostGIS for production-grade data persistence
- [ ] **WebSocket Support**: Real-time push notifications instead of polling
- [ ] **Historical Tracking**: Store and replay vehicle movement history
- [ ] **Multi-Tenant**: Support multiple fleets with isolated data
- [ ] **Advanced Analytics**: Dwell time, speed analysis, route optimization
- [ ] **Mobile App**: React Native companion app for drivers

### Scalability Improvements
- [ ] Redis caching layer for high-traffic scenarios
- [ ] Horizontal scaling with load balancer
- [ ] Spatial indexing (R-tree) for 1000+ zones
- [ ] Event queue (RabbitMQ/Kafka) for asynchronous processing

---

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Fork the project for your own experiments

---

## 📝 License

ISC License - Free to use for personal and commercial projects.

---

## 👤 Author

**Santhosh Kunam**

- GitHub: [@Santhosh132-ops](https://github.com/Santhosh132-ops)
- Project: [Geo-Fence](https://github.com/Santhosh132-ops/Geo-Fence)
- Live Demo: [https://geo-fence.onrender.com/](https://geo-fence.onrender.com/)

---

## 🙏 Acknowledgments

- **Leaflet.js**: Excellent open-source mapping library
- **OSRM**: Open-source routing engine for realistic navigation
- **OpenStreetMap**: Community-driven map data
- **Render**: Reliable free hosting for Node.js applications

---

**Built with ❤️ using TypeScript, Fastify, and Leaflet.js**
