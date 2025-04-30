// Cheia API OpenRouteService (păstrează-o privată în producție!)
const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357";

// Listă simplă de orașe din România cu coordonate (poți adăuga mai multe)
const orase = {
  "București": [44.4268, 26.1025],
  "Cluj-Napoca": [46.7712, 23.6236],
  "Iași": [47.1585, 27.6014],
  "Timișoara": [45.7489, 21.2087],
  "Constanța": [44.1598, 28.6348],
  "Brașov": [45.6556, 25.6100],
  "Sibiu": [45.7983, 24.1256]
};

// Populează dropdown-urile
const plecareSelect = document.getElementById("plecare");
const sosireSelect = document.getElementById("sosire");

for (const oras in orase) {
  const opt1 = new Option(oras, oras);
  const opt2 = new Option(oras, oras);
  plecareSelect.add(opt1);
  sosireSelect.add(opt2.cloneNode(true));
}

// Inițializează harta
const map = L.map("map").setView([45.9432, 24.9668], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

let rutaLayer = null;

function calculeazaRuta() {
  const plecare = plecareSelect.value;
  const sosire = sosireSelect.value;

  if (!plecare || !sosire || plecare === sosire) {
    alert("Selectează două orașe diferite.");
    return;
  }

  const coordPlecare = orase[plecare];
  const coordSosire = orase[sosire];

  fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      coordinates: [coordPlecare, coordSosire]
    })
  })
    .then((r) => r.json())
    .then((data) => {
      // Elimină ruta veche
      if (rutaLayer) map.removeLayer(rutaLayer);

      rutaLayer = L.geoJSON(data).addTo(map);
      map.fitBounds(rutaLayer.getBounds());

      const dist = (data.features[0].properties.summary.distance / 1000).toFixed(2);
      const dur = (data.features[0].properties.summary.duration / 60).toFixed(1);
      const tip = data.features[0].properties.segments[0].steps.length ? "driving-car" : "necunoscut";

      document.getElementById("rezultat").innerHTML =
        `<p><strong>Distanță:</strong> ${dist} km<br>
        <strong>Durată estimată:</strong> ${dur} minute<br>
        <strong>Transport:</strong> ${tip}</p>`;
    })
    .catch((e) => {
      console.error("Eroare la calculul rutei:", e);
      alert("A apărut o eroare. Verifică consola.");
    });
}
