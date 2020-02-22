'use strict';

var pg = exports; exports.constructor = function pg(){};
var pgLib = require('pg').native;

pg.initialize = function(databaseUrl, cb) {
    console.log('databaseUrl', databaseUrl);
    console.log('cb', cb);
    
    var client = new pgLib.Client(databaseUrl);

    console.log('router/postgres.js client', client);
    
    client.connect(function(err) {
        if (err) {
            console.log('err: router/posgres.js', err);    
            return cb(err);
        }

        pg.client = client;
        cb();
    });
};