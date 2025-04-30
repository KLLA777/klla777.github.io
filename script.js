const orase = {
  "București": [44.4268, 26.1025],
  "Cluj-Napoca": [46.7712, 23.6236],
  "Timișoara": [45.7489, 21.2087],
  "Iași": [47.1585, 27.6014],
  "Constanța": [44.1598, 28.6348],
  "Craiova": [44.3302, 23.7949],
  "Brașov": [45.6579, 25.6012],
  "Galați": [45.4353, 28.0076],
  "Oradea": [47.0722, 21.9211],
  "Sibiu": [45.7930, 24.1213]
};

const plecare = document.getElementById('plecare');
const sosire = document.getElementById('sosire');

// Populare dropdown-uri
for (const oras in orase) {
  const opt1 = document.createElement('option');
  opt1.value = oras;
  opt1.text = oras;
  plecare.appendChild(opt1);

  const opt2 = document.createElement('option');
  opt2.value = oras;
  opt2.text = oras;
  sosire.appendChild(opt2);
}

// Inițializare hartă
const map = L.map('map').setView([45.9432, 24.9668], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Redimensionare corectă
setTimeout(() => {
  map.invalidateSize();
}, 200);

let rutaLayer;

// Funcția principală
async function calculeazaRuta() {
  const orasPlecare = plecare.value;
  const orasSosire = sosire.value;

  if (!orasPlecare || !orasSosire || orasPlecare === orasSosire) {
    alert('Selectează două orașe diferite!');
    return;
  }

  const coordStart = orase[orasPlecare];
  const coordEnd = orase[orasSosire];

  const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357"; // cheia ta
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const body = {
    coordinates: [coordStart.reverse(), coordEnd.reverse()]
  };

  const headers = {
    "Authorization": apiKey,
    "Content-Type": "application/json"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    const distance = data.features[0].properties.summary.distance / 1000; // km
    const duration = data.features[0].properties.summary.duration / 60; // minute

    const transport = data.features[0].properties.segments[0].steps.length > 0 ? "Mașină" : "N/A";

    document.getElementById("rezultat").innerHTML =
      `<b>Distanță:</b> ${distance.toFixed(2)} km<br>` +
      `<b>Durată estimată:</b> ${duration.toFixed(1)} minute<br>` +
      `<b>Transport:</b> ${transport}`;

    // Șterge ruta veche
    if (rutaLayer) map.removeLayer(rutaLayer);

    rutaLayer = L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 4
      }
    }).addTo(map);

    map.fitBounds(rutaLayer.getBounds());

  } catch (error) {
    alert("A apărut o eroare la calcularea rutei.");
    console.error(error);
  }
}
