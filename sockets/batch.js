            var orders = response.index,
                params = [],
                batch = [];
            
            batch.push( t.any(sql, pquery) );
            
//            if( response.module === 'orders' && parseInt(response.status) === 3 ){
                /*
                batch.push( t.any(sql, pquery) );

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
                        inventory = result[1][0].result,
                        status = result[0][0][storedProc],
                        rowItems = [], queries = [],
                        thisHold = 0, thisQuantity = 0;

                    console.log( '|---------------------------------------------|' );
                    console.log( JSON.stringify(result[0]), JSON.stringify(result[1]) );
                    console.log( information( 'STATUS RESULT >>> ', JSON.stringify(status) ));
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
                                        rowItem[j].manufacturer,
                                        rowItems[j].location,
                                        products[p].id,
                                        thisHold,
                                        thisQuantity
                                    ];

                                    console.log( 'UPDATE-PARAMS[j] >> ', updPARAMS );
                                    // queries.push( t.any(updSQL(), updPARAMS) );

                                     t.any(updSQL(), updPARAMS);
                                }

                            }

                        }
                    }


                    return db.tx(function(t){
                        return this.batch(queries)
                        .then(function( final ){

                            console.log( '|---------------------------------------------|' );
                            console.log( 'FINAL RESULT >> ', final );
                        })
                        .catch(function( error ){

                            console.log( '|---------------------------------------------|' );
                            console.log( 'FINAL ERROR >> ', error );

                        });
                    });


                    var response = {
                        success: true,
                        items: result
                    };

                    return fn(response);

                })
                .catch(function(error){

                    console.log('|---------------------------------------------|');
                    console.log( failure( 'STATUS UPDATE ERROR >>> ', JSON.stringify(error) ));

                    var response = {
                        success: false,
                        items: error
                    };

                    fn(response);

                });