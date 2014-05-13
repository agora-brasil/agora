angular.module('Helpers')

.run(['$rootScope', '$window', '$location', function($rootScope, $window, $l) {
  $rootScope.user = $window.Parse.User.current();

  $rootScope.facebookLogin = function() {
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        $rootScope.user = $window.Parse.User.current();
      }
    });
  };
}])