'use strict';

/**
 * Resource Service for all API Calls
 * Migrated from personal project
 * James Mendham
 * IP is not property of Direct Tap
 * Created: 2014-06-27
 * Migrated: 2015-09-29
 */

angular.module('clientApp.selectServices', []).service('selectService', function($q, $rootScope) {
    
    return {
        
        selectOptions: function( $scope, response ){
            var self = this, deferred = $q.defer();

            console.log( '|---------------------------------------|' );
            console.log( 'selectService.selectOptions.scope', $scope );
            console.log( 'selectService.selectOptions.response', response );

        }
        
    };
    
});