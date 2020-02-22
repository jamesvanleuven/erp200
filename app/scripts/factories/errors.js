'use strict';

/**
 * batch helper functions added to $scope
 * added on 2017-04-11 - Taher Dameh
 
 * destroyed and over-written 
 * 2017-06-08 - James Van Leuven

 */

angular.module('clientApp').factory('errors', function($rootScope, utils){

    return {
		
		// JSON OBJECTS KEY/VALUE TEST
		isJSON: function( row, key ){
			var error = [];

			if( key === 'full_address'){
                
				if(row.street.id !== 0){ error.push({ street: null }); }
				if(row.city.id === 0){ error.push({ city: null }); }
				if(row.province.id === 0){ error.push({ province: null }); }
				if( utils.isNull(row.zipcode) === true ){ error.push({ zipcode: null }); }
				
				if(error.length > 0){ return error; }
			}
			else{ return; }
		},
		
		// SELECT OPTIONS VALIDATION
		isSELECT: function( row, key ){
			
			var self = this;
			
			if(key === 'city' || key === 'province' || key === 'street' || key === 'address' ){
				return self.isJSON( row, key );
			}
			else if( row.selected.id === 0 ){ return { [key]: null };
			}
			else{ 
				return; 
			}
		},
		
		isCS: function( row, key ){
			
			console.log( 'CS-OBJECT >> ', key, row );
			
		},
		
		// IS NUMBER VALIDATION 
		isNUMBER: function( row, key ){
			if( utils.isNumber(row.value) !== true ){ return { [key]: false };
			} else if( utils.isNull(row.value) !== false ){ return { [key]: null }; }
			
		},
		
		// IS TEXT VALIDATION
		isTEXT: function( row, key ){
			if( utils.isNull(row.value) !== false ){ return { [key]: null }; }
			else{ return; }
			
		},
		
    };

});