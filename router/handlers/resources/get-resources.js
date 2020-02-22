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

var getResources = function (req, res) {

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
        filters = [],
        filterList = null,
        orderList = '',
        paging = results.paging,
        limit = parseInt(paging.limit, 0),
        offset = parseInt(paging.offset, 0),
        body = req.body,
        cookies = req.cookies,
        type_id = 0;
    
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

    // PAGING
    if (paging.range) {
        offset = parseInt(paging.range.lower, 0);
        limit = parseInt(paging.limit, 0);
    }
    // FILTERS
    if (typeof req.query.filters !== 'undefined') {
        
        filterList = "";
        (req.query.filters instanceof Array) ? filters = req.query.filters : filters.push(req.query.filters);
        
        console.log( '|-----------------------------------------|' );
        console.log( 'FILTERS >> ', filters );

        for (var i = 0; i <= filters.length - 1; i++) {
            var thisFilter = JSON.parse(filters[i]),
                thisType = thisFilter.type, 
                thisField = thisFilter.field,
                thisValue = thisFilter.value;
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
                filterList += " AND (a." + thisField;
                filterList += " = " + Boolean(thisValue) + ")";
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
					filterList += " AND (a.";
					filterList += thisField; 
					filterList += "::bigint = ";
					filterList += Number(thisValue) + "::bigint)";
				}
				else{
					filterList += " AND (a." + thisField; 
					filterList += "::text ILIKE";
					filterList += " '%" + thisValue + "%')";
				}
				
            }
        }
        
        console.log( '|---------------------------------------------|' );
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
            var thisModule = 'public.rtn_' + params.table;
            thisModule += '_all($1::integer, $2::integer, $3::integer, Array[$4]::integer[],';
            thisModule += ' Array[$5]::integer[], $6::integer, $7::integer,';
            thisModule += ' $8::integer, $9::character varying) AS "' + params.table + '";';
            
            typeof(manufacturers) === 'undefined' ? manufacturers = 0 : null;
            console.log('|---------------------------------------------|');
            console.log( 'manufacturers >> ', manufacturers );
            
            pquery = [limit, offset, establishment, manufacturers, locations, location, group, role, filterList];

            sql = 'SELECT * FROM ' + thisModule;

            console.log('|---------------------------------------------|');
            console.log(information('SQL QUERY', sql, pquery));
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
                response.push( data );
                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', JSON.stringify(response) ));
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

module.exports = getResources;