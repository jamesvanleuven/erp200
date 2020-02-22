'use strict';

/**
 * @ngdoc service
 * @name clientApp.userAdminService.js
 * @description
 * # userAdminService.js
 * Service in the clientApp.
 */
angular.module('clientApp.userAdminServices', [])
.service('userAdmin', function($http, $q, $window, $location, base64, $rootScope, restAPI) {

    return {

        /**
         * render adminUserList
         */
        userList: function(view, url){
            // console.log('view', view);
            // console.log('url', url);
        },

        /**
         * retrieve the list of users
         */
        allUsers: function(locationId){
            var deferred = $q.defer();

            if(locationId){
                restAPI.users.get({id: locationId}, function(data){

                    if(data.status === 200){
                        deferred.resolve(data.response);
                        $rootScope.adminUsers = data.response;

                        // console.log($rootScope.adminUsers);
                    }
                    else{
                        deferred.reject( data.message );
                    }

                });

                return deferred.promise;
            }
            else{
                // user probably bookmarked this
                // so boot them home to instantiate scope
                $location.url('/');
            }
        }

    };

});
