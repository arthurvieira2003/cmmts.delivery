let map;
let waypoints = [];
let markers = [];
let currentLatLng;
let directionsService;
let directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
  });

  directionsRenderer.setMap(map);

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
  document.getElementById("routeOptionsModal").style.display = "block";
}

function closeRouteOptionsModal() {
  document.getElementById("routeOptionsModal").style.display = "none";
}

function getSelectedRouteOption() {
  const options = document.getElementsByName("routeOption");
  for (const option of options) {
    if (option.checked) {
      return option.value;
    }
  }
  return "time";
}

function generateRoute(option) {
  if (waypoints.length < 2) {
    alert("Adicione pelo menos dois waypoints para calcular a rota.");
    return;
  }

  let travelMode = "DRIVING";
  let request = {
    origin: waypoints[0].location,
    destination: waypoints[waypoints.length - 1].location,
    waypoints: waypoints.slice(1, -1),
    optimizeWaypoints: true,
    travelMode: travelMode,
  };

  if (option === "traffic") {
    request.drivingOptions = {
      departureTime: new Date(),
      trafficModel: "pessimistic",
    };
  } else if (option === "distance") {
    request.optimizeWaypoints = false;
  }

  directionsService.route(request, (response, status) => {
    if (status === "OK") {
      const routeColor = getRandomColor();
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: routeColor,
          strokeWeight: 6,
        },
      });
      directionsRenderer.setDirections(response);

      const route = response.routes[0];
      const legs = route.legs;
      updateTimeline(legs, routeColor);

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

function updateTimeline(legs, color) {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  legs.forEach((leg, index) => {
    const div = document.createElement("div");
    div.style.backgroundColor = color;
    div.title = `Ponto ${index + 1}`;

    timeline.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("addWaypointBtn")
    .addEventListener("click", addWaypoint);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

  document
    .getElementById("calculateRouteButton")
    .addEventListener("click", calculateAndDisplayRoute);

  document
    .getElementById("calculateRouteOptionsBtn")
    .addEventListener("click", () => {
      const option = getSelectedRouteOption();
      closeRouteOptionsModal();
      generateRoute(option);
    });

  document
    .getElementById("closeRouteOptionsModalBtn")
    .addEventListener("click", closeRouteOptionsModal);

  document
    .getElementById("toggleTimelineButton")
    .addEventListener("click", () => {
      const timelinePanel = document.getElementById("timelinePanel");
      const toggleButton = document.getElementById("toggleTimelineButton");
      if (timelinePanel.style.display === "block") {
        timelinePanel.style.display = "none";
        toggleButton.innerHTML = "&#9660;";
      } else {
        timelinePanel.style.display = "block";
        toggleButton.innerHTML = "&#9650;";
      }
    });

  initMap();
});
