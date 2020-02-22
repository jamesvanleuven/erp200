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

// GET INVENTORY SQL
function invSQL(){
    return 'SELECT * FROM public.rtn_inventory_lineitems(ARRAY[$1]::integer[], $2::integer, $3::integer);';
};

/*
// GET INVENTORY PARAMS
function invPARAMS( params, lineItems ){
    var _q = [], _p = [],
        _items = lineItems,
        _manufacturer = params.manufacturer.selected.id,
        _location = params.location.selected.id;
	
    console.log( '|--------------------------------------|' );
    console.log( 'INV-PARAMS FUNCTION' );
    console.log( '|--------------------------------------|' );
    console.log( '_MANUFACTURER >> ', _manufacturer );
    console.log( '_LOCATION >> ', _location );

    for(var i = 0; i < _items.length; i++ ){ 
        _q.push( _items[i].id ); 
    }

    _p = [ _q, _manufacturer, _location ];

    return _p;
};
*/

// BUILD UPDATE INVENTORY SQL
function updSQL(){
    var sql = 'UPDATE pim_inventory SET quantity = $2::integer, on_hold = $3::integer';
    sql += ' WHERE id = $1::bigint RETURNING id AS "result";';
    return sql;
};

function insSQL(){
    var sql = 'UPDATE pim_orders SET';
    sql += ' user_id=$2, customer_id=$3, manufacturer_id=$4, location_id=$5, paid=$6, promo=$7,';
    sql += ' rush=$8, pickup=$9, products=$10, status_id=$11,';
    sql += ' delivery_date=$12, udf_reference=$13, notes=$14';
    sql += ' WHERE id=$1 RETURNING id;';
    return sql;
};

function insPARAMS( params ){
    
    var values = [
        params.order_id.value,
        params.created_by.selected.id,
        params.customer.selected.id,
        params.manufacturer.selected.id,
        params.location.selected.id,
        params.paid.value,
		params.promo.value,
        params.rush.value,
        params.pickup.value,
        JSON.stringify(params.products.value) || '{}',
        params.status.selected.id,
        params.deliver_date.startDate,
        params.order_reference.value || null,
        JSON.stringify(params.notes.value) || '{}'
    ];
    
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

    return auditHandler.insert(transaction, function(err, doc){

        if(err) return err;

        if( doc ){
            return doc;
        }

    });
};

var editOrders = function(req, res){
	
	var self = this,
		data = req.body, 
		module = data.module,
		method = data.method,
		params = data.params, 
		response = {};
	
	var sql = invSQL(), 
		query = utils.inventory(module, params), 
		oldItems = params.oOrderItems,
		newItems = params.products.value;
	
	var inventory = [],
		reset = [], 
		update = [],
		insert = [];
	
	db.task('inventory', t => {
		return t.any(sql, query)
		.then(results => {
			
			var success = true,
				errorItems = [],
				queries = [];
			
			inventory = results[0].result; // REAL-INVENTORY	
			reset = utils.reset(oldItems, inventory); // RESET-INVENTORY
			update = utils.update(reset, inventory); // TEST-INVENTORY
			insert = utils.insert(newItems, update); // UPDATE-INVENTORY
			
			insert.map(function(row){ 
				if( row.success === false ){
					success = false;
					errorItems.push(row);
				}
			}); // SUCCESS TEST
			
			// FAIL
			if( success === false ){
				
				var msg = 'INVENTORY CONFLICT:\n';
				msg += '===================================\n';
				msg += JSON.stringify(errorItems, null, 4) + '\n';
				msg += '===================================\n';
				
				response = {
					result: errorItems,
					success: false,
					message: msg
				};
			}
			// SUCCESS
			else{
				
				db.tx(function(t2){
					
					for(var i = 0; i < insert.length; i++){
						var	insObj = [
							parseInt(insert[i].id),
							parseInt(insert[i].quantity),
							parseInt(insert[i].on_hold)
						];

						queries.push(t2.any(updSQL(), insObj ));
					}
					
					return this.batch([
						t2.one( insSQL(), insPARAMS(params) )
						, queries // UPDATE THE INVENTORY
					])
					.then(function(result){ return result; })
					.catch(function(error){ return error; });
				})
				.then(function(result){
					
					console.log( '|-------------------------------------|' );
					console.log( 'EDIT-ORDERS.INSERT RESULT >> ', result );
					
					response = {
						results: result,
						success: true,
						message: 'SUCCESSFULLY UPDATED ORDER!'
					};
					
				})
				.catch(function(error){
					
					console.log( '|-------------------------------------|' );
					console.log( 'EDIT-ORDERS.INSERT ERROR >> ', error );
					
					var msg = 'EDIT ORDERS ERROR:\n';
					msg += '===================================\n';
					msg += error + '\n';
					msg += '===================================\n';
					
					response = {
						results: error,
						success: false,
						message: msg
					};
					
				});
				
			}
			
			return res.status(200).json(response); 
			

		})
		.catch(error => {
			
			console.log( '|-------------------------------------|' );
			console.log( 'EDIT-ORDERS.SERVER ERROR >> ', error );
			
			var msg = 'DATABASE ERROR:\n';
			msg += '===================================\n';
			msg += error + '\n';
			msg += '===================================\n';
			
			response = {
				result: error,
				success: false,
				message: msg
			};
			
			return res.status(200).json(response);
			
		});
	});

}

module.exports = editOrders;