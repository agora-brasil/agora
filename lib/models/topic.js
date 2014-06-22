(function () {
  'use strict';

  angular.module('Models')

  .factory('Topic', ['wrapParse', 'Community', 'User',
    function (wrapParse, Community, User) {
      var STEPS = {
        discussion: 1,
        proposal: 2,
        decision: 3,
        approved: 4,
        not_approved: 5
      };

      var Topic = wrapParse('Topic', {
        title: String,
        body: String,
        date: Date,
        community: Community,
        user: User,
        comments: Array,
        current_step: {type: Number, default: STEPS.discussion}
      });

      Topic.STEPS = STEPS;

      Topic.byDate = function (communityId) {
        return Topic.query()
          .include('user')
          .descending('date')
          .equalTo('community', new Community({
            id: communityId
          }))
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
        var decisionMade = self.current_step > Topic.STEPS.decision;

        if (decisionMade) {
          return Topic.STEPS[self.current_step];
        } else {
          return 'Proposta aprovada/reprovada';
        }
      };

      return Topic;
    }
  ]);
}());
