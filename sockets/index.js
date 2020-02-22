'use strict';
    
var moment = require('moment-timezone'), 
    // MONGODB
    mongo = require('mongoskin').db( process.env.MONGODB_URI ), 
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID, 
	
    // COLLECTIONS
    channels = mongo.collection('sockets'),
    routific = mongo.collection('routific'),
    auditHandler = mongo.collection('transaction'),
    doc60 = mongo.collection('doc60'),
    wayBill = mongo.collection('wayBill'),
    
    // POSTGRES
    db = require("../database"),
    utils = require('../router/utils/index.js'),
    
    //ROUTIFIC
    Routific = require("routific"),

    http = require('http'),
    querystring = require('querystring'),
    clc = require('cli-color'),
    failure = clc.xterm(202),
    warning = clc.yellow,
    information = clc.xterm(25),
    successful = clc.green,
    tzFormat = 'YYYY-MM-DD[T]HH:mm:ss.SSSZZ';

// BUILD INVENTORY-LIST SQL
function invSQL(int){
    
    var sql = '';
    int === 1 ? 
        sql += 'SELECT * FROM public.rtn_warehouse_lineitems($1, $2, $3) AS "inventoryList";' : 
        sql += 'SELECT * FROM public.rtn_inventory_lineitems($1, $2, $3) AS "inventoryList";';
    
    console.log( '|-------------------------------|' );
    console.log( 'INVENTORY-SQL >> ', sql );
    
    return sql;
};

// BUILD INVENTORY-LIST PARAMS
function invPARAMS( params ){
    var _q = [], _p = [],
        _items = params.products,
        _manufacturer = params.manufacturer,
        _location = params.location;

    for(var i = 0; i < _items.length; i++ ){ 
        _q.push( _items[i].id ); 
    }

    _p = [ _q, _manufacturer, _location ];

    return _p;
};

// BUILD UPDATE INVENTORY SQL
function updSQL(status){
	
	// ADJUST THIS TO WHERE PIM_INVENTORY.ID = TRANSACTION.VALUE
    var sql = '';
    sql += 'UPDATE pim_inventory SET quantity = $4, on_hold = $5';
    sql += ' WHERE manufacturer_id = $1 AND location_id = $2';
    sql += ' AND product_id = $3 RETURNING id;';
    return sql;
};

// UPDATE STATUS
function insSQL(module, params){
    var sql = 'UPDATE pim_' + module;
    
    switch(parseInt(params.status)){
        case 4: 
            sql += ' SET status_id = $1, received_by = $2, received_date = $3, received = $4';
            sql += ' WHERE id = $5 RETURNING id;';
        break;
        case 7: 
            sql += ' SET status_id = $1, received_by = $2, received_date = $3, received = $4';
            sql += ' WHERE id = $5 RETURNING id;';
        break;
        default: 
            sql += ' SET status_id = $1';
            sql += ' WHERE id = $2 RETURNING id;';
    }

    return sql;
};

// BUILD ADJUSTMENT INSERT PARAMS
function insPARAMS( module, params ){
    var insPARAMS;
    switch(module){
        case 'orders':
            insPARAMS = [
                params.status,
                params.id
            ];
        break;
        case 'transfers': 
            insPARAMS = [
                params.status,
                params.user,
                moment(new Date()).toISOString(),
                true,
                params.id
            ];
        break;
    }
    
    return insPARAMS;
};

// INSERT MONGODB AUDIT DOCUMENT
function auditTransaction( transaction, module, method ){
    transaction.method = method;
    transaction.module = module;

    return auditHandler.insert(transaction, function(err, doc){

        if(err) return err;

        if( doc ){
            return doc;
        }

    });
};

module.exports = function( socket ){

    var handshake = socket.handshake,
        query = handshake.query,
        response = {}, status = 400;
    
    console.log( '|---------------------------------------------|' );
    console.log( 'SOCKET QUERY >> ', query );

    channels.findOne({ key: query.key }, function(err, result){
        
        console.log('|---------------------------------------------|');
        console.log( 'channel.findOne.err', err );
        console.log('|---------------------------------------------|');
        console.log( 'channel.findOne.result', result );
        
        if( err ){
            response = {
                doc: err,
                channel: query.channel,
                key: query.key,
                user: query.user,
                text: 'There was an error testing your credentials.'
            };

            socket.emit('success', response);
        }
        else{

            if( result ){
                channels.updateOne({ key: query.key }, query, { upsert: true, new: true }, function(err, doc){
                    response = {
                        id: result._id,
                        doc: doc,
                        channel: query.channel,
                        key: query.key,
                        user: query.user,
                        text: query.user + ' subscribed successfully!.'
                    };
                });
            }
            
            if( !result ){
                channels.updateOne({ key: query.key }, query, { upsert: true, new: true }, function(err, doc){
                    response = {
                        doc: doc,
                        channel: query.channel,
                        key: query.key,
                        user: query.user,
                        text: query.user + ' connected successfully!'
                    };
                });
            }

            console.log('|---------------------------------------------|');
            console.log( 'SOCKET.RESPONSE >> ', response );

            socket.broadcast.emit('success', response);
        }
    });
    
    console.log('|---------------------------------------------|');
    console.log( 'CHANNEL RESPONSE >> ', response );

/**
 * SOCKET SUBSCRIBE
 */
    socket.on('subscribe', function(result, fn){
        
        console.log('|---------------------------------------------|');
        console.log( 'subscribe.response', response );
        console.log('|---------------------------------------------|');
        console.log( 'subscribe.result', result );
        

        fn( response );
        
        /*
        db.tx(function(t1){
            // ADD MULTIPLE QUERIES HERE IF REQUIRED
            return this.batch([
                t1.any(sql, pquery)
                // , t1.any(sql2, pquery2)
            ]);
        }).then(function(result){
            console.log('|---------------------------------------------|');
            console.log( information( 'SQL RESULT ROWS >>> ', result ));
            return res.status(status).json(response);
        }).catch(function(error){
            console.log('|---------------------------------------------|');
            console.log( failure( 'SQL ERROR >>> ', error ));
        });
        */
    });
    
/**
 * ROUTIFIC
 */
    socket.on('routing', function(result, fn){
        
        console.log('|---------------------------------------------|');
        console.log( 'SOCKET.ON.ROUTIFIC.RESULT >>', result );
        console.log( 'SOCKET.ON.ROUTIFIC.SCOPE >> ', result.scope );
        console.log( 'SOCKET.ON.ROUTIFIC.EVENT >> ', result.event );
        console.log( 'SOCKET.ON.ROUTIFIC.METHOD >> ', result.method );
        
        var token = process.env.ROUTIFIC_TOKEN,
            response = {
                result: result,
                token: token
            };
        
        // fn(response);

        var token = process.env.ROUTIFIC_TOKEN, 
            dataString = JSON.stringify(result.scope.document), 
            response = {};            

            // console.log('Routific Asset',dataString);
        var options = {
            host: 'api.routific.com',
            path: '/product/projects/',
            headers : {
                'Content-Type'      :   'application/json',
                'Content-Length'    :   dataString.length, 
                'Authorization'     :   'bearer '+token
            },
            method  : 'POST'
        };

        var req = http.request(options, function(res) {

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                // console.log('BODY: ' + chunk); //Api Response

                var handshake     = socket.handshake,
                    query         = handshake.query,
                    data          = {};

                    data.routific = JSON.parse(chunk);

                console.log('data',data);
                console.log('MONGO HANDSHAKE ==================>',handshake);
                console.log('MONGO ROUTES ==================>',routific);

                chunk ?
                    routific.findOne({ key: query.key }, function(err, result){
                        console.log('RESULT ==================>',result);
                        console.log('ERROR ==================>',err);
                        //result ? 

                            routific.update({ key: query.key }, data , { upsert: true, new: true }, function(err, doc){

                                console.log(err,doc,'Channel Response');

                                response = { 
                                    doc     :   result, 
                                    routes  :   data, 
                                    text    :   'Routific event received by websockets',
                                    query   :   query
                                };

                                fn(response);

                            })
                        //:   null;
                    })  
                :   null;
          });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);

            response.text   =   'problem with request: ' + e.message;

        });

        // write data to request body
        req.write(dataString);
        req.end();
    });
    /*
     *
     *PDF
     *
     *
     */
    socket.on('getCustomers', function(result, fn){
            var sql =   'SELECT * FROM public.rtn_document_types( Array[ $1 ]::integer[] )',
            pquery =  [],
            response    =   [];            
        
            var ids = result.scope.customer_ids;
                    
            pquery.push(ids);
        
            db.tx(function(t1){
                // ADD MULTIPLE QUERIES HERE IF REQUIRED
                return this.batch([
                    t1.any(sql,pquery)
                ]);
            }).then(function(result){

                console.log('getDocs');
                console.log('|---------------------------------------------|');
                console.log('result', JSON.stringify(result));
                
                response = { 
                                doc     :   result[0][0].result, 
                                channel :   query.channel,
                                key     :   query.key,
                                user    :   query.user
                            };

                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', JSON.stringify(response) ));  
                
                fn(response);

            }).catch(function(error){

                console.log('|---------------------------------------------|');
                console.log('error',error);
                
                response = { 
                                doc     :   error, 
                                channel :   query.channel,
                                key     :   query.key,
                                user    :   query.user,
                                text    :   'Customer errors by websockets',
                            };
                
                console.log( failure( 'SQL ERROR >>> ', JSON.stringify(response, null, 2) ));
                fn(response);
            });

    });
    
    socket.on('saveDoc',function(result,fn){
        var type = result.scope.type,
            response = {};
            //query = ;
        
        information(console.log('type ----->',type));
        //console.log('docType ==================>',result);
        //console.log('docType ==================>',query);
        

        result.scope.data.map(function(value){
            //console.log(information('SAVEDOC RESULT >>> ',JSON.stringify(value)));
            var data = {
                //user : 'Phil';
                //timestamp : 
                data : value,
                channel: query.channel,
                key: query.key,
                user: query.user,
                timestamp: moment().format(tzFormat)
            };
            
            delete value['$$hashKey'];
            
            //console.log(information('SAVEDOC RESULT >>> ',JSON.stringify(value)))
            
            var data = JSON.parse(JSON.stringify(data));
            
            console.log('|---------------------------------------------|');
            console.log('handshake',query.key);
            console.log('|---------------------------------------------|');
            console.log('data',data);

            data ?
                mongo.collection(type).findOne({ key: query.key }, function(err, result){
                    console.log('==================>');
                    console.log( 'RESULT >> ', result );
            
                    console.log('ERROR ==================>',err);
                    //result ? 

                    mongo.collection(type).
                    update({ 
                        key: query.key 
                    }, data, { 
                        upsert: true, new: true 
                    }, function(err, doc){

                        console.log(doc,'Channel Response');

                        response = { 
                            doc     : doc, 
                            text    : 'Document Save event received by websockets',
                            query   : query,
                            channel : query.channel,
                            key     : query.key,
                            user    : query.user,
                            id      : result.id || null
                        };

                        console.log('|---------------------------------------------|');
                        console.log( 'RESPONSE >>', response );

                        fn(response);
                })

            //:   null;
            }) : null;
        });
    });
    
    /*****************************************************************
    SKU
    *****************************************************************/
    socket.on('sku', function(response, fn){
        console.log('|---------------------------------------------|');
        console.log( 'sku.response', response );
        console.log('|---------------------------------------------|');
        console.log( 'sku.fn', fn );
        
        var sql = 'SELECT * from public.rtn_sku($1::bigint, $2::bigint);';
        var pquery = [
            response.id,
            response.sku
        ];

        db.tx(function(t1){
            // ADD MULTIPLE QUERIES HERE IF REQUIRED
            return this.batch([
                t1.any(sql, pquery)
                // , t1.any(sql2, pquery2)
            ]);
        }).then(function(result){
            console.log('|---------------------------------------------|');
            console.log( information( 'SQL RESULT ROWS >>> ', result ));
            fn(result[0]);
            // return res.status(status).json(result);
        }).catch(function(error){
            console.log('|---------------------------------------------|');
            console.log( failure( 'SQL ERROR >>> ', error ));
            fn(error);
        });

    });
    
    /*****************************************************************
    VOID TRANSACTION
    *****************************************************************/
    socket.on('voidTransaction', function(response, fn){
        console.log('|---------------------------------------------|');
        console.log( 'SOCKET.VOID-TRANSACTION.RESPONSE >> ', response );
        
        var invSQL = 'SELECT a.* FROM ';
        invSQL += ' UNNEST(ARRAY[$1]::integer[]) id(id)';
        invSQL += ' LEFT OUTER JOIN pim_inventory a ON a.product_id = id.id';
        invSQL += ' WHERE manufacturer_id = $2 AND location_id = $3';
        invSQL += ' ORDER BY id.id;';
        var invItems = [], 
            products = response.products;
        
        for(var i = 0; i < products.length; i++ ){
            invItems.push(products[i].id);
        }
        
        var invPARAMS = [
            invItems,
            response.manufacturer,
            response.location
        ];
        
        console.log('|---------------------------------------------|');
        console.log( 'INV-SQL >> ', invSQL );
        console.log( 'INV-PARAMS >> ', invPARAMS );
    
        db.task(function(t){
            return t.any(invSQL, invPARAMS)
            .then(function(inventory){
                console.log( '|---------------------------------------------|' );
                console.log( 'INVENTORY.RESULTS >> ', inventory );
                
                var queries = [], 
                    updSQL = 'UPDATE pim_inventory SET quantity = $1, on_hold = $2';
                
                updSQL += ' WHERE manufacturer_id = $3 AND location_id = $4 AND';
                updSQL += ' product_id = $5;';
                
                for(var j = 0; j < inventory.length; j++ ){
                    for( var k = 0; k < products.length; k++ ){
                        if( parseInt(inventory[j].product_id) === parseInt(products[k].id) ){
							
							var onHold = 0,
								quantity = 0;
							
							// HANDLE EACH TRANSFER TYPE
							if( response.module === 'transfers' ){
								switch(response.type){
									case 1: // W2W
										onHold = Number(parseInt(inventory[j].on_hold) - parseInt(products[k].quantity));
										quantity = Number(parseInt(inventory[j].quantity) + parseInt(products[k].quantity));
									break;
									case 2: // PRODUCTION
										onHold = Number( parseInt(inventory[j].on_hold) - parseInt(products[k].quantity) );
										quantity = Number( parseInt(inventory[j].quantity) );
									break;
									case 3: // MANUAL ADJUSTMENT
										onHold = Number(parseInt(inventory[j].on_hold) - parseInt(products[k].quantity));
										quantity = Number(parseInt(inventory[j].quantity) - parseInt(products[k].quantity));
									break;
								}
							}
							else{
								onHold = Number(parseInt(inventory[j].on_hold) - parseInt(products[k].quantity));
								quantity = Number(parseInt(inventory[j].quantity) + parseInt(products[k].quantity));
							}
							
							onHold < 0 ? onHold = 0 : null;
							
                            var updPARAMS = [
                                quantity,
                                onHold,
                                response.manufacturer,
                                response.location,
                                parseInt(inventory[j].product_id)
                            ];
                            queries.push(t.any(updSQL, updPARAMS));
                        }
                    }
                }
                
                var transSQL = 'UPDATE pim_' + response.module;
                transSQL += ' SET status_id = $1 WHERE id = $2 RETURNING id AS order_id;';
                var transPARAMS = [ 
					parseInt(response.status), 
                    response.module === 'transfers' ? parseInt(response.transaction) : parseInt(response.transaction.value)
                ];
                
                console.log( '|---------------------------------------------|' );
                console.log( 'update transaction >> ', transSQL, transPARAMS );
                console.log( '|---------------------------------------------|' );
                console.log( 'return inventory >> ', invSQL, invPARAMS );
                
                return db.tx(function(t){
                    return this.batch([ 
                        queries 
                        , t.any(transSQL, transPARAMS)
                        , t.any(invSQL, invPARAMS)
                    ])
                    .then(function(success){
                        console.log( '|---------------------------------------------|' );
                        console.log( 'SUCCESS >> ', success );
                        
                        var voidSuccess = [
                            success[1],
                            success[2]
                        ];

                        fn(voidSuccess);
                        
                    })
                    .catch(function(error){
                        console.log( '|---------------------------------------------|' );
                        console.log( 'ERROR >> ', error );
                        fn(error);
                    });
                });
            })
            .catch(function(error){
                console.log( '|---------------------------------------------|' );
                console.log( 'INVENTORY.ERROR >> ', error );
                fn(error);
            });
        });
    });
    
    /*****************************************************************
    INVENTORY UPDATE
    *****************************************************************/
    socket.on('inventory', function(response, fn){
        
        console.log('|---------------------------------------------|');
        console.log( 'HANDSHAKE >>', handshake );
        console.log('|---------------------------------------------|');
        console.log( 'response', response );
        // console.log('|---------------------------------------------|');
        // console.log( 'status.fn', fn );
        
        var statusItems = response.status,
            lineItems = response.lineItems,
            locationItems = response.locations;
        
        // UPDATE STATUS
        var sql = 'SELECT * FROM public.upd_'+statusItems.module+'_status( ARRAY[$1]::bigint[], $2::integer );';
        var pquery = [
            statusItems.items,
            statusItems.status
        ];
        
        console.log( '|---------------------------------------------|' );
        console.log( 'STATUS ITEMS >> ', statusItems );
        console.log( '|---------------------------------------------|' );
        console.log( 'LINE ITEMS >> ', lineItems );
        console.log( '|---------------------------------------------|' );
        console.log( 'LOCATION ITEMS >> ', locationItems );
        
        var module = statusItems.module,
            status = statusItems.selected,
            params = {};
        
        console.log( '|---------------------------------------------|' );
        console.log( 'MODULE >> ', module );
        console.log( '|---------------------------------------------|' );
        console.log( 'STATUS >> ', status );
        
        params.manufacturer = locationItems.manufacturer.id;
        params.products = lineItems;
        params.id = locationItems.id;
        params.status = statusItems.status;
        params.user = locationItems.user;
        params.type = 0;
        
        if( module === 'orders' ){
            params.location = locationItems.location.id;
        }
        
        if( module === 'transfers' ){
            if( statusItems.selected.id === 4 ){
                    params.type = 4;
                    params.location = locationItems.from.id;
            }
            else{
                switch(locationItems.type.id){
                    case 1: // WAREHOUSE TO WAREHOUSE
                        params.type = 1;
                        params.location = [
                            locationItems.from.id,
                            locationItems.to.id
                        ];
                    break; // PRODUCTION, ADJUSTMENTS
                    default: params.location = locationItems.to.id;
                }
            }
        }
        
        console.log( '|---------------------------------------------|' );
        console.log( 'INV-SQL >> ', invSQL(params.type) );
        console.log( '|---------------------------------------------|' );
        console.log( 'INV-PARAMS >> ', invPARAMS(params) );
        
        
        db.tx(function(t){
            return t.any(invSQL(params.type), invPARAMS(params))
            .then(function(inventory){
                console.log( '|---------------------------------------------|' );
                console.log( 'INVENTORY >> ', inventory[0].result );
                
                var inventoryItems = inventory[0].result,
                    thisHold = 0, thisQuantity = 0,
                    fromHold = 0, fromQuantity = 0,
                    newInventory = [],
                    updPARAMS = {},
                    queries = [];
                
                for( var i = 0; i < lineItems.length; i++ ){
                    for( var j = 0; j < inventoryItems.length; j++ ){
                        if( parseInt(lineItems[i].id) === parseInt(inventoryItems[j].product_id) ){

                            switch(status.id){
                                case 3: // DELIVERED 
                                    thisHold = parseInt(inventoryItems[j].on_hold) - parseInt(lineItems[i].quantity);
                                    // thisQuantity = parseInt(inventoryItems[j].quantity) + parseInt(lineItems[i].quantity);
                                    thisQuantity = parseInt(inventoryItems[j].quantity);
                                break;
                                case 4: // VOIDED
                                    thisHold = parseInt(inventoryItems[j].on_hold) - parseInt(lineItems[i].quantity);
                                    thisQuantity = parseInt(inventoryItems[j].quantity) + parseInt(lineItems[i].quantity);
                                break;
                                case 7: // RECEIVED
                                    switch( locationItems.type.id ){
                                        case 1:


                                            if( inventoryItems[j].location_id === params.location[0] ){
                                                fromHold = parseInt(inventoryItems[j].on_hold) - parseInt(lineItems[i].quantity);
                                                fromQuantity = parseInt(inventoryItems[j].quantity);

                                            }
                                            if( inventoryItems[j].location_id === params.location[1] ){
                                                thisHold = parseInt(inventoryItems[j].on_hold);
                                                thisQuantity = parseInt(inventoryItems[j].quantity) + parseInt(lineItems[i].quantity);

                                            }
                                            
                                        break;
                                        case 2:
                                            
                                            thisHold = parseInt(inventoryItems[j].on_hold) - parseInt(lineItems[i].quantity);
                                            thisQuantity = parseInt(inventoryItems[j].quantity) + parseInt(lineItems[i].quantity);

                                        break;
                                    }
                                break;
                            }

                            // CAN'T HAVE A NEGATIVE INVENTORY
                            thisHold < 0 ? thisHold = 0 : null;
                            thisQuantity < 0 ? thisQuantity = 0 : null;

                            switch(status.id){
                                case 7:
                                    switch( locationItems.type.id ){
                                        case 1: 
                                            if( inventoryItems[j].location_id === params.location[0] ){
                                                updPARAMS = [
                                                    params.manufacturer,
                                                    params.location[0],
                                                    parseInt(lineItems[i].id),
                                                    fromQuantity,
                                                    fromHold
                                                ];
                                                console.log( '|---------------------------------------------|' );
                                                console.log( 'UPD-PARAMS FROM >> ', updPARAMS );
                                            }
                                            if( inventoryItems[j].location_id === params.location[1] ){
                                                updPARAMS = [
                                                    params.manufacturer,
                                                    params.location[1],
                                                    parseInt(lineItems[i].id),
                                                    thisQuantity,
                                                    thisHold
                                                ];
                                                console.log( '|---------------------------------------------|' );
                                                console.log( 'UPD-PARAMS TO >> ', updPARAMS );
                                            }   
                                        break;
                                        case 2:
                                            updPARAMS = [
                                                params.manufacturer,
                                                params.location,
                                                parseInt(lineItems[i].id),
                                                thisQuantity,
                                                thisHold
                                            ];
                                        break;
                                    }
                                break;
                                default: 
                                    updPARAMS = [
                                        params.manufacturer,
                                        params.location,
                                        parseInt(lineItems[i].id),
                                        thisQuantity,
                                        thisHold
                                    ];
                            }

                            console.log( '|---------------------------------------------|' );
                            console.log( 'UPDATE SQL >> ', updSQL(status.id) );
                            console.log( '|---------------------------------------------|' );
                            console.log( 'UPDPARAMS[' + i + '] >> ', updPARAMS );

                            newInventory.push(updPARAMS);
                            queries.push(t.any(updSQL(status.id), updPARAMS));
                            
                        }
                    }
                }

                console.log( '|---------------------------------------------|' );
                console.log( 'NEW INVENTORY >> ', newInventory );
                console.log( '|---------------------------------------------|' );
                console.log( 'PARAMS >> ', status.id, params );
                console.log( '|---------------------------------------------|' );
                console.log( 'INSERT SQL >> ', insSQL(module, params) );
                console.log( '|---------------------------------------------|' );
                console.log( 'INSERT PARAMS >> ', insPARAMS(module, params) );

                return db.tx(function(t){
                    return this.batch([
                        t.any( insSQL(module, params), insPARAMS(module, params) )
                        , queries // UPDATE THE INVENTORY
                        , t.any('REFRESH MATERIALIZED VIEW CONCURRENTLY public.matview_products;', [])
                    ])
                    .then(function(result){
                        
                        console.log( '|---------------------------------------------|' );
                        console.log( 'RESULT >> ', result );
                        
                        response = {
                            result: result[0],
                            success: true,
                            message: 'SUCCESSFULLY ' + status.value.toUpperCase() + ' ' + module.toUpperCase() + '!'
                        };
                        
                        console.log( '|---------------------------------------------|' );
                        console.log( 'RESPONSE >> ', response );
                    
                        // AUDIT TO MONGODB
                        params.created_date = { value: moment(new Date()).toISOString() };
                        params.status = status.value;
                        params.success = 1;
                        
                        console.log( '|---------------------------------------------|' );
                        console.log( 'PARAMS >> ', params );

                        auditTransaction( params, module, status.value );
                        fn(response);
                        
                    })
                    .catch(function(error){
                        console.log( 'INSERT ERROR >>', error);
                        
                        params.created_date = { value: moment(new Date()).toISOString() };
                        params.status = status.value;
                        params.success = 0;
                        
                        console.log( '|---------------------------------------------|' );
                        console.log( 'PARAMS >> ', params );
                        
                        auditTransaction( params, module, status.value );
                        fn(response);
                    });
                });

            })
            .catch(function(error){
                console.log( '|---------------------------------------------|' );
                console.log( 'ERROR >> ', error );
            });
        });
        
    });
    
    /*****************************************************************
    LINE ITEMS
    *****************************************************************/
    socket.on('lineItems', function(response, fn){
        console.log('|---------------------------------------------|');
        console.log( 'status.response', response );
        // console.log('|---------------------------------------------|');
        // console.log( 'status.fn', fn );
        
        var sql = 'SELECT * FROM public.rtn_list_products( ARRAY[$1]::integer[], $2) AS "products";';
        var pquery = [ response.mid, response.lid];
        
        db.tx(function(t1){
            return this.batch([ t1.any(sql, pquery) ]);
        }).then(function(result){
            console.log('|---------------------------------------------|');
            console.log( information( 'SQL RESULT ROWS >>> ', result ));
            fn(result[0]);
        }).catch(function(error){
            console.log('|---------------------------------------------|');
            console.log( failure( 'SQL ERROR >>> ', error ));
            fn(error);
        });
    });
    
    /*****************************************************************
    STATUS UPDATES
    *****************************************************************/
    socket.on('status', function(response, fn){
        console.log('|---------------------------------------------|');
        console.log( 'status.response', response );
        console.log('|---------------------------------------------|');
        console.log( 'status.fn', fn );
        
        var sql = 'SELECT * FROM public.upd_'+response.module+'_status( ARRAY[$1]::bigint[], $2::integer )';
        sql += ' AS ' + response.module + '_statuses;';
        var pquery = [
            response.items,
            response.status
        ];
        
        console.log('|---------------------------------------------|');
        console.log( sql, pquery );
        
        db.tx(function(t){

            return this.batch([ 
                t.any(sql, pquery) 
            ])
            .then(function(result){
                console.log('|---------------------------------------------|');
                console.log( information( 'SOCKET.STATUS.RESULT >>> ', JSON.stringify(result) ));

                var thisResponse = {
                    success: true,
                    items: result[0]
                };
                var module = response.module,
                    status = parseInt(response.status),
                    orders = response.index,
                    params = [], batch = [];
                
                // INVENTORY HACK UPDATE FOR DELIVERED ORDERS
                if( module === 'orders' && status === 3 ){
                    
                    db.task(function(t){
                        
                        for( var i = 0; i < orders.length; i++ ){

                            console.log( '|---------------------------------------------|'  );
                            console.log( 'STATUS-DELIVERED.ORDERS[' + i + '] >> ', orders[i] );

                            var pq = {
                                manufacturer: orders[i].manufacturer.selected.id,
                                location: orders[i].location.selected.id,
                                products: orders[i].products.value
                            };

                            params.push(invPARAMS(pq));

                            console.log( 'ORDER[' + i + '].SQL >> ', invSQL(2), invPARAMS[pq] );

                        }

                        console.log( '|-------------------------------|' );
                        console.log( ' PARAMS >> ', params );

                        for( var p = 0; p < params.length; p++ ){
                            batch.push( t.any('SELECT * FROM public.rtn_inventory_lineitems($1, $2, $3);' , params[p]) );
                        }

                        console.log( '|-------------------------------|' );
                        console.log( ' BATCH >> ', batch );
                        
                        return this.batch(batch)
                        .then(function(result){

                            var lineItems = response.index, 
                                inventory = result[0][0].result,
                                rowItems = [], queries = [],
                                thisHold = 0, thisQuantity = 0;

                            console.log( '|---------------------------------------------|' );
                            console.log( JSON.stringify(result[0]) );
                            console.log( information( 'INVENTORY RESULT >> ', JSON.stringify(inventory) ));

                            lineItems.map(function( row, key ){
                                // console.log( '|---------------------------------------------|' );
                                // console.log( 'KEY, ROW >> ', key, row );

                                var obj = {
                                    manufacturer: row.manufacturer.selected.id,
                                    location: row.location.selected.id,
                                    products: []
                                };

                                row.products.value.map(function( item, idx ){
                                    // console.log( '|---------------------------------------------|' );
                                    // console.log( 'IDX, ITEM >> ', idx, item );

                                    var rowItem = {
                                        id: item.id,
                                        quantity: item.quantity
                                    };

                                    // console.log( 'ROW-ITEM >> ', rowItem );
                                    obj.products.push( rowItem );

                                });

                                // console.log( 'THIS-OBJECT >> ', obj );

                                rowItems.push(obj);

                            });

                            console.log( '|---------------------------------------------|' );
                            console.log( 'ROW-ITEMS >> ', rowItems );

            // [{"id":1029,"product_id":485,"batch_id":297,"quantity":94,"on_hold":6},{"id":1034,"product_id":490,"batch_id":302,"quantity":101,"on_hold":155}]

                            // UPDATE ON-HOLD QUANTITIES
                            for( var j = 0; j < rowItems.length; j++ ){

                                var products = rowItems[j].products;

                                for( var p = 0; p < products.length; p++ ){
                                    for( var i = 0; i < inventory.length; i++ ){

                                        if( inventory[i].product_id === products[p].id ){
                                            thisHold = parseInt(inventory[i].on_hold) - parseInt(products[p].quantity);
                                            thisQuantity = parseInt(inventory[i].quantity);

                                            thisHold < 0 ? thisHold = 0 : null;

                                            console.log( 'PRODUCT-ID >> ', products[p].id, thisHold, thisQuantity );

                                            var updPARAMS = [
                                                rowItems[j].manufacturer,
                                                rowItems[j].location,
                                                products[p].id,
                                                thisQuantity,
                                                thisHold
                                            ];

                                            console.log( 'UPDATE-PARAMS[j] >> ', updPARAMS );
                                            queries.push( t.any(updSQL(), updPARAMS) );

                                            // t.any(updSQL(), updPARAMS);
                                        }

                                    }

                                }
                            }


                            return db.tx(function(t){
                                return this.batch(queries);
                            })
                            .then(function(result){
                                console.log( '|-------------------------------|' );
                                console.log( 'result >> ', result );
                            })
                            .catch(function(error){
                                console.log( '|-------------------------------|' );
                                console.log( 'error 2 >> ', error );
                            });
                    })
                        .catch(function(error){
                            console.log( '|-------------------------------|' );
                            console.log( 'error', error );
                        });
                    });
                }

                return thisResponse;
            
            })
            .catch(function(error){
                console.log( '|---------------------------------------------|' );
                console.log( failure( 'SOCKET.STATUS.ERROR >>> ', JSON.stringify(error) ));

                var thisResponse = {
                    success: false,
                    items: error
                };

                return thisResponse;
            });
            
        })
        .then(function(response){
            
            console.log( '|---------------------------------------------|' );
            console.log( 'SOCKET.STATUS.RESPONSE.FN >> ', response );
            
            fn(response);
            
        })
        .catch(function(error){
            
            console.log( '|---------------------------------------------|' );
            console.log( 'SOCKET.STATUS.ERROR >> ', error );
            
            fn(error);
            
        });
        
    });
    
    /**
     * RETURN THE MODULE SCHEMA
     */
    socket.on('moduleSchema', function(response, fn){
        
//        console.log( '|------------------------------|' );
//        console.log( 'SOCKET.MODULE-SCHEMA.RESPONSE >> ', response );
        
        var pquery = [], sql = 'SELECT * FROM public.rtn_' + response + '_schema() AS schema;';
        
        db.tx(function(t){
            return this.batch([ t.any(sql, pquery) ]);
        }).then(function(result){
//            console.log('|---------------------------------------------|');
//            console.log( information( 'SQL RESULT ROWS >>> ', result ));
            fn(result[0]);
        }).catch(function(error){
//            console.log('|---------------------------------------------|');
//            console.log( failure( 'SQL ERROR >>> ', error ));
            fn(error);
        });
        
    });
    
    /*****************************************************************
    TRANSACTION PRODUCT LIST
    *****************************************************************/
    socket.on('products', function(response, fn){
        console.log('|---------------------------------------------|');
        console.log( 'status.response', response );
        // console.log('|---------------------------------------------|');
        // console.log( 'status.fn', fn );
        
        var sql = 'SELECT * FROM public.rtn_transaction_lineItems($1::integer, $2::integer, ARRAY[$3]::integer[] ) AS "lineItems";';
        var pquery = response;
        
        db.tx(function(t1){
            return this.batch([ t1.any(sql, pquery) ]);
        }).then(function(result){
            console.log('|---------------------------------------------|');
            console.log( information( 'SQL RESULT ROWS >>> ', result ));
            fn(result[0]);
        }).catch(function(error){
            console.log('|---------------------------------------------|');
            console.log( failure( 'SQL ERROR >>> ', error ));
            fn(error);
        });
    });
    
    /*****************************************************************
    NEW TRANSACTION PRODUCT LIST
    *****************************************************************/
    socket.on('productList', function(response, fn){
        console.log('|---------------------------------------------|');
        console.log( 'status.response', response );
        
        var sql = 'SELECT * FROM public.rtn_products_list($1::integer, $2::integer ) AS "productList";';
        var pquery = response;
        
        console.log('|---------------------------------------------|');
        console.log( 'SQL >> ', sql );
        console.log('|---------------------------------------------|');
        console.log( 'PQUERY >> ', pquery );
        
        
        db.tx(function(t1){
            return this.batch([ t1.any(sql, pquery) ])
            .then(function(result){
                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', result ));
                return fn(result[0]);
            }).catch(function(error){
                console.log('|---------------------------------------------|');
                console.log( failure( 'SQL ERROR >>> ', error ));
                return fn(error);
            });
        });
        
    });

    /*****************************************************************
    RESOURCE SEARCH
    *****************************************************************/
    socket.on('resourceSearch', function(res, fn){
        
        console.log( '|---------------------------------------------|' );
        console.log( 'GLOBAL-RESOURCE-SEARCH-RESPONSE >> ', res );
        
        var params = res.params,
            q = res.q,
            qLen = 0;
        
        q.length > 0 ? qLen = q.length : null;
        
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY >> ', q );
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY LENGTH >> ', qLen );
        
        var sql = 'SELECT * FROM public.cs_select_' + res.key + '($1);',
            pquery = [ 
                '^' + q[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '') 
            ];
        
        console.log( '|---------------------------------------------|' );
        console.log( 'SQL >> ', sql );
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY >> ', pquery );
        
        db.task(function(t){
            return t.one(sql, pquery).then(function(res){
                
                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', JSON.stringify(res.result) ));
                fn(res.result);
                
            }).catch(function(error){
                
                console.log('|---------------------------------------------|');
                console.log( failure( 'SQL RESULT ERROR >>> ', JSON.stringify(error) ));
                fn(error);
                
            });
        });
        
    });
	
	/*****************************************************************
    ADDRESS SEARCH
    *****************************************************************/
	socket.on('addressSearch', function(address, fn){
		
		console.log( '|--------------------------------|' );
		console.log( 'ADDRESS >> ', address, address.street, address.city, address.state );
		console.log( 'ADDRESS.STREET >> ', address.street );
		console.log( 'ADDRESS.CITY >> ', address.city );
		console.log( 'ADDRESS.STATE >> ', address.state );
		
		var sql = 'SELECT * FROM rtn_addresssearch(',
			query = [
				address.street.toLowerCase(),
				address.city.toLowerCase(),
				address.state.toLowerCase()
			];
		
		sql += '$1::character varying';
		sql += ', $2::character varying';
		sql += ', $3::character varying);';
		
		db.task(function(t){
			return t.one(sql, query)
			.then(function(data){
				
				console.log( '|--------------------------------|' );
				console.log( 'ADDRESS-SEARCH.RESULTS >> ', data.results );
				
				fn(data.results);
				
			})
			.catch(function(error){
				
				console.log( '|--------------------------------|' );
				console.log( 'ADDRESS-SEARCH.ERROR >> ', error );
				
				fn(error);
				
			});
		});

	});
	
    /********************************************************
     * AUTHOR: James Van Leuven <james.mendham@directtap.com>
     * DATE: 2017-09-28
     * REPORT CUSTOM-SELECT SEARCH RESULTS
     * app/scripts/controllers/content.js :: $scope.asyncReportFilter
     * app/scripts/factory/channels.js :: filterReportSearch
     * sockets/index.js :: filterReportSearch
     */
    socket.on('filterReportSearch', function( params, fn ){
        
        var key = params.key, 
            sql = 'SELECT * FROM public.cs_select_',
            query = [];
        
        sql += params.key.toLowerCase() + '(';
        
        switch(key){
            case 'products':
                
                // SQL
                sql += '$1::bigint'; // LOCATION
                sql += ', $2::bigint'; // MANUFACTURER
                sql += ', $3::character varying'; // PARAMS
                // QUERY
                query = [
                    parseInt(params.location),
                    parseInt(params.manufacturer),
                    params.q.replace(/^\s\s*/, '').replace(/\s\s*$/, '').toString()
                ];
                
            break;
            case 'manufacturers': 
                
                // SQL
                sql += '$1::character varying';
                query = [
                    params.q.replace(/^\s\s*/, '').replace(/\s\s*$/, '').toString()
                ];
                
            break;
        }
        
        sql += ') AS ';
        sql += params.key.toLowerCase();
        sql += ';';
        
        console.log( '|---------------------------------------------|' );
        console.log( 'SOCKET.FILTER-REPORT-SEARCH.SQL >> ', sql );
        console.log( 'SOCKET.FILTER-REPORT-SEARCH.QUERY >> ', query );
        
        db.task(function(t){
            return t.one(sql, query)
            .then(function(res){
                
                console.log('|---------------------------------------------|');
                console.log( information( 'SEARCH RESULT >>> ', res ));
                fn(res.result);
                
            }).catch(function(error){
                
                console.log('|---------------------------------------------|');
                console.log( failure( 'SEARCH ERROR >>> ', JSON.stringify(error) ));
                fn(error);
                
            });
        });
        
    });
    
    
    /*****************************************************************
    FILTER SEARCH
    *****************************************************************/
    socket.on('filterSearch', function(query, fn){
        
        var psql = 'SELECT * FROM ',
            pquery = [];
        
        console.log( '|---------------------------------------------|' );
        console.log( 'SOCKET.FILTER-SEARCH.QUERY >> ', query );
        
        switch(query.key){
            case 'city': 
                psql += 'public.cs_municipalities($1)';
                pquery = [ 
                    query.q.replace(/^\s\s*/, '').replace(/\s\s*$/, '') 
                ];
            break;
            default: 
                psql += 'public.cs_filter($1, $2, $3)';
                pquery = [
                    query.key,
                    query.module,
                    query.q.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
                ];
        }
        
        psql += ' AS result;',
        
        console.log( '|---------------------------------------------|' );
        console.log( 'SOCKET.FILTER-SEARCH >> ', psql, pquery );
        
        db.task(function(t){
            return t.one(psql, pquery)
            .then(function(res){
                
                console.log('|---------------------------------------------|');
                console.log( information( 'SEARCH RESULT >>> ', res ));
                fn(res.result);
                
            }).catch(function(error){
                
                console.log('|---------------------------------------------|');
                console.log( failure( 'SEARCH ERROR >>> ', JSON.stringify(error) ));
                fn(error);
                
            });
        });
    })
    .on('error', function(error){
        console.log( '|---------------------------------------------|' );
        console.log( 'FILTER-SEARCH.ERROR >> ', error );
    });
    
    /*****************************************************************
    GLOBAL SEARCH
    *****************************************************************/
    socket.on('transactionSearch', function(res, fn){
        
        console.log( '|---------------------------------------------|' );
        console.log( 'GLOBAL-TRANSACTION-SEARCH-RESPONSE >>', res );
        
        var params = res.params, 
            q = res.q, 
            qLen = 0;
        
        q.length > 1 ? qLen = q.length : null;
        
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY >> ', q );
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY LENGTH >> ', qLen );
        
        var sql = 'SELECT * FROM public.cs_select_' + res.key + '($1, $2, $3',
            pquery = [];
        
        switch(res.key){
            case 'products': break;
            default: 
                switch(qLen){
                    case 2: 
                        // $2 AND ( x = $3 OR y = $3 )
                        pquery = [
                            parseInt(params[0]),
                            '^' + q[0],
                            '^' + q[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '')
                            
                        ];
                    break;
                    default:
                        // a = $2 OR x = $2 OR y = $2 )
                        pquery = [
                            parseInt(params[0]),
                            '^' + q[0].replace(/^\s\s*/, '').replace(/\s\s*$/, ''),
                            null
                        ];
                }
        }
        
        sql += ');';
        
        console.log( '|---------------------------------------------|' );
        console.log( 'SQL >> ', sql );
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY >> ', pquery );
        
        db.task(function(t){
            return t.one(sql, pquery).then(function(res){
                
                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', JSON.stringify(res.result) ));
                fn(res.result);
                
            }).catch(function(error){
                
                console.log('|---------------------------------------------|');
                console.log( failure( 'SQL RESULT ERROR >>> ', JSON.stringify(error) ));
                fn(error);
                
            });
        });
        
    });
    
    /*****************************************************************
    GLOBAL SEARCH
    *****************************************************************/
    socket.on('inputConfirmation', function(res, fn){
        
        console.log( '|---------------------------------------------|' );
        console.log( 'INPUT-CONFIRMATION.RESPONSE >> ', res );
        
        var params = res.params,
            q = res.q,
            qLen = 0;
        
        q.length > 0 ? qLen = q.length : null;
        
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY >> ', q );
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY LENGTH >> ', qLen );
        
        var sql = 'SELECT * FROM public.rtn_input_confirmation($1, $2, $3);',
            pquery = [];
        
            pquery = [ 
                '^' + q[0].replace(/^\s\s*/, '').replace(/\s\s*$/, ''),
                res.q[1].replace(/^\s\s*/, '').replace(/\s\s*$/, ''),
                res.q[2].replace(/^\s\s*/, '').replace(/\s\s*$/, '')
            ];
        
        console.log( '|---------------------------------------------|' );
        console.log( 'SQL >> ', sql );
        console.log( '|---------------------------------------------|' );
        console.log( 'QUERY >> ', pquery );

        db.task(function(t){
            return t.one(sql, pquery).then(function(res){
                
                console.log('|---------------------------------------------|');
                console.log( information( 'SQL RESULT ROWS >>> ', JSON.stringify(res.result) ));
                fn(res.result);
                
            }).catch(function(error){
                
                console.log('|---------------------------------------------|');
                console.log( failure( 'SQL RESULT ERROR >>> ', JSON.stringify(error) ));
                fn(error);
                
            });
        });

    });
};