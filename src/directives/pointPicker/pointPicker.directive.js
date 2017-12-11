angular.module('ap-maps').directive('pointPicker', [
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
