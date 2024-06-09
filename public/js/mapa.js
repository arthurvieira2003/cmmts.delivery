let map;
let waypoints = [];
let markers = [];
let placeId;
let directionsService = new google.maps.DirectionsService();
let directionsRenderer;
let distributionCenter = null;
let isAddingDistributionCenter = false;
let dadosCd;
const routeColor = getRandomColor();

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -26.263376014191284, lng: -48.89011018083488},
        zoom: 12,
    });

    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Local sem coordenadas.")
                return;
            }
            var marker = new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location
            });
            markers.push(marker);

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    fetch("/Roteirizador/BuscarCentrosDistribuicao")
        .then(response => response.json())
        .then(data => {
            for (let centro of data) {
                const geocoder = new google.maps.Geocoder();

                geocoder.geocode({placeId: centro.placeIdCentro}, (results, status) => {
                    if (status === "OK" && results[0]) {
                        const location = results[0].geometry.location;
                        const address = results[0].formatted_address;

                        const infowindow = new google.maps.InfoWindow({
                            content: `<div><strong>${centro.nome}</strong><br><p>${address}</p></div>`
                        });

                        distributionCenter = new google.maps.Marker({
                            position: location,
                            map: map,
                            label: {
                                text: "CD",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "bold",
                            },
                            title: centro.nome,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 12,
                                fillColor: "blue",
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: "blue",
                            },
                        });

                        distributionCenter.addListener("mouseover", () => {
                            infowindow.open(map, distributionCenter);
                        });

                        distributionCenter.addListener("mouseout", () => {
                            infowindow.close();
                        });
                    } else {
                        console.error("Erro ao obter coordenadas do Place ID:", status);
                    }
                });
            }
            dadosCd = data
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    fetch("/Roteirizador/BuscarWayPoints")
        .then(response => response.json())
        .then(data => {
            for (let waypoint of data) {
                if (!waypoint.codigoRota) {
                    const geocoder = new google.maps.Geocoder();

                    geocoder.geocode({placeId: waypoint.placeIdWaypoint}, (results, status) => {
                        if (status === "OK" && results[0]) {
                            const location = results[0].geometry.location;
                            const address = results[0].formatted_address;

                            const infowindow = new google.maps.InfoWindow({
                                content: `<div><strong>${waypoint.nome}</strong><br><p>${address}</p></div>`
                            });

                            const marker = new google.maps.Marker({
                                position: location,
                                map: map,
                                label: {
                                    text: "E",
                                    color: "white",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                },
                                customData: waypoint.codigo
                            });

                            marker.addListener("mouseover", () => {
                                infowindow.open(map, marker);
                            });

                            marker.addListener("mouseout", () => {
                                infowindow.close();
                            });

                            markers.push(marker);
                            waypoints.push({
                                location: {lat: location.lat(), lng: location.lng()},
                                stopover: true,
                                customData: waypoint.codigo
                            });
                        } else {
                            console.error("Erro ao obter coordenadas do Place ID:", status)
                        }
                    });
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    fetch("/Roteirizador/BuscarRotas")
        .then(response => response.json())
        .then(data => {
            for (let rota of data) {
                fetchWaypointsForRoute(rota.codigo)
                    .then(waypoints => {
                        renderRoute(rota, waypoints);
                    })
                    .catch((error) => {
                        console.error('Error fetching waypoints for route:', rota.codigo, error);
                    });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
    });

    directionsRenderer.setMap(map);

    map.addListener("rightclick", (event) => {
        const latLng = event.latLng;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({location: latLng}, (results, status) => {
            if (status === "OK" && results[0]) {
                placeId = results[0].place_id;
                openContextMenu(event.pixel);
            } else {
                console.error("Erro ao obter o Place ID:", status);
            }
        });
    });


    window.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
}

function fetchWaypointsForRoute(codigoRota) {
    return fetch("/Roteirizador/BuscarWayPoints")
        .then(response => response.json())
        .then(data => {
            return data.filter(waypoint => waypoint.codigoRota === codigoRota);
        });
}

function renderRoute(rota, waypoints) {
    let origin = {'placeId': rota.placeIdOrigem};
    let destination = {'placeId': rota.placeIdDestino};

    let waypointsArray = waypoints.map(waypoint => ({
        location: {'placeId': waypoint.placeIdWaypoint},
        stopover: true
    }));

    let request = {
        origin: origin,
        destination: destination,
        waypoints: waypointsArray,
        travelMode: "DRIVING",
        optimizeWaypoints: true,
        drivingOptions: {
            departureTime: new Date(),
            trafficModel: "bestguess",
        },
        language: "pt-BR",
    };

    directionsService.route(request, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setOptions({
                polylineOptions: {
                    strokeColor: routeColor,
                    strokeWeight: 6,
                },
            });

            directionsRenderer.setDirections(response);

            const route = response.routes[0];
            const legs = route.legs;

            for (let i = 0; i < waypoints.length; i++) {
                const waypoint = waypoints[i];
                const location = legs[i].start_location;

                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    label: {
                        text: `${i + 1}`,
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "bold",
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: routeColor,
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: routeColor,
                    },
                    customData: waypoint.codigo
                });

                const infowindow = new google.maps.InfoWindow({
                    content: `<div><strong>${waypoint.nome}</strong><br><p>${legs[i].end_address}</p></div>`
                });

                marker.addListener("mouseover", () => {
                    infowindow.open(map, marker);
                });

                marker.addListener("mouseout", () => {
                    infowindow.close();
                });

                markers.push(marker);
            }
        }
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
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({placeId: placeId}, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const address = results[0].formatted_address;

            const infowindow = new google.maps.InfoWindow({
                content: `<div><strong>${name}</strong><br><p>${address}</p></div>`
            });

            distributionCenter = new google.maps.Marker({
                position: location,
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

            distributionCenter.addListener("mouseover", () => {
                infowindow.open(map, distributionCenter);
            });

            distributionCenter.addListener("mouseout", () => {
                infowindow.close();
            });

            fetch("/Roteirizador/AdicionarCentro", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Nome: name,
                    Numero: number,
                    PlaceIdCentro: placeId,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            console.error("Erro ao obter coordenadas do Place ID:", status);
        }
    });
}

function removeWaypoint(index) {
    waypoints.splice(index, 1);
    markers[index].setMap(null);
    markers.splice(index, 1);
    document.getElementById("waypointsList").children[index].remove();
}

function addWaypoint(name, number) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({placeId: placeId}, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const address = results[0].formatted_address;

            fetch("/Roteirizador/AdicionarWaypoint", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    CodigoRota: "",
                    Nome: name,
                    Numero: number,
                    PlaceIdWaypoint: placeId
                }),
            })
                .then(response => response.json())
                .then(data => {
                    const infowindow = new google.maps.InfoWindow({
                        content: `<div><strong>${name}</strong><br><p>${address}</p></div>`
                    });

                    const marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        label: {
                            text: "E",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                        },
                        customData: data.codigo
                    });

                    waypoints.push({
                        location: {lat: location.lat(), lng: location.lng()},
                        stopover: true,
                        customData: data.codigo
                    })

                    marker.addListener("mouseover", () => {
                        infowindow.open(map, marker);
                    });

                    marker.addListener("mouseout", () => {
                        infowindow.close();
                    });

                    markers.push(marker);
                    waypoints.push({location: location, stopover: true});

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

                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            console.error("Erro ao obter coordenadas do Place ID:", status);
        }
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

document.getElementById("calculateRouteButton").addEventListener("click", () => {
    generateRoute("Rota", dadosCd, waypoints);
});


function generateRoute(option, dadosCentro, caminhos) {
    if (!dadosCentro) {
        alert("Por favor, defina um centro de distribuição.");
        return;
    }
    if (!caminhos) {
        alert("Adicione pelo menos um waypoint para calcular a rota.");
        return;
    }

    let waypointsId

    waypointsId = waypoints.map(marker => marker.customData);

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({placeId: dadosCd[0].placeIdCentro}, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;

            let request = {
                origin: location,
                destination: location,
                waypoints: waypoints.map(marker => ({
                    location: marker.location,
                    stopover: true
                })),
                optimizeWaypoints: true,
                travelMode: "DRIVING",
                drivingOptions: {
                    departureTime: new Date(),
                    trafficModel: "bestguess",
                },
                language: "pt-BR",
            };

            directionsService.route(request, async (response, status) => {
                if (status === "OK") {

                    await fetch("/Roteirizador/AdicionarRota", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            PlaceIdOrigem: dadosCd[0].placeIdCentro,
                            PlaceIdDestino: dadosCd[0].placeIdCentro,
                            TipoRota: option,
                            DataRota: '2024-05-30'
                        }),
                    })
                        .then(response => response.json())
                        .then(async data => {
                            const codigoRota = data.codigo;

                            if (waypointsId.length > 0) {
                                const requestPayload = {
                                    CodigoRota: codigoRota,
                                    CodigoWaypoint: waypointsId
                                }

                                await fetch("/Roteirizador/RoteirizarWaypoint", {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(requestPayload),
                                });

                                window.location.reload()

                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            });
        } else {
            console.error("Erro ao obter coordenadas do Place ID:", status);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addItemBtn").addEventListener("click", addItem);
    document
        .getElementById("closeModalBtn")
        .addEventListener("click", closeModal);

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
