angular.module('cp.controllers.general').controller('CheckoutThankYouController',
        function($scope, DocumentTitleService, SecurityService, LoadingService, PackagesFactory,
        CheckoutService, NotificationService) {
    DocumentTitleService('Checkout: Thank You');
    SecurityService.requireLoggedIn();

    $scope.order = {
        endTime: CheckoutService.getEndTime(),
        headCount: CheckoutService.getHeadCount(),
        packageId: CheckoutService.getPackageId(),
        startTime: CheckoutService.getStartTime(),
        object: CheckoutService.getLastCreatedOrder()
    };

    $scope.order.checkoutDurationInMinutes = Math.floor((Math.abs($scope.order.endTime - $scope.order.startTime) / 1000) / 60);

    PackagesFactory.getPackage($scope.order.packageId)
        .success(response => {
            $scope.package = response;
            LoadingService.hide();
        })
        .catch(response => NotificationService.notifyError(response.data.errorTranslation));
});
