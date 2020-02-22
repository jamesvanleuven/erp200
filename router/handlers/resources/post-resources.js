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

var dDate = moment().format('MM-DD-YYYY'),
	opens_at = null,
	closes_at = null;

var insSQL = {
	
	products: function(sql) {

		sql += '$1::bigint';
		sql += ', $2::bigint';
		sql += ', $3::character varying';
		sql += ', $4::character varying';
		sql += ', $5::numeric(10,2)';
		sql += ', $6::integer';
		sql += ', $7::integer';
		sql += ', $8::numeric(10,4)';
		sql += ', $9::numeric(10,2)';
		sql += ', $10::numeric(10,2)';
		sql += ', $11::numeric(10,2)';
		sql += ', $12::integer';
		sql += ', $13::integer';
		sql += ', $14::json';
		sql += ');';

		return sql;
    },

    manufacturers: function(sql) {

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
		sql += ', $16::boolean';
        sql += ') AS id;';

        return sql;
    },

    customers: function(sql) {

        sql += '$1::bigint';
		sql += ', $2::character varying';
		sql += ', $3::bigint';
		sql += ', $4::bigint';
		sql += ', $5::bigint';
		sql += ', $6::bigint';
        sql += ', $7::bigint';
		sql += ', $7::character varying';
		sql += ', $9::character varying';
		sql += ', $10::time without time zone';
		sql += ', $11::time without time zone';
		sql += ', $12::json';
		sql += ', $13::json';
		sql += ', $14::boolean';
        sql += ') AS id;';

        return sql;
    }
};


var insVALS = {
    
    products: function(params) {
        
        !params.litter_rate ? params.ltter_rate = params.deposit : null;
		
        return [
			parseInt(params.manufacturer.value) || null,
			parseInt(params.sku.value) || null,
			params.upc.value || null,
			params.product.value || null,
			parseFloat(params.litres_per_bottle.value) || null,
			parseInt(params.bottles_per_sku.value) || null,
			parseInt(params.bottles_per_case.value) || null,
			parseFloat(params.litter_rate.value) || null,
			parseFloat(params.manufacturer_price.value) || null,
			parseFloat(params.retail_price.value) || null,
			parseFloat(params.wholesale_price.value) || null,
			parseInt(params.product_type.selected.id) || null,
			parseInt(params.package_type.selected.id) || null,
			JSON.stringify(params.notes.value) || '{}'
        ];
    },

    manufacturers: function(params) {
		
		opens_at = moment(params.opens_at.value, 'hh:mm:ss A').format('LLLL').toString();
		closes_at = moment(params.closes_at.value, 'hh:mm:ss A').format('LLLL').toString();
		
		parseInt(params.establishment_types.selected.id) === 0 ? params.establishment_types.selected.id = 2 : null;
		parseInt(params.license_types.selected.id) === 0 ? params.establishment_types.selected.id = 8 : null;
		parseInt(params.license_sub_types.selected.id) === 0 ? params.establishment_types.selected.id = 9 : null;
        
        utils.toType(params.full_address.street.value) === 'null' ? 
            utils.toType(params.address.value) !== 'null' ? 
                params.full_address.street.value = params.address.value : 
                null : null;
		
        return [
            
            parseInt(params.store_number.value) || null,
            parseInt(params.license_number.value) || null,
            utils.stringCapitalise(params.manufacturers.value).toString().toLowerCase() || null,
            parseInt(params.establishment_types.selected.id) || 2,
            parseInt(params.license_types.selected.id) || 8,
			parseInt(params.license_sub_types.selected.id) || 9,
            parseInt(params.full_address.province.id) || null,
            parseInt(params.full_address.city.id) || null,
            utils.stringCapitalise(params.full_address.street.value.toLowerCase()).toString() || null,
            (params.full_address.zipcode).toString().toUpperCase() || null,
			moment( opens_at.value ).format('hh:mm:ss A') || '07:00:00 AM',
			moment( closes_at.value ).format('hh:mm:ss A') || '04:30:00 PM',
            JSON.stringify(params.delivery_days.value) || '{}',
            JSON.stringify(params.notes.value) || '{}',
			new Boolean(params.auto_invoicing.value) || true,
            true

        ];
    },

    customers: function(params) {
        
        params.establishment_types = {
            selected: { id: 4, value: 'caterer' }
        };
		
		opens_at = moment(params.opens_at.value, 'hh:mm:ss A').format('LLLL').toString();
		closes_at = moment(params.closes_at.value, 'hh:mm:ss A').format('LLLL').toString();
		
		params.license_type.selected.id === 0 ? params.license_type.selected.id = 3 : null;
		params.customer_type.selected.id === 0 ? params.customer_type.selected.id = 1 : null;
        
        utils.toType(params.full_address.street.value) === 'null' ? 
            params.full_address.street.value = params.address.value : 
            null;
        
        console.log( '|---------------------------|' );
        console.log( 'INS-VAL.CUSTOMERS.PARAMS >> ', params );
		
        /*
            1: _license_number bigint
            2: _customers character varying
            3: _customer_type bigint
            4: _license_type bigint
            5: _municipalities bigint
            6: _provinces bigint
            7: _street character varying
            8: _zipcode character varying
            9: _opens time without time zone
            10: _closes time without time zone
            11: _delivery_days json
            12: _notes json
            13: _active boolean
        */
        
        return [
            
            parseInt(params.license_number.value) || null,
            utils.stringCapitalise(params.customer.value.toLowerCase()).toString() || null,
            parseInt(params.establishment_types.selected.id) || 4,
			parseInt(params.customer_type.selected.id) || 1,
            parseInt(params.license_type.selected.id) || 3,
            parseInt(params.full_address.city.id) || null,
            parseInt(params.full_address.province.id) || null,
            utils.stringCapitalise(params.address.value) || null,
            (params.full_address.zipcode).toString().toUpperCase() || null,
			moment( opens_at ).format('hh:mm:ss A') || '07:00:00 AM',
			moment( closes_at ).format('hh:mm:ss A') || '04:30:00 PM',
            JSON.stringify(params.delivery_days.value) || '{}',
            JSON.stringify(params.notes.value) || '{}',
            true
            
        ];
    }
    
};

var postResources = function(req, res){

    // define the module & post data
    var header = req.headers,
        host = header.host,
        method = req.method,
        request = header['x-requested-with'],
        token = header.authorization.replace('Bearer ', ''),
        data = req.body,
        module = data.module,
        method = data.method,
        params = data.params,
        results = [],
        schema = '',
        status,
        sql = '',
        sql2 = '',
        key = [],
        values = [],
        values2 = [],
        products = [],
        item = {},
        deliveryDays = [];

    console.log( '|=====================================|' );
    console.log( 'POST HEADER >> ', header );
    console.log( '|-------------------------------------|' );
    console.log( 'POST MODULE >> ', module );
    console.log( '|-------------------------------------|' );
    console.log( 'POST METHOD >> ', method );
    console.log( '|-------------------------------------|' );
    console.log( 'POST PARAMS >> ', params, params.length, typeof(params) );

	
    sql += 'SELECT * FROM public.ins_' + module + '(';

    var queries = [];	

    db.tx(function(t){  
        
        console.log( '|-------------------------------------|' );
        console.log( 'IS ARRAY >> ', utils.toType(params) );
        
        switch( utils.toType(params) ){
            case 'array': 
                
                /**
                 * REWRITE THIS FOR IMPORTS SO IT RESEMBLES
                 * SQL, [ 0,1,2,3,4 ] where each ordinal 
                 * represent the value params
                 */
                
                for (var i = 0; i < params.length; i++ ) {
                    queries.push( t.any( insSQL[module](sql), insVALS[module](params[i]) ) );
                }
                
            break;
            case 'object': 
                
                queries = [t.any(
                  insSQL[module](sql),
                  insVALS[module](params)
                )];
                
            break;
        }


        /*
        if (params instanceof Array) {
            for (var i in params) {
                queries.push(t.any(
                  insSQL[module](sql),
                  insVALS[module](params[i])
                ));
            }
        } else {
            queries = [t.any(
              insSQL[module](sql),
              insVALS[module](params)
            )];
        }
        */
		
		console.log( '|-------------------------------------|' );
		console.log( 'INSERT-SQL >> ', insSQL );
		console.log( '|-------------------------------------|' );
		console.log( 'INSERT-VALUES >> ', insVALS );
		console.log( '|-------------------------------------|' );
		console.log( 'QUERIES >> ', JSON.stringify(queries, null, 4) );

        return this.batch(queries).then(function(results){
			
			console.log( '|-------------------------------------|' );
			console.log( 'RESOURCE INSERT RESULTS >> ', results );
            // console.log( 'RESOURCE INSERT RESULTS >> ', results[0][0].results );
			
			var // serverResults = results[0][0].results, 
                rtn = [];
            for(var i in results ){
				rtn.push( results[i] );
			}
			
			// TEMP HACK TO RETURN FRIENDLY NAME INSTEAD OF OBJECT PK 
			// BETTER TO RETURN THE ENTIRE OBJECT AND PARSE OUT RELEVANT
			// RESPONSE DATA FOR SUCCESS/FAILURE MESSAGING
			var value = null;
            
			switch(module){
				case 'products': value = utils.stringCapitalise(params.product.value.toLowerCase()).toString(); break;
                case 'customers': value = utils.stringCapitalise(params.customer.value.toLowerCase()).toString(); break;
                case 'manufacturers': value = utils.stringCapitalise(params.manufacturers.value.toLowerCase()).toString(); break;
			}
			
			var response = {
				success: true,
				message: 'Successfully inserted ' + module + ' Item: \n' + value,
				result: rtn
			};
			
			return response;
			
		})
		.catch(function(error){
			
			console.log( '|-------------------------------------|' );
			console.log( 'RESOURCE INSERT ERROR >> ', error );
			
			var response = {
				success: false,
				message: 'ERROR OCCURRED: ' + error,
				result: error
			};
			
			return response;
			
		});

    }).then(function(result){

		console.log( '|-------------------------------------|' );
        console.log( 'RETURNING RESULT >> ', result );
		
        return res.status(200).json(result);

    }).catch(function(error){

		console.log( '|-------------------------------------|' );
        console.log("ERROR:", error); // print error;
		
        var response = { 
			success: false,
			message: 'ERROR >> ', error, 
			result: error 
		};
		
        return res.status(500).json(response);

    });

}

module.exports = postResources;
