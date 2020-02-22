'use strict';

/**
 * Created: 2015-09-25
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 */

// load node_modules
var postgres = require('../postgres');
var patchHandler = function(req, res){
    
    // define the module & post data
    var data = req.body,
        params = data.params,
        results = {},
        schema = '',
        query = req.query,
        method = req.method,
        status,
        sql = '';
    
    console.log( '|================================|' );
    console.log( 'DATA >> ', data );
    console.log( '|--------------------------------|' );
    console.log( 'PARAMS >> ', params );
    console.log( '|--------------------------------|' );
    console.log( 'QUERY >> ', query );
    console.log( '|--------------------------------|' );
    console.log( 'METHOD >> ', method );
    
    switch(data.module){
        case 'put': 
            // console.log('METHOD >> PUT'); 
        break;
        case 'patch': 
            // console.log('METHOD >> PATCH'); 
            sql += "UPDATE public." + params.item.table;
            sql += " SET " + params.item.field;
            if(!params.item.value){
                sql += " = \'" + params.item.selected.id + "\'";
            }
            else{
                sql += " = \'" + (params.item.value).replace(/'/g, "''") + "\'";
            }
            sql += " WHERE id = \'" + params.id + "\';";
            
        break;
        default: 
            // console.log('DEFAUT METHOD >> ', data.module ); 
        break;
    }
    
    // console.log('SQL >> ', sql);

    results['sql'] = sql;

    /**
     * audit this transaction
     */
    schema = "SELECT attname AS column, format_type(atttypid, atttypmod)";
    schema += " AS data_type FROM pg_attribute WHERE attrelid = 'public.";
    schema += params.item.table + "'::regclass";
    schema += " AND attnum > 0";
    schema += " AND NOT attisdropped";
    schema += " ORDER BY attnum;"
    
    results['schema'] = schema;

    // return the schema
    postgres.client.query(sql, function(err, result){
        
        // error
        if(err){
            status = 500;
            results['error'] = err;
            postgres.client.end();
        }
        
        // success
        if(result){
            status = 200;
            results['success'] = { success: true };
        }

        // console.log('PATCH SUCCESS >> ', results);
        
        return res.status(status).send(results);
    });
}

module.exports = patchHandler;