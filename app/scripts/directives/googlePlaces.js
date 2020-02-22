'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * XHR GOOGLE PLACES DIRECTIVE
 */

angular.module('clientApp')
.directive('googlePlaces', ['$rootScope','$window', function( $rootScope, $window ){
	
	return {

    	require: 'ngModel',
    	scope: {
      		ngModel: '=',
      		details: '=?'
    	},
    	link: function(scope, element, attrs, model) {
			
			var google = $window.google, 
				options = {
					types: [],
					componentRestrictions: {
						country: 'ca'
					}
				};
		
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
				
        		scope.$apply(function() {
					
					scope.details = scope.gPlace.getPlace();
					model.$setViewValue(element.val());
					$rootScope.$broadcast('place_changed', scope.details);
					
				});
			});
			
    	}
		
	};
	
	
}]);