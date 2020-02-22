'use strict';

/**
 * Resource Service for all API Calls
 * Migrated from personal project
 * James Mendham
 * IP is not property of Direct Tap
 * Created: 2014-06-27
 * Migrated: 2015-09-29
 */

angular.module('clientApp.apiServices', [])
.service('restAPI', function($rootScope, $http, $window, $location, $resource) {
    
    var // appRoot = $rootScope.env.host, 
        token = $window.sessionStorage.token;
    
    $http.defaults.headers.common['X-Auth-Token'] = token;

    return {
        
        // USER LOGIN
        userLogin: $resource('auth/login', { 
            user: '@user', 
            pwd: '@pwd' 
        },{
            isArray: true,
            withCredentials: false
        }),
        
        /*****************************************************************/
        // GET REQUEST
        getModules: $resource('api/:module/:table', { 
            module: '@module',
            table: '@table',
            params: '@params'
        },{
            method: 'GET',
            withCredentials: true,
            isArray: true
        }),
        
        /****************************************************************/
        getSchema: $resource('api/schema', {
            module: '@module',
            table: '@table',
            params: '@params'
        },{
            method: 'GET',
            withCredentials: true,
            isArray: true
        }),
        
        getResource: $resource('/api/resource', {
            module: '@module',
            table: '@table',
            params: '@params'
        },{
            method: 'GET', 
            withCredentials: true,
            isArray: false
        }),
        
        /****************************************************************/
        postTransaction: $resource('/api/:module/:method', {
            module: '@module',
            method: '@method',
            params: '@params'
        },{
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            contentType: "application/json",
            withCredentials: true,
            isArray: false
        }),
        
    };

});