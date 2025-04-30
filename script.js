const apiKey = "5b3ce3597851110001cf6248791e3edff33b4ff1872016f44f155357";

const cities = {
  "București": [44.4268, 26.1025],
  "Cluj-Napoca": [46.7712, 23.6236],
  "Iași": [47.1585, 27.6014],
  "Timișoara": [45.7489, 21.2087],
  "Constanța": [44.1598, 28.6348],
  "Brașov": [45.6579, 25.6012],
  "Sibiu": [45.7983, 24.1256],
  "Oradea": [47.0465, 21.9189],
  "Ploiești": [44.9441, 26.0294],
  "Galați": [45.4353, 28.0074]
};

let map = L.map("map").setView([45.9432, 24.9668], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let routeLine;

function populateDropdowns() {
  const startSelect = document.getElementById("startSelect");
  const endSelect = document.getElementById("endSelect");

  for (let city in cities) {
    const option1 = document.createElement("option");
    option1.value = city;
    option1.text = city;
    startSelect.add(option1);

    const option2 = document.createElement("option");
    option2.value = city;
    option2.text = city;
    endSelect.add(option2);
  }
}

populateDropdowns();

async function calculateRoute() {
  const startCity = document.getElementById("startSelect").value;
  const endCity = document.getElementById("endSelect").value;

  if (!startCity || !endCity) {
    alert("Te rugăm să alegi două orașe.");
    return;
  }

  if (startCity === endCity) {
    alert("Orașele trebuie să fie diferite.");
    return;
  }

  const startCoords = cities[startCity];
  const endCoords = cities[endCity];

  const coords = [
    [startCoords[1], startCoords[0]], // lng, lat
    [endCoords[1], endCoords[0]]
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

    const bounds = L.latLngBounds([startCoords, endCoords]);
    map.fitBounds(bounds.pad(0.2));

  } catch (err) {
    alert("Eroare la calcularea rutei.");
    console.error(err);
  }
}
