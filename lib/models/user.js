(function () {
  'use strict';

  angular.module('Models')

  .factory('User', ['wrapParse', '$window', '$rootScope',
    function (wrapParse, $window) {

      var User = wrapParse($window.Parse.User, {
        name: String,
        first_name: String,
        last_name: String,
        email: String,
        gender: String,
        location: Object,
        facebook_id: String,
        state: String,
        city: String
      });

      User.prototype.facebookPictureUrl = function () {
        return "https://graph.facebook.com/" + this.facebook_id + "/picture";
      };

      return User;
    }
  ]);
}());
