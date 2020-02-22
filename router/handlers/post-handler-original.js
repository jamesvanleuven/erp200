'use strict';

/**
 * Created: 2015-09-25
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: All
 */

// load node_modules
var db = require("../../database"), 
    moment = require('moment-timezone');

var postHandler = function(req, res){
    
    // define the module & post data
    var data = req.body,
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
        item = {};
    
    console.log( '|=====================================|' );
    console.log( 'POST DATA >> ', data );
    console.log( '|-------------------------------------|' );
    console.log( 'POST MODULE >> ', module );
    console.log( '|-------------------------------------|' );
    console.log( 'POST METHOD >> ', method );
    console.log( '|-------------------------------------|' );
    console.log( 'POST PARAMS >> ', params );

    sql += 'INSERT INTO pim_' + module + '(';
    
    switch(module){
        case 'orders':
            console.log( '|-------------------------------------|' );
            console.log( 'INSERT ORDER' );
            console.log( '|-------------------------------------|' );
            sql += 'user_id,customer_id,manufacturer_id,location_id,paid,rush,pickup,products,status_id,';
            sql += 'delivery_date,udf_reference)VALUES($1::integer, $2::integer, $3::integer, $4::integer, $5::boolean, $6::boolean, $7::boolean, $8::json,$9::integer, $10::timestamp without time zone, $11::character varying';

            values = [
                params.created_by.selected.id,
                params.customer.selected.id,
                params.manufacturer.selected.id,
                params.location.selected.id,
                params.paid.value,
                params.rush.value,
                params.pickup.value,
                JSON.stringify(params.products.value),
                params.status.selected.id,
                params.deliver_date.value,
                params.order_reference.value
            ];
        break;
        case 'transfers':
            console.log( '|-------------------------------------|' );
            console.log( 'INSERT TRANSFER' );
            console.log( '|-------------------------------------|' );
            // QUERY
            sql += 'user_id, manufacturer_id, from_id, to_id, products, status_id, delivery_date, type_id)VALUES(';
            sql += '$1::integer, $2::integer, $3::integer, $4::integer, $5::json, $6::integer, $7::timestamp without time zone,';
            sql += '$8::integer';
            values = [
                params.created_by.selected.id,
                params.manufacturer.selected.id,
                params.from_warehouse.selected.id,
                params.to_warehouse.selected.id,
                JSON.stringify(params.products.value),
                params.status.selected.id,
                moment( new Date(params.deliver_date.value) ).toISOString(),
                params.transfer_type.selected.id
            ];

        break;
    }
    
    sql += ') RETURNING id;';
    
    // NOTES
    // sql2 += 'INSERT INTO pim_notes(details, user_id)VALUES($1::character varying, $2::integer) RETURNING id;';
    // values2 = [
    //     params.notes.value[0].details,
    //     params.created_by.selected.id
    // ];

    console.log( '|-------------------------------------|' );
    console.log( 'QUERY >>> ', sql, values );
    // console.log( '|-------------------------------------|' );
    // console.log( 'NOTES >>> ', sql2, values2 );
    /*
    db.one(sql, values)
    .then(function (result) {
        console.log( '|-------------------------------------|' );
        console.log( 'RETURNING ID >>> ', result.id); // print new user id;
        return res.status(200).json(result);
    })
    .catch(function (error) {
        console.log("ERROR:", error.message || error); // print error;
        return res.status(401).json(error);
    });
    *
    
    db.tx(function(t1){
        // ADD MULTIPLE QUERIES HERE IF REQUIRED
        return this.batch([
            t1.any(sql, values) // QUERY INSERT
            // , t1.any(sql2, values2) // NOTES INSERT
        ]);
    }).then(function(result){
        console.log( 'RETURNING RESULT >> ', result );
        var response = { result: result[0] };
        return res.status(200).json(response);
    }).catch(function(error){
        console.log("ERROR:", error.message || error); // print error;
        var response = { result: error };
        return res.status(401).json(response);
    });
    */

    /**
     * audit this transaction
     */
}

module.exports = postHandler;