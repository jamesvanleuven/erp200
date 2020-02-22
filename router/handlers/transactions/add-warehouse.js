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
    querystring = require('querystring'),
    moment = require('moment');

// BUILD INVENTORY-LIST SQL
function invSQL(){
    var sql = 'SELECT * FROM public.rtn_inventory_lineitems($1, $2, $3) AS "inventoryList";';
    return sql;
};

// BUILD INVENTORY-LIST PARAMS
function invPARAMS( params ){
    var _q = [], _p = [],
        _items = params.products.value,
        _manufacturer = params.manufacturer.selected.id,
        _transferType = params.transfer_type.selected.id,
        _location = params.from_warehouse.selected.id;
    
    console.log( '|--------------------------------------|' );
    console.log( 'INV-PARAMS FUNCTION' );
    console.log( '|--------------------------------------|' );
    console.log( '_MANUFACTURER >> ', _manufacturer );
    console.log( '_TRANSFER-TYPE >> ', _transferType );
    console.log( '_LOCATION >> ', _location );

    switch(_transferType){
        case 1: _location = params.from_warehouse.selected.id; break;
        case 2: _location = params.to_warehouse.selected.id; break;
        case 3: _location = params.from_warehouse.selected.id; break;
    }

    for(var i = 0; i < _items.length; i++ ){ 
        _q.push( _items[i].id ); 
    }

    _p = [ _q, _manufacturer, _location ];

    return _p;
};

// BUILD UPDATE INVENTORY SQL
function updSQL(){
    var sql = 'UPDATE pim_inventory SET quantity = $4, on_hold = $5';
    sql += ' WHERE manufacturer_id = $1 AND location_id = $2';
    sql += ' AND product_id = $3 RETURNING id;';
    return sql;
};

// BUILD UPDATE INVENTORY PARAMS
function updINVENTORYPARAMS(a, b, c, d){
    
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
            if( parseInt(result[i].product_id) === _lineItems[j].id ){
                
                console.log( '|-------------------------------------|' );
                console.log( 'THIS-PRODUCT[' + i + '].quantity || on_hold >> ', result[i].quantity, result[i].on_hold );
                console.log( 'THIS-LINE-ITEM[' + i + '].quantity >> ', _lineItems[j].quantity );
                
                if( parseInt(result[i].quantity) < parseInt(_lineItems[j].quantity) ){
                    
                    
                    console.log( '|-------------------------------------|' );
                    console.log( 'ENOUGH INVENTORY: ', false );
                    console.log( '|-------------------------------------|' );
                    
                    
                    var difference = parseInt(result[i].quantity) - parseInt(_lineItems[j].quantity);
                    failedProducts.push({ inventory: result[i], conflict: difference });
                }

                if( failedProducts.length > 0 ){
                    newInventory.success = false;
                    newInventory.items = failedProducts;
                }
                else{
                    
                    
                    console.log( '|-------------------------------------|' );
                    console.log( 'ENOUGH INVENTORY: ', true );
                    console.log( '|-------------------------------------|' );
                    
                    
                    console.log( 'NEW-QUANTITY >> ', parseInt(result[i].quantity) - parseInt(_lineItems[j].quantity) );
                    console.log( 'NEW ON-HOLD >> ', parseInt(result[i].on_hold) + parseInt(_lineItems[j].quantity) );
                    
                    thisQuantity = parseInt(result[i].quantity) - parseInt(_lineItems[j].quantity);
                    thisHold = parseInt(result[i].on_hold) + parseInt(_lineItems[j].quantity);
                    
                    ( thisHold < 0 ) ? thisHold = 0 : null;
					( thisQuantity < 0 ) ? thisQuantity = 0 : null;

                    var pquery = [
                        manufacturer,
                        location,
                        _lineItems[j].id,
                        thisQuantity,
                        thisHold
                    ];
                    
                    
                    console.log( '|-------------------------------------|' );
                    console.log( 'PQUERY[' + j + '] >> ', pquery );
                    
                    
                    newInventory.items.push(pquery);
                }
            }
        }
    }
    
    /*
    console.log( '|-------------------------------------|' );
    console.log( 'NEW-INVENTORY >> ', newInventory );
    */
    return newInventory;
};

// BUILD ADJUSTMENT INSERT SQL
function insSQL(){
    var sql = 'INSERT INTO pim_transfers(';
    sql += 'user_id, manufacturer_id, from_id, to_id, products, status_id, delivery_date, type_id, notes)VALUES(';
    sql += '$1::integer, $2::integer, $3::integer, $4::integer, $5::json, $6::integer,';
    sql += ' $7::timestamp without time zone, $8::integer, $9::json) RETURNING id;';
    return sql;
};

// BUILD ADJUSTMENT INSERT PARAMS
function insPARAMS( params ){
    var insPARAMS = [
        params.created_by.selected.id,
        params.manufacturer.selected.id,
        params.from_warehouse.selected.id,
        params.to_warehouse.selected.id,
        JSON.stringify(params.products.value),
        params.status.selected.id,
        moment(params.deliver_date.startDate).toISOString(),
        params.transfer_type.selected.id,
        JSON.stringify(params.notes.value)
    ];
    return insPARAMS;
};

// INSERT MONGODB AUDIT DOCUMENT
function auditTransaction( doc, module, method ){
    
    // transaction.method = method;
    // transaction.module = module;
    // transaction.created = moment(new Date()).toISOString();
    
    var transaction = {
        method: method,
        module: module,
        type: 'warehouse',
        document: doc,
        success: doc.success,
        timestamp: moment(new Date()).toISOString()
    };
    
    console.log( '|-------------------------------------|' );
    console.log( 'AUDIT-TRANSACTION >> ', transaction );

    return auditHandler.insert(transaction, function(err, doc){
        
        console.log( '|-------------------------------------|' );
        console.log( 'AUDIT-ERROR >> ', err );
        console.log( '|-------------------------------------|' );
        console.log( 'AUDIT-DOC >> ', doc );
        
        var auditResult = {};
        
        err !== null ? 
            auditResult = err : 
            auditResult = doc;
        
        return auditResult;

    });
};

// PROCESS THE TRANSFER
var addWarehouse = function(req, res, next){
    var self = this, 
        data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        transferType = params.transfer_type.selected.id,
        manufacturer_id = params.manufacturer.selected.id,
        location_id = params.from_warehouse.selected.id,
        lineItems = params.products.value,
        results = [],
        httpStatus = 200;;
    
    console.log( '|=====================================|' );
    console.log( '     ADD-WAREHOUSE-TO-WAREHOUSE        ' );
    console.log( '|=====================================|' );
	console.log( 'MODULE >>', module );
	console.log( '|--------------------------------------|' );
	console.log( 'METHOD >> ', method );
	console.log( '|--------------------------------------|' );
	console.log( 'PARAMS >> ', JSON.stringify(data, null, 4) );
	console.log( '|--------------------------------------|' );
	console.log( 'TRANSFER-TYPE >> ', transferType );

    
    // RETURN EXISTING INVENTORY FOR TRANSFER LINE-ITEMS
    // WAREHOUSE TO WAREHOUSE
    db.task(function(t){
        return t.any(invSQL(), invPARAMS(params))
        .then(function(inventory){
            
            var inventoryItems = inventory[0].result,
                failedProducts = [],
                thisHold = 0,
                thisQuantity = 0,
                newInventory = [],
                updPARAMS = [],
                queries = [],
                response = {};
            
            console.log( '|--------------------------------------|' );
            console.log( 'INVENTORY >> ', inventoryItems );
            
            var _lineItems = params.products.value,
                _manufacturer = params.manufacturer.selected.id,
                _location = params.from_warehouse.selected.id,
                updINVENTORY = updINVENTORYPARAMS(inventoryItems, _lineItems, _manufacturer, _location);

            
            console.log( '|--------------------------------------|' );
            console.log( 'NEW-INVENTORY >> ', updINVENTORY );
            
            // END PROCESSING IF UPD-INVENTORY.SUCCESS = FALSE
            if( updINVENTORY.success === false ){
                
                // console.log( '|-------------------------------------|' );
                // console.log( 'FAILED PRODUCTS >> ', updINVENTORY.items );
                
                var msg = 'AN INVENTORY CONFLICT OCCURRED.\n';
                msg += 'The inventory changed while you were building this transfer.\n';
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
                
                console.log( '|-------------------------------------|' );
                console.log( 'RESPONSE >> ', response );
                /*********************************************************************/
                // UNCOMMENT TO LOG TO CONSOLE 
                // BUT COMMENT THE FUNCTION ITSELF
                // OR IT WILL SUBMIT TWICE!!!!!!!
                /*********************************************************************/
                // console.log( '|-------------------------------------|' );
                // console.log( 'AUDIT >> ', auditTransaction(params, module, method) );
                auditTransaction( params, module, method );
                /*********************************************************************/

                return res.status(httpStatus).json(response);
            }
            else{
                
                // CONVERT NOTES TO JSON IF EMPTY
                // params.notes.value = '' ? params.notes.value = '{}' : null;
                
                // INSERT TRANSFER
                return db.task(function(t){
                    return t.any(insSQL(), insPARAMS(params))
                    .then(function(transfer){
                        
                        console.log('INSERT TRANSFER ID >> ', transfer );
                        
                        response = {
                            httpStatus: 200,
                            inventory: null,
                            result: transfer[0],
                            success: true,
                            message: 'SUCCESSFULLY INSERTED WAREHOUSE TRANSFER!'
                        };
                        
                        for(var j = 0; j < updINVENTORY.items.length; j++ ){
                            queries.push( t.any(updSQL(), updINVENTORY.items[j]));
                        }
                        
                        return db.tx(function(t){
                            return this.batch([ queries ])
                            .then(function(inventory){
                                console.log( '|-------------------------------------|' );
                                console.log( 'INVENTORY UPDATE RESULTS >> ', inventory[0] );
                                
                                response.inventory = inventory[0];
                                
                                // audit this success
                                params.result = response;
                                params.created_date.value = moment(new Date()).toISOString();
                                params.success = true;

                                console.log( '|-------------------------------------|' );
                                console.log( 'RESPONSE >> ', response );
								console.log( 'PARAMS >> ', params );
                                /*********************************************************************/
                                // UNCOMMENT TO LOG TO CONSOLE 
                                // BUT COMMENT THE FUNCTION ITSELF
                                // OR IT WILL SUBMIT TWICE!!!!!!!
                                /*********************************************************************/
                                // console.log( '|-------------------------------------|' );
                                // console.log( 'AUDIT >> ', auditTransaction(params, module, method) );
                                auditTransaction( params, module, method );
                                /*********************************************************************/
                                
                                return res.status(200).json(response);
                            })
                            .catch(function(error){
                                console.log( '|-------------------------------------|' );
                                console.log( 'INVENTORY ERROR >> ', error );

                                // audit this failure
                                params.result = response;
                                params.created_date.value = moment(new Date()).toISOString();
                                params.success = 0;

                                console.log( '|-------------------------------------|' );
                                console.log( 'RESPONSE >> ', response );
                                /*********************************************************************/
                                // UNCOMMENT TO LOG TO CONSOLE 
                                // BUT COMMENT THE FUNCTION ITSELF
                                // OR IT WILL SUBMIT TWICE!!!!!!!
                                /*********************************************************************/
                                // console.log( '|-------------------------------------|' );
                                // console.log( 'AUDIT >> ', auditTransaction(params, module, method) );
                                auditTransaction( params, module, method );
                                /*********************************************************************/

                                return res.status(500).json(error); 
                            });
                        });
                        
                    })
                    .catch(function(error){
                        console.log( '|-------------------------------------|' );
                        console.log( 'INVENTORY ERROR >> ', error );

                        // audit this failure
                        params.result = response;
                        params.created_date.value = moment(new Date()).toISOString();
                        params.success = 0;

                        console.log( '|-------------------------------------|' );
                        console.log( 'RESPONSE >> ', response );
                        /*********************************************************************/
                        // UNCOMMENT TO LOG TO CONSOLE 
                        // BUT COMMENT THE FUNCTION ITSELF
                        // OR IT WILL SUBMIT TWICE!!!!!!!
                        /*********************************************************************/
                        // console.log( '|-------------------------------------|' );
                        // console.log( 'AUDIT >> ', auditTransaction(params, module, method) );
                        auditTransaction( params, module, method );
                        /*********************************************************************/

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

            console.log( '|-------------------------------------|' );
            console.log( 'RESPONSE >> ', response );
            /*********************************************************************/
            // UNCOMMENT TO LOG TO CONSOLE 
            // BUT COMMENT THE FUNCTION ITSELF
            // OR IT WILL SUBMIT TWICE!!!!!!!
            /*********************************************************************/
            // console.log( '|-------------------------------------|' );
            // console.log( 'AUDIT >> ', auditTransaction(params, module, method) );
            auditTransaction( params, module, method );
            /*********************************************************************/

            return res.status(500).json(error); 
        });
    });
}

module.exports = addWarehouse;