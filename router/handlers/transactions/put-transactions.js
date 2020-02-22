'use strict';

/**
 * Created: 2015-09-25
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 */

// load node_modules
var db = require("../../../database"), 
    moment = require('moment-timezone');

var putTransactions = function(req, res){
    
    // SEPARATE ORDERS FROM TRANSFERS
     var data = req.body, 
         editWarehouse = require('./edit-warehouse'), 
         editAdjustment = require('./edit-adjustment'),
         editProductions = require('./edit-production'),
		 editOrders = require('./edit-orders');
    
    switch(data.module){
        case 'transfers':
            var transferType = parseInt(data.params.transfer_type.selected.id);
            console.log( '|-------------------------------------|' );
            console.log( 'TRANSFER TYPE >> ', transferType );
            switch(transferType){
                case 1: return editWarehouse(req, res); break;
                case 2: return editProductions(req, res); break;
                case 3: return editAdjustment(req, res); break;
            }
            // return addTransfers(req, res); break;
        break;
        case 'orders': return editOrders(req, res); break;
    }
}

module.exports = putTransactions;