angular.module('ap-maps').directive('apMap', [
    'MapsConfig','$timeout',
    function(MapsConfig,$timeout) {
        return {
            restrict: 'AE',
            link: function(scope, elem, attr) {
                scope.height = MapsConfig.defaultMapHeight;
                
                $timeout(function() {
                    var elemMap = elem.find('.map');
                    
                    var map = L.map(elemMap[0], {
                        center: MapsConfig.defaultCenter,
                        zoom: MapsConfig.defaultZoom
                    }, 1000);
                    
                    L.tileLayer.provider(MapsConfig.defaultTileProvider).addTo(map);
                });
            },
            templateUrl: 'directives/mapa/map.template.html'
        };
    }
]);
