'use strict';
/**
 * author: James Mendham <james@bookt.in>
 * Created: 2015-09-29
 * Modules: NONE
 * security: JWT+CORS
 * handle static AngularJS Routes
 *
 * All server calls will be sent
 * directly to the API at:
 * This Node+Express server
 * strictly handles routing
 * for the front-end angular application
 *
 *

var throng = require('throng');
var WORKERS = process.env.WEB_CONCURRENCY || 4;

throng(start, {
  workers: WORKERS,
  lifetime: Infinity
});

function start(){
*/
    // console.log('ENVIRONMENT', process.env );

//	var nr = require('newrelic');
    var express = require('express');
    var path = require('path');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var debug = require('debug')('server:server');
    var http = require('http');
    var clc = require('cli-color');

    var app = express();
    // ASSIGN PORT
    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);
    // CREATE SERVER
    var server = http.createServer(app);
    // LISTEN ON NETWORK INTERFACE
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    // NORMALIZE PORT
    function normalizePort(val) {
      var port = parseInt(val, 10, 0);
      if (isNaN(port)) {return val; }
      if (port >= 0) { return port; }
      return false;
    }
    
    // HTTP ERROR LISTENER
    function onError(error) {
      if (error.syscall !== 'listen') { throw error; }
      var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES': console.error(bind + ' requires elevated privileges'); process.exit(1); break;
        case 'EADDRINUSE': console.error(bind + ' is already in use'); process.exit(1); break;
        default: throw error;
      }
    }
    // HTTP SERVER LISTENER
    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
      // console.log('listening on: ', bind);
      debug('Listening on ' + bind);
    }

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());

    // API REQUESTS
    var router = require('./router')(app);
    // SOCKET REQUESTS
    var io = require('socket.io').listen(server);
    io.on( 'connection', require('./sockets') );

    // Development Settings
    if (app.get('env') === 'development') {        
        app.use(express.static(path.join(__dirname, '/app')))
        app.use(express.static(path.join(__dirname, '/.tmp')))
        app.use(favicon(__dirname + '/app/favicon.ico'));

        app.use(function(req, res, next){
            // // console.log( 'REQ.URL >>> ', req.url );
            // // console.log( 'REQ.HEADERS >>> ', req.headers );

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DEL');
            res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Requested-With, X-Auth-Token, XMLHttpRequest, Accept, Authorization');

            res.redirect('/#!' + req.url);
        });

        // Error Handling
        app.use(function(err, req, res, next) {
            console.log( '|-------------------------------------|' );
            console.log('error', err);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // Production Settings
    if (app.get('env') === 'production') {
        app.use(express.static(path.join(__dirname, '/dist')));
        app.use(favicon(__dirname + '/dist/favicon.ico'));

        app.use(function(req, res, next){

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DEL');
            res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Requested-With, X-Auth-Token, XMLHttpRequest, Accept, Authorization');

            res.redirect('/#!' + req.url);
        });

        // production error handler
        // no stacktraces leaked to user
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
    }
    
    module.export = app;

// }