'use strict';

/**
 * GENERAL JSON OBJECT BUTTON EVENT
 */

angular.module('clientApp').factory('calculator', function(){
    
    return {
        
        modalSum: function(arr){
            var sum = 0;
            for(var i = 0; i < arr.length; i++){
                sum += parseFloat(arr[i]);
            }
            return sum.toFixed(2);
        },
        
        getTotal: function($scope){
            var thisModule = $scope.$parent.currentModule,
                thisMethod = thisModule.modal.method;

            var total = 0, thisObject = 0;
            
            switch(thisMethod){
                case 'add':
                    thisObject = $scope.newTransaction.products.value;
                break;
            }
            
            for(var i = 0; i < thisObject.length; i++){
                var product = parseFloat(thisObject[i].retail_price);
                total += product;
            }
            return total;
        }
        
    };
    
});