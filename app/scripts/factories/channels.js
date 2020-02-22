'use strict';

/**
 * SOCKET CHANNEL MANAGER
 */

angular.module('clientApp').factory('channels', function($q, $rootScope, $window, $location, moment){
    
    var tzFormat = 'YYYY-MM-DD[T]HH:mm:ss.SSSZZ', 
        profile = JSON.parse($window.sessionStorage.profile),
        options = {
            user: profile.Name.FullName, key: profile.key, 
            channel: profile.channel, timestamp: moment().format(tzFormat) 
        };
    var path = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port;
    var socket = $window.io({ query: options });
    
    socket.connect(path, {
        transports: [
            'websocket', 
            'xhr-polling', 
            'polling'
        ]
    });

    return {
        
        interval: function(){
            return this.setInterval(function(){
                socket.emit('disconnect', options );
            }, 1000);
        },
        
        disconnect: function(){
            var self = this;
            
            // console.log( '|---------------------------------------------|' );
            // console.log('The client has disconnected!');
            clearInterval(self.interval);
        },
        
        connection: function($route, $scope){
            
            // console.log( 'connection.route', $route );
            // console.log( 'connection.scope', $scope );
            
            var route = $route.current.params,
                scope = $scope.currentModule;

            // Add a connect listener
            socket.on('connect', function(){
                var event = {
                    type: 'connection',
                    text: 'Client Socket Connection Attempt...',
                    route: route, scope: scope, options: options,
                    timestamp: moment().format(tzFormat)
                };
                // console.log( '|---------------------------------------------|' );
                // console.log(event.text, event);
                // socket.emit('subscribe', event, function(result){
                socket.emit('subscribe', event, function(){    
                    // console.log( '|---------------------------------------------|' );
                    // console.log( 'subscribe.results', result );
                });
            });

            // Add a disconnect listener
            socket.on('disconnect', function(){
                var self = this;
                // console.log( '|---------------------------------------------|' );
                // console.log('The client has disconnected!');
                clearInterval(self.interval);
            });
            
            socket.on('routific', function(callback){
                // notify whomever
                // if channel === string then
                // anyone on this channel gets this growl notification
                // or i send it to a service to manage it
                console.log( 'ROUTIFIC SERVER CALLBACK', callback );
            });
            
        },
        
        routific: function($route, $scope){
            var jsonDoc = $scope.routific.document , deferred = $q.defer();
            
            // console.log('current doc',jsonDoc);
            
            socket.emit('routific', jsonDoc, function(callback){
                // console.log( callback );
                
                deferred.resolve( callback );
            });
            
            return deferred.promise;
        },
        
        // ADD | EDIT TRANSACTIONS
        transaction: function($route, $scope, transaction){
            var deferred = $q.defer(), 
                route = $route.current.params,
                scope = $scope[transaction],
                event = { 
                    type: transaction, route: route,
                    scope: scope, options: options,
                    timestamp: moment().format(tzFormat)
                };
            // console.log( '|---------------------------------------------|' );
            // console.log( 'TRANSACTION.EVENT >> ', event );
            socket.emit(transaction, event, function(result){ 
                // console.log( '|---------------------------------------------|' );
                // console.log( 'TRANSACTION RESULT >> ', result );
                deferred.resolve(result); 
            });
            return deferred.promise;
        },
        
        resource: function($route, $scope, resource){
            var deferred = $q.defer(),
                route = $route.current.params,
                scope = $scope[resource],
                event = {
                    type: resource, route: route,
                    scope: scope, options: options,
                    timestamp: moment().format(tzFormat)
                };
            // console.log( '|---------------------------------------------|' );
            // onsole.log( 'RESOURCE.EVENT >> ', event );
            socket.emit(resource, event, function(result){ 
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET RESOURCE RESULT >> ', result );
                deferred.resolve(result); 
            });
            return deferred.promise;
        },
        
        // TEMP SKU TEST HACK FOR LAUNCH - 2017-01-11 JVL (THIS ENTIRE PAGE NEEDS TO BE REWRITTEN)
        sku: function(skuObject){
            var deferred = $q.defer();
            
            // console.log( 'channels.sku.skuObject', skuObject );
            socket.emit('sku', skuObject, function(result){
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET SKU EVENT >> ', result );
                deferred.resolve(result);
            });
            return deferred.promise;
        },
        
        status : function(object){
            // console.log( '|---------------------------------------------|' );
            // console.log( 'object', object );
            
            var deferred = $q.defer();
            socket.emit('status', object, function(result){
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET STATUS EVENT >> ', result );
                deferred.resolve(result);
            });
            return deferred.promise;
        }, 
        
        voidTransaction: function(object){
            // console.log( '|---------------------------------------------|' );
            // console.log( 'CHANNELS.VOID-TRANSACTION.OBJECT >> ', object );
            
            var deferred = $q.defer();
            socket.emit('voidTransaction', object, function(result){
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET.VOID-TRANSACTION.RESULT >> ', result );
                deferred.resolve(result);
            });
            return deferred.promise;
        },
        
        inventory: function(object){
            // console.log( '|---------------------------------------------|' );
            // console.log( 'object', object );
            
            var deferred = $q.defer();
            socket.emit('inventory', object, function(result){
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET STATUS EVENT >> ', result );
                deferred.resolve(result);
            });
            return deferred.promise;
        },
        
        lineItem: function(req){
            var deferred = $q.defer();
            
            // console.log( '|---------------------------------------------|' );
            // console.log( 'productObject', req );
            
            socket.emit('lineItems', req, function(result){
                
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET RODUCT RESULTS', result );
                
                deferred.resolve(result);
            });
            return deferred.promise;
        },
        
        /**
         *  RETURN RESOURCE IMPORT SCHEMA
         */
        
        moduleSchema: function(params){
            var deferred = $q.defer();
            
            // CALL THE SOCKET 
            socket.emit('moduleSchema', params, function(results){
                deferred.resolve(results);
            });
            
            return deferred.promise;
        },
    
        products: function(req){
            var deferred = $q.defer();
            
            // console.log( '|---------------------------------------------|' );
            // console.log( 'productObject', req );
            
            socket.emit('products', req, function(result){
                
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET PRODUCT RESULTS', result );
                
                deferred.resolve(result[0].result);
            });
            return deferred.promise;
        },
        
        productList: function(req){
            var deferred = $q.defer();
            
            // console.log( '|---------------------------------------------|' );
            // console.log( 'productList.params >> ', req );
            
            socket.emit('productList', req, function(result){
                
                // console.log( '|---------------------------------------------|' );
                // console.log( 'SOCKET PRODUCT-LIST RESULTS', result );
                
                deferred.resolve(result);
                
            });
            
            return deferred.promise;
        },
        

        /********************************************************
         * AUTHOR: James Van Leuven <james.mendham@directtap.com>
         * DATE: 2017-09-28
         * REPORT CUSTOM-SELECT SEARCH RESULTS
         * app/scripts/controllers/content.js :: $scope.asyncReportFilter
         * app/scripts/factory/channels.js :: filterReportSearch
         * sockets/index.js :: filterReportSearch
         */
        filterReportSearch: function(params){
            
            console.log( '|--------------------------------------|' );
            console.log( 'CHANNELS.FILTER-REPORT-SEARCH.PARAMS >> ', params );
            
            var deferred = $q.defer();
            socket.emit('filterReportSearch', params, function(results){
                deferred.resolve(results);
            });
            return deferred.promise;
            
        },
        
        filterSearch: function(params){
            var deferred = $q.defer();
            socket.emit('filterSearch', params, function(results){
                console.log( '|--------------------------------------|' );
                console.log( 'FILTER-SEARCH.RESULTS >> ', results );
                deferred.resolve( results );
            });
            return deferred.promise;
        },
        
        transactionSearch: function(search){
            
            console.log( '|--------------------------------------|' );
            console.log( 'QUERY >> ', search );
                
            var deferred = $q.defer();
            socket.emit('transactionSearch', search, function(results){
                
                console.log( '|--------------------------------------|' );
                 console.log( 'GLOBAL-TRANSACTION-SEARCH SOCKET RESULTS >> ', results );
                
                deferred.resolve( results );
            });
            return deferred.promise;
        },
        
        resourceSearch: function(search){
            // console.log( '|--------------------------------------|' );
            // console.log( 'QUERY >> ', search );
                
            var deferred = $q.defer();
            socket.emit('resourceSearch', search, function(results){
                
                // console.log( '|--------------------------------------|' );
                // console.log( 'GLOBAL-RESOURCE-SEARCH SOCKET RESULTS >> ', results );
                
                deferred.resolve( results );
            });
            return deferred.promise;
        },
        
        inputConfirmation: function(params){
            // console.log( '|--------------------------------------|' );
            // console.log( 'QUERY >> ', params );
                
            var deferred = $q.defer();
            socket.emit('inputConfirmation', params, function(results){
                
                // console.log( '|--------------------------------------|' );
                // console.log( 'INPUT-CONFIRMATION SOCKET RESULTS >> ', results );
                
                deferred.resolve( results );
            });
            return deferred.promise;
        },
		
		addressSearch: function(address){
			var deferred = $q.defer();
			
			socket.emit('addressSearch', address, function(results){
				
				( results ) ? 
					deferred.resolve(results) : 
					deferred.reject();
				
			});
			
			return deferred.promise;
		}
        
    };
    
});