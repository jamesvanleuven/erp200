'use strict';
/**
 * elements factory added to $scope
 * added on 2016-02-12 - James Mendham
 */
angular.module('clientApp').factory('elements',[
    '$q', 
    '$rootScope',
    '$location',
    '$window',
    '$compile',
    '$http',
    'moment',
    'utils',
    'addressService', 
function($q, $rootScope, $location, $window, $compile, $http, moment, utils, addressService){
	
	

	
    return {
		
		thisModule: function( $rootScope ){
			
			// console.log( 'THIS-MODULE.ROOTSCOPE >> ', $rootScope.$$childTail.currentModule );
			
			 var thisModule = $rootScope.$$childTail.currentModule, 
				 moduleName = thisModule.name.toLowerCase(),
				 moduleType = thisModule.type,
				 moduleElements = thisModule.elements,
				 moduleId = thisModule.id;
			
			var tm =  {
				root: thisModule,
				name: moduleName,
				type: moduleType,
				elements: moduleElements, 
				id: moduleId
			 };
			
			return tm;

		},
        
        // COMPILE HTML STRING > INSERT
        insertHTML: function(str, $scope){ angular.element('#insertModule').html($compile(str)($scope)); },
    
	
		elementVisible: function(key){
			var self = this, 
				isVisible = false;

			utils.toType(self.thisModule($rootScope).elements) !== 'undefined' ?
				self.thisModule($rootScope).elements[key].display === true ? 
					isVisible = true : 
					null : null;

			return isVisible;

		},

/**********************************************************
    BATCH ELEMENTS
**********************************************************/
		
		
        batchCheckbox: function( item ){
            var str = '';
			
            str += '<div class="checkbox">';
            str += '<label>';
            str += '<input type="checkbox"';
            switch(item){
                case 'th': 
                    str += ' class="column" data-ng-model="batchAll"';
                    str += ' data-ng-click="batch($event, null);"'; 
                break;
                case 'td': 
                    str += ' class="row" data-ng-model="batchItems" data-ng-checked="batchAll"';
                    str += ' data-ng-click="batch($event, $index);"'; break;
            }
            str += '/></label></div>';
            return str;
        },
		
		hideOverRide: function( $scope ){
			var self = this;
			
			console.log( 'hideOverRide.scope >> ', $scope );
			
			angular.element('#override').attr('disabled','disabled');
			self.thisModule($rootScope).elements.byPass.display = false;
		},
		
		showOverRide: function( $scope ){
			var self = this;
			
			console.log( 'showOverRide.scope >> ', $scope );
			
			angular.element('#override').removeAttr('disabled');
			
			( angular.element('#override').is(':visible') && self.thisModule($rootScope).elements.byPass.display !== true ) ? 
				self.thisModule($rootScope).elements.byPass.display = false : null;
			
		},

        hideButtons: function( $scope ){ 

			var self = this;
            angular.element( 'div.' + angular.lowercase(utils.stringCapitalise(self.thisModule($rootScope).name))).hide(); 
            $scope.batchItems = [];
			
        },
		
        showButtons: function(){ 
			
			var self = this;
            angular.element( 'div.' + angular.lowercase(utils.stringCapitalise(self.thisModule($rootScope).name))).show(); 
			
        },

/**********************************************************
    FILTER ELEMENTS
**********************************************************/
        
        
        reportFilter: function( row, key, $scope ){
            
            var self = this, str = '';
            
            console.log( '|------------------------------|' );
            console.log( 'SCOPE >> ', $scope );
            console.log( 'REPORT-FILTER >> ', key, row );
            
            if( utils.toType(row.permissions._get) !== 'undefined' ){
                
                if(row.permissions._get === true ){

                    switch(row.input){
                        case 'cs': 
                            
                            str += '<div custom-select="opt as opt.value for opt in';
                            str += ' asyncReportFilter($searchTerm, \'';
                            str += row.name + '\') track by $index"';
                            str += ' id="';
                            str += row.name;
                            str += '" name="';
                            str += row.name;
                            str += '" data-type="';
                            str += row.data_type;
                            str += '" data-ng-model="filterItems.';
                            str += key;
                            str += '" data-ng-model="filterItems.' + key;
                            str += '" custom-select-options="reportFilter';
                            str += utils.stringCapitalise(row.name.replace(/_/g, ' '));
                            
                            $rootScope.credentials.group_id === 2 && row.name === 'manufacturers' ? 
                                str += 'Options" style="width: 100%" disabled="disabled">' : 
                                str += 'Options" style="width: 100%;">';
                            
                            // var group = $rootScope.credentials.group_id;
                            
                            switch(row.name){
                                case 'products':
                                    
                                    str += '<div class="media"><div class="media-body">';
                                    str += '<h5 class="media-heading">';
                                    str += '{{ opt.selected.value }} - <small>{{ opt.sku }}</small></h5>';
                                    str += '<address><small>Volume: {{ opt.volume }}<br/>';
                                    str += 'Package Type: {{ opt.package_type.value }}<br/>';
                                    str += 'Product Type: {{ opt.product_type.value }}';
                                    if( $rootScope.credentials.group_id === 1 ){
                                        str += '<br/>Manufacturer: {{ opt.manufacturer.value }}';
                                        str += '<br/>Warehouse: {{ opt.location.value }}';
                                    }
                                    str += '<small></address><hr/>';
                                    
                                break;
                            }
                            
                            str += '</div></div></div>';
                            
                        break;
                        case 'select': 
                            
                            str += '<div custom-select="l as l.value for l in $root.profile.';
                            str += row.name + ' track by $index"'; 
                            str += ' data-ng-model="filterItems.' + key + '"';
                            str += ' custom-select-options="reportFilter' + key + 'Options"';
                            str += ' style="width: 100%;">';
                            str += '<div class="media"><div class="media-body">';
                            str += '<h5 class="media-heading text-capitalize">{{l.value}}</h5>';
                            str += '</div></div></div>';
                            
                        break;
                        case 'number': 
                            
                            str += '<input type="' + row.input + '"';
                            str += ' id="' + row.field + '" name="' + row.field + '"';
                            str += ' data-ng-blur=overRide(\'' + row.field + '\')';
                            str += ' class="filter-column form-control input-sm"';
                            str += ' data-type="' + row.data_type + '"';
                            ( self.thisModule( $rootScope ).elements[key].display === false) ?
                                str += ' readonly="readonly" onclick="return false;"' : null;
                            
                            str += ' data-ng-model="filterItems.' + key + '.value"';

                            self.thisModule( $rootScope ).elements[key].display === false ? 
                                str += ' readonly="readonly" onclick="return false;"' : 
                                null;

                            str += '/>';
                            
                        break;
                    }
                    
                }
            }
            
            return str;
            
        },
		
		// FILTER OVER-RIDE
		filterOverride: function(locations){
			var self = this, str = '';
			
			console.log( '|-------------------------------------|' );
			console.log( 'FILTER-OVER-RIDE.THIS-MODULE >> ', self.thisModule( $rootScope ).elements );
			
			self.thisModule( $rootScope ).elements.byPass = {
				items: [],
				display: false
			};
			
			for(var i = 0; i < locations.length; i++ ){
				self.thisModule( $rootScope ).elements.byPass.items.push(
					locations[i].id
				);
			}
			
			str += '<div class="checkbox clearfix" style="display:block;">';
			str += '<label><span style="float: right;"><small>';
			str += 'Check to return all warehouse results';
			str += '</small></span><span style="float: left;">';
			str += '<input id="override" type="checkbox"';
            str += ' data-ng-bind="currentModule.elements.byPass.display"';
            str += ' data-ng-model="currentModule.elements.byPass.display"';
			str += ' data-ng-true-value="true" data-ng-false="false"';
			str += ' data-ng-value="{{currentModule.elements.byPass.override}}"';
			str += ' disabled="disabled"';
			str += '/></span></label></div>';
			
			return str;
				
		},
		
        // BOOLEAN FILTER
        booleanFilter: function(row, key){
            var self = this, str = '';
			
			// console.log( '|-------------------------------------|' );
			// console.log( 'BOOLEAN-FILTER.ROW >> ', key, row );
			
            str += '<select id="' + row.field + '"';
			str += ' class="filter-column form-control input-sm"';
            str += ' id="' + row.field + '" name="' + row.field + '"';
			str += ' data-ng-change="overRide(\'' + row.field + '\')"'; 
			str += ' data-type="boolean"';
			str += ' data-ng-model="currentModule.elements.' + key + '.selected"';
			str += ' data-ng-options="item.value for item in $root.assets.';
			str += self.thisModule($rootScope).name + '.' + row.alias + ' track by item.id"';
			

            self.elementVisible(key) === false ? 
				str += ' readonly="readonly" onclick="return false;"' : null;

			
            str += '><option value=""></option><option value="True">True</option>';
            str += '<option value="False">False</option></select>';

            return str;
			
        },
		
        // INPUT FILTER
        inputFilter: function( row, key ){
			
            var self = this, 
				min = moment(new Date()).subtract(3, 'month'), 
				max = moment(new Date()).add(3, 'month'),
				str = '';
			
			console.log( '|---------------------------------------------|' );
			console.log( 'FILTER-SERVICE.$ROOTSCOPE >> ', $rootScope );
			console.log( 'CS-FILTER >> ', key, row );
			console.log( 'THIS-MODULE >> ', self.thisModule( $rootScope ) );
			
			
			switch(row.input){
					
				case 'datetime': 
					
					str += '<input date-range-picker type="text"';
					str += ' id="' + row.field + '" name="' + row.field + '"'; 
					str += ' data-ng-blur=overRide(\'' + row.field + '\')';
					str += ' class="filter-column form-control input-sm"';
					str += ' data-type="' + row.data_type + '"';

					str += ' options="{locale: { separator: \':\'}, singleDatePicker: false, autoUpdateInput: true}"';
					str += ' data-ng-model="' + key + '"';
					str += ' min="' + min + '" max="' + max + '"';

					self.thisModule( $rootScope ).elements[key].display === false ?
						str += ' readonly="readonly" onclick="return false;"' : null;
					
				break;
					
				case 'date': 
					
					str += '<input date-range-picker type="text"';
					str += ' id="' + row.field + '" name="' + row.field + '"';
					str += ' data-ng-blur=overRide(\'' + row.field + '\')';
					str += ' class="filter-column form-control input-sm"';
					str += ' data-type="' + row.data_type + '"';

					str += ' options="{locale: { separator: \':\'}, singleDatePicker: false, autoUpdateInput: true}"';
					str += ' data-ng-model="' + key + '"';
					str += ' data-ng-blur="overRide($event)"'; 
					str += ' min="' + min + '" max="' + max + '"';

					self.thisModule( $rootScope ).elements[key].display === false ?
						str += ' readonly="readonly" onclick="return false;"' : null;
					
				break;
					
				case 'number': 
					str += '<input type="' + row.input + '"';
					str += ' id="' + row.field + '" name="' + row.field + '"';
					str += ' data-ng-blur=overRide(\'' + row.field + '\')';
					str += ' class="filter-column form-control input-sm"';
					str += ' data-type="' + row.data_type + '"';
					( self.thisModule( $rootScope ).elements[key].display === false) ?
						str += ' readonly="readonly" onclick="return false;"' : null;
				break;
					
				default: 
					
					switch( self.thisModule( $rootScope).type ){
						case 1: 
							str += '<input type="' + row.input + '"';
							str += ' id="' + row.name + '" name="' + row.name + '"';
							str += ' data-ng-blur=overRide(\'' + row.name + '\')';
							str += ' class="filter-column form-control input-sm"';
							str += ' data-type="' + row.data_type + '"';
						break;
						case 2: 
							str += '<input type="' + row.input + '"';
							str += ' id="' + key + '" name="' + key + '"';
							str += ' data-ng-blur=overRide(\'' + key + '\')';
							str += ' class="filter-column form-control input-sm"';
							str += ' data-type="' + row.data_type + '"';
						break;
					}
			}
			
			str += ' data-ng-model="currentModule.elements.' + key + '.value"';
			
			self.thisModule( $rootScope ).elements[key].display === false ? 
				str += ' readonly="readonly" onclick="return false;"' : 
				null;

            str += '/>';
            return str;
			
        },
		
        // CUSTOM-SELECT TYPEAHEAD FILTER
        csFilter: function( row, key ){

            var self = this, str = '';
			
			str += '<div custom-select="m as m.value for m in asyncFilter($searchTerm, \'';
			str += row.name + '\') track by $index"'; 

			switch( self.thisModule( $rootScope ).type ){
				case 1: str += ' id="' + row.alias + '" name="' + row.alias + '" data-type="' + row.data_type + '"'; break;
				case 2: str += ' id="' + row.name + '" name="' + row.name + '" data-type="' + row.data_type + '"'; break;
			}
			
			str += ' data-ng-model="filterItems.' + row.alias + '"';
            
            str += ' custom-select-options="' + key + 'FilterOptions"';
            str += ' style="width: 100%;">';
			
			if( row.name === 'city' ){
				str += '<div class="media"><div class="media-body">';
				str += '<h5 class="media-heading text-capitalize">{{m.value}}</h5>';
			}
			else{
				str += '<div class="media"><div class="media-body">';
				str += '<h5 class="media-heading text-capitalize">{{m.schema.selected.value}} - ({{m.license_number}})</h5>';
				str += '<address><small>';
				str += '{{m.address.street.value}}, {{m.address.city.value}}<br>';
				str += '{{m.address.state.value}} {{m.address.zipcode}}';
				str += '</small></address><hr/>';
			}
			
			str += '</div></div></div>';
            
            return str;
			
        },
        
        // ACL REPORT SELECT FILTER
        /*
        aclLocations: function(){
            
            var // self = this,
                str = '';
            
			str += '<div custom-select="l as l.value for l in $root.profile.locations track by $index"'; 
			str += ' data-ng-model="currentModule.report.location"';
			str += ' custom-select-options="reportLocationFilterOptions"';
			str += ' style="width: 100%;">';
            str += '<div class="media"><div class="media-body">';
            str += '<h5 class="media-heading text-capitalize">{{l.value}}</h5>';
			str += '</div></div></div>';
            
            return str;
            
            
        },
        */
		
        // SELECT FILTER
        selectFilter: function(row, key){

            var self = this, 
				str = '';
			
			// console.log( '|---------------------------------------------|' );
			// console.log( 'FILTER-SERVICE.$ROOTSCOPE >> ', $rootScope );
			// console.log( 'SELECT-FILTER >> ', key, row );
			// console.log( 'THIS-MODULE >> ', self.thisModule( $rootScope ) );
			
			str += '<select id="' + row.field + '" name="' + row.field + '"';
			str += ' data-ng-change="overRide(\'' + key + '\')"'; 
			str += ' data-ng-model="currentModule.elements.' + key + '.selected"';
			str += ' data-ng-options="item.value for item in $root.assets.';
			str += self.thisModule( $rootScope ).name + '.' + row.alias + ' track by item.id"';
            str += ' class="filter-column form-control input-sm"';
			str += ' data-type="' + row.data_type + '"';

            self.elementVisible(key) === false ? 
				str += ' readonly="readonly" onclick="return false;"' : null;
			
            str += '></select>';
			
            return str;
			
        },
        
        checkboxFilter: function(row, key){
            var str = ''; 
			
			str += '<div class="checkbox"><label><input type="checkbox"';
            str += ' data-ng-bind="currentModule.elements.' + key + '.display"';
            str += ' data-ng-model="currentModule.elements.' + key + '.display"';
			str += ' data-ng-true-value="true" data-ng-false="false"';
            str += ' data-ng-change="column(\'' + row.field + '\')"';
			str += ' data-ng-value="{{currentModule.elements.' + key + '.display}}"';
            str += '/></label></div>';
			
            return str;
			
        },
		
/**********************************************************
    IMPORT ELEMENTS
**********************************************************/
        //IMPORT MODULE ROWS FORMFIELD ELEMENTS
        importElement: function(item, label){
            //// console.log( item, label );
            var str = '<input type="text" name="' + label;
            str += '" class="form-control input-sm"';
            str += ' value="' + item + '"/>';
            return str;
        },
        
        // IMPORT RADIO OPTIONS
        importSelector: function($scope){
            console.log($scope);
            
            var str = '';
            str += '<select data-ng-model="moduleOptions" id="moduleSelector"';
            str += ' class="form-control input-sm" data-ng-options="';
            str += 'item as item.value for item in moduleOptions track by item.id" style="width: 150px;">';
            str += '<option value="" selected="selected"> -- Export Type -- </option></select>&nbsp;';
            return str;
        },

        // IMPORT COLUMNS
        importColumns: function( $scope ){
            var self = this, 
				columns = $scope[self.thisModule( $rootScope ).name][0],
                str = '', 
				address = {};
            
            // console.log('This Module',thisModule);
            //Add Address hack for exporting addresses
            if(self.thisModule($rootScope).root.modal.method === 'export' && self.thisModule($rootScope).id === 4){
                address = addressService.getAddress(columns.customer.selected.id,'customers');            
                columns.customer_address   =   {};
                columns.customer_address.id   =   columns.customer.selected.id;
                columns.customer_address.value = address.street.value+' , '+address.city.value+' , '+address.state.value;   
            }

            angular.forEach(columns, function(item, key){
                if(key !== 'totalRecords' || key !== '$$hashKey'){

                    str += '<div class="col-sm-4 container-fluid">';
                    str += '<div class="row rounded-border clearfix">';
                    str += '<div class="checkbox-inline"><label>';
                    str += '<input type="checkbox" name="' + self.thisModule( $rootScope ).name + '[]"';
                    str += ' value="' + key + '" checked="checked"/>';
                    str += utils.stringCapitalise(key.replace(/_/g, ' '));
                    str += '</label></div>';
                    str += '</div></div>';
                }
            });

            return str;
            
        
        },
        
/**********************************************************
    MISCELLANEOUS ELEMENTS
    *** THIS NEEDS TO BE REFACTORED ***
**********************************************************/
        //Bootstrap Column
		
		/*
        column      :   function(body,colNum){
            var str =   '';
            
            str     +=   '<div class="col-md-'+colNum+'">';
            str     +=      body;
            str     +=   '</div>';
            
            return str;
			
        },
		*/
		
        // PANEL SERVICE LABEL
        panelLabel: function(row, key){
            var str = '<small><strong>';
            str += utils.stringCapitalise(key.replace(/_/g, ' ')); 
            str += ':</strong></small> ';
            return str;
        },
		
        // TABLE SERVICE LABEL
        rowLabel: function(row, key){
			
			// console.log( '|-------------------------------------|' );
			// console.log( 'ROW-LABEL >> ', key, row );
            
            var str = '';
            
            utils.toType(row.alias) !== 'null' ?
                str += '<small>' + utils.stringCapitalise(row.alias.replace(/_/g, ' ')) + '</small>' : 
                str += '<small>' + utils.stringCapitalise(key.replace(/_/g, ' ')) + '</small>';

            return str;

        },
		
        //ELEMENT CONTAINER FOR INLINE EDIT FIELDS
        rowItem: function(row, key){
            var str = '<span style="font-size: 90%;" class="element';
            
            if(row.input){
				
                switch(row.input){
						
					// SELECT INPUT
                    case 'select': 
						
						if( key === 'status' ){
							str += '" data-ng-class="item.' + key + '.selected.value">';
							str += '<strong>{{ item.' + key + '.selected.value | uppercase }}</strong>';
						}
						else{
							str += ' data-ng-class="' + key + '">';
							str += '{{ item.' + key + '.selected.value }}';
						}
						
                    break;
						
					// CUSTOM-SELECT INPUT
					case 'cs':
						
                        str += '" data-ng-class="' + key + '">';
                        str += '{{ item.' + key + '.selected.value }}';

					break;
						
					// DATE INPUT
                    case 'date': 
						
						key.indexOf('created') !== -1 ?
							str += '"><small>{{ item.' + key + '.value | date:\'MM/dd/yyyy h:mm a\' }}</small>' : 
							str += '"><small>{{ item.' + key + '.value | date: \'EEE, MMM dd\' }}</small>';
						
                    break;
					// DATETIME INPUT
                    case 'datetime': 
						
						key.indexOf('create') !== -1 ?
							str += '"><small>{{ item.' + key + '.value | date:\'MM/dd/yyyy h:mm:ss a\' }}</small>' : 
							str += '"><small>{{ item.' + key + '.value | date: \'EEE, MMM dd\' }}</small>';
						
                    break;
						
					// BOOLEAN
                    case 'boolean': 

                        str += ' is{{item.' + key + '.value}}"><span class="is-' + key + '">';
						str += '<strong>' + key + '</strong>';
						str += '</span>';
						
                    break;
						
					// NUMBER
					case 'number': 
						
						/**
						 * NOT YET IMPLEMENTED
						 * convert display based upon data type
						 * within the object definition
						 *
						 
						switch(input.data_type){
							case 'bigint' : break;
							case 'integer': break;
							case 'money': break;
							case 'float': break;
						}
						
						*/
						
						str += '" data-ng-bind="item.' + key + '.value">{{ item.' + key + '.value }}'; 
					break;
						
					// ALL REMAINING INPUTS
                    default: 
						str += '">{{ item.' + key + '.value }}';
                }
            }
            str += '</span>';

            return str;
        },
		
    };
    
}]);