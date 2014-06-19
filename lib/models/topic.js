(function () {
  'use strict';

  angular.module('Models')

  .factory('Topic', ['wrapParse', 'Community',
    function (wrapParse, Community) {

      var Topic = wrapParse('Topic', {
        title: String,
        body: String,
        date: Date,
        community: Community
      });

      Topic.byDate = function () {
        return Topic.query().ascending('date').find();
      };

      Topic.prototype.beforeSave = function () {
        this.date = moment().toDate();
      };

      return Topic;
    }
  ]);
}());
