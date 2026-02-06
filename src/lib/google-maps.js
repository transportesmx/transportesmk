/**
 * Utilidades de Google Maps para TransportesMX
 */

// Centro de mapa por defecto (San Miguel de Allende)
export const defaultCenter = {
  lat: 20.914,
  lng: -100.745,
};

// Opciones del mapa (estilo oscuro)
export const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#3a3a3a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#5a5a5a' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  ],
};

// Opciones del Autocomplete (restringido a México)
export const autocompleteOptions = {
  componentRestrictions: { country: 'mx' },
  types: ['geocode', 'establishment'],
};

// Estilo de la ruta (polyline)
export const routeOptions = {
  strokeColor: '#3b82f6',
  strokeOpacity: 0.9,
  strokeWeight: 5,
};

/**
 * Calcula la ruta entre dos puntos
 */
export async function calcularRuta(directionsService, origen, destino) {
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin: origen,
        destination: destino,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          const leg = result.routes[0].legs[0];
          resolve({
            directions: result,
            distance: leg.distance.text,
            distanceValue: leg.distance.value,
            duration: leg.duration.text,
            durationValue: leg.duration.value,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
          });
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      }
    );
  });
}
