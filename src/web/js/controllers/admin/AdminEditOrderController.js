angular.module('cp.controllers.admin').controller('AdminEditOrderController',
        function($scope, $routeParams, $window, $location, OrdersFactory, NotificationService, addressSingleLineFormatterFilter, DocumentTitleService, SecurityService, LoadingService) {
    DocumentTitleService('Edit Order');
    SecurityService.requireStaff();

    $scope.headCountOptions = [];
    $scope.headCount = undefined;
    $scope.messages = [];
    $scope.order = {};
    $scope.vegetarianHeadCountOptions = [];
    $scope.vegetarianHeadCount = undefined;

    OrdersFactory.getOrder($routeParams.orderId)
        .success(function(order) {
            $scope.order = order;
            $scope.headCountOptions = OrdersFactory.getHeadCountOptions($scope.order.package.maxPeople, $scope.order.package.minPeople);
            $scope.headCount = $scope.order.headCount;
            $scope.vegetarianHeadCountOptions = getVegetarianHeadCountOptions($scope.order.headCount);
            $scope.vegetarianHeadCount = getVegetarianHeadCountValue($scope.order.vegetarianHeadCount);

            if ($scope.order.pickupAddress !== null) {
                $scope.order.pickupAddressString = addressSingleLineFormatterFilter($scope.order.pickupAddress);
            }

            LoadingService.hide();
        })
        .error(response => NotificationService.notifyError(response.data.errorTranslation));

    OrdersFactory.getOrderMessages($routeParams.orderId)
        .success(response => $scope.messages = response.messages)
        .error(response => NotificationService.notifyError(response.data.errorTranslation));

    $scope.$watch('headCount', function(updatedHeadCount) {
        $scope.vegetarianHeadCountOptions = getVegetarianHeadCountOptions(updatedHeadCount);
        $scope.vegetarianHeadCount = getVegetarianHeadCountValue($scope.vegetarianHeadCount);
    });

    function getVegetarianHeadCountOptions(headCount = 1) {
        const options = [];

        for (let i = 0; i <= headCount; i += 1) {
            options.push(i);
        }

        return options;
    }

    function getVegetarianHeadCountValue(vegetarianHeadCount = 0) {
        if (vegetarianHeadCount > $scope.headCount) {
            return $scope.headCount;
        }
        return vegetarianHeadCount;
    }

    $scope.save = function() {
        LoadingService.show();

        const updatedOrder = {
            requestedDeliveryDate: $scope.order.requestedDeliveryDate,
            pickupDate: $scope.order.pickupDate,
            cityPantryCommission: $scope.order.cityPantryCommission,
            headCount: $scope.headCount,
            vegetarianHeadCount: $scope.vegetarianHeadCount,
            deliveryInstruction: $scope.order.deliveryInstruction,
            customDietaryRequirements: $scope.order.customDietaryRequirements
        };

        OrdersFactory.updateOrder($routeParams.orderId, updatedOrder)
            .success(response => {
                $scope.order = response.order;
                NotificationService.notifySuccess('The order has been edited.');
                LoadingService.hide();
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    $scope.saveNotes = function() {
        LoadingService.show();

        const updatedOrder = {
            cityPantryNotes: $scope.order.cityPantryNotes
        };

        OrdersFactory.updateOrder($routeParams.orderId, updatedOrder)
            .success(response => {
                $scope.order = response.order;
                NotificationService.notifySuccess('Your notes have been saved.');
                LoadingService.hide();
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    $scope.addCustomerServiceEvent = event => {
        LoadingService.show();

        OrdersFactory.addCustomerServiceEvent($routeParams.orderId, event)
            .success(response => {
                $scope.order = response.order;
                NotificationService.notifySuccess('Customer service event has been recorded.');
                LoadingService.hide();
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    $scope.delete = () => {
        const confirmed = $window.confirm('Are you sure?');
        if (!confirmed) {
            return;
        }

        const reason = $window.prompt('Enter a reason for deleting the order');

        LoadingService.show();

        OrdersFactory.deleteOrder($routeParams.orderId, reason)
            .then(() => $location.path('/admin/orders'))
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };
});