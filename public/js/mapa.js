let map;
let waypoints = [];
let markers = [];
let currentLatLng;
let directionsService;
let directionsRenderer;
let distributionCenter = null;
let isAddingDistributionCenter = false;

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
    openContextMenu(event.pixel);
  });

  window.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Prevent default context menu
  });
}

function openContextMenu(position) {
  const contextMenu = document.getElementById("contextMenu");
  contextMenu.style.left = `${position.x}px`;
  contextMenu.style.top = `${position.y}px`;
  contextMenu.style.display = "block";

  document.addEventListener("click", closeContextMenu);
}

function closeContextMenu() {
  const contextMenu = document.getElementById("contextMenu");
  contextMenu.style.display = "none";
  document.removeEventListener("click", closeContextMenu);
}

function openModal(isDistributionCenter = false) {
  isAddingDistributionCenter = isDistributionCenter;
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("itemName").value = "";
  document.getElementById("itemNumber").value = "";
}

function addItem() {
  const name = document.getElementById("itemName").value;
  const number = document.getElementById("itemNumber").value;

  if (name && number) {
    if (isAddingDistributionCenter) {
      addDistributionCenter(name, number);
    } else {
      addWaypoint(name, number);
    }
    closeModal();
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

function addDistributionCenter(name, number) {
  if (distributionCenter) {
    distributionCenter.setMap(null);
  }

  distributionCenter = new google.maps.Marker({
    position: currentLatLng,
    map: map,
    label: {
      text: "CD",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
    },
    title: name,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: "blue",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "blue",
    },
  });
}

function removeWaypoint(index) {
  waypoints.splice(index, 1);
  markers[index].setMap(null);
  markers.splice(index, 1);
  document.getElementById("waypointsList").children[index].remove();
  // Recalcular a rota se necessário
}

function addWaypoint(name, number) {
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

  const waypointIndex = waypoints.length - 1;
  const waypointElement = document.createElement("li");
  waypointElement.textContent = name;
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remover";
  removeButton.addEventListener("click", () => {
    removeWaypoint(waypointIndex);
  });
  waypointElement.appendChild(removeButton);
  document.getElementById("waypointsList").appendChild(waypointElement);
}

function updateRoutePanel(route, waypoints) {
  const routeInfo = document.getElementById("routeInfo");
  const waypointsList = document.getElementById("waypointsList");

  // Limpa o painel de informações da rota e waypoints
  routeInfo.innerHTML = "";
  waypointsList.innerHTML = "";

  // Mostra informações da rota
  const summary = route.summary;
  const duration = route.legs.reduce((acc, leg) => acc + leg.duration.value, 0);
  const distance = route.legs.reduce((acc, leg) => acc + leg.distance.value, 0);
  routeInfo.innerHTML += `<p><strong>Resumo da Rota:</strong></p>`;
  routeInfo.innerHTML += `<p>Duração: ${duration} segundos</p>`;
  routeInfo.innerHTML += `<p>Distância: ${distance} metros</p>`;

  // Mostra informações dos waypoints
  waypoints.forEach((waypoint, index) => {
    const waypointElement = document.createElement("li");
    waypointElement.textContent = `Waypoint ${
      index + 1
    }: Lat: ${waypoint.location.lat()}, Lng: ${waypoint.location.lng()}`;
    waypointsList.appendChild(waypointElement);
  });
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
  if (!distributionCenter) {
    alert("Por favor, defina um centro de distribuição.");
    return;
  }
  if (waypoints.length < 1) {
    alert("Adicione pelo menos um waypoint para calcular a rota.");
    return;
  }

  let travelMode = "DRIVING";
  let request = {
    origin: distributionCenter.getPosition(),
    destination: distributionCenter.getPosition(),
    waypoints: waypoints,
    optimizeWaypoints: option !== "distance",
    travelMode: travelMode,
  };

  if (option === "traffic") {
    request.drivingOptions = {
      departureTime: new Date(),
      trafficModel: "pessimistic",
    };
  }

  directionsService.route(request, (response, status) => {
    if (status === "OK") {
      console.log(response);
      updateRoutePanel(response.routes[0], waypoints);
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
  document.getElementById("addItemBtn").addEventListener("click", addItem);
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

  document.getElementById("addWaypointOption").addEventListener("click", () => {
    closeContextMenu();
    openModal(false);
  });

  document
    .getElementById("addDistributionCenterOption")
    .addEventListener("click", () => {
      closeContextMenu();
      openModal(true);
    });

  initMap();
});
