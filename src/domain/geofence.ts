import { Coordinate, Zone } from './types';

/**
 * Ray-casting algorithm to check if a point is inside a polygon.
 * @param point The point to check
 * @param polygon The polygon vertices
 */
export function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;

        const intersect = ((yi > point.lat) !== (yj > point.lat))
            && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export function determineZone(location: Coordinate, zones: Zone[]): string | null {
    for (const zone of zones) {
        if (isPointInPolygon(location, zone.polygon)) {
            return zone.id;
        }
    }
    return null;
}
