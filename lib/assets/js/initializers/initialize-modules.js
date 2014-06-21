(function () {
  'use strict';

  angular.module('Agora', ['ui.router', 'Routes', 'Helpers', 'Controllers', 'ui.bootstrap'])

  .run(['$rootScope', '$log',

    function ($rootScope, $log) {
      $rootScope.$on('$stateChangeError', function () {
        $log.error(arguments.error);
      });
    }
  ]);

  angular.module('Routes', []);

  angular.module('Helpers', ['Models']);

  angular.module('Models', ['wrapParse']);

  angular.module('Controllers', ['Models', 'ngSanitize']);

}());
