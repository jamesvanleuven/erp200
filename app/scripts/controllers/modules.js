'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ModulesController
 * @description
 * # ModulesController
 * Controller of the clientApp
 */

angular.module('clientApp').controller('ModulesController', [
    '$rootScope',
    '$scope',
    '$q',
    '$compile',
    '$window',
    '$timeout',
    '$route',
    '$http',
    '$location',
    'base64',
    'utils',
    'moment',
    'moduleService',
    'contentService',
    'elements',
    'channels', 
  function ($rootScope, $scope, $q, $compile, $window, $timeout, $route, $http, $location, base64, utils, moment, moduleService, contentService, elements, channels) {
    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
    ];
	  

    $scope.logout = function () {
        base64.deleteJwtFromSessionStorage();
    };

    if ($rootScope.auth.isLogged === false || !$rootScope.auth.isLogged) {
        base64.deleteJwtFromSessionStorage();
    } else {
			// SET DEFAULTS
		$scope.currentModule = {};
		$scope.selectedManufacturer = {};
		$scope.selectedCustomer = {};
		$scope.newRow = {};
		$scope.newTransaction = {};
		$scope.newResource = {};
		$scope.filterItems = {};

		$scope.csv = {
			content: null,
			header: true,
			headerVisible: true,
			separator: ',',
			separatorVisible: false,
			result: null,
			encoding: 'ISO-8859-1',
			encodingVisible: false,
			uploadButtonLabel: "upload a csv file"
		};

        // RESET DEFAULTS ON LOCATION CHANGE
        $scope.$on('$locationChangeStart', function () {

            var thisModule = $scope.currentModule, 
                credentials = JSON.parse($window.sessionStorage.credentials);
            
            if( parseInt(credentials.group_id) === 1 ){
                $rootScope.profile.establishment = 0;
                $rootScope.credentials = credentials;
                $window.sessionStorage.establishment = 0;
            }

            delete $window.sessionStorage.filters;
            $scope.filter = {};

            $rootScope.components = 'table'; // THIS HOOK EXISTS FOR FUTURE UD-CUSTOMIZATION SETTINGS
            
            $window.sessionStorage.paging = JSON.stringify(moduleService.modulePagingOptions(thisModule));
            $scope.currentModule.paging = JSON.parse($window.sessionStorage.paging);
        });

        $scope.isActive = function (path) {
            return ($location.path().indexOf(path) > -1);
        };
		
		$scope.bolSwitch = [ { id: 0, value: false }, {id: 1, value: true } ];
        
        /*************************************
         * @_location select list
         */
        $scope.changeLocation = function () { 
			
			var action = $route.reload();

            delete $window.sessionStorage.location;
            moduleService.switchLocation($scope).then(function(success){

                // TEST ESTABLISHMENT AGAINST THE CREDENTIALS
                if( $window.sessionStorage.credentials ){
                    var credentials = JSON.parse( $window.sessionStorage.credentials);
                    
                    // IF NOT MANUFACTURER GROUP **HACK**
                    if( parseInt(credentials.group_id) !== 2 ){
                        $window.sessionStorage.establishment = 0;
                        $rootScope.profile.establishment = 0;
						action = $route.reload();
                    }
					// RELOAD THE WINDOW FOR MANUFACTURER LOGINS
					else{
						action = $window.location.reload();
					}
                }

                success === true ? action : null;
            });

        };
        
        $scope.buttonOptions = function( $event ){

            var targetID = $event.currentTarget.dataset.id,
                element = angular.element('ul#' + targetID + '.dropdown-menu');
            
            element.is(':visible') ? element.hide() : element.show();
            
        };
        
       // LOAD THE PAGE CONTENT
        $scope.loadThisModule = function( $route, $scope ){
            
            angular.element( $window.document.querySelector('#insertModule') ).empty();

            if( Object.keys($route.current.params).length === 1 ){
                contentService.loadModule($route, $scope); // LOAD MODULE CONTENT
                channels.connection( $route, $scope ); // ENABLE SOCKETS
            }
        };
        
        $scope.moduleOptions = [{
            id: 0,
            value: 'All Records'
        },{
            id: 1,
            value: 'Table Records'
        }];


        moduleService.loadModule($route, $scope).then(function (result) {
            
            // CREATE CURRENT MODULE SCOPE
            $scope.currentModule = result;
            $window.sessionStorage.location = JSON.stringify($scope.currentModule.location);
            
            angular.forEach($rootScope.modules, function (item) {
                item.module_id === result.id ? result.type = item.type : null;
            });

            // HTML WRAPPER
			var container = '<div data-ng-controller="contentController">';
            container += '<div id="moduleContainer" class="col-md-12"></div></div>';

            elements.insertHTML(container, $scope);

        });
    }

  }]);