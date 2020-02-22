'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * popover directive
 * USAGE:
 *
 *  <div data-ng-app="Popover">
 *      <div>
 *          <span custom-popover popover-html="{{model[0]note.title}}" popover-placement="bottom" popover-label="Label"></span>
 *      </div>
 *  </div>
 */

angular.module('clientApp')
.directive('hintOver', function () {
    return {
        restrict: 'A',
        template: '<i class="fa fa-{{label}}"></i>',
        link: function (scope, el, attrs) {
            // console.log( 'popover attrs', attrs );
            scope.label = attrs.popoverLabel;
            angular.element(el).popover({
                trigger: 'mouseover',
                html: true,
                content: attrs.popoverHtml,
                placement: attrs.popoverPlacement
            });
        }
    };
});