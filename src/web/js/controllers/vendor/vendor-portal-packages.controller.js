angular.module('cp.controllers.vendor').controller('VendorPortalPackagesController',
        function ($scope, $cookies, $window, DocumentTitleService, LoadingService, NotificationService,
        SecurityService, PackagesFactory, getActiveAndApprovedStatusTextFilter) {
    SecurityService.requireVendor();
    DocumentTitleService('Your packages');

    $scope.count = 0;
    $scope.packages = [];

    function loadPackages() {
        // @todo – replace getPackagesByVendor() with getPackagesByCurrentVendor() (23/02).
        PackagesFactory.getPackagesByVendor($cookies.vendorId)
            .success(response => {
                angular.forEach(response.packages, row => row.activeAndApproved = getActiveAndApprovedStatusTextFilter(row.active, row.approved));
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
