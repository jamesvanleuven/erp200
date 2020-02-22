'use strict';

/**
 * @ngdoc service
 * @name clientApp.panelServices
 * @description
 * # panelService
 * Service in the clientApp
 */
angular.module('clientApp.panelServices', [])
  .service('panelService', function ($q, $cookies, $rootScope, $route, utils, buttons, elements) {
    
    return {
        
        parsePanel: function($scope){
            
            var self = this, 
                deferred = $q.defer(), 
                route = $route.current.params, count,
                currentScope = $scope[$route.current.params.module],
                sstr = 'id',
                permissions = $rootScope.$$childTail.currentModule.permissions;
            
            var filter = '<div class="row"><div class="col-md-12 clearfix">';
            filter += '<input type="text" data-ng-model="search" class="form-control';
            filter += ' input-sm" placeholder="Global Search"/><br/></div></div>';
            
            var pHead = '<p></p><div class="container-fluid">' + filter;
                
            var pBody = '',
                pFoot = '</div>';
            pFoot += '<div class="row"><dir-pagination-controls';
            pFoot += ' max-size="5" direction-links="true" boundary-links="true" ></dir-pagination-controls></div>';
            
            var buildPanel = function(row, key){
                if(key !== '$$hashKey'){
                    var item = '<div class="row">';
                    item += '<div class="col-md-4">' + elements.panelLabel(row, key) + '</div>'; 
                    item += '<div class="col-md-8 '+key+'">' + elements.rowItem(row, key) + '</div>';
                    item += '</div>';
                    return item;
                }
            };
            
            var item = currentScope;
            
            for( var i = 0; i < currentScope.length; i++ ){
                if(i === 0){
                    pBody += '<div class="col-md-3"';
                    pBody += ' ng-repeat="item in ' + route.module;
                    pBody += '|orderBy:sortKey:reverse|filter:search|itemsPerPage:9">';
                    pBody += '<div class="panel panel-default">';
                    pBody += '<div class="panel-heading" style="text-align:right;">';
                    pBody += '<div class="btn-group" role="group">';

                    // (permissions._get) ? pBody += buttons.viewHref('') : null;
                    (permissions._put) ? pBody += buttons.putHref('') : null;
                    (permissions._delete) ? pBody += buttons.delHref('') : null;

                    pBody += '</div></div>';
                    pBody += '<div class="panel-body">';
                    
                    angular.forEach(item[0], function(row, key){
                        //// console.log(key, row);

                        if(key.replace(/_/g, ' ').indexOf(sstr) === -1){
                            if(key !== '$$hashKey'){
                                pBody += buildPanel(row, key);
                            }
                        }
                    });
                    
                    pBody += '</div></div>';
                }
            }

            // BUILD TABLE
            if(pBody.length === 0){ 
                pBody += '<div class="col-md-12"><p>No ' + utils.stringCapitalise(route.module);
                pBody += ' for the letter ' + paging.letter + '</p></div>'; 
            }

            var parsed = {
                header: pHead,
                body: '<div class="row">' + pBody + '</div>',
                footer: pFoot
            };

            deferred.resolve(parsed);
            return deferred.promise;
        }
    }
    
  });
