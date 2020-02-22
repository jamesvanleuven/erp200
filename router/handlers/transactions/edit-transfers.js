'use strict';

/**
 * Created: 2015-09-25
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 */

// load node_modules
var db = require("../../../database"), 
    moment = require('moment-timezone');

// LOAD MONGODB CONNECTOR
var mongo = require('mongoskin').db( process.env.MONGODB_URI ), 
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID, 
    auditHandler = mongo.collection('transaction'),
    utils = require('../../../router/utils/index.js'),
    querystring = require('querystring');

// GET THIS TRANSFER
function adjustmentSQL(){
    var sql = 'SELECT row_to_json(t) AS "existingTransfer" FROM';
    sql += ' (SELECT * FROM pim_transfers WHERE id = $1 ORDER BY id Desc) t;';
    return sql;
};

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

    for(var i = 0; i < _items.length; i++ ){ 
        _q.push( _items[i].id ); 
    }

    _p = [ _q, _manufacturer, _location ];

    return _p;
};

// BUILD UPDATE INVENTORY SQL
function updSQL(){
    var sql = 'UPDATE pim_inventory SET quantity = $2, on_hold = $3';
    sql += ' WHERE id = $1 RETURNING id;';
    return sql;
};

function insSQL(){
    var sql = 'UPDATE pim_transfers SET ';
    sql += 'user_id=$2, manufacturer_id=$3, from_id=$4, to_id=$5';
    sql += ', products=$6, status_id=$7, delivery_date=$8, type_id=$9, notes=$10';
    sql += ' WHERE id=$1 RETURNING id;';
    return sql;
};

function insPARAMS( params ){
    var values = [
        params.id,
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
    return values;
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

var editTransfers = function(req, res){
    
    // define the module & post data
    var data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        results = [],
        schema = '',
        status,
        sql = '',
        values = [],
        inventory = '',
        inventoryItems = [],
        key = [],
        products = [],
        item = {};
    
    console.log( '|================================|' );
    console.log( '     PUT-ADJUSTMENT.JS            ' );
    console.log( '|================================|' );
    // console.log( 'DATA >> ', data );
    // console.log( '|--------------------------------|' );
    // console.log( 'MODULE >> ', module );
    // console.log( '|--------------------------------|' );
    // console.log( 'METHOD >> ', method );
    // console.log( '|--------------------------------|' );
    console.log( 'PARAMS >> ', params );
    console.log( '|--------------------------------|' );
    console.log( 'OLD ADJUSTMENT >> ', adjustmentSQL(), params.id );
    
    db.tx(function(t){
        return this.batch([
            this.one( adjustmentSQL(), [params.id] )
            , this.any( invSQL(), invPARAMS(params) )
        ])
        .then(function(results){
            /*
            console.log( '|--------------------------------|' );
            console.log( 'ADJUSTMENT RESULT >>', results );
            console.log( '|--------------------------------|' );
            console.log( 'ORIGINAL >> ', results[0].existingTransfer );
            console.log( '|--------------------------------|' );
            console.log( 'NEW LINE-ITEMS >>', params.products.value );
            console.log( '|--------------------------------|' );
            console.log( 'OLD LINE-ITEMS >>', params.oOrderItems );
            */
            
            var inventoryItems = results[1][0].result,
                newItems = params.products.value,
                oldItems = params.oOrderItems,
                diffItems = [],
                thisHold = 0,
                product = 0,
                thisQuantity = 0,
                newInventory = [],
                updPARAMS = [],
                queries = [],
                response = {};
            
            // OLD LINE ITEMS - NEW LINE ITEMS
            for( var i = 0; i < newItems.length; i++ ){
                for( var j = 0; j < oldItems.length; j++ ){
                    if( parseInt(newItems[i].id) === parseInt(oldItems[j].id) ){
                        var newQuantity = parseInt(oldItems[j].quantity) - parseInt(newItems[i].quantity);

                        console.log( '|--------------------------------|' );
                        console.log( 'NEW QUANTITY[' + i + '] >> ', newQuantity );
                        if( newQuantity !== 0 ){
                            
                            diffItems.push(newItems[i]);
                        }
                    }
                }
            }
            
            console.log( '|--------------------------------|' );
            console.log( 'INVENTORY ITEMS >>', inventoryItems );
            console.log( '|--------------------------------|' );
            console.log( 'UPDATE INVENTORY ITEMS >> ', diffItems );
            
            // CHANGE THE PRODUCT INVENTORY QUANTITY AND ON_HOLD QUANTITY
            for( i = 0; i < inventoryItems.length; i++ ){
                for( j = 0; j < diffItems.length; j++ ){
                    if( parseInt(inventoryItems[i].product_id) === parseInt(diffItems[j].id) ){
                        
                        thisHold = parseInt(inventoryItems[i].on_hold);
                        thisQuantity = parseInt(inventoryItems[i].quantity + parseInt(diffItems[j].quantity));
                    
                        console.log( '|--------------------------------|' );
                        console.log( 'THIS INVENTORY >>', inventoryItems[i] );
                        console.log( '|--------------------------------|' );
                        console.log( 'DIFFERENT ITEM >>', diffItems[j] );
                        console.log( '|--------------------------------|' );
                        console.log( 'THIS HOLD >>', thisHold );
                        console.log( '|--------------------------------|' );
                        console.log( 'THIS QUANTITY >>', thisQuantity);

                        updPARAMS = [
                            inventoryItems[i].id,
                            thisQuantity,
                            thisHold
                        ];

                        newInventory.push(updPARAMS);
                        queries.push(t.any(updSQL(), updPARAMS));

                    }
                }
            }
            
            console.log( '|--------------------------------|' );
            console.log( 'NEW INVENTORY >> ', newInventory );
            console.log( '|--------------------------------|' );
            console.log( 'UPDATE INVENTORY >> ', updSQL() );

            console.log( '|-------------------------------------|' );
            console.log( 'QUERY >>> ', insSQL(), insPARAMS(params) );
            
            return db.tx(function(t){
                return this.batch([
                    t.one( insSQL(), insPARAMS(params) )
                    , queries // UPDATE THE INVENTORY
                ])
                .then(function(result){
                    console.log( '|-------------------------------------|' );
                    console.log( 'INSERT RESULTS >>', result );
                    
                        response = {
                            result: result[0],
                            success: true,
                            message: 'SUCCESSFULLY EDITED WAREHOUSE TRANSFER!'
                        };
                    
                    // AUDIT TO MONGODB
                    params.created_date.value = moment(new Date()).toISOString();
                    params.id = result[0].id;
                    params.success = 1;

                    auditTransaction( params, module, method );
                    return res.status(200).json(response);                    
                })
                .catch(function(error){
                    console.log( '|-------------------------------------|' );
                    console.log( 'INSERT ERROR >>', error );
                    
                    response = {
                        results: error,
                        success: false,
                        message: 'Server Error for Transfer Edit.'
                    };

                    params.success = 0; 
                    auditTransaction( params, module, method );
                    return res.status(200).json(response);                    
                });
            });
        })
        .catch(function(error){
            console.log( '|--------------------------------|' );
            console.log( 'ADJUSTMENT ERROR >>', error );
        });
    });
}

module.exports = editTransfers;