'use strict';

/**
 * @ngdoc service
 * @name clientApp.errorServices
 * @description
 * # errorService
 * Service in the clientApp.
 */

/* ================================================
    Service to Manage Modules
================================================ */

angular.module('clientApp.errorServices', []).service('errorService', function ($rootScope, $q, $window, $location, $route, utils, errors, requiredFields, viewService) {

    function validateParams(module, params, errorMessages) {
        angular.forEach(requiredFields[module], function( field, key ){

            var currentField = params[field];

            if ( !currentField ) return;

            // DEFINE THE INPUT TYPE
            if( utils.toType(currentField.input) === 'undefined' ){
                if( currentField.hasOwnProperty('value') || currentField.hasOwnProperty('startDate') ){
                    currentField.input = 'text';
                }
                if( currentField.hasOwnProperty('selected') ){
                    currentField.input = 'select' ;
                }
            }

            console.log( '|--------------------------------------|' );
            console.log( 'FIELD >> ', key, currentField );

            if ( !errors[currentField.input](currentField) ) {
              errorMessages.push(field + ' required ');
            }
        });

        return errorMessages;
    };

    return {

        contentError: function ($route, $scope, errors) {
            var self = this, deferred = $q.defer(),
                code = errors.definition || 'module';

            // // console.log('route', $route);
            // // console.log('scope', $scope);
            // // console.log('code', code);

            var error = {
                'module': function() { return self.errorContent($scope); },
                'admin': function() { return self.errorAdmin($scope); },
                'user': function() { return self.errorUser($scope); },
                'unknown': function() { return self.errorUnknown($scope); }
            };

            return error[code]();
        },

        errorContent: function ($scope) {
            var str = '', deferred = $q.defer(),
                moduleName = angular.lowercase($scope.currentModule.name),
                moduleType = parseInt($scope.currentModule.type),
                credentials = JSON.parse($window.sessionStorage.credentials),
                group = parseInt(credentials.group_id),
                role = parseInt(credentials.group_id),
                adminBtn = '<div data-ng-include="\'views/modules/_partials/_viewbuttons_admin.html\'"/>',
                usrBtn = '<div data-ng-include="\'views/modules/_partials/_buttons/_viewbuttons.html\'"/>';

            delete $window.sessionStorage.filters;

            moduleType >= 1 ? role === 1 && group === 1 ? moduleName === 'products' ?
                str += adminBtn : str += usrBtn : str += usrBtn : null;

            str += '<div class="row"><div class="' + moduleName + '-sidebar col-md-5" style="display:none;">';
            str += '</div><div class="' + moduleName + '-content col-md-12"><p>No ' + moduleName;
            str += ' available.</p></div></div>';

            $scope.currentModule.paging.totalRecords = 0;

            deferred.resolve({ content: str });
            return deferred.promise;
        },

        // VALIDATION
        validation: function(object) {
            console.log( '|--------------------------------------|' );
            console.log( 'ERROR-VALIDATION.OBJECT >> ', object );

          var self = this,
              deferred = $q.defer(),
              errorMessages = [];

            if (angular.isArray(object.params)) {
                angular.forEach(object.params, function(params){
                    errorMessages = validateParams(object.module, params, errorMessages);
                });
            } else {
                errorMessages = validateParams(object.module, object.params, errorMessages);
            }
                console.log('errorMessages length', errorMessages.length);
            if (errorMessages.length == 0) {
                deferred.resolve();
            } else {
                deferred.reject(errorMessages);
            }

            return deferred.promise;
        }

    };

});