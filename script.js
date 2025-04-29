const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357";

// Inițializează harta centrată pe România
let map = L.map("map").setView([45.9432, 24.9668], 7);

// Layer OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Markerii selectați
let markers = [];

// Coordonatele orașelor
const orase = {
  "București": [44.4268, 26.1025],
  "Cluj-Napoca": [46.7712, 23.6236],
  "Iași": [47.1585, 27.6014],
  "Timișoara": [45.7489, 21.2087],
  "Craiova": [44.3302, 23.7949],
  "Brașov": [45.6556, 25.6100],
  "Constanța": [44.1598, 28.6348],
  "Sibiu": [45.7928, 24.1521],
  "Oradea": [47.0722, 21.9211],
  "Galați": [45.4353, 28.0074]
};

// Funcția care mută harta pe orașul selectat
function adaugaOras(numeOras) {
  if (orase[numeOras]) {
    const [lat, lng] = orase[numeOras];
    map.setView([lat, lng], 13);
    let marker = L.marker([lat, lng]).addTo(map);
    markers.push(marker);
  }
}

// Adaugă marker la click pe hartă
map.on("click", function (e) {
  if (markers.length >= 2) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
  }
  let marker = L.marker(e.latlng).addTo(map);
  markers.push(marker);
});

// Calculează ruta între cele două puncte
async function calculateRoute() {
  if (markers.length < 2) {
    alert("Selectează două puncte pe hartă sau oraș + punct!");
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

// Asigură disponibilitatea funcțiilor în HTML
window.adaugaOras = adaugaOras;
window.calculateRoute = calculateRoute;
