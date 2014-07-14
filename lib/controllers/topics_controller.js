(function () {
  'use strict';

  angular.module('Controllers')

  .controller('TopicsNew', ['$scope', '$state', '$stateParams', 'Topic',
    function ($scope, $state, $stateParams, Topic) {
      $scope.communityId = $stateParams.id;

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

  .controller('TopicsShow', ['$scope', '$stateParams', 'Topic', 'User', 'collapseBody',
    function ($scope, $stateParams, Topic, User, collapseBody) {
      Topic.get($stateParams.topicId).then(function (topic) {
        topic.getProposalGroup(function (users) {
          $scope.proposalGroup = users;
          $scope.proposalGroup.containsCurrentUser = function () {
            var currentUserId = User.current().id;
            return _.find(this, function (user) {
              return user.id === currentUserId;
            });
          };
        });

        $scope.topic = topic;
        $scope.topic.comments = $scope.topic.comments || [];

        collapseBody();
      });


      var newComment = Topic.newCommentSkeleton();
      $scope.newComment = _.clone(newComment);

      $scope.comment = function () {
        $scope.newComment.date = moment().toDate();
        $scope.topic.comments.push($scope.newComment);
        collapseBody();

        $scope.newComment = _.clone(newComment);

        $scope.topic.save();
      };
    }
  ])

  .factory('collapseBody', function () {
    return function () {
      setTimeout(function () {
        $('.comment-list li').each(function () {
          var self = $(this);
          if (self.height() > 70) {
            $('.btn-collapse', self).removeClass('hide').unbind('click').bind('click', function () {
              var body = $('.body', self);

              var method, text;
              if (body.hasClass('collapsed')) {
                method = 'removeClass';
                text = 'Mostrar menos';
              } else {
                method = 'addClass';
                text = 'Mostrar mais';
              }

              body[method]('collapsed');
              $(this).html(text);
            });
          }
        });
      }, 0);
    };
  });
}());
