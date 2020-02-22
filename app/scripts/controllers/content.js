'use strict';
/**
 * @ngdoc function
 * @name clientApp.controller:contentController
 * @description
 * # contentController
 * Controller of the clientApp
 */

angular.module('clientApp').controller('contentController', [
	'$controller',
    '$rootScope',
    '$filter',
    '$q',
    '$timeout',
    '$scope',
    '$window',
    '$location',
    '$route',
    '$compile',
    'utils',
    'batches',
    'channels',
    'moment',
    'elements',
    'calculator',
    'growl',
    'moduleService',
    'contentService',
    'eventService',
    'domService',
    'editService',
    'errorService',
    'reportService',
    'comparisonService',
    'xlsService',

function ($controller, $rootScope, $filter, $q, $timeout, $scope, $window, $location, $route, $compile, utils, batches, channels, moment, elements, calculator, growl, moduleService, contentService, eventService, domService, editService, errorService, reportService, comparisonService, xlsService) {

		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];

		// BUILD THIS MODULE CONTENT
		if ($rootScope.profile) {
			// contentService.loadThisModule($route, $scope);
            contentService.loadModule( $route, $scope );
		} 
        else {
			$rootScope.profile = JSON.parse($window.sessionStorage.profile);
			$rootScope.credentials = JSON.parse($window.sessionStorage.credentials);
			$rootScope.permissions = JSON.parse($window.sessionStorage.permissions);
			$rootScope.locations = JSON.parse($window.sessionStorage.locations);
			$rootScope.system = JSON.parse($window.sessionStorage.system);

			// contentService.loadThisModule($route, $scope);
            contentService.loadModule( $route, $scope );
		}

		var thisModule = $scope.currentModule,
			moduleName = thisModule.name.toLowerCase(),
			moduleType = thisModule.type;

		// DEFINE MANUFACTURER HWH FLAG
		if (parseInt($rootScope.credentials.group_id) === 2) {

			var currManufacturer = $scope.currentModule.location.establishment_id,
				// currLocation = $scope.currentModule.location.id,
				userManufacturers = $rootScope.profile.manufacturers;

			for (var i = 0; i < userManufacturers.length; i++) {

				if ((userManufacturers[i].hasOwnProperty('id')) && (userManufacturers[i].id === currManufacturer)) {
					// positive test logic
					$scope.currentModule.hwh = true;
					$rootScope.profile.establishment = userManufacturers[i].id;
					$window.sessionStorage.establishment = userManufacturers[i].id;
					break;
				}

			}

		}

		/********************************************************
		 * SEARCH ASYNC TYPEAHEAD RESOURCE-SELECT
		 */
		$scope.asyncModule = function (term, key) {

			var deferred = $q.defer(),
				searchTerm = term.toLowerCase(),
				searchFilter = {
					key: key,
					module: moduleName,
					params: [
                    thisModule.location.id,
                    $rootScope.profile.establishment
                ],
					item: 'select'
				};

			if (searchTerm.length > 3) {

				$scope.selectShow(key);

				var arr = searchTerm.split(',');
				searchFilter.q = arr;

				console.log( '|----------------------------------------|' );
				console.log( 'SEARCH-FILTER >> ', searchFilter );

				channels.transactionSearch(searchFilter).then(function (response) {

					console.log('|----------------------------------------|');
					console.log('SEARCH-RESPONSE >> ', response);

					deferred.resolve(response);
					$scope.selectHide(key);

				}).catch(function (error) {

					console.log('|----------------------------------------|');
					console.log('SEARCH-ERROR >> ', error);

					var emptyFilter = [];
					deferred.resolve(emptyFilter);
					$scope.selectHide(key);

				});
			}

			return deferred.promise;
		};

		/********************************************************
		 * SEARCH ASYNC TYPEAHEAD TRANSACTION-SELECT
		 */
	
		// CUSTOM ESTABLISHMENT TYPES
		$scope.customEstablishmentTypes = {
			displayText: 'select manufacturer type...', 
			async: false,
			onSelect: function(response){
				var child = {}, 
					license_types = $rootScope.assets[moduleName].license_types,
					sub_types = $rootScope.assets[moduleName].license_sub_types;
				
				angular.copy(response, child);
				
				$scope.newResource.license_sub_types.selected = { id: 0, value: null };
				$scope.newResource.license_types.selected = { id: 0, value: null };
				
				// FORCE LICENSE_TYPES AND LICENSE_SUB_TYPES
				switch(response.id){
					case 37: // DISTRIBUTORS
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[0];
                        $scope.newResource.license_sub_types.selected = sub_types[11];
					break;
					case 1: // WINERIES
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[7];
						$scope.customLicenseSubTypes.displayText = 'select winery type... ';
					break;
					case 2: // BREWERIES
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[7];
						$scope.newResource.license_sub_types.selected = sub_types[8];
					break;
					case 3: // DISTILLERIES
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[7];
						$scope.customLicenseSubTypes.displayText = 'select distillery type... ';
					break;
				}
				
				console.log('|--------------------------------------|');
				console.log( 'ASSETS >> ', $rootScope.assets[moduleName] );
				console.log( 'CUSTOM-ESTABLISHMENT-TYPES >> ', response );
				console.log( 'CS-RESOURCE >> ', $scope.newResource );
			}
		}; 
	
		$scope.customLicenseSubTypes = {
			displayText: '',
			async: false,
			onSelect: function(response){
				var child = {};
				angular.copy(response, child );
				$scope.newResource.license_sub_types.selected = child;
				
				console.log('|--------------------------------------|');
				console.log( 'ASSETS >> ', $rootScope.assets[moduleName] );
				console.log( 'CUSTOM-LICENSE-SUB-TYPES >> ', response );
				console.log( 'CS-RESOURCE >> ', $scope.newResource );
			}
		};
	
		// CUSTOM LICENSE TYPES
		$scope.customLicenseTypes = {
			displayText: 'select license type...',
			async: false,
			onSelect: function( response ){
				var child = {};
				angular.copy(response, child);
				$scope.newResource.license_type.selected = child;

				console.log('|--------------------------------------|');
				console.log( 'CUSTOM-LICENSE-TYPES >> ', response );
				console.log('CS-RESOURCE >> ', $scope.newResource );

			}
		};
	
		// CUSTOMER CUtOMER TYPES
		$scope.customCustomerTypes = {
			displayText: 'select customer type...',
			async: false,
			onSelect: function( response ){
				var child = {};
				angular.copy(response, child);
				$scope.newResource.customer_type.selected = child;

				console.log('|--------------------------------------|');
				console.log( 'CUSTOM-LICENSE-TYPES >> ', response );
				console.log('CS-RESOURCE >> ', $scope.newResource );

			}
		};

		// CUSTOM ESTABLISHMENT TYPES
		$scope.customEstablishmentTypes = {
			displayText: 'select manufacturer type...', 
			async: false,
			onSelect: function(response){
				var child = {}, 
					license_types = $rootScope.assets[moduleName].license_types,
					sub_types = $rootScope.assets[moduleName].license_sub_types;

				angular.copy(response, child);

				$scope.newResource.license_sub_types.selected = { id: 0, value: null };
				$scope.newResource.license_types.selected = { id: 0, value: null };

				// FORCE LICENSE_TYPES AND LICENSE_SUB_TYPES
				switch(response.id){
					case 37: // DISTRIBUTORS
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[0];
					break;
					case 1: // WINERIES
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[7];
						$scope.customLicenseSubTypes.displayText = 'select winery type... ';
					break;
					case 2: // BREWERIES
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[7];
						$scope.newResource.license_sub_types.selected = sub_types[8];
					break;
					case 3: // DISTILLERIES
						$scope.newResource.establishment_types.selected = child;
						$scope.newResource.license_types.selected = license_types[7];
						$scope.customLicenseSubTypes.displayText = 'select distillery type... ';
					break;
				}

				console.log('|--------------------------------------|');
				console.log( 'ASSETS >> ', $rootScope.assets[moduleName] );
				console.log( 'CUSTOM-ESTABLISHMENT-TYPES >> ', response );
				console.log( 'CS-RESOURCE >> ', $scope.newResource );
			}
		}; 

		$scope.customLicenseSubTypes = {
			displayText: '',
			async: false,
			onSelect: function(response){
				var child = {};
				angular.copy(response, child );
				$scope.newResource.license_sub_types.selected = child;

				console.log('|--------------------------------------|');
				console.log( 'ASSETS >> ', $rootScope.assets[moduleName] );
				console.log( 'CUSTOM-LICENSE-SUB-TYPES >> ', response );
				console.log( 'CS-RESOURCE >> ', $scope.newResource );
			}
		};

		// CUSTOM LICENSE TYPES
		$scope.customLicenseTypes = {
			displayText: 'select license type...',
			async: false,
			onSelect: function( response ){
				var child = {};
				angular.copy(response, child);
				$scope.newResource.license_type.selected = child;

				console.log('|--------------------------------------|');
				console.log( 'CUSTOM-LICENSE-TYPES >> ', response );
				console.log('CS-RESOURCE >> ', $scope.newResource );

			}
		};

		// CUSTOMER CUtOMER TYPES
		$scope.customCustomerTypes = {
			displayText: 'select customer type...',
			async: false,
			onSelect: function( response ){
				var child = {};
				angular.copy(response, child);
				$scope.newResource.customer_type.selected = child;

				console.log('|--------------------------------------|');
				console.log( 'CUSTOM-LICENSE-TYPES >> ', response );
				console.log('CS-RESOURCE >> ', $scope.newResource );

			}
		};

		$scope.selectShow = function (el) {
			angular.element('span#load-' + el).show();
		};

		$scope.selectHide = function (el) {
			angular.element('span#load-' + el).hide();
		};

		$scope.asyncResource = function (term, key) {

			var deferred = $q.defer(),
				searchTerm = term.toLowerCase(),
				thisResource = $scope.newResource,
				searchFilter = {
					key: key,
					module: moduleName,
					params: [],
					item: 'select'
				};

			console.log('|----------------------------------------|');
			console.log('THIS-RESOURCE >> ', thisResource);

			if (searchTerm.length > 3) {

				$scope.selectShow(key);

				var arr = searchTerm.split(',');
				searchFilter.q = arr;

				console.log('|----------------------------------------|');
				console.log('searchFilter >> ', searchFilter);

				channels.resourceSearch(searchFilter).then(function (response) {

					console.log('|----------------------------------------|');
					console.log('TYPE >> ', utils.toType(response));
					console.log('|----------------------------------------|');
					console.log('RESPONSE >> ', response);

					utils.toType(response) !== 'null' ? $scope.selectHide(key) : null;

					deferred.resolve(response);

				}).catch(function (error) {

					console.log('|----------------------------------------|');
					console.log('SEARCH-ERROR >> ', error);

					var emptyFilter = [];
					deferred.resolve(emptyFilter);
					$scope.selectHide(key);

				});

			}

			return deferred.promise;
		};

		$scope.asyncTransaction = function (term, key) {

			var deferred = $q.defer(),
				searchTerm = term.toLowerCase(),
				thisTransaction = $scope.newTransaction,
				searchFilter = {
					key: key,
					module: moduleName,
					params: [
                    thisTransaction.location.selected.id,
                    thisTransaction.manufacturer.selected.id || 0
                ],
					item: 'select'
				};

			if (searchTerm.length > 3) {

				$scope.selectShow(key);

				var arr = searchTerm.split(',');
				searchFilter.q = arr;

				console.log('|----------------------------------------|');
				console.log('searchFilter >> ', searchFilter);

				channels.transactionSearch(searchFilter).then(function (response) {

					console.log('|----------------------------------------|');
					console.log('RESPONSE >> ', response);

					utils.toType(response) !== 'null' ? $scope.selectHide(key) : null;

					deferred.resolve(response);

				}).catch(function (error) {

					console.log('|----------------------------------------|');
					console.log('SEARCH-ERROR >> ', error);

					var emptyFilter = [];
					deferred.resolve(emptyFilter);
					$scope.selectHide(key);

				});
			}

			return deferred.promise;
		};
        
        
        /********************************************************
         * AUTHOR: James Van Leuven <james.mendham@directtap.com>
         * DATE: 2017-09-28
         * REPORT CUSTOM-SELECT SEARCH RESULTS
         * app/scripts/controllers/content.js :: $scope.asyncReportFilter
         * app/scripts/factory/channels.js :: filterReportSearch
         * sockets/index.js :: filterReportSearch
         */
        $scope.reportFilterproductsOptions = {
            displayText: 'select product or sku',
            async: true,
            onSelect: function(response){
                
                console.log('|--------------------------------------|');
				console.log( 'ROOTSCOPE >> ', $rootScope );
				console.log( 'SCOPE >> ', $scope );
				console.log( 'RESPONSE >> ', response );
                
                $scope.currentModule.report.product = response.selected;
                $scope.filterItems.product = response.selected;
                
            }
        };
        
        $scope.reportFiltermanufacturersOptions = {
            displayText: 'select manufaturer or license number',
            async: true,
            onSelect: function(response){
                
                console.log('|--------------------------------------|');
				console.log( 'ROOTSCOPE >> ', $rootScope );
				console.log( 'SCOPE >> ', $scope );
				console.log( 'RESPONSE >> ', response );
                
                $scope.currentModule.report.manufacturer = response.manufacturer;
                $scope.filterItems.manufacturer = response.manufacturer;
                
            }
        };
        
        $scope.asyncReportFilter = function( term, key ){
            
            var deferred = $q.defer(),
                group = $rootScope.credentials.group_id,
                role = $rootScope.credentials.role_id,
                filter = $scope.filter,
                filterItems = $scope.filterItems,
                report = $scope.currentModule.report,
                searchTerm = term.toLowerCase(),
                searchFilter = {};
            
            console.log( '|---------------------------------|' );
            console.log( 'GROUP|ROLE >> ', group, role );
            console.log( 'FILTER >> ', filter );
            console.log( 'FILTER-ITEMS >> ', filterItems );
            console.log( 'REPORT >> ', report );
            console.log( 'SEARCH-TERM >> ', searchTerm );
            
            if(searchTerm.length > 3){
                
                searchFilter = {
                    manufacturer: filterItems.manufacturer.id,
                    location: filterItems.location.id,
                    key: key,
                    q: searchTerm.toLowerCase()
                };
                
                
                console.log( '|---------------------------------|' );
                console.log( 'SEARCH-FILTER >> ', searchFilter );
                
                channels.filterReportSearch(searchFilter).then(function(response){
                    
                    console.log( '|---------------------------------|' );
                    console.log( 'ASYNC-REPORT-SEARCH.RESPONSE >>', response );
                    
                    utils.toType(response) !== 'null' ? $scope.selectHide(key) : null; 
                    deferred.resolve(response);
                    
                })
                .catch(function(error){
                    
                    console.log('|----------------------------------------|');
                    console.log('SEARCH-ERROR >> ', error);

                    var emptyFilter = [];
                    deferred.resolve(emptyFilter);
                    
                });
                
            }
            
            return deferred.promise;
            
        };

		/*******************************************************/
		// CUSTOM FILTER TYPEAHEAD
		$scope.asyncFilter = function (term, key) {

			var deferred = $q.defer(),
				searchTerm = term.toLowerCase(),
				searchFilter = {
					key: key,
					module: moduleName
				};

			if (searchTerm.length > 3) {

				searchFilter.q = term;

				console.log('|----------------------------------------|');
				console.log('searchFilter >> ', searchFilter);

				channels.filterSearch(searchFilter).then(function (response) {

						console.log('|----------------------------------------|');
						console.log('ASYNC-FILTER.RESPONSE >> ', response);

						utils.toType(response) !== 'null' ? 
							$scope.selectHide(key) : 
							null;

						deferred.resolve(response);

					})
					.catch(function (error) {

						console.log('|----------------------------------------|');
						console.log('SEARCH-ERROR >> ', error);

						var emptyFilter = [];
						deferred.resolve(emptyFilter);

					});

			}

			return deferred.promise;

		};
        
		$scope.manufacturerFilterOptions = {
			displayText: 'select manufacturer...',
			async: true,
			onSelect: function(response){
				
				var child = {}, 
					thisManufacturer = thisModule.elements.manufacturer;
				
				console.log('|--------------------------------------|');
				console.log( 'ROOTSCOPE >> ', $rootScope );
				console.log( 'SCOPE >> ', $scope );
				console.log( 'RESPONSE >> ', response );

				thisManufacturer.selected = {};
				thisManufacturer.selected = angular.copy( response, child );
				
			}
		};
        
		$scope.customerFilterOptions = {
			displayText: 'select customer...',
			async: true,
			onSelect: function(response){
				
				var child = {},
					thisCustomer = thisModule.elements.customer;
				
				console.log('|--------------------------------------|');
				console.log( 'ROOTSCOPE >> ', $rootScope );
				console.log( 'SCOPE >> ', $scope );
				console.log( 'RESPONSE >> ', response );

				thisCustomer.selected = {};
				thisCustomer.selected = angular.copy( response, child );
				
			}
		};

		/*******************************************************/
		// ORDERS MODULE (CUSTOMERS)
		$scope.customCustomersOptions = {
			displayText: 'select customer...',
			async: true,
			onSelect: function (response) {

				console.log('|--------------------------------------|');
				console.log('CS-CUSTOMER.THIS-TRANSACTION >> ', $scope.newTransaction);

				var userGroup = $rootScope.credentials.group_id,
					lineItems = $scope.newTransaction.products.value,
					price_type = response.customer_type_id,
					arrTypes = [1],
					child = {},
					dAvailable = [],
					price = '0.00',
					calcPrice = '0.00',
					bpc = 0,
					bps = 0,
					qty = 0;

				// SIMPLE HACK FOR LICENSE NUMBER ON VALUE OBJECT
				var newValue = response.value + ' (LIC: ' + response.license_number + ')';
				response.value = newValue;
				

				child = angular.copy(response, child);
				dAvailable = utils.nextDeliveryDay(child.delivery_days);

				console.log('|--------------------------------------|');
				console.log('dAVAILABLE >> ', dAvailable);

				// INSERT DELIVER DATE
				$scope.newTransaction.deliver_date = dAvailable[0].date;
				$scope.newTransaction.available_date = dAvailable;
				$scope.newTransaction.customer.selected = child;

				// RECALCULATE TOTALS ON CUSTOMER CHANGE SELECT
				if (lineItems.length >= 1 && lineItems[0].id !== 0) {
					for (var i = 0; i < lineItems.length; i++) {
						arrTypes.indexOf(Number(price_type)) !== -1 ?
							lineItems[i].price = parseFloat(lineItems[i].retail_price) :
							lineItems[i].price = parseFloat(lineItems[i].wholesale_price); // WHOLESALE

						price = parseFloat(lineItems[i].price);
						bpc = parseInt(lineItems[i].bottles_per_case);
						bps = parseInt(lineItems[i].bottles_per_sku);
						qty = parseInt(lineItems[i].quantity);

						calcPrice = Number(((price * bpc) / bps) * qty);
						// console.log( 'CALCULATED-PRICE >> ', calcPrice);

						lineItems[i].calculatedPrice = parseFloat(calcPrice);

						// console.log( 'LINE-ITEM[' + i + '] >> ', lineItems[i] );

						$scope.getTotal('quantity', i);
					}

				} else {
					// MANUFACTURER LOGIN WITH ZERO LINE-ITEMS
					userGroup === 2 && lineItems.length === 0 ? $scope.addRow() : null;
				}

			}
		};
		// ORDERS MODULE (MANUFACTURERS)
		$scope.customManufacturersOptions = {
			displayText: 'select manufacturer... ',
			async: true,
			onSelect: function (response) {

				console.log('|--------------------------------------|');
				console.log('CS-MANUFACTURER.THIS-TRANSACTION >> ', $scope.newTransaction);

				switch (thisModule.type) {
					case 2:
						var child = {},
							thisLocation = $scope.newTransaction.location.selected;
						
						// CHANGE THE EXISTING MANUFACTURER_INFO OBJECT
						var manufacturerInfo = {
							address: response.full_address,
							auto_invoicing: response.auto_invoicing,
							delivery_days: response.delivery_days,
							hwh: response.hwh,
							store_number: response.store_number,
							id: response.id,
							license_number: response.license_number,
							value: response.value,
							count: {
								orders: response.totalorders,
								transfers: response.totaltransfers
							}
						};
						
						angular.copy(response, child);

						$scope.newTransaction.subTotal = 0;
						$scope.newTransaction.Tax = 0.05;
						$scope.newTransaction.Deposit = 0;
						$scope.newTransaction.Total = 0;
						$scope.newTransaction.subTotal = 0.00;
						$scope.newTransaction.totals = 0.00;
						$scope.newTransaction.totalTax = 0.00;
						$scope.newTransaction.totalDeposit = 0.00;
						$scope.newTransaction.manufacturer.selected = child;
						$scope.newTransaction.products.value = [];
                        
                        utils.toType($scope.newTransaction.manufacturer_info) === 'undefined' ?
                            $scope.newTransaction.manufacturer_info = [ manufacturerInfo ] : 
                            $scope.newTransaction.manufacturer_info[0] = manufacturerInfo;
						
						/**
						 * AUTO-INVOICING TEST ON MANUFACTURER SELECT FOR ORDERS
						 */
						if( manufacturerInfo.auto_invoicing === true && moduleName === 'orders' ){
							var order_reference = utils.padZerosToLength(thisLocation.id, 2, 0).toString();
							// order_reference += manufacturerInfo.id.toString();
							order_reference += utils.padZerosToLength((manufacturerInfo.count.orders + 1), 5, 0).toString();

							$scope.newTransaction.order_reference.value = ('1' + order_reference).toString();
						}

						// RETRIEVE PRODUCT LIST
						var params = [
							manufacturerInfo.id,
							thisLocation.id
						];

						console.log('|--------------------------------------|');
						console.log('SOCKET-PARAMS >> ', params);
						console.log( 'ASSETS >> ', $scope.assets[moduleName] );

						channels.productList(params).then(function (result) {

							console.log('|--------------------------------------|');
							console.log('CUSTOM-MANUFACTURERS.PRODUCT-LIST.RESULT >> ', result);

							// ADD FIRST ROW ON MANUFACTURER SELECT
							$scope.assets[moduleName].products = result[0].productList;
							$scope.newTransaction.productList = result[0].productList;
							$scope.addRow();

						}).catch(function (error) {
							console.log('|----------------------------------------|');
							console.log('error:: ', error);
						});


					break;
				}
			}
		};

		$scope.provinceFilterOptions = {
			displayText: 'select state/province...',
			async: true,
			onSelect: function (response) {
				var child = {};
					// thisObject = (moduleType === 1) ? thisObject = $scope.newResource : thisObject = $scope.newTransaction;

				console.log('|--------------------------------------|');
				console.log( 'PROVINCE RESPONSE >> ', response );
				console.log( 'THIS ELEMENT > ', thisModule.elements );
				// console.log( 'THIS-OBJECT >> ', thisObject );

				thisModule.elements.province.selected = angular.copy(response, child);
				// thisObject.full_address.province = angular.copy(response, child);
			}
		};

		$scope.cityFilterOptions = {
			displayText: 'select city/municipality...',
			async: true,
			onSelect: function (response) {
				var child = {},
					thisCity = thisModule.elements.city;
				
				thisCity.selected = {};

				console.log('|--------------------------------------|');
				console.log( 'CITY RESPONSE >> ', response );
				console.log( 'THIS ELEMENT > ', thisModule.elements );

				thisCity.selected = angular.copy(response, child);
			}
		};
		/*******************************************************/

		/**
		 *   --- THIS IS A TEMP HACK ---
		 *  ALL WATCHERS NEED TO BE BOUND IN
		 *  THEIR OWN SERVICE AS watcherServices.js
		 */

		// PACKAGE TYPES
		$scope.customPackageOptions = {
			displayText: 'Select Package Type',
			async: true
			// onSelect: function(response){
			// console.log( 'customPacakgeOptions.response', response );
			// }
		};
		// LOCATIONS
		$scope.customLocationOptions = {
			displayText: 'Select a Warehouse',
			async: true,
			onSelect: function (response) {

				var child = {},
					dAvailable = [],
					thisTransaction = $scope.newTransaction;

				console.log('|--------------------------------------|');
				console.log('THIS-TRANSACTION >> ', thisTransaction);
				console.log('customLocationOptions.response', response);

				angular.copy(response, child);
				dAvailable = utils.nextDeliveryDay(child.delivery_days);
				console.log('|--------------------------------------|');
				console.log('CUSTOM-LOCATION-OPTIONS.DAVAILABLE >> ', dAvailable);
				$scope.newTransaction.deliver_date = dAvailable[0].date;
			}
		};
		// TRANSERS (TYPES)
		$scope.transferTypeOptions = {
			displayText: 'Select a Transfer Type',
			async: true,
			onSelect: function (response) {
				// COPY THE RESPONSE INTO THE TRANSFER OBJECT
				var child = {},
					dAvailable = [],
					thisTransaction = $scope.newTransaction,
					locations = $rootScope.profile.locations,
					manufacturer = thisTransaction.manufacturer,
					establishment = $rootScope.profile.establishment,
					credentials = $rootScope.credentials,
					warehouse = $scope.currentModule.location;

				console.log('|--------------------------------------|');
				console.log('THIS-TRANSACTION >> ', thisTransaction);
				console.log( 'ASSETS >> ', $rootScope.assets[moduleName] );
				console.log( '|--------------------------------------|' );
				console.log( 'TRANSFER-TYPE.CREDENTIALS >> ', credentials );
				console.log( 'TRANSFER-TYPE.ESTABLISHMENT >> ', establishment );
				console.log( 'TRANSFER-TYPE.MANUFACTURER >> ', manufacturer );
				console.log( 'TRANSFER-TYPE.LOCATIONS >> ', locations );
				console.log( 'TRANSFER-TYPE.WAREHOUSE >> ', warehouse );

				angular.copy(response, child);
				$scope.newTransaction.transfer_type.selected = child;

				// IF MANFACTURER GROUP LOGIN
				if (credentials.group_id === 2) {

					var manufacturer_hwh = {};

					for (var m = 0; m < locations.length; m++) {
						if (parseInt(locations[m].establishment_id) === parseInt(establishment)) {
							manufacturer_hwh = locations[m];
						}
					}

					console.log( '|--------------------------------------|' );
					console.log( 'MANUFACTURER-HWH >> ', manufacturer_hwh );

					switch (child.id) {
						case 1: // WAREHOUSE TO WAREHOUSE
							console.log('|--------------------------------------|');
							console.log('MANUFACTURER GROUP :: W2W');
							$scope.newTransaction.from_warehouse.selected = warehouse;
							$scope.newTransaction.to_warehouse.selected = warehouse;

							// SELECT LOCATION DELIVERY DAYS
							dAvailable = utils.nextDeliveryDay(warehouse.delivery_days);
							$scope.newTransaction.deliver_date = dAvailable[0].date;
							$scope.newTransaction.location = {
								selected: warehouse,
								input: 'select'
							};
							$scope.newTransaction.status.selected = {
								id: 5,
								value: 'Initiated'
							};
							break;
						case 2: // PRODUCTION
							console.log('|--------------------------------------|');
							console.log('MANUFACTURER GROUP :: PRODUCTION');
							var ddOptions = manufacturer_hwh.delivery_days;
								
							dAvailable = utils.nextDeliveryDay(ddOptions);
							
							
							console.log('|--------------------------------------|');
							console.log( 'ddOptions >> ', ddOptions );
							console.log( 'dAvailable >> ', dAvailable );

							$scope.newTransaction.deliver_date = dAvailable[0].date;
							$scope.newTransaction.from_warehouse.selected = manufacturer_hwh;
							$scope.newTransaction.to_warehouse.selected = warehouse;
							$scope.newTransaction.location = {
								selected: manufacturer_hwh,
								input: 'select'
							};
							$scope.newTransaction.status.selected = {
								id: 5,
								value: 'Initiated'
							};
							break;
						case 3: // MANUAL ADJUSTMENT
							console.log('|--------------------------------------|');
							console.log('MANUFACTURER GROUP :: MANUAL ADJUSTMENT');
							$scope.newTransaction.deliver_date = {
								start: moment(new Date()).toISOString(),
								end: moment(new Date()).toISOString()
							};
							$scope.newTransaction.location = warehouse;
							$scope.newTransaction.from_warehouse.selected = manufacturer_hwh;
							$scope.newTransaction.to_warehouse.selected = manufacturer_hwh;
							$scope.newTransaction.location = {
								selected: manufacturer_hwh,
								input: 'select'
							};
							$scope.newTransaction.status.selected = {
								id: 8,
								value: 'Adjustment'
							};
							$scope.newTransaction.reason = {
								selected: {
									id: 0,
									value: ""
								},
								input: 'select'
							};
							break;
					}

					/**
					 *  RETURN THE PRODUCT LIST FOR THE MANUFACTURER GROUP
					 *  NOTE:
					 *      WE HAVE TO CLEAR THE PRODUCT LIST BEFORE WE CAN
					 *      ADD A ROW, BECAUSE IT WILL SIMPLY ADD ANOTHER
					 *      ROW ON TRANSFER-TYPE CHANGE
					 */
					var params = [];
					if (parseInt($rootScope.profile.establishment) !== 0) {

						// RETRIEVE PRODUCT LIST
						params = [
							parseInt($window.sessionStorage.establishment),
							$scope.newTransaction.location.selected.id
                    	];

						console.log( '|--------------------------------------|' );
						console.log( 'SOCKET-PARAMS >> ', params );
						console.log( 'ASSETS >> ', $scope.assets[moduleName] );

						// CLEAR THE LINE-ITEMS & ASSETS FIRST
						// $scope.newTransaction.products.value = [];
						// $scope.assets[moduleName].products = [];

						channels.productList(params).then(function (result) {
							// ADD FIRST ROW ON MANUFACTURER SELECT
							$scope.assets[moduleName].products = result[0].productList;
							$scope.newTransaction.productList = result[0].productList;
							$scope.newTransaction.products.value.length === 0 ?
								$scope.addRow() : null;

						}).catch(function (error) {
							console.log('|----------------------------------------|');
							console.log('error:: ', error);
						});
					}
				} else { // CURRENTLY SELECTED MANUFACTURER (SYSADMIN - DISTRIBUTOR)
					var hwh = {},
						thisManufacturer = parseInt(manufacturer.selected.id);
					for (var a = 0; a < locations.length; a++) {
						if (parseInt(locations[a]) === parseInt(thisManufacturer)) {
							hwh = locations[a];
						}
					}

					switch (child.id) {
						case 2: // PRODUCTION
							dAvailable = utils.nextDeliveryDay(manufacturer.selected.delivery_days);
							$scope.newTransaction.deliver_date = dAvailable[0].date;
							$scope.newTransaction.from_warehouse.selected = hwh;
							$scope.newTransaction.to_warehouse.selected = warehouse;
							$scope.newTransaction.status.selected = {
								id: 5,
								value: 'Initiated'
							};
							break;
						case 3: // MANUAL ADJUSTMENT
							// CREATE NEW ASSET
							$rootScope.assets[moduleName].reasons = [
								{
									id: 1,
									value: 'Damage'
								},
								{
									id: 2,
									value: 'Reconciliation'
								},
								{
									id: 3,
									value: 'Missing'
								},
								{
									id: 4,
									value: 'Other'
								}
                        ];
							// SET VALUES
							$scope.newTransaction.deliver_date = {
								start: moment(new Date()).toISOString(),
								end: moment(new Date()).toISOString()
							};
							$scope.newTransaction.from_warehouse.selected = warehouse;
							$scope.newTransaction.to_warehouse.selected = warehouse;
							$scope.newTransaction.location = warehouse;
							$scope.newTransaction.status.selected = {
								id: 8,
								value: 'Adjustment'
							};
							$scope.newTransaction.reason = {
								selected: {
									id: 0,
									value: ""
								},
								input: 'select'
							};
							break;
						default:
							$scope.newTransaction.from_warehouse.selected = warehouse;
							$scope.newTransaction.to_warehouse.selected = warehouse;

							// SELECT LOCATION DELIVERY DAYS
							dAvailable = utils.nextDeliveryDay(warehouse.delivery_days);
							// console.log( '|--------------------------------------|' );
							// console.log( 'TRANSFERTYPEOPTIONS.dAVAILABLE >> ', dAvailable );
							$scope.newTransaction.deliver_date = dAvailable[0].date;
							$scope.newTransaction.location = warehouse;
							$scope.newTransaction.status.selected = {
								id: 5,
								value: 'Initiated'
							};
					}
				}

			}
		};

		// PRODUCTS RESOURCE MODULE
		$scope.customManufacturerProducts = {
			displayText: 'Select a Manufacturer',
			async: true,
			onSelect: function (response) {
                
                switch(moduleName){
                    case 'products':
                        $rootScope.profile.establishment = response;
                        $window.sessionStorage.establishment = response.id;
                        $route.reload();
                    break;
                    case 'reports': 
                        console.log('|--------------------------------------|');
                        console.log( moduleName + ' SELECT >> ', response );
                    break;
                }
			}
		};

		// ORDERS MODULE
		$scope.customProductOptions = {
			displayText: 'Select a Product',
			async: true,
			onSelect: function (response) {

				console.log('|--------------------------------------|');
				console.log('THIS-TRANSACTION >> ', $scope.newTransaction);

				var self = this,
					idx = parseInt(self.idx),
					price_type,
					arrTypes = [1], // retail
					price = '0.00',
					calcPrice = '0.00',
					bpc = 0,
					bps = 0,
					qty = 0;

				moduleName === 'orders' ?
					price_type = parseInt($scope.newTransaction.customer.selected.customer_type_id) : null;


				console.log('|----------------------------------------|');
				console.log('NEW-TRANSACTION >> ', $scope.newTransaction.products.value);
				console.log('idx >> ', idx);
				console.log('self >> ', self);

				if (utils.toType($scope.newTransaction.products.value) !== 'undefined' || $scope.newTransaction.products.value.length > 0) {
					var selectedId = response.id,
						selectedSku = response.sku,
						existingItems = $scope.newTransaction.products.value;

					// TEST FOR DUPLICATES
					angular.forEach(existingItems, function (row, key ) {
						
						console.log( 'EXISTING ITEMS[' + key + '] >> ', row );

						if (parseInt(row.id) === parseInt(selectedId) && row.sku === selectedSku) {

							$window.alert('You\'ve already selected this product in row ' + (key + 1));
							$scope.removeRow((0)); // THE ROW IS INSERTED TO POSITION 1 SO REMOVE POSITION 1

						} else {

							if (moduleName === 'orders') {

								console.log('arrTypes.indexOf(Number(price_type) >> ', arrTypes.indexOf(Number(price_type)));

								arrTypes.indexOf(Number(price_type)) !== -1 ?
									response.price = parseFloat(response.retail_price) :
									response.price = parseFloat(response.wholesale_price);

								price = parseFloat(response.price);
								bpc = parseInt(response.bottles_per_case);
								bps = parseInt(response.bottles_per_sku);
								qty = parseInt(response.quantity);
								calcPrice = Number(((price * bpc) / bps) * qty);
								
								response.calculatedPrice = parseFloat(calcPrice);
							}

							$scope.newTransaction.products.value[idx] = response;
							$scope.getTotal('quantity', idx);

						}

					});
				} else {
					if (moduleName === 'orders') {

						console.log('arrTypes.indexOf(Number(price_type) >> ', arrTypes.indexOf(Number(price_type)));

						arrTypes.indexOf(Number(price_type)) !== -1 ?
							response.price = parseFloat(response.retail_price).toFixed(2) :
							response.price = parseFloat(response.wholesale_price).toFixed(2);

						price = parseFloat(price);
						bpc = parseInt(response.bottles_per_case);
						bps = parseInt(response.bottles_per_sku);
						qty = parseInt(response.quantity);

						/*
						console.log( '|----------------------------------------|' );
						console.log( 'THIS-CUSTOMER >> ', $scope.newTransaction.customer );
						console.log( 'PRICE-TYPE >> ', price_type );
						console.log( 'PRICE >> ', price );
						console.log( 'BPC >> ', bpc );
						console.log( 'BPS >> ', bps );
						console.log( 'QTY >> ', qty );
						*/

						calcPrice = Number(((price * bpc) / bps) * qty);
						console.log('CALCULATED-PRICE >> ', calcPrice);

						response.calculatedPrice = parseFloat(calcPrice).toFixed(2);

						console.log('THIS-LINE-ITEM >> ', response);
					}

					$scope.newTransaction.products.value[idx] = response;
					$scope.getTotal('quantity', idx);
				}
			}
		};

		// PACKAGE TYPES
		$scope.filterPackage = function (term) {
			var deferred = $q.defer(),
				thisFilterObject = $rootScope.assets[moduleName].package_type,
				thisFilterTerm = term.toLowerCase();

			if (!term) {
				var emptyFilter = [];
				deferred.resolve(emptyFilter);
			} else {
				if (utils.toType(thisFilterObject) === 'array') {
					$timeout(function () {
						var filterResults = [];
						for (var i = 0; i < thisFilterObject.length; i++) {
							var thisFilterOption = thisFilterObject[i].value.toLowerCase();

							thisFilterOption.indexOf(thisFilterTerm) > -1 ?
								filterResults.push(thisFilterObject[i]) : null;
						}

						deferred.resolve(filterResults);

					}, 300);
				}
			}

			return deferred.promise;
		};
		// WAREHOUSE
		$scope.filterWarehouse = function (term) {
			var deferred = $q.defer(),
				thisFilterObject = $rootScope.profile.locations,
				thisFilterTerm = term.toLowerCase();

			if (!term) {
				var emptyFilter = [];
				deferred.resolve(emptyFilter);
			}

			$timeout(function () {
				var filterResults = [];
				for (var i = 0; i < thisFilterObject.length; i++) {
					var thisFilterOption = thisFilterObject[i].value.toLowerCase();

					thisFilterOption.indexOf(thisFilterTerm) > -1 ?
						filterResults.push(thisFilterObject[i]) : null;
				}

				deferred.resolve(filterResults);

			}, 300);

			return deferred.promise;

		};

		// CUSTOMERS
		$scope.filterCustomers = function (term) {
			var deferred = $q.defer();

			if (!term) {
				var emptyFilter = [];
				deferred.resolve(emptyFilter);
			} else {

				$timeout(function () {
					var filterResults = [],
						thisFilterObject = $rootScope.assets[moduleName].productList;
					// thisFilterTerm = term.toLowerCase();

					for (var i = 0; i < thisFilterObject.length; i++) {
						if (thisFilterObject[i].product) {

							// var thisFilterOption = thisFilterObject[i].product.toLowerCase();
							// thisFilterOption.indexOf(thisFilterTerm) > -1 ?
							filterResults.push(thisFilterObject[i]); // : null;
						}
					}
					deferred.resolve(filterResults);

				}, 300);
			}

			return deferred.promise;
		};
		
		// PRODUCTS
		$scope.filterProducts = function (term) {
			var deferred = $q.defer();

			if (!term) {
				var emptyFilter = [];
				deferred.resolve(emptyFilter);
			} else {

				$timeout(function () {
					var filterResults = [],
						thisFilterObject = $rootScope.assets[moduleName].productList;
					// thisFilterTerm = term.toLowerCase();

					for (var i = 0; i < thisFilterObject.length; i++) {
						if (thisFilterObject[i].product) {

							// var thisFilterOption = thisFilterObject[i].product.toLowerCase();
							// thisFilterOption.indexOf(thisFilterTerm) > -1 ?
							filterResults.push(thisFilterObject[i]); // : null;
						}
					}
					deferred.resolve(filterResults);

				}, 300);
			}

			return deferred.promise;
		};
		
		//GEOADDRESSING FOR FORMS
		$scope.asyncAddressing = function(term){
			
			var deferred = $q.defer(),
				searchTerm = term.toLowerCase();
			
			console.log( 'TERM >> ', term );
			
			if(term.length >= 3 ){
				
				searchTerm = (searchTerm + ', canada').toString(); 
				
				utils.GetLocation(searchTerm).then(function(results){
					deferred.resolve(results);
				}).catch(function(error){
					deferred.reject(error);
				});

			}
			
			return deferred.promise;
			
		};
		
		$scope.resourceAddressingOptions = {
			displayText: 'begin typing address...', 
			async: false,
			onSelect: function(response){
				
				console.log( '|----------------------|' );
				console.log( 'resourceAddressingOptions: ', response );
				
				var thisObject = {};
				
				moduleType === 1 ? 
					thisObject = $scope.newResource : 
					thisObject = $scope.newTransaction;
				
				console.log( 'THIS-OBJECT >> ', thisObject );
				
				// RETURN THE CITY / PROVINCE INFORMATION
				channels.addressSearch(response).then(function (data){
					
					console.log( '|----------------------|' );
					console.log( 'CHANNELS.ADDRESS-SEARCH.DATA >> ', data );
					
					thisObject.address.value = response.value;
					thisObject.full_address.street.value = response.value;
					
					if(utils.toType(data.code) !== 'undefined' ){
						if( data.code === 0 ){
							var str = data.message;
							str += '\nPlease select the city and province';
							$window.alert( str );
						}
					}
					else{
						var thisAddress = data,
							thisStreet = { id: 0, value: thisAddress.street };
						
						// STREET IS NULL
						( utils.toType(thisStreet.value) === 'null' ) ? thisStreet = { id: -1, value: response.street } : null;

						console.log( '|----------------------|' );
						console.log( 'Channel.addressSearch.data > ', thisAddress );
						
						thisObject.full_address.city = thisAddress.city;
						thisObject.full_address.province = thisAddress.province;
						thisObject.full_address.zipcode = response.zipcode;
						thisObject.address.value = response.value;
						thisObject.full_address.street = {
							id: thisStreet.id,
							value: thisStreet.value,
							lng: response.lng,
							lat: response.lat,
							address: response.value
						};
						
						console.log( '|----------------------|' );
						console.log( 'ADDRESS >> ', thisObject.address );
						console.log( 'FULL-ADDRESS >> ', thisObject.full_address );


						/**
						 * STREET CAN RETURN NULL IF NEVER ENTERED
						 * INTO THE SYS-ADDRESSES TABLE AND/OR A
						 * SPELLING VARIATION, WHICH ALSO CAN OCCUR
						 *
						
						thisObject.full_address.city = thisAddress.city;
						thisObject.full_address.province = thisAddress.province;
						thisObject.full_address.zipcode = response.zipcode;
						thisObject.full_address.street = thisAddress.street;

						if( utils.isNull(thisAddress.city) === false ){
							thisObject.full_address.street = {
								id: thisAddress.id,
								value: thisAddress.street,
								lng: response.lng,
								lat: response.lat,
								address: response.value
							};
						}
						else{
							thisObject.full_address.street.value = thisAddress.street;
						}

						if( moduleName === 'customers' ){
							
							( utils.toType(thisObject.municipalitites.selected) !== 'undefined' ) ? 
								thisObject.municipalities.selected = thisAddress.city : null;
							
							thisObject.provinces.selected = thisAddress.province;
						}
						*/
					}
					
					angular.element('.address-block').removeAttr('disabled');
					
				})
				.catch(function(error){
					
					console.log( '|--------------------------|' );
					console.log( 'ADDRESS-SELECT ERROR > ', error );
					
					$window.alert('Please select your city, province, and postal code.');
					
				});
				
			}
		};

		// TEST INPUT VALUE FOR CONFIRMATION
		$scope.inputConfirmation = function ($event) {

			var thisObject = {};

			moduleType === 2 ?
				thisObject = $scope.newTransaction :
				thisObject = $scope.newResource;
			
			
			console.log('INPUT-CONFIRM OBJECT >> ', thisObject );

			var el = $event.currentTarget; 
			var params = {
					method: thisObject.modal.method,
					q: [
						el.value,
						moduleName,
						el.name || el.id
					]
				};
			
			if( params.q[0].length > 0 ){
				
				channels.inputConfirmation(params).then(function (result) {

					if (result && result.length > 0) {

						if(el.id === 'street' ){

							thisObject.full_address = {
								street: { id: result[0].address_id, value: result[0].street },
								city: { id: result[0].city_id, value: result[0].city},
								province: { id: result[0].state_id, value: result[0].state },
								zipcode: result[0].zipcode
							};

						}
						else{
							
							var msg = result.length + ' record(s) already exist with this ';
							msg += el.name + ' for the ' + utils.stringCapitalise(moduleName);
							msg += ' Module.\nPlease check your insert information.';

							$window.alert(msg);
							
						}
					}

				});
			}

		};
        
        /**
         * AUTHOR: James Van Leuven 
         * DATE: 2017/09/24
         * FILES:
         *      app/scripts/controller/content.js :: $scope.read | $scope.error
         *      app/scripts/services/events/importServices.js :: 259
         */
        $scope.read = function(obj){
            console.log( '|------------------|' );
            console.log( 'JS-XLS.OBJECT >> ', obj );
            console.log( ' SCOPE.csv >> ', $scope.$parent.csv);
            
            var csv = $scope.$parent.csv;
            
            var importObject = comparisonService.buildJSON(obj.Sheets.Sheet1, csv);
            var insertObject;
            
            if(importObject.userInputNeeded === true){
                xlsService.exportProductXLSX(comparisonService.buildMatrix(comparisonService.buildErrorObjectArray(importObject)));
            }
            else{
                insertObject  = comparisonService.getInsertObject(importObject);
                console.log('<< Ready for insertion/updation in the database >>');
            }
            
            console.log('importObject, insertObject >> ', importObject, insertObject);
            
        };
    
        $scope.error = function(error){
            
            console.log( '|------------------|' );
            console.log( 'JS-XLS-ERROR >> ', error );
            
        };
        

		/**
		 * SCOPE MODAL SUBMIT
		 *
		$scope.importData = function ($index) {
            var columns = $scope.csv.import.columns,
                rows = $scope.csv.result,
                items = [];

            function itemList(row) {
                var val;
                angular.forEach(row, function (item, key) {
                    key === columns[$index].mapping.value ? val = item : null;
                });
                return val;
            }

            for (var i = 0; i < rows.length - 1; i++) {
                var row = rows[i];
                items.push(itemList(row));
            }
            $scope.csv.import.columns[$index].mapping.data = items;

            console.log('|--------------------------------------|');
            console.log('SCOPE.CSV.IMPORT.COLUMNS >> ', $scope.csv.import.columns);
        },

        $scope.copyImportData = function (model, object) {
            object.params = [];

            angular.forEach($scope.csv.result, function (result, index) {
                object.params[index] = {};
                angular.copy(model, object.params[index]);
                angular.forEach(object.params[index], function (fieldObject) {
                    var colName;
                    $scope.csv.import.columns.some(function (row) {
                        if (row.field === fieldObject.field) {
                            colName = row.mapping.value;
                            return colName;
                        }
                    });
                    if (colName) {
                        if (fieldObject.input === 'select') {
                            fieldObject.selected = $scope.csv.result[index][colName];
                        } else {
                            fieldObject.value = $scope.csv.result[index][colName];
                        }
                    }
                });
            });
        };
        */

		$scope.modalSubmit = function (method) {

			console.log('|--------------------------------------|');
			console.log('SUBMIT METHOD >> ', method);
			console.log('|--------------------------------------|');
			console.log('SUBMIT SCOPE >> ', $scope);

			/**
			 *  DISABLE THE MODAL BUTTONS
			 *  OVERLAP WITH SPINNER
			 */

			angular.element('div.modal-content button').attr('disabled', 'disabled');

			$scope.showErrorsCheckValidity = false;

			// CREATE SUBMIT OBJECT
			var thisObject = {
				module: moduleName,
				method: method,
				type: $scope.currentModule.type,
				params: {}
			};

			// PARSE RESOURCES | TRANSACTIONS OBJECT
			switch( moduleType ){
				case 1 : angular.copy($scope.newResource, thisObject.params ); break; // RESOURCE
				case 2 : angular.copy($scope.newTransaction, thisObject.params ); break; // TRANSACTION
			}


			// DEFINE PARENT ID'S FOR PRODUCT INSERTS
			moduleName === 'products' ?
				thisObject.params.parent = {
					manufacturer: $rootScope.profile.establishment.id,
					location: $scope.currentModule.location.id
				} : null;
			
			// PRODUCTION ERROR BY-PASS
			moduleName === 'transfers' && thisObject.params.transfer_type.selected.id === 2 ? 
				thisObject.params.from_warehouse.selected = thisObject.params.to_warehouse.selected : null;

			console.log('|--------------------------------------|');
			console.log('MODAL OBJECT >> ', thisObject);

			errorService.validation(thisObject).then(function(){
				
				
				editService.editOptions(thisObject).then(function (results) {

					console.log('|--------------------------------------|');
					console.log('EDIT-SERVICE.RESULTS >> ', results);
					console.log( 'RESULT.ID >> ', results.result );

					/********************************************************
						INSERT THE ERROR MESSAGE RESPONSES HERE SO WE CAN
						TELL THE USER WHAT THE SPECIFIC ERROR ACTUALLY IS
					********************************************************/

					// INSERT ERROR TEST
					if(results.success === false){
						// ALERT THE USER
						$window.alert(results.message);

						// HIGHLIGHT TRANSACTION LINE-ITEM
						if (moduleType === 2) {
							var existingItems = $scope.newTransaction.products.value,
								failedItems = results.result;

							for (var n = 0; n < existingItems.length; n++) {
								var existingId = existingItems[n].id;
								for (var m = 0; m < failedItems.length; m++) {
									var failedId = failedItems[m].product_id;
									parseInt(existingId) === parseInt(failedId) ? existingItems[n].error = true : null;

									// console.log('|--------------------------------------|');
									// console.log('ITEM >> ', existingItems[n]);

								}
							}
						}
					}
					else{

						// SUCCESS MESSAGE
						$window.alert(results.message || 'Saved Successfully');
						angular.element('div.modal-backdrop').remove();
						angular.element('div.modal').remove();
						// $scope.loadThisModule( $route, $scope );
						$route.reload();
					}
					
					angular.element('.modal-footer button.btn').removeAttr('disabled');

				}, function (error) {
					console.log('editOptions ERRORS >> ', error);
					$window.alert('SYSTEM ERROR:\n' + error);
				});	
			}, function (error) {
				console.log('|--------------------------------------|');
				console.log('VALIDATION ERRORS >> ', error);
					
				var msg = 'There were errors with the following fields:\n';
				for(var i = 0; i < error.length; i++ ){ 
					msg += errorService.errorMsg(error[i]); 
				}

				$window.alert(msg);
				angular.element('div.modal-content button').removeAttr('disabled');
				
			});

		};

		utils.toType($window.sessionStorage.establishment) === 'undefined' ?
			$window.sessionStorage.establishment = $rootScope.profile.establishment : null;

		// UPDATE PAGE OF TOTAL PAGES TO VIEW
		$scope.setCurrent = function (newPageNumber) {
			var limit = parseInt(angular.element('select[name="itemsPerPage"] option:selected').val());

			thisModule.paging.page = parseInt(newPageNumber);
			thisModule.paging.limit = parseInt(limit);

			contentService.newPagingOptions($scope);
		};

		// REMOVE LINE ITEM BY IDX
		$scope.removeRow = function ($index) {
			$scope.newTransaction.products.value.splice($index, 1);

			var len = $scope.newTransaction.products.value.length;
			len > 0 ? $scope.getTotal('quantity', len - 1) : null;
		};
		// ADD NEW LINE ITEM
		$scope.addRow = function () {

			$scope.newTransaction.manufacturer.selected.id !== 0 ?
				domService.addRow($scope) :
				utils.growlMessage('error', 'Please select a Manufacturer', 3);

		};

		/**************************
		 * DIRTY HACK TEST
		 * THE COMPILED DATE-PICKER
		 * OPTIONS HAVEN'T BEEN
		 * CONFIGURED
		 * *** TO DO
		 **************************/
		$scope.$watch('newTransaction.deliver_date', function (newVal, oldVal) {

			if (utils.toType($scope.newTransaction.rush) !== 'undefined') {
				var rush = $scope.newTransaction.rush;
				if (rush.value === true) {

					newVal = {
						startDate: moment(newVal).format('YYYY-MM-DD 08:00:00'),
						endDate: moment(oldVal).format('YYYY-MM-DD 16:00:00')
					};

					console.log('|----------------------------------------|');
					console.log('OLD-VALUE >> ', oldVal);
					console.log('|----------------------------------------|');
					console.log('NEW-VALUE >> ', newVal);

				} else {
					newVal = {
						startDate: moment(oldVal).format('YYYY-MM-DD 08:00:00'),
						endDate: moment(oldVal).add(1, 'weeks').format('YYYY-MM-DD 16:00:00')
					};

					console.log('|----------------------------------------|');
					console.log('OLD-VALUE >> ', oldVal);
					console.log('|----------------------------------------|');
					console.log('NEW-VALUE >> ', newVal);

				}
			}

		}, true);

		// UPDATE THE INVENTORY AND STATUS OF TRANSACTION
		$scope.inventoryUpdate = function (int, transaction_id, batch) {

			console.log('|-------------------------------------|');
			console.log('batch ', batch);

			var thisTransaction = $scope.newTransaction,
				products = thisTransaction.products.value,
				status_id = int,
				status = {},
				str = 'Click \'OK\' to change the status to ',
				statusList = $rootScope.assets[moduleName].status,
				lineItems = [],
				inventoryObject = {};

			switch (moduleName) {
				case 'orders':
					inventoryObject.locations = {
						location: thisTransaction.location.selected,
						manufacturer: thisTransaction.manufacturer.selected,
						id: thisTransaction.id,
						user: $rootScope.profile.user_id
					};
					break;
				case 'transfers':
					inventoryObject.locations = {
						from: thisTransaction.from_warehouse.selected,
						to: thisTransaction.to_warehouse.selected,
						type: thisTransaction.transfer_type.selected,
						manufacturer: thisTransaction.manufacturer.selected,
						id: thisTransaction.id,
						user: $rootScope.profile.user_id
					};
					break;
			}

			// DEFINE
			for (var i = 0; i < statusList.length; i++) {

				if (statusList[i].id === status_id) {

					console.log('|-----------------------------|');
					console.log('STATUS-LIST[' + i + '] >> ', statusList[i]);

					status = {
						module: moduleName.toLowerCase(),
						selected: statusList[i],
						status: parseInt(statusList[i].id),
						items: [
                        parseInt(transaction_id)
                    ]
					};
				}
			}

			for (var j = 0; j < products.length; j++) {
				var item = {
					id: parseInt(products[j].id),
					quantity: parseInt(products[j].quantity)
				};
				lineItems.push(item);
			}

			inventoryObject.status = status;
			inventoryObject.lineItems = lineItems;

			console.log('|----------------------------------------|');
			console.log('INVENTORY STATUS OBJECT >> ', inventoryObject);
			console.log('SCOPE.MODULE-NAME >> ', $scope[moduleName]);
			// $scope[moduleName][idx].status = inventoryObject.status;

			if (batch === true) {
				channels.inventory(inventoryObject).then(function (result) {
					console.log('|----------------------------------------|');
					console.log('result', result);

					// CHANGE THE KEY/VALUE STATUS ID
					$scope.newTransaction.status.selected = inventoryObject.status.selected;
					$window.alert('Successfully updated status to: ' + inventoryObject.status.selected.value);
					angular.element('div.modal, div.modal-dialog, div.modal-backdrop').remove();
					$route.reload();

				}).catch(function (error) {
					console.log('|----------------------------------------|');
					console.log('error', error);
				});
			} else {
				if ($window.confirm(str + inventoryObject.status.selected.value)) {

					console.log('|----------------------------------------|');
					console.log('CHANGE STATUS TO >> ', inventoryObject.status);

					channels.inventory(inventoryObject).then(function (result) {
						console.log('|----------------------------------------|');
						console.log('result', result);

						// CHANGE THE KEY/VALUE STATUS ID
						$scope.newTransaction.status.selected = inventoryObject.status.selected;
						$window.alert('Successfully updated status to: ' + inventoryObject.status.selected.value);
						angular.element('div.modal, div.modal-dialog, div.modal-backdrop').remove();
						// $window.location.reload();
						// $scope.loadThisModule( $route, $scope );
						$route.reload();

					}).catch(function (error) {
						console.log('|----------------------------------------|');
						console.log('error', error);
					});
				} else {
					console.log('action declined ');
				}
			}

		};

		// SIMPLY CHANGE THE TRANSACTION STATUS
		$scope.statusUpdate = function (int, transaction_id) {

			var status_id = int,
				status = {},
				str = 'Click \'OK\' to change the status to ',
				statusList = $rootScope.assets[moduleName].status;

			for (var i = 0; i < statusList.length; i++) {

				if (statusList[i].id === status_id) {
					status = {
						module: moduleName.toLowerCase(),
						selected: statusList[i],
						status: statusList[i].id,
						items: [
                        transaction_id
                    ]
					};
				}
			}

			if ($window.confirm(str + status.selected.value)) {
				console.log('update status', status);

				channels.status(status).then(function (result) {

					console.log('|-------------------------------------|');
					console.log('RESULT >> ', result);

					// CHANGE THE KEY/VALUE STATUS ID
					$scope.newTransaction.status.selected = status.selected;
					$window.alert('Successfully updated status to: ' + status.selected.value);
					angular.element('div.modal, div.modal-dialog, div.modal-backdrop').remove();
					$route.reload();
				}).catch(function (error) {
					console.log('|----------------------------------------|');
					console.log('error', error);
				});
			} else {
				console.log('action declined ');
			}

		};

		$scope.voidTransaction = function (int, id) {
			
			console.log('|-------------------------------|');
			console.log( 'THIS-TRANSACTiON >>', $scope.newTransaction );
			console.log( 'VOID-TRANSACTION >> ', int, id );

			var thisTransaction = $scope.newTransaction,
				lineItems = thisTransaction.products.value,
				items = [];

			angular.forEach(lineItems, function (item) {
				
				console.log('|-------------------------------|');
				console.log( 'ITEM >> ', item );
				
				items.push({
					id: item.id,
					quantity: item.quantity
				});
			});
			
			var thisLocation = 0;
			moduleName === 'transfers' ? 
				thisLocation = parseInt(thisTransaction.from_warehouse.selected.id) : 
				thisLocation = parseInt(thisModule.location.id);

			var voidObject = {
				module: moduleName,
				transaction: id,
				manufacturer: thisTransaction.manufacturer.selected.id,
				location: thisLocation,
				// location: thisModule.location.id,
				status: int,
				products: items
			};
			
			// ADD TRANSFER-TYPE TO THE OBJECT
			moduleName === 'transfers' ? 
				voidObject.type = thisTransaction.transfer_type.selected.id : 
				null;

			console.log('|-------------------------------|');
			console.log('VOID-OBJECT >> ', voidObject);

			if ($window.confirm('Click OK to Void this ' + moduleName)) {
				channels.voidTransaction(voidObject).then(function (result) {
					console.log('|-------------------------------|');
					console.log('VOID.RESULT >> ', result);

					thisTransaction.status.selected = {
						id: 4,
						value: 'VOIDED'
					};

					$window.alert('Successfully VOIDED this ' + moduleName);
					angular.element('div.modal, div.modal-dialog, div.modal-backdrop').remove();

					// $scope.loadThisModule( $route, $scope );
					$route.reload();
				});
			} else {
				console.log('|-------------------------------|');
				console.log('VOID ABORTED');
			}
		};

		$scope.newNote = {};
		$rootScope.addNewNote = false;
		// HIDE | CLEAR NEW NOTE FORM
		$scope.hideNote = function () {
			$scope.newNote = {};

			var len = $scope.newTransaction.notes.value.length;
			$rootScope.addNewNote = false;

			console.log('|-------------------------------|');
			console.log('notes length >> ', len);

			len === 0 ?
				angular.element('div.popover').remove() :
				$rootScope.addNewNote = false;

		};
		// SHOW NEW NOTE FORM
		$scope.addNoteForm = function (idx) {

			// DEFINE THIS NOTE
			var newNote = {
				author: {
					id: $rootScope.profile.user_id,
					FullName: $rootScope.profile.Name.FullName
				},
				id: idx,
				details: null,
				comments: [],
				type: {}
			};

			// SHOW
			$scope.newNote = newNote;
			if ($rootScope.addNewNote === false) {
				$rootScope.addNewNote = true;
			}

			console.log('|-------------------------------|');
			console.log('NEW-NOTE >> ', $scope.newNote);
			console.log('ADD-NEW-NOTE >> ', $rootScope.addNewNote);
			console.log('SCOPE >> ', $scope);
		};

		$scope.saveNote = function () {

			console.log('|-------------------------------|');
			console.log('THIS-TRANSACTION >> ', $scope.newTransaction);
			console.log('NEW NOTE >> ', $scope.newNote);
			console.log('|-------------------------------|');
			console.log('PROFILE >> ', $rootScope.profile);
			console.log('CREDENTIALS >> ', $rootScope.credentials);
			console.log('ROOTSCOPE >> ', $rootScope);

			var thisObject = {},
				thisNote = $scope.newNote,
				idx = thisNote.id,
				child = {};

			// SET IDX FOR UNDEFINED
			utils.toType(idx) === 'undefined' ? idx = -1 : null;
			// DEFINE NOTE KEY/VALUE PAIRS
			thisNote.author = {
				FullName: $rootScope.profile.Name.FullName,
				id: $rootScope.profile.user_id,
				role: $rootScope.credentials.role,
				group: $rootScope.credentials.group
			};

			thisNote.comments = [];
			thisNote.created = moment().toISOString();

			parseInt(moduleType) === 2 ? thisObject = $scope.newTransaction : thisObject = $scope.newResoource;

			var insNote = angular.copy(thisNote, child);

			parseInt(idx) === -1 ?
				thisObject.notes.value.length === 0 ?
				thisObject.notes.value = [insNote] :
				thisObject.notes.value.unshift(insNote) :
				thisObject.notes.value[idx].comments.length === 0 ?
				thisObject.notes.value[idx].comments = [insNote] :
				thisObject.notes.value[idx].comments.unshift(insNote);

			console.log('|-------------------------------|');
			console.log('NOTES >> ', $scope.newTransaction.notes.value);
			$rootScope.addNewNote = false;
		};

		/* ================================================================================================= */
		// TEMP HACK
		$scope.getTotal = function (el, $index) {
			
			console.log( '|-------------------------------|');
			console.log( 'GET-TOTAL.ELEMENT >> ', el );
			console.log( 'GET-TOTAL.INDEX >> ', $index );
			

			var thisTransaction = $scope.newTransaction,
				lineItems = thisTransaction.products.value,
				thisItem = thisTransaction.products.value[$index];

			var quantity = thisItem.quantity,
				oQuantity = thisItem.oQuantity,
				nQuantity = thisItem.nQuantity,
				inventory = thisItem.inventory;

			switch (moduleName) {
				case 'transfers':
					var tt = thisTransaction.transfer_type.selected;

					// console.log( '|-------------------------------|');
					// console.log( 'TRANSFER TYPE ', tt );

					switch (tt.id) {
						case 2: // PRODUCTION
							thisItem.oQuantity = parseInt(nQuantity);
							thisItem.nQuantity = parseInt(quantity);
							thisItem.dQuantity = parseInt(quantity - oQuantity);

							thisItem.oInventory = parseInt(inventory);
							thisItem.nInventory = parseInt(inventory) + parseInt(quantity);
							thisItem.dInventory = parseInt(thisItem.nInventory) - parseInt(inventory);
							break;
						case 3: // MANUAL ADJUSTMENT
							if (quantity < 0) {
								thisItem.oQuantity = parseInt(nQuantity);
								thisItem.nQuantity = parseInt(quantity);
								thisItem.dQuantity = parseInt(quantity + oQuantity);

								thisItem.oInventory = parseInt(inventory);
								thisItem.nInventory = parseInt(inventory) + parseInt(thisItem.nQuantity);
								thisItem.dInventory = parseInt(thisItem.nInventory - inventory);
							} else {
								thisItem.oQuantity = parseInt(nQuantity);
								thisItem.nQuantity = parseInt(quantity);
								thisItem.dQuantity = parseInt(quantity - oQuantity);

								thisItem.oInventory = parseInt(inventory);
								thisItem.nInventory = parseInt(inventory) + parseInt(quantity);
								thisItem.dInventory = parseInt(thisItem.nInventory) - parseInt(inventory);
							}
							break;
						default:
							// if(thisTransaction.method === 'add'){
							thisItem.oQuantity = nQuantity; // SET oQ to previous nQ
							thisItem.nQuantity = quantity; // SET THE nQ TO Q SELECTED
							thisItem.dQuantity = parseInt(quantity - oQuantity); // SET QUANTITY DIFFERENCE  TO oQ-Q

							thisItem.oInventory = inventory; // set oI to previous nI
							thisItem.nInventory = parseInt(inventory - quantity); // set nI to I - Q
							thisItem.dInventory = parseInt(thisItem.nInventory - inventory); // set dI to I - nI;
							// }
					}
					break;
				case 'orders':
					
					console.log( '|-------------------------------|');
					console.log( 'ORDERS.THIS-ITEM >> ', thisItem );
					
					
					if (thisItem.inventory === 0) {
						thisItem.oQuantity = 0;
						thisItem.nQuantity = 0;
						thisItem.dQuantity = 0;

						thisItem.oInventory = 0;
						thisItem.nInventory = 0;
						thisItem.dInventory = 0;
					} else {
						thisItem.oQuantity = nQuantity; // SET oQ to previous nQ
						thisItem.nQuantity = quantity; // SET THE nQ TO Q SELECTED
						thisItem.dQuantity = parseInt(quantity - oQuantity); // SET QUANTITY DIFFERENCE  TO oQ-Q

						thisItem.oInventory = inventory; // set oI to previous nI
						thisItem.nInventory = parseInt(inventory - quantity); // set nI to I - Q
						thisItem.dInventory = parseInt(thisItem.nInventory - inventory); // set dI to I - nI;
					}

					// NEW CALCULATOR ON LINE ITEMS ADJUST
					// TOTAL DEPOSIT
					var litter_rate = parseFloat(thisItem.litter_rate),
						bpc = parseInt(thisItem.bottles_per_case),
						bps = parseInt(thisItem.bottles_per_sku);

					var totalDeposit = Number(parseFloat(((litter_rate * bpc) / bps) * quantity));
					thisItem.totalDeposit = Number(parseFloat(totalDeposit));
					
					// CUSTOM PRICING ASSIGNED TO THIS LINE ITEM
					if( el === 'price' ){
						
						console.log( '|-------------------------------|');
						console.log( 'THIS-ITEM.PRICE >> ', thisItem.price );
						
						// ASSIGN CUSTOM PRICING				
						var // qty = parseInt(thisItem.quantity), 
							price = parseFloat(thisItem.price);
						
						var newCalcPrice = Number(((thisItem.price * bpc) / bps));
						thisItem.calculatedPrice = parseFloat(newCalcPrice);
						thisItem.price = parseFloat(price);
						
					}

					// PRICING
					var calculatedPrice = parseFloat(thisItem.calculatedPrice);
					var subTotal = Number(parseFloat(calculatedPrice) * parseInt(quantity));
					thisItem.subTotal = parseFloat(subTotal);

					// CALCULATE TRANSACTION TOTALS
					var aggSubTotal = parseFloat('0.00'),
						aggTotalDeposits = parseFloat('0.00'),
						aggTotalTax = parseFloat('0.00'),
						aggTotal = parseFloat('0.00');

					for (var i = 0; i < lineItems.length; i++) {


						aggSubTotal = Number(parseFloat(aggSubTotal) + parseFloat(lineItems[i].subTotal));
						aggTotalTax = Number(parseFloat(aggSubTotal) * parseFloat('0.05'));
						aggTotalDeposits = Number(parseFloat(aggTotalDeposits) + parseFloat(lineItems[i].totalDeposit));
						aggTotal = Number(parseFloat(aggSubTotal) + parseFloat(aggTotalTax) + parseFloat(aggTotalDeposits));

						thisTransaction.subTotal = Number(parseFloat(aggSubTotal));
						thisTransaction.totalTax = Number(parseFloat(aggTotalTax));
						thisTransaction.Deposit = Number(parseFloat(aggTotalDeposits));
						// thisTransaction.Total = Number(parseFloat(aggTotal));
						
						thisTransaction.promo.value === false ? 
							thisTransaction.Total = Number(parseFloat(aggTotal)) : 
							thisTransaction.Total = Number(parseFloat('0.00'));

						console.log('|-------------------------------|');
						console.log('THIS-LINE-ITEM[' + i + '] >> ', lineItems[i]);
					}

					console.log('|-------------------------------|');
					console.log('THIS-TRANSACTION >> ', thisTransaction);
					break;
			}
		};

		/* ================================================================================================= */

		$scope.increment = function ($index) {
			if (parseInt($scope.newTransaction.products.value[$index].nInventory) !== 0) {
				$scope.newTransaction.products.value[$index].quantity++;
				$scope.newTransaction.products.value[$index].nInventory--;
				$scope.getTotal(null, $index);
			}
		};

		$scope.decrement = function ($index) {
			if (parseInt($scope.newTransaction.products.value[$index].quantity) !== 0) {
				$scope.newTransaction.products.value[$index].quantity--;
				$scope.newTransaction.products.value[$index].nInventory++;
				$scope.getTotal(null, $index);
			}
		};

		/* ================================================================================================= */

		// MODAL ONBLUR
		$scope.modalBlur = function ($event, element) {

			console.log('modalBlur.event', $event);
			console.log('modalBlur.element', element);
			// console.log( 'scope.newResource', $scope.newResource );


			var value = $event.currentTarget.value;

			if (element.indexOf('date') !== -1) {
				value = new Date(moment($event.currentTarget.value, 'YYYY-MM-DD HH:mm Z').toISOString());
			} else if (element.indexOf('time') !== -1) {
				if (thisModule.type === 1) {
					value = $event.currentTarget.value;
					var name = $event.currentTarget.name;
					$scope.newResource[name].value = value;
				}
			}
			// REALLY BAD HACK FOR BLUR ELEMENT CAPTURE
			else if (element.indexOf('SKU') !== -1) {
				// DO A SOCKET TEST CALL AND FREEZE PAGE

				var manufacturer_id = $scope.newResource.manufacturer_id;
				var skuObject = {
					id: parseInt(manufacturer_id),
					sku: parseInt(value)
				};
				channels.sku(skuObject).then(function (result) {
					console.log('modalBlur.testResult', result);
					if (result.length > 0) {
						$window.alert('This SKU of #' + value + ' is already in use.');
						angular.element('input[name="sku"]').val('').focus();

						if ($window.confirm('The SKU of #' + value + ' already exists.\nClick OK if this is a batch product.\nClick CANCEL if this is a new product.')) {
							$scope.newResource.batch = {
								forced: 1,
								product_id: result[0].id,
								sku: value,
								batch_number: Number(parseInt(result[0].totalitems) + 1)
							};
							$scope.newResource.batch_number.value = $scope.newResource.batch.batch_number;
							$scope.newResource.product_id = parseInt(result[0].id);

							console.log('SAVE', $scope.newResource);
						} else {
							console.log('ERROR');
							// CLEAR SKU INPUT AND FOCUS
						}

					}
				});
			} else {
				value = $event.currentTarget.value;
			}
		};

		$scope.boolean = function (el) {
			var element = $scope.newTransaction[el],
				str = '',
				thisTransaction = $scope.newTransaction;

			console.log('|----------------------------------------|');
			console.log('THIS-TRANSACTION >> ', thisTransaction);

			element.value === false ? element.value = true : element.value = false;
			
			// DIRTY HACK FOR PROMO BOOLEAN
			el === 'promo' ? 	
				thisTransaction.promo.value === true ? 
					thisTransaction.Total = Number(parseFloat('0.00')) : null : null;

			// DIRTY HACK FOR RUSH DATE-PICKER
			if (el === 'rush') {
				if (element.value === false) {
					// SET RUSH DATE
					thisTransaction.deliver_date = thisTransaction.available_date[0].date;

					console.log('|----------------------------------------|');
					console.log('DATE-RESET >> ', thisTransaction.deliver_date);

					// SWAP IN THE DATEPICKER
					str += '<input type="text" class="form-control input-sm"';
					str += ' data-ng-model="newTransaction.deliver_date.startDate" disabled/>';
					/*
					 */
				} else {
					// RESET DATE
					thisTransaction.deliver_date = {
						startDate: moment(new Date()).format('YYYY-MM-DD'),
						endDate: null
					};

					console.log('|----------------------------------------|');
					console.log('DATE-RUSH >> ', thisTransaction.deliver_date);

					// SWAP IN THE DATEPICKER
					str += '<input date-range-picker class="form-control input-sm date-picker" type="text"';
					str += ' min="\'' + thisTransaction.deliver_date.startDate + '\'"';
					str += ' data-ng-model="newTransaction.deliver_date"';
					str += ' options="{singleDatePicker: true, autoUpdateInput: true}"/>';
				}

				angular.element('span#delivery_day').html($compile(str)($scope));
			}

		};

		//  BUTTON EVENT
		$scope.button = function ($index, $event) {
            /*
			console.log( '|--------------------------------------|' );
            console.log( 'ROOTSCOPE >> ', $rootScope );
            console.log( 'SCOPE >> ', $scope );
			console.log( 'SCOPE-BUTTON.INDEX >> ', $index );
			console.log( 'SCOPE-BUTTON.EVENT >> ', $event );
            */

			var establishment = parseInt($window.sessionStorage.establishment),
				manufacturer = null,
				cloneIdx = $index,
				objectId = -1;
			
			// OBJECT OR STRING TEST
			( utils.toType(parseInt($rootScope.profile.establishment)) === 'object' ) ?
				manufacturer = parseInt($rootScope.profile.establishment.id) : 
				manufacturer = parseInt($rootScope.profile.establishment);

            /*
			console.log('|--------------------------------------|');
			console.log('BUTTON.ESTABLISHMENT >> ', establishment);
			console.log('BUTTON.MANUFACTURER >> ', manufacturer);
            */

			$index === -1 ? cloneIdx = 0 : null;
			utils.toType($scope[moduleName][$index]) !== 'undefined' ?
				objectId = $scope[moduleName][cloneIdx].id : null;

			$scope.currentModule.modal = {
				index: parseInt(cloneIdx),
				method: $event.currentTarget.dataset.id,
				id: objectId
			};

			$window.sessionStorage.thisModal = JSON.stringify(thisModule.modal);

			moduleName === 'products' && establishment === 0 && manufacturer === 0 ?
				utils.growlMessage('error', 'Please select a Manufacturer.', 2) :
				eventService.eventHandler($scope, $event);

		};

		// LOAD SIDEBAR || SHOW/HIDE COLUMNS
		$scope.sidebar = function () {
			domService.searchBar( $scope );
			/*
			.then(function(result){

			    console.log( '|--------------------------------------|' );
			    console.log( 'DOM-SERVICE.SEARCH-BAR.RESULT >> ', result );

			});
			*/
		};

		$scope.column = function (key) {
			domService.columns(key, $scope);
		};

		// FILTER SEARCH RESULTS
		$scope.filter = {};
		$scope[moduleName] = {};
		$scope.sort = function (keyname) {
			$scope.sortKey = keyname;
			$scope.reverse = !$scope.reverse;
		};
		// RESET SEARCH
		$scope.resetfilter = function () {
			var thisModule = $scope.currentModule,
				moduleName = angular.lowercase(thisModule.name);
			delete $window.sessionStorage.filters;
			$window.location.href = '../' + moduleName;
		};
		
		
		// TEMP BACK HACK FOR 'over-ride locations'
		$scope.overRide = function( el ){
			
			var theseElements = thisModule.elements, 
				ttl = utils.countJSON(theseElements), 
				i = 0;
			
			console.log( 'EL-KEY >> ', el );
			console.log( 'ELEMENTS >> ', theseElements );	
			
			if( moduleType === 2 && $rootScope.credentials.group_id === 1 ){
				
				angular.forEach(theseElements, function( row, key ){

					console.log( '|------------------------------------|' );
					console.log( key, row );

					if( row.input ){

						switch(row.input){
							case 'select': 
								utils.toType(row.selected) !== 'undefined' && utils.toType(row.selected.value) !== 'null' ?  
									i++ : null; break;
							case 'boolean': 
								utils.toType(row.selected) !== 'undefined' && utils.toType(row.selected.value) !== 'null' ?  
									i++ : null; break;
							case 'cs': 
								utils.toType(row.selected) !== 'undefined' && utils.toType(row.selected.value) !== 'null' ?  
									i++ : null; break;
							default: 
								utils.toType(row.value) !== 'undefined' && utils.toType(row.value) !== 'null' ?  
									i++ : null; 
						}

					}

				});


				console.log( 'isVisible > ', ttl, i );

				i > 0 ? elements.showOverRide( $scope ) : elements.hideOverRide( $scope );
				
			}
			
		};
		
		$scope.searchfilter = function () {
			var form = angular.element('.filter-column').serializeArray(),
				filters = [],
				item = {};
			
			console.log( '|------------------------------------|' );
			console.log( 'SCOPE.FILTER-ITEMS >> ', $scope.filterItems );
			

			// SEARCH FILTER PARAMS
			for (var j = 0; j < form.length; j++) {
				
				if (form[j].name !== 'module' && form[j].value !== '?' && form[j].value !== '') {
					
                    console.log( '|------------------------------------|' );
					console.log( 'FORM[' + j + '] >> ', form[j].name, form[j].value );
					
					var type = angular.element('.filter-column')[j].dataset.type,
						field = form[j].name,
						value = form[j].value;
					
					utils.isNumber(value) ? parseInt(value) : value.toString();
					
					item = {
						field: field,
						type: type,
						value: value	
					};
                    
                    console.log( '|------------------------------------|' );
                    console.log( 'ITEM >> ', item );
					
					filters.push(item);
					
				}

			}
			
            console.log( '|------------------------------------|' );
			console.log( 'CS-FILTER-ITEMS >> ', $scope.filterItems );
			
			// TYPEAHEAD FILTER PARAMS FROM CUSTOM-SELECT
			angular.forEach($scope.filterItems, function ( row, key ) {
				
				console.log( '|------------------------------------|' );
				console.log( 'FILTER-ITEMS > ', key, row );

				if( key.indexOf('date') === -1 || (row.input === 'cs' && row.selected.id !== 0) ){
					
					switch(moduleType){
						case 1: 
							
							if( key === 'city' ){
								item = {
									field: row.field,
									type: row.type,
									value: row.township
								};
							}
							else{
								item = {
									field: row.field,
									type: row.type,
									value: row.id
								};
							}
							
						break;
						case 2: 
							
							if( key === 'city' ){
								item = {
									field: row.field,
									type: row.type,
									value: row.township
								};
							}
							else{
								item = {
									field: row.schema.field,
									type: row.schema.data_type,
									value: row.schema.selected.id
								};
							}

						break;
					}
					
					
					filters.push(item);
				}

			});
			
			/**
			 * BY-PASS CODE FOR ALL LOCATIONS ON TRANSACTIONS
			 */
            if( moduleType !== 3 ){
                if( utils.toType($scope.currentModule.elements.byPass) !== 'undefined' ){
                    if( $scope.currentModule.elements.byPass.display === true ){
                        filters.push({
                            field: 'location_id',
                            type: 'array',
                            value: $scope.currentModule.elements.byPass.items
                        });
                    }
                }   
            }
			
            console.log( '|------------------------------------|' );
            console.log( '|------------------------------------|' );
			console.log( 'FORM-FILTER >> ', filters );

			$scope.filter = filters;
			
			// SCOPE FILTER PUSH
			if ($scope.filter.length > 0) {
                
                console.log( '|------------------------------------|' );
                console.log( 'SCOPE.FILTER >> ', $scope.filter );
                
				$window.sessionStorage.filters = JSON.stringify($scope.filter);
                
                console.log( '|------------------------------------|' );
                console.log( 'SESSION-STORAGE.FILTERS >> ', $window.sessionStorage.filters );
				// RESET PAGING OPTIONS
				thisModule.paging = moduleService.modulePagingOptions($scope.currentModule);
				$window.sessionStorage.paging = JSON.stringify(thisModule.paging);
				// GET MODULE FROM FILTERS
				contentService.newPagingOptions($scope);
			} else {
				$window.sessionStorage.filters = JSON.stringify([]);
				contentService.newPagingOptions($scope);
			}
			
		};

		/**
		 * GLOBAL FILTER
		 *
		$scope.globalFilter = function () {
			var thisFilter = $scope.search,
				thisColumns = $scope[moduleName][0];
			console.log('|-------------------------------------|');
			console.log('THIS-MODULE >> ', moduleName);
			console.log('|-------------------------------------|');
			console.log('SCOPE.SEARCH >> ', thisFilter);
			console.log('|-------------------------------------|');
			console.log('THIS-COLUMNS >> ', thisColumns);
		};
	    */

		/**
		 * BATCH EVENTS
		 */
		$scope.batchAll = false;
		$scope.batchItems = [];
		$scope.batch = function () {

			// console.log( '|-------------------------------------|' );
			// console.log( 'CHECK-ALL BUTTON.EVENT >> ', $event );

			var el = angular.element('input.row'),
				items = [];

			el.map(function (i, row) {
				row.checked === true ?
					items.push(i) :
					null;
			});

			$scope.batchItems = items;

			$scope.batchItems.length > 0 ?
				elements.showButtons($scope) :
				elements.hideButtons($scope);
		};

		// BATCH BUTTONS
		$scope.batchEvent = function ($event) {

			var thisDataset = $event.currentTarget.dataset,
				thisBatch = {},
				thisConfirm = {},
				thisStatus = {},
				userGroup = $rootScope.credentials.group_id,
				userHWH = $scope.currentModule.hwh;

			console.log('|-------------------------------------|');
			console.log('USER-GROUP >> ', userGroup);
			console.log('USER-HWH >> ', userHWH);

			$scope.originalBatchItems = [];

			// DISABLE BUTTONS
			// ACTIVATE SPINNER
			$rootScope.disableButton = true;
			angular.element('.loading-spinner-holder').show();

			// console.log('|-------------------------------------|');
			// console.log('BATCH-EVENT.THIS-DATASET >> ', thisDataset);

			// GROWL 1 - TESTING SELECTION
			growl.info('Testing ' + thisDataset.id + ' Selection', {
				referenceId: 2,
				ttl: 1000,
				onopen: function () {
					// BACKUP SELECTED EVENT-ITEMS
					angular.copy($scope.batchItems, $scope.originalBatchItems);

					// TEST FOR BATCH EVENT TYPE
					// RETURN RESULTS > FACTORY.BATCHES.[MODULENAME].BATCH-COUNT
					moduleName === 'orders' ?
						thisBatch = batches.ordersBatchCount($scope, $event) :
						thisBatch = batches.transfersBatchCount($scope, $event);

					console.log('|-------------------------------------|');
					console.log('THIS-MODULE >>', moduleName);
					console.log('THIS-BATCH >> ', thisBatch);
					// console.log( 'THIS-DATASET >> ', thisDataset );
					console.log('USER-GROUP >> ', userGroup);
					console.log('USER-HWH >> ', userHWH);


					// TEST USER AND HWH DEFINITION
					userGroup === 2 ?
						userHWH === true ?
						thisConfirm = batches.batchConfirm(thisBatch, $scope) :
						thisConfirm = {
							event: thisBatch.type,
							confirm: null,
							status: false
						} :
						thisConfirm = batches.batchConfirm(thisBatch, $scope);

					console.log('|-------------------------------------|');
					console.log( 'THIS-CONFIRM >> ', thisConfirm );
					console.log*( 'THIS-BATCH >> ', thisBatch );

					var ids = [];
					for (var i = 0; i < thisBatch.ids.length; i++) {
						
						console.log('|-------------------------------------|');
						console.log( 'THIS-BATCH[' + i + '] >> ', thisBatch[i] );
						
						ids.push(thisBatch.ids[i].obj.id);
					}

					thisStatus = {
						items: ids,
						module: moduleName,
						id: thisDataset.id,
						type: 2,
						status: thisBatch.status.new.id,
						index: thisBatch.batchItems,
						method: thisDataset.id
					};

					console.log('|-------------------------------------|');
					console.log('THIS-STATUS >> ', thisStatus);

					// UPDATE TRANSACTION STATUSES ON TRUE
					if (thisConfirm.status === true) {

						// UPDATE STATUSES
						channels.status(thisStatus).then(function (success) {
								console.log('|-------------------------------------|');
								console.log('CHANNELS-STATUS.SUCCESS >>', success);

								// UPDATE THE OBJECTS
								for (i = 0; i < thisBatch.batchItems.length; i++) {

									console.log('|-------------------------------------|');
									console.log('ORIGINAL-BATCH-ITEMS[' + i + '] >> ', thisBatch.batchItems[i]);

									$scope[moduleName][$scope.batchItems[i]].status.selected = thisBatch.status.new;
								}

								$scope.batchItems = thisBatch.batchItems;
								$scope.currentModule.modal = thisStatus;

								console.log('|-------------------------------------|');
								console.log('BATCH-ITEMS >>', $scope.batchItems);
								console.log('CURRENT-MODULE >>', $scope.currentModule);

								// CREATE EVENT DOCUMENT
								growl.info('Rendering ' + thisDataset.id + '.', {
									referenceId: 2,
									ttl: 1000,
									onopen: function () {
										$rootScope.disableButton = true;
										angular.element('.loading-spinner-holder').show();

										$scope.batchItems = thisBatch.batchItems;
										$scope.currentModule.modal = thisStatus;
										eventService.eventHandler($scope, $event);
									},
									onclose: function () {
										angular.copy($scope.originalBatchItems, $scope.batchItems);

										$rootScope.disableButton = false;
										angular.element('.loading-spinner-holder').hide();
									}
								});
							})
							.catch(function (errors) {

								console.log('|-------------------------------------|');
								console.log('ERRORS >>', errors);

								var error = batches.batchStatusError(errors);

								if (error.continue === false || utils.toType(error.continue) === 'undefined' ) {
									
									$window.alert(errors);
									
									$scope.batchAll = false;
									$scope.batchItems = [];
									$rootScope.disableButton = false;
									angular.element('.loading-spinner-holder').hide();
								} else {
									// CREATE EVENT DOCUMENT
									growl.info('Rendering ' + thisDataset.id + '.', {
										referenceId: 2,
										ttl: 1000,
										onopen: function () {
											$rootScope.disableButton = true;
											angular.element('.loading-spinner-holder').show();

											$scope.batchItems = thisBatch.batchItems;
											$scope.currentModule.modal = thisStatus;
											eventService.eventHandler($scope, $event);
										},
										onclose: function () {
											// angular.copy( $scope.originalBatchItems, $scope.batchItems );
											$scope.currentModule.modal = thisStatus;

											$rootScope.disableButton = false;
											angular.element('.loading-spinner-holder').hide();
										}
									});
								}
							});
					} else {
						// CREATE EVENT DOCUMENT
						growl.info('Rendering ' + thisDataset.id + '.', {
							referenceId: 2,
							ttl: 1000,
							onopen: function () {
								$rootScope.disableButton = true;
								angular.element('.loading-spinner-holder').show();

								$scope.batchItems = thisBatch.batchItems;
								$scope.currentModule.modal = thisStatus;

								// SETTING A STATUS TO DELIVERED
								// DOESN'T REQUIRE A DOCUMENT

								console.log('|-------------------------------|');
								console.log('BATCH-ID >> ', thisDataset);

								if (thisDataset.id === 'delivered') {
									$scope.batchAll = false;
									$scope.batchItems = [];
									delete $scope.originalBatchItems;

									$rootScope.disableButton = false;
									angular.element('.loading-spinner-holder').hide();
									$route.reload();
								} else {
									eventService.eventHandler($scope, $event);
								}
							},
							onclose: function () {
								angular.copy($scope.originalBatchItems, $scope.batchItems);

								$rootScope.disableButton = false;
								angular.element('.loading-spinner-holder').hide();
							}
						});
					}

				},
				onclose: function () {
					angular.copy($scope.originalBatchItems, $scope.batchItems);

					$rootScope.disableButton = false;
					angular.element('.loading-spinner-holder').hide();


				}
			});

		};

		// TIME PICKER
		$scope.timePicker = function ($event) {
			console.log('|-------------------------------------|');
			console.log('TIME-PICKER.EVENT >> ', $event);
		};
		
		/**
		 * REPORT FILTER
		 */
		$scope.reportFilter = function(){
            
            reportService.config( $scope ).then(function(response){
                
                console.log( '|-------------------------------------|' );
                console.log( 'REPORT-FILTER.RESPONSE >> ', response );
                console.log( 'SCOPE >> ', $scope );
                console.log( 'SESSION-STORAGE.FILTER >> ', $window.sessionStorage.filters );
                
                $scope.filter = [];
                
                console.log( '|-------------------------------------|' );
                
                for(var i = 0; i < response.length; i++ ){
                    
                    var obj = JSON.stringify(response[i]);
                    console.log( 'RESPONSE.OBJ >> ', obj );
                    
                    $scope.filter.push( JSON.stringify(response[i]) );
                }
                
                $window.sessionStorage.filters = JSON.stringify($scope.filter);
                
                // SCOPE FILTER PUSH
                if ($scope.filter.length > 0) {

                    console.log( '|------------------------------------|' );
                    console.log( 'SCOPE.FILTER >> ', $scope.filter );

                    $window.sessionStorage.filters = JSON.stringify($scope.filter);

                    console.log( '|------------------------------------|' );
                    console.log( 'SESSION-STORAGE.FILTERS >> ', $window.sessionStorage.filters );
                    // RESET PAGING OPTIONS
                    thisModule.paging = moduleService.modulePagingOptions($scope.currentModule);
                    $window.sessionStorage.paging = JSON.stringify(thisModule.paging);
                    // GET MODULE FROM FILTERS
                    contentService.newPagingOptions($scope);
                } else {
                    $window.sessionStorage.filters = JSON.stringify([]);
                    contentService.newPagingOptions($scope);
                }
                
                
            }, function(error){
                
                console.log( '|-------------------------------------|' );
                console.log( 'REPORT-FILTER.ERROR >> ', error );
                
            });

		};
	
		// TEMP HACK FOR DECIMAL FIELDS WHERE USER IS NOT INSERTING
		// THE PRECEDING ZERO ie: .01 instead of 0.01
		// add to the mathServices.js file
		$scope.formatNumber = function($event){
			
			var el = angular.element($event.currentTarget)[0],
				val = el.value, id = el.id;
			
			parseFloat(el.value) < 0 ? val = ('0' + val).toString() : null;
			
			var thisObject = {};
			( $scope.currentModule.type === 1 ) ? 
				thisObject = $scope.newResource : thisObject = $scope.newTransaction;
			
			thisObject[id].value = parseFloat(val).toFixed(3);
			
		};
        
        

}]);