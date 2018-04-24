angular.module('ap-maps').directive('pointPicker', [
    '$rootScope','$timeout',
    function($rootScope,$timeout) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@',
                ocultarBoton: '<'
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
