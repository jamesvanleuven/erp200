'use strict';

var express = require('express'), 
    router = express.Router(), 
    db = require("../../database"), 
    moment = require('moment'), 
    jwt = require('jsonwebtoken'), 
    expressJwt = require('express-jwt'), 
    secret = (process.env.JWT_SECRET).toString(), 
    // auditHandler = require('../handlers/audit-handler'), 
    utils = require('../utils/index.js'); 

module.exports = {

    // AUTHENTICATION
    login: function(req, res, next){
		
		// console.log( 'LOGIN REQUEST >> ', req );

        var username = req.query.email, password = req.query.password, 
            currentDate = moment().utc(),
            timestamp = moment().utc(),
            salt = secret, result = [], data = {}, status = 200, content = {},
            signedJWT = {}, jsonWebToken = '';

        if (!username || !password){
            // a submission field was blank
            status = 401;
            content['result'] = { status: 401, msg: 'Either your email or password is empty.' };
            result.push(content);
            
            return res.status(status).json(result).end();
        }
        else{
            var schema = "SELECT * FROM public.rtn_login($1, $2) AS login;", params = [username, password];
            
            console.log( '|=====================================|' );
            console.log( 'SCHEMA >> ', schema );
            console.log( '|-------------------------------------|' );
            console.log( 'PARAMS >> ', params );
            
            // NEW PROMISE MULTIPLE STEPS
            db.tx(function(t){ 
                return t.any(schema, params).then(function(user){
                    console.log( '|-------------------------------------|' );
                    console.log( 'LOGIN RESULT >> ', user[0] );
                    
                    var rows = user[0].login, credentials = rows.credentials,
                        permissions = rows.permissions, profile = rows.profile, 
                        system = rows.system;
                    
                    console.log( '|-------------------------------------|' );
                    console.log( 'ROWS >> ', rows );
                    console.log( '|-------------------------------------|' );
                    console.log( 'PROFILE >> ', profile );
                    console.log( '|-------------------------------------|' );
                    console.log( 'CREDENTIALS >> ', credentials );
                    console.log( '|-------------------------------------|' );
                    console.log( 'PERMISSIONS >> ', permissions );
                    
                    if( rows.login !== null ){
                        
                        // token header
                        var jwtHeader = { headers: { typ: 'JWT', alg: 'HS512' }};
                        // token user
                        var userObject = {
                            idx: jwt.sign({ 
                                login: profile.login_id, 
                                user: profile.user_id, 
                                email: username, 
                                password: password 
                            }, salt)
                        };

                        // token payload
                        var jwtPayload = {
                            credentials: credentials, user: userObject, exp: moment().add(1, 'h').utc(), 
                            enc: jwt.sign(secret, salt), iss: '*.directtap.com', aud: '*.directtap.com'
                        };
                        // token
                        var userToken = { header: jwtHeader, payload: jwtPayload, iat: moment().utc(), encoding: 'utf8' };

                        status = 200; jsonWebToken += jwt.sign(userToken, salt, jwtHeader);
                        content['x-token'] = jsonWebToken; 
                        content['irt-token'] = userToken;
                        content['status'] = status;
                        content['result'] = {
                            status: status, msg: 'Logged In Successfully!',
                            payload: rows
                            /*
                            results: {
                                profile: profile, 
                                credentials: credentials,
                                permissions: permissions, 
                                system: system
                            }
                            */
                        };
                        result.push(content);

                        console.log( '|-------------------------------------|' );
                        console.log('LOGIN.RESULT >> ', result );
                        return res.status(status).json(result).end();
                        
                    }
                    else{
                        status = 401;
                        content['result'] = { status: 401, msg: 'Either your email or password is empty.' };
                        result.push(content);

                        return res.status(200).json(result).end();
                    }
                
                }).catch(function(error){
                    // USE AUDIT HANDLER TO RECORD THE ERROR
                    console.log( '|-------------------------------|' );
                    console.log( 'CATCH ERROR >>>', error );

                    content['result'] = { 
                        status: 500, 
                        msg: 'Please check your credentials & try again.'
                    };
                    
                    result.push(content);
                    return res.status(200).json(result).end();
                }); 
            });
        }
    }
};