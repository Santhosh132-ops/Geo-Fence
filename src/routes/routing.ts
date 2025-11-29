import { FastifyRequest, FastifyReply } from 'fastify';

interface RouteRequest {
    waypoints: Array<{ lat: number; lng: number }>;
}

import { MockRouter } from './mockRoutes';

export async function routeHandler(
    request: FastifyRequest<{ Body: RouteRequest }>,
    reply: FastifyReply
) {
    try {
        const { waypoints } = request.body;

        if (!waypoints || waypoints.length < 2) {
            return reply.status(400).send({ error: 'At least 2 waypoints required' });
        }

        // 1. Try Mock Router (High-Def Offline Routes)
        const mockRoute = MockRouter.getRoute(waypoints);
        // If mock route has more points than just start/end pairs (meaning it found real paths)
        // The mock router returns at least 2 points per segment.
        // If we have 9 waypoints, we expect at least 9 points.
        // Let's check if it's "richer" than just straight lines.
        // Actually, MockRouter returns the full path. Let's just use it if it's valid.

        // Check if it's a "Grand Tour" match (approx > 20 points for 9 waypoints)
        if (mockRoute.length > waypoints.length * 2) {
            return reply.send({
                success: true,
                route: mockRoute,
                distance: 5000, // Fake distance
                duration: 600   // Fake duration
            });
        }

        // 2. Fallback to OSRM (External)
        // Format coordinates for OSRM (lng,lat)
        const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

        // Fetch route from OSRM with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(osrmUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'GeofenceMonitor/1.0'
            }
        });
        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const route = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                lat: coord[1],
                lng: coord[0]
            }));

            return reply.send({
                success: true,
                route,
                distance: data.routes[0].distance,
                duration: data.routes[0].duration
            });
        }

        return reply.status(500).send({ error: 'No route found' });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Routing failed' });
    }
}
