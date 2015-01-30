angular.module('cp.controllers.admin', []);

angular.module('cp.controllers.admin').config(function($routeProvider) {
    $routeProvider.
        when('/admin/vendor/:vendorId', {
            controller: 'AdminEditVendorController',
            templateUrl: '/dist/templates/vendor.html'
        }).
        when('/admin/package/:packageId', {
            controller: 'AdminEditPackageController',
            templateUrl: '/dist/templates/admin/edit-package.html'
        });
});
