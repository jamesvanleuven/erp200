'use strict';

/**
 * Created: 2015-10-11
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 * Description: audit handler for all requests
 *      - all audit requests are inserted into the
 *        public.sys_audit table
 *      - we can also deal w/ returns from the audit
 *        table using the GET request
 *      - flags for a true audit get as opposed to a
 *          generic GET user request for a different
 *          module will be managed via the Query object
 *        - if the query object has an audit=true then
 *          the request is an audit view request otherwise
 *          it's a generic user insert into the audit table
 *          so we can track who searched what, when. This
 *          is verbose but it does help us to trace if the
 *          user PUT, POSTED, PATCHED, or DELETED an item
 *          after the GET request
 */

// load node_modules
var postgres = require('../postgres');

// POST Requests auditHandler
var auditHandler = function(req, res){
    
    // define the module & post data
    var baseUrl = req.baseUrl, 
        modules = req.baseUrl.split('/'), 
        data = req.body,
        query = req.query,
        method = req.method;

    // remove first element in array
    // because it's always empty
    modules.shift();

    
    console.log('routes/audit-handler.js');
    console.log('baseUrl', baseUrl);
    console.log('modules', modules);
    console.log('data', data);
    console.log('query', query);
    console.log('auditHandler method:', method);
    
    
    switch(method){
        case 'POST':
            // console.log('load postAudit');
            postAudit(req, res, method, baseUrl, modules, data, query);
        break;
        case 'GET':
            // console.log('load getAudit');
            getAudit(req, res, method, baseUrl, modules, data, query);
        break;
        case 'PUT':
            // console.log('load putAudit');
            putAudit(req, res, method, baseUrl, modules, data, query);
        break;
        case 'PATCH':
            // console.log('load patchAudit');
            patchAudit(req, res, method, baseUrl, modules, data, query);
        break; 
        case 'DEL':
            // console.log('load deleteAudit');
            deleteAudit(req, res, method, baseUrl, modules, data, query);
        break;
    }

},

/**
 * POST AUDIT
 */
postAudit = function(req, res, method, baseUrl, modules, data, query){

    var results = [],
        status,
        schema,
        results_data = {},
        sql;
    
    // console.log('---------------------------------------');
    // console.log('INSERT AT: ', new Date() );
    // console.log('---------------------------------------');
    // console.log('METHOD', method);
    // console.log('BASEURL', baseUrl);
    // console.log('MODULES', modules );
    // console.log('TRANSACTION', query.react);
    // console.log('QUERY', query);    
    // console.log('DATA', data);
    // console.log('---------------------------------------');

    /**
     * method varchar(10) NULL,
     * url varchar(1000) NULL,
     * module text[] NULL,
     * section varchar(1000) NULL,
     * query JSON DEFAULT '{}' NOT NULL,
     * audit_data JSON DEFAULT '{}' NOT NULL,
     */
    
    schema = "INSERT INTO public.sys_audit ";
    schema += "(method, url, module, transaction, query, audit_data)VALUES( '";
    schema += method + "', '";
    schema += baseUrl + "', '{";
    schema += modules + "}', '";
    schema += query.react + "', '";
    schema += JSON.stringify(query) + "', '";
    schema += JSON.stringify(data) + "' );";
    
    // console.log('SCHEMA INSERT >>> ', schema);
/*
    postgres.client.query(schema, function(err, result){

        // error
        if(err){
            // console.log('error', err);

            status = 500;
            results.push(err);
        }
        // success
        if(result){
            status = 200;
            results.push({
                colCount: result.rowCount,
                column: result.rows
            });
        }

        // test response of everything
        results_data = {
            baseUrl: req.baseUrl,
            headers: req.headers,
            method: req.method,
            module: modules,
            transaction: query.react,
            body: req.body,
            query: query,
            schema: schema,
            results: results
        }
        
        // console.log('results_data', results_data);

        return res.status(status).send(results_data);
    });
*/
},

/**
 * GET AUDIT
 */
getAudit = function(req, res, method, baseUrl, modules, data, query){

    // console.log('---------------------------------------');
    // console.log('GET AT: ', new Date() );
    // console.log('---------------------------------------');
    // console.log('METHOD', method);
    // console.log('BASEURL', baseUrl);
    // console.log('MODULES', modules );
    // console.log('TRANSACTION', query.react);
    // console.log('QUERY', query);    
    // console.log('DATA', data);
    // console.log('---------------------------------------');
},

/**
 * PUT AUDIT
 */
putAudit = function(req, res, method, baseUrl, modules, data, query){

    // console.log('---------------------------------------');
    // console.log('PUT AT: ', new Date() );
    // console.log('---------------------------------------');
    // console.log('METHOD', method);
    // console.log('BASEURL', baseUrl);
    // console.log('MODULES', modules );
    // console.log('SECTION', query.react);
    // console.log('QUERY', query);    
    // console.log('DATA', data);
    // console.log('---------------------------------------');
},

/**
 * PATCH AUDIT
 */
patchAudit = function(req, res, method, baseUrl, modules, data, query){

    // console.log('---------------------------------------');
    // console.log('PATCH AT: ', new Date() );
    // console.log('---------------------------------------');
    // console.log('METHOD', method);
    // console.log('BASEURL', baseUrl);
    // console.log('MODULES', modules );
    // console.log('SECTION', query.react);
    // console.log('QUERY', query);    
    // console.log('DATA', data);
    // console.log('---------------------------------------');
},

/**
 * DELETE AUDIT
 */
deleteAudit = function(req, res, method, baseUrl, modules, data, query){

    // console.log('---------------------------------------');
    // console.log('DELETE AT: ', new Date() );
    // console.log('---------------------------------------');
    // console.log('METHOD', method);
    // console.log('BASEURL', baseUrl);
    // console.log('MODULES', modules );
    // console.log('SECTION', query.react);
    // console.log('QUERY', query);    
    // console.log('DATA', data);
    // console.log('---------------------------------------');
};

module.exports = auditHandler;