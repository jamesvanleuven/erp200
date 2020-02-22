'use strict';

/**
 * @ngdoc service
 * @name clientApp.exportServices
 * @description
 * # exportService
 * Service in the clientApp
 */
angular.module('clientApp.exportServices', []).service('exportService', [ 
    '$q',
    '$rootScope',
    '$route',
    '$window',
    '$compile',
    'utils',
    'elements',
    'buttons',
    'modalService',
    'pdfService',
    'xlsService',
function ($q, $rootScope, $window, $route, $compile, utils, elements, buttons, modalService, pdfService, xlsService) {
    
    return {
        
        config: function( $scope, $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisModal = thisModule.modal,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type;
            
            console.log( '|-------------------------------------|' );
            console.log( 'EXPORT-SERVICE.THIS-MODULE >> ', thisModule );
            console.log( 'EXPORT-SERVICE.THIS-MODAL >> ', thisModal );
            console.log( 'EXPORT-SERVICE.MODULE-NAME >> ', moduleName );
            console.log( 'EXPORT-SERVICE.MODULE-TYPE >> ', moduleType );
        },

        exportOptions: function( $scope, $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisModal = thisModule.modal,
                moduleName = thisModule.name.toLowerCase(),
                moduleMethod = $event.currentTarget.dataset.type,
                moduleType = thisModule.type,
                parent = null, child = $scope.newTransaction = {};
            
            console.log( '|-------------------------------------|' );
            console.log( 'EXPORT-OPTIONS.SCOPE >> ', $scope );
            console.log( 'EXPORT-OPTIONS.EVENT >> ', $event );
            
            
            
            /*
            !$scope[moduleName][0] ? 
                parent = $rootScope.assets[moduleName].elements : 
                parent = $scope[moduleName][0];
            
            console.log( 'PARENT', parent );
            // COPY SCOPE TO AVOID BINDING COLLISIONS 
            $scope.newTransaction = angular.copy( parent, child );
            */
            var exports = {
                'template': function(){ return self.exportFile( $scope, $event ); },
                'csv': function(){ return xlsService.xlsOptions($scope ,$event); },
                'xls': function(){ return xlsService.xlsOptions( $scope, $event ); },
                'ldb': function(){ return xlsService.xlsOptions($scope , $event); },
                'export': function(){ return xlsService.xlsOptions($scope, $event); }
            };
            
            return exports[moduleMethod]();
        },
        
        // FETCH TABLE SCHEMA FOR EXPORT
        exportFile: function($scope){
            var self = this, 
                thisModule = $scope.currentModule,
                moduleName = angular.lowercase(thisModule.name), 
                moduletype = thisModule.type,
                establishment = $window.sessionStorage.establishment,
                manufacturer = $rootScope.profile.manufacturers[0].id,
                location = thisModule.location.location_id,
                filterOptions = thisModule.paging, deferred = $q.defer();
            
            // COPY ELEMENTS FROM ASSET[MODULENAME].ELEMENTS
            
            var data = {
                establishment: parseInt(establishment),
                manufacturers: [manufacturer], 
                locations: [location], 
                filters: filterOptions, 
                csv: $scope.newTransaction
            };
            
            $scope.export = data;

            console.log( '|----------------------------------------|' );
            console.log( 'EXPORT FILE FOR ' + moduleName, data );
            
            self.downloadCSV( $scope );
        },
        // CANVAS DRAWN TABLE TO EXPORT
        exportTable: function($scope){
            var self = this, thisModule = $scope.currentModule,
                moduleName = angular.lowercase(thisModule.name),
                establishment = $window.sessionStorage.establishment,
                manufacturer = $rootScope.profile.manufacturers[0].id,
                location = thisModule.location.location_id,
                filterOptions = thisModule.paging, deferred = $q.defer(),
                data = {
                    module: 'get', table: moduleName, params: thisModule, establishment: establishment,
                    manufacturers: [manufacturer], locations: [location], filters: filterOptions,
                    csv: $scope.newTransaction
                };

            $scope.export = data;

            // console.log( '|----------------------------------------|' );
            // console.log( 'EXPORT FILE FOR ' + moduleName, data );
            
            self.downloadCSV( $scope );
        },
        
        downloadCSV: function( $scope ){
            
            console.log( 'exportServices.downloadCSV', $scope );
            
            var self = this, 
                thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                //moduleMethod = $event.currentTarget.dataset.type,
                moduleType = thisModule.type,
                //thisExport = utils.toType($scope.batchItems[0]) === 'number' ?  pdfService.parseAsset($scope) : $scope.batchItems,//$scope.newTransaction, 
                headers = [], rows = [], csv = '';
            
            // console.log( '|----------------------------------------|' );
            console.log( 'THIS EXPORT', moduleMethod, thisExport );
            
            xlsService.exportOptions($scope);
            
        },
        
        // BUILD THE HTML STRING FOR THE MODAL WINDOW
        buildHtml: function( $scope ){
            
            // console.log( 'buildHtml.scope', $scope );
            
            var self = this, 
                thisModule = $scope.$parent.currentModule,
                moduleMethod = thisModule.modal.method,
                moduleName = thisModule.name, 
                str = thisModule.modal.html;
            
            modalService.launchModal( $scope );
            angular.element('#modalContainer').html($compile(str)($scope));
        },
        
    };
    
}]);