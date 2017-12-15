/**
 * Convierte el objeto Point de Creof doctrine de symfony a un objeto LatLng de leaflet
 */
angular.module('ap-maps').service('pointNormalizer', [
    function() {
        this.normalize = function(point) {
            console.log('point',point);
            return L.latLng(point.coordinates[0], point.coordinates[1]);
        };
        
        this.denormalize = function(latLng) {
            return {
                x: latLng.lat,
                y: latLng.lng
            };
        };
    }
]);