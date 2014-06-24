(function () {
  'use strict';

  angular.module('Controllers')

  .controller('HomeIndex', ['$scope', 'Topic', 'User',
    function ($scope, Topic, User) {
      Topic.fromUser(User.current()).then(function (topics) {
        $scope.topics = topics;
      });
    }
  ]);

}());
