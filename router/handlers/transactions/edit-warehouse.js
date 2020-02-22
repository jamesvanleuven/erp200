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
    var sql = 'SELECT * FROM public.rtn_inventory_lineitems(ARRAY[$1]::integer[], $2::integer, $3::integer)';
    sql += ' AS "inventoryList";';
    return sql;
};

// UPDATE INVENTORY
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
    
    console.log( '|-------------------------------------|' );
    console.log( 'INS-PARAMS.PARAMS >> ', params );
    
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
        JSON.stringify(params.notes.value)
    ];
    
    console.log( '|-------------------------------------|' );
    console.log( 'INS-PARAMS[PARAMS] >> ', values );
    
    return values;
};

// GET INVENTORY PARAMS
function invPARAMS( params, lineItems ){
    var _q = [], _p = [],
        _items = lineItems,
        _manufacturer = params.manufacturer.selected.id,
        _transferType = params.transfer_type.selected.id,
        _location = params.from_warehouse.selected.id;

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

// ADD AUDIT FUNCTION
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

var editWarehouse = function(req, res){
	
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
			
			console.log( '|------------------------------|' );
			console.log( 'EDIT-WAREHOUSE.INVENTORY >> ', inventory );
			console.log( 'EDIT-WAREHOUSE.RESET >> ', reset );
			console.log( 'EDIT-WAREHOUSE.UPDATE >> ', update );
			console.log( 'EDIT-WAREHOUSE.INSERT >> ', insert );
			
			insert.map(function(row){ 
				if( row.success === false ){
					success = false;
					errorItems.push(row);
				}
			}); // SUCCESS TEST
			
			console.log( 'EDIT-WAREHOUSE.SUCCESS >> ', success );
			console.log( 'EDIT-WAREHOUSE.ERROR-ITEMS >> ', errorItems );
			
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
    
	/*
    // RETURN INVENTORY
    db.tx(function(t){
        
        // define the module & post data
        var data = req.body,
            module = data.module,
            method = data.method,
            editParams = data.params,
            transferType = editParams.transfer_type.selected.id,
            manufacturer_id = editParams.manufacturer.selected.id,
            location_id = editParams.from_warehouse.selected.id,
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
        console.log( '     EDIT-WAREHOUSE.JS           ' );
        console.log( '|================================|' );

        // 1: COMPARE OLD LINE-ITEMS TO NEW-LINE-ITEMS
        var prev = editParams.oOrderItems,
            curr = editParams.products.value;
		
		console.log( 'PRODUCTS >> ', curr );
		console.log( '|--------------------------------|' );
		console.log( 'OLD-PRODUCTS >> ', prev );

        // COMPARE OLD-ITEMS TO NEW-ITEMS
        var orphaned = prev.filter(function(p){
            return curr.filter(function(c){
				
				console.log( '|--------------------------------|' );
				console.log( 'ORPHANED >> ', p, c );
				
                return c.id === p.id;
            }).length == 0;
        });
        // COMPARE NEW-ITEMS TO OLD-ITEMS
        var inserted = curr.filter(function(c){
            return prev.filter(function(p){
				
				console.log( '|--------------------------------|' );
				console.log('INSERTED >> ', p, c );
				
                return p.id === c.id;
            }).length == 0;
        });
        // COMPARE MATCHED ITEM QUANTITES
        var updated = prev.filter(function(p){
            return curr.filter(function(c){
				
				console.log( '|--------------------------------|' );
				console.log( 'UPDATED >> ', p, c );
				
                return c.id === p.id && parseInt(c.quantity) !== parseInt(p.quantity);
            }).length > 0;
        });


        console.log( '|-------------------------------------|' );
        console.log( 'ORPHANED >> ', orphaned.length, orphaned );
        console.log( 'ORPHANED ITEMS >> ', invPARAMS(editParams, orphaned) );
        console.log( 'ORPHANED SQL >> ', invSQL('orphaned') );

        console.log( '|-------------------------------------|' );
        console.log( 'INSERTED >> ', inserted.length, inserted );
        console.log( 'INSERTED ITEMS >> ', invPARAMS(editParams, inserted) );
        console.log( 'NEW SQL >> ', invSQL('inserted') );

        console.log( '|-------------------------------------|' );
        console.log( 'EXISTING >> ', updated.length, updated );
        console.log( 'EXISTING ITEMS >> ', invPARAMS(editParams, updated) );
        console.log( 'EXISTING SQL >> ', invSQL('updated') );

        var products = [];

        orphaned.length > 0 ? products.push.apply( products, invPARAMS(editParams, orphaned)[0] ) : null;
        inserted.length > 0 ? products.push.apply( products, invPARAMS(editParams, inserted)[0] ) : null;
        updated.length > 0 ? products.push.apply( products, invPARAMS(editParams, updated)[0] ) : null;
		
		// NO LINE-ITEM EDITS OCCURRING
		if( products.length === 0 ){
			
            t.any( insSQL(), insPARAMS(editParams) );
            
			var response = {
				result: inventory,
				success: true,
				message: 'SUCCESSFULLY EDITED PRODUCTION TRANSFER!'
			};

			// AUDIT TO MONGODB
			editParams.success = 1;

			console.log( '|-------------------------------------|' );
			console.log( 'INSERT PARAMS >> ', editParams );

			auditTransaction( editParams, module, method );
			return res.status(200).json(response);    
		}
		// LINE-ITEMS EDITS OCCURING
		else{
			
			var params = [
				products, 
				manufacturer_id,
				location_id
			];

			console.log( '|-------------------------------------|' );
			console.log( ' PARAMS >> ', params );
			
			return t.any( invSQL(), params )
			.then(function(results){
				console.log( '|-------------------------------------|' );
				console.log( 'INVENTORY RESULT >> ', results[0].result );

				var inventory = results[0].result,
					queries = [];

				for( var i = 0; i < inventory.length; i++ ){
					var pid = parseInt(inventory[i].product_id),
						invQuantity = parseInt(inventory[i].quantity),
						invOnHold = parseInt(inventory[i].on_hold);

					// ORPHANED ITEM QUANTITIES
					for( var j = 0; j < orphaned.length; j++ ){

						if( parseInt(orphaned[j].id) === parseInt(pid) ){
							var orphanQuantity = parseInt(invQuantity) + parseInt(orphaned[j].quantity), 
								orphanOnHold = parseInt(invOnHold) - parseInt(orphaned[j].quantity);

							( parseInt(orphanOnHold) < 0 ) ? orphanOnHold = 0 : null;
							( parseInt(invQuantity) < 0 ) ? orphanQuantity = parseInt(orphaned[j].quantity) : null;
							
							( orphanOnHold < 0 ) ? orphanOnHold = 0 : null;
							( orphanQuantity < 0 ) ? orphanQuantity = 0 : null;

							var updOrphan = [
								inventory[i].id,
								orphanQuantity,
								orphanOnHold
							];

							console.log( '|-------------------------------------|' );
							console.log( 'ORPHANED >>', orphaned[j].quantity, invQuantity, orphanQuantity );
							console.log( 'UPD-ORPHAN >> ', updOrphan );

							queries.push(t.any(updSQL(), updOrphan));
						}
					}

					// INSERTED ITEM QUANTITIES
					for( var n = 0; n < inserted.length; n++ ){

						if( parseInt(inserted[n].id) === parseInt(pid) ){
							var insQuantity = parseInt(invQuantity) - parseInt(inserted[n].quantity),
								insOnHold = parseInt(inserted[n].quantity) + parseInt(invOnHold);
							
							parseInt(insOnHold) < 0 ? insOnHold = 0 + insOnHold : null;

							 var updInsert = [
								inventory[i].id,
								insQuantity,
								insOnHold
							];

							console.log( '|-------------------------------------|' );
							console.log( 'UPD-INSERT >> ', inserted[n].quantity, invQuantity, insQuantity );

							queries.push(t.any(updSQL(), updInsert));
						}
					}

					// CURRENT ITEM QUANTITIES
					for( var x = 0; x < updated.length; x++ ){
						var prevId = parseInt(updated[x].id),
							prevQty = parseInt(updated[x].quantity);

						for( var p = 0; p < curr.length; p++ ){
							var currId = parseInt(curr[p].id),
								currQty = parseInt(curr[p].quantity);

							if( prevId === currId && prevQty !== currQty ){

								console.log( '|-------------------------------------|' );
								console.log( 'PREV-ID | PREV-QTY >> ', prevId, prevQty );
								console.log( 'CURR-ID | CURR-QTY >> ', currId, currQty );

								var diffQty = parseInt(currQty) - parseInt(prevQty),
									updQuantity = parseInt(invQuantity) - parseInt(diffQty),
									updOnHold = parseInt(invOnHold) + parseInt(diffQty);
								
								updQuantity < 0 ? updQuantity = 0 : null;
								updOnHold < 0 ? updOnHold = 0 : null;

								var updUpdate = [
									inventory[i].id,
									updQuantity,
									updOnHold
								];

								console.log( '|-------------------------------------|' );
								console.log( 'UPD-EXISTING >> ', updUpdate, prevQty, currQty, diffQty );

								queries.push(t.any(updSQL(), updUpdate));
							}
						}
					}

				}

				t.any( insSQL(), insPARAMS(editParams) );

				var response = {
					result: inventory,
					success: true,
					message: 'SUCCESSFULLY EDITED PRODUCTION TRANSFER!'
				};

				// AUDIT TO MONGODB
				editParams.success = 1;

				console.log( '|-------------------------------------|' );
				console.log( 'INSERT PARAMS >> ', editParams );

				auditTransaction( editParams, module, method );
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

				editParams.success = 0; 
				auditTransaction( editParams, module, method );
				return res.status(200).json(response);    
			});
			
		}

    });
	*/

}

module.exports = editWarehouse;