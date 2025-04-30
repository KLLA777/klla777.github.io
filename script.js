const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357";

let map = L.map("map").setView([45.9432, 24.9668], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let routeLine = null;

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.length === 0) return null;
  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

async function calculateRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!from || !to) {
    alert("Completează ambele locații.");
    return;
  }

  const start = await geocode(from);
  const end = await geocode(to);

  if (!start || !end) {
    alert("Locație invalidă.");
    return;
  }

  // Șterge markerele vechi
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const startMarker = L.marker([start.lat, start.lng]).addTo(map);
  const endMarker = L.marker([end.lat, end.lng]).addTo(map);
  markers.push(startMarker, endMarker);

  map.fitBounds(L.latLngBounds([start, end]));

  const coords = [
    [start.lng, start.lat],
    [end.lng, end.lat]
  ];

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

    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.geoJSON(data).addTo(map);
  } catch (err) {
    alert("Eroare la calcularea rutei.");
    console.error(err);
  }
}
