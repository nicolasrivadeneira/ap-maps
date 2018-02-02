angular.module('ap-maps').directive('apMapPoint', [
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
