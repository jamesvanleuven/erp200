'use strict';

/**
 * @ngdoc service
 * @name clientApp.moduleServices
 * @description
 * # moduleServices
 * Service in the clientApp.
 */

/* ================================================
    Service to Manage Modules
================================================ */

angular.module('clientApp.contentServices', []).service('contentService', [
    '$rootScope', 
    '$q', 
    '$timeout', 
    '$window', 
    '$location',
    '$route', 
    '$compile', 
    'utils', 
    'moment',
    'elements',
    'errorService', 
    'moduleService',
    'viewService',
    'reportService',
	'channels',
function($rootScope, $q, $timeout, $window, $location, $route, $compile, utils, moment, elements, errorService, moduleService, viewService, reportService, channels) {

    return {
        
        // RELOAD MODULE ON PAGINATION CHANGES
        newPagingOptions: function( $scope ){
            
            console.log( '|-------------------------------------|' );
            console.log( 'SCOPE >> ', $scope ); 
            
            var self = this,
                pagingOptions = $scope.$parent.currentModule.paging,
                upper = pagingOptions.limit*pagingOptions.page,
                lower = parseInt(upper - pagingOptions.limit );
            
            pagingOptions.range.lower = lower;
            pagingOptions.range.upper = upper;
            pagingOptions.range.total = pagingOptions.totalRecords;
            pagingOptions.offset = lower;
            
            $scope.$parent.currentModule.paging = pagingOptions;
            $window.sessionStorage.paging = JSON.stringify( $scope.currentModule.paging );

            self.loadModule( $route, $scope );
        },
        // CALL API
        loadAPI: function($route, $scope){
            
            var self = this, 
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toLowerCase(),
				moduleType = parseInt(thisModule.type),
                routeParams = $route.current.params,
                establishment = parseInt($window.sessionStorage.establishment),
                assets = $rootScope.assets[moduleName];
            
            moduleService.activeModule($route, $scope)
			.then(function(success){
				
				console.log( '|-------------------------------------------|' );
				console.log( 'CONTENT-SERVICES.LOAD-API.SUCCESS >> ', success );
                
                // moduleService.setDateRange( $route, $scope, success );

                if( success.name === 'error'){
                    
                    var paging = JSON.parse($window.sessionStorage.paging);
                    success.definition = 'module';
                    // LOAD SCOPE
                    $scope[moduleName] = success.items;
                    $scope.currentModule.paging.totalRecords = paging.totalRecords;
                    $rootScope.assets[moduleName] = [];

                    // LOAD SESSION STORAGE
                    $window.sessionStorage.assets = null;
                    $window.sessionStorage.paging = JSON.stringify( $scope.currentModule.paging );
                    
                    self.loadError( $route, $scope, success );
                    
                }
                else{
                    
                    // NO ITEMS EXIST SUBMIT ERROR
                    if( !success.items ){
                        $scope.currentModule.paging.totalRecords = 0;
                        success.definition = 'module';
                        if( $scope.currentModule.name === 'Dashboard' ){
                            
                            var str = success.header + success.body + success.footer;
                            elements.insertHTML(str, $scope);
                            
                            $timeout(function(){
                                var strHTML = angular.element('div#graphing').html();
                                //// console.log( 'strHTML', strHTML );
                                typeof(strHTML) === 'undefined' ? $window.location.reload() : null;
                            }, 500);
                        }else{
                            self.loadError( $route, $scope, success );
                        }
                    }else{
                        
                        console.log( '|-------------------------------|' );
                        console.log( 'SUCCESS >> ', success );
                        
                        $scope.currentModule.paging.totalRecords = success.totalRecords.count;
                        $window.sessionStorage.totalRecords = success.totalRecords.count;
                        $scope[moduleName] = success.items;
                        $rootScope.assets[moduleName] = success.assets[moduleName];
                        $window.sessionStorage.paging = JSON.stringify( $scope.currentModule.paging );
                        self.loadContent( $route, $scope );

                    }
                }

            }, function(error){
                console.log( 'error ' + thisModule.name + ': ', error );
                // LOAD 404 PAGE PARTIAL
            });
        },
        //  LOAD MODULE OBJECT
        loadModule: function( $route, $scope ){
            
            var self = this,
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                thisEstablishment = parseInt($window.sessionStorage.establishment),
                thisRoute = Object.keys($route.current.params).length;
            
            thisRoute === 1 ? 
                self.loadAPI($route, $scope) : 
                self.loadError( $route, $scope, routeParams );

        },
		
        //  INSERT CONTENT HTML
        loadContent: function( $route, $scope ){
            var str = '', 
                thisModule = $scope.currentModule,
                credentials = JSON.parse($window.sessionStorage.credentials),
                role = parseInt(credentials.group_id), 
                moduleName = angular.lowercase($scope.currentModule.name),
                moduleType = parseInt($scope.currentModule.type),
                manufacturer = parseInt($window.sessionStorage.establishment),
                manufacturers = $rootScope.profile.manufacturers,
                adminBtn = '<div data-ng-include="\'views/modules/_partials/_viewbuttons_admin.html\'"/>', 
                usrBtn = '<div data-ng-include="\'views/modules/_partials/_buttons/_viewbuttons.html\'"/>';
                
            viewService.viewBuild($route, $scope).then(function(success){

                role === 1 && moduleName === 'products' ? 
                    success.content.length > 0 ? 
                        str += adminBtn + success.content : str += usrBtn : 
                    str += usrBtn + success.content;
                // confirm socket connection
                channels.connection( $route, $scope );
                // compile and load html results
                elements.insertHTML(str, $scope);
            }, function(error){
                console.log('viewServices.viewBuild Error', error);
            });
        }, 
        
        loadError: function( $route, $scope, error ){
            errorService.contentError( $route, $scope, error ).then(function(success){
                $scope.currentModule.paging.totalRecords = 0;
                var str = success.content;
                elements.insertHTML(str.replace('NaN',''), $scope);
            }, function(error){
                console.log('viewServices.viewBuild Error', error);
            });
        }
    };

}]);
// @EoF