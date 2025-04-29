const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357";

let map = L.map("map").setView([45.9432, 24.9668], 7); // Centru România

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let markers = [];

const oraseCoordonate = {
  "București": [44.4268, 26.1025],
  "Cluj-Napoca": [46.7712, 23.6236],
  "Iași": [47.1585, 27.6014],
  "Timișoara": [45.7489, 21.2087],
  "Craiova": [44.3302, 23.7949]
};

function adaugaOras(numeOras) {
  if (!numeOras || !oraseCoordonate[numeOras]) return;

  const coord = oraseCoordonate[numeOras];

  if (markers.length >= 2) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
  }

  const marker = L.marker(coord).addTo(map);
  markers.push(marker);
  map.setView(coord, 12); // Zoom pe oraș
}

map.on("click", function (e) {
  if (markers.length >= 2) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
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
  } catch (err) {
    alert("Eroare la calcularea rutei.");
    console.error(err);
  }
}
