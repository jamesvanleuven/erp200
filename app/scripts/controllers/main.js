'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AuthCtrl
 * @description
 * # AuthCtrl
 */
angular.module('clientApp').controller('AuthCtrl', [
    '$rootScope', 
    '$scope', 
    '$location', 
    '$window', 
    'growl', 
    'utils',
    'AuthenticationService', 
    'userService',
    function ($rootScope, $scope, $location, $window, growl, utils, AuthenticationService, userService) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
        
    if(!$window.sessionStorage.token){

        $scope.login = function(){
            
            var user = $scope.user;
            
            user.hash = utils.stringEncode(user.password);
            
            console.log( '|--------------------------------------|' );
            console.log( 'USER >> ', user );

            growl.warning('Checking Your Credentials', { referenceId: 1, ttl: 15000 });

            userService.loginUser(user).then(function(){
                
                !$rootScope.assets ? $rootScope.assets = [] : null;
                AuthenticationService.isLogged = true;

                growl.info('Loading Your Environment', {
                    referenceId: 1,
                    onopen: function(){ angular.element('#fmLogin').css('display', 'none'); }
                });
                
                growl.success('Logged In Successfully!', {
                    referenceId: 1,
                    onclose: function(){ $location.url('/dashboard'); }
                });
                
            },
            function(error){
                AuthenticationService.isLogged = false;
                var msg = 'Error: ' + error;
                utils.growlMessage('error', msg, 1);
            });

        }; 

    }
    else{
        $location.url('/dashboard');
    }

}]);