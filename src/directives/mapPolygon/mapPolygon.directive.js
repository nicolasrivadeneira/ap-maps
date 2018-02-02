angular.module('ap-maps').directive('apMapPolygon', [
    'mapService','polygonNormalizer','$rootScope','$timeout',
    function(mapService,polygonNormalizer,$rootScope,$timeout) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var self = this;
                elem.addClass('ap-map-polygon');
                //elemento del DOM en donde se va a poner el mapa
                self.elemMap = elem.find('.map');
                
                //seteamos el alto del mapa 
                scope.height = mapService.height;
                
                //instancia de leaflet del mapa
                self.map = null;
                
                //arreglo de marcadores
                self.markers = [];
                
                //instancia de polyline leaflet
                self.polyline = null;
                
                //instancia de polygon leaflet
                self.polygon = null;
                
                //inicializamos el mapa
                mapService.init(self.elemMap[0]).then(function(m) {
                    self.map = m;
                    
                    //agregamos el evento click sobre el mapa
                    self.map.on('click', onCLickMap);
                });
                
                //evento al hacer click sobre el mapa.
                function onCLickMap(e) {
                    //prevenimos que no haya 
                    if(self.map === null) return;
                    var latLng = e.latlng;
                    //agregamos un marcador sobre el mapa
                    var marker = L.marker(latLng);
                    marker.addTo(self.map);
                    marker.on('click',onClickMarker); 
                    //agregamos el marcador a la lista de marcadores
                    self.markers.push(marker);
                    
                    
                    //si la polilinea no existe se la crea, caso contrario se agrega el objeto LatLng 
                    if(self.polyline === null) {
                        self.polyline = L.polyline([latLng], {color: 'red'}).addTo(self.map);
                    } else {
                        self.polyline.addLatLng(latLng);
                    }
                }
                
                
                function onClickMarker(e) {
                    //obtenemos el arreglo de longitudes y latitudes
                    var latLngs = self.polyline.getLatLngs();
                    
                    //removemos la posicion del arreglo de posiciones
                    for(var i = 0; i < latLngs.length; i++) {
                        if(latLngs[i].equals(e.latlng)) {
                            latLngs.splice(i, 1);
                            break;
                        }
                    }
                    
                    //borramos el marcador
                    this.remove();
                    
                    //borramos la polilinea
                    self.polyline.remove();
                    
                    //creamos de nuevo la polilinea
                    self.polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                }
                
                function clearMap() {
                    //removemos todos lo marcadores
                    for(var i = 0; i < self.markers.length; i++) {
                        self.markers[i].off('click',onClickMarker); 
                        self.markers[i].remove();
                    }
                    //limpiamos el arreglo
                    self.markers = [];
                    
                    //removemos la polilinea
                    if(self.polyline !== null) {
                        self.polyline.remove();
                        self.polyline = null; 
                    }
                    
                    //removemos el poligono
                    if(self.polygon !== null) {
                        self.polygon.remove();
                        self.polygon = null; 
                    }
                }
                
                /**
                 * Setea el poligono denormalizado
                 */
                function setPolygonOnMap(polygon) {
                    $timeout(function(){
                        var normalizedPolygon =  polygonNormalizer.normalize(polygon);
                        
                        //limpiamos el mapa
                        clearMap();
                    
                        self.polygon = L.polygon(normalizedPolygon[0].latLngs, {color: 'red'}).addTo(self.map);
                    });
                }
                
                /**
                 * Se tiene en cuenta el type de la directiva para ver si se envia un poligono o una polilinea.
                 * Si es un poligono, cuando se apreta el boton terminar se cierra el poligono
                 */
                scope.finish = function() {
                    if(self.polyline === null) return;
                    
                    //obtenemos el arreglo de longitudes y latitudes
                    var latLngs = self.polyline.getLatLngs();
                    
                    //borramos todo
                    clearMap();
                    
                    //creamos el poligono si el type es polygon, sino creamos una polilinea.
                    self.polygon = L.polygon(latLngs, {color: 'red'}).addTo(self.map);
                    
                    //normalizamos el poligono en un anillo
                    var ring = [];
                    ring.push(latLngs);
                    
                    var denormalizedPolygon = polygonNormalizer.denormalize(ring);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:polygonpicker', scope.name, denormalizedPolygon);
                    if(ngModel !== null) {
                        ngModel.$setViewValue(denormalizedPolygon);
                    }
                };
                
                scope.clear = clearMap;
                
                var destroyshowOnMapPolygon = scope.$on('apMap:showOnMapPolygon', function(event, name, polygon) {
                    if(scope.name !== name || polygon === null) return;
                    
                    setPolygonOnMap(polygon);
                });
                
                if(ngModel !== null) {
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (val) {
                        if (val && angular.isObject(val)) {
                            setPolygonOnMap(val);
                        }
                    });
                }
                
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(self.map !== null) {
                        self.map.off('click', onCLickMap);
                    }
                    
                    destroyshowOnMapPolygon();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPolygon/mapPolygon.template.html'
        };
    }
]);
