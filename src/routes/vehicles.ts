import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { VehicleManager } from '../domain/vehicleManager';

export async function vehicleRoutes(app: FastifyInstance, options: { vehicleManager: VehicleManager }) {
    const { vehicleManager } = options;

    app.get('/vehicles/:id', {
        schema: {
            params: Type.Object({
                id: Type.String()
            })
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const status = vehicleManager.getVehicleStatus(id);

        if (!status) {
            return reply.status(404).send({ error: 'Vehicle not found' });
        }

        return status;
    });
}
