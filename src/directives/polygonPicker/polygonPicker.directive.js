angular.module('ap-maps').directive('polygonPicker', [
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
