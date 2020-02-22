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

var dDate = moment().format('DD-MM-YYYY'),
	opens_at = null,
	closes_at = null;

var putResources = function(req, res){
    
    // define the module & post data
    var data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        results = [],
        schema = '',
        status,
        sql = '', sql2 = '', 
        key = [],
        values = [], values2 = [], 
        products = [],
        item = {};
    
	console.log( '|-------------------------------------|' );
	console.log( 'UPDATE ' + module );
	console.log( '|-------------------------------------|' );
    console.log( 'PUT DATA >> ', data );
    console.log( '|-------------------------------------|' );
    console.log( 'PUT MODULE >> ', module );
    console.log( '|-------------------------------------|' );
    console.log( 'PUT METHOD >> ', method );
    console.log( '|-------------------------------------|' );
    console.log( 'PUT PARAMS >> ', params );
    console.log( '|-------------------------------------|' );
    console.log( 'UPDATE PRODUCTS' );
    console.log( '|-------------------------------------|' );
    
    
    switch( module ){
        case 'products': 
            
            sql = 'SELECT * FROM public.upd_products(';
            sql += '$1::bigint, $2::bigint, $3::bigint';
            sql += ', $4::character varying, $5::integer';
            sql += ', $6::character varying, $7::character varying';
            sql += ', $8::bigint, $9::integer, $10::integer';
            sql += ', $11::numeric(10,2), $12::integer, $13::integer';
            sql += ', $14::numeric(10,4), $15::numeric(10,2)';
            sql += ', $16::numeric(10,2), $17::numeric(10,2), $18::json';
            sql += ');'

            values = [
                parseInt(params.id) || null,
                parseInt(params.product_id) || null, 
                parseInt(params.manufacturer_id) || null,
                utils.stringCapitalise(params.product.value.toLowerCase()).toString() || null,
                parseInt(params.batch_number.value) || null,
                utils.stringCapitalise(params.batch_name.value.toLowerCase()).toString() || null,
                parseInt(params.upc.value) || null,
                parseInt(params.sku.value) || null,
                parseInt(params.product_type.selected.id) || null,
                parseInt(params.package_type.selected.id) || null,
                parseFloat(params.litres_per_bottle.value) || null,
                parseFloat(params.bottles_per_case.value) || null,
                parseInt(params.bottles_per_sku.value) || null,
                parseFloat(params.litter_rate.value) || '0.00', 
                parseFloat(params.manufacturer_price.value) || null, 
                parseFloat(params.retail_price.value) || null, 
                parseFloat(params.wholesale_price.value) || null, 
                JSON.stringify(params.notes.value) || '{}'
            ];

        break;
        case 'manufacturers': 
            
            sql = 'SELECT * FROM public.upd_manufacturers(';
			sql += '$1::bigint';
			sql += ', $2::bigint';
			sql += ', $3::bigint';
			sql += ', $4::character varying';
			sql += ', $5::bigint';
			sql += ', $6::bigint';
			sql += ', $7::bigint';
			sql += ', $8::bigint';
			sql += ', $9::bigint';
			sql += ', $10::bigint';
			sql += ', $11::character varying';
			sql += ', $12::character varying';
			sql += ', $13::time without time zone';
			sql += ', $14::time without time zone';
			sql += ', $15::json';
			sql += ', $16::json';
			sql += ', $17::boolean';
			sql += ', $18::boolean';
			sql += ') AS id;';
			
			opens_at = moment(params.opens_at.value, 'hh:mm:ss A').format('LLLL');
			closes_at = moment(params.closes_at.value, 'hh:mm:ss A').format('LLLL');
			
			console.log( 'OPENS AT >> ', opens_at );
			console.log( 'CLOSES AT >> ', closes_at );
			
			console.log( 'STREET >> ', params.full_address.street.value.value );
            
            values = [
                parseInt(params.id) || null,
				parseInt(params.store_number.value) || null,
				parseInt(params.license_number.value) || null,
				utils.stringCapitalise(params.manufacturers.value).toString().toLowerCase() || null,
				parseInt(params.establishment_types.selected.id) || null,
				parseInt(params.license_types.selected.id) || null,
				parseInt(params.license_sub_types.selected.id) || null,
				parseInt(params.full_address.city.id) || null,
				parseInt(params.full_address.province.id) || null,
				parseInt(params.full_address.street.id) || null,
				utils.stringCapitalise(params.full_address.street.value).toString().toLowerCase() || null,
				(params.full_address.zipcode.toUpperCase()).toString() || null,
				moment( opens_at ).format('hh:mm:ss A') || '07:00:00 AM',
				moment( closes_at ).format('hh:mm:ss A') || '04:30:00 PM',
				JSON.stringify(params.delivery_days.value) || '{}',
				JSON.stringify(params.notes.value) || '{}',
				new Boolean(params.auto_invoicing.value) || true,
				new Boolean(params.active) || true

            ];
            
        break;
        case 'customers': 
			
			sql = 'SELECT * FROM public.upd_customers(';
			sql += '$1::bigint';
			sql += ', $2::bigint';
			sql += ', $3::character varying';
			sql += ', $4::bigint';
			sql += ', $5::bigint';
			sql += ', $6::bigint';
			sql += ', $7::bigint';
			sql += ', $8::bigint';
			sql += ', $9::character varying';
			sql += ', $10::character varying';
			sql += ', $11::time without time zone';
			sql += ', $12::time without time zone';
			sql += ', $13::json';
			sql += ', $14::json';
			sql += ', $15::boolean';
			sql += ') AS "results"'
			
			opens_at = moment(params.opens_at.value, 'hh:mm:ss A').format('LLLL');
			closes_at = moment(params.closes_at.value, 'hh:mm:ss A').format('LLLL');
			
			console.log( 'OPENS AT >> ', opens_at );
			console.log( 'CLOSES AT >> ', closes_at );
			
			var license_type = 3, 
				customer_type = 1;
			
			params.license_type.selected.id === 0 ? 
				license_type = 3 : 
				license_type = parseInt(params.license_type.selected.id);
			
			params.customer_type.selected.id === 0 ? 
				customer_type = 1 : 
				customer_type = parseInt(params.customer_type.selected.id);
			
			values = [
				parseInt(params.id),
				parseInt(params.license_number.value) || null,
				utils.stringCapitalise(params.customer.value.toLowerCase()).toString() || null,
				parseInt(customer_type) || null,
				parseInt(license_type) || null,
				parseInt(params.full_address.city.id) || 0,
				parseInt(params.full_address.province.id) || 0,
				parseInt(params.full_address.street.id) || 0,
				utils.stringCapitalise(params.full_address.street.value.toLowerCase()).toString() || null,
				(params.full_address.zipcode.toUpperCase()).toString() || null,
				moment( opens_at ).format('HH:mm:ss') || '07:00:00',
				moment( closes_at ).format('HH:mm:ss') || '15:30:00',
				JSON.stringify(params.delivery_days.value) || '{}',
				JSON.stringify(params.notes.value) || '{}',
				new Boolean(params.active) || true
			];
			
        break;
    }

    console.log( '|-------------------------------------|' );
    console.log( 'QUERY >>> ', sql, values );

    db.tx(function(t1){
        // ADD MULTIPLE QUERIES HERE IF REQUIRED
        return this.batch([
            t1.any(sql, values) 
		])
		.then(function(result){
			
			console.log( '|-------------------------------------|' );
			console.log( 'RETURNING RESULT >> ', JSON.stringify(result, null, 2) );
			
			// TEMP HACK TO RETURN FRIENDLY NAME INSTEAD OF OBJECT PK 
			// BETTER TO RETURN THE ENTIRE OBJECT AND PARSE OUT RELEVANT
			// RESPONSE DATA FOR SUCCESS/FAILURE MESSAGING
			var value = null;
			switch(module){
				case 'products': value = utils.stringCapitalise(params.product.value.toLowerCase()).toString(); break;
                case 'customers': value = utils.stringCapitalise(params.customer.value.toLowerCase()).toString(); break;
                case 'manufacturers': value = utils.stringCapitalise(params.manufacturers.value.toLowerCase()).toString(); break;
                case 'locations': value = utils.stringCapitalise(params.location.value.toLowerCase()).toString(); break;
			}
			
			var response = {
				success: true,
				result: value,
				message: 'Successfully edited ' + module + ':\n' + value
			};
			
			return response;
			
		}).catch(function(error){
			
			console.log( '|-------------------------------------|' );
			console.log("ERROR:", error.message || error); // print error;

			var response = { 
				success: false,
				result: error,
				message: 'SERVER ERROR:\n' + error
			};
			return response;
			
		});
		
	}).then(function(response){
		
		console.log( '|-------------------------------------|' );
		console.log( 'RESPONSE >> ', response );
		
		return res.status(200).json(response);
		
	}).catch(function(error){
		
		console.log( '|-------------------------------------|' );
		console.log( 'ERROR >> ', error );
		
		var response = {
			success: false,
			result: error,
			message: 'DATABASE Error:\n' + error
		};
		
		return res.status(200).json(response);
		
	});
}

module.exports = putResources;