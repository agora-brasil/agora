(function () {
  'use strict';

  angular.module('Controllers')

  .controller('HomeIndex', ['$scope', 'Topic', 'User', 'Community', function ($scope, Topic, User, Community) {
    Community.byName(function (communities) {
      $scope.communities = communities;
    });

    Topic.fromUser(User.current()).then(function (topics) {
      $scope.topics = topics;
    });
  }]);

}());
