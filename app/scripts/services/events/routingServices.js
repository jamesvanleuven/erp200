'use strict';

/**
 * @ngdoc service
 * @name clientApp.routificServices
 * @description
 * # wayBillService
 * Service in the clientApp.
 */

/* ================================================
    Service to Manage Routific Services
================================================ */

angular.module('clientApp.routingServices', []).service('routingService', [
    '$q',
    '$rootScope',
    '$route',
    '$compile',
    'utils',
    'channels',
    'moment',
    'modalService',
    'pdfService',
function ($q, $rootScope, $route, $compile, utils, channels, moment, modalService, pdfService) {

    return {
        
        config: function( $scope, $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisModal = thisModule.modal,
                thisMethod = thisModal.method,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type;
            
            console.log( '|-------------------------------------|' );
            console.log( 'ROUTING-SERVICE.CONFIG.THIS-MODULE >> ', thisModule );
            console.log( 'ROUTING-SERVICE.CONFIG.THIS-MODAL >> ', thisModal );
            console.log( 'ROUTING-SERVICE.CONFIG.METHOD >> ', thisMethod );
            console.log( 'ROUTING-SERVICE.CONFIG.MODULE-NAME >> ', moduleName );
            console.log( 'ROUTING-SERVICE.CONFIG.MODULE-TYPE >> ', moduleType );
        },
        
        routingOptions: function ($scope, $event) {
            var self = this;
            
            // REPLACE BATCH ITEMS ARRAY WITH REBUILT PDFITEMS OBJECT ARRAY
            $scope.batchItems = pdfService.parseAsset($scope);

            console.log('Batch Items', $scope.batchItems);

            // BUILD REQUESTED PDF BASED UPON $SCOPE.MODULE, $EVENT.ID, $EVENT.TYPE            
            var type = $event.currentTarget.dataset.viewpoint;
            
            console.log( '|-------------------------------------|' );
            console.log( 'EVENT >> ', $event );
            console.log( 'TYPE >> ', type );
            
            var document = {
                'view': function () { return self.viewRoutes($scope); },
                'send': function () { return self.sendRoutes($scope); }
            };

            return document[type]();
            

        },
        viewRoutes: function ($scope) {
            var self = this,
                routeData = [];

            self.parseData($scope.batchItems).then(function (route) {
                // console.log('Current Routes', route);
                //$scope.$parent.currentModule.modal.routifiic = route;

                var str = '<div data-ng-include="\'views/modules/_partials/_transactions/_routificTransactions.html\'"/>';

                //Open Modal
                $scope.$parent.currentModule.modal.html = str;
                $scope.$parent.currentModule.route = route;

                modalService.launchModal($scope);
                // LOAD THE STRING
                angular.element('#modalContainer').html($compile(str)($scope));

                //Send Routes to Session Storage

                //Send data to channels
                /*channels.transaction($route,$scope,'routific').then(function(result){
                    // console.log( 'routific result', result );
                    //Load Dashboard

                });
                */
            });
        },
        sendRoutes: function ($scope) {
            var self = this,
                routeData = [];

            // console.log('routific.sendRoutes.$scope', $scope);

            //Parse data 
            if (!$scope.routes) {
                self.parseData($scope.batchItems).then(function (route) {
                    // console.log('Current Routes', route);

                    //Send Routes to Session Storage

                    //Send data to channels
                    /*channels.transaction($route,$scope,'routific').then(function(result){
                        // console.log( 'routific result', result );
                        //Load Dashboard
                       
                    });
                    */
                });
            };


        },
        parseData: function (object) {
            var deferred = $q.defer(),
                data = {
                    name: 'Routing',
                    date: moment().format('YYYY-MM-DD'),
                    visits: {}
                };

            angular.forEach(object, function (item, key) {
                console.log('Routific Item',item);
                var stopName = item.customer.selected.value.toString().toLowerCase().replace(/\./g, ' ');
                var address = '';
                !utils.isNull(item.customer.selected.value) ?

                    (address += (item.customer.selected.address.street.value ? item.customer.selected.address.street.value : '' )+ ' , ',
                        address += (item.customer.selected.address.city.value ? item.customer.selected.address.city.value : '') + ' , ',
                        address += (item.customer.selected.address.state.value ? item.customer.selected.address.state.value : '') + ' , Canada',

                        data.visits[stopName] = {},

                        data.visits[stopName].name = stopName,

                        data.visits[stopName].location = {
                            name: stopName,
                            address: address
                        }
                    ) : null

            });

            data.fleet = {};

            //for(var i = 0;i <= 4;i++){
            data.fleet['vehicle_1'] = {
                'name': 'Driver 1',
                'start-location': {
                    'id': 'depot',
                    'address': '1575 vernon drive , vancouver'
                        //lat     :   49.270129,
                        //lng     :   -123.079361
                }
            };
            //}


            // console.log('Parsed', data);

            deferred.resolve(data);

            return deferred.promise;
        },


    };

}]);
