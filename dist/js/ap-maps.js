angular.module('ap-maps', [
    'adminPanel'
]);
;angular.module('ap-maps').directive('apMapPoint', [
    'mapService','pointNormalizer','$rootScope','$timeout',
    function(mapService,pointNormalizer,$rootScope,$timeout) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var readonly = (!angular.isUndefined(attr.readonly));
                var self = this;
                //elemento del DOM en donde se va a poner el mapa
                self.elemMap = elem.find('.map');
                
                //seteamos el alto del mapa 
                scope.height = mapService.height;
                
                //instancia de leaflet del mapa
                self.map = null;
                
                //instancia del marcador sobre el mapa
                self.marker = null;
                
                self.point = null;
                
                //inicializamos el mapa
                self.initPromise = mapService.init(self.elemMap[0]).then(function(m) {
                    self.map = m;
                    
                    if(!readonly) {
                        //agregamos el evento click sobre el mapa
                        self.map.on('click', onCLickMap);
                    }
                    
                    if(self.point !== null) {
                        self.map.panTo(self.point);
                    
                        setMarker(self.point);
                    }
                });
                
                function setPointOnMap(point) {
                    var latLng = pointNormalizer.normalize(point);
                    self.point = latLng;
                    
                    if(self.map !== null) {
                        self.map.panTo(latLng);
                    
                        setMarker(latLng);
                    }
                }
                
                function setMarker(latLng) {
                    //ya hay un marcardor, lo eliminamos primero
                    if(self.marker !== null) {
                        removeMarker();
                    }
                    self.marker = L.marker([latLng.lat, latLng.lng]);
                    self.marker.addTo(self.map);
                }
                
                function removeMarker() {
                    self.marker.remove();
                    self.marker = null;
                }
                
                
                //evento al hacer click sobre el mapa.
                function onCLickMap(e) {
                    //prevenimos que no haya 
                    if(self.map === null) return;
                    var latLng = e.latlng;
                    
                    //ponemos el marcador en el mapa
                    setMarker(latLng);
                    
                    var denormalizedPoint = pointNormalizer.denormalize(latLng);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:pointpicker', scope.name, denormalizedPoint);
                    if(ngModel !== null) {
                        ngModel.$setViewValue(denormalizedPoint);
                    }
                }
                
                scope.$on('apMap:showOnMapPoint', function(event, name, point) {
                    if(scope.name !== name || point === null) return;
                    
                    setPointOnMap(point);
                });
                
                
                if(ngModel !== null) {
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (val) {
                        if (val && angular.isObject(val)) {
                            setPointOnMap(val);
                        }
                    });
                }
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(self.map !== null) {
                        self.map.off('click', onCLickMap);
                    }
                    
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPoint/mapPoint.template.html'
        };
    }
]);
;angular.module('ap-maps').directive('apMapPolygon', [
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
;angular.module('ap-maps').directive('apMapPolyline', [
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
                
                //arreglo de marcadores
                var markers = [];
                
                //instancia de polyline leaflet
                var polyline = null;
                
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
                    console.log(markers);
                    //removemos todos lo marcadores
                    for(var i = 0; i < markers.length; i++) {
                        markers[i].off('click',onClickMarker); 
                        markers[i].remove();
                    }
                    //limpiamos el arreglo
                    markers = [];
                    
                    //removemos la polilinea
                    if(polyline !== null) {
                        polyline.remove();
                        polyline = null; 
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
                    polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:polylinepicker', scope.name, latLngs);
                };
                
                scope.clear = clearMap;
                
                var destroyshowOnMapPolyline = scope.$on('apMap:showOnMapPolyline', function(event, name, latLngs) {
                    if(scope.name !== name || latLngs === null) return;
                    
                    //borramos todo
                    clearMap();
                    
                    //mostramos la polilinea segun los latLngs que tengamos
                    polyline = L.polyline(latLngs.latLngs, {color: 'red'}).addTo(map);
                });
                
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(map !== null) {
                        map.off('click', onCLickMap);
                    }
                    
                    destroyshowOnMapPolyline();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPolyline/mapPolyline.template.html'
        };
    }
]);
;angular.module('ap-maps').directive('pointPicker', [
    '$rootScope','$timeout',
    function($rootScope,$timeout) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var self = this;
                scope.model = {
                    latitud: null,
                    longitud: null
                };
                self.point = null;
                
                var destroyEventPointPicker = scope.$on('ap-map:pointpicker',function(event, name, point) {
                    if(scope.name !== name) return;

                    ngModel.$setViewValue(point);
                });
                
                scope.clickBtn = function() {
                    if(attr.view) {
                        $rootScope.$broadcast('apBox:show', attr.view);
                        $timeout(function() {
                            $rootScope.$broadcast('apMap:showOnMapPoint', scope.name, self.point);
                        });
                    } else {
                        $rootScope.$broadcast('apMap:showOnMapPoint', scope.name, self.point);
                    }
                };
                
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (val) {
                    if (val) {
                        self.point = val;
                        scope.model.latitud = val.y;
                        scope.model.longitud = val.x;
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
    '$rootScope','$timeout',
    function($rootScope,$timeout) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var self = this;
                self.polygon = null;
                
                var destroyEventMapPicker = scope.$on('ap-map:polygonpicker',function(event, name, polygon) {
                    if(scope.name !== name) return;
                    
                    ngModel.$setViewValue(polygon);
                });
                
                scope.clickBtn = function() {
                    if(attr.view) {
                        $rootScope.$broadcast('apBox:show', attr.view);
                        $timeout(function() {
                            $rootScope.$broadcast('apMap:showOnMapPolygon', scope.name, self.polygon);
                        });
                    } else {
                        $rootScope.$broadcast('apMap:showOnMapPolygon', scope.name, self.polygon);
                    }
                };
                
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (val) {
                    if (val) {
                        self.polygon = val;
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
;angular.module('ap-maps').directive('polylinePicker', [
    'linestringNormalizer','$rootScope',
    function(linestringNormalizer,$rootScope) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var polygon = null;
                
                var destroyEventMapPicker = scope.$on('ap-map:polylinepicker',function(event, name, latLngs) {
                    if(scope.name !== name) return;

                    var obj = linestringNormalizer.denormalize(latLngs);
                    ngModel.$setViewValue(obj);
                });
                
                scope.clickBtn = function() {
                    if(attr.view) {
                        $rootScope.$broadcast('apBox:show', attr.view);
                    }
                    $rootScope.$broadcast('apMap:showOnMapPolyline', scope.name, polygon);
                };
                
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (val) {
                    if (val) {
                        polygon = linestringNormalizer.normalize(val);
                    }
                });
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    destroyEventMapPicker();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/polylinePicker/polylinePicker.template.html'
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
]);;/**
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
]);;/**
 * Convierte el objeto Point de Creof doctrine de symfony a un objeto LatLng de leaflet
 */
angular.module('ap-maps').service('pointNormalizer', [
    function() {
        this.normalize = function(point) {
            if(angular.isArray(point)) {
                return L.latLng(point[1], point[0]);
            }
            return L.latLng(point.y, point.x);
        };
        
        this.denormalize = function(latLng) {
            return {
                x: latLng.lng,
                y: latLng.lat
            };
        };
    }
]);;/**
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
                
                lineStrings.push(lineString);
            }
            
            return {
                rings:lineStrings
            };
        };
    }
]);;angular.module('adminPanel').run(['$templateCache', function ($templateCache) {
  $templateCache.put("directives/mapPoint/mapPoint.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div>");
  $templateCache.put("directives/mapPolygon/mapPolygon.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div><button type=button class=button ng-click=clear()>Limpiar</button><button type=button class=button ng-click=finish()>Terminar</button>");
  $templateCache.put("directives/mapPolyline/mapPolyline.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div><button type=button class=button ng-click=clear()>Limpiar</button><button type=button class=button ng-click=finish()>Terminar</button>");
  $templateCache.put("directives/pointPicker/pointPicker.template.html",
    "<div class=row><div class=\"columns small-12 large-6\"><label>Latitud <input type=text ng-value=model.latitud readonly></label></div><div class=\"columns small-12 large-6\"><label>Longitud <input type=text ng-value=model.longitud readonly></label></div><div class=\"columns small-12 large-6\"><button type=button class=button ng-click=clickBtn()>Ver Punto en Mapa</button></div></div>");
  $templateCache.put("directives/polygonPicker/polygonPicker.template.html",
    "<div class=row><div class=\"columns small-12 large-6\"><button type=button class=button ng-click=clickBtn()>Ver en Mapa</button></div></div>");
  $templateCache.put("directives/polylinePicker/polylinePicker.template.html",
    "<div class=row><div class=\"columns small-12 large-6\"><button type=button class=button ng-click=clickBtn()>Ver en Mapa</button></div></div>");
}]);
