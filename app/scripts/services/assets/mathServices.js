'use strict';

/**
 * @ngdoc service
 * @name clientApp.mathServices
 * @description
 * # wayBillService
 * Service in the clientApp.
 */

/* ================================================
    Service to Manage Math Service
================================================ */

angular.module('clientApp.mathServices', []).service('mathService', function (utils) {

    return {
        
        // QUICK SUM OF TRANSACTIONS
        sumTransaction: function( items, prop ){
            /*
            console.log( '|-------------------------------------|' );
            console.log( 'SUM-TRANSACTION.ITEMS >> ', items );
            console.log( 'SUM-TRANSACTION.PROP >> ', prop );
            */
            return items.reduce(function(a, b){
                
                // console.log( 'ITEM.REDUCE.A >> ', a );
                // console.log( 'ITEM.REDUCE.B >> ', b );
                
                utils.toType(b) === 'undefined' ? b = Number(parseFloat(0.00)) : null;
                
                // console.log( 'A + B[prop] >> ', a + b[prop] );
                
                return a + b[prop];
                
            }, 0);
            
        },
        
        calcValue: function(qty,price){
            var total = 0;
            total = Number(parseInt(qty) * parseFloat(price));
            return utils.roundUp(total,3);
        },
        
        calcTotal: function(array){
            var total = 0;
            array.map(function( item, key ){
                total += Number(parseFloat(array[key]));
            });
                        
            return total
        },
        
        getTotalDeposit: function(object){
            var total = 0;
            
            object.map(function( item ){
                var litter_rate = Number(parseFloat(item.litter_rate)),
                    bpc = Number(parseInt(item.bottles_per_case)),
                    bps = Number(parseInt(item.bottles_per_sku)),
                    quantity = Number(parseInt(item.quantity));
                
                var totalDeposit = parseFloat(((litter_rate * bpc) / bps) * quantity);
                total += Number(parseFloat(totalDeposit));
            });
            
            return total;
        },
        
        getGST: function( subTotal, taxRate ){
            var gst =   Number(parseFloat(taxRate) * parseFloat(subTotal));
            return gst;
        },
        
        getSubTotal: function(object){
            var subTotal = 0, 
                self = this;
            
            object.map(function(item){
                subTotal += Number(self.calcValue( item.quantity, parseFloat(item.calculatedPrice) ));
            });
            
            return subTotal;
        }
        
    };

});