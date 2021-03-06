angular.module('cp.controllers.general').controller('VendorPortalAddressController',
        function ($scope, $routeParams, VendorsFactory, LoadingService, DocumentTitleService) {
    DocumentTitleService('Your addresses');

    if ($routeParams.id) {
        VendorsFactory.getAddressById($routeParams.id).then(function(address) {
            $scope.address = address;
            LoadingService.hide();
        });
    } else {
        $scope.address = {countryName: 'United Kingdom', orderNotificationMobileNumbers: []};
        LoadingService.hide();
    }
});
