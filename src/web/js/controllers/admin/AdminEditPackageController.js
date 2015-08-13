angular.module('cp.controllers.admin').controller('AdminEditPackageController',
        function($scope, $routeParams, PackagesFactory, NotificationService, DocumentTitleService,
        SecurityService, LoadingService, CustomersFactory, $window) {
    DocumentTitleService('Edit package');
    SecurityService.requireStaff();

    function loadPackage() {
        PackagesFactory.getPackage($routeParams.packageId)
            .success(vendorPackage => {
                $scope.vendorPackage = vendorPackage;
                $scope.isVisibleToCustomers = vendorPackage.isApproved && !vendorPackage.isDeleted;
                $scope.isOnlyNeedingApproval = !vendorPackage.isApproved && !vendorPackage.isDeleted;
                LoadingService.hide();
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    }

    $scope.packagingTypes = PackagesFactory.getPackagingTypeOptions();
    $scope.noticeOptions = PackagesFactory.getNoticeOptions();

    PackagesFactory.getPackageReviews($routeParams.packageId)
        .success(response => $scope.reviews = response.reviews)
        .error(response => NotificationService.notifyError(response.data.errorTranslation));

    $scope.save = function() {
        LoadingService.show();

        const updatedPackage = {
            name: $scope.vendorPackage.name,
            shortDescription: $scope.vendorPackage.shortDescription,
            description: $scope.vendorPackage.description,
            isMealPlan: $scope.vendorPackage.isMealPlan,
            notice: $scope.vendorPackage.notice,
            packagingType: $scope.vendorPackage.packagingType
        };

        PackagesFactory.updatePackage($routeParams.packageId, updatedPackage)
            .success(response => {
                NotificationService.notifySuccess('The package has been edited.');
                loadPackage();
            })
            .catch((response) => NotificationService.notifyError(response.data.errorTranslation));
    };

    $scope.approve = function() {
        LoadingService.show();

        PackagesFactory.approvePackage($routeParams.packageId)
            .success(loadPackage)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    function updatePackagesOnlyForCustomerProperty(customer) {
        LoadingService.show();

        PackagesFactory.updatePackage($routeParams.packageId, {onlyForCustomer: customer.id})
            .success(loadPackage)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    }

    $scope.getCustomerLimitPackageVisibilityTo = function() {
        let customerId = $window.prompt('Which customer do you want this package to be visible to? Enter their ID.');
        customerId = parseInt(customerId, 10);

        if (!customerId) {
            $window.alert('No numeric customer ID was entered.');
            return;
        }

        CustomersFactory.getCustomer(customerId)
            .success(response => updatePackagesOnlyForCustomerProperty(response))
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    loadPackage();
});
