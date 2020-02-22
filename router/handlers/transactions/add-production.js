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

// BUILD ADJUSTMENT INSERT SQL
function insSQL(){
    var sql = 'INSERT INTO pim_transfers(';
    sql += 'user_id, manufacturer_id, from_id, to_id, products, status_id, delivery_date, type_id, notes, pickup, rush)VALUES(';
    sql += '$1::integer, $2::integer, $3::integer, $4::integer, $5::json, $6::integer,';
    sql += ' $7::timestamp without time zone, $8::integer, $9::json, $10::boolean, $11::boolean) RETURNING id;';
    return sql;
};

// BUILD ADJUSTMENT INSERT PARAMS
function insPARAMS( params ){
    var insPARAMS = [
        params.created_by.selected.id,
        params.manufacturer.selected.id,
        0,
        params.to_warehouse.selected.id,
        JSON.stringify(params.products.value),
        params.status.selected.id,
        moment( new Date(params.deliver_date.startDate) ).toISOString(),
        params.transfer_type.selected.id,
        JSON.stringify(params.notes.value),
		params.pickup.value,
		params.rush.value
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
var addProduction = function(req, res, next){
    var self = this, 
        data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        transferType = params.transfer_type.selected.id,
        manufacturer_id = params.manufacturer.selected.id,
        location_id = params.to_warehouse.selected.id,
        lineItems = params.products.value,
        results = [];

    console.log( '|=====================================|' );
    console.log( '     ADD-PRODUCTION                    ' );
    console.log( '|=====================================|' );
    
    // PRODUCTION 
    // INSERT TRANSFER
    db.task(function(t){
        return t.any(insSQL(), insPARAMS(params))
        .then(function(transfer){

            console.log('INSERT TRANSFER >> ', transfer );

            var response = {
                httpStatus: 200,
                inventory: null,
                result: transfer[0],
                success: true,
                message: 'SUCCESSFULLY INSERTED PRODUCTION TRANSFER!'
            };
            
            params.result = response;
            params.created_date.value = moment(new Date()).toISOString();
            params.success = 1;

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
    
}

module.exports = addProduction;