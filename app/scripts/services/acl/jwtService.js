'use strict'; 

/**
 * Decode JWT
 * Migrated from personal project
 * James Van Leuven
 * Created: 2013-11-22
 * Migrated: 2015-09-29
 *
 * to Decode Jason Web Tokens (JWT)
 * ref: https://github.com/davidchambers/Base64.js
 *
 * Module@base64 Factory Service
 */

angular
    .module('clientApp.base64Services', [])
    .factory('base64', function ($window, $location, $q, utils) {

    return {
        //Encodes base64 input string
        encode: function (input) {
            var output = utils.stringEncode( input );
            return output;
        },

        //Decodes JWT
        decode: function (encodedJWT) {
            var output = encodedJWT.replace('-', '+').replace('_', '/');
            //// console.log('output', output);
              switch (output.length % 4) {
                case 0:
                      break;
                case 2:
                      output += '==';
                      break;
                case 3:
                      output += '=';
                      break;
                default:
                      throw 'Illegal base64url string!';
              }
              return window.atob(output);
        },

        //Get user from JWT
        getJwtProfile: function () {
            var deferred = $q.defer(),
                encodedProfile,
                decodedProfile;
            if($window.sessionStorage.token) {

                encodedProfile = $window.sessionStorage.token.split('.')[1]; //From JWT
                decodedProfile = JSON.parse( this.decode(encodedProfile) );

                deferred.resolve(decodedProfile);
            }else{
                deferred.reject('OOPS No JWT Token exists in sessionStorage!!! ');//TEST
            }
               return deferred.promise; //returns the promise
        },

        deleteJwtFromSessionStorage : function() {
            var i = sessionStorage.length;
            while(i--) {
                var key = sessionStorage.key(i);
                sessionStorage.removeItem(key);
            }

            $window.location.href = $window.location.origin;
        },

        saveJwtToSessionStorage : function(token) {
            // save to sessionStorage
            $window.sessionStorage.token = token;
            $window.sessionStorage.idx = 0;
        }
    };
});
