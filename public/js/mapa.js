let map;
let waypoints = [];
let markers = [];
let placeId;
let directionsService = new google.maps.DirectionsService();
let directionsRenderer;
let distributionCenter = null;
let isAddingDistributionCenter = false;
let dadosCd;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -26.263376014191284, lng: -48.89011018083488},
        zoom: 12,
    });

    // let decodedPath = google.maps.geometry.encoding.decodePath('d{h_Df{kiHU}BtBL~CRb@Hf@Rz@n@~@h@t@j@t@n@PF\BN?b@FhBE`@Bx@?xCLfBFrC?`AFlACCyC?iB?hBBxCx@IdBCv@@b@Fn@H\VPZdAMlAQrCeAhBw@t@OtFIpBHjCAnADr@DR?BoAH_EJm@P_AQ~@Kl@I~DCnAS?s@EoAEkC@qBIuBB_CD_@FUFc@TeA`@sCdAmAPDaDCmCCiEMgQEkFC_FAcAAgBn@BvEP`IXfA@gAAaIY}GUs@@gA?Am@D_BHsADoDIsHMmIEeG?wBnBCP?CeCAyFGeH@C?C?GAy@@aEHkDDuAzHZtBHxFV@aCCoAAa@@`@BnAA`CoJa@{H[EtAIjDA`EUt@CD?BoC@Q?AmBAmBgCmCwBgBg@WaFmBsCeAgCaA_A_@DvCNhFFpA@pA@`EQt@?JL@XGJ?@f@@tGJvHBzBB|BFrHJdGkDHFvEJvD@tBB|DFdHHfJoI?}DJm@@kFLB`AFtAb@lDlA~K');
    //
    // let polyline = new google.maps.Polyline({
    //     path: decodedPath,
    //     strokeColor: '#FF0000',
    //     strokeOpacity: 1.0,
    //     strokeWeight: 2
    // });
    // polyline.setMap(map);

    // let request = {
    //     origin: {'placeId': "ChIJW4eHE4mv3pQR8NFd70WuTbY"},
    //     destination: {'placeId': "ChIJW4eHE4mv3pQR8NFd70WuTbY"},
    //     waypoints: [
    //         {
    //             location: {'placeId': "ChIJi1vqPuGv3pQRCZrft85XVLI"},
    //             stopover: true
    //         },
    //         {
    //             location: {'placeId': "ChIJj4Iuel6l3pQRfbTuzjWvBWA"},
    //             stopover: true
    //         },
    //     ],
    //     travelMode: 'DRIVING'
    // };
    //
    // directionsService.route(request, function (response, status) {
    //     if (status === 'OK') {
    //         // Se a solicitação foi bem-sucedida, crie um objeto DirectionsRenderer para exibir as direções
    //         var directionsRenderer = new google.maps.DirectionsRenderer({
    //             map: map,
    //             directions: response,
    //             polylineOptions: {
    //                 strokeColor: '#FF0000',
    //                 strokeOpacity: 1.0,
    //                 strokeWeight: 2
    //             }
    //         });
    //     } else {
    //         console.error('Directions request failed due to ' + status);
    //     }
    // });

    fetch("/Roteirizador/BuscarCentrosDistribuicao")
        .then(response => response.json())
        .then(data => {
            const centros = data;
            for (let centro of centros) {
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

    // Busque os waypoints aqui
    fetch("/Roteirizador/BuscarWayPoints")
        .then(response => response.json())
        .then(data => {
            for (let waypoint of data) {
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
                        // Ensuring location has lat/lng properties
                        waypoints.push({
                            location: {lat: location.lat(), lng: location.lng()},
                            stopover: true,
                            customData: waypoint.codigo
                        });

                        const waypointIndex = waypoints.length - 1;
                        const waypointElement = document.createElement("li");
                        waypointElement.textContent = waypoint.nome;
                        const removeButton = document.createElement("button");
                        removeButton.textContent = "Remover";
                        removeButton.addEventListener("click", () => {
                            removeWaypoint(waypointIndex);
                        });
                        waypointElement.appendChild(removeButton);
                        document.getElementById("waypointsList").appendChild(waypointElement);

                    } else {
                        console.error("Erro ao obter coordenadas do Place ID:", status);
                    }
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    // // Busque as rotas aqui
    // fetch("/Roteirizador/BuscarRotas")
    //     .then(response => response.json())
    //     .then(data => {
    //       const rotas = data;
    //       for (let rota of rotas) {
    //         // Aqui você precisa adicionar o código para desenhar a rota no mapa
    //         // usando os dados da rota
    //       }
    //     })
    //     .catch((error) => {
    //       console.error('Error:', error);
    //     });

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

function buscarCaminhos() {
    return fetch("/Roteirizador/BuscarWayPoints")
        .then(response => response.json())
        .then(data => {
            const waypoints = data;
            const geocoder = new google.maps.Geocoder();

            for (let waypoint of waypoints) {

                geocoder.geocode({placeId: waypoint.placeId}, (results, status) => {

                    if (status === "OK" && results[0]) {
                        const location = results[0].geometry.location;

                        new google.maps.Marker({
                            position: location,
                            map: map,
                            label: {
                                text: "E",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "bold",
                            },
                            title: waypoint.nome,
                        });
                    }
                })
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
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
    // Recalcular a rota se necessário
}

function addWaypoint(name, number) {
    const geocoder = new google.maps.Geocoder();

    // Use o geocoder para obter as coordenadas geográficas do placeId
    geocoder.geocode({placeId: placeId}, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const address = results[0].formatted_address;

            // Adicione a chamada para o backend aqui
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
                    console.log(data.codigo);

                    const infowindow = new google.maps.InfoWindow({
                        content: `<div><strong>${name}</strong><br><p>${address}</p></div>`
                    });

                    // Crie um marcador com as coordenadas obtidas
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
        }: PlaceId: ${waypoint.placeId}`;
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

    console.log(waypoints)

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

            directionsService.route(request, (response, status) => {
                if (status === "OK") {
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

                    fetch("/Roteirizador/AdicionarRota", {
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
                                // Montar a estrutura da requisição conforme o modelo RoteirizarWaypointsRequest
                                const requestPayload = {
                                    CodigoRota: codigoRota,
                                    CodigoWaypoint: waypointsId
                                }

                                fetch("/Roteirizador/RoteirizarWaypoint", {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(requestPayload),
                                });
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

function getCentros() {
    return fetch("/Roteirizador/BuscarCentrosDistribuicao")
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
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
            const centros = getCentros();
            const caminhos = buscarCaminhos();
            closeRouteOptionsModal();
            generateRoute(option, centros, caminhos);
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
