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
        _location = 0;

    switch(_transferType){
        case 1: _location = params.to_warehouse.selected.id; break;
        case 2: _location = params.from_warehouse.selected.id; break;
        case 3: _location = params.from_warehouse.selected.id; break;
    }
    
    console.log( '|--------------------------------------|' );
    console.log( 'INV-PARAMS FUNCTION' );
    console.log( '|--------------------------------------|' );
    console.log( '_MANUFACTURER >> ', _manufacturer );
    console.log( '_TRANSFER-TYPE >> ', _transferType );
    console.log( '_LOCATION >> ', _location );

    for(var i = 0; i < _items.length; i++ ){ 
        _q.push( _items[i].id ); 
    }

    _p = [ _q, _manufacturer, _location ];
    
    console.log( '_PARAMS ARRAY >> ', _p );

    return _p;
};

// BUILD UPDATE INVENTORY SQL
function updSQL(){
    var sql = 'UPDATE pim_inventory SET quantity = $4, on_hold = $5';
    sql += ' WHERE manufacturer_id = $1 AND location_id = $2';
    sql += ' AND product_id = $3 RETURNING id;';
    return sql;
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
        params.from_warehouse.selected.id,
        JSON.stringify(params.products.value),
        params.status.selected.id,
        moment( new Date() ).toISOString(),
        params.transfer_type.selected.id,
        JSON.stringify(params.notes.value)
    ];
    return insPARAMS;
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

// PROCESS THE TRANSFER
var addAdjustment = function(req, res, next){
    var self = this, 
        data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        transferType = params.transfer_type.selected.id,
        manufacturer_id = params.manufacturer.selected.id,
        location_id = params.from_warehouse.selected.id,
        lineItems = params.products.value,
        results = [];
    
    console.log( '|=====================================|' );
    console.log( '     ADD-ADJUSTMENT.JS                 ' );
    console.log( '|=====================================|' );
    
    // RETURN EXISTING INVENTORY FOR TRANSFER LINE-ITEMS
    // ADJUSTMENT
    db.task(function(t){
        return t.any(invSQL(), invPARAMS(params))
        .then(function(inventory){
            
            console.log( '|--------------------------------------|' );
            console.log( 'INVENTORY >> ', inventory[0] );
            
            var inventoryItems = inventory[0].result,
                thisQuantity = 0,
                thisHold = 0,
                newInventory = [],
                updPARAMS = [],
                queries = [],
                response = {};
            
            for( var i = 0; i < lineItems.length; i++ ){
                
                console.log( '|--------------------------------------|' );
                console.log( 'LINE-ITEMS[' + i + '] >> ', lineItems[i] );
                
                for( var j = 0; j < inventoryItems.length; j++ ){
                    
                    console.log( '|--------------------------------------|' );
                    console.log( 'INVENTORY-ITEMS[' + j + '] >> ', inventoryItems[j] );
                    
                    if( parseInt(lineItems[i].id) === parseInt(inventoryItems[j].product_id) ){
                        
                        thisQuantity = parseInt(inventoryItems[j].quantity, 10) + parseInt(lineItems[i].quantity, 10);
                        thisHold = parseInt(inventoryItems[j].on_hold);
                        // INVENTORY CANNOT BE LESS THAN ZERO
                        parseInt(thisQuantity, 10) < 0 ? thisQuantity = 0 : null;
                        
                        updPARAMS = [
                            manufacturer_id,
                            location_id,
                            parseInt(lineItems[i].id),
                            thisQuantity,
                            thisHold
                        ];
                        
                        console.log( '|--------------------------------------|' );
                        console.log( 'UPD-PARAMS >> ', thisQuantity, thisHold, updPARAMS );
                        
                        newInventory.push(updPARAMS);
                        queries.push(t.any(updSQL(), updPARAMS));
                        
                    }
                    
                }
            }
            
            // UPDATE INVENTORY FOR ADJUSTMENT
            return db.tx(function(t){
                return this.batch([
                    t.one( insSQL(), insPARAMS(params) )
                    , queries // UPDATE THE INVENTORY
                ])
                .then(function(adjustment){
                    console.log( '|--------------------------------------|' );
                    console.log( 'ADJUSTMENT >> ', JSON.stringify(adjustment) );
                    
                    response = {
                        result: adjustment[0],
                        success: true,
                        message: 'SUCCESSFULLY INSERTED MANUAL ADJUSTMENT!'
                    };
                    
                    // AUDIT TO MONGODB
                    params.created_date.value = moment(new Date()).toISOString();
                    params.deliver_date.value = moment(new Date(params.deliver_date.value)).toISOString();
                    params.id = adjustment[0].id;
                    params.success = 1;

                    auditTransaction( params, module, method );
                    return res.status(200).json(response);
                })
                .catch(function(error){
                    console.log( '|--------------------------------------|' );
                    console.log( 'ERROR >> ', error );
                    
                    response = {
                        result: error,
                        success: false,
                        message: 'THERE WAS AN ERROR WITH YOUR MANUAL ADJUSTMENT!'
                    };
                    
                    // AUDIT TO MONGODB
                    params.created_date.value = moment(new Date()).toISOString();
                    params.deliver_date.value = moment(new Date(params.deliver_date.value)).toISOString();
                    params.id = result[0].id;
                    params.success = 0;

                    auditTransaction( params, module, method );
                    return res.status(200).json(response);
                });
            })
            .then(function(results){
                console.log( '|--------------------------------------|' );
                console.log( 'RESULTS >> ', results );
            })
            .catch(function(error){
                console.log( '|--------------------------------------|' );
                console.log( 'ERROR >> ', error );
            });
            
        });
    });
    
    /*
    db.task(function(t){
        return t.any(invSQL(), invPARAMS(params))
        .then(function(inventory){
            
            var inventoryItems = inventory[0].result, 
                failedProducts = [],
                thisHold = 0,
                product = 0,
                thisQuantity = 0,
                newInventory = [],
                updPARAMS = [],
                queries = [],
                response = {};
            
            for( var i = 0; i < lineItems.length; i++ ){
                for( var j = 0; j < inventoryItems.length; j++ ){
                    if( parseInt(lineItems[i].id) === parseInt(inventoryItems[j].product_id) ){
                        var diffAmount = parseInt(inventoryItems[j].quantity) + parseInt(lineItems[i].quantity);
                        
                        if( diffAmount < 0 ){
                            failedProducts.push( lineItems[i] );
                        }
                        else{
                            thisHold = parseInt(inventoryItems[j].on_hold);
                            thisQuantity = diffAmount;

                            updPARAMS = [
                                manufacturer_id,
                                location_id,
                                parseInt(lineItems[i].id),
                                thisQuantity,
                                thisHold
                            ];

                            newInventory.push(updPARAMS);
                            queries.push(t.any(updSQL(), updPARAMS));
                        }
                    }
                }
            }
            
            if( failedProducts.length === 0 ){
                return db.tx(function(t){
                    return this.batch([
                        t.one( insSQL(), insPARAMS(params) )
                        , queries // UPDATE THE INVENTORY
                    ])
                    .then(function(result){
                        
                        response = {
                            result: result[0],
                            success: true,
                            message: 'SUCCESSFULLY INSERTED MANUAL ADJUSTMENT!'
                        };
                    
                    // AUDIT TO MONGODB
                    params.created_date.value = moment(new Date()).toISOString();
                    params.deliver_date.value = moment(new Date(params.deliver_date.value)).toISOString();
                    params.id = result[0].id;
                    params.success = 1;

                    auditTransaction( params, module, method );
                    return res.status(200).json(response);
                        
                    })
                    .catch(function(error){
                        console.log( 'INSERT ERROR >>', error);
                    });
                });
            }
            else{
                response = {
                    results: failedProducts,
                    success: false,
                    message: 'Insufficient Inventory for Transfer Request on:'
                };
                
                params.success = 0; 
                auditTransaction( params, module, method );
                return res.status(200).json(response);
            }
            
        })
        .catch(function(error){
            console.log( 'ERROR >>', error );
        });
    });
    */
}

module.exports = addAdjustment;