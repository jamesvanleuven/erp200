'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * STRING TO NUMBER DIRECTIVE
 */

angular.module('clientApp')
.directive('numberConverter', function(){
    return {
        priority: 1,
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
            
            function getType(input) {
                var m = (/[\d]+(\.[\d]+)?/).exec(input);
                if (m) {
                   // Check if there is a decimal place
                   if (m[1]) { return 'float'; }
                   else { return 'int'; }          
                }
                return 'string';
            }

            function toModel(value) {
                switch(getType(value)){
                    case 'int': return Number(parseInt(value));
                    case 'float': return Number(parseFloat(value).toFixed(2));
                    case 'string': return '' + value;
                }
            }

            function toView(value) {
                switch(getType(value)){
                    case 'int': 
                        // // console.log( 'toView: ', getType(value), Number(parseInt(value)) );
                        return Number(parseInt(value));
                    case 'float': 
                        // // console.log( 'toView: ', getType(value), Number(parseFloat(value).toFixed(2)) );
                        return Number(parseFloat(value).toFixed(2));
                    case 'string': return parseInt(value);
                }
            }

            ngModel.$formatters.push(toView);
            ngModel.$parsers.push(toModel);

        }
    };
});