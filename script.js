const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357";

let map = L.map("map").setView([45.9432, 24.9668], 7); // România

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let markers = [];

map.on("click", function (e) {
  if (markers.length >= 2) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    if (window.routeLine) map.removeLayer(window.routeLine);
    document.getElementById("info").innerHTML = "";
  }
  let marker = L.marker(e.latlng).addTo(map);
  markers.push(marker);
});

async function calculateRoute() {
  if (markers.length < 2) {
    alert("Selectează două puncte pe hartă!");
    return;
  }

  const coords = markers.map(m => [m.getLatLng().lng, m.getLatLng().lat]);

  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ coordinates: coords })
    });

    const data = await response.json();

    if (window.routeLine) map.removeLayer(window.routeLine);
    window.routeLine = L.geoJSON(data).addTo(map);

    const distanceMeters = data.features[0].properties.summary.distance;
    const durationSeconds = data.features[0].properties.summary.duration;
    const mode = data.features[0].properties.profile;

    const distanceKm = (distanceMeters / 1000).toFixed(2);
    const durationMin = Math.round(durationSeconds / 60);

    document.getElementById("info").innerHTML =
      `<strong>Tip transport:</strong> ${mode}<br>
       <strong>Distanță:</strong> ${distanceKm} km<br>
       <strong>Durată:</strong> ${durationMin} minute`;

  } catch (err) {
    alert("Eroare la calcularea rutei.");
    console.error(err);
  }
}
