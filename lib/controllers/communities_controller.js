(function () {
  'use strict';

  angular.module('Controllers')

  .controller('CommunitiesIndex', ['$scope', 'Community',
    function ($scope, Community) {
      Community.byName(function (communities) {
        $scope.communities = communities;
      });
    }
  ])

  .controller('CommunitiesShow', ['$scope', 'Community', 'Topic', '$stateParams', 'topicLifeCycle',
    function ($scope, Community, Topic, $stateParams, Steps) {
      $scope.Steps = Steps;

      Community.get($stateParams.id).then(function (community) {
        $scope.community = community;
      });

      Topic.byDate($stateParams.id).then(function (topics) {
        $scope.topics = topics;
      });
    }
  ]);
}());
