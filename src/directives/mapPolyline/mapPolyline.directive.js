angular.module('ap-maps').directive('apMapPolyline', [
    'mapService','linestringNormalizer','$rootScope','$timeout',
    function(mapService,linestringNormalizer,$rootScope,$timeout) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var self = this;
                elem.addClass('ap-map-polyline');
                //elemento del DOM en donde se va a poner el mapa
                var elemMap = elem.find('.map');
                
                //seteamos el alto del mapa 
                scope.height = mapService.height;
                
                //instancia de leaflet del mapa
                self.map = null;
                
                //arreglo de marcadores
                self.markers = [];
                
                //instancia de polyline leaflet
                self.polyline = null;
                
                //inicializamos el mapa
                mapService.init(elemMap[0]).then(function(m) {
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
                    console.log(self.polyline);
                    
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
                
                function clearMap() {
                    console.log(self.markers);
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
                
                /**
                 * Setea la polilinea normalizada
                 */
                function setPolylinesOnMap(polyline) {
                    $timeout(function(){
                        //limpiamos el mapa
                        clearMap();
                    
                        self.polyline = L.polyline(polyline.latLngs, {color: 'red'}).addTo(self.map);
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
                    self.polyline = L.polyline(latLngs, {color: 'red'}).addTo(self.map);
                    
                    //normalizamos la polilinea
                    var denormalizedPolyline = linestringNormalizer.denormalize(latLngs);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:polylinepicker', scope.name, latLngs);
                    
                    if(ngModel !== null) {
                        ngModel.$setViewValue(denormalizedPolyline);
                    }
                };                   
                
                scope.clear = clearMap;
                
                var destroyshowOnMapPolyline = scope.$on('apMap:showOnMapPolyline', function(event, name, latLngs) {
                    console.log('entramos');
                    if(scope.name !== name || latLngs === null) return;
                    
                    setPolylinesOnMap(latLngs);
                    
//                    //borramos todo
//                    clearMap();
//                    
//                    //mostramos la polilinea segun los latLngs que tengamos
//                    self.polyline = L.polyline(latLngs.latLngs, {color: 'red'}).addTo(self.map);
                });
                
                if(ngModel !== null) {
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (val) {
                        if (val && angular.isObject(val)) {
                            setPolylinesOnMap(val);
                        }
                    });
                }
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(self.map !== null) {
                        self.map.off('click', onCLickMap);
                    }
                    
                    destroyshowOnMapPolyline();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPolyline/mapPolyline.template.html'
        };
    }
]);
