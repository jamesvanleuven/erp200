'use strict';

/**
 * Created: 2015-09-25
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 */

// LOAD POSTGRES CONNECTOR
var db = require("../../../database"), 
    moment = require('moment-timezone');

// LOAD MONGODB CONNECTOR
var mongo = require('mongoskin').db( process.env.MONGODB_URI ), 
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID, 
    auditHandler = mongo.collection('transaction'),
    utils = require('../../../router/utils/index.js'),
    querystring = require('querystring');

function invSQL(){
    var str = 'SELECT b.id, b.product_id, b.batch_id, b.quantity, b.on_hold';
    
    str += ' FROM unnest(ARRAY[$1]::integer[]) id(id)';
    str += ' LEFT OUTER JOIN pim_inventory b ON b.product_id = id.id';
    str += ' WHERE b.manufacturer_id = $2 AND b.location_id = $3';
    str += ' ORDER BY id.id;';
    
    return str;
};

function invPARAMS( params ){

    var _q = [], _items = params.products.value,
        _manufacturer = params.manufacturer.selected.id,
        _location = params.location.selected.id;

    for( var i = 0; i < _items.length; i++ ){ _q.push(_items[i].id); }

    var _p = [_q, _manufacturer, _location];

    return _p;
};

function updSQL(){
    var str = 'UPDATE pim_inventory SET';
    str += ' quantity = $4, on_hold = $5';
    str += ' WHERE manufacturer_id = $1';
    str += ' AND location_id = $2';
    str += ' AND product_id = $3 RETURNING id;';
    
    return str;
};

function updPARAMS(a, b, c, d){
    
    var result = a,
        _lineItems = b,
        manufacturer = c,
        location = d,
        newInventory = {
            success: true,
            items: []
        },
        failedProducts = [],
        product = 0,
        thisHold = 0,
        thisQuantity = 0;
    
    for(var i = 0; i < result.length; i++ ){
        for(var j = 0; j < _lineItems.length; j++ ){
            if( parseInt(result[i].product_id) === parseInt(_lineItems[j].id) ){
				
				var msg = '';
                
                // console.log( '|-------------------------------------|' );
                // console.log( 'THIS-PRODUCT[' + i + '].quantity || on_hold >> ', result[i].quantity, result[i].on_hold );
                // console.log( 'THIS-LINE-ITEM[' + j + '].quantity >> ', _lineItems[j].quantity );
				
				if( parseInt(result[i].quantity) === 0 || parseInt(_lineItems[j].quantity) === 0 ){
					// NOTHING AVAILABLE MESSAGE
					parseInt(result[i].quantity) === 0 ? msg = 'Inventory Unavailable' : null;
					// NOTHING ORDERED MSG
					parseInt(_lineItems[j].quantity) === 0 ? msg = 'You can\'t order zero items' : null;
					
					// THE PRODUCT QUANTITY = 0 OR THE INVENTORY QUANTITY = 0 
					failedProducts.push({ 
						id: parseInt(_lineItems[j].id),
						inventory: parseInt(result[i].quantity), 
						quantity: parseInt(_lineItems[j].quantity),
						reason: msg,
						difference: 0 
					});
					
					newInventory.success = false;
					newInventory.items = failedProducts;
				}
				else{
					if( parseInt(result[i].quantity) < parseInt(_lineItems[j].quantity) ){
						
						// console.log( '|-------------------------------------|' );
						// console.log( 'ENOUGH INVENTORY: ', false );
						// console.log( '|-------------------------------------|' );

						var difference = parseInt(result[i].quantity) - parseInt(_lineItems[j].quantity);
						
						parseInt(difference) <= 0 ? 
							msg = 'Insufficient Inventory Available' : 
							msg = difference + ' unavailable on item quantity.';
						
						failedProducts.push({ 
							id: _lineItems[j].id, 
							reason: msg,
							inventory: parseInt(result[i]), 
							conflict: parseInt(difference) 
						});
					}

					if( failedProducts.length > 0 ){
						newInventory.success = false;
						newInventory.items = failedProducts;
					}
					else{
						
						// console.log( '|-------------------------------------|' );
						// console.log( 'ENOUGH INVENTORY: ', true );
						// console.log( '|-------------------------------------|' );

						thisQuantity = parseInt(result[i].quantity) - parseInt(_lineItems[j].quantity);
						thisHold = parseInt(result[i].on_hold) + parseInt(_lineItems[j].quantity);

						var pquery = [
							manufacturer,
							location,
							_lineItems[j].id,
							parseInt(thisQuantity),
							parseInt(thisHold)
						];

						// console.log( '|-------------------------------------|' );
						// console.log( 'PQUERY[' + j + '] >> ', pquery );

						newInventory.items.push(pquery);
					}
				}
            }
        }
    }

    return newInventory;
};

function ordSQL(){
	
    var str = '';
    
	str += 'INSERT INTO pim_orders(';
	str += 'user_id';
	str += ', customer_id';
	str += ', manufacturer_id';
	str += ', location_id';
    str += ', paid';
	str += ', promo';
	str += ', rush';
	str += ', pickup';
    str += ', products';
	str += ', status_id';
    str += ', delivery_date';
	str += ', udf_reference';
	str += ', notes';
	str += ')VALUES(';
    str += '$1::integer';
	str += ', $2::integer';
	str += ', $3::integer';
	str += ', $4::integer';
    str += ', $5::boolean';
	str += ', $6::boolean';
	str += ', $7::boolean';
	str += ', $8::boolean';
	str += ', $9::json';
    str += ', $10::integer';
	str += ', $11::timestamp without time zone';
    str += ', $12::character varying';
	str += ', $13::json';
    str += ') RETURNING id;'; 
	
	console.log( '|-------------------------------------|' );
	console.log( 'FUNCTION ORD-SQL >> ', str );
    
    return str;
};

function ordPARAMS(params){

    var pquery = [
        params.created_by.selected.id,
        params.customer.selected.id,
        params.manufacturer.selected.id,
        params.location.selected.id,
		params.paid.value || false,
        params.promo.value || false,
        params.rush.value || false,
        params.pickup.value || false,
        JSON.stringify(params.products.value),
        1,
        moment(params.deliver_date.startDate).toISOString(),
        params.order_reference.value || null,
        JSON.stringify(params.notes.value) || '{}'
    ];
	
	console.log( '|-------------------------------------|' );
	console.log( 'FUNCTION ORD-PARAMS >> ', pquery );
    
    return pquery;
};

/**
 * ADD AUDIT FUNCTION
 */
function auditTransaction( doc, module, method ){
    
    // transaction.method = method;
    // transaction.module = module;
    // transaction.created = moment(new Date()).toISOString();
    
    var transaction = {
        method: method,
        module: module,
        document: doc,
        success: doc.success,
        timestamp: moment(new Date()).toISOString()
    };
    
    // console.log( '|-------------------------------------|' );
    // console.log( 'AUDIT-TRANSACTION >> ', auditItem );

    return auditHandler.insert(transaction, function(err, doc){
        
        console.log( '|-------------------------------------|' );
        console.log( 'AUDIT-ERROR >> ', err );
        console.log( '|-------------------------------------|' );
        console.log( 'AUDIT-DOC >> ', doc );

        if(err) return err;

        if( doc ){
            return doc;
        }

    });
};

var addOrders = function(req, res){
    
    // define the module & post data
    var data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        results = [],
        schema = '',
        status,
        sql = '',
        key = [],
        values = [],
        products = [],
        item = {},
        orderId = 0, 
        httpStatus = 200;
	
	console.log( '|================================|' );
	console.log( '     ADD-ORDERS.JS           ' );
	console.log( '|================================|' );

    console.log( '|-------------------------------------|' );
    console.log( 'POST PARAMS >> ', params );
    
    // console.log( '|-------------------------------------|' );
    // console.log( 'RETURN INVENTORY USING >> ', invSQL(), invPARAMS( params ) );
    
    db.task(function(t){
        return t.any(invSQL(), invPARAMS(params))
        .then(function(result){
            var _lineItems = params.products.value, 
                manufacturer = params.manufacturer.selected.id,
                location = params.location.selected.id,
                queries = [], response = {};
            
            console.log( '|-------------------------------------|' );
            console.log( 'INVENTORY RESULT >> ', result );
            console.log( '|-------------------------------------|' );
            console.log( 'LINE-ITEMS >> ', _lineItems );
			console.log( '|-------------------------------------|' );
			console.log( 'INVENTORY-TEST.RESULTS >> ', updPARAMS(result, _lineItems, manufacturer, location) );
            
            var updINVENTORY = updPARAMS(result, _lineItems, manufacturer, location);
            
            // console.log( '|-------------------------------------|' );
            // console.log( 'BUILD ORDER TO INSERT >> ', updINVENTORY.success );
            
            if( updINVENTORY.success === false ){
                
                console.log( '|-------------------------------------|' );
                console.log( 'FAILED PRODUCTS >> ', updINVENTORY.items );
                
                var msg = 'AN INVENTORY CONFLICT OCCURRED.\n';
                msg += 'The inventory changed while you were building this order.\n';
                msg += 'Please adjust the highlighted line items and re-submit.';
                
                response = {
                    message: msg,
                    success: false,
                    httpStatus: 409,
                    items: updINVENTORY.items
                };
                
                // audit this failure
                params.result = response;
                params.created_date.value = moment(new Date()).toISOString();
                params.success = 0;
                
                auditTransaction( params, module, method );

                return res.status(httpStatus).json(response);
            }
            else{
                
                console.log( '|-------------------------------------|' );
                console.log( 'INSERT ORDER USING SQL >> ', ordSQL() );
				console.log( 'INSERT ORDER USING PARAMS >> ', ordPARAMS(params) );
                console.log( '|-------------------------------------|' );
                console.log( 'UPDATE INVENTORY USING >> ', updSQL(), updPARAMS(result, _lineItems, manufacturer, location) );
               
                return db.task(function(t){
                    return t.any(ordSQL(), ordPARAMS(params))
                    .then(function( order ){
                        
                        // PUSH ORDER TO 
                        response = {
                            httpStatus: 200,
                            inventory: null,
                            result: order[0],
                            success: true,
                            message: 'SUCCESSFULLY INSERTED ORDER!'
                        };
                        
                        console.log( '|-------------------------------------|' );
                        console.log( 'INSERTED ORDER >> ', order[0] );
                        console.log( '|-------------------------------------|' );
                        console.log( 'updINVENTORY.LENGTH >> ', updINVENTORY.items.length );
                        
                        for(var j = 0; j < updINVENTORY.items.length; j++ ){
                            queries.push( t.any(updSQL(), updINVENTORY.items[j]));
                        }
                        
                        
                        return db.tx(function(t){
                            return this.batch([ queries ])
                            .then(function(inventory){
                                
                                console.log( '|-------------------------------------|' );
                                console.log( 'INVENTORY UPDATE RESULTS >> ', inventory[0] );
                                
                                response.inventory = inventory[0];
                                
                                // audit this transaction
                                params.result = response;
                                params.created_date.value = moment(new Date()).toISOString();
                                params.success = 1;
                                
                                auditTransaction( params, module, method );
                                
                                return res.status(200).json(response);
                                
                            })
                            .catch(function(error){
                                
                                console.log( '|-------------------------------------|' );
                                console.log( 'INVENTORY UPDATE ERROR >> ', error );
                                
                                // audit this failure
                                params.result = error;
                                params.created_date.value = moment(new Date()).toISOString();
                                params.success = 0;
                                
                                auditTransaction( params, module, method );

                                return res.status(500).json(error); 
                                
                            });
                        });
                        
                    })
                    .catch(function(error){
                        
                        console.log( '|-------------------------------------|' );
                        console.log( 'ORDER UPDATE ERROR >> ', error );
                        
                        // audit this failure
                        params.result = error;
                        params.created_date.value = moment(new Date()).toISOString();
                        params.success = 0;
                        
                        auditTransaction( params, module, method );
                        
                        return res.status(500).json(error); 
                        
                    });
                });
            }

        })
        .catch(function(error){
            console.log( '|-------------------------------------|' );
            console.log( 'INVENTORY ERROR >> ', error );
            
            // audit this failure
            params.result = error;
            params.created_date.value = moment(new Date()).toISOString();
            params.success = 0;
            auditTransaction( params, module, method );

            return res.status(500).json(error); 
        });
    });

}

module.exports = addOrders;