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

angular.module('clientApp.errorServices', []).service('errorService', function ($rootScope, $q, $window, $location, $route, utils, errors, viewService) {

    return {

		
        contentError: function ($route, $scope, errors) {
            var self = this, deferred = $q.defer(),
                code = errors.definition || 'module';

            var error = {
                'module': function() { return self.errorContent($scope); },
                // 'admin': function() { return self.errorAdmin($scope); },
                // 'user': function() { return self.errorUser($scope); },
                // 'unknown': function() { return self.errorUnknown($scope); }
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
		
		redirectValidation: function( row, key, method ){
			var self = this,
				deferred = $q.defer();
			
			switch(row.input){
				case 'json': return errors.isJSON(row, key); break;
				case 'select': return errors.isSELECT(row, key); break;
				case 'cs': return errors.isCS(row, key); break;
				case 'number': return errors.isNUMBER(row, key); break;
				case 'text': return errors.isTEXT(row, key); break;
			}
			
		},

        // VALIDATION
        validation: function( object ) {

          var self = this,
              deferred = $q.defer(),
			  method = object.method,
			  module = object.module,
			  params = object.params,
              errorObjects = [];
			
			console.log( 'TYPE >> ', utils.toType(object.params) );
			
			// LOOP THROUGH THE SUBMIT PARAMS
			angular.forEach(params, function( row, key ){
				// PERMISSION TEST
				if( utils.toType(row) === 'object' && utils.toType(row.permissions) !== 'undefined' ){
					
					console.log( 'ROW TO TEST >> ', key, row );
					
					switch(method){
							
						case 'add': 
							
							row.permissions._post === true || row.required === true ? 
								utils.toType(self.redirectValidation(row, key)) !== 'undefined' ?
									errorObjects.push(self.redirectValidation(row, key, method)) : null : 
								null; break;
							
						case 'edit': 
							
							row.permissions._patch === true ? 
								utils.toType(self.redirectValidation(row, key)) !== 'undefined' ?
									errorObjects.push(self.redirectValidation(row, key)) : null :
								null; break;
							
						case 'import': 
							
							row.permissions._put === true ?
								utils.toType(self.redirectValidation(row, key)) !== 'undefined' ?
									errorObjects.push(self.redirectValidation(row, key)) : null : 
								null; break;
							
					}
				}

			});
			
			errorObjects.length > 0 ? 
				deferred.reject(errorObjects) : 
				deferred.resolve();
			
			return deferred.promise;
        },
		
		// ALERT ERROR MESSAGE
		errorMsg: function(obj){
			
			var msg = '';
			angular.forEach(obj, function(row, key){
				
				angular.element('#' + key ).addClass('error');
				
				if( utils.toType(row) === 'null' ){ msg += key + ' is a required field\n'; }
				if( utils.toType(row) === 'boolean' ){ msg += key + ' is empty or invalid\n'; }
				if( utils.toType(row) === 'object' ){
					angular.forEach(row, function(item, idx){
						
						angular.element('#' + idx ).addClass('error');
						
						if( utils.toType(item) === 'null' ){ msg += idx + ' is a required\n'; }
						if( utils.toType(item) === 'boolean' ){ msg += idx + ' is empty or invalid\n'; }
					});
				}
			});

			return msg;
		}

    };

});