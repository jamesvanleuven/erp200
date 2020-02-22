'use strict';
/**
 * @ngdoc service
 * @name clientApp.importServices
 * @description
 * # importService
 * Service in the clientApp
 */ 
angular.module('clientApp.importServices', []).service('importService', function ($q, $window, $rootScope, restAPI, csvService, tableService, channels, elements, utils, buttons , modalService , $compile , mathService , pdfService, moment) {

    return {

        config: function( $scope, $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisModal = thisModule.modal,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type;

            console.log( '|-------------------------------------|' );
            console.log( 'IMPORT-SERVICE.THIS-MODULE >> ', thisModule );
            console.lot( 'IMPORT-SERVICE.THIS-MODAL >> ', thisModal );
            console.log( 'IMPORT-SERVICE.MODULE-NAME >> ', moduleName );
            console.log( 'IMPORT-SERVICE.MODULE-TYPE >> ', moduleType );
        },

        importOptions: function($scope, $event){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisLocation = thisModule.location,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type,
                // PARAMS
                manufacturer = thisLocation.establishment_id,
                location = thisLocation.id;
            
            console.log( '|----------------------------|' );
            console.log( 'IMPORT-SERVICES.IMPORT-OPTIONS');
            console.log( 'ROOTSCOPE >> ', $rootScope );
            console.log( 'SCOPE >> ', $scope );
            console.log( '|----------------------------|' );
            console.log( 'THIS-MODULE >> ', thisModule );
            console.log( 'MODULE-NAME >> ', moduleName );
            console.log( 'MODULE-TYPE >> ', moduleType );
            
            var rows = [];
            
            // CALL THE IMPORT SCHEMA
            return channels.moduleSchema(moduleName).then(function(results){
                
                console.log( '|----------------------------|' );
                console.log( 'PRODUCT-LIST.RESULT >> ', results );
                
                var rows = results[0].result, 
                    columns = [], 
                    headers = [];
                
                // LOOP THROUGH THE IMPORT SCHEMA
                angular.forEach(rows, function(row, key){
                    
                    if( key.indexOf('id') === -1 ){
                        
                        if( row.input !== 'json' ){

                            console.log( '|----------------------------|' );
                            console.log( key, row );

                            var item = {
                                name: utils.stringCapitalise(key.replace(/_/g, ' ')),
                                field: row.field,
                                type: row.data_type,
                                mapping: {
                                    id: -1,
                                    value: null,
                                    data: null
                                }
                            };

                            headers.push(item.name);
                            columns.push(item);
                            
                        }
                        
                    }
                    
                });
                
                $scope.csv.import = { columns: columns, headers: headers, matching: {} };

                // DEFINE THE RESOURCE CONTROLLER
                var imports = {
                    '1': function(){ return self.resourceImport($scope, $event); },
                    '2': function(){ return self.transactionImport($scope, $event); }
                };

                return imports[ moduleType.toString() ]();
                
            });
        },

        buildHeaders: function( $scope ){
            var self = this,
                headers = [], header = [],
                items = $scope.result[0];
            angular.forEach(items, function(value, key){
                headers.push(key);
            });

            for( var h = 0; h < headers.length; h++ ){
                header.push({ id: h, value: headers[h] });
            }

            // console.log( 'header', header );
            $scope.$parent.$parent.csv.import.headers.push(header);
        },

        resourceImport: function( $scope, $event ){

            console.log( '|-- RESOURCE IMPORT -----------------------|' );
            
            var self = this,
                thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase();
                // str = '<div data-ng-include="\'views/modules/_partials/_shared/_importCSV.html\'"/>';
            
            /**
             *  BECAUSE WE HAVE CREATED A SCHEMA DOCUMENT
             *  AND BECAUSE WE'RE BUILDING AN IMPORT MATCH
             *  FROM TWO EXISTING JSON OBJECTS.
             *
             *  WE CAN ABORT THE HTML PARTIAL AND BUILD THIS
             *  ON THE FLY:`
             */
            
            // console.log( 'RESOURCE-IMPORT.SCOPE >> ', $scope );
            // console.log( 'RESOURCE.IMPORT.EVENT >> ', $event );
            
            // FETCH THE CSV IMPORT OBJECT
            var csvObject = $scope.$parent.csv;
            
            // console.log( '|----------------------------|' );
            // console.log( 'CSV-OBJECT >> ', csvObject );
            
            // BUILD THE MODAL WINDOW FROM THE SCHEMA CSV-OBJECT
            // -----
            var btn = '<data-ng-csv-import class="import" content="csv.content" header="csv.header" header-visible="csv.headerVisible" separator="csv.separator" separator-visible="csv.separatorVisible" result="csv.result" encoding="csv.encoding" encoding-visible="csv.encodingVisible" upload-button-label="csv.uploadButtonLabel"></data-ng-csv-import>';
            var str = '';
            // opening string
            str += '<span><table class="table table-bordered table-striped">';
            
            // loop through csvObject.headers to build the table headers row
            var schemaHeaders = csvObject.import.headers,
                schemaMatchedCols = csvObject.import.matching;
            
            // OPEN HEADER
            str += '<thead><tr>';
            for(var h = 0; h < schemaHeaders.length; h++ ){
                
                // BUILD IMPORT TABLE ROOT COLUMN HEADERS
                str += '<th><small>' + schemaHeaders[h].toUpperCase() + '</small></th>';
                // BUILD IMPORT 
                schemaMatchedCols['"' + schemaHeaders[h] + '"'] = [];
                
                
            }
            
            str += '</tr><tr><td id="importColumns" colspan="' + schemaHeaders.length + '">';
            str += '<js-xls onread="read" class="control-form imput-sm" style="height: 20px; width: 50px;" onerror="error" class="form-control"></js-xls>';
            str += '</td></tr></thead>';
            str += '<tbody id="importColHeaders"></tbody>';
            
            // closing string
            str += '</table></span>';
            
            
            // console.log( '|----------------------------|' );
            // console.log( 'str >> ', str );
            // console.log( 'MATCHING ARRAY OBJECTS >> ', schemaMatchedCols );
            
            

            csvObject.html = str;

            self.buildHtml( $scope );
        },
        
        
        
        transactionImport: function( $scope, $event ){
            
            // console.log( '|-- TRANSACTION IMPORT --------------------|' );
            
            var self = this,
                str = '<div data-ng-include="\'views/modules/_partials/_shared/_importCSV.html\'"/>';

            $scope.$parent.currentModule.modal.html = str;

            self.buildHtml( $scope );
        },

        parseCSV: function(content, $scope){
            var deferred = $q.defer(), header,
                rows = [], obj = {}, results = [];

            if(content){
                for( var i = 1; i < content.length; i++ ){
                    var row = content[0][i].split(',');
                    rows.push(row);
                };

                for( var j = 0; j < rows.length; j++ ){
                    for( var k = 0; k , rows[j].length; k++ ){
                        obj[header[k]] = rows[j][k];
                    }
                    results.push(obj);
                    obj = {};
                };

                // console.log( 'header', header );
                // console.log( 'rows', rows );
                // console.log( 'results', results );
            }
        },

        // BUILD THE HTML STRING FOR THE MODAL WINDOW
        buildHtml: function( $scope ){

            // console.log( 'buildHtml.scope', $scope );

            var self = this,
                thisModule = $scope.$parent.currentModule,
                moduleMethod = thisModule.modal.method,
                moduleName = thisModule.name,
                str = $scope.$parent.csv.html;

            // console.log( 'buildHtml.str', str );

            modalService.launchModal( $scope );
            angular.element('#modalContainer').html($compile(str)($scope));
            // angular.element('#modalContainer').html(str);
        },

    };
});