import { FastifyRequest, FastifyReply } from 'fastify';

interface RouteRequest {
    waypoints: Array<{ lat: number; lng: number }>;
}

export async function routeHandler(
    request: FastifyRequest<{ Body: RouteRequest }>,
    reply: FastifyReply
) {
    try {
        const { waypoints } = request.body;

        if (!waypoints || waypoints.length < 2) {
            return reply.status(400).send({ error: 'At least 2 waypoints required' });
        }

        // Format coordinates for OSRM (lng,lat)
        const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

        // Fetch route from OSRM
        const response = await fetch(osrmUrl);
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
