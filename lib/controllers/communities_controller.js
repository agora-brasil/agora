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

  .controller('CommunitiesShow', ['$scope', 'Community', 'Topic', '$stateParams',
    function ($scope, Community, Topic, $stateParams) {
      Community.get($stateParams.id, function (community) {
        $scope.community = community;
      });

      Topic.byDate($stateParams.id).then(function (topics) {
        $scope.topics = topics;
      });
    }
  ]);
}());
