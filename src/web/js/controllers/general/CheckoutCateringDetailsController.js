angular.module('cp.controllers.general', []);

angular.module('cp.controllers.general').controller('CheckoutCateringDetailsController',
        function($scope, DocumentTitleService, SecurityService, LoadingService, PackagesFactory,
        CheckoutService, $location, NotificationService) {
    DocumentTitleService('Checkout: Catering Details');
    SecurityService.requireLoggedIn();

    $scope.order = {
        dietaryRequirementsExtra: CheckoutService.getDietaryRequirementsExtra(),
        headCount: CheckoutService.getHeadCount(),
        isCutleryAndServiettesRequired: CheckoutService.isCutleryAndServiettesRequired(),
        isVendorRequiredToCleanUp: CheckoutService.isVendorRequiredToCleanUp(),
        isVendorRequiredToSetUp: CheckoutService.isVendorRequiredToSetUp(),
        packageId: CheckoutService.getPackageId(),
        packagingType: CheckoutService.getPackagingType(),
        vegetarianHeadCount: CheckoutService.getVegetarianHeadCount()
    };

    $scope.package = {};
    $scope.packagingTypeOptions = PackagesFactory.getPackagingTypeOptions();

    $scope.vegetarianHeadCountOptions = [];
    for (let i = 0; i <= $scope.order.headCount; i += 1) {
        $scope.vegetarianHeadCountOptions.push(i);
    }

    PackagesFactory.getPackage($scope.order.packageId)
        .success(response => {
            $scope.package = response;

            if ($scope.package.canCleanUpAfterDelivery) {
                CheckoutService.setVendorCleanupCost($scope.package.costToCleanUpAfterDelivery);
            }

            if ($scope.package.canSetUpAfterDelivery) {
                CheckoutService.setVendorSetupCost($scope.package.costToSetUpAfterDelivery);
            }

            LoadingService.hide();
        })
        .catch(response => NotificationService.notifyError(response.data.errorTranslation));

    $scope.nextStep = function() {
        if ($scope.checkoutForm.$invalid) {
            $scope.checkoutForm.$submitted = true;
            return;
        }

        CheckoutService.setDietaryRequirementsExtra($scope.order.dietaryRequirementsExtra);
        CheckoutService.setPackagingType($scope.order.packagingType);
        CheckoutService.setIsCutleryAndServiettesRequired($scope.order.isCutleryAndServiettesRequired);
        CheckoutService.setIsVendorRequiredToSetUp($scope.order.isVendorRequiredToSetUp);
        CheckoutService.setIsVendorRequiredToCleanUp($scope.order.isVendorRequiredToCleanUp);
        CheckoutService.setVegetarianHeadCount($scope.order.vegetarianHeadCount);

        $location.path('/checkout/delivery-details');
    };
});
