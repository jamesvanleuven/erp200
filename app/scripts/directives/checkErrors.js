'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * input form validation
 */

angular.module('clientApp')
.directive('checkErrors', function () {
    
    return {
        restrict: 'A',
        require:  '^form',
        link: function (scope, el, attrs, formCtrl) {
            // find the text box element, which has the 'name' attribute
            var inputEl   = el[0].querySelector("[name]");
            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);
            // get the name on the text box so we know the property to check
            // on the form controller
            var inputName = inputNgEl.attr('name');
            
            inputNgEl.bind('blur', function() {
              el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });

            scope.$watch('showErrorsCheckValidity', function() {
                
                el.toggleClass('has-error', formCtrl[inputName]);
                return scope.showErrorsCheckValidity;
            });

        }
    };

});