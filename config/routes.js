(function () {
  'use strict';

  angular.module('Routes')

  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise("/");

      $stateProvider
      .state('root', {url: "/", templateUrl: 'home/index.tmpl.html'})

      // User
      .state('user_edit', {url: '/user/edit', controller: 'UserEdit', templateUrl: 'user/edit.tmpl.html'})

      // Communities
      .state('communities_index', {url: '/communities', controller: 'CommunitiesIndex', templateUrl: 'communities/index.tmpl.html'})
      .state('communities_show', {url: '/communities/:id', controller: 'CommunitiesShow', templateUrl: 'communities/show.tmpl.html'})

      // Topics
      .state('communities_topics_new', {url: '/communities/:id/topics/new', controller: 'TopicsNew', templateUrl: 'topics/new.tmpl.html'})
      .state('communities_topics_show', {url: '/communities/:id/topics/:topicId', controller: 'TopicsShow', templateUrl: 'topics/show.tmpl.html'})


      .state('logout', {
        url: "/logout",
        controller: function (User, $state, $rootScope) {
          User.logOut();
          $rootScope.user = undefined;
          $state.go('root');
        }
      });
    }
  ]).run(['$state', _.noop]); // re-evaluates routes when page is reloaded
}());
