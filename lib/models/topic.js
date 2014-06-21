(function () {
  'use strict';

  angular.module('Models')

  .factory('Topic', ['wrapParse', 'Community', 'User',
    function (wrapParse, Community, User) {

      var Topic = wrapParse('Topic', {
        title: String,
        body: String,
        date: Date,
        community: Community,
        user: User,
        comments: Array
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

      Topic.prototype.beforeSave = function () {
        if (!this.id) {
          this.date = moment().toDate();
          this.user = User.current();
        }
      };

      return Topic;
    }
  ]);
}());
