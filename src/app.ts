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

    // Serve static files (Standard Node.js)
    app.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'public'),
        prefix: '/',
    });

    app.register(eventRoutes, { vehicleManager });

    return app;
};

export default buildApp;


