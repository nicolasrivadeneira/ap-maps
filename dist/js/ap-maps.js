angular.module('ap-maps', [
    'adminPanel'
]);
;angular.module('ap-maps').directive('apMap', [
    'mapService',
    function(mapService) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            link: function(scope, elem, attr, ngModel) {
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
                    
                    //agregamos la posicion actual al modelo
                    ngModel.$setViewValue(latLng);
                }
                
                
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (val) {
                    if (val) {
                        console.log('val',val);
                        
                        setMarker(val.lat, val.lng);
                    }
                });
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(map !== null) {
                        map.off('click', onCLickMap);
                    }
                    
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapa/map.template.html'
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
  $templateCache.put("directives/mapa/map.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div>");
}]);
