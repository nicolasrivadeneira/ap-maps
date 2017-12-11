angular.module('ap-maps', [
    'adminPanel'
]);
;angular.module('ap-maps').directive('apMapPoint', [
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
                
                scope.$on('apMap:showOnMap', function(event, name, lat, lng) {
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
;angular.module('ap-maps').directive('apMapPolygon', [
    'mapService','$rootScope',
    function(mapService,$rootScope) {
        return {
            restrict: 'AE',
            scope: {
                name: '@',
                type: '@?'
            },
            link: function(scope, elem, attr) {
                //elemento del DOM en donde se va a poner el mapa
                var elemMap = elem.find('.map');
                
                //seteamos el alto del mapa 
                scope.height = mapService.height;
                
                //instancia de leaflet del mapa
                var map = null;
                
                //arreglo de marcadores
                var markers = [];
                
                //instancia de polyline leaflet
                var polyline = null;
                
                //instancia de polygon leaflet
                var polygon = null;
                
                //inicializamos el mapa
                mapService.init(elemMap[0]).then(function(m) {
                    map = m;
                    
                    //agregamos el evento click sobre el mapa
                    map.on('click', onCLickMap);
                });
                
                //evento al hacer click sobre el mapa.
                function onCLickMap(e) {
                    //prevenimos que no haya 
                    if(map === null) return;
                    var latLng = e.latlng;
                    
                    //agregamos un marcador sobre el mapa
                    var marker = L.marker(latLng);
                    marker.addTo(map);
                    marker.on('click',onClickMarker); 
                    //agregamos el marcador a la lista de marcadores
                    markers.push(marker);
                    
                    //si la polilinea no existe se la crea, caso contrario se agrega el objeto LatLng 
                    if(polyline === null) {
                        polyline = L.polyline([latLng], {color: 'red'}).addTo(map);
                    } else {
                        polyline.addLatLng(latLng);
                    }
                }
                
                
                function onClickMarker(e) {
                    //obtenemos el arreglo de longitudes y latitudes
                    var latLngs = polyline.getLatLngs();
                    
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
                    polyline.remove();
                    
                    //creamos de nuevo la polilinea
                    polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                }
                
                function clearMap() {
                    //removemos todos lo marcadores
                    for(var i = 0; i < markers.length; i++) {
                        markers[i].remove();
                    }
                    //limpiamos el arreglo
                    markers = [];
                    
                    //removemos la polilinea
                    if(polyline !== null) {
                        polyline.remove();
                        polyline = null; 
                    }
                    
                    //removemos el poligono
                    if(polygon !== null) {
                        polygon.remove();
                        polygon = null; 
                    }
                }
                
                /**
                 * Se tiene en cuenta el type de la directiva para ver si se envia un poligono o una polilinea.
                 * Si es un poligono, cuando se apreta el boton terminar se cierra el poligono
                 */
                scope.finish = function() {
                    if(polyline === null) return;
                    
                    //obtenemos el arreglo de longitudes y latitudes
                    var latLngs = polyline.getLatLngs();
                    
                    //borramos todo
                    clearMap();
                    
                    //creamos el poligono si el type es polygon, sino creamos una polilinea.
                    if(scope.type === "polygon") {
                        polygon = L.polygon(latLngs, {color: 'red'}).addTo(map);
                    } else {
                        polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                    }
                    
                    console.log(latLngs);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:mappicker', scope.name, latLngs);
                };
                
                scope.clear = clearMap;
                
                var destroyshowOnMapPolygon = scope.$on('apMap:showOnMapPolygon', function(event, name, latLngs) {
                    if(scope.name !== name || latLngs === null) return;
                    
                    //borramos todo
                    clearMap();
                    
                    //creamos el poligono si el type es polygon, sino creamos una polilinea.
                    if(scope.type === "polygon") {
                        polygon = L.polygon(latLngs, {color: 'red'}).addTo(map);
                    } else {
                        polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                    }
                });
                
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(map !== null) {
                        map.off('click', onCLickMap);
                    }
                    
                    destroyshowOnMapPolygon();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPolygon/mapPolygon.template.html'
        };
    }
]);
;angular.module('ap-maps').directive('pointPicker', [
    'mapService','$rootScope',
    function(mapService,$rootScope) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                scope.model = {
                    latitud: null,
                    longitud: null
                };
                
                var destroyEventPointPicker = scope.$on('ap-map:pointpicker',function(event, name, latLng) {
                    if(scope.name !== name) return;
                    
                    var obj = {
                        latitud: latLng.lat,
                        longitud: latLng.lng
                    };
                    ngModel.$setViewValue(obj);
                });
                
                scope.clickBtn = function() {
                    if(attr.view) {
                        $rootScope.$broadcast('apBox:show', attr.view);
                    }
                    $rootScope.$broadcast('apMap:showOnMap', scope.name, scope.model.latitud, scope.model.longitud);
                };
                
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (val) {
                    if (val) {
                        scope.model.latitud = val.lat;
                        scope.model.longitud = val.lng;
                    }
                });
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    destroyEventPointPicker();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/pointPicker/pointPicker.template.html'
        };
    }
]);
;angular.module('ap-maps').directive('polygonPicker', [
    'mapService','$rootScope',
    function(mapService,$rootScope) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var polygon = null;
                
                var destroyEventMapPicker = scope.$on('ap-map:mappicker',function(event, name, latLngs) {
                    if(scope.name !== name) return;
                    
                    var points = [];
                    for(var i = 0; i < latLngs.length; i++) {
                        points.push({
                            latitud: latLngs[i].lat,
                            longitud: latLngs[i].lng
                        });
                    }
                    ngModel.$setViewValue(points);
                });
                
                scope.clickBtn = function() {
                    if(attr.view) {
                        $rootScope.$broadcast('apBox:show', attr.view);
                    }
                    $rootScope.$broadcast('apMap:showOnMapPolygon', scope.name, polygon);
                };
                
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (val) {
                    if (val) {
                        console.log(val);
                        polygon = val;
                    }
                });
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    destroyEventMapPicker();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/polygonPicker/polygonPicker.template.html'
        };
    }
]);
;angular.module('ap-maps').provider('MapsConfig', function() {
    var defaultMapHeight = 435;
    var defaultCenter = [-31.649913, -60.712328];
    var defaultZoom = 13;
    var defaultTileProvider = 'OpenStreetMap.Mapnik';
    
    this.setMapHeight = function(height) {
        defaultMapHeight = height;
        return this;
    };
    
    this.setCenter = function(center) {
        defaultCenter = center;
        return this;
    };
    
    this.setZoom = function(zoom) {
        defaultZoom = zoom;
        return this;
    };
    
    this.setTileProvider = function(tileProvider) {
        defaultTileProvider = tileProvider;
        return this;
    };
    
    this.$get = [
        function () {
            return {
                defaultMapHeight: defaultMapHeight,
                defaultCenter: defaultCenter,
                defaultZoom: defaultZoom,
                defaultTileProvider: defaultTileProvider
            };
        }
    ];
});;angular.module('ap-maps').service('mapService', [
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
]);;angular.module('adminPanel').run(['$templateCache', function ($templateCache) {
  $templateCache.put("directives/mapPoint/mapPoint.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div>");
  $templateCache.put("directives/mapPolygon/mapPolygon.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div><button type=button class=button ng-click=clear()>Limpiar</button><button type=button class=button ng-click=finish()>Terminar</button>");
  $templateCache.put("directives/pointPicker/pointPicker.template.html",
    "<div class=row><div class=\"columns small-12 large-6\"><label>Latitud <input type=text ng-value=model.latitud readonly></label></div><div class=\"columns small-12 large-6\"><label>Longitud <input type=text ng-value=model.longitud readonly></label></div><div class=\"columns small-12 large-6\"><button type=button class=button ng-click=clickBtn()>Ver Punto en Mapa</button></div></div>");
  $templateCache.put("directives/polygonPicker/polygonPicker.template.html",
    "<div class=row><div class=\"columns small-12 large-6\"><button type=button class=button ng-click=clickBtn()>Ver en Mapa</button></div></div>");
}]);
