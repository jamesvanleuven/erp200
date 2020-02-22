'use strict';

/**
 * Created: 2015-09-24
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: ALL
 */

var express = require('express'),
    router = express.Router(),
    db = require("../../../database"),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    secret = (process.env.JWT_SECRET).toString(),
    auditHandler = require('../audit-handler'),
    utils = require('../../utils/index.js'),
    clc = require('cli-color');

var getTransactions = function (req, res) {

    // VARIABLES
    var failure = clc.xterm(202),
        warning = clc.yellow,
        information = clc.xterm(25),
        successful = clc.green, 
        header = req.headers,
        host = header.host,
        method = req.method,
        request = header['x-requested-with'],
        token = header.authorization.replace('Bearer ', ''),
        params = req.params,
        results = JSON.parse(req.query.params),
        moduleType = parseInt(results.type),
        manufacturers = req.query.manufacturers,
        establishment = parseInt(req.query.establishment),
        locations = req.query.locations,
        location = parseInt(req.query.location),
        customers = req.query.customers,
        module = parseInt(results.id),
        filters = [],
        filterList = null,
        orderList = '',
        paging = results.paging,
        limit = parseInt(paging.limit, 0),
        offset = parseInt(paging.offset, 0),
        body = req.body,
        cookies = req.cookies,
        type_id = 0;
    
    var startdate = null, enddate = null;
    
    console.log( '|-----------------------------------------|' );
    console.log( information( 'moduleType', moduleType )); 
    console.log( '|-----------------------------------------|' );
    console.log( information(  'establishment', establishment ));
    console.log( '|-----------------------------------------|' );
    console.log( information(  'location', location ));
    console.log( '|-----------------------------------------|' );
    console.log( information(  'locations', locations ));
    console.log( '|-----------------------------------------|' );
    console.log( information(  'manufacturers', manufacturers ));
    console.log( '|-----------------------------------------|' );
    console.log( information( 'customers', customers ));
    console.log( '|-----------------------------------------|' );
    console.log( information( 'module', module ) );
    console.log( '|-----------------------------------------|' );
    console.log( '|-----------------------------------------|' );
    console.log( information( 'req.query', JSON.stringify(req.query, null, 2) ) );
    console.log( '|-----------------------------------------|' );
    console.log( information( 'FILTERS >> ', JSON.stringify(req.query.filters, null, 2) ) );
    // console.log( '|-----------------------------------------|' ); 

    // PAGING
    if (paging.range) {
        offset = parseInt(paging.range.lower, 0);
        limit = parseInt(paging.limit, 0);
    }

    // FILTERS
    if ( utils.toType(req.query.filters) !== 'undefined') {
        
        filterList = "";
        (utils.toType(req.query.filters) === 'array') ? 
			filters = req.query.filters : 
			filters.push(req.query.filters);
        
        console.log( '|-----------------------------------------|' );
        console.log( 'FILTERS >> ', filters.length, filters );
		
		if( filters.length > 0 ){

			for (var i = 0; i <= filters.length - 1; i++) {
				var thisFilter = JSON.parse(filters[i]),
					thisType = thisFilter.type, 
					thisField = thisFilter.field,
					thisValue = thisFilter.value;

				// HACK FOR TRANSFER_ID SEARCH COLUMN
				( thisField === 'transfer_id' ) ? thisField = 'id': null;

				console.log( '|-----------------------------------------|' );
				console.log( 'thisType >> ', thisType );
				console.log( '|-----------------------------------------|' );
				console.log( 'thisField >> ', thisField );
				console.log( '|-----------------------------------------|' );
				console.log( 'thisValue >> ', thisValue );


				var numeric = ['numeric(10,2)', 'numeric(10,4)', 'bigint', 'money', 'integer'], 
					text = ['character varying', 'text'],
					bool = ['True/False','boolean'],
					datetime = ['timestamp without time zone'];

				console.log( '|-----------------------------------------|' );
				console.log( 'text.indexOf(thisType)', text.indexOf(thisType ));

				// IS ARRAY FILTER
				if( utils.toType(thisType) === 'array' ){

					switch(module){
						case 'orders': 
							filterList += " AND (a.location_id::text IN(";
							filterList += "SELECT(UNNEST(ARRAY["
							filterList += new Array(thisValue)
							filterList += "])::text";
							filterList += "))) ";
						break;
						case 'transfers': 
							filterList += " AND (a.from_id::text IN(";
							filterList += "SELECT(UNNEST(ARRAY["
							filterList += new Array(thisValue);
							filterList += "])::text)) OR a.to_id::text IN("
							filterList += "SELECT(UNNEST(ARRAY["
							filterList += new Array(thisValue);
							filterList += "])::text))) ";
						break;
					}

				}

				// IS DATETIME FILTER
				if( datetime.indexOf(thisType) !== -1 ){
					 var filterDates = thisValue.split(':');
					filterList += " AND (DATE(a." + thisField;
					filterList += ") >= DATE('" + filterDates[0];
					filterList += " 00:00:00') AND DATE(a." + thisField;
					filterList += ") <= DATE('" + filterDates[1];
					filterList += " 23:59:59'))"; 
				} 

				// IS BOOLEAN FILTER
				if( bool.indexOf(thisType) !== -1 ){
					parseInt(thisValue) === 0 ? 
						thisValue = false : 
						thisValue = true;
					filterList += " AND (a." + thisField;
					filterList += " = " + thisValue + ")";
				}

				// IS TEXT FILTER
				if( text.indexOf(thisType) !== -1 ){
					filterList += " AND (a." + thisField;
					filterList += "::text ILIKE";
					filterList += " '%" + thisValue+ "%')";
				}

				// IS NUMERIC FILTER
				if( numeric.indexOf(thisType) !== -1 ){

					// BIGINT
					if( thisType === 'bigint' ){
						/*
						if( thisField = 'license_number'){
							filterList += " AND (a.";
							filterList += thisField; 
							filterList += "::text ILIKE '%";
							filterList += Number(thisValue) + "%'::text)";
						}
						else{
						*/
						
							filterList += " AND (a.";
							filterList += thisField; 
							filterList += "::bigint = ";
							filterList += Number(thisValue) + "::bigint)";	
						
						// }
					}
					else{
						filterList += " AND (a." + thisField; 
						filterList += "::text ILIKE";
						filterList += " '%" + thisValue + "%')";
					}

				}
			}
			
		}
        
        console.log('|---------------------------------------------|');
        console.log( information( 'filterList', filterList ));
    }
	
    // CREDENTIALS
    var jwtOptions = { typ: 'JWT', alg: 'HS512' };
    jwt.verify(token, secret, jwtOptions, function (err, decoded) {

        var response = [],
            status = 200,
            pquery = [];
        if (err) {
            var data = {
                error: err,
                msg: 'Your token is invalid',
                status: 403
            };
            response.push(data);
        }

        if (decoded) {
            var credentials = decoded.payload.credentials,
                profile = jwt.decode(decoded.payload.user, secret),
                user = jwt.decode(decoded.payload.user.idx, secret),
                key = jwt.decode(decoded.payload.enc, secret),
                expires = moment.utc(decoded.payload.exp).tz('America/Vancouver').format(),
                iat = moment.utc(decoded.iat).tz('America/Vancouver').format(),
                sql = '',
                group = credentials.group_id,
                role = credentials.role_id;

            //HACK FOR STRANGE OFFSET = 1 BEHAVIOUR
            offset === 1 ? offset = 0 : null;
            // STORED PROCEDURE CALL
/*
	1 _limit integer, 
	2 _offset integer, 
	3 _establishment integer, 
	4 _manufacturers integer[], 
	5 _customers integer[],
	6 _locations integer[], 
	7 _location integer, 
	8 _module integer,
	9 _filter character varying,
	10 _startdate timestamp(6) without time zone,
	11 _enddate timestamp(6) without time zone
*/
            var thisModule = 'public.rtn_' + params.table;
            thisModule += '_all(';
            
            console.log( '|-----------------------------------------|' );
            console.log( 'manufacturers typeOf', typeof manufacturers );
            console.log( '|-----------------------------------------|' );
            console.log( 'customers typeOf', typeof customers );
            console.log( '|-----------------------------------------|' );
            console.log( 'establishment typeOf', typeof establishment );

			typeof manufacturers === 'undefined' ? manufacturers = new Array(0) : null;
            typeof manufacturers === 'string' ? manufacturers = new Array(manufacturers) : null;
            typeof manufacturers === 'object' ? manufacturers = new Array(manufacturers) : null;
            typeof customers !== 'object' ? customers = new Array() : customers = customers;
            
            if(params.table === 'orders'){
                
                thisModule += ' $1::integer, $2::integer, $3::integer';
                thisModule += ', Array[$4]::integer[], Array[$5]::integer[], Array[$6]::integer[]';
                thisModule += ' , $7::integer, $8::integer';
                thisModule += ', $9::character varying, $10::timestamp without time zone,';
                thisModule += ' $11::timestamp without time zone) AS "' + params.table + '";';
                
                pquery = [
                    limit, 
                    offset, 
                    establishment, 
                    manufacturers || '{0}', 
                    customers || '{0}', 
                    locations, 
                    location, 
                    module, 
                    filterList || null,
                    startdate || null,
                    enddate || null
                ];                
            }
            if(params.table === 'transfers'){
                
                thisModule += ' $1::integer, $2::integer, $3::integer';
                thisModule += ', Array[$4]::integer[], Array[$5]::integer[], Array[$6]::integer[]';
                thisModule += ', $7::integer, $8::character varying, $9::timestamp without time zone,';
                thisModule += ' $10::timestamp without time zone) AS "' + params.table + '";';
                
                pquery = [
                    limit, 
                    offset, 
                    establishment, 
                    manufacturers || '{0}',
                    customers || '{0}',
                    locations, 
                    location, 
                    filterList || null,
                    startdate || null,
                    enddate || null
                ];   
            }

            sql = 'SELECT * FROM ' + thisModule;

            console.log('|---------------------------------------------|');
            console.log(information('SQL QUERY', sql, JSON.stringify(pquery) ));
            
            // DB PROMISE
            db.tx(function(t1){
                // ADD MULTIPLE QUERIES HERE IF REQUIRED
                return this.batch([
                    t1.any(sql, pquery)
                    // , t1.any(sql2, pquery2)
                ]);
            }).then(function(result){
                var rows = result[0][0][params.table],
                    data = ({
                        rows: rows,
                        limit: limit,
                        offset: offset,
                        status: 200
                    });
				
				data.rows[params.table].filter = filters;
				
                response.push( data );
                
                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', response ));
                
                return res.status(status).json(response);
            }).catch(function(error){
                var data = ({
                    rows: {
                        [params.table]: error
                    },
                    limit: limit,
                    offset: offset,
                    status: 500
                });
                response.push(data);
                
                console.log('|---------------------------------------------|');
                console.log( failure( 'SQL ERROR >>> ', JSON.stringify(response, null, 2) ));
                
                return res.status(status).json(response);
            });
        }
    });
};

module.exports = getTransactions;