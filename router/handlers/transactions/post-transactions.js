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

var postTransactions = function(req, res){
    
    // SEPARATE ORDERS FROM TRANSFERS
     var data = req.body, 
         addWarehouse = require('./add-warehouse'),
         addAdjustment = require('./add-adjustment'),
         addProduction = require('./add-production'),
         addOrders = require('./add-orders');
	
	console.log( '|-------------------------------------|' );
	console.log( 'MODULE >> ', data.module );
    
    switch(data.module){
        case 'transfers':
            var transferType = parseInt(data.params.transfer_type.selected.id);
            console.log( '|-------------------------------------|' );
            console.log( 'TRANSFER TYPE >> ', transferType );
            switch(transferType){
                case 1: return addWarehouse(req, res); break;
                case 2: return addProduction(req, res); break;
                case 3: return addAdjustment(req, res); break;
            }
            // return addTransfers(req, res); break;
        break;
        case 'orders': return addOrders(req, res); break;
    }
    
}

module.exports = postTransactions;