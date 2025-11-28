import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { VehicleManager } from '../domain/vehicleManager';
import { VehicleEvent } from '../domain/types';

export async function eventRoutes(app: FastifyInstance, options: { vehicleManager: VehicleManager }) {
    const { vehicleManager } = options;

    app.post('/events', {
        schema: {
            body: Type.Object({
                vehicleId: Type.String(),
                timestamp: Type.String({ format: 'date-time' }),
                location: Type.Object({
                    lat: Type.Number(),
                    lng: Type.Number()
                })
            })
        }
    }, async (request, reply) => {
        const event = request.body as VehicleEvent;
        const result = vehicleManager.processEvent(event);

        // Log transition if any
        if (result.transition) {
            request.log.info(result.transition);
        }

        return result;
    });
}
