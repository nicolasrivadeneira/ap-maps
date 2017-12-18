angular.module('ap-maps').directive('polylinePicker', [
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
