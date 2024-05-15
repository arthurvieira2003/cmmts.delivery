let map;
let directionsService;
let directionsRenderer;

function initMap() {
    // Inicialize o mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -26.28468913327435, lng: -48.850313853760944 },
        zoom: 14
    });

    // Inicialize o serviço de direções e o renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Adicione um listener para carregar a rota ao clicar no mapa
    map.addListener('click', (event) => {
        const destination = event.latLng;
        calculateAndDisplayRoute(destination);
    });
}

function calculateAndDisplayRoute(destination) {
    const start = { lat: -26.28468913327435, lng: -48.850313853760944 }; // Ponto de partida

    directionsService.route(
        {
            origin: start,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}
