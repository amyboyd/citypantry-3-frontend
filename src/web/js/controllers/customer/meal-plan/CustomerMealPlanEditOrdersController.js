angular.module('cp.controllers.customer').controller('CustomerMealPlanEditOrdersController',
        function($scope, $routeParams, DocumentTitleService, SecurityService, LoadingService,
        NotificationService, MealPlanFactory, $location, PackagesFactory) {
    DocumentTitleService('Your meal plan');
    SecurityService.requireCustomer();

    $scope.totalCost = 0;

    const loadReviews = (pkg) => {
        PackagesFactory.getPackageReviews(pkg.id)
            .success(response => $scope.reviewsSummary = response.summary)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    $scope.selectOrder = (order) => {
        $scope.selectedOrder = order;
        loadReviews($scope.selectedOrder.package);
    };

    $scope.showReviewButton = (order) => !order.hasBeenReviewed && order.hasRequestedDeliveryDatePassed;

    MealPlanFactory.getCustomerMealPlan('me', $routeParams.mealPlanId)
        .success(response => {
            if (response.mealPlan.statusText === 'pending_customer_approval') {
                $location.path(`/customer/meal-plans/${$routeParams.mealPlanId}/review`);
                return;
            }

            $scope.mealPlan = response.mealPlan;
            $scope.placedOrders = response.placedOrders;
            angular.forEach($scope.placedOrders, order => $scope.totalCost += order.totalAmountAfterPromoCode);

            LoadingService.hide();
        })
        .catch(response => NotificationService.notifyError(response.data.errorTranslation));
});
