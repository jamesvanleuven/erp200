'use strict';

/**
 * @ngdoc service
 * @name clientApp.domServices
 * @description
 * # domService
 * Service in the clientApp.
 */

/* ================================================
    Service to Manage Modules
================================================ */

angular.module('clientApp.domServices', []).service('domService', function($q, $rootScope, $compile, utils, viewService) {

    return {
        
        addRow: function($scope){
            var thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                moduleAssets = $rootScope.assets[moduleName],
                // thisModal = thisModule.modal,
                thisTransaction = $scope.newTransaction, 
                // thisMethod = thisTransaction.method,
                lineItems = thisTransaction.products.value,
                productList = [], rows = [];
            
            // CLONE EXISTING PRODUCT LIST
            var products = angular.copy( moduleAssets.products, rows );

            // FORMAT NEW PRODUCT LIST
            for(var i = 0; i < products.length; i++ ){
                var item = products[i];
                // ASSIGN DEFAULTS 
                if( item.inventory > 0 ){
                    item.quantity = 1;
                    item.oQuantity = 0;
                    item.dQuantity = 1;
                    item.nQuantity = 1;
                    item.oInventory = parseInt(item.inventory);
                    item.nInventory = item.oInventory - 1;
                    item.dInventory = -1;
                }
                else{
                    item.quantity = 0;
                    item.oQuantity = 0;
                    item.dQuantity = 0;
                    item.nQuantity = 0;
                    item.oInventory = parseInt(item.inventory);
                    item.nInventory = item.oInventory;
                    item.dInventory = 0;
                }
                
                // ADD ITEMS BACK TO NEW ROW ITEM
                item.sku = item.sku,
                item.litres_per_bottle = item.litres_per_bottle;

                item.Tax = parseFloat(0.07).toFixed(2);
                item.price = parseFloat(item.retail_price).toFixed(2);
                item.totalDeposit = parseFloat(item.litter_rate).toFixed(4) * 1;
                item.subTotal = (item.price * 1).toFixed(2);
                item.totalTax = (item.subTotal * item.Tax).toFixed(2);
                item.value = [
                    item.product,
                    item.sku
                ];

                // PUSH ITEM TO PRODUCT LIST
                productList.push(item);
            }
            
            // CREATE A CLEAN LINE ITEM
            var parent = productList[0],
                row = {},
                newItem = {};
            angular.copy(parent, row);
            
            // CLEAN NEW LINE ITEM
            angular.forEach(row, function(item, key){
                
                switch( utils.toType(item)){
                    case 'number': item = 0; break;
                    case 'string': item = '';  break;
                    case 'object': item = {id: 0, value: ''}; break;
                    case 'array': item = []; break;
                }
                newItem[key] = item;
            });
            
            // INSERT CLEAN LINE ITEM
            lineItems.length > 0 ? lineItems.unshift(newItem) : lineItems.push(newItem);
            thisTransaction.productList = productList;
        },
        
        // SHOW | HIDE COMPONENT VIEW COLUMNS FROM FILTER
        columns: function(key, $scope){
            
            var item = $scope.currentModule.elements[key],
                input = item.input, active = item.display,
                column = angular.element('.' + key);
			
			if(active === false){
				angular.element( '#' + key).attr('disabled', 'disabled').attr('readonly', 'readonly');
				angular.element(column).hide()
			}
			else{
				angular.element( '#' + key).removeAttr('disabled').removeAttr('readonly');
				angular.element(column).show();
			}
        },
        
        // EXPAND | CONTRACT SEARCH BAR
        searchBar: function($scope){
            
            var deferred = $q.defer();
            
            // console.log( '|---------------------------------------------|');
            // console.log( 'SEARCH BAR >> ', $scope );
            
            var thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name,
                sideBar = '.' + moduleName.toLowerCase() + '-sidebar',
                content = '.' + moduleName.toLowerCase() + '-content';
            /*
            console.log( '|---------------------------------------------|');
            console.log( 'THIS-MODULE >> ', thisModule );
            console.log( '|---------------------------------------------|');
            console.log( 'MODULE-NAME >> ', moduleName );
            */
            if(angular.element(sideBar).is(':visible') === false){
                
                viewService.viewFilters($scope).then(function(success){
                    
                    // console.log( '|---------------------------------------------|');
                    // console.log( 'DOM-SERVICES SUCCESS >> ', success );
                    
                    var str = success.header + success.body + success.footer;
                    angular.element(sideBar).html( $compile(str)($scope) );
                    
                    deferred.resolve({ active: true, obj: str });
                });
                
                
                angular.element('.search-bar').hide();
                angular.element(content).removeClass('col-md-12').addClass('col-md-7');
                angular.element(sideBar).css('display', 'block');
                angular.element('.search-button').addClass('active');
            }
            else{
                angular.element('.search-bar').show();
                angular.element(content).removeClass('col-md-7').addClass('col-md-12');
                angular.element(sideBar).css('display', 'none');
                angular.element('.search-button').removeClass('active');
                deferred.resolve({ active: false, obj: null });
            }
            
            return deferred.promise;

        }
        
    };
    
});