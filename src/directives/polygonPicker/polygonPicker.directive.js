angular.module('ap-maps').directive('polygonPicker', [
    '$rootScope',
    function($rootScope) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr, ngModel) {
                var polygon = null;
                
                var destroyEventMapPicker = scope.$on('ap-map:polygonpicker',function(event, name, polygon) {
                    if(scope.name !== name) return;
                    
                    ngModel.$setViewValue(polygon);
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
