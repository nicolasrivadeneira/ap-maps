angular.module('ap-maps').directive('apMapPoint', [
    'mapService','$rootScope',
    function(mapService,$rootScope) {
        return {
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr) {
                //elemento del DOM en donde se va a poner el mapa
                var elemMap = elem.find('.map');
                
                //seteamos el alto del mapa 
                scope.height = mapService.height;
                
                //instancia de leaflet del mapa
                var map = null;
                
                //instancia del marcador sobre el mapa
                var marker = null;
                
                //inicializamos el mapa
                mapService.init(elemMap[0]).then(function(m) {
                    map = m;
                    
                    //agregamos el evento click sobre el mapa
                    map.on('click', onCLickMap);
                });
                
                function setMarker(lat, lng) {
                    //ya hay un marcardor, lo eliminamos primero
                    if(marker !== null) {
                        removeMarker();
                    }
                    marker = L.marker([lat, lng]);
                    marker.addTo(map);
                }
                
                function removeMarker() {
                    marker.remove();
                    marker = null;
                }
                
                
                //evento al hacer click sobre el mapa.
                function onCLickMap(e) {
                    //prevenimos que no haya 
                    if(map === null) return;
                    var latLng = e.latlng;
                    
                    //ponemos el marcador en el mapa
                    setMarker(latLng.lat, latLng.lng);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:pointpicker', scope.name, latLng);
                }
                
                scope.$on('apMap:showOnMapPoint', function(event, name, lat, lng) {
                    if(scope.name !== name || lat === null || lng === null) return;
                    setMarker(lat, lng);
                });
                
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(map !== null) {
                        map.off('click', onCLickMap);
                    }
                    
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPoint/mapPoint.template.html'
        };
    }
]);
