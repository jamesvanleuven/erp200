'use strict';
/**
 * @ngdoc service
 * @name clientApp.editServices
 * @description
 * # editService
 * Service in the clientApp
 */
angular.module('clientApp.editServices', []).service('editService', function ($q, $rootScope, $window, csvService, utils, restAPI){

    /*
    function cleanParams(params, object) {
        
        delete params.options;
        delete params.productList;

        angular.forEach(params, function(item, key){
            
            console.log( '|------------------------------|' );
            console.log( 'CLEAN PARAMS >> ', utils.toType(item) );
			
			if( utils.toType(item) === 'object' ){
				// delete params[key].permissions;
				// delete params[key].table;
				// delete params[key].field;
				// delete params[key].alias;
				// delete params[key].data_type;
				// delete params[key].input;
				// delete params[key].required;
				// delete params[key].visible;
				console.log( key, item );

				if( object.Tax === 0 ){
					object.Tax = 0.05;
					object.totalTax = parseInt(object.subTotal).toFixed(2) * parseInt(object.Tax).toFixed(2);
				}
			}

        });
    }
    */

    return {
        
        cleanParams: function(params){
            
            console.log( '|-------------------------------------|' );
            console.log( 'CLEAN-PARAMS.THIS-OBJECT >> ', params );
            
            var self = this,
                cleanParams = {};
            
            utils.toType(params.options) !== 'undefined' ? delete params.options : null;
            utils.toType(params.productList) !== 'undefined' ? delete params.productList : null;
            utils.toType(params.modal) !== 'undefined' ? delete params.modal : null;
            
            angular.forEach(params, function(row, key){
                    
                if( utils.toType(row) === 'object' ){

                    console.log( '|-------------------------------------|' );
                    console.log( key, utils.toType(row), row );

                    if( utils.toType(row.input) !== 'undefined' ){
                        switch(row.input){
                            case 'select': cleanParams[key] = { selected: row.selected }; break;
                            case 'cs' : cleanParams[key] = { selected: row.selected }; break;
                            default: cleanParams[key] = { value: row.value };
                        }   
                    }
                    else{
                        cleanParams[key] = row;
                    }
                    
                }
                else{
                    cleanParams[key] = row;
                }
                
            });
            
            console.log( '|-------------------------------------|' );
            console.log( 'CLEAN-PARAMS >> ', cleanParams );
            
            return cleanParams;
            
        },

        editOptions: function( obj ){

            console.log( '|-------------------------------------|' );
            console.log( 'EDIT-SERVICE.EDIT-OPTIONS.OBJ >> ', obj );


            var self = this, deferred = $q.defer(),
                response = self.manageInsert( obj );

            deferred.resolve( response );
            return deferred.promise;
        },

        // ERROR HANDLER
        errorHandler: function( thisObject ){

            console.log( 'ERROR HANDLER THIS OBJECT >>', thisObject );

            var moduleType = thisObject.type,
                message = [];

            switch( moduleType ){
                case 1:

                break;
                case 2:
                    var lineItems = thisObject.params.products.value;
                    switch( thisObject.module ){
                        case 'orders':
                            thisObject.params.manufacturer.selected.value.length === 0 ? message.push('manufacturer') : null;
                            lineItems.length === 0 ? message.push('line-items') : null;
                            thisObject.params.customer.selected.value.length === 0 ? message.push('customer') : null;
                        break;
                        case 'transfers':
                            thisObject.params.manufacturer.selected.value.length === 0 ? message.push('manufacturer') : null;
                            lineItems.length === 0 ? message.push('line-item') : null;
                            thisObject.params.transfer_type === 1 ?
                                thisObject.params.from_warehouse.selected.value === null ?
                                message.push('from warehouse') : null :
                                null;
                            thisObject.params.to_warehouse.selected.value.length === 0 ? message.push('to warehouse') : null;
                        break;

                    }
                break;
            }

            return message;
        },

        manageRow: function( thisObject ){

            console.log( '|-------------------------------------|' );
            console.log( 'THIS OBJECT INSERT >> ', thisObject );

            var self = this, moduleType = thisObject.type,
                deferred = $q.defer();

            delete thisObject.result;

            restAPI.postTransaction.save(thisObject, function(response){

                console.log( '|-------------------------------------|' );
                console.log( 'THIS OBJECT RESPONSE >> ', response );

                deferred.resolve(response);
            });

            return deferred.promise;
        },
		

        lineItems: function( thisObject ){
            
            var self = this, item = {}, newProductList = [],
                lineItems = thisObject.params.products.value,
                oOrderItems = thisObject.params.oOrderItems,
                thisCustomer = { id: null, customer_type_id: null },
                thisLocation = 0,
                thisManufacturer = 0;

            console.log( '|-------------------------------------|' );
            console.log( 'LINE-ITEMS.THIS-OBJECT >> ', thisObject );
            
            /**
             * CLEAN LINE ITEMS
             *
            for(var i = 0; i < lineItems.length; i++){
                lineItems[i] = {
                    // Tax: lineItems[i].Tax,
                    // Total: lineItems[i].Total,
                    // bottles_per_case: lineItems[i].bottles_per_case,
                    // bottles_per_sku: lineItems[i].bottles_per_sku,
                    calculatedPrice: lineItems[i].calculatedPrice,
                    id: lineItems[i].id,
                    // litres_per_bottle: lineItems[i].litres_per_bottle,
                    // litter_rate: lineItems[i].litter_rate,
                   //  manufacturer_price: lineItems[i].manufacturer_price,
                    // package_type: lineItems[i].package_type,
                    price: parseFloat(lineItems[i].price),
                    // product_type: lineItems[i].product_type,
                    quantity: lineItems[i].quantity,
                    // retail_price: lineItems[i].retail_price,
                    // sku: lineItems[i].sku,
                    // subTotal: lineItems[i].subTotal,
                    // totalDeposit: lineItems[i].totalDeposit,
                    // totalTax: lineItems[i].totalTax,
                    // upc: lineItems[i].upc,
                    // wholesale_price: lineItems[i].wholesale_price
                };
            }
            */

            // DEAL WITH TRANSACTION MODULE ASSIGNMENTS
            switch(thisObject.module){
                case 'orders':

                    thisCustomer = {
                        id: thisObject.params.customer.selected.id,
                        customer_type_id: thisObject.params.customer.selected.customer_type_id
                    };
                    thisLocation = thisObject.params.location.id;
                    thisManufacturer = thisObject.params.manufacturer.selected.id;

                break;
                case 'transfers':

                    thisLocation = {
                        from: thisObject.params.from_warehouse.selected.id,
                        to: thisObject.params.to_warehouse.selected.id
                    };
                    thisManufacturer = thisObject.params.manufacturer.selected.id;

                break;
            }

            for(var i = 0; i < lineItems.length; i++ ){

                console.log( '|-------------------------------------|' );
                console.log( 'lineItem[' + i + ']', lineItems[i] );

                lineItems[i].promotional_price ?
                    newProductList.push(
                    {
                        id: lineItems[i].id,
                        // product: lineItems[i].product,
                        quantity: lineItems[i].quantity,
                        litres_per_bottle: lineItems[i].litres_per_bottle,
                        // sku: lineItems[i].sku,
                        calculatedPrice: parseFloat(lineItems[i].calculatedPrice),
                        price: parseFloat(lineItems[i].promotional_price),
						/*
                        history: {
                            manufacturer: thisManufacturer,
                            customer: thisCustomer,
                            location: thisLocation
                        }
						*/
                    }) :
                    newProductList.push(
                    {
                        id: lineItems[i].id,
                        // product: lineItems[i].product,
                        quantity: lineItems[i].quantity,
                        litres_per_bottle: lineItems[i].litres_per_bottle,
                        // sku: lineItems[i].sku,
                        calculatedPrice: parseFloat(lineItems[i].calculatedPrice),
                        price: parseFloat(lineItems[i].price),
						/*
                        history: {
                            manufacturer: thisManufacturer,
                            customer: thisCustomer,
                            location: thisLocation
                        }
						*/
                    });
            }
            
            // STRIP OLD-ORDER-ITEMS OBJECT ROWS
            if( thisObject.method === 'edit'){
                
                for(var n = 0; n < oOrderItems.length; n++ ){
                    oOrderItems[n] = {
                        id: oOrderItems[n].id,
                        quantity: oOrderItems[n].quantity,
                        litres_per_bottle: oOrderItems[n].liters_per_bottle,
                        calculatedPrice: parseFloat(oOrderItems[n].calculatedPrice),
                        price: parseFloat(oOrderItems[n].price)

                    };
                }
                
            }


            thisObject.params.products.value = newProductList;

            console.log( 'lineItems.thisObject', thisObject );

            return thisObject;
        },

        manageInsert: function( thisObject ){
            var self = this, deferred = $q.defer(),
                moduleType = thisObject.type,
                message = self.errorHandler( thisObject );

            console.log( '|-------------------------------------|' );
            console.log( 'THIS OBJECT INSERT >> ', thisObject );

            thisObject.params = self.cleanParams( thisObject.params );
            /*
            if (angular.isArray(thisObject.params)) {
                angular.forEach(thisObject.params, function(params){
                    self.cleanParams(params);
                })
            } else {
                self.cleanParams(thisObject);
            }
            */

            switch( moduleType ){
                case 1:
                    deferred.resolve( self.manageRow( thisObject ));
                break;
                case 2:
                    thisObject.result = message;
                    thisObject.result.length > 0 ?
                       deferred.reject( thisObject ) :
                       deferred.resolve( self.manageRow( self.lineItems( thisObject ) ));
                break;
            }

            return deferred.promise;
        }

    };

});
