'use strict';

/**
 * Created: 2015-12-23 11h52:23
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 * Description:  root Handler for all repetitve tasks
 *
 *  audit-handler.js:
 *      - The Audit-Handler records every transaction
 *      which occurs within the system, which user,
 *      which module, what transaction, the particulars
 *      timestamp, successful results, failed results,
 *      - This is the primary history auditing table
 *      and is fully managed within MongoDB to keep
 *      PostgreSQL clean from verbose logging data.
 *      - Information is immediately sent to the sysAdmin
 *      for any failed transaction using the logged data
 *      as the information, because users can't be
 *      depended upon to explain properly what exactly
 *      occurred.
 *
 *  post-handler.js: Handles all POST requests
 *  get-handler.js: Handles all GET requests
 *  put-handler.js: Handles all PUT requests
 *  patch-handler.js: Handles all PATCH requests
 *  del-handler.js: Handles all "Delete" requests
 *
 *  NOTE: We aren't really deleting anything from the db
 *      All information is managed through the audit-handler.js
 *      so if we need to recover something we can simply pull
 *      it from the audit-table within MongoDB and re-insert
 *      the information back into PostgreSQL
 */

var express = require('express');
var router = express.Router();

var postgres = require('../postgres'),
    client = require('pg-native'),
    moment = require('moment-timezone'),
    _ = require('underscore');

var jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    db = require('../../database'),
    secret = require('../../database/jwtSecret.js');
// GET DASHBOARD | REPORTS
var getDashboard = require('./reports/get-dashboard');
// GET RESOURCES
var getResources = require('./resources/get-resources'),
    addResources = require('./resources/post-resources'),
    editResources = require('./resources/put-resources');
// GET TRANSACTIONS
var getTransactions = require('./transactions/get-transactions'),
    addTransactions = require('./transactions/post-transactions'),
    editTransactions = require('./transactions/put-transactions');
// GET REPORTS
var getReports = require('./reports/get-reports');

// var assets = require('../assets'); // <<<< ???
// SCHEMA
var schemaHandler = require('./schemas/get-schema');

module.exports = {

    // getAssets: function(req, res, next){ assets(req, res, next) },

    getModules: function(req, res, next){
        var results = JSON.parse(req.query.params),
            moduleType = parseInt(results.type);

        switch(moduleType){
            case 1: return getResources(req, res, next);
            case 2: return getTransactions(req, res, next);
            case 3: return getReports(req, res, next);
            case 0: return getDashboard(req, res, next);
        }
    },

    postNotes: function(req, res, next){

        console.log( '|-------------------------------------|' );
        console.log( 'POST NOTES >>> ', req );

    },

    postModules: function(req, res, next){

        var moduleName = req.body.module,
            moduleMethod = req.params.method,
            moduleType = parseInt(req.body.type);

        // PARSE OUT RESOURCES | TRANSACTIONS
        switch( moduleType ){
            case 1: // RESOURCE
                console.log( 'MODULE: ', moduleName, ', METHOD: ', moduleMethod );
                switch( moduleMethod ){ // POST | PUT | PATCH
                    case 'add':
                    case 'import':
                        return addResources(req, res, next);
                        break;
                    case 'edit':
                        return editResources(req, res, next);
                        break;
                }
            break;
            case 2: // TRANSACTION
                switch( moduleMethod ){ // POST | PUT | PATCH
                    case 'add': return addTransactions(req, res, next); break;
                    case 'edit': return editTransactions(req, res, next) ; break;
                }
            break;
        }
    },

    getSchemas: function(req, res, next){ schemaHandler(req, res, next); }

};

