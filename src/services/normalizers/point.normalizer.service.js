/**
 * Convierte el objeto Point de Creof doctrine de symfony a un objeto LatLng de leaflet
 */
angular.module('ap-maps').service('pointNormalizer', [
    function() {
        this.normalize = function(point) {
            if(angular.isArray(point)) {
                return L.latLng(point[1], point[0]);
            }
            return L.latLng(point.y, point.x);
        };
        
        this.denormalize = function(latLng) {
            return {
                x: latLng.lng,
                y: latLng.lat
            };
        };
    }
]);