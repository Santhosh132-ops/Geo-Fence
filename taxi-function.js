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
