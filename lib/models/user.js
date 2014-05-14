(function() {
  'use strict';

  angular.module('Models')

  .factory('User', ['wrapParse', '$window', function (wrapParse, $window) {

    var User = wrapParse($window.Parse.User, {
      facebook_id: String
    });

    User.prototype.facebookPictureUrl = function () {
      return "https://graph.facebook.com/" + this.facebook_id + "/picture";
    };

    return User;
  }]);
}());
