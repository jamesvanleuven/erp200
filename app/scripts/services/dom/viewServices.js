'use strict';

/**
 *  @ngdoc service
 *  @name clientApp.viewServices
 *  @description
 *      - viewServices
 *      - This renders the different views based upon
 *          the $scope.view assignment
 *      - If no view is defined then the default view
 *          is a TABLE view
 */

angular.module('clientApp.viewServices', [])
.service('viewService', function($q, $rootScope, filterService, tableService, panelService) {
    
    return {

        viewBuild: function($route, $scope){            

            var self = this, 
                build = $rootScope.components || 'table',
                builds = { 
                    'table': function(){ return self.viewTable($scope); },
                    'panel': function(){ return self.viewPanel($scope); },
                    'tile': function(){ return self.viewTile($scope); },
					'tabs': function(){ return self.viewTabs($scope); }
                };
            
            $rootScope.components = build;
            return builds[build]();
            
        },

        loadContainer: function($scope, view, content){  
            var str = '', 
                thisModule = angular.lowercase($scope.currentModule.name);
            
            str += '<div class="row">';
            str += '<div class="' + thisModule + '-sidebar col-md-5" style="display:none;">';
            str += '</div>';
            str += '<div class="' + thisModule + '-content col-md-12">';
            str += content.header + content.body + content.footer;
            str += '</div></div>';

            var object = ({ content: str });
            
            return object;
        },
		
		// REPORTS TAB
		viewTabs: function( $scope ){
			var self = this,
				deferred = $q.defer();
            var str = {
                header: '<div>Load Reports Tabs/div>',
                body: '',
                footer: ''
            };
            deferred.resolve(str);
            return deferred.promise;
		},
        
        viewFilters: function($scope){
            var self = this, 
                deferred = $q.defer();
            
            filterService.buildFilters($scope).then(function(success){
                
                // console.log( '|---------------------------------------------|' );
                // console.log( 'VIEW-SERVICES SUCCESS >> ', success );
                
                deferred.resolve(success);
            });
            
            return deferred.promise;
        },
        
        viewTable: function($scope){
            var self = this, deferred = $q.defer();

            tableService.parseTable($scope).then(function(success){
                var object = self.loadContainer($scope, 'table', success);
                deferred.resolve(object);
            });
            
            return deferred.promise;
        },
        
        viewPanel: function($scope){
            var self = this, deferred = $q.defer();
            
            panelService.parsePanel($scope).then(function(success){
                //var str = success.header + success.body + success.footer;
                
                var object = self.loadContainer($scope, 'panel', success);
                
                deferred.resolve(object);
            });

            return deferred.promise;
        },
        
        viewTile: function($scope){
            var deferred = $q.defer();
            var str = {
                header: '<div>Load Tile View</div>',
                body: '',
                footer: ''
            };
            deferred.resolve(str);
            return deferred.promise;
        },
        
    };
    
});