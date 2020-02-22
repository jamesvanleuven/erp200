'use strict';
/**
 * Author: James Mendham <james.mendham@freshtap.com>
 * Created: 2015-10-18 14:39:00
 */
var cn = process.env.DATABASE_URL;

var options = {
    
    error: function(error, e){
        if( e.cn ){
            console.log( 'POSTGRES CONNECTION (CN): ', e.cn );
            console.log( 'POSTGRES EVENT: ', error.message || error );
        }
    },

    connect: (client, dc, isFresh) => {
        var cp = client.connectionParameters;
        console.log("Connected to database:", cp.database);
    },

    disconnect: function(client, dc){
        var cp = client.connectionParameters;
        console.log('Disconnecting from database: ', cp.database );
        // console.log( 'ClIENT: >>', client );
    }

};

var pgp = require('pg-promise')(options);
var db = pgp(cn);

module.exports = db;