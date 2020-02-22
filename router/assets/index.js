'use strict';

/**
 * Created: 2015-12-23 11h52:23
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 * Description:  root Handler for all repetitve tasks
 */

var express = require('express'),
    router = express.Router(),
    db = require("../../database"),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    secret = (process.env.JWT_SECRET).toString(),
    auditHandler = require('../handlers/audit-handler'),
    utils = require('../utils/index.js'),
    clc = require('cli-color');

var getAssets = function (req, res) {
    // console.log( '|=========================================|' );
    // console.log( 'REQUEST >>> ', req );
    
    var failure = clc.xterm(202),
        warning = clc.yellow,
        information = clc.xterm(25),
        successful = clc.green, 
        header = req.headers,
        host = header.host,
        method = req.method,
        request = header['x-requested-with'],
        token = header.authorization.replace('Bearer ', ''),
        query = req.query,
        params = JSON.parse(query.params),
        manufacturer = parseInt(params.manufacturer),
        location = parseInt(params.location);

    // console.log( '|-----------------------------------------|' );
    // console.log( information( 'header', header ));
    // console.log( '|-----------------------------------------|' );
    // console.log( information( 'host', host ));
    // console.log( '|-----------------------------------------|' );
    // console.log( information( 'method', method ));
    // console.log( '|-----------------------------------------|' );
    // console.log( information( 'request', request ));
    // console.log( '|-----------------------------------------|' );
    // console.log( information( 'token', token )); 
    // console.log( '|-----------------------------------------|' );
    // console.log( information(  'query', query ));
    // console.log( '|-----------------------------------------|' );
    // console.log( information(  'params', params ));

    // return res.status(200).json({ body: body, token: token }); 

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
                // STORED PROCEDURE CALL
                var thisModule = 'public.rtn_' + query.module + '_' + query.table;
                thisModule += '(Array[$1]::integer[], $2::integer) AS "' + query.table + query.module + '";';
                pquery = [ manufacturer, location ];

            sql = 'SELECT * FROM ' + thisModule;

            // console.log('|---------------------------------------------|');
            // console.log(information('SQL QUERY', sql, pquery));
    
            // DB PROMISE
            db.tx(function(t1){
                // ADD MULTIPLE QUERIES HERE IF REQUIRED
                return this.batch([
                    t1.any(sql, pquery)
                    // , t1.any(sql2, pquery2)
                ]);
            }).then(function(result){
                var rows = result[0][0];

                // console.log('|---------------------------------------------|');
                // console.log( 'ROWS >>>>>>> ', rows );

                var data = ({
                        rows: rows,
                        status: 200
                    });
                response.push( data );
                // console.log('|---------------------------------------------|');
                // console.log( information( 'SQL RESULT ROWS >>> ', JSON.stringify(response, null, 2) ));
                
                return res.status(status).json(response);
                
            }).catch(function(error){
                var data = ({
                    rows: {
                        [params.table]: error
                    },
                    status: 500
                });
                response.push(data);
                // console.log('|---------------------------------------------|');
                // console.log( failure( 'SQL ERROR >>> ', JSON.stringify(response, null, 2) ));
                
                return res.status(status).json(response);
                
            });
        }
    });

};

module.exports = getAssets;