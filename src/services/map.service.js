angular.module('ap-maps').service('mapService', [
    'MapsConfig','$timeout',
    function(MapsConfig,$timeout) {
        var height = MapsConfig.defaultMapHeight;
        return {
            height: height,
            init: function(elem) {
                return $timeout(function() {
                    var map = L.map(elem, {
                        center: MapsConfig.defaultCenter,
                        zoom: MapsConfig.defaultZoom
                    }, 1000);

                    L.tileLayer.provider(MapsConfig.defaultTileProvider).addTo(map);
                    
                    return map;
                });
            }
        };
    }
]);