(function() {
  'use strict';

  angular
    .module('app')
    .config(config);

  /** @ngInject */
    function config($logProvider, $authProvider, restUrl, authUrl, appName, $mdDateLocaleProvider, moment, $httpProvider, $mdAriaProvider) {
        // Enable log
        $logProvider.debugEnabled(true);
        // Globally disables all ARIA warnings.
        $mdAriaProvider.disableWarnings();

        // Config auth
        $authProvider.loginUrl = authUrl;
        // $authProvider.signupUrl = "http://api.com/auth/signup";
        $authProvider.tokenName = "token";
        $authProvider.tokenPrefix = appName;
        $authProvider.storageType = 'sessionStorage';
        // $authProvider.authToken = 'Bearer';

        $mdDateLocaleProvider.formatDate = function(date) {
            if (date) {
                return moment(date).format('DD/MM/YYYY');
            }
            return null;
        };

        $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, 'DD/MM/YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $httpProvider.interceptors.push('HttpInterceptor');
    }

})();
