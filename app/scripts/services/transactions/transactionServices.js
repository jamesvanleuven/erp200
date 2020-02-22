'use strict'; 
/**
 * @ngdoc service
 * @name clientApp.transactionServices
 * @description
 * # transaactionService
 */

angular.module('clientApp.transactionServices', []).service('transactionService', [
    '$q',
    '$rootScope',
    '$compile', 
    '$window',
    'utils',
    'channels',
    'moment',
    'mathService',
    'modalService',
function ($q, $rootScope, $compile, $window, utils, channels, moment, mathService, modalService){
    
    return {
        
        config: function( $scope, $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisModal = thisModule.modal,
                thisMethod = thisModal.method,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type;
            
            console.log( '|-------------------------------------|' );
            console.log( 'TRANSACTION-SERVICE.CONFIG.THIS-MODULE >> ', thisModule );
            console.log( 'TRANSACTION-SERVICE.CONFIG.THIS-MODAL >> ', thisModal );
            console.log( 'TRANSACTION-SERVICE.CONFIG.METHOD >> ', thisMethod );
            console.log( 'TRANSACTION-SERVICE.CONFIG.MODULE-NAME >> ', moduleName );
            console.log( 'TRANSACTION-SERVICE.CONFIG.MODULE-TYPE >> ', moduleType );

        },
        
        adjustOnHoldInventory: function( $scope, $event ){
            var self = this;
            
            console.log( '|-------------------------------------|' );
            console.log( 'ADJUST-ONHOLD-INVENTORY.SCOPE >> ', $scope );
            console.log( 'ADJUST-ONHOLD-INVENTORY.EVENT >> ', $event );
        },
        
        // QUICK SUM OF TRANSACTIONS
        sumTransaction: function( items, prop ){
            
            console.log( '|-------------------------------------|' );
            console.log( 'SUM-TRANSACTION.ITEMS >> ', items );
            console.log( 'SUM-TRANSACTION.PROP >> ', prop );
            
            return items.reduce(function(a, b){
                
                console.log( 'ITEM.REDUCE.A >> ', a );
                console.log( 'ITEM.REDUCE.B >> ', b );
                
                // utils.toType(b) === 'undefined' ? b = 0 : null;
                
                console.log( 'A + B[prop] >> ', a + b[prop] );
                
                return a + b[prop];
                
            }, 0);
            
        }, 
        
        errorNotification: function(str, $scope){
            var msg = '', thisModal = JSON.parse($window.sessionStorage.thisModal),
                resource = $scope.$parent.currentModule.modal.resource.element,
                resetElement = thisModal.elements[resource].selected;
            
            delete resetElement.$$hashKey;

            // RESET THE ELEMENT SELECTED VALUE
            $scope.$parent.currentModule.modal.elements[resource].selected = resetElement;
            
            switch(str){
                case null : msg = 'No Records available.'; break;
                case 'error' : msg = 'System Error: Please contact system administrator.'; break;
            }
            
            alert(msg);
        },
        
        returnSchema: function( $scope ){
            var self = this, parent = {},
                thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(), 
                schema = $rootScope.assets[moduleName].elements;

            angular.forEach(schema, function(item, key){
				
                var row, colName;
				
				// TEMP HACK FOR ELEMENTS ASSETS UNTIL ALL ELEMENTS
				// STORED PROCS ARE CONVERTED
				( utils.toType(item.schema) === 'undefined' ) ? row = item : row = item.schema;
                
                row.alias === 'product_name' ? 
                    colName = row.column : 
                    colName = row.alias;

                parent[colName] = {}; 
                // parent[colName].permissions = {};

                switch( row.input ){
                    case 'select': 
                        colName === 'products' ?
                            parent.products.value = [] : 
                            parent[colName].selected = {id: null, value: '' };
                    break;
                    case 'json': 
                        parent[colName].value = []; 
                    break;
                    default: 
                        parent[colName].value = '';
                }
            });

            return parent;
        },
        
        // BUILD THE TRANSACTION POST OBJECT
        addTransaction: function( $scope, $event ){

            var self = this,
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                thisModal = thisModule.modal,
                thisUserGroup = parseInt($rootScope.credentials.group_id),
                thisManufacturer = $rootScope.profile.manufacturers,
				thisEstablishment = parseInt($window.sessionStorage.establishment),
                thisLocation = JSON.parse($window.sessionStorage.location),
                userLocations = JSON.parse($window.sessionStorage.locations),
                parent = $scope[moduleName][0],
                child = $scope.newTransaction = {},
                newSelect = { id: 0, value: null },
                newNote = [];
            
            console.log( '|--------------------------------------|' );
            console.log( 'ADD-TRANSACTION.ROOTSCOPE >> ', $rootScope );
            console.log( 'ADD-TRANSACTION.SCOPE >> ', $scope );
            
            // CREATE TRANSACTION IF NOTHING TO CLONE
            utils.toType(parent) === 'undefined' ? 
                parent = self.returnSchema( $scope ) : 
                null;
            
            // CLONE TO NEW OBJECT
            $scope.newTransaction = angular.copy( parent, child );
            
            console.log( '|--------------------------------------|' );
            console.log( 'ADD-TRANSACTION.SCOPE.NEW-TRANSACTION >> ', $scope.newTransaction );
            

            // SET DEFAULT VALUES FOR TRANSACTION
            angular.forEach($scope.newTransaction, function(item, key){

                if( item.input ){
                    
                    // DELLETE USELESS DATA
                    delete item.alias;
                    delete item.data_type;
                    delete item.field;
                    delete item.permissions;
                    delete item.required;
                    delete item.table;
                    delete item.visible;

                    item.input === 'select' ? 
                        item.selected = newSelect : 
                        key === 'products' ? 
                            item.value = [newSelect] : 
                            item.value = [];
					
					item.input === 'boolean' ? item.value = false : null;
                }

            });
            
            // SET NEW TRANSACTION DEFAULTS
            $scope.newTransaction.id = -1; // NEW TRANSACTION ID 
            var locationChild = {}; // CURRENT WAREHOUSE LOCATION
            angular.copy( thisLocation, locationChild );
            $scope.newTransaction.location = { selected: locationChild, input: 'select' };
            
            $scope.newTransaction.location.selected = thisLocation; // LOCATION
            $scope.newTransaction.manufacturer.selected = { id: 0, value: "", address: {} }; // MANUFACTURER
            $scope.newTransaction.products.value = []; // DEFINE EMPTY PRODUCT LINE-ITEMS
            $scope.newTransaction.created_date = { value: new Date() }; // TODAY IS THE CREATED DATE
            $scope.newTransaction.deliver_date = { startDate: null, endDate: null }; // SET EMPTY DELIVERY DATE
            
            $scope.newTransaction.created_by.selected = { id: $rootScope.profile.user_id, value: $rootScope.profile.Name.FullName }; // CURRENT USER
            $scope.newTransaction.notes = { input: 'json', value: [] }; // EMPTY NOTES
            $scope.newTransaction.modal = thisModal;
            $scope.newTransaction.method = thisModal.method;
            $scope.newTransaction.modal.module = moduleName;
			$scope.newTransaction.rush = { value: false };
			$scope.newTransaction.pickup = { value: false };
            
            if(moduleName == 'orders' ){
                $scope.newTransaction.paid.value = false;
				$scope.newTransaction.order_id.value = null;
				$scope.newTransaction.order_reference = { value: null };
				$scope.newTransaction.customer.selected = { id: 0, vue: null };
				
				// CHECK TO SEE IF MANUFACTURER IS IN LIST
				if( utils.toType(thisManufacturer) !== 'null' && thisUserGroup === 2 ){
					
					for( var i = 0; i < thisManufacturer.length; i++ ){
						var orderLength = parseInt(thisModule.paging.totalRecords + 1);
						
						if( thisManufacturer[i].id === thisEstablishment ){
							var order_reference = utils.padZerosToLength(thisLocation.id, 2, 0).toString(); 
							// order_reference += thisEstablishment.toString();
							order_reference += utils.padZerosToLength(orderLength, 5, 0).toString();

							$scope.newTransaction.order_reference.value = (order_reference).toString();
						}
						
					}
				}
            }
            
            /**
             *  MANUFACTURER LOGIN
             */
            if( thisUserGroup === 2 ){

                var manufacturerChild = {}, 
                    params = [];
                $scope.newTransaction.manufacturer.selected = angular.copy( thisManufacturer[0], manufacturerChild );
				
				if( thisManufacturer.length > 0 && thisEstablishment !== 0 ){
					params = [ 
						thisEstablishment,
						$scope.newTransaction.location.selected.id
					];
				}
				else{
					params = [ 
						$scope.newTransaction.manufacturer.selected.id,
						$scope.newTransaction.location.selected.id
					];
				}
                
				console.log( '|--------------------------------------|' );
                console.log( 'PARAMS >> ', params );

				
                self.productList( params, $scope ).then(function( products ){
                    console.log( '|--------------------------------------|' );
                    console.log( 'PRODUCTS >> ', products );
                    
                    $scope.newTransaction.productList = products.items;
                    $rootScope.assets[moduleName].products = products.items;
                });
				

            }
            /**/
            
            moduleName === 'transfers' ? 
                $scope.newTransaction.status.selected = { id: 5, value: 'Initiated' } : 
                $scope.newTransaction.status.selected = { id: 1, value: 'Entered' };
			
            console.log( '|--------------------------------------|' );
            console.log( 'SCOPE.NEW-TRANSACTIONS >> ', $scope.newTransaction );

            // BUILD THE HTML
            self.buildHtml( $scope );
        },

        // BUILD THE TRANSACTION PATCH/PUT OBJECT
        editTransaction: function( $scope, $event ){
            
            $scope.newTransaction = {};

            // console.log( '|----------------------------------------|' );
            // console.log( 'EDIT-TRANSACITON.SCOPE >> ', $scope );
            
            var self = this,
                thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                thisModal = thisModule.modal,
                idx = thisModal.index;
            
            // CLONE THIS-TRANSACTION
            $scope.newTransaction = angular.copy( $scope[moduleName][idx], $scope.newTransaction );
            
            var thisTransaction = $scope.newTransaction, 
                thisManufacturer = parseInt(thisTransaction.manufacturer.selected.id),
                thisCustomerType = parseInt(thisTransaction.customer_type_id),
				thisLocation = 0;
            
			/**
			 * TRANSFERS CAN SEND FROM ANY WAREHGOUSE SO 
			 * PULL THE INVENTORY FROM THE SHIPPING WAREHOUSE
			 * NOT THE CURRUNT MODULE LOCATION
			 */
			
			// thisLocation = parseInt(thisModule.location.id),
			moduleName === 'transfers' ? 
				thisLocation = parseInt(thisTransaction.from_warehouse.selected.id) : 
				thisLocation = parseInt(thisModule.location.id);
			
			console.log( 'PRODUCTS FROM WH ID >> ', thisLocation );
			
			
            var params = [ thisManufacturer, thisLocation ],
                lineItems = [],
                transactionItems = [],
                productList = [];
            
            // HACK************
            moduleName === 'orders' ? 
                thisTransaction.customer.selected.customer_type_id = thisCustomerType : null;
            
            // DO NOTES EXIST
            thisTransaction.notes.value.length === 'undefined' ? thisTransaction.notes.value = [] : null;
            
            thisTransaction.notes.value.length <= 0 ? 
                $scope.addNewNote = true : 
                $scope.addNewNote = false;
            
            // RETURN PRODUCT LIST
            // channels.productList(params).then(function(result){
                
                productList = thisTransaction.productList;
                
                // CLONE TRANSACTION-ITEMS
                angular.copy( $scope.newTransaction.products.value, lineItems );
                
                console.log( '|----------------------------------------|' );
                console.log( 'THIS-TRANSACTION >> ', thisTransaction );
                console.log( 'TRANSACTION-LINE-ITEMS >> ', lineItems );
                console.log( '|----------------------------------------|' );
                console.log( 'MANUFACTURER.PRODUCT-LIST >> ', productList );
                
                for( var i = 0; i < productList.length; i++ ){
                    var row = productList[i]; // THIS ROW
                    
                    for( var j = 0; j < lineItems.length; j++ ){
                        var item = lineItems[j]; // THIS LINE-ITEM
                        
                        // MATCH ROW TO LINE-ITEM
                        if( parseInt(item.id) === parseInt(row.id) ){
                            /*
                            console.log( '|----------------------------------------|' );
                            console.log( 'THIS-ROW >> ', row );
                            console.log( 'THIS-LINE-ITEM >> ', item );
                            */
                            // FORMAT LINE-ITEM QUANTITY | INVENTORY
                            item.quantity = parseInt(item.quantity);
                            item.inventory = parseInt(row.inventory);
                            item.nInventory = parseInt(item.inventory);
                            item.price = parseFloat(item.price).toFixed(2);
                            item.calculatedPrice = parseFloat(item.calculatedPrice).toFixed(2);
                            
                            // SET INVENTORY MIN | MAX CONTROLS
                            var ttlInventory = item.quantity + item.inventory;
                            item.max = ttlInventory;
                            item.min = 0;
                            
                            item.sku = row.sku;
                            item.upc = row.upc;
                            item.litres_per_bottle = Number(parseFloat(row.litres_per_bottle).toFixed(3));
                            item.litter_rate = Number(parseFloat(row.litter_rate).toFixed(3));
                            item.package_type = parseInt(row.package_type);
                            item.product_type = parseInt(row.product_type);
                            item.product = utils.stringCapitalise(row.product);
                            item.manufacturer_price = Number(parseFloat(row.manufacturer_price).toFixed(2));
                            item.retail_price = Number(parseFloat(row.retail_price).toFixed(2));
                            item.wholesale_price = Number(parseFloat(row.wholesale_price).toFixed(2));
                            item.id = row.id;
                            item.bottles_per_case = parseInt(row.bottles_per_case);
                            item.bottles_per_sku = parseInt(row.bottles_per_sku);
                            item.original_deliver_date = row.deliver_date;
                            
                            // LINE-ITEM TYPEAHEAD CONTENT
                            item.selected = row.selected;
                            
                            if( moduleName === 'orders' ){
                                // PRICING CALCULATIONS
                                var Tax = Number(parseFloat(0.05)), 
                                    Quantity = Number(parseInt(item.quantity)),
                                    Price = Number(parseFloat(item.calculatedPrice)),
                                    litter_rate = Number(parseFloat(item.litter_rate)),
                                    bpc = Number(parseInt(item.bottles_per_case)),
                                    bps = Number(parseInt(item.bottles_per_sku)),
                                    Deposit = Number( parseFloat(((litter_rate * bpc) / bps) * Quantity) );

                                console.log( 'parseFloat(((litter_rate * bpc) / bps) * quantity) >> ', Deposit );

                                item.Tax = Number(Tax);
                                item.totalDeposit = Number(parseFloat(Deposit));
                                item.subTotal = Number(parseInt(Quantity) * parseFloat(Price));
                                item.totalTax = Number( parseFloat(item.subTotal) * parseFloat(Tax) );
                                item.Total = Number( parseFloat(item.totalDeposit) + parseFloat(item.subTotal) + parseFloat(item.totalTax) );
                            }
                            
                            transactionItems.push(item);
                        }
                    }
                }
                
                console.log( '|----------------------------------------|' );
                console.log( 'TRANSACTION-ITEMS >> ', transactionItems );
                
                thisTransaction.products.value = transactionItems;
                
                if( moduleName === 'orders' ){
                    // CALCULATE TRANSACTION TOTALS
                    var totalDeposit = self.sumTransaction( transactionItems, 'totalDeposit'),
                        subTotal = self.sumTransaction( transactionItems, 'subTotal' ),
                        totalTax = self.sumTransaction( transactionItems, 'totalTax' ),
                        // Total = self.sumTransaction( transactionItems, 'Total' );
                        Total = parseFloat(subTotal) + parseFloat(totalDeposit) + parseFloat(totalTax);

                    thisTransaction.subTotal = Number(parseFloat(subTotal));
                    thisTransaction.Deposit = Number(parseFloat(totalDeposit));
                    thisTransaction.totalTax = Number(parseFloat(totalTax));
                    // thisTransaction.Total = Number(parseFloat(Total));
                    thisTransaction.Tax = Number(parseFloat(0.05));   
					
					thisTransaction.promo.value === false ? 
						thisTransaction.Total = Number(parseFloat(Total)) : 
						thisTransaction.Total = Number(parseFloat('0.00'));
                }
                
                // ADD EDIT OPTIONS
                var options = [];
                for( var i = 0; i < productList.length; i++ ){
                    var thisOption = {
                        id: productList[i].id,
                        value: productList[i].product,
                        sku: productList[i].sku,
                        inventory: productList[i].inventory,
                        retail_price: productList[i].retail_price,
                        manufacturer_price: productList[i].manufacturer_price,
                        wholesale_price: productList[i].wholesale_price
                    };
                    options.push(thisOption);
                }
                thisTransaction.options = options;
                
                // ADD MODAL DETAILS
                thisTransaction.method = thisModal.method;
                thisTransaction.modal = thisModal;
                
                // INSERT THE PRODUCT LIST
                thisTransaction.productList = productList;
                $scope.assets[moduleName].products = productList;
                
                // ADD OLD ITEMS
                var oItems = [];
                thisTransaction.oOrderItems = angular.copy(thisTransaction.products.value, oItems);
                
                // REPAIR DELIVER_DATE TO ACCOMMODATE THE DATE-PICKER
                var thisDeliverDate = thisTransaction.deliver_date.value,
                    deliver_date = { startDate: moment(new Date(thisDeliverDate)).format('YYYY-MM-DD'), endDate: null };
                thisTransaction.deliver_date = deliver_date;

            // });
            
            console.log( '|----------------------------------------|' );
            console.log( 'thisTransaction', thisTransaction );

            // BUILD THE HTML
            self.buildHtml( $scope );
            
        },
        
            // RETURN PRODUCT LIST
        productList: function( params, $scope ){
            var self = this, 
                deferred = $q.defer(),
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                thisRow = $scope.newTransaction,
                lineItems = thisRow.products.value,
                newItems = [],
                products = {},
                productList = [];
			
			console.log( '|--------------------------------------|' );
			console.log( 'SCOPE >> ', $scope );
			console.log( 'PARAMS >> ', params );
			

            // RETURN PRODUCT LIST
            channels.productList( params ).then(function( result ){ 
				
                console.log( '|--------------------------------------|' );
                console.log( 'CHANNEL.PRODUCT-LIST.RESULT >> ', result );
				console.log('SESSION-STORAGE-ESTABLISHMENT ID >. ', $window.sessionStorage.establishment );
                
                var TotalDeposit = Number(parseFloat('0.00')),
                    totalTax = Number(parseFloat('0.00')),
                    subTotal = Number(parseFloat('0.00')),
                    Total = Number(parseFloat('0.00')),
                    Tax = Number(parseFloat('0.05'));;

                // ADD THE PRODUCT LIST TO THIS ROW OBJECT
                // products.list = productList;
                // thisRow.productList = productList;
                // $rootScope.assets[moduleName].products = productList;
                
                productList = result[0].productList;
			
				console.log( '|--------------------------------------|' );
                console.log( 'PRODUCT-LIST >> ', productList );

                for( var i = 0; i < productList.length; i++ ){
                    var row = productList[i]; // THIS ROW

                    for( var j = 0; j < lineItems.length; j++ ){
                        var item = lineItems[j]; // THIS LINE-ITEM

                        // MATCH ROW TO LINE-ITEM
                        if( parseInt(item.id) === parseInt(row.id) ){

                            // FORMAT LINE-ITEM QUANTITY | INVENTORY
                            item.quantity = Number(parseInt(item.quantity));
                            item.inventory = Number(parseInt(row.inventory));
                            item.nInventory = Number(parseInt(item.inventory));
                            item.price = Number(parseFloat(item.price));
                            item.calculatedPrice = Number(parseFloat(item.calculatedPrice));

                            // SET INVENTORY MIN | MAX CONTROLS
                            var ttlInventory = Number(parseInt(item.quantity + item.inventory));
                            item.max = ttlInventory;
                            item.min = 0;

                            item.id = row.id;
                            item.sku = row.sku;
                            item.upc = row.upc;
                            item.litres_per_bottle = Number(parseFloat(row.litres_per_bottle));
                            item.litter_rate = Number(parseFloat(row.litter_rate));
                            item.package_type = Number(parseInt(row.package_type));
                            item.product_type = Number(parseInt(row.product_type));
                            item.product = utils.stringCapitalise(row.product.toLowerCase());
                            item.manufacturer_price = Number(parseFloat(row.manufacturer_price));
                            item.retail_price = Number(parseFloat(row.retail_price));
                            item.wholesale_price = Number(parseFloat(row.wholesale_price));
                            item.id = Number(parseInt(row.id));
                            item.bottles_per_case = Number(parseInt(row.bottles_per_case));
                            item.bottles_per_sku = Number(parseInt(row.bottles_per_sku));
                            item.original_deliver_date = moment(row.deliver_date).toISOString();

                            item.selected = row.selected;

                            // LINE-ITEM TYPEAHEAD CONTENT
                            item.selected = row.selected;

                            // PRICING CALCULATIONS
                            var Tax = Number(parseFloat(0.05)), 
                                Quantity = Number(parseInt(item.quantity)),
                                Price = Number(parseFloat(item.calculatedPrice)),
                                litter_rate = Number(parseFloat(item.litter_rate)),
                                bpc = Number(parseInt(item.bottles_per_case)),
                                bps = Number(parseInt(item.bottles_per_sku)),
                                Deposit = Number( parseFloat(((litter_rate * bpc) / bps) * Quantity) );

                            // console.log( 'parseFloat(((litter_rate * bpc) / bps) * quantity) >> ', Deposit );

                            item.Tax = Number(Tax);
                            item.totalDeposit = Number(parseFloat(Deposit));
                            item.subTotal = Number(parseInt(Quantity) * parseFloat(Price));
                            item.totalTax = Number( parseFloat(item.subTotal) * parseFloat(Tax) );
                            item.Total = Number( parseFloat(item.totalDeposit) + parseFloat(item.subTotal) + parseFloat(item.totalTax) );

                            newItems.push(item);
                        }
                    }
                }

                TotalDeposit = Number(parseFloat(mathService.sumTransaction(newItems, 'totalDeposit'))),
                totalTax = Number(parseFloat(mathService.sumTransaction(newItems, 'totalTax'))),
                subTotal = Number(parseFloat(mathService.sumTransaction(newItems, 'subTotal'))),
                Total = Number(parseFloat(subTotal) + parseFloat(TotalDeposit) + parseFloat(totalTax)),
                Tax = Number(parseFloat(0.05));


                // CALCULATE ROW TOTALS
                var math = {
                    Deposit: TotalDeposit,
                    totalTax: totalTax,
                    subTotal: subTotal,
                    Tax: Tax,
                    Total: Total
                };

                // RENDER TRANSACTION-ITEM-TOTALS
                thisRow.Deposit = math.Deposit;
                thisRow.totalTax = math.totalTax;
                thisRow.subTotal = math.subTotal;
                thisRow.Total = math.Total;
                thisRow.Tax = math.Tax;
                thisRow.productList = productList;
                $rootScope.assets[moduleName].products = productList;

                // ADD LINE-ITEMS TO THIS ROW OBJECT
                products.lineItems = newItems;
                products.items = productList;
                // ADD TRANSACTION TOTALS TO THIS ROW OBJECT
                products.math = math;
                
                deferred.resolve(products);

            });

            console.log( '|--------------------------------------|' );
            console.log( 'self.productList.promise >> ', deferred.promise );
            
            // return products;
            return deferred.promise;
        },
        
        // BUILD THE HTML STRING FOR THE MODAL WINDOW
        buildHtml: function( $scope ){
            // console.log( 'buildHtml.scope', $scope );
            var self = this, 
                thisModule = $scope.$parent.currentModule,
                moduleMethod = thisModule.modal.method,
                moduleName = thisModule.name, 
                str = '<div data-ng-include="\'views/modules/_partials/_transactions/_'+moduleMethod+moduleName+'Transactions.html\'"/>';

            modalService.launchModal( $scope, str );
            angular.element('#modalContainer').html($compile(str)($scope));
        },
        
		
    }
    
}]);