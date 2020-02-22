'use strict';
/**
 * @ngdoc service
 * @name clientApp.transactionServices
 * @description
 * # transaactionService
 *
 *  RESOURCE SERVICES CONFIGURATION FILE MANAGER
 *  -----------------------------------------------
 *  - ADD A RESOURCE OBJECT (MANUALLY)
 *  - EDIT A RESOURCE OBJECT
 *  - DELETE (ARCHIVE) A RESOURCE OBJECT
 *  - IMPORT RESOURCES
 *  - EXPORT VISIBLE TABLE RESOURCES
 *  - PRINT VISIBLE TABLE RESOURCES
 */
angular.module('clientApp.resourceServices', []).service('resourceService', [
    '$q',
    '$rootScope',
    '$window',
    '$compile',
    'utils',
    'moment',
    'importService',
    'exportService',
    'modalService',
function ($q, $rootScope, $window, $compile, utils,  moment, importService, exportService, modalService){

    return {
        
        price: function(int){
            
            var str, str2;
            
            switch(int){
                case 1: 
                    str = 'manufacturer_price';
                    str2 = 'mfr_price';
                break;
                case 2: 
                    str = 'retail_price';
                    str2 = 'rtl_price';
                break;
                case 3: 
                    str = 'wholesale_price';
                    str2 = 'ws_price';
                break;
            }
            
            // HACK FOR SCHEMA FAILING TO RETURN COLUMNS FROM DB
            // NEED TO CROSS JOIN BATCH AND INVENTORY TABLES SCHEMA
            return {
                alias: str,
                data_type: 'numeric(10,2)',
                field: str2,
                input: 'number',
                name: str,
                permissions: {
                    _get: true,
                    _put: true,
                    _post: true,
                    _patch: true
                },
                required: true,
                table: 'pim_batch',
                value: null,
                view: null,
                visible: true
            };
            
        },

        config: function($scope , $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                method = thisModule.modal.method;

            console.log( '|--------------------------------------|' );
            console.log( 'RESOURCE-SERVICE CONFIG-SCOPE >> ', $scope );
            console.log( '|--------------------------------------|' );
            console.log( 'RESOURCE-SERVICE CONFIG-EVENT >> ', $event );

            var resource = {
                'edit': function(){ self.editResource( $scope, $event ) },
                'add': function(){ self.addResource( $scope, $event ) },
                'import': function(){ return importService.importOptions($scope, $event); },
                'export': function(){ return exportService.exportOptions( $scope, $event ); },
                'template': function(){ return exportService.exportOptions( $scope, $event ); }
            };

            return resource[method]();
        },

        addResource: function($scope, $event, cloneOnly){

            console.log( '|--------------------------------------|' );
            console.log( 'addResources.scope', $scope );

            var self = this,
                thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                thisModal = thisModule.modal,
                parent = $scope[moduleName][0],
                child = $scope.newResource = {},
				elements = $rootScope.assets[moduleName].elements,
                newSelect = {
                    id: 0,
                    value: null
                };

            console.log( '|---------------------------------------------|' );
            console.log( 'thisModule', thisModule );
            console.log( '|---------------------------------------------|' );
            console.log( 'moduleName', moduleName );
            console.log( '|---------------------------------------------|' );
            console.log( 'thisModal', thisModal );
            console.log( '|---------------------------------------------|' );
            console.log( 'parent', utils.toType(parent), parent );
			console.log( '|---------------------------------------------|' );
			console.log( 'SCHEMA >> ', $rootScope.assets[moduleName].elements );

			/**
			 * PARSE OUT KEY/VALUE PAIRS OF ELEMENT ASSETS
			 */
			var moduleElements = {};
			for(var i = 0; i < elements.length; i++ ){
				moduleElements[elements[i].alias] = elements[i];
			}
			
			console.log( '|---------------------------------------------|' );
			console.log( 'OBJECT-ELEMENTS ', moduleElements );
			
			utils.toType(parent) === 'undefined' ? 
				$scope.newResource = angular.copy(moduleElements, child) : 
				$scope.newResource = angular.copy(parent, child );


			console.log( '|---------------------------------------------|' );
			console.log( 'NEW RESOURCE >> ', $scope.newResource );


            $scope.newResource.modal = thisModal;
			$scope.newResource.modal.html = null;
			delete $scope.newResource.modal.html;

            $scope.newResource.id = -1;
            $scope.newResource.notes = { value: [] };
            $scope.newResource.created =  moment(new Date()).format('YYYY-MM-DDTHH:mm:ssZ');
			
			if( moduleName !== 'products' ){
                
                console.log( '|-------------------------------|' );
                console.log( 'PRODUCT.RESOURCE >> ', $scope.newResource );
                
				// ADJUST FULL_ADDRESS OBJECT
				var address = {};
				angular.copy( $scope.newResource.full_address, address );

				var full_address = {
					street: { id: 0, value: null },
					city: { id: 0, value: null },
					province: { id: 0, value: null },
					zipcode: null
				};

				$scope.newResource.full_address = full_address;	
				$scope.newResource.delivery_days = utils.deliveryDay();
				$scope.newResource.opens_at.value = moment(new Date()).format( 'YYYY-MM-DD 07:00:00');
				$scope.newResource.closes_at.value = moment(new Date()).format( 'YYYY-MM-DD 17:00:00');	
			}
			else{
				// DEFINE MANUFACTURER ID FOR INSERT OF PRODUCT
				// 1 | 3 = sysAdmin | Distributors, 2 = Manufacturer
				( $rootScope.credentials.group_id === 1 || $rootScope.credentials.group_id === 3 ) ?
				$scope.newResource.manufacturer = { value: parseInt($window.sessionStorage.establishment) } : 
				$scope.newResource.manufacturer = { value: $rootScope.profile.establishment };
                $scope.newResource.upc = { value: '' };
                utils.toType($scope.newResource.manufacturer_price) === 'undefined' ? 
                    $scope.newResource.manufacturer_price = self.price(1) : 
                    null;
                 utils.toType($scope.newResource.retail_price) === 'undefined' ? 
                    $scope.newResource.retail_price = self.price(2) : 
                    null;
                utils.toType($scope.newResource.wholesale_price) === 'undefined' ? 
                    $scope.newResource.wholesale_price = self.price(3) : 
                    null;
			}
            
            // SET DEFAULT VALUES FOR TRANSACTION
            angular.forEach($scope.newResource, function(item, key){
				
				console.log( '|---------------------------------------------|' );
				console.log( 'RESOURCE KEY/VALUE PAIRS >> ', key, item );
				
                if( item.input ){
					
					switch(item.input){
						case 'select': item.selected = newSelect; break;
						case 'text': 
							
							key === 'products' ? 
								item.value = [newSelect] : 
								item.value = null;
							
						break;
						case 'json': 
							
							if(key === 'full_address'){
								item.city = {id: 0, value: null};
								item.province = {id: 0, value: null};
								item.zipcode = null;
								item.street = {id: 0, value: null};
							}
							
						break;
						default: item.value = null;
					}
				}
				
            });
				
			if( moduleName === 'manufacturers' ){
				$rootScope.assets[moduleName].wineries = [];
				$rootScope.assets[moduleName].distilleries = [];
				$rootScope.assets[moduleName].breweries = [];
				// POPULATE WINERIES
				$rootScope.assets[moduleName].wineries = $rootScope.assets[moduleName].license_sub_types.slice(0, 6);
				// POPULATE BREWERIES
				$rootScope.assets[moduleName].breweries.push($rootScope.assets[moduleName].license_types[6] );
				$rootScope.assets[moduleName].breweries.push($rootScope.assets[moduleName].license_types[7] );
				// POPULATE DISTRILLERIES
				$rootScope.assets[moduleName].distilleries.push($rootScope.assets[moduleName].license_sub_types[6] );
				$rootScope.assets[moduleName].distilleries.push($rootScope.assets[moduleName].license_sub_types[7]);
				$rootScope.assets[moduleName].distilleries.push($rootScope.assets[moduleName].license_sub_types[10]);
			}


            utils.toType($scope.newResource.product_id) !== 'undefined' ? $scope.newResource.product_id = -1 : null;

            console.log( '|---------------------------------------------|' );
            console.log( 'CLONED RESOURCE TEMPLATE ', $scope.newResource );

            if (!cloneOnly) self.buildHtml($scope);
        },

        editResource: function( $scope, $event ){

            console.log( 'editResource.scope', $scope );
            console.log( 'editResource.event', $event );

            var self = this,
                thisModule = $scope.$parent.currentModule,
				thisModal = thisModule.modal,
                moduleName = thisModule.name.toLowerCase(),
                moduletype = thisModule.type,
                ordinal = thisModal.index,
                parent = $scope[moduleName][ordinal],
                child = $scope.newResource = {},
                notes = {
                    alias: null,
                    data_type: "object",
                    field: "notes",
                    input: "json",
                    permissions: null,
                    required: true,
                    table: "pim_orders",
                    value: [],
                    visible: true
                };

            // CLONE TO NEW OBJECT
            $scope.newResource = angular.copy( parent, child );
            utils.toType($scope.newResource.notes) === 'undefined' ?
                $scope.newResource.notes = notes : null;

            // DIRTY HACK FOR PRODUCTS
            if( moduleName === 'products' ){
                // EXPECTING SKU AND UPC TO BE NUMBERS
                utils.toType($scope.newResource.upc.value) !== 'number' ?
                    $scope.newResource.upc.value = Number($scope.newResource.upc.value) : null;
            }
			
			if( moduleName === 'manufacturers' ){
				$rootScope.assets[moduleName].wineries = [];
				$rootScope.assets[moduleName].distilleries = [];
				$rootScope.assets[moduleName].breweries = [];
				// POPULATE WINERIES
				$rootScope.assets[moduleName].wineries = $rootScope.assets[moduleName].license_sub_types.slice(0, 6);
				// POPULATE BREWERIES
				$rootScope.assets[moduleName].breweries.push($rootScope.assets[moduleName].license_types[6] );
				$rootScope.assets[moduleName].breweries.push($rootScope.assets[moduleName].license_types[7] );
				// POPULATE DISTRILLERIES
				$rootScope.assets[moduleName].distilleries.push($rootScope.assets[moduleName].license_sub_types[6] );
				$rootScope.assets[moduleName].distilleries.push($rootScope.assets[moduleName].license_sub_types[7]);
				$rootScope.assets[moduleName].distilleries.push($rootScope.assets[moduleName].license_sub_types[10]);
                
                // bad address hack
                $scope.newResource.address.value = $scope.newResource.full_address.street;
			}
			
			// DEAL WITH 'ZERO' INPUTS
			angular.forEach($scope.newResource, function(row){
				
				row.value === 0 ? row.value = null : null;
				
			});
			
            $scope.newResource.modal = thisModal;
			$scope.newResource.modal.html = null;
			delete $scope.newResource.modal.html;

            console.log( '|--------------------------------------|' );
            console.log( 'CLONED RESOURCE', moduleName, $scope.newResource );
			
			if( moduleName !== 'products' ){
				// ADJUST FULL_ADDRESS OBJECT
				var address = {};
				angular.copy( $scope.newResource.full_address, address );

				var full_address = {
					street: { id: address.address_id, value: address.street },
					city: { id: address.city_id, value: address.township },
					province: { id: address.state_id, value: address.province },
					zipcode: address.zipcode
				};

				$scope.newResource.full_address = full_address;	
			}

            self.buildHtml($scope);
        },
        // BUILD THE HTML STRING FOR THE MODAL WINDOW
        buildHtml: function( $scope ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                moduleMethod = thisModule.modal.method,
                moduleName = thisModule.name,
                str = '<div data-ng-include="\'views/modules/_partials/_resources/_'+moduleMethod+moduleName+'Resources.html\'"/>';

            $scope.$parent.currentModule.modal.html = str;
            modalService.launchModal( $scope );

            // LOAD THE STRING
            angular.element('#modalContainer').html($compile(str)($scope));
        },

    }

}]);
