(function () {
  'use strict';

  angular.module('Models')

  .factory('Topic', ['wrapParse', 'Community',
    function (wrapParse, Community) {

      var Topic = wrapParse('Topic', {
        title: String,
        description: String,
        community: Community
      });

      return Topic;
    }
  ]);
}());
