(function () {
  'use strict';

  angular.module('Controllers')

  .controller('TopicsNew', ['$scope', '$state', '$stateParams', 'Topic', 'User',
    function ($scope, $state, $stateParams, Topic, User) {
      $scope.topic = new Topic({
        community: $stateParams.id
      });

      $scope.create = function () {
        $scope.topic.save().then(function () {
          $state.go('communities_show', {
            id: $stateParams.id
          });
        });
      };
    }
  ]);
}());
