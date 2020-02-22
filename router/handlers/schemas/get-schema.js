'use strict';

/**
 * Created: 2015-09-24
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: ALL
 * Description:
 *  - GET       return all recordSets LIMIT 100 for pagination
 *  - GET/:id   return specific recordSet
 */

var express = require('express'), 
    router = express.Router(), 
    postgres = require('../../postgres'), 
    client = require('pg-native'),
    moment = require('moment'),
    _ = require('underscore'), 
    clc = require('cli-color'),
    jwt = require('jsonwebtoken'), 
    expressJwt = require('express-jwt'), 
    db = require('../../../database'), 
    secret = require('../../../database/jwtSecret.js').jwtSecret, 
    auditHandler = require('../audit-handler'), 
    utils = require('../../utils/index.js'), 
    schemas = require('./index.js');

// GET Requests Handler
var getSchema = function(req, res){
    
    var header = req.headers,
        host = header.host,
        method = req.method,
        request = header['x-requested-with'],
        token = header.authorization.replace('Bearer ',''),
        params = req.params,
        query = req.query,
        body = req.body,
        cookies = req.cookies,
        results = [], 
        failure = clc.red,
        warning = clc.yellow,
        information = clc.blue,
        successful = clc.green;
        
    
    // console.log( '|=====================================|' );
    // console.log( information( 'QUERY >>> ', JSON.stringify(query) ));
    
    // TEST FOR PERMISSIONS
    var jwtOptions = { typ: 'JWT', alg: 'HS512' };
    jwt.verify(token, secret, jwtOptions, function(err, decoded) {
        
        // console.log( '|-------------------------------------|' );
        // console.log( 'error', err );
        // console.log( '|-------------------------------------|' );
        // console.log( 'decoded', decoded );
        
        if(err){
            // console.log( failure( 'JWT-ERROR >>> ', err ));
            
            status = 401;
            var data = {
                error: err,
                msg: 'Your token is invalid'
            };
            
            results.push(data);
            return res.status(500).json(results);
        }
        
        if(decoded){

            var credentials = decoded.payload.credentials,
                user = jwt.decode(decoded.payload.user.idx, secret),
                key = jwt.decode(decoded.payload.enc, secret),
                expires = moment.utc(decoded.payload.exp).tz('America/Vancouver').format(),
                iat = moment.utc(decoded.iat).tz('America/Vancouver').format(),
                thisModule = query.table, 
                _mv = 'matview_'+thisModule, 
                sql = 'SELECT * FROM rtn_matview_schema($1,$2) AS "schema";',
                pquery = [
                    
                ],
                status = 200; 
            
            var tableSchema = { 'products': schemas.products };
            
            // console.log( '|-------------------------------------|' );
            // console.log( information( '_TABLE SCHEMA >> ', JSON.stringify(tableSchema[thisModule], null, 2) ));
            // console.log( '|-------------------------------------|' );
            // console.log( 'thisModule', thisModule );
            // console.log( '|-------------------------------------|' );
            // console.log( 'SQL', sql );
            
            
            results.push({ [thisModule]: tableSchema[thisModule] });
            return res.status(200).json(results);
        }

    });
    
};

module.exports = getSchema;