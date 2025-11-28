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

    // Serve static files (Local Dev Only - Vercel handles this natively)
    if (!process.env.VERCEL) {
        app.register(require('@fastify/static'), {
            root: path.join(__dirname, '../public'),
            prefix: '/',
        });
    }

    app.get('/zones', async () => {
        return ZONES;
    });

    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    app.register(eventRoutes, { vehicleManager });
    app.register(vehicleRoutes, { vehicleManager });

    return app;
};

export default buildApp;


