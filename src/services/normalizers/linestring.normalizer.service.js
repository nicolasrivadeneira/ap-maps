/**
 * Convierte el objeto LineString a un arreglo de latLangs de leaflet. 
 * 
 * En leaflet el objeto polyline es lo mismo que el objeto LineString en creof doctrine de symfony
 */
angular.module('ap-maps').service('linestringNormalizer', [
    'pointNormalizer',
    function(pointNormalizer) {
        this.normalize = function(lineString) {
            var latLngs = [], i, point;
            
            //tratamiento de los puntos
            if(angular.isArray(lineString)) {
                for(i = 0; i < lineString.length; i++) {
                    point = lineString[i];
                    latLngs.push(pointNormalizer.normalize(point));
                }
            } else if(lineString) {
                for(i = 0; i < lineString.points.length; i++) {
                    point = lineString.points[i];
                    latLngs.push(pointNormalizer.normalize(point));
                }
            }
            
            
            return {
                latLngs: latLngs,
                closed: lineString.closed
            };
        };
        
        
        this.denormalize = function(latLngs) {
            var points = [];
            
            for(var i = 0; i < latLngs.length; i++) {
                points.push(pointNormalizer.denormalize(latLngs[i]));
            }
            
            return {
                points: points
            };
        };
    }
]);