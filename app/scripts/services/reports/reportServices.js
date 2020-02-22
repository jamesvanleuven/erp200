'use strict'; 
/**
 * AUTHOR: James Van Leuven <james.mendham@directtap.com>
 * DATE: 2017-09-24
 * PSEUDO-CODE: reportServices.txt
 */

angular.module('clientApp.reportServices', []).service('reportService', [
    '$q',
    '$rootScope',
	'$window',
	'moment',
	'utils',
	'reports', 
	function ($q, $rootScope, $window, moment, utils, reports){
		
		return {
			
			config: function( $scope ){
				var self = this,
                    deferred = $q.defer();
                
                var reportObject = reports.filterSummary( $scope ), 
                    filterArray = [];
                
                angular.forEach(reportObject, function( row, key ){
                    filterArray.push(row);
                });
                
                console.log( '|-------------------------------------------------|' );
                console.log( 'REPORT.SERVICE.CONFIG.FILTER-ARRAY >> ', filterArray );
                
                $scope.filter = filterArray;
                
                deferred.resolve(filterArray);
                return deferred.promise;
			},
			
		}
		
	}]);