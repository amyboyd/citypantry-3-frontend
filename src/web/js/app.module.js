angular.module('cp', [
    'ngCookies',
    'ngRoute',
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.pagination',
    'uiSlider',
    'cp.controllers.admin',
    'cp.controllers.general',
    'cp.controllers.user',
    'cp.controllers.vendor',
    'cp.controllers.customer',
    'cp.controllers.authentication',
    'cp.filters',
    'cp.factories',
    'cp.services',
    'uiGmapgoogle-maps',
    'ui.bootstrap.carousel'
]);

const baseHost = window.location.host.replace('order.', '');
angular.module('cp')
    .constant('FRONTEND_BASE', window.location.protocol + '//order.' + baseHost)
    .constant('API_BASE', window.location.protocol + '//api.' + baseHost)
    .constant('HUBSPOT_BASE', window.hubspotBase)
    .constant('MAP_CENTER', {
        latitude: 51.527787,
        longitude: -0.127691
    })
    .constant('GOOGLE_MAPS_JAVASCRIPT_API_V3_KEY', window.googleMapsJavascriptApiV3Key)
    .constant('CP_TELEPHONE_NUMBER_UK', '020 3397 8376')
    .constant('CP_TELEPHONE_NUMBER_INTERNATIONAL', '+442033978376');

angular.module('cp').config(function($locationProvider, uiGmapGoogleMapApiProvider, GOOGLE_MAPS_JAVASCRIPT_API_V3_KEY,
        $sceDelegateProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    uiGmapGoogleMapApiProvider.configure({
        key: GOOGLE_MAPS_JAVASCRIPT_API_V3_KEY,
        v: '3.17'
    });

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://platform.twitter.com/**',
        '//www.facebook.com/**',
        'http://www.facebook.com/**',
        'https://www.facebook.com/**'
    ]);
})
.run(function($rootScope, HUBSPOT_BASE, LoadingService, UsersFactory, $location, $cookies) {
    $rootScope.hubspotBase = HUBSPOT_BASE;

    $rootScope.$on('$routeChangeStart', function(event, oldRoute, newRoute) {
        // Don't show the loading service animation when the page change is just the search query
        // changing. It's not pretty when typing fast and the animation flickers with each key press.
        let isFromSearchToSearch = oldRoute.$route && oldRoute.$route.controller === 'SearchController' &&
            newRoute.$route && newRoute.$route.controller === 'SearchController';
        if (isFromSearchToSearch) {
            return;
        }

        LoadingService.show();
    });

    $rootScope.$on('$routeChangeError', function () {
        LoadingService.hide();
    });

    var isLoggedIn = $cookies.userId && $cookies.salt;
    if (isLoggedIn) {
        UsersFactory.getLoggedInUser().catch(function(response) {
            if (response.status === 401) {
                // The user's ID or auth token is no longer valid. This is possibly because this is
                // a dev or staging site and the database fixtures have been reloaded.
                delete $cookies.userId;
                delete $cookies.salt;
                $location.path('/logout');
            }
        });
    }
});
