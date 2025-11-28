import Fastify from 'fastify';
import path from 'path';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { VehicleManager } from './domain/vehicleManager';
import { ZONES } from './config/zones';
import { eventRoutes } from './routes/events';
import { vehicleRoutes } from './routes/vehicles';

export const buildApp = () => {
    const app = Fastify({
        logger: true
    }).withTypeProvider<TypeBoxTypeProvider>();

    const vehicleManager = new VehicleManager(ZONES);

    // Serve static files (Robust for Vercel)
    const publicPath = path.join(process.cwd(), 'public');
    app.register(require('@fastify/static'), {
        root: publicPath,
        prefix: '/',
    });

    app.get('/zones', async () => {
        return ZONES;
    });

    app.register(eventRoutes, { vehicleManager });
    app.register(vehicleRoutes, { vehicleManager });

    return app;
};
