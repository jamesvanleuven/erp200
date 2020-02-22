'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * DEFAULT KEY HANDLER DIRECTIVE
 * prevent enter and tab keys
 */

angular.module('clientApp')
.directive('nextOnEnter', function () {
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
            
            console.log( '|---------------------------------|' );
            console.log( 'NEXT-ON-ENTER.scope >> ', $scope );
            console.log( 'NEXT-ON-ENTER.elem >> ', elem );
            console.log( 'NEXT-ON-ENTER.attrs >> ', attrs );
            
            
            elem.bind('keydown', function (e) {
                var code = e.keyCode || e.which;
                if (code === 13 || code === 9) {
                    e.preventDefault();
                    var pageElems = document.querySelectorAll('input, select, textarea'),
                        // elem = e.srcElement,
                        focusNext = false,
                        len = pageElems.length;
                    for (var i = 0; i < len; i++) {
                        var pe = pageElems[i];
                        if (focusNext) {
                            if (pe.style.display !== 'none') {
                                pe.focus();
                                break;
                            }
                        } else if (pe === e.srcElement) {
                            focusNext = true;
                        }
                    }
                }
            });
        }
    };
});