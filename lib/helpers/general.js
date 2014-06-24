(function (global) {

  'use strict';

  angular.module('Helpers')

  .filter('formatDate', function () {
    return function (date) {
      if (!date) {
        return;
      }

      if (moment().diff(moment(date), 'days') >= 7) {
        return moment(date).format('DD/MM/YYYY [às] HH:mm');
      }
      return moment(date).fromNow();
    };
  })

  .filter('formatBody', function () {
    return function (body) {
      if (!body) {
        return;
      }
      return body.replace(/\n/g, "<br>");
    };
  })

  .factory('assignVars', ['$rootScope', 'User',
    function ($rootScope, User) {
      return function () {
        $rootScope.user = User.current();
      };
    }
  ])

  .run(['assignVars',
    function (assignVars) {
      assignVars();
    }
  ])

  .run(['$rootScope', '$window',
    function ($rootScope, $window) {
      $rootScope.facebookLogin = function () {
        global.Parse.FacebookUtils.logIn('public_profile,email,user_location', {
          success: function (user) {
            if (!user.existed()) {
              $window.FB.api('/me', function (fbUserInfo) {
                var userData = _(fbUserInfo).chain()
                  .omit('id')
                  .extend({
                    facebook_id: fbUserInfo.id,
                    username: fbUserInfo.email
                  })
                  .value();

                user.save(userData).then(function (user) {
                  $rootScope.user = user;
                });
              });
            } else {
              $rootScope.user = user;
            }
          }
        });
      };
    }
  ]);
}(window));
