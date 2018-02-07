angular.module('ap-maps').directive('apMapPolygon', [
    'mapService','polygonNormalizer','$rootScope','$timeout',
    function(mapService,polygonNormalizer,$rootScope,$timeout) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            scope: {
                name: '@',
                fixedPolygons: '=?'
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
                self.polygon = [];
                
                //instancia de polygon leaflet
                self.fixedPolygons = [];
                
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
                    self.polyline = L.polyline(latLngs, {color: 'red'}).addTo(self.map);
                }
                
                function clearPolyline() {
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
                }
                
                function clearMap() {
                    clearPolyline();
                    
                    //removemos los poligonos
                    console.log('self.polygon',self.polygon);
                    for(var i = 0; i < self.polygon.length; i++) { 
                        self.polygon[i].remove();
                    }
                    
                    self.polygon = []; 
                }
                
                /**
                 * Setea el poligono denormalizado
                 */
                function setPolygonsOnMap(polygon) {
                    $timeout(function(){
                        var normalizedPolygon =  polygonNormalizer.normalize(polygon);
                        //limpiamos el mapa
                        clearMap();
                    
                        self.polygon = [];
                        for(var i = 0; i < normalizedPolygon.length; i++) {
                            self.polygon.push(L.polygon(normalizedPolygon[i].latLngs, {color: 'red'}).addTo(self.map));
                        }
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
                    clearPolyline();
                    
                    //creamos el poligono si el type es polygon, sino creamos una polilinea.
                    if(ngModel === null) {
                        self.polygon.push(L.polygon(latLngs, {color: 'red'}).addTo(self.map));
                    }
                    
                    //normalizamos el poligono en un anillo
                    var rings = [];
                    for(var i = 0; i < self.polygon.length; i++) {
                        rings.push(self.polygon[i].getLatLngs()[0]);
                    }
                    if(ngModel !== null) {
                        rings.push(latLngs);
                    }
                    var denormalizedPolygon = polygonNormalizer.denormalize(rings);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:polygonpicker', scope.name, denormalizedPolygon);
                    if(ngModel !== null) {
                        ngModel.$setViewValue(denormalizedPolygon);
                    }
                };
                
                scope.clear = clearMap;
                
                var destroyshowOnMapPolygon = scope.$on('apMap:showOnMapPolygon', function(event, name, polygon) {
                    if(scope.name !== name || polygon === null) return;
                    
                    setPolygonsOnMap(polygon);
                });
                
                if(ngModel !== null) {
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (val) {
                        if (val && angular.isObject(val)) {
                            setPolygonsOnMap(val);
                        }
                    });
                }
                
                scope.$watch('fixedPolygons', function(polygons){
                    $timeout(function(){
                        var normalizedPolygon = polygonNormalizer.normalize(polygons), i;

                        //removemos los poligonos
                        for(i = 0; i < self.fixedPolygons.length; i++) { 
                            self.fixedPolygons[i].remove();
                        }
                        self.fixedPolygons = []; 
                    
                        //seteamos los nuevos poligonos
                        for(i = 0; i < normalizedPolygon.length; i++) {
                            self.fixedPolygons.push(L.polygon(normalizedPolygon[i].latLngs, {color: 'blue'}).addTo(self.map));
                        }
                    });
                });
                
                
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
