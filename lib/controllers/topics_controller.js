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

  .factory('collapseBody', function () {
    return function () {
      setTimeout(function () {
        $('.comment-list li').each(function () {
          var self = $(this);
          if (self.height() > 70) {
            $('.btn-collapse', self).removeClass('hide').click(function () {
              var body = $('.body', self);

              var method, text;
              if(body.hasClass('collapsed')) {
                method = 'removeClass';
                text = 'Mostrar menos';
              }
              else {
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
  })

  .controller('TopicsShow', ['$scope', '$stateParams', 'Topic', 'User', 'collapseBody',
    function ($scope, $stateParams, Topic, User, collapseBody) {
      $scope.predicate = '-date';

      Topic.get($stateParams.topicId).then(function (topic) {
        $scope.topic = topic;
        $scope.topic.comments = $scope.topic.comments || [];

        collapseBody();
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
