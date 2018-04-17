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
                var lineString = linestringNormalizer.denormalize(ring);
                lineString.points.push(lineString.points[0]);
                
                lineStrings.push(lineString);
            }
            
            return {
                rings:lineStrings
            };
        };
    }
]);