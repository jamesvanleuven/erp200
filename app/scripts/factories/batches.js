'use strict';

/**
 * batch helper functions added to $scope
 * added on 2017-04-05 - James Van Leuven
 *
 * ORDER STATUSES
 *  1: ENTERED
 *  2: PENDING
 *  3: DELIVERED
 *  4: VOIDED
 *
 * TRANSFER STATUSES
 *  5: INITIATED
 *  6: ACCEPTED
 *  7: RECEIVED
 *  4: VOIDED
 */

angular
.module('clientApp')
.factory('batches', [ '$window', function( $window ){
    
    return {
        
        /**
         * STATUS UPDATE ERROR
         */
        batchStatusError: function(error){
            var response = {},
                str = 'There was an error changing the status.\n';
            
            str += 'Click \'OK\' to continue, or click \'CANCEL\' to abort.';
            str += '\n\nERROR MESSAGE:\n' + error;
            
            $window.confirm(str) ? 
                response = { continue: true } : 
                response = { continue: false };
            
            return response;
        },
        
        /**
         * BATCH IDS CONFIRM DIALOG
         */
        batchConfirm: function(thisBatch, $scope ){
            var thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase();
            
            console.log( '|-------------------------------------|' );
            console.log( 'BATCH-CONFIRM.THIS-BATCH >> ', thisBatch );
            
            var objLength = thisBatch.ids.length,
                itemLength = thisBatch.batchItems.length,
                oStatus = thisBatch.status.old.value,
                nStatus = thisBatch.status.new.value,
                confirmObject = {}, 
				str = '';
			
			if( thisBatch.ids.length > 0 ){
				str += objLength + ' of the ';
				str += itemLength + ' ' + moduleName;
				str += ' selected will have their statuses changed from ';
				str += oStatus + ' to ' + nStatus;
				str += '\nClick \'OK\' to continue, or ';
				str += 'click \'CANCEL\' to ';
				str += 'print without changing the status';
				
				$window.confirm(str) ?
					confirmObject = { event: thisBatch.type, confirm: true, status: true } : 
					confirmObject = { event: thisBatch.type, confirm: false, status: false };
			}
			else{
				confirmObject = { event: thisBatch.type, confirm: false, status: false };
			}
            
            console.log( '|-------------------------------------|' );
            console.log( 'BATCH-CONFIRM.STR >> ', str );
            
            return confirmObject;
        },
        
        /**
         * ORDERS BATCH COUNT FOR STATUS CHANGES
         */
        ordersBatchCount: function( $scope, $event ){
            
            var thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(), 
				methodType = $event.currentTarget.dataset.id;
            
            var oldStatus = {},
                newStatus = {}, 
                batchItems = [],
                changeId = [], 
                inventory = false;

            // LOOP THROUGH BATCH ORDINALS TO RETREIVE BATCH ROWS
            for( var i = 0; i < $scope.batchItems.length; i++ ){
                var batchRow = $scope[moduleName][ $scope.batchItems[i]],
                    child = {};
                batchItems.push(angular.copy( batchRow, child ));
				
				console.log( '|-------------------------------------|' );
				console.log( '$socpe[' + moduleName + '][' + $scope.batchItems[i] + '] >> ', batchRow );
            }
            
			switch(methodType){
				case 'doc60': 
					oldStatus = { id: 1, value: 'Entered' };
					newStatus = { id: 2, value: 'Pending' };
					inventory = false;
				break;
				case 'delivered': 
					oldStatus = { id: 2, value: 'Pending' };
					newStatus = { id: 3, value: 'Delivered' };
					inventory = true;
				break;
				default: 
					oldStatus = { id: 0, value: '' };
					newStatus = { id: 0, value: '' };
					inventory = false;
			}

            for( i = 0; i < batchItems.length; i++ ){

                console.log( '|-------------------------------------|' );
                console.log( 'ORDER-BATCH-ITEMS[' + i + '] >> ', batchItems[i] );
                
                parseInt(batchItems[i].status.selected.id) !== 4 ?
                    parseInt(batchItems[i].status.selected.id) === parseInt(oldStatus.id) ?
                        changeId.push({ idx: i, obj: batchItems[i] }) : null :
                    null;
            }
            
            console.log( '|-------------------------------------|' );
            console.log( 'ORDER STATUS CHANGES >> ', changeId );
            
            var ordersBatchObject = {
                type: $event.currentTarget.dataset.id,
                status: {
                    old: oldStatus,
                    new: newStatus
                },
                ids: changeId,
                batchItems: batchItems,
                inventory: inventory
            };

            return ordersBatchObject;
        },
        
        /**
         * TRANSFERS BATCH COUNT FOR STATUS CHANGES
         */
        transfersBatchCount: function( $scope, $event ){
            
            var thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name.toLowerCase(), 
				methodType = $event.currentTarget.dataset.id;
            
            var oldStatus = {},
                newStatus = {}, 
                batchItems = [],
                changeId = [], 
                inventory = false;

            // LOOP THROUGH BATCH ORDINALS TO RETREIVE BATCH ROWS
            for( var i = 0; i < $scope.batchItems.length; i++ ){
                var batchRow = $scope[moduleName][ $scope.batchItems[i]],
                    child = {};
                batchItems.push(angular.copy( batchRow, child ));
				
				console.log( '|-------------------------------------|' );
				console.log( '$socpe[' + moduleName + '][' + $scope.batchItems[i] + '] >> ', batchRow );
            }

            console.log( '|-------------------------------------|' );
            console.log( 'NEW-BATCH-ITEMS >> ', batchItems );
            
			switch(methodType){
				case 'received': 
					oldStatus = { id: 6, value: 'Accepted' };
					newStatus = { id: 7, value: 'Received' };
					inventory = true;
				break;
				case 'billoflading': 
					oldStatus = { id: 5, value: 'Initiated' };
					newStatus = { id: 6, value: 'Accepted' };
					inventory = false;
				break;
				default: 
					oldStatus = { id: 0, value: '' };
					newStatus = { id: 0, value: '' };
					inventory = false;
			}

            for( i = 0; i < batchItems.length; i++ ){

                console.log( '|-------------------------------------|' );
                console.log( 'ORDER-BATCH-ITEMS[' + i + '] >> ', batchItems[i] );

                parseInt(batchItems[i].status.selected.id) !== 4 ? 
                    parseInt(batchItems[i].status.selected.id) === parseInt(oldStatus.id) ?
                        changeId.push({ idx: i, obj: batchItems[i] }) : null : 
                    null;
            }
			
            for( i = 0; i < batchItems.length; i++ ){

                console.log( '|-------------------------------------|' );
                console.log( 'ORDER-BATCH-ITEMS[' + i + '] >> ', batchItems[i] );
                
                parseInt(batchItems[i].status.selected.id) !== 4 ?
                    parseInt(batchItems[i].status.selected.id) === parseInt(oldStatus.id) ?
                        changeId.push({ idx: i, obj: batchItems[i] }) : null :
                    null;
            }
            
            console.log( '|-------------------------------------|' );
            console.log( 'TRANSFERS STATUS CHANGES >> ', changeId );
            
            var transfersBatchObject = {
                type: $event.currentTarget.dataset.id,
                status: {
                    old: oldStatus,
                    new: newStatus
                },
                ids: changeId,
                batchItems: batchItems,
                inventory: inventory
            };

            return transfersBatchObject;
        },
        
    };
    
}]);