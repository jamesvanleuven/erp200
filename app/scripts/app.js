'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 * MODEL PUSH FOR ROOT WEBSITE CODE
 * 2017-09-05 - James Van Leuven - Direct Tap Logistics Ltd.
 */

angular
    .module('clientApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngCookies',
    'angular-growl',
    'angularMoment',
    'nvd3',
    'daterangepicker',
    'moment-picker',
    'mgcrea.ngStrap',
    'ngTagsInput',
    'angular-js-xlsx',
    /* END CUSTOM FUNCTIONS */
    'clientApp.apiServices',
    /* ACL COMPONENTS */
    'clientApp.authServices',
    'clientApp.base64Services',
    'clientApp.userServices',
    'clientApp.userAdminServices',
    /* TRANSACTIONS */
    'clientApp.resourceServices',
    'clientApp.transactionServices',
	/* REPORTS */
	'clientApp.reportServices',
    /* SERVICES */
    'clientApp.selectServices',
    'clientApp.errorServices',
    'clientApp.moduleServices',
    'clientApp.contentServices',
    'clientApp.domServices',
    'clientApp.viewServices',
    'clientApp.filterServices',
    'clientApp.tableServices',
    'clientApp.panelServices',
    'clientApp.eventServices',
    'clientApp.comparisonServices',
    // 'clientApp.paginationServices',
    'clientApp.modalServices',
    'clientApp.pdfServices',
    'clientApp.mathServices',
    'clientApp.routingServices',
    'clientApp.dashboardServices',
    'clientApp.addressServices',
    'clientApp.xlsServices',
    /* EVENT COMPONENTS */
    'clientApp.importServices',
    'clientApp.exportServices',
    'clientApp.editServices',
    'clientApp.csvServices'
])
.config(['growlProvider', '$httpProvider', '$locationProvider', '$routeProvider', function (growlProvider, $httpProvider, $locationProvider, $routeProvider) {

    // manage GROWL Notification Messages
    growlProvider.globalTimeToLive({
        success: 2000,
        error: 2000,
        warning: 3000,
        info: 5000
    })
    .globalInlineMessages(false)
    .globalPosition('top-right')
    .globalDisableIcons(false);

    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('authInterceptor');

    $locationProvider.html5Mode(true).hashPrefix('!');
    if (window.history && window.history.pushState) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');
    }
    
    // MOMENT PICKER PROVIDER
    /*
    momentPickerProvider.options({
        // Picker properties
        locale:        'en',
        format:        'LT',
        minView:       'hour',
        maxView:       'minute',
        startView:     'hour',
        autoclose:     true,
        today:         false,
        keyboard:      false,

        // Extra: Views properties
        leftArrow:     '&larr;',
        rightArrow:    '&rarr;',
        yearsFormat:   'YYYY',
        monthsFormat:  'MMM',
        daysFormat:    'D',
        hoursFormat:   'HH:[00]',
        minutesFormat: moment.localeData().longDateFormat('LT').replace(/[aA]/, ''),
        secondsFormat: 'ss',
        minutesStep:   5,
        secondsStep:   1
    });
    */

    /**
     * BEGIN ROUTES
     */
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'AuthCtrl',
            controllerAs: 'main',
            resolve: {
                app: function ($q, $timeout) {
                    var defer = $q.defer();
                    $timeout(function () {
                        defer.resolve();
                    });
                    return defer.promise;
                }
            },
            access: {
                requireLogin: false
            }
        })
        .when('/:module', {
            templateUrl: 'views/modules/index.html',
            controller: 'ModulesController',
            controllerAs: 'modules',
            resolve: {
                app: function ($q, $timeout) {
                    var defer = $q.defer();
                    $timeout(function () {
                        defer.resolve();
                    });
                    return defer.promise;
                }
            },
            access: {
                requireLogin: true
            }
        })
        .otherwise({
            redirectTo: '/'
        });
}])
    /**
     * Run block to kickstart the application
     * This is run after all the services have been configured
     * and the injector has been created.
     */
.run([
    '$rootScope',
    '$route',
    '$http',
    '$location',
    '$window',
    'utils',
    'AuthenticationService', 
function ($rootScope, $route, $http, $location, $window, utils, AuthenticationService) {

    // DISABLE BUTTON ON CLICK FOR ALL XHR CALLS
    $http.defaults.transformRequest.push(function (data) {
        $rootScope.disableButton = true;
        angular.element('.loading-spinner-holder').show();
        return data;
    });
    // ENABLE BUTTONS ON XHR COMPLETION
    $http.defaults.transformResponse.push(function (data) {
        $rootScope.disableButton = false;
        angular.element('.loading-spinner-holder').hide();
        return data;
    });

    $rootScope.$on('$routeChangeStart', function (event, nextRoute) {

        if ( nextRoute !== null &&
            nextRoute.access !== null &&
            // nextRoute.access.requiredLogin &&
            !AuthenticationService.isLogged &&
            !$window.sessionStorage.token) {

            $location.path('/');
        }
    });

}]);