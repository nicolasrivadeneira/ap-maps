/**
 * Convierte el objeto LineString a un arreglo de latLangs de leaflet
 */
angular.module('ap-maps').service('polygonNormalizer', [
    'linestringNormalizer',
    function(linestringNormalizer) {
        this.normalize = function(polygon) {
            var rings = [];
            
            for(var i = 0; i < polygon.rings.length; i++) {
                var lineString = polygon.rings[i];
                rings.push(linestringNormalizer.serialize(lineString));
            }
            
            console.log('rings',rings);
            
            return rings;
        };
        
        
        this.denormalize = function(latlngs) {
            return latlngs;
        };
    }
]);