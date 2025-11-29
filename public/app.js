const API_URL = '';

// DOM Elements
const vehicleInput = document.getElementById('vehicleInput');
const vehicleIdDisplay = document.getElementById('vehicleIdDisplay');
const currentZoneDisplay = document.getElementById('currentZone');
const currentStateDisplay = document.getElementById('currentState');
const toastContainer = document.getElementById('toast-container');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
const stopBtn = document.getElementById('stopBtn');
const startSelect = document.getElementById('startSelect');
const destSelect = document.getElementById('destSelect');
const routeProgress = document.getElementById('routeProgress');

// State
let pollingInterval;
let driveInterval;
let map;
let vehicleMarker;
let zonesLayer;
let routePolyline;
let isDriving = false;
let availableZones = [];
let activeRouteZones = []; // List of zones in the current route
let currentRouteIndex = 0; // Track progress in the route

// Debounce & State Tracking
let lastConfirmedZoneId = null;
let potentialNewZoneId = null;
let zoneConfirmationCounter = 0;
const ZONE_CONFIRMATION_THRESHOLD = 3; // Require 3 consecutive updates to confirm zone change (EXIT ONLY)

// Initialize Map
function initMap() {
    // Center on London
    map = L.map('map').setView([51.505, -0.12], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Fetch and draw zones
    fetchZones();
}

async function fetchZones() {
    try {
        const response = await fetch(`${API_URL}/zones`);
        const zones = await response.json();
        availableZones = zones;

        // Populate Dropdowns
        populateDropdown(startSelect, zones, 'Select Start Point');
        populateDropdown(destSelect, zones, 'Select Destination Point');

        zones.forEach(zone => {
            const polygonCoords = zone.polygon.map(p => [p.lat, p.lng]);

            L.polygon(polygonCoords, {
                color: '#38bdf8',
                fillColor: '#38bdf8',
                fillOpacity: 0.2,
                weight: 2
            }).bindPopup(zone.name).addTo(map);
        });
    } catch (error) {
        console.error('Error fetching zones:', error);
    }
}

function populateDropdown(selectElement, zones, placeholder = 'Select Zone') {
    selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
    zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.id;
        option.textContent = zone.name;
        selectElement.appendChild(option);
    });
}

// Functions
async function simulateLocation(lat, lng) {
    const vehicleId = vehicleInput.value;
    const payload = {
        vehicleId,
        timestamp: new Date().toISOString(),
        location: { lat, lng }
    };

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Check for transition and show toast
        if (data.transition) {
            showToast(data.transition, 'info');
        }

        updateUI(data.status);
        // Don't restart polling if driving, we update manually
        if (!isDriving) startPolling(vehicleId);
    } catch (error) {
        console.error('Error sending event:', error);
        if (!isDriving) showToast('Failed to send event', 'warning');
    }
}

async function fetchStatus(vehicleId) {
    // CRITICAL FIX: Ignore polling results if we are driving
    if (isDriving) return;

    try {
        const response = await fetch(`${API_URL}/vehicles/${vehicleId}`);

        // Handle 404 - vehicle doesn't exist yet
        if (response.status === 404) {
            vehicleIdDisplay.textContent = vehicleId;
            currentZoneDisplay.textContent = '--';
            currentStateDisplay.textContent = 'No data yet';
            return;
        }

        if (response.ok) {
            const data = await response.json();
            updateUI(data);
        }
    } catch (error) {
        // Silently handle errors during polling
        console.warn('Status fetch failed:', error.message);
    }
}

function updateUI(status) {
    vehicleIdDisplay.textContent = status.vehicleId;

    // Smart Debounce Logic
    let displayZoneId = lastConfirmedZoneId;
    let hasZoneChanged = false;

    if (status.currentZoneId) {
        // We are inside a zone.
        if (status.currentZoneId !== lastConfirmedZoneId) {
            // New zone detected! Accept immediately
            lastConfirmedZoneId = status.currentZoneId;
            displayZoneId = status.currentZoneId;

            // Reset exit counters
            potentialNewZoneId = null;
            zoneConfirmationCounter = 0;

            hasZoneChanged = true;
        } else {
            // Same zone, just keep it.
            zoneConfirmationCounter = 0; // Reset any exit counter
        }
    } else {
        // We are OUTSIDE (currentZoneId is null)
        if (lastConfirmedZoneId !== null) {
            // We were inside, now outside. Start debounce.
            zoneConfirmationCounter++;
            if (zoneConfirmationCounter >= ZONE_CONFIRMATION_THRESHOLD) {
                // Confirmed Exit
                lastConfirmedZoneId = null;
                displayZoneId = null;
                zoneConfirmationCounter = 0;
                hasZoneChanged = true;
            } else {
                // Not confirmed yet, keep showing old zone
                displayZoneId = lastConfirmedZoneId;
            }
        }
    }

    // Update UI with CONFIRMED zone
    currentZoneDisplay.textContent = displayZoneId ? formatZoneName(displayZoneId) : 'None';
    currentStateDisplay.textContent = status.state.toUpperCase();

    // Visual feedback
    if (displayZoneId) {
        currentZoneDisplay.classList.add('highlight');
    } else {
        currentZoneDisplay.classList.remove('highlight');
    }

    // Update Route Progress if driving and zone changed
    if (isDriving && activeRouteZones.length > 0 && hasZoneChanged) {
        updateRouteProgress(displayZoneId);
    }

    // Update Map Marker
    updateMarker(status.location);
}

function updateMarker(location) {
    if (!map) return;

    const latLng = [location.lat, location.lng];

    if (vehicleMarker) {
        vehicleMarker.setLatLng(latLng);
    } else {
        vehicleMarker = L.marker(latLng).addTo(map);
    }

    // Pan map to follow vehicle if driving
    if (isDriving) {
        map.panTo(latLng, { animate: true, duration: 0.5 });
    }
}

function formatZoneName(id) {
    const zone = availableZones.find(z => z.id === id);
    return zone ? zone.name : id;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : 'ℹ️');

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <span class="toast-title">Alert :</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

function startPolling(vehicleId) {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => fetchStatus(vehicleId), 2000);
}

// Route Progress Logic
function initRouteProgress(zones) {
    activeRouteZones = zones;
    currentRouteIndex = 0; // Reset index

    // Reset debounce state
    lastConfirmedZoneId = null;
    potentialNewZoneId = null;
    zoneConfirmationCounter = 0;

    routeProgress.innerHTML = '';
    routeProgress.style.display = 'block';

    zones.forEach((zone, index) => {
        const step = document.createElement('div');
        step.className = 'route-step';
        step.id = `step-${index}-${zone.id}`;
        step.innerHTML = `
            <div class="step-icon">${index === 0 ? '🏁' : (index === zones.length - 1 ? '🎯' : '📍')}</div>
            <span>${zone.name}</span>
        `;
        routeProgress.appendChild(step);
    });

    // Initial State: First zone is "Next" (Target)
    updateStepVisuals(0, false);
}

function updateStepVisuals(activeIndex, isInside) {
    activeRouteZones.forEach((zone, index) => {
        const step = document.getElementById(`step-${index}-${zone.id}`);
        if (!step) return;

        step.classList.remove('active', 'completed', 'next');

        if (index < activeIndex) {
            // Past zones are completed
            step.classList.add('completed');
        } else if (index === activeIndex) {
            // Current target zone
            if (isInside) {
                step.classList.add('active'); // Blue (Inside)
            } else {
                step.classList.add('next'); // Bold (Target)
            }
        }
        // Future zones remain default
    });
}

function updateRouteProgress(newZoneId) {
    // Logic:
    // 1. If we ENTER the current target zone -> Mark as Active (Inside)
    // 2. If we EXIT the current target zone -> Mark as Completed, Advance Index, Mark Next as Target

    const currentZone = activeRouteZones[currentRouteIndex];
    if (!currentZone) return; // Safety check

    if (newZoneId === currentZone.id) {
        // We ENTERED the target zone
        updateStepVisuals(currentRouteIndex, true);
    } else if (newZoneId === null) {
        // We EXITED a zone
        // If the UI shows "Active" (Inside) for the current index, and we are now Outside, advance!

        const step = document.getElementById(`step-${currentRouteIndex}-${currentZone.id}`);
        if (step && step.classList.contains('active')) {
            // We were inside, now we are out.
            // Mark current as completed and move to next.
            currentRouteIndex++;
            if (currentRouteIndex < activeRouteZones.length) {
                updateStepVisuals(currentRouteIndex, false); // Next zone is now Target (not inside)
            } else {
                // Route finished?
                // Keep last one completed
                updateStepVisuals(currentRouteIndex, false);
            }
        }
    } else {
        // We entered a zone that is NOT the current target.
        // Could be the NEXT one (if we skipped the "Exit" update due to debounce or fast travel).
        const nextZone = activeRouteZones[currentRouteIndex + 1];
        if (nextZone && newZoneId === nextZone.id) {
            currentRouteIndex++;
            updateStepVisuals(currentRouteIndex, true);
        }
    }
}

function clearRouteProgress() {
    activeRouteZones = [];
    currentRouteIndex = 0;
    routeProgress.innerHTML = '';
    routeProgress.style.display = 'none';
}

// OSRM Routing & Animation
async function getRoute(waypoints) {
    try {
        // Call backend proxy instead of OSRM directly
        const response = await fetch(`${API_URL}/api/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ waypoints })
        });

        const data = await response.json();

        if (data.success && data.route) {
            showToast('Route calculated successfully', 'success');
            return data.route;
        }

        showToast('Could not calculate route', 'warning');
        return null;
    } catch (error) {
        console.error('Routing error:', error);
        showToast('Routing service unavailable', 'warning');
        return null;
    }
}

// Fallback function to create interpolated straight-line route
function createStraightLineRoute(waypoints) {
    const route = [];
    const pointsPerSegment = 50; // Interpolation density

    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];

        for (let j = 0; j <= pointsPerSegment; j++) {
            const ratio = j / pointsPerSegment;
            route.push({
                lat: start.lat + (end.lat - start.lat) * ratio,
                lng: start.lng + (end.lng - start.lng) * ratio
            });
        }
    }

    return route;
}

function getZoneCenter(zone) {
    // Simple centroid calculation
    const lats = zone.polygon.map(p => p.lat);
    const lngs = zone.polygon.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
    };
}

// Helper: Calculate distance between two points
function getDistance(p1, p2) {
    return Math.hypot(p1.lat - p2.lat, p1.lng - p2.lng);
}

// Core Logic: Find intermediate zones strictly between Start and End
function calculateIntermediateZones(startZone, destZone) {
    const startPoint = getZoneCenter(startZone);
    const destPoint = getZoneCenter(destZone);

    // STRICT FILTERING: Distance Sum Check
    // A zone is "between" Start and End if:
    // Dist(Start, Zone) + Dist(Zone, End) ≈ Dist(Start, End)
    // We allow a small detour factor (e.g., 10% extra distance)

    const directDist = getDistance(startPoint, destPoint);
    const MAX_DETOUR_FACTOR = 1.1; // Allow 10% detour

    const intermediateZones = availableZones.filter(z => {
        if (z.id === startZone.id || z.id === destZone.id) return false;

        const center = getZoneCenter(z);
        const distFromStart = getDistance(startPoint, center);
        const distToEnd = getDistance(center, destPoint);

        const totalPath = distFromStart + distToEnd;

        return totalPath <= directDist * MAX_DETOUR_FACTOR;
    });

    // Sort intermediate zones by distance from start
    intermediateZones.sort((a, b) => {
        const distA = getDistance(startPoint, getZoneCenter(a));
        const distB = getDistance(startPoint, getZoneCenter(b));
        return distA - distB;
    });

    return intermediateZones;
}

async function startCustomDrive() {
    const startId = startSelect.value;
    const destId = destSelect.value;

    if (!startId || !destId) {
        showToast('Please select Start and Destination', 'warning');
        return;
    }

    if (startId === destId) {
        showToast('Start and Destination cannot be the same', 'warning');
        return;
    }

    const startZone = availableZones.find(z => z.id === startId);
    const destZone = availableZones.find(z => z.id === destId);

    if (!startZone || !destZone) return;

    // Use the reusable logic
    const intermediateZones = calculateIntermediateZones(startZone, destZone);

    // Include intermediate zones in the route list
    const routeZones = [startZone, ...intermediateZones, destZone];

    // Initialize Progress Overlay
    initRouteProgress(routeZones);

    // Use ALL zones as waypoints to force the route through them
    const waypoints = routeZones.map(getZoneCenter);

    showToast(`Route: ${startZone.name} -> ${intermediateZones.map(z => z.name).join(' -> ')} -> ${destZone.name}`, 'info');

    await driveRoute(waypoints);
}

async function startDrive() {
    // Grand Tour
    const tourZones = [
        'palace', 'abbey', 'eye', 'stpauls', 'tower', 'shard', 'museum', 'hydepark', 'palace'
    ].map(id => availableZones.find(z => z.id === id)).filter(Boolean);

    initRouteProgress(tourZones);

    // Use Centroids for strict alignment
    const waypoints = tourZones.map(getZoneCenter);

    await driveRoute(waypoints);
}

async function driveRoute(waypoints) {
    if (isDriving) return;

    isDriving = true;
    stopBtn.style.display = 'block';

    // Stop polling immediately to prevent stale updates
    if (pollingInterval) clearInterval(pollingInterval);

    showToast('Calculating Road Route...', 'info');

    // Get real route from OSRM
    const routePoints = await getRoute(waypoints);

    if (!routePoints) {
        isDriving = false;
        stopBtn.style.display = 'none';
        clearRouteProgress();
        startPolling(vehicleInput.value); // Resume polling if failed
        return;
    }

    // Draw route on map
    if (routePolyline) map.removeLayer(routePolyline);
    routePolyline = L.polyline(routePoints, { color: '#ec4899', weight: 4, opacity: 0.7 }).addTo(map);
    map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

    showToast('Starting Drive', 'success');

    // Animation Loop
    let index = 0;

    driveInterval = setInterval(() => {
        if (index >= routePoints.length) {
            stopDrive();
            showToast('Destination Reached', 'success');
            return;
        }

        const point = routePoints[index];

        // Update marker visually immediately
        updateMarker(point);

        // Send API update (throttled to every 2nd point to catch small zones)
        if (index % 2 === 0) {
            simulateLocation(point.lat, point.lng);
        }

        index++;
    }, 100); // 100ms per point
}

function stopDrive() {
    isDriving = false;
    if (driveInterval) {
        clearInterval(driveInterval);
        driveInterval = null;
    }
    stopBtn.style.display = 'none';
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    clearRouteProgress();
    // Resume normal polling
    startPolling(vehicleInput.value);
}

// Terminal Logic
async function runTerminal() {
    const input = terminalInput.value.trim();
    if (!input) return;

    terminalOutput.textContent = '> Running...';

    try {
        // Simple parser for curl commands
        let method = 'GET';
        let url = '';
        let body = null;

        // Extract URL
        const urlMatch = input.match(/http:\/\/[^\s]+/);
        if (urlMatch) {
            url = urlMatch[0];
        } else {
            throw new Error('Invalid URL. Must start with http://');
        }

        // Extract Method
        const methodMatch = input.match(/-X\s+([A-Z]+)/);
        if (methodMatch) {
            method = methodMatch[1];
        }

        // Extract Body
        const bodyMatch = input.match(/-d\s+'([^']+)'/);
        if (bodyMatch) {
            body = bodyMatch[1];
        }

        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (body) {
            options.body = body;
        }

        const response = await fetch(url, options);
        const data = await response.json();

        terminalOutput.textContent = JSON.stringify(data, null, 2);

        // If it was an event update, refresh UI
        if (url.includes('/events')) {
            if (data.status) updateUI(data.status);
            if (data.transition) showToast(data.transition, 'info');
        }

    } catch (error) {
        terminalOutput.textContent = `Error: ${error.message}`;
    }
}

// Initial load
initMap();
if (vehicleInput.value) {
    startPolling(vehicleInput.value);
}

vehicleInput.addEventListener('change', () => {
    startPolling(vehicleInput.value);
});
// Taxi selection
function selectTaxi(id) {
    vehicleInput.value = id;
    document.getElementById('btn-taxi-001').className = id === 'taxi-001' ? 'btn primary' : 'btn secondary';
    document.getElementById('btn-taxi-002').className = id === 'taxi-002' ? 'btn primary' : 'btn secondary';
    if (isDriving) stopDrive();
    if (vehicleMarker) { map.removeLayer(vehicleMarker); vehicleMarker = null; }
    vehicleIdDisplay.textContent = id;
    currentZoneDisplay.textContent = '--';
    currentStateDisplay.textContent = '--';
    startPolling(id);
    showToast('Selected ' + id, 'info');
}
