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
        user: User
      });

      Topic.byDate = function (communityId) {
        return Topic.query()
          .include('user')
          .ascending('date')
          .equalTo('community', new Community({
            id: communityId
          }))
          .find();
      };

      Topic.prototype.beforeSave = function () {
        this.date = moment().toDate();
        this.user = User.current();
      };

      return Topic;
    }
  ]);
}());
