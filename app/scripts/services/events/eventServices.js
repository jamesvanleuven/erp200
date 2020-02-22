'use strict';

/**
 * @ngdoc service
 * @name clientApp.eventServices
 * @description
 * # eventServices
 * Service in the clientApp
 */

angular.module('clientApp.eventServices', []).service('eventService',[
    'utils',
    'channels',
    'resourceService',
    'transactionService',
    'routingService',
    'pdfService',
    'xlsService',
    'exportService',
    'importService',
    function(utils, channels, resourceService, transactionService, routingService, pdfService, xlsService, exportService, importService){

        return {

            eventHandler: function( $scope, $event ){
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    moduleType = thisModule.type;

                switch(moduleType){
                    case 1: return self.resourceEvent( $scope, $event );
                    case 2: return self.transactionEvent( $scope , $event );
                }
            },

            resourceEvent: function( $scope, $event ){
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    thisModal = thisModule.modal,
                    thisMethod = thisModal.method,
                    thisIndex = thisModal.index,
                    moduleName = thisModule.name.toLowerCase(),
                    moduleType = thisModule.type;

                var resource = {
                    'edit': function(){ resourceService.editResource( $scope, $event ) },
                    'add': function(){ resourceService.addResource( $scope, $event ) },
                    'import': function(){
                      // resourceService.addResource( $scope, $event, true );
                      return importService.importOptions($scope, $event);
                    },
                    'export': function(){ return exportService.exportOptions( $scope, $event ); },
                    'template': function(){ return exportService.exportOptions( $scope, $event ); }
                };

                return resource[thisMethod]();

            },

            transactionEvent: function( $scope, $event ){
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    thisModal = thisModule.modal,
                    thisMethod = thisModal.method,
                    thisIndex = thisModal.index,
                    moduleName = thisModule.name.toLowerCase(),
                    moduleType = thisModule.type;
                console.log( '|-------------------------------------|' );
                console.log( 'TRANSACTION-EVENT.THIS-MODULE >> ', thisModule );
                console.log( 'TRANSACTION-EVENT.THIS-MODAL >> ', thisModal );
                console.log( 'TRANSACTION-EVENT.METHOD >> ', thisMethod );
                console.log( 'TRANSACTION-EVENT.MODULE-NAME >> ', moduleName );
                console.log( 'TRANSACTION-EVENT.MODULE-TYPE >> ', moduleType );
				
				$scope.thisBatch = [];

                console.log( 'TRANSACTION-EVENT.INDEX-TYPE >>', utils.toType(thisIndex) );

                switch( utils.toType(thisIndex) ){
                    case 'number': // SINGLE EVENT
                        switch(thisMethod){
                            case 'edit': return transactionService.editTransaction( $scope, $event );
                            case 'add': return transactionService.addTransaction( $scope, $event );
                            case 'print': return pdfServices.pdfOptions( $scope, $event );
                            case 'import':
                                // STEP 1: FETCH THE MODULE SCHEMA
                                // return importService.importOptions( $scope, $event );
                            break;
                            case 'template':
                                // STEP 1: FETCH THE MODULE SCHEMA
                                // return exportServices.exportOptions( $scope, $event );
                            break;
                        }
                    break;
                    case 'array': // BATCH EVENT

                        console.log( '|-------------------------------------|' );
                        console.log( 'BATCH-ITEMS >> ', $scope.batchItems );

						
                        var batchItems = $scope.batchItems;
                        // STEP 1: RETURN BATCH ARRAY SET OF LINE ITEMS
                        for( var i = 0; i < batchItems.length; i++ ){

                            var location = 0;
                                moduleName === 'orders' ?
                                    location = parseInt(batchItems[i].location.selected.id) :
                                    location = parseInt(batchItems[i].from_warehouse.selected.id) ;

                                moduleName === 'transfers' ?
                                    parseInt(batchItems[i].from_warehouse.selected.id) === 0 ?
                                        location = parseInt(batchItems[i].to_warehouse.selected.id) :
                                        null :
                                    null;


                            var params = [
                                parseInt(batchItems[i].manufacturer.selected.id),
                                location
                            ];

                            var productList = this.productList( params, batchItems[i] ),
								thisRow = {};

                            console.log( 'PARAMS >> ', params );
                            console.log( 'BATCH-ITEM[' + i + ']', batchItems[i] );
                            console.log( 'PRODUCT-LIST >> ', productList );
							
							$scope.thisBatch.push( angular.copy(batchItems[i], thisRow) );

                        }

                        console.log( '|-------------------------------------|' );
                        console.log( 'BATCH-ITEMS >> ', $scope );
						console.log( 'THIS-BATCH >> ', $scope.thisBatch );


                        // STEP 2: EXECUTE THE CORRECT BATCH TRANSACTION REQUEST
                        var transaction = {
                            'routing': function(){  return routingService.routingOptions( $scope, $event ); },
                            'billoflading': function(){ return pdfService.pdfOptions($scope, $event); },
                            'doc60': function(){ return pdfService.doc60($scope, $event); },
                            'print': function(){ return pdfService.pdfPrintPickOptions($scope, $event); },
                            'picklist': function() { return xlsService.exportPickList($scope, $event); },
                            'ldb': function(){ return xlsService.exportLDB($scope , $event); },
                            'export': function(){ return exportService.exportOptions( $scope, $event); },
                            'delivered': function(){ return transactionService.adjustOnHoldInventory( $scope, $event ); }
                        };

                        return transaction[thisMethod]();

                    break;
                }
            },

            productList: function( params, thisRow ){

                var thisTransaction = thisRow,
                    lineItems = thisTransaction.products.value,
					productList = thisTransaction.productList,
                    transactionItems = [];

                console.log( '|----------------------------------------|' );
                console.log( 'PARAMS >> ', params );
                console.log( 'THIS-ROW >> ', thisRow );

                // RETURN PRODUCT LIST
                // channels.productList(params).then(function(result){

                    var productList = thisRow.productList;

                    for( var i = 0; i < productList.length; i++ ){
                        var row = productList[i]; // THIS ROW

                        for( var j = 0; j < lineItems.length; j++ ){
                            var item = lineItems[j]; // THIS LINE-ITEM

                            // MATCH ROW TO LINE-ITEM
                            if( parseInt(item.id) === parseInt(row.id) ){

                                console.log( '|----------------------------------------|' );
                                console.log( 'THIS-ROW >> ', row );
                                console.log( 'THIS-LINE-ITEM >> ', item );

                                // FORMAT LINE-ITEM QUANTITY | INVENTORY
                                item.quantity = parseInt(item.quantity);
                                item.inventory = parseInt(row.inventory);
                                item.nInventory = parseInt(item.inventory);

                                // SET INVENTORY MIN | MAX CONTROLS
                                var ttlInventory = item.quantity + item.inventory;
                                item.max = ttlInventory;
                                item.min = 0;

                                item.sku = row.sku;
                                item.upc = row.upc;
                                item.bottles_per_case = parseInt(row.bottles_per_case);
                                item.bottles_per_sku = parseInt(row.bottles_per_sku);
                                item.litres_per_bottle = parseFloat(row.litres_per_bottle);
                                item.litter_rate = parseFloat(row.litter_rate);
                                item.package_type = row.package_type;
                                item.product_type = row.product_type;
                                item.product = utils.stringCapitalise(row.product.toLowerCase());
                                item.manufacturer_price = parseFloat(row.manufacturer_price);
                                item.retail_price = parseFloat(row.retail_price);
                                item.wholesale_price = parseFloat(row.wholesale_price);
                                item.id = row.id;
                                item.original_deliver_date = row.deliver_date;
								item.calculatedPrice = parseFloat(item.calculatedPrice);

                                
                                utils.toType(item.price) !== 'undefined' ?
                                    item.price = parseFloat(item.price) :
                                    item.price = parseFloat(row.wholesale_price);
                                

                                // LINE-ITEM TYPEAHEAD CONTENT
                                item.selected = row.selected;

                                // PRICING CALCULATIONS
                                var Tax = parseFloat(0.05),
                                    Deposit = parseFloat(row.litter_rate),
                                    Quantity = parseInt(item.quantity),
                                    Price = parseFloat(item.calculatedPrice);

                                item.Tax = Number(Tax);
                                item.totalDeposit = ( parseInt(Quantity) * parseFloat(Deposit) );
                                item.subTotal = ( parseInt(Quantity) * parseFloat(Price) );
                                item.totalTax = ( parseFloat(item.subTotal) * parseFloat(Tax) );
                                item.Total = (item.totalDeposit + item.subTotal + item.totalTax);

                                transactionItems.push(item);
                            }
                        }
                    }

                // });


                console.log( '|----------------------------------------|' );
                console.log( 'TRANSACTION-ITEMS >> ', transactionItems );

                return transactionItems;

            }
        };
}]);
