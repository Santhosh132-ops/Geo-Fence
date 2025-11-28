export interface Coordinate {
    lat: number;
    lng: number;
}

export interface Zone {
    id: string;
    name: string;
    polygon: Coordinate[]; // List of vertices
}

export interface VehicleEvent {
    vehicleId: string;
    timestamp: string; // ISO 8601
    location: Coordinate;
}

export type VehicleState = 'inside' | 'outside';

export interface VehicleStatus {
    vehicleId: string;
    currentZoneId: string | null; // null if outside all known zones
    state: VehicleState;
    lastSeen: string;
    location: Coordinate;
}
