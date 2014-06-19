(function () {
  'use strict';

  angular.module('Controllers')

  .controller('TopicsNew', ['$scope', 'Topic', '$stateParams', '$state',
    function ($scope, Topic, $stateParams, $state) {
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
