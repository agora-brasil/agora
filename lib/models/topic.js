(function () {
  'use strict';

  angular.module('Models')

  .constant('topicLifeCycle', {
    discussion: 1,
    proposal: 2,
    decision: 3,
    approved: 4,
    not_approved: 5
  })

  .factory('Topic', ['wrapParse', 'Community', 'User', 'topicLifeCycle', function (wrapParse, Community, User, Steps) {
      var PROPOSAL_GROUP = 'proposal_group';
      
      
      var Topic = wrapParse('Topic', {
        title: String,
        body: String,
        date: Date,
        community: Community,
        user: User,
        comments: Array,
        current_step: {type: Number, default: Steps.discussion}
      });

      Topic.byDate = function (communityId) {
        return Topic.query()
          .include('user')
          .descending('date')
          .equalTo('community', new Community({
            id: communityId
          }))
          .find();
      };

      Topic.fromUser = function (user) {
        return Topic.query()
          .equalTo('user', user)
          .include('community')
          .descending('date')
          .limit(3)
          .find();
      };

      Topic.prototype.beforeSave = function () {
        if (!this.id) {
          this.date = moment().toDate();
          this.user = User.current();
        }
      };

      Topic.prototype.classForStep = function (step) {
        var self = this;
        if (step < self.current_step) {
          return {done: true};
        } else if (step > self.current_step) {
          return {todo: true};
        }
      };

      Topic.prototype.proposalResult = function () {
        var self = this;
        var isProposalDecisionMade = self.current_step > Steps.decision;

        if (isProposalDecisionMade) {
          return Steps[self.current_step];
        } else {
          return 'Aprovada/Rejeitada';
        }
      };

      Topic.prototype.addCurrentUserToProposalGroup = function () {
        this.relation(PROPOSAL_GROUP).add(User.current());
        this.save();
      };

      Topic.prototype.getProposalGroup = function (callback) {
        this.relation(PROPOSAL_GROUP)
            .query()
            .ascending('name')
            .find().then(callback);
      };

      Topic.newCommentSkeleton = function () {
        var user = User.current();
        return {
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            facebookPictureUrl: user.facebookPictureUrl()
          }
        };
      };

      return Topic;
    }
  ]);
}());
