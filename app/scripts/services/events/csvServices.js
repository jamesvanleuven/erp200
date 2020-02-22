'use strict'; 
/**
 *  METHOD
 *  <csv-import 
 *   class="import"
 *   content="csv.content"
 *   header="csv.header" 
 *   header-visible="csv.headerVisible" 
 *   separator="csv.separator"
 *   separator-visible="csv.separatorVisible"
 *   result="csv.result"
 *   encoding="csv.encoding"
 *   encoding-visible="csv.encodingVisible"></csv-import>
 *
 * @ngdoc service
 * @name clientApp.csvServices
 * @description
 * # csvService
 * Service in the clientApp
 */
angular.module('clientApp.csvServices', []).service('csvService', function ($q, $rootScope, $window, $compile, errorService, tableService) {
    
    return {
        
        csvOptions: function($route, $scope){
            // // console.log( 'csvServices.csvOptions', $route, $scope );
        },
        
        // CONVERT CSV ARRAY TO PROPER JSON OBJECT
        parseCSV: function(content, $scope){
            
            // console.log( 'importCSV.content', content );

            var deferred = $q.defer(),
                header = content[0][0].split(','), 
                rows = [], obj = {}, results = [];

            for( var i = 1; i < content.length; i++){
                var row = content[0][i].split(',');
                rows.push(row);
                /*
                var row = content[i][0].split(',');
                rows.push(row);
                */
            }
                
            // loop through each row
            for( var j = 0; j < rows.length; j++ ){
                // loop through each item
                for( var k = 0; k < rows[j].length; k++ ){
                    obj[header[k]] = rows[j][k];
                }
                // push to json object
                results.push( obj );
                obj = {};
            }
            
            // // console.log('results', results);
            
            tableService.parseImportTable(results, $scope).then(function(success){
                deferred.resolve(success);
            }, function(reason){
                deferred.reject(reason);
            });

            return deferred.promise;
        },
        
        csvTemplate: function($route, $scope){
            // console.log( 'csvService.csvTEMPLATE', $route, $scope );
            
            var self = this, deferred = $q.defer(),
                thisModule = $scope.currentModule,
                moduleName = angular.lowercase(thisModule.name),
                // establishment = parseInt($window.sessionStorage.establishment),
                // manufacturer = $rootScope.profile.manufacturers[0].value.replace(/\s+/g, '-'),
                // manufacturer = $rootScope.profile.manufacturers[0].replace(/\s+/g, '-'),
                csvTemplate = $scope[moduleName][0], 
                csvTitle = '', csvHeaders = [];

            angular.forEach(csvTemplate, function(item, key){ 
                item !== null && item.field ? csvHeaders.push(item.field) : null; 
            });
            /*
            establishment === 0 ? 
                csvTitle = 'Generic-' + thisModule.name + '-Template' : 
                csvTitle = manufacturer + '-' + thisModule.name + '-Template';
            */

            var a = document.createElement('a');
            // var blob = new Blob([csvHeaders], {'type':'application\/octet-stream'});
            // var blob = new Blob([csvHeaders], {'type':'application\/vnd.ms-excel'});
            var blob = new Blob([csvHeaders], {'type':'text\/csv'});
            var csvUrl = window.URL.createObjectURL(blob);
            var filename = csvTitle;
            
            a.id = 'dlLink';
            a.href = csvUrl;
            a.setAttribute( 'style', 'display:none;' );
            a.setAttribute( 'target', '_new' );
            a.setAttribute( 'type', 'application\/vnd.ms-excel' );
            // a.setAttribute( 'download', filename );
            // a.target = '_blank';
            // a.type = 'application/vnd.ms-excel';
            // a.download = csvTitle + '.csv';

            angular.element(document.body).append($compile(a)($scope));
            angular.element('#dlLink')[0].click();
            angular.element('#dlLink').remove();
        },
    };
    
});