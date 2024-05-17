let map;
let waypoints = [];
let markers = [];
let currentLatLng;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 12,
  });

  map.addListener("rightclick", (event) => {
    currentLatLng = event.latLng;
    openModal();
  });
}

function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("waypointName").value = "";
  document.getElementById("waypointNumber").value = "";
}

function addWaypoint() {
  const name = document.getElementById("waypointName").value;
  const number = document.getElementById("waypointNumber").value;

  if (name && number) {
    const marker = new google.maps.Marker({
      position: currentLatLng,
      map: map,
      label: {
        text: "E",
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
      },
      title: name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "black",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "black",
      },
    });

    markers.push(marker);
    waypoints.push({ location: currentLatLng, stopover: true });
    closeModal();
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

async function calculateAndDisplayRoute() {
  if (waypoints.length < 2) {
    alert("Adicione pelo menos dois waypoints para calcular a rota.");
    return;
  }

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
  });

  directionsRenderer.setMap(map);

  const waypts = waypoints.map((wp) => ({
    location: wp.location,
    stopover: true,
  }));

  const request = {
    origin: waypoints[0].location,
    destination: waypoints[waypoints.length - 1].location,
    waypoints: waypts.slice(1, -1),
    optimizeWaypoints: true,
    travelMode: "DRIVING",
  };

  directionsService.route(request, (response, status) => {
    if (status === "OK") {
      const routeColor = getRandomColor();
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: routeColor,
          strokeWeight: 6, // Increase the thickness of the route line
        },
      });
      directionsRenderer.setDirections(response);

      // Atualizar marcadores com a sequência da rota e cor aleatória
      const route = response.routes[0];
      const legs = route.legs;

      for (let i = 0; i < markers.length; i++) {
        markers[i].setLabel({
          text: `${i + 1}`,
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
        });
        markers[i].setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: routeColor,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: routeColor,
        });
      }
    } else {
      window.alert("Directions request failed due to " + status);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("addWaypointBtn")
    .addEventListener("click", addWaypoint);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

  const calculateRouteButton = document.createElement("button");
  calculateRouteButton.textContent = "Calcular Rota";
  calculateRouteButton.style.position = "absolute";
  calculateRouteButton.style.top = "10px";
  calculateRouteButton.style.left = "10px";
  calculateRouteButton.onclick = calculateAndDisplayRoute;
  document.body.appendChild(calculateRouteButton);

  initMap();
});
