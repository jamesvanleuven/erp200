'use strict';
/**
 * reports factory added to $scope
 * added on 2017-09-24 - James Van Leuven <james.mendham@directtap.com>
 * PSEUDO-CODE: pseudo_code/reportsFactory.txt
 */
angular.module('clientApp').factory('reports', function(){

    return { 
        
        // SCHEMA FOR REPORT SUMMARY FILTER SEARCHING
        filterSummary: function( $scope ){
            
            var thisFilter = $scope.$parent.currentModule.report;
            
            console.log( '|----------------------------------|' );
            console.log( 'REPORTS.THIS-FILTER >> ', thisFilter );
            
            /*
            var obj = { 
                manufacturer: { 
                    field: 'manufacturer_id', 
                    alias: 'manufacturer',
                    type: 'array', 
                    value: manufacturer
                },
                location: {
                    field: 'location_id',
                    alias: 'location',
                    type: 'array',
                    value: location
                },
                range: {
                    field: 'created',
                    alias: 'range',
                    type: 'timestamp without time zone',
                    value: range
                }

            };
            
            return obj;
            */
        },
        
    };

});