'use strict';

/**
 * @ngdoc service
 * @name clientApp.menuService
 * @description
 * # menuService
 * Service in the clientApp
 */

angular.module('clientApp.filterServices', [])
.service('filterService', function ($q, $rootScope, $window, $route, utils, elements, buttons) {

    return {

        // SEARCH ORDERING
        orderBy: function (key, count) {
            var str = '<option value="0" data-id="' + key + '"> -- </option>';
            for (var i = 1; i < count + 1; i++) {
                str += '<option value="' + i + '" data-id="' + key + '">' + i + '</option>';
            }
            return str;
        },

        // SEARCH OPERATORS
        whereBy: function (item, key) {
            var options = ['EQUALS'],
                str = '';

            $rootScope.credentials.role_id === 1 ? 
                options = ['IS LIKE', 'EQUALS', 'NOT EQUALS', 'GREATER THAN', 'LESS THAN'] : null;

            if (item.input === 'select' || item.input === 'boolean') {
                str += '<option value="EQUALS" data-id="' + key + '">EQUALS</option>';
            } else {
                for (var i = 0; i < options.length; i++) {
                    str += '<option value="' + options[i] + '" data-id="' + key + '"> ' + options[i] + ' </option>';
                }
            }

            return str;
        },

        // SEARCH FUNCTION
        buildFilters: function ( $scope ) {

            console.log( '|---------------------------------------------|' );
            console.log( 'FILTER-SERVICE.$ROOTSCOPE >> ', $rootScope );
            console.log( 'FILTER-SERVICE.$SCOPE', $scope );

            var self = this,
                deferred = $q.defer(),
                parsed = {},
                sstr = 'id',
                thisModule = elements.thisModule( $rootScope ).root,
                moduleName = elements.thisModule( $rootScope ).name,
                moduleType = elements.thisModule( $rootScope ).type,
                moduleData = $scope[moduleName][0],
                filterData = $window.sessionStorage.filters,
                credentials = $rootScope.credentials,
                permissions = thisModule.permissions,
                columns = [],
                elValue = true,
                parsed = {},
                strFilter = '';
            
            console.log( '|---------------------------------------------|' );
            console.log( 'MODULE-NAME >> ', moduleName );
            console.log( 'MODJULE-TYPE >> ', moduleType );

            utils.toType(filterData) !== 'undefined' ? delete $window.sessionStorage.filters : null;

            // SEARCH ELEMENTS    
            if(!thisModule.elements) {
                thisModule.elements = {};
                angular.forEach(moduleData, function (item, key) {

                    if (utils.toType(item) === 'object') {
                        if (item.input) {

                            if(item.input === 'boolean' ){
                                if( !$rootScope.assets[moduleName][key]){
                                    $rootScope.assets[moduleName][key] = $scope.bolSwitch;
                                }
                                else{
                                    $rootScope.assets[moduleName][key] = $scope.bolSwitch;
                                }
                            }		

                            columns.push(key);
                            thisModule.elements[key] = {
                                input: item.input,
                                data: item.data_type, 
                                display: item.visible,
                                alias: item.alias,
                                field: item.field,
                                name: item.name,
                                view: item.view,
                                get: item._get
                            };
                        }
                    }
                });
            }
            else{
                angular.forEach(moduleData, function (item, key) {

                    if(utils.toType(item) === 'object' ){
                        if( utils.toType(item.input) === 'string' ){
                            columns.push(key);
                        }

                        if(item.input === 'boolean' ){
                            $rootScope.assets[moduleName][key] = $scope.bolSwitch;
                        }
                    }

                });
            }
            
            console.log( '|---------------------------------------------|' );
            console.log( 'MODULE-DATA >> ', moduleData );

            // SEARCH FILTERS
            angular.forEach(moduleData, function (item, key) {
                var thisKey = null;

                console.log( '|---------------------------------------------|');
                console.log( key, item );
                
                if( item.visible === true && item.permissions._get === true ){
                    
                    strFilter += '<tr><td>' + elements.checkboxFilter(item, key) + '</td>';
                    utils.toType(item.alias) === 'string' ? thisKey = item.alias : thisKey = key;
                    
                    strFilter += '<td nowrap="nowrap"><small>';
                    strFilter += utils.stringCapitalise(thisKey.replace(/_/g, ' '));
                    strFilter += '</small></td><td>';
                    
                    if( moduleType === 3 ){
                        
                        console.log( '|----------------------------------------|' );
                        console.log( 'REPORT[' + key + '] >> ', item );

                        strFilter += elements.reportFilter( item, key, $scope );
                        
                    }
                    else{
                        
                        switch(item.input){
                            case 'datetime': 
                                $scope[key] = { min: null, max: null }; 
                                strFilter += elements.inputFilter(item, key);
                            break;
                            case 'select': 
                                strFilter += elements.selectFilter( item, key ); 
                            break;
                            case 'boolean': strFilter += elements.booleanFilter(item, key); break;
                            case 'cs': strFilter += elements.csFilter( item, key ); break;
                            default: strFilter += elements.inputFilter(item, key);
                        }
                        
                    }
                    
                }
            });

            // over-ride
            if( elements.thisModule($rootScope).type === 2 && credentials.group_id === 1 ){

                var locations = $rootScope.profile.locations;

                strFilter += '<tr><td colspan="3">';
                strFilter += elements.filterOverride(locations);
                strFilter += '</td></tr>';	

            }

            // SEARCH PANEL HEADER
            var strHeader = '';
            strHeader += '<div class="panel panel-default">';
            strHeader += '<div class="panel-heading">';
            strHeader += '<h3 class="panel-title">Advanced Search</h3></div>';
            // SEARCH PANEL BODY
            var strBody = '<div class="panel-body"><form name="search-filter">';
            strBody += '<table class="table table-condensed"><thead>';
            strBody += '<th style="text-align: left;"><small>Show</small></th>';
            strBody += '<th style="text-align: left;"><small>Column</small></th>';
            strBody += '<th style="text-align: left;"><small>Value</small></th>';
            strBody += '</thead><tbody>';
            strBody += strFilter;
            strBody += '</tbody></table></form></div>';
            // SEARCH PANEL FOOTER
            var strFooter = '<div class="panel-footer"><div class="text-center">';
            strFooter += '<div class="btn-group" role="group">';
            strFooter += buttons.filterClose();
            strFooter += buttons.filterReset();
            // strFooter += buttons.filterClear();
            strFooter += buttons.filterSearch( $scope );
            strFooter += '</div></div>';
            strFooter += '</div>';
            // PROMISE 
            parsed['header'] = strHeader;
            parsed['body'] = strBody;
            parsed['footer'] = strFooter;

            deferred.resolve(parsed);

            // STUPID HACK
            var appModules = $rootScope.modules;
            // console.log( '|---------------------------------------------|');
            // console.log( 'APP-MODULE >> ', appModules );

            for( var m = 0; m < appModules.length; m++ ){
                if( appModules[m].module.toLowerCase() === moduleName ){
                    // console.log( '|---------------------------------------------|');
                    // console.log( 'APP-MODULES >> ', appModules[m] );
                    thisModule.type = appModules[m].type;
                }
            }

            // console.log( '|---------------------------------------------|');
            // console.log( 'deferred.resolve(parsed)', parsed );
            return deferred.promise;
        }

    };

});