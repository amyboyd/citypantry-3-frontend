angular.module('cp.controllers.vendor').controller('VendorPortalPackagesController',
        function ($scope, $cookies, $window, DocumentTitleService, LoadingService, NotificationService,
        SecurityService, PackagesFactory, getActiveAndApprovedStatusTextFilter) {
    SecurityService.requireVendor();
    DocumentTitleService('Your packages');

    $scope.count = 0;
    $scope.packages = [];

    function loadPackages() {
        PackagesFactory.getPackagesByCurrentVendor()
            .success(response => {
                angular.forEach(response.packages, row => {
                    // There is no `isActive` field for packages, so pass `true`.
                    row.status = getActiveAndApprovedStatusTextFilter(true, row.isApproved);
                });
                response.packages.sort((a, b) => a.humanId >= b.humanId);
                $scope.packages = response.packages;
                $scope.count = $scope.packages.length;
                LoadingService.hide();
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    }

    loadPackages();

    $scope.delete = function(id) {
        const confirmed = $window.confirm('Are you sure?');
        if (!confirmed) {
            return;
        }

        LoadingService.show();
        PackagesFactory.deletePackage(id)
            .then(loadPackages)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };
});
