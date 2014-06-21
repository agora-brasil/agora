(function () {
  'use strict';

  angular.module('Controllers')

  .controller('TopicsNew', ['$scope', '$state', '$stateParams', 'Topic',
    function ($scope, $state, $stateParams, Topic) {
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
  ])

  .controller('TopicsShow', ['$scope', '$state', '$stateParams', 'Topic', 'User',
    function ($scope, $state, $stateParams, Topic, User) {
      Topic.get($stateParams.topicId).then(function (topic) {
        $scope.topic = topic;
        $scope.topic.comments = $scope.topic.comments || [];
      });

      var user = User.current();
      $scope.newComment = {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          facebookPictureUrl: user.facebookPictureUrl()
        }
      };
      var newCommentClone = _.clone($scope.newComment);

      $scope.comment = function () {
        $scope.newComment.date = moment().toDate();
        $scope.topic.comments.push($scope.newComment);

        $scope.newComment = newCommentClone;

        $scope.topic.save();
      };
    }
  ]);
}());
