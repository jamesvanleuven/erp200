'use strict';

/**
 * User Login Services
 * Migrated from personal project
 * James Mendham
 * IP is not property of Direct Tap
 * Created: 2013-11-22
 * Migrated: 2015-09-29
 *
 * to manage a users login, password recovery, and 
 * new user registration
 */

angular.module('clientApp.userServices', []).service('userService', [
    '$http',
    '$q',
    '$window',
    '$location',
    '$cookies',
    'restAPI',
    'base64',
    '$rootScope',
    'AuthenticationService',
    'utils',
function($http, $q, $window, $location, $cookies, restAPI, base64, $rootScope, AuthenticationService, utils) {

    return {

        /**
         * @LoggedOnAlreadyMsg
         * User is already logged in
         */
        loggedOnAlreadyMsg : function() {
            //Request
            base64.getJwtProfile()
              //Response Handler
              .then(function() {
                $location.url('/#!/dashboard');
                return this;
              });
        },

        /**
         * @loginUser
         * Existing user login
         */
        loginUser : function(user){

            var deferred = $q.defer();

            restAPI.userLogin.query(user, function(res){
                
                console.log('login response', res);
                
                var results = res[0].result;
                
                console.log( '|----------------------------------------|' );
                console.log( 'USER-SERVICE.RESTAPI-USER-LOGIN.RESPONSE >> ', res );
                console.log( '|----------------------------------------|' );
                console.log( 'RESULTS >> ', results );

                // FAILED RESPONSE
                if(results.status === 401){ utils.growlMessage('warning', results.msg, 1); }
                if(results.status === 500){ utils.growlMessage('error', results.msg, 1); }
                
                // SUCCESS RESPONSE
                if(results.status === 200){
                    
                    base64.saveJwtToSessionStorage(res[0]['x-token']);
                    var acl = results.payload;
					
					// LOAD LOCATIONS BASED UPON PERMISSION ORDER RESPONSE
					var orderLocations = [],
						currPermissions = acl.permissions;
					
					for( var i = 0; i < currPermissions.length; i++ ){
						
						var location = {
							id: currPermissions[i].location.location_id,
							value: currPermissions[i].location.location,
							delivery_days: currPermissions[i].location.delivery_days,
							establishment_id: currPermissions[i].location.establishment_id,
							hwh: false
						}
						
						orderLocations.push(location);
					}

                    // LOAD THE ROOTSCOPE
                    $rootScope.credentials = acl.credentials;
                    $rootScope.permissions = acl.permissions;
                    // $rootScope.profile = acl.profile;
                    $rootScope.system = acl.system;
                    $rootScope.locations = orderLocations;
                    $rootScope.assets = [];
					
					acl.profile.locations = orderLocations;
                    
                    // LOAD THE SESSIONSTORAGE                  
                    $window.sessionStorage.system = JSON.stringify($rootScope.system);
                    $window.sessionStorage.credentials = JSON.stringify($rootScope.credentials);
                    $window.sessionStorage.permissions = JSON.stringify($rootScope.permissions);
                    $window.sessionStorage.pagingOptions = JSON.stringify({});
                    $window.sessionStorage.filterOptions = JSON.stringify([]);
                    
                    var miniACL = {}, miniProfile = {};
                    angular.copy( acl, miniACL );
                    angular.copy( acl.profile, miniProfile );
                    
                    $window.sessionStorage.locations = JSON.stringify(miniProfile.locations);
                    
                    delete miniACL.profile.customers; 
                    delete miniProfile.customers;
                    miniACL.profile.manufacturers;
                    miniProfile.manufacturers;
                    
                    console.log( '|----------------------------------------|' );
                    console.log( 'COPIED ACL >> ', miniACL );
                    console.log( '|----------------------------------------|' );
                    console.log( 'COPIED PROFILE >> ', miniProfile );
                    
                    $window.sessionStorage.profile = JSON.stringify(miniProfile);
                    $window.sessionStorage.establishment = parseInt(miniProfile.establishment); 
                    $rootScope.profile = miniProfile;
                    
                    $window.sessionStorage.acl = base64.encode(JSON.stringify(miniACL));

                    deferred.resolve(res);
                }

            });

            return deferred.promise;

        },
		
        /**
         * @logoutUser
         * Clear cookies, localStorage, sessionStorage
         * for existing user
         * redirect back to login page
         */
        logoutUser : function() {
          var deferred = $q.defer();
            deferred.resolve('Successfully logged out!');
        
            AuthenticationService.isLogged = false;

            $rootScope.permissions.destroy();
            $rootScope.credentials.destroy();
            $rootScope.profile.destroy();
            $rootScope.locations.destroy();
            $rootScope.modules.destroy();
            $rootScope.env.destroy();
            $window.sessionStorage.destroy();
            $cookies.remove('x-token'); delete $cookies['x-token'];

            $window.location.href = $window.location.origin;

            return deferred.promise;
        }
    };  //@END return()
}]); //@ EOF
