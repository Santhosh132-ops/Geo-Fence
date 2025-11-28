import type { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../src/app';

const app = buildApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    try {
        await app.ready();
        app.server.emit('request', req, res);
    } catch (error) {
        console.error('Vercel Handler Error:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
}
