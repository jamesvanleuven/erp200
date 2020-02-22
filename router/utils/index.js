'use strict';

/*
var db = require("../../database"), 
    moment = require('moment-timezone'),
	querystring = require('querystring');
*/

module.exports = {
	
	/**
	 * EXISTS IN ARRAY 
	 */
	existsInArray: function(arr,obj) {
    	return (arr.indexOf(obj) !== -1);
	},
	
	insert: function(update, inventory){
		
		for(var i = 0; i < inventory.length; i++){
			
			for(var n = 0; n < update.length; n++){
				
				if( parseInt(inventory[i].product_id) === parseInt(update[n].id) ){
					
					inventory[i].quantity = parseInt(inventory[i].quantity) - parseInt(update[n].quantity); 
					inventory[i].on_hold = parseInt(inventory[i].on_hold) + parseInt(update[n].quantity);
					
				}
				
			}
			
			// ASSIGN SUCCESS | FAILURE STATUS
			parseInt(inventory[i].quantity) >= 0 ? inventory[i].success = true : inventory[i].success = false;
			
		}
		
		return inventory;
		
	},
	
	/**
	 * UPDATE INVENTORY
	 */
	update: function(reset, inventory){
		
		for(var i = 0; i < inventory.length; i++){

			for(var r = 0; r < reset.length; r++){

				// UPDATE CURRENT INVENTORY WITH RESET QUANTITIES
				if( parseInt(inventory[i].id) === parseInt(reset[r].id) ){
					
					inventory[i].quantity =  parseInt(reset[r].quantity);
					inventory[i].on_hold = parseInt(reset[r].on_hold);
					
				}

			}

		}
		
		// console.log( '|-------------------------------------|' );
		// console.log( 'RESET-RESULTS >> ', inventory );
		
		return inventory;
		
	},
	
	/**
	 * RESET OLD INVENTORY
	 */
	reset: function(oldItems, inventory){

		for(var o = 0; o < oldItems.length; o++){

			// console.log( '|-------------------------------------|' );

			for(var i = 0; i < inventory.length; i++){

				// RESET OLD INVENTORY
				if( parseInt(oldItems[o].id) === parseInt(inventory[i].product_id) ){

					// console.log( 'OLD-ITEM[' + o + '] >> ', oldItems[o] );
					// console.log( 'INVENTORY[' + i + '] >> ', inventory[i] );

					inventory[i].quantity = parseInt(oldItems[o].quantity) + parseInt(inventory[i].quantity);
					inventory[i].on_hold = parseInt(inventory[i].on_hold) - parseInt(oldItems[o].quantity);

				}

			}

		}
		
		// console.log( '|-------------------------------------|' );
		// console.log( 'RESET-RESULTS >> ', inventory );
		
		return inventory;
		
	},

	/**
	 * INVENTORY PRODUCTS
	 */
	inventory: function(module, params){
		
		// console.log( '|-----------------------------|' );
		console.log( 'MODULE >> ', module );
		console.log( 'PARAMS >>', params );
		
		var self = this,
			_warehouse = 0,
			_manufacturer = 0,
			_items = [],
			_oLineItems = params.oOrderItems,
			_nLineItems = params.products.value;
		
		switch(module){
			case 'orders': 
				
				_warehouse = params.location.selected.id;
				_manufacturer = params.manufacturer.selected.id;
				
			break;
			case 'transfers': 
				
				_warehouse = params.from_warehouse.selected.id;
				_manufacturer = params.manufacturer.selected.id;
				
			break;
		}
		
		for(var o = 0; o < _oLineItems.length; o++){
			self.existsInArray(_items, _oLineItems[o].id) === false ? 
				_items.push( _oLineItems[o].id ) : 
			null;
		}
		
		for(var n = 0; n < _nLineItems.length; n++){
			self.existsInArray(_items, _nLineItems[n].id) === false ? 
				_items.push( _nLineItems[n].id ) : 
			null;	
		}
		
		var query = [
				_items,
				_manufacturer,
				_warehouse
			];
		
		return query;
	},
	
	/**
	 * capitalise every word in a string
	 * split on ' ' to handle special characters
	 */
	stringCapitalise: function( str ){

	   var splitStr = (str).toLowerCase().split(' ');
	   for (var i = 0; i < splitStr.length; i++) {
		   // You do not need to check if i is larger than splitStr length, as your for does that for you
		   // Assign it back to the array
		   splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	   }
	   // Directly return the joined string
	   return splitStr.join(' '); 

	},
	
	// SET DEFAULT DATE RANGE (THIS MONTH)
	setDateRange: function(year, month){
		var moment = require('moment');

		// month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
		// array is 'year', 'month', 'day', etc
		var startDate = moment([year, month - 1]);

		// Clone the value before .endOf()
		var endDate = moment(startDate).endOf('month');

		// just for demonstration:
		// console.log( 'UTILS.SET-DATE-RANGE.START-DATE >> ', startDate.toDate() );
		// console.log( 'UTILS.SET-DATE-RANGE.END-DATE >> ', endDate.toDate() ); 

		// make sure to call toDate() for plain JavaScript date type
		return { 
			start: startDate.toDate(), 
			end: endDate.toDate() 
		};
	},
    
    // SORT ARRAY OBJECTS BY KEY
    sortByKey: function(array, key){
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    },
    
    // REMOVE NaN, null, 0, false
    removeEmpty: function(arr) {
        var filteredArray = arr.filter(Boolean);
        // console.log( 'FILTERED-ARRAY >>> ', filteredArray );
        return filteredArray;
    },
    
    /**
     * REPLACE JAVASCRIPT typeOf
     * toType({a: 4}); //"object"
     * toType([1, 2, 3]); //"array"
     * (function() {// console.log(toType(arguments))})(); //arguments
     * toType(new ReferenceError); //"error"
     * toType(new Date); //"date"
     * toType(/a-z/); //"regexp"
     * toType(Math); //"math"
     * toType(JSON); //"json"
     * toType(new Number(4)); //"number"
     * toType(new String("abc")); //"string"
     * toType(new Boolean(true)); //"boolean"
     */
    toType: function(obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    
    /**
     * isNaN
     */
    isNaN: function(value) {
        return Number.isNaN(Number(value));
    },
    
    /**
     * COUNT JSON OBJECT KEY/VALUE PAIRS 
     */
    countJSON : function(obj) { 
        return Object.keys(obj).length; 
    },
    
    /**
     * ENCODE: BASE64 ENCODE FROM UTF-8
     * DECODE: UTF-8 DECODE FROM BASE64
     */
    stringEncode: function( str ){ var encodedString = window.btoa(encodeURI(str)); return encodedString; },
    stringDecode: function( str ){ var decodedString = decodeURI(window.atob(str)); return decodedString; }

};