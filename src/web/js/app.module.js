function getAngularticsDependencies() {
    const isNonStaffOnProd = window.includeAnalyticsJs && !window.isStaff;
    const isStaffOnDev = !window.includeAnalyticsJs && window.isStaff;
    const isNonStaffOnDev = !window.includeAnalyticsJs && !window.isStaff;

    if (isNonStaffOnProd) {
        return [
            'angulartics.google.analytics',
            'angulartics.hubspot',
            'angulartics.segment.io',
            'angulartics.citypantry'
        ];
    } else if (isStaffOnDev) {
        return [
            'angulartics.console'
        ];
    } else if (isNonStaffOnDev) {
        return [
            'angulartics.citypantry',
            'angulartics.console'
        ];
    } else {
        return [];
    }
}

angular.module('cp', [
    'cpLib',
    'cpLibIntegration',
    'checklist-model',
    'cp.controllers.admin',
    'cp.controllers.authentication',
    'cp.controllers.customer',
    'cp.controllers.general',
    'cp.controllers.user',
    'cp.controllers.vendor',
    'cp.controllers.team',
    'cp.services',
    'currencyMask',
    'ngCookies',
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.carousel',
    'ui.grid',
    'ui.grid.pagination',
    'uiGmapgoogle-maps',
    'uiSlider',
    'angularFileUpload',
    'js.clamp',
    'angulartics',
    'dndLists'
].concat(getAngularticsDependencies()));

angular.module('cp')
    .constant('FRONTEND_BASE', window.frontendBase)
    .constant('API_BASE', window.apiBase)
    .constant('HUBSPOT_BASE', window.hubspotBase)
    .constant('MAP_CENTER', {
        latitude: 51.527787,
        longitude: -0.127691
    })
    .constant('GOOGLE_MAPS_JAVASCRIPT_API_V3_KEY', window.googleMapsJavascriptApiV3Key)
    .constant('INCLUDE_ANALYTICS_JS', window.includeAnalyticsJs)
    .constant('ENABLE_ANGULARTICS', typeof window.enableAngulartics === 'boolean' ? window.enableAngulartics : true)
    .constant('CP_TELEPHONE_NUMBER_UK', '020 3397 8376')
    .constant('CP_TELEPHONE_NUMBER_INTERNATIONAL', '+442033978376')
    .constant('CP_TWILIO_ORDER_DELIVERY_NUMBER', '+441223750398')
    .constant('CP_TWILIO_SMS_CENTRE_NUMBER', '+441708394026')
    .constant('CP_SUPPORT_EMAIL_ADDRESS', 'support@citypantry.com')
    .constant('CP_POSTAL_ADDRESS', [
        'Francis House',
        '11 Francis Street',
        'Westminster',
        'London',
        'SW1P 1DE'
    ])
    .constant('CP_BANK_ACCOUNT_NUMBER', '29201632')
    .constant('CP_BANK_NAME', 'National Westminster Bank PLC')
    .constant('CP_BANK_SORT_CODE', '60-30-20')
    .constant('INVOICE_STATUS_AWAITING_PAYMENT', 1)
    .constant('INVOICE_STATUS_PAID', 2)
    .constant('CP_PROMO_CODE_USE_TYPE_REFERRAL', 1)
    .constant('CP_PROMO_CODE_USE_TYPE_REWARD', 2)
    .constant('CP_PROMO_CODE_USE_TYPE_DISCOUNT', 3)
    .constant('CP_PROMO_CODE_USE_TYPE_VENDOR_PENALTY', 4)
    .constant('CP_QUESTION_TYPE_FIRST_REFERRAL', 0)
    .constant('getTemplateUrl', (path) => '/dist/templates/' + path + '?cacheBuster=' + window.cacheBusterValue)
    .constant('CP_PAY_ON_ACCOUNT', 1);

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
        LoadingService.show();
    });

    $rootScope.$on('$routeChangeError', function (route, error) {
        if (error && error.type === 'loginRequired') {
            $location.url('/login');
            return;
        }

        if (error && error.type === 'permissionDenied') {
            $location.url('/');
            return;
        }

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
})
.run(function($rootScope, CP_TELEPHONE_NUMBER_UK, CP_TELEPHONE_NUMBER_INTERNATIONAL, CP_SUPPORT_EMAIL_ADDRESS,
        INCLUDE_ANALYTICS_JS, FRONTEND_BASE, getTemplateUrl) {
    $rootScope.CP_TELEPHONE_NUMBER_UK = CP_TELEPHONE_NUMBER_UK;
    $rootScope.CP_TELEPHONE_NUMBER_INTERNATIONAL = CP_TELEPHONE_NUMBER_INTERNATIONAL;
    $rootScope.CP_SUPPORT_EMAIL_ADDRESS = CP_SUPPORT_EMAIL_ADDRESS;
    $rootScope.INCLUDE_ANALYTICS_JS = INCLUDE_ANALYTICS_JS;
    $rootScope.FRONTEND_BASE = FRONTEND_BASE;
    $rootScope.getTemplateUrl = getTemplateUrl;
});
