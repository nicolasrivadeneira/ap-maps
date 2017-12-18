/**
 * Convierte el objeto Point de Creof doctrine de symfony a un objeto LatLng de leaflet
 */
angular.module('ap-maps').service('pointNormalizer', [
    function() {
        this.normalize = function(point) {
            return L.latLng(point.x, point.y);
        };
        
        this.denormalize = function(latLng) {
            return {
                x: latLng.lat,
                y: latLng.lng
            };
        };
    }
]);