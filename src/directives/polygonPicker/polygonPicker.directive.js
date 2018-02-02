angular.module('ap-maps').directive('polygonPicker', [
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
