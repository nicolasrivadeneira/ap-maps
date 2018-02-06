/**
 * Convierte el objeto LineString a un arreglo de latLangs de leaflet
 */
angular.module('ap-maps').service('polygonNormalizer', [
    'linestringNormalizer',
    function(linestringNormalizer) {
        this.normalize = function(polygon) {
            var rings = [], i, lineString;
            
            if(angular.isArray(polygon)) {
                for(i = 0; i < polygon.length; i++) {
                    lineString = polygon[i];
                    rings.push(linestringNormalizer.normalize(lineString));
                }
            } else if(polygon) {
                for(i = 0; i < polygon.rings.length; i++) {
                    lineString = polygon.rings[i];
                    rings.push(linestringNormalizer.normalize(lineString));
                }
            }
            
            return rings;
        };
        
        
        this.denormalize = function(rings) {
            var lineStrings = [];
            
            for(var i = 0; i < rings.length; i++){
                var ring = rings[i];
                //controlamos que el poligono este cerrado
                console.log('ring ' + i, rings[i]);
                if(!ring[0].equals(ring[ring.length - 1])) {
                    ring.push(ring[0]);
                }
                var lineString = linestringNormalizer.denormalize(ring);
                
                console.log('lineString ' + i, lineString);
                lineStrings.push(lineString);
            }
            
            return {
                rings:lineStrings
            };
        };
    }
]);