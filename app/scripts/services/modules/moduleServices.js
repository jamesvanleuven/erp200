'use strict';

/**
 * @ngdoc service
 * @name clientApp.moduleServices
 * @description
 * # moduleServices
 * Service in the clientApp.
 *
 *  DASHBOARD.SERVICE IS TEMP FOR NOW
 *  BECAUSE WE'RE NOT YET PULLING THE DASHBOARD
 *  FROM THE DATABASE.
 *  ANY AREA WHERE THE DASHBOARD IS LISTED IS A HACK
 *  BECAUSE IT'LL BE RENDERED BY THE API - THIS ALLOWS
 *  FOR US TO DEAL W/ A THIRD-PARTY SOFTWARE INCLUSION
 *  ON THE SERVER IF WE CHOOSE TO
 */

/* ================================================
    Service to Manage Modules
================================================ */

angular.module('clientApp.moduleServices', []).service('moduleService', [
    '$q', 
    '$rootScope',
    '$compile', 
    '$window',
    '$location',
    '$route',
    'AuthenticationService',
    'base64',
    'utils',
    'moment',
    'restAPI',
    'viewService',
    'reportService',
    'dashboardService', 
function($q, $rootScope, $compile, $window, $location, $route, AuthenticationService, base64, utils, moment, restAPI, viewService, reportService, dashboardService) {
    
    return {
		
        /**
         * PAGING OPTIONS
         */
        modulePagingOptions: function(thisModule){
            var pagingOptions = {
                limit: 25,
                offset: 0,
                totalRecords: 0,
                page: 1,
                options: [10, 25, 50, 100, 150, 200],
                range: {
                    lower: 0,
                    upper: 25,
                    total: 0
                }
            };

            return pagingOptions;
        },
        
        // DATE RANGE SELECTOR
        setDateRange: function( $scope ){
            
            var self = this, 
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toLowerCase(),
				moduleType = parseInt(thisModule.type);
            
            $scope.datePicker = {};

            $scope.singleDate = moment();
            $scope.opts = {
                locale: {
                    applyLabel: "Apply",
                    fromLabel: "From",
                    format: "YYYY-MM-DD",
                    toLabel: "To",
                    customRangeLabel: 'Custom range'
                },
                startDate: thisModule.report.range.startDate,
                endDate: thisModule.report.range.endDate,
                maxDate: moment(),
                dateLimit : {
                    "month": 1
                },
                autoApply: true,
                opens: "right",
                parentEl: "daterange",
                autoUpdateInput: true,
                ranges: {
                    "Today": [ 
                        moment(), 
                        moment()
                    ],
                    "Yesterday": [ 
                        moment().subtract(1, 'days'), 
                        moment()
                    ],
                    "Last 7 Days": [ 
                        moment().subtract(7, 'days'), 
                        moment()
                    ],
                    "Current Month": [ thisModule.report.range.startDate, moment() ],
                    "Previous Month": [ utils.getPreviousDateRange(1).startDate, utils.getPreviousDateRange(1).endDate ],
                    "2 Month\'s Ago": [ utils.getPreviousDateRange(2).startDate, utils.getPreviousDateRange(2).endDate ],
                    "3 Month\'s Ago": [ utils.getPreviousDateRange(3).startDate, utils.getPreviousDateRange(3).endDate ],
                },
                onSelect: function(str){
                    console.log( 'THIS >> ', str );
                }
            };
            
        },

        // RELOAD MODULE ON PAGINATION CHANGES
        newPagingOptions: function( limit, offset, pageNumber, thisModule, moduleName, $scope ){

            var self = this, 
                upper = parseInt(limit*pageNumber) || 1, 
                lower = parseInt(upper-limit+1) || 1, 
                pagingOptions = {
                    limit: limit || 25,
                    offset: lower || 0,
                    page: pageNumber || 1,
                    options: $scope.currentModule.paging.options,
                    totalRecords: $scope.currentModule.paging.totalRcords,
                    range: {
                        lower: lower || 1,
                        upper: upper || 1,
                        total: $scope.currentModule.paging.totalRecords
                    }
                };

            $scope.currentModule.paging = pagingOptions;
            $window.sessionStorage.paging = JSON.stringify( $scope.currentModule.paging );
        },

        /**
         * @menu
         */
        loadModule: function( $route, $scope ){

            if($window.sessionStorage.token){

                var self = this, 
                    path = $location.path().split('/'),
                    idx = $window.sessionStorage.idx,
                    acl = JSON.parse( utils.stringDecode($window.sessionStorage.acl) ), 
                    profile = JSON.parse($window.sessionStorage.profile),
                    credentials = JSON.parse($window.sessionStorage.credentials),
                    permissions = JSON.parse($window.sessionStorage.permissions),
                    locations = JSON.parse($window.sessionStorage.locations),
                    system = JSON.parse($window.sessionStorage.system),
                    sysArray = [], 
                    currentModule = {}, 
                    deferred = $q.defer(), 
                    i = 0;

                path.shift(); // first element is null

                !$rootScope.assets ? $rootScope.assets = [] : null;

                // CREATE SECONDARY NAVIGATION
                var system = JSON.parse($window.sessionStorage.system),
                    Application = system.Application.modules,
                    Users = system.Application.modules;

                angular.forEach(Application, function(item){ sysArray.push(item); });
                angular.forEach(Users, function(item){ sysArray.push(item); });

                $rootScope.locations = locations;
                $rootScope.modules = permissions[idx].modules;

                // PARSE SYSTEM MODULES
                for( i = 0; i < sysArray.length; i++ ){
                    if(sysArray[i].module.toLowerCase() === path[0]){
                        currentModule = { 
                            id: sysArray[i].module_id, 
                            name: sysArray[i].module, 
                            ico: sysArray[i].ico,
                            type: sysArray[i].type,
                            paging: {}
                        };
                        currentModule.permissions = sysArray[i].permissions;
                        currentModule.location = $rootScope.locations[idx];
                    }
                }

                // DEFINE CURRENT MODULE
                var modules = $rootScope.modules;
                for( i = 0; i < modules.length; i++ ){

                    if(modules[i].module.toLowerCase() === path[0]){

                        currentModule = { 
                            id: modules[i].module_id, 
                            name: modules[i].module, 
                            ico: modules[i].ico, 
                            type: modules[i].type,
                            paging: {},
                            hwh: false
                        };

                        currentModule.permissions = modules[i].permissions;
                        currentModule.location = $rootScope.locations[idx];
                        $scope.currentModule = currentModule;
                    }
                }

                deferred.resolve(currentModule);
                return deferred.promise;

            }
            else{
                base64.deleteJwtFromSessionStorage();
            }
        },

        /**
         * LOAD ASSETS FOR ACTIVE MODULE
         */
        activeModule: function( $route, $scope ){

            var self = this, 
                deferred = $q.defer(),
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type,
                idx = parseInt($window.sessionStorage.idx),
                pagingOptions = {},
                filterOptions = {},
                is_active = [{ id: Boolean(true), value: "True" }, { id: Boolean(false), value: "False" }];
            
            // FORCE THE FILTER-OPTIONS
            if(moduleType === 3){
                utils.toType(thisModule.report) !== 'undefined' ? filterOptions = thisModule.report : null;
                filterOptions.report.range = utils.parseDateObject( filterOptions.report.range );
            }

            // SET UP QUERY OPTIONS
            !$window.sessionStorage.paging ? 
                pagingOptions = this.modulePagingOptions(thisModule) :
                pagingOptions = JSON.parse( $window.sessionStorage.paging );

            thisModule.paging = pagingOptions;

            var moduleData = {
                module: 'view', 
                table: moduleName, 
                params: thisModule, 
                location: thisModule.location.id,
                establishment: parseInt($window.sessionStorage.establishment), 
                profile: JSON.parse($window.sessionStorage.profile),
                manufacturers: [],
                locations: [], 
                filters: filterOptions
            };

            var modalExists = angular.element('div.modal').length;

            if( modalExists === 1 ){
                angular.element( 'div.modal-dialog').show();
            }
            else{
                if( moduleName === 'dashboard' ){
                    dashboardService.config($scope).then(function(results){

                        var templates = [];

                        $scope.dashboard = results;
                        $window.sessionStorage.paging = JSON.stringify( pagingOptions );

                        templates['header'] = ''; templates['footer'] = '';
                        templates['body'] = dashboardService.templates();

                        deferred.resolve(templates);
                    }, function(error){

                        console.log( '|--------------------------------------|' );
                        console.log( 'ERROR >> ', error );
                    });
                }
                else{
                    restAPI.getModules.query(moduleData, function(results){
                        
                        console.log( '|--------------------------------------|' );
                        console.log( moduleName + ' RESULTS >> ', results );

                        var totalRecords = parseInt(results[0].rows[moduleName].totalRecords.count);
                        
                        console.log( 'TOTAL-RECORDS >> ', totalRecords );

                        totalRecords >= 0 ? 
                            $window.sessionStorage.totalRecords = totalRecords :
                            $window.sessionStorage.totalRecords = 0;
                        
                        moduleType === 3 ? 
                            $rootScope.assets[moduleName] = results[0].rows[moduleName].assets : 
                            $rootScope.assets[moduleName] = results[0].rows[moduleName].assets[moduleName];
                        
                        if( moduleType === 3 ){
                            // REBUILD FILTERS
                            var filters = results[0].filter, 
                                filterObject = {};

                            for(var i = 0; i < filters.length; i++ ){
                                var obj = JSON.parse( filters[i] );
                                filterObject[obj.alias] = obj;   
                            }
                            
                            thisModule.report = {};
                            thisModule.report = filterObject;
                            
                            var dateRange = utils.parseDateRange(filterObject.range.value);
                            thisModule.report.range = dateRange;
                            
                            $scope.filterItems = filterObject;
                            $window.sessionStorage.filterOptions = JSON.stringify(filterObject);
                            $window.sessionStorage.filters = JSON.stringify(filterObject);
                            
                            self.setDateRange( $scope );
                        }

                        $window.sessionStorage.paging = JSON.stringify( pagingOptions );
                        deferred.resolve( results[0].rows[moduleName] );

                    });
                }
            }

            return deferred.promise;
        },

        /*************************************
         * @switchLocation
         */
        switchLocation: function($scope){

            var self = this,
                deferred = $q.defer(), 
                currLocation = $scope.currentModule.location,
                locations = $rootScope.locations;

            angular.forEach(locations, function( row, key ){
                if( parseInt(row.id) === parseInt(currLocation.id) ){              
                    $window.sessionStorage.idx = key;
                    $window.sessionStorage.location = JSON.stringify(row);
                    deferred.resolve(true);
                }
            });

            return deferred.promise;

        }
        // @EoF
    };
}]);
// @EoF

