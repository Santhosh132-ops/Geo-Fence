import { VehicleEvent, VehicleStatus, Zone, VehicleState } from './types';
import { determineZone } from './geofence';

export class VehicleManager {
    private vehicles: Map<string, VehicleStatus> = new Map();
    private zones: Zone[];

    constructor(zones: Zone[]) {
        this.zones = zones;
    }

    public processEvent(event: VehicleEvent): { status: VehicleStatus; transition?: string } {
        const { vehicleId, location, timestamp } = event;
        const currentZoneId = determineZone(location, this.zones);
        const state: VehicleState = currentZoneId ? 'inside' : 'outside';

        const previousStatus = this.vehicles.get(vehicleId);
        let transition: string | undefined;

        if (previousStatus) {
            if (previousStatus.currentZoneId !== currentZoneId) {
                if (currentZoneId) {
                    transition = `Vehicle ${vehicleId} entered zone ${currentZoneId}`;
                } else if (previousStatus.currentZoneId) {
                    transition = `Vehicle ${vehicleId} exited zone ${previousStatus.currentZoneId}`;
                }
            }
        } else {
            // First time seeing vehicle
            if (currentZoneId) {
                transition = `Vehicle ${vehicleId} entered zone ${currentZoneId}`;
            }
        }

        const newStatus: VehicleStatus = {
            vehicleId,
            currentZoneId,
            state,
            lastSeen: timestamp,
            location
        };

        this.vehicles.set(vehicleId, newStatus);
        return { status: newStatus, transition };
    }

    public getVehicleStatus(vehicleId: string): VehicleStatus | undefined {
        return this.vehicles.get(vehicleId);
    }
}
