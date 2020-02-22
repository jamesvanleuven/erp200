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

function insSQL(){
    var sql = 'UPDATE pim_transfers SET ';
    sql += 'user_id=$2, manufacturer_id=$3, from_id=$4, to_id=$5';
    sql += ', products=$6, status_id=$7, delivery_date=$8, type_id=$9, notes=$10';
	sql += ', pickup=$11, rush=$12'
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
        moment( new Date(params.deliver_date.startDate) ).toISOString(),
        params.transfer_type.selected.id,
        JSON.stringify(params.notes.value),
		params.pickup.value,
		params.rush.value
    ];
    
    console.log( '|-------------------------------------|' );
    console.log( 'INS-PARAMS[PARAMS] >> ', values );
    
    return values;
};

/**
 * ADD AUDIT FUNCTION
 */
function auditTransaction( doc, module, method ){
    
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

var editProduction = function(req, res){
    
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
    console.log( '     EDIT-PRODUCTION.JS           ' );
    console.log( '|================================|' );
    console.log( 'PARAMS >> ', params );

    db.tx(function(t){
        return this.batch([
            t.any( insSQL(), insPARAMS(params) )
        ])
        .then(function(result){
            console.log( '|-------------------------------------|' );
            console.log( 'INSERT RESULTS >>', result );

                var response = {
                    result: result[0],
                    success: true,
                    message: 'SUCCESSFULLY EDITED PRODUCTION TRANSFER!'
                };

            // AUDIT TO MONGODB
            params.created_date.value = moment(new Date()).toISOString();
            params.id = result[0][0].id;
            params.success = 1;
            
            console.log( '|-------------------------------------|' );
            console.log( 'INSERT PARAMS >> ', params );

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
}

module.exports = editProduction;