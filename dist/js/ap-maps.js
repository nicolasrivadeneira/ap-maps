angular.module('ap-maps', [
    'adminPanel'
]);
;angular.module('ap-maps').directive('apMap', [
    'MapsConfig','$timeout',
    function(MapsConfig,$timeout) {
        return {
            restrict: 'AE',
            link: function(scope, elem, attr) {
                scope.height = MapsConfig.defaultMapHeight;
                
                $timeout(function() {
                    var elemMap = elem.find('.map');
                    
                    var map = L.map(elemMap[0], {
                        center: MapsConfig.defaultCenter,
                        zoom: MapsConfig.defaultZoom
                    }, 1000);
                    
                    L.tileLayer.provider(MapsConfig.defaultTileProvider).addTo(map);
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
});;angular.module('adminPanel').run(['$templateCache', function ($templateCache) {
  $templateCache.put("directives/mapa/map.template.html",
    "<div class=map ng-style=\"{'height':height}\"></div>");
}]);
