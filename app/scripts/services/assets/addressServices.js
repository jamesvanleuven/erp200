'use strict';

/**
 * @ngdoc service
 * @name clientApp.addressService
 * @description
 * # addressService
 * Service in the clientApp.
 */
angular.module('clientApp.addressServices',[])
    .service('addressService', function ( $compile , $q , $rootScope) {
    
    return  {
        getAddress  : function(id,module){
            var deferred = $q.defer() , addressBook ,  address  =   false;
            
            addressBook = $rootScope.profile[module];
            
            //// console.log('Address Book',addressBook);

            angular.forEach(addressBook,function(v){
                if(v.id == id){
                    // console.log('Found a matching id',v);
                                        
                    //deferred.resolve(v.address);
                    
                    address = v.address;
                } 
            });
            
            return address;
            //return deferred.promise;
        }  
    };
    
});