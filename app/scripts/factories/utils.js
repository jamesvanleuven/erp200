'use strict';

/**
 * utility helper functions added to $scope
 * added on 2015-05-14 - James Van Leuven
 *  --------------------
 *  Validation RegExp
 *  --------------------
 *  1: generic email
 *  2: cdn/usa phone number
 *  3: uk phone number
 *  4: eu phone number
 *  5: usa zipcode
 *  6: cdn postalcode
 *  7: uk postalcode
 *  8: strong password
 *  --------------------
 *  9: growl utility
 *  --------------------
 * 10: replace all instances of a character in a string
 * 11: round up number with decimal float
 */

angular
.module('clientApp')
.factory('utils', function( $q, $window, growl, moment ){
    return {

		/**
		 * LAST MONTH DATE RANGE
		 */
		getPreviousDateRange: function(int) {
			
			var year = moment().year(),
				month = moment().month(),
				increment = parseInt(int);
			
			// console.log( '|--------------------------------------|' );
			// console.log( 'YEAR >> ', year );
			// console.log( 'MONTH >> ', month );
			
			var startDate = moment([year, month - increment]);
			var endDate = moment(startDate).endOf('month');

			// console.log( '|--------------------------------------|' );
			// console.log(startDate.toDate());
			// console.log(endDate.toDate());

			return { startDate: startDate, endDate: endDate };
		},
		
		/**
		 * CURRENT MONTH DATE RANGE
		 */
		getCurrentDateRange: function() {
			
			var year = moment().year(),
				month = moment().month();
			
			// console.log( '|--------------------------------------|' );
			// console.log( 'YEAR >> ', year );
			// console.log( 'MONTH >> ', month );
			
			var startDate = moment([year, month]);
			// var endDate = moment(startDate).endOf('month');

			// console.log( '|--------------------------------------|' );
			// console.log(startDate.toDate());
			// console.log(endDate.toDate());

			return { startDate: startDate, endDate: moment() };
		},
        
        /**
         * PARSE DATE OBJECT
         */
        parseDateObject: function( obj ){
            
            console.log( '|--------------------------------------|' );
            console.log( 'PARSE-DATE-RANGE.OBJ >> ', obj );
            
            return { 
                field: 'created', 
                type: 'timestamp without time zone', 
                alias: 'range',
                value: moment(obj.startDate).format('YYYY-MM-DD') + ':' + moment(obj.endDate).format('YYYY-MM-DD') 
            };
        },
        
        /**
         * PARSE FILTER DATE-RANGE
         */
        parseDateRange: function( obj ){
            
            console.log( '|--------------------------------------|' );
            console.log( 'PARSE-DATE-RANGE.OBJ >> ', obj );
            
            var dateRange = obj.split(':');
            
            console.log( '|--------------------------------------|' );
            console.log( 'DATE-RANGE >> ', dateRange );
            
            return {
                startDate: moment(dateRange[0]),
                endDate: moment(dateRange[1])
            };
        },
		
        /**
         * ASSIGN DELIVERY DAYS
         */
        nextDeliveryDay: function(options){
            
            console.log( '|--------------------------------------|' );
            console.log( 'UTILS.NEXT-DELIVERY-DAY.OPTIONS >> ', options );
            
            var // child = {},
                dAvailable = [],
				dNextWeek = [],
                d = new Date(),
                dWeekDay = moment(d).weekday(),
                dDate = moment(d).format('YYYY-MM-DD HH:mm'),
                isTomorrow = moment(dDate).isAfter(moment('14:00', 'HH:mm'));
			
			// CHANGE THE WEEKDAY FOR WEEKENDS
			if( (dWeekDay === 5 && isTomorrow === true) || (dWeekDay === 0 || dWeekDay === 6 ) ){ 
				dWeekDay = 1; 
				isTomorrow = false; 
			}
			
			// AFTER 2PM TODAY
			isTomorrow === true ? dWeekDay = dWeekDay + 1 : null;
			
			console.log( '|--------------------------------------|' );
			console.log( 'DWEEKDAY >> ', dWeekDay );
			console.log( 'D-DATE >> ', dDate );
			console.log( 'IS-TOMORROW >> ', isTomorrow );
			
			var items = options,
				j = 0;
			
			// CLONE OPTIONS 
			angular.copy(items, dNextWeek);
			
			// SET NEXT WEEK
			for( var i = 0; i < dNextWeek.length; i++ ){
				
				var iDate, iiDate;
				
				// NO DELIVERIES ON WEEKENDS
				( i === 0 || i === 6 ) ? dNextWeek[i].deliver = false : null;
				
				// THIS IS A WEEK IN ADVANCE
				i === dWeekDay ? 
					iDate = moment(dDate).add(1, 'weeks').format('YYYY-MM-DD 08:00:00') : // today
					iDate = moment(dDate).add(1, 'weeks').add(j , 'days').format('YYYY-MM-DD 08:00:00'); // future
				
				// END DATE 2 WEEK IN ADVANCE
				i === dNextWeek.length ? 
					iiDate = moment(dDate).add(2, 'week').format('YYYY-MM-DD 16:00:00') : 
					iiDate = moment(dDate).add(2, 'week').add(j, 'days').format('YYYY-MM-DD 16:00:00');
				
				
				dNextWeek[i].date = { startDate: iDate, endDate: iiDate };
				items.push(dNextWeek[i]);
				
				j++;
			}
			
			// ARRAY NEXT WEEK
			console.log( '|--------------------------------------|' );
			console.log( 'ITEMS >> ', items );


			j = 0;
            for( i = dWeekDay; i < items.length; i++ ){
				
				// NO DELIVERIES ON WEEKENDS
				( i === 0 || i === 6 ) ? items[i].deliver = false : null;
				
                if( items[i].deliver === true ){
					
					var sDate, eDate;
                    
                    // TODAY OR FUTURE 
					i === dWeekDay ? 
                        sDate = moment(dDate).add(1, 'days').format('YYYY-MM-DD 08:00:00') : // today
                        sDate = moment(dDate).add(1, 'days').add(j, 'days').format('YYYY-MM-DD 08:00:00'); // future
                    
                    // SET END DATE TO REPRESENT THE LAST ITEM IN THE NEXT DELIVERY DAYS LIST
                    i === items.length ? 
                        eDate = moment(dDate).add(1, 'week').format('YYYY-MM-DD 16:00:00') : 
                        eDate = moment(dDate).add(1, 'week').add(j, 'days').format('YYYY-MM-DD 16:00:00');
                    
                    
                    console.log( '|--------------------------------------|' );
                    console.log( 'i, dWeekday >> ', i, dWeekDay );
                    console.log( 'i-DATE >> ', sDate, eDate );
                    
                    
                    items[i].date = { startDate: sDate, endDate: eDate };
					items[i].hours = { start: sDate, end: eDate };
					
                    dAvailable.push(items[i]);

                }
                
                j++;
            }
            
            console.log( '|--------------------------------------|' );
			console.log( 'dAVAILABLE WEEKDAY >> ', moment( dAvailable[0].date.startDate ).weekday() );
            console.log( 'UTILS.NEXT-DELIVERY-DAYS >> ', dAvailable );
			console.log( 'OPTIONS >> ', options );
            
            return dAvailable;
            
        },
		
        /**
         *
         */
        // DELIVERY DAYS DEFAULTS
        deliveryDay: function(){
            
            var dStart = moment(new Date()).format( 'YYYY-MM-DD 08:00:00' ), 
                dEnd = moment(new Date()).add(1, 'weeks').format( 'YYYY-MM-DD 16:00:00' ),
                dd = {
                input: 'json',
                alias: 'delivery_days',
                field: 'delivery_days',
                data_type: 'object',
                permissions: {},
                table: 'crm_establishment',
                view: null,
                required: true,
                visible: true,
                value: [
                    { deliver :false, hours: { start: dStart, end : dEnd }},
                    { deliver :true, hours: { start: dStart, end : dEnd }},
                    { deliver :true, hours: { start: dStart, end : dEnd }},
                    { deliver :true, hours: { start: dStart, end : dEnd }},
                    { deliver :true, hours: { start: dStart, end : dEnd }},
                    { deliver :true, hours: { start: dStart, end : dEnd }},
                    { deliver :false, hours: { start: dStart, end : dEnd }}
                ]
            };

            return dd;
            
        },
		
        /**
         * generic email regex pattern
         */
        validateEmail: function(str){
            var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            return emailPattern.test(str);
        },
		
        /**
         * generic north america phone regex pattern
         */
        validateNAPhone: function(str){
            var phonePattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            return phonePattern.test(str);
        },
		
        /**
         * generic united kingdom phone regex pattern
         */
        validateUKPhone: function(str){
            var phonePattern = /^\s*\(?(020[7,8]{1}\)?[ ]?[1-9]{1}[0-9{2}[ ]?[0-9]{4})|(0[1-8]{1}[0-9]{3}\)?[ ]?[1-9]{1}[0-9]{2}[ ]?[0-9]{3})\s*$/;
            return phonePattern.test(str);
        },
		
        /**
         * generic european phone regex pattern (france as default)
         */
        validateEUPhone: function(str){
            var phonePattern = /^(?:0|\(?\+33\)?\s?|0033\s?)[1-79](?:[\.\-\s]?\d\d){4}$/;
            return phonePattern.test(str);
        },
		
        /**
         * generic USA zipcode regex pattern
         */
        validateZipCode: function(str){
            var zipcodePattern = /(\d{5}([\-]\d{4})?)/;
            return zipcodePattern.test(str);
        },
		
        /**
         * generic Canadian postal code regex pattern
         */
        validateCDNPostalCode: function(str){
            var postalcodePattern = /[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]/;
            return postalcodePattern.test(str);
        },
		
        /**
         * generic united kingdom postal code regex pattern
         */
        validateUKPostalCode: function(str){
            var postalcodePattern = /[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]? [0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}/;
            return postalcodePattern.test(str);
        },
		
        /**
         * password regex pattern for required:
         * 1: 8 characters minimum
         * 2: lowercase characters
         * 3: UPPERCASE characters
         * 4: Special Characters
         * 5: Numeric characters
         */
        validatePassword: function(str){
            var passwordPattern = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
            return passwordPattern.test(str);
        },

        /**
         * test for string or number
         */
        isNumber: function(n) { 
            return /^-?[\d.]+(?:e-?\d+)?$/.test(n); 
        },
        
        isNull: function(val){
            return !val;
        },
        
        
		
		/**
		 * PAD A STRING WITH ZERO'S
		 *
		 ***********************************************
		 * VARYING INPUT
		 * padZerosToLength(1, 6, 0);       ===>  000001
		 * padZerosToLength(12, 6, 0);      ===>  000012
		 * padZerosToLength(123, 6, 0);     ===>  000123
		 * padZerosToLength(1234, 6, 0);    ===>  001234
		 * padZerosToLength(12345, 6, 0);   ===>  012345
		 * padZerosToLength(123456, 6, 0);  ===>  123456
		 ***********************************************
		 *  VARYING LENGTH
		 * padZerosToLength(1, 1, 0);  ===>  1
		 * padZerosToLength(1, 2, 0);  ===>  01
		 * padZerosToLength(1, 3, 0);  ===>  001
		 * padZerosToLength(1, 4, 0);  ===>  0001
		 * padZerosToLength(1, 5, 0);  ===>  00001
		 * padZerosToLength(1, 6, 0);  ===>  000001
		 ***********************************************
		 * VARYING PADDING CHARACTER
		 * padZerosToLength(1, 6, 0);         ===>  000001
		 * padZerosToLength(1, 6, 1);         ===>  111111
		 * padZerosToLength(1, 6, "x");       ===>  xxxxx1
		 * padZerosToLength(1, 6, ".");       ===>  .....1
		 * padZerosToLength(1, 6, " ");       ===>       1
		 * padZerosToLength(1, 6, "\u25CF");  ===>  ●●●●●1
		 *
		 */
		padZerosToLength: function(value, minLength, padChar) {
			
			var iValLength= value.toString().length;
			return ((new Array((minLength + 1) - iValLength).join(padChar)) + value);
		
		},
		 
        // GOOGLE API GEOLOCATION RESPONSE
        GetLocation: function( addressString ) {
            
            var deferred = $q.defer(), 
				google = $window.google, 
				geocoder = new google.maps.Geocoder(), 
                address = addressString, geoData = [];

            geocoder.geocode({ 'address': address }, function (results, status) {
				
				console.log( 'GEODATA RESULTS >> ', results );
				
				if( status === google.maps.GeocoderStatus.OK ){
					
					for(var i = 0; i < results.length; i++ ){
						
						console.log( '|-------------------------|' ); 
						console.log( 'GEO-SEARCH-RESULTS[' + i + '] >> ', results[i] );
						
						var components = results[i].address_components, 
							longitude = null, latitude = null, full_address = null, 
							street = '', city = null, state = null, zipcode = null;
						
						full_address = results[i].formatted_address;
						longitude = results[i].geometry.location.lng();
						latitude = results[i].geometry.location.lat();
						
						for( var a = 0; a < components.length; a++ ){
							var types = components[a].types;
							
							console.log( '|-------------------------|' ); 
							console.log( 'TYPES[' + a + '] >> ', types );
							
							for( var t = 0; t < types.length; t++ ){
								
								// STREET NUMBER
								if( types[t].indexOf('street_number') !== -1 ){
									
									console.log( 'STREET-NUMBER[' + a + '][' + t + ']', types[t] );
									console.log( 'LONG-NAME >> ', components[a].long_name );
                                    
                                    console.log( '|-------------------------|' ); 
                                    console.log( 'STREET >> ', components[a].long_name );
                                    
									street += components[a].long_name;
									
								}
								
								// STREET ROUTE
								if( types[t].indexOf('route') !== -1 ){
									
									console.log( 'STREET-ROUTE[' + a + '][' + t + ']', types[t] );
									console.log( 'LONG-NAME >> ', components[a].long_name );
                                    
                                    console.log( '|-------------------------|' ); 
                                    console.log( 'STREET >> ', components[a].long_name );
                                    
									street +=  ' ' + components[a].long_name;
									
								}
								
								// CITY
								if( types[t].indexOf('locality') !== -1 ){
									
									console.log( 'CITY[' + a + '][' + t + ']', types[t] );
									console.log( 'LONG-NAME >> ', components[a].long_name );
									city = components[a].long_name;
									
								}
								else{
									if( city === null && types[t].indexOf('administrative_area_level_3') !== -1 ){
										console.log( 'CITY[' + a + '][' + t + ']', types[t] );
										console.log( 'LONG-NAME >> ', components[a].long_name );
										city = components[a].long_name;
									}
									else{
										if( city === null && types[t].indexOf('administrative_area_level_2') !== -1 ){
											console.log( 'CITY[' + a + '][' + t + ']', types[t] );
											console.log( 'LONG-NAME >> ', components[a].long_name );
											city = components[a].long_name;
										}
									}
								}
								
								// PROVINCE
								if( types[t].indexOf('administrative_area_level_1') !== -1 ){
									
									console.log( 'STATE[' + a + '][' + t + ']', types[t] );
									console.log( 'LONG-NAME >> ', components[a].long_name );
									state = components[a].long_name;
									
								}
								
								// POSTAL CODE
								if( types[t].indexOf('postal_code') !== -1 ){
									
									console.log( 'POSTAL-CODE[' + a + '][' + t + ']', types[t] );
									console.log( 'LONG-NAME >> ', components[a].long_name );
									zipcode = components[a].long_name;
									
								}

							}
							
						}
						
						geoData.push({
							value: results[i].formatted_address,
							lat: results[i].geometry.location.lat(),
							lng: results[i].geometry.location.lng(),
							street: street,
							city: city,
							state: state,
							zipcode: zipcode
						});
						
						console.log( '|-------------------------|' ); 
						console.log( 'GEO-DATA >> ', geoData);

					}
					
					deferred.resolve(geoData);

				}
				else{
					deferred.reject(results);
				}

            });

            return deferred.promise;
        },
		
        /**
         * capitalise every word in a string
         * split on ' ' to handle special characters
         */
        stringCapitalise: function( str ){

            var self = this;

		/*
           var splitStr = str.toLowerCase().split(' ');
           for (var i = 0; i < splitStr.length; i++) {
               // You do not need to check if i is larger than splitStr length, as your for does that for you
               // Assign it back to the array
               splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
           }
           // Directly return the joined string
           return splitStr.join(' ');
		 */
            if(self.toType(str) !== 'undefined' ){
                
                var text = str.toLowerCase(), firstLtr = 0;

                for (var i = 0;i < text.length;i++){
                    if (i === 0 &&/[a-zA-Z]/.test(text.charAt(i))){ firstLtr = 2; }
                    if (firstLtr === 0 &&/[a-zA-Z]/.test(text.charAt(i))){ firstLtr = 2; }
                    if (firstLtr === 1 &&/[^a-zA-Z]/.test(text.charAt(i))){
                        if (text.charAt(i) === "'"){

                            if (i + 2 === text.length &&/[a-zA-Z]/.test(text.charAt(i + 1))) { 
                                firstLtr = 3; 
                            }
                            else if (i + 2 < text.length &&/[^a-zA-Z]/.test(text.charAt(i + 2))) { 
                                firstLtr = 3; 
                            }
                        }
                    }

                    if (firstLtr === 3){ firstLtr = 1; } 
                    else { firstLtr = 0; }

                    if (firstLtr === 2){
                        firstLtr = 1;
                        text = text.substr(0, i) + text.charAt(i).toUpperCase() + text.substr(i + 1);
                    }
                    else {
                        text = text.substr(0, i) + text.charAt(i).toLowerCase() + text.substr(i + 1);
                    }
                }

                return text;
                
            }
			
        },
		
        /**
         *  FORCE DYNAMIC (HYPEN-BASED) VARIABLES TO CAMEL-CASE
         */
        camelCase: function(input) { 
            return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
                return group1.toUpperCase();
            });
        },
		
        /**
         * growl utility to call a single function
         * rather than having to pull the growl service 
         * for every event
         *
         * expand this for the login and for the socket notifications
         */
        growlMessage: function( type, msg, int ){
            var notif = {
                'warning': function(){ return growl.warning(msg, {referenceId: int }); },
                'error': function(){ return growl.error(msg, {referenceId: int }); },
                'success': function(){ return growl.success(msg, { referenceId: int }); },
                'info': function(){ return growl.info(msg, { referenceId: int }); }
            };
            return notif[type]();
        },
		
        /**
         * ENCODE: BASE64 ENCODE FROM UTF-8
         * DECODE: UTF-8 DECODE FROM BASE64
         */
        stringEncode: function( str ){ var encodedString = window.btoa(encodeURI(str)); return encodedString; },
        stringDecode: function( str ){ var decodedString = decodeURI(window.atob(str)); return decodedString; },
		
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
         * NEEDLE IN A HAYSTACK
		 * @method utils.hayStack(myArray, needle); 
         */
        hayStack: function(needle) {
			var findNaN = needle !== needle;
			var indexOf;

			if(!findNaN && typeof Array.prototype.indexOf === 'function') {
				indexOf = Array.prototype.indexOf;
			} else {
				indexOf = function(needle) {
					var i = -1, index = -1;

					for(i = 0; i < this.length; i++) {
						var item = this[i];

						if((findNaN && item !== item) || item === needle) {
							index = i;
							break;
						}
					}

					return index;
				};
			}

			return indexOf.call(this, needle) > -1;
        },
		
        /**
         * COUNT JSON OBJECT KEY/VALUE PAIRS 
         */
        countJSON : function(obj) { 
            return Object.keys(obj).length; 
        },
		
        /**
         * Round up a number
         * determine number of decimal places
         */
        roundUp: function(num, dec){
            dec = dec || 0;
            num = num || 0;
            var result = Math.round( String(num) * 100 )/100;
            return Number( (result).toFixed(dec) );
        },

        parseAssetAuto   :   function (asset,$rootScope){
            var assetArray      =   [];

            $rootScope.profile[asset].map(function(value){
                console.log(value);
                assetArray.push({
                    label   :   value.value,
                    value   :   value
                });
            });

            return assetArray;
        },
        
        /*
        * Author : Kumar_Harsh and Added by Jehanzeb Naeem Khan
        * Date: 2017-10-02
        * Supplies the next column name for the xls sheets
        * This was taken from the internet. Use with caution :)
        * https://stackoverflow.com/questions/2256607/how-to-get-the-next-letter-of-the-alphabet-in-javascript
        * Didn't want to write this :)
        */
        /*
        getNextColumnName : function(key) {
            if (key === 'Z' || key === 'z') {
                return String.fromCharCode(key.charCodeAt() - 25) + String.fromCharCode(key.charCodeAt() - 25); // AA or aa
            } 
            else {
                var lastChar = key.slice(-1);
                var sub = key.slice(0, -1);
                if (lastChar === 'Z' || lastChar === 'z') {
                    // If a string of length > 1 ends in Z/z,
                    // increment the string (excluding the last Z/z) recursively,
                    // and append A/a (depending on casing) to it
                    return getNextColumnName(sub) + String.fromCharCode(lastChar.charCodeAt() - 25);
                }
                else {
                    // (take till last char) append with (increment last char)
                    return sub + String.fromCharCode(lastChar.charCodeAt() + 1);
                }
            }
            return key;
        }
        */
    };
});
