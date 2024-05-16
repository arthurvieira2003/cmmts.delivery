let map;
let directionsService;
let directionsRenderer;
let autocomplete;
let trafficLayer;

function initMap() {
    // Inicialize o mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -23.55052, lng: -46.633308 },
        zoom: 14
    });

    // Inicialize o serviço de direções e o renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    trafficLayer = new google.maps.TrafficLayer();

    // Configurar o autocomplete para a barra de pesquisa
    const input = document.getElementById('pac-input');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    // Lidar com a seleção de um lugar da barra de pesquisa
    autocomplete.addListener('place_changed', onPlaceChanged);

    // Adicione um listener para carregar a rota ao clicar no mapa
    map.addListener('click', (event) => {
        const destination = event.latLng;
        calculateAndDisplayRoute(destination);
    });

    document.getElementById('toggle-traffic').addEventListener('click', function () {
        if (trafficLayer.getMap() === null) {
            trafficLayer.setMap(map);
        } else {
            trafficLayer.setMap(null);
        }
    });
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
        window.alert("Nenhum detalhe disponível para: '" + place.name + "'");
        return;
    }

    // Se o lugar tiver geometria, centralize o mapa nele e calcule a rota
    map.setCenter(place.geometry.location);
    map.setZoom(17);

    const destination = place.geometry.location;
    calculateAndDisplayRoute(destination);
}

function calculateAndDisplayRoute(destination) {
    const start = { lat: -23.55052, lng: -46.633308 }; // Ponto de partida

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
