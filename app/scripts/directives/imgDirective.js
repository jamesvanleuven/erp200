'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * IMG TAG 404 DIRECTIVE
 */
angular.module('clientApp')
.directive('img', function () {
    return {
        restrict: 'E',        
        link: function (scope, element, attrs) {
            
            // console.log( scope, element, attrs );

            function replaceImg() {
                var w = element.width();
                var h = element.height();
                if (w <= 20) { w = 100; }
                if (h <= 20) { h = 100; }
                var url = 'https://placehold.it/' + w + 'x' + h + '/cccccc/ffffff&text=LOGO';
                element.prop('src', url);
            }
            
            if((('ngSrc' in attrs) && typeof(attrs.ngSrc)==='undefined') || (('src' in attrs) && typeof(attrs.src)==='undefined')) {
                (function () {
                    replaceImg();
                })();
            }
        }
    };
});