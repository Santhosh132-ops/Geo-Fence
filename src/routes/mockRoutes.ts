import { ZONES } from '../config/zones';

interface Point {
    lat: number;
    lng: number;
}

// Helper to find zone by approximate location
function findZoneId(point: Point): string | null {
    // Simple proximity check (within 0.005 degrees ~ 500m)
    for (const zone of ZONES) {
        const center = getCentroid(zone.polygon);
        const dist = Math.hypot(point.lat - center.lat, point.lng - center.lng);
        if (dist < 0.005) return zone.id;
    }
    return null;
}

function getCentroid(polygon: Point[]): Point {
    const lats = polygon.map(p => p.lat);
    const lngs = polygon.map(p => p.lng);
    return {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    };
}

// Hardcoded "Real Road" paths between zones
const PATHS: Record<string, Point[]> = {
    'palace-abbey': [
        { lat: 51.5014, lng: -0.1419 }, // Palace
        { lat: 51.5008, lng: -0.1390 }, // Birdcage Walk
        { lat: 51.5005, lng: -0.1350 },
        { lat: 51.5002, lng: -0.1300 },
        { lat: 51.4993, lng: -0.1273 }  // Abbey
    ],
    'abbey-eye': [
        { lat: 51.4993, lng: -0.1273 }, // Abbey
        { lat: 51.5008, lng: -0.1250 }, // Westminster Bridge Start
        { lat: 51.5012, lng: -0.1220 }, // Bridge
        { lat: 51.5033, lng: -0.1195 }  // Eye
    ],
    'eye-stpauls': [
        { lat: 51.5033, lng: -0.1195 }, // Eye
        { lat: 51.5080, lng: -0.1180 }, // Waterloo Bridge
        { lat: 51.5110, lng: -0.1170 },
        { lat: 51.5130, lng: -0.1100 }, // Fleet St
        { lat: 51.5138, lng: -0.0984 }  // St Pauls
    ],
    'stpauls-tower': [
        { lat: 51.5138, lng: -0.0984 }, // St Pauls
        { lat: 51.5110, lng: -0.0900 }, // Cannon St
        { lat: 51.5090, lng: -0.0800 },
        { lat: 51.5081, lng: -0.0759 }  // Tower
    ],
    'tower-shard': [
        { lat: 51.5081, lng: -0.0759 }, // Tower
        { lat: 51.5055, lng: -0.0754 }, // Tower Bridge
        { lat: 51.5045, lng: -0.0865 }  // Shard
    ],
    'shard-museum': [
        { lat: 51.5045, lng: -0.0865 }, // Shard
        { lat: 51.5070, lng: -0.0880 }, // London Bridge
        { lat: 51.5150, lng: -0.0900 }, // City
        { lat: 51.5170, lng: -0.1100 }, // Holborn
        { lat: 51.5194, lng: -0.1270 }  // Museum
    ],
    'museum-hydepark': [
        { lat: 51.5194, lng: -0.1270 }, // Museum
        { lat: 51.5160, lng: -0.1300 }, // Oxford St
        { lat: 51.5140, lng: -0.1500 },
        { lat: 51.5120, lng: -0.1600 }, // Marble Arch
        { lat: 51.5073, lng: -0.1657 }  // Hyde Park
    ],
    'hydepark-palace': [
        { lat: 51.5073, lng: -0.1657 }, // Hyde Park
        { lat: 51.5030, lng: -0.1500 }, // Constitution Hill
        { lat: 51.5014, lng: -0.1419 }  // Palace
    ]
};

// Helper to reverse path
function reversePath(points: Point[]): Point[] {
    return [...points].reverse();
}

// Generate reverse paths and populate graph
const GRAPH: Record<string, string[]> = {};
ZONES.forEach(z => GRAPH[z.id] = []);

// Initial keys to iterate (avoid infinite loop while adding new keys)
const initialKeys = Object.keys(PATHS);

initialKeys.forEach(key => {
    const [start, end] = key.split('-');

    // Add reverse path
    const reverseKey = `${end}-${start}`;
    PATHS[reverseKey] = reversePath(PATHS[key]);

    // Build Graph (Bidirectional)
    if (!GRAPH[start]) GRAPH[start] = [];
    if (!GRAPH[end]) GRAPH[end] = [];

    if (!GRAPH[start].includes(end)) GRAPH[start].push(end);
    if (!GRAPH[end].includes(start)) GRAPH[end].push(start);
});

export class MockRouter {
    static getRoute(waypoints: Point[]): Point[] {
        const fullRoute: Point[] = [];

        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];

            const startId = findZoneId(start);
            const endId = findZoneId(end);

            if (startId && endId) {
                const pathSegments = this.findPath(startId, endId);
                if (pathSegments) {
                    fullRoute.push(...pathSegments);
                    continue;
                }
            }

            // Fallback if no graph path found (should be rare now)
            fullRoute.push(start);
            fullRoute.push(end);
        }

        return fullRoute;
    }

    // BFS to find path between zones
    private static findPath(startId: string, endId: string): Point[] | null {
        if (startId === endId) return [];

        const queue: { id: string; path: string[] }[] = [{ id: startId, path: [] }];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const { id, path } = queue.shift()!;

            if (id === endId) {
                return this.buildCoordinatePath(startId, path);
            }

            if (visited.has(id)) continue;
            visited.add(id);

            const neighbors = GRAPH[id] || [];
            for (const neighbor of neighbors) {
                queue.push({ id: neighbor, path: [...path, neighbor] });
            }
        }

        return null;
    }

    private static buildCoordinatePath(startId: string, zonePath: string[]): Point[] {
        const fullPath: Point[] = [];
        let currentId = startId;

        for (const nextId of zonePath) {
            const key = `${currentId}-${nextId}`;
            if (PATHS[key]) {
                // Add points, but be careful not to duplicate the join points too much
                // The end of segment A is the start of segment B.
                // We can slice(1) to avoid double points, but for now let's just push all.
                // The map polyline handles overlaps fine.
                fullPath.push(...PATHS[key]);
            }
            currentId = nextId;
        }

        return fullPath;
    }
}
