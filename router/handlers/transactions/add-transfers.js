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
            if( parseInt(result[i].product_id) === _lineItems[j].id ){
                
                console.log( '|-------------------------------------|' );
                console.log( 'THIS-PRODUCT[' + i + '].quantity || on_hold >> ', result[i].quantity, result[i].on_hold );
                console.log( 'THIS-LINE-ITEM[' + i + '].quantity >> ', _lineItems[j].quantity );
                
                if( result[i].quantity < _lineItems[j].quantity ){
                    console.log( '|-------------------------------------|' );
                    console.log( 'ENOUGH INVENTORY: ', false );
                    console.log( '|-------------------------------------|' );
                    failedProducts.push({ inventory: result[i], lineItem : _lineItems[j] });
                }

                if( failedProducts.length > 0 ){
                    newInventory.success = false;
                    newInventory.items = failedProducts;
                }
                else{
                    console.log( '|-------------------------------------|' );
                    console.log( 'ENOUGH INVENTORY: ', true );
                    console.log( '|-------------------------------------|' );
                    
                    thisQuantity = result[i].quantity - _lineItems[j].quantity;
                    thisHold = result[i].on_hold + _lineItems[j].quantity;

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
    
    console.log( '|-------------------------------------|' );
    console.log( 'NEW-INVENTORY >> ', newInventory );
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
        moment( new Date(params.deliver_date.value) ).toISOString(),
        params.transfer_type.selected.id,
        JSON.stringify(params.notes.value)
    ];
    return insPARAMS;
};

// INSERT MONGODB AUDIT DOCUMENT
function auditTransaction( transaction, module, method ){
    transaction.method = method;
    transaction.module = module;

    return auditHandler.insert(transaction, function(err, doc){

        if(err) return err;

        if( doc ){
            return doc;
        }

    });
};

// PROCESS THE TRANSFER
var addTransfers = function(req, res, next){
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
    console.log( '     ADD-WAREHOUSE-TO-WAREHOUSE        ' );
    console.log( '|=====================================|' );
    
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
                _location = params.from_warehouse.selected.id;
            /*
            for( var i = 0; i < lineItems.length; i++ ){
                for( var j = 0; j < inventoryItems.length; j++ ){
                    if( parseInt(lineItems[i].id) === parseInt(inventoryItems[j].product_id) ){
                        var diffAmount = parseInt(inventoryItems[j].quantity) + parseInt(lineItems[i].quantity);          
                        
                        if( diffAmount < 0 ){
                            failedProducts.push( lineItems[i] );
                        }
                        else{

                            parseInt(lineItems[i].quantity) < 0 ? 
                                thisHold = ~lineItems[i].quantity+1 : 
                                thisHold = lineItems[i].quantity;

                            thisHold = parseInt(thisHold) + parseInt(inventoryItems[j].on_hold);
                            thisQuantity = parseInt(inventoryItems[j].quantity) - parseInt(thisHold);

                            var updPARAMS = [
                                manufacturer_id,
                                params.from_warehouse.selected.id,
                                parseInt(lineItems[i].id),
                                thisQuantity,
                                thisHold
                            ];

                            newInventory.push(updPARAMS);
                            // queries.push(t.any(updSQL() , updPARAMS)); 
                        }
                    }
                }
            }
            */
            
            // var updINVENTORY = updPARAMS(inventory, _lineItems, _manufacturer, _location);
            
            console.log( '|--------------------------------------|' );
            console.log( 'INVENTORY >> ', inventory );
            console.log( '|--------------------------------------|' );
            console.log( '_MANUFACTURER >> ', _manufacturer );
            console.log( '|--------------------------------------|' );
            console.log( '_LOCATION >> ', _location );
            console.log( '|--------------------------------------|' );
            console.log( '_LINE-ITEMS >> ', _lineItems );
            // console.log( 'NEW-INVENTORY >> ', newInventory );
            // console.log( 'NEW-INVETORY FUNCTION >> ', updINVENTORY );
            
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

                            parseInt(lineItems[i].quantity) < 0 ? 
                                thisHold = ~lineItems[i].quantity+1 : 
                                thisHold = lineItems[i].quantity;

                            thisHold = parseInt(thisHold) + parseInt(inventoryItems[j].on_hold);
                            thisQuantity = parseInt(inventoryItems[j].quantity) - parseInt(thisHold);

                            var updPARAMS = [
                                manufacturer_id,
                                params.from_warehouse.selected.id,
                                parseInt(lineItems[i].id),
                                thisQuantity,
                                thisHold
                            ];

                            newInventory.push(updPARAMS);
                            queries.push(t.any(updSQL() , updPARAMS)); 
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
                            message: 'SUCCESSFULLY INSERTED WAREHOUSE TRANSFER!'
                        };
                    
                    // AUDIT TO MONGODB
                    params.created_date.value = moment(new Date()).toISOString();
                    // params.deliver_date.value = moment(new Date(params.deliver_date.value)).toISOString();
                    params.id = result[0].id;
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
                return res.status(200).json(response);
            }
            
        })
        .catch(function(error){
            console.log( 'ERROR >>', error );
        });
    });
    */
}

module.exports = addTransfers;