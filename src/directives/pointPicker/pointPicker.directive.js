angular.module('ap-maps').directive('pointPicker', [
    '$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                name: '@',
                ocultarBoton: '<'
            },
            link: function (scope, elem, attr, ngModel) {
                var self = this;
                scope.model = {
                    latitud: null,
                    longitud: null
                };
                self.point = null;

                var destroyEventPointPicker = scope.$on('ap-map:pointpicker', function (event, name, point) {
                    if (scope.name !== name)
                        return;

                    ngModel.$setViewValue(point);
                });

                scope.clickBtn = function () {
                    if (attr.view) {
                        $rootScope.$broadcast('apBox:show', attr.view);
                        $timeout(function () {
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
                        console.log(val);
                        self.point = val;
                        scope.model.latitud = val.y;
                        scope.model.longitud = val.x;
                    }
                });

                scope.cambioCoordeandas = function () {
                    var latitud = false, longitud = false;
                    scope.error = false;

                    //validacion
                    var latRegex = /^(([-])(\d)+((\.)(\d{2})(\d+)))$/;
                    var lngRegex = /^(([-])(\d)+((\.)(\d{2})(\d+)))$/;
                    var splits = [',', ':', ' ', '.'];

                    for (var i = 0; i < splits.length; i++) {
                        var arr = scope.coordenadas.replace(/\s+/g, '').split(splits[i]);
                        if (arr.length === 2) {
                            latitud = parseFloat(arr[0].replace(',', '.').match(latRegex));
                            longitud = parseFloat(arr[1].replace(',', '.').match(lngRegex));
                        } else if (arr.length === 4) {
                            latitud = parseFloat((arr[0] + '.' + arr[1]).match(latRegex));
                            longitud = parseFloat((arr[2] + '.' + arr[3]).match(lngRegex));
                        }
                    }
                    if (!latitud || !longitud //||
//                        latitud < -31.99 || latitud > -31 ||
//                        longitud < -61.99 || longitud > -60.3
                            ) {
                        scope.model.latitud = '';
                        scope.model.longitud = '';
                        scope.error = true;
                        return;
                    }
                    scope.model.latitud = latitud;
                    scope.model.longitud = longitud;
                    ngModel.$setViewValue({
                        latitud: latitud,
                        longitud: longitud
                    });
                    self.point = {
                        x: longitud,
                        y: latitud
                    };
                    ngModel.$setViewValue(self.point);

                    scope.$emit('msfCoordenadas:change', this);
                };

                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function () {
                    destroyEventPointPicker();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/pointPicker/pointPicker.template.html'
        };
    }
]);
