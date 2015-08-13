angular.module('cp.controllers.vendor', []);

angular.module('cp.controllers.vendor').controller('VendorPortalPackageController',
        function($scope, $routeParams, DocumentTitleService, LoadingService, SecurityService, PackagesFactory) {
    SecurityService.requireVendor();

    if ($routeParams.id) {
        PackagesFactory.getPackage($routeParams.id).success(response => {
            $scope.package = response;
            DocumentTitleService('Edit package');
            LoadingService.hide();
        });
    } else {
        $scope.package = {
            allergenTypes: [],
            standardRatedFoodNetCost: 0,
            zeroRatedFoodNetCost: 0,
            deliveryDays: [],
            deliveryTimeEnd: 2000,
            deliveryTimeStart: 800,
            dietaryRequirements: [],
            eventTypes: [],
            items: ['', '', '', ''],
            maxPeople: 50,
            minPeople: 10
        };

        DocumentTitleService('Create package');
        LoadingService.hide();
    }
});
