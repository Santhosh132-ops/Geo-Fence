import { test, expect, describe } from 'vitest';
import { buildApp } from '../src/app';

describe('Geofence Service', () => {
    test('should track vehicle movement and detect zones', async () => {
        const app = buildApp();
        await app.ready();

        // 1. Send event: Vehicle starts outside
        const res1 = await app.inject({
            method: 'POST',
            url: '/events',
            payload: {
                vehicleId: 'v1',
                timestamp: new Date().toISOString(),
                location: { lat: 51.0, lng: 0.0 } // Far away
            }
        });
        expect(res1.statusCode).toBe(200);
        expect(res1.json().status.state).toBe('outside');

        // 2. Send event: Vehicle enters Buckingham Palace
        // Buckingham Palace center: approximately 51.5014, -0.1419
        const res2 = await app.inject({
            method: 'POST',
            url: '/events',
            payload: {
                vehicleId: 'v1',
                timestamp: new Date().toISOString(),
                location: { lat: 51.5014, lng: -0.1419 }
            }
        });
        expect(res2.statusCode).toBe(200);
        expect(res2.json().status.state).toBe('inside');
        expect(res2.json().status.currentZoneId).toBe('buckingham_palace');
        expect(res2.json().transition).toContain('entered zone buckingham_palace');

        // 3. Query status
        const res3 = await app.inject({
            method: 'GET',
            url: '/vehicles/v1'
        });
        expect(res3.statusCode).toBe(200);
        expect(res3.json().currentZoneId).toBe('buckingham_palace');
    });
});
