'use strict';

/**
 * Created: 2015-12-23 11h52:23
 * Author: James Mendham <james.mendham@freshtap.com>
 * Modules: API SYSTEM WIDE
 */

// CORS MANAGEMENT
var expressJwt = require('express-jwt');

// API ROUTES
var authRoutes = require('./auth');
var moduleHandlers = require('./handlers');

module.exports = function (app) {
    
    /* ==========================================================
    Access Control List
    ============================================================ */
    app.use('/auth/login', authRoutes.login);
    app.get('/api/:module/:table', moduleHandlers.getModules );

    /* ==========================================================
    POST
    ============================================================ */
    app.post('/api/:module/:method', moduleHandlers.postModules );
    app.post('/api/notes/:id', moduleHandlers.postNotes );

    /* ==========================================================
    Database Architecture
    ============================================================ */
    app.get('/api/schema', moduleHandlers.getSchemas );
}