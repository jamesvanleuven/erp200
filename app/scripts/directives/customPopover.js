'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * popover directive
 * uses angularStrap
 */

angular.module('clientApp')
.directive("customPopover", ["$popover", function($popover) {
    return {
        restrict: "A",
        link: function($scope, element, attrs) {
            
            // console.log( 'customPopover.scope', $scope );
            // console.log( 'customPopover.element', element );
            // console.log( 'customPopover.attrs', attrs );
            
            
            var myPopover = $popover(element, {
                animation: attrs.animation,
                id: attrs.id,
                title: attrs.title,
                contentTemplate: attrs.contentTemplate,
                html: true,
                trigger: 'manual',
                container: '.modal',
                placement: attrs.placement,
                autoClose: true,
                scope: $scope
            });
            
            $scope.showPopover = function(idx, $rootScope) {
                
                console.log( 'SCOPE', $rootScope );
                
                idx <= 0 ? 
                    $rootScope.addNewNote = true : 
                    $rootScope.addNewNote = false;
                myPopover.show();
            };
            
            $scope.hidePopover = function($rootScope){
                $rootScope.addNewNote = false;
                myPopover.hide();
            };
        }
    };
}]);