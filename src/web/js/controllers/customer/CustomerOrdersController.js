angular.module('cp.controllers.customer').controller('CustomerOrdersController',
        function($scope, $window, OrdersFactory, NotificationService, DocumentTitleService, SecurityService, LoadingService) {
    SecurityService.requireCustomer();
    DocumentTitleService('Your orders');

    function loadOrders() {
        OrdersFactory.getOrdersByCurrentCustomer()
            .success(response => {
                $scope.customer = response.customer;
                $scope.orders = response.orders;
                $scope.count = $scope.orders.length;
                LoadingService.hide();
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    }

    loadOrders();

    $scope.showReceipt = function(order) {
        $scope.modal = true;
        $scope.modalOrder = order;
    };

    $scope.downloadInvoice = function(order) {
        LoadingService.show();

        OrdersFactory.getOrderInvoices(order.id)
            .success(response => {
                if (response.oldInvoice) {
                    $window.location = response.oldInvoice;
                    return;
                }

                if (response.invoices.length === 0) {
                    NotificationService.notifyError('The invoice for this order is not available to download.');
                    return;
                }

                const firstInvoice = response.invoices[response.invoices.length - 1];

                if (!firstInvoice.pdfFileSystemUrl) {
                    NotificationService.notifyError('The invoice for this order is not available to download.');
                    return;
                }

                $window.location = firstInvoice.pdfFileSystemUrl;
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };
});
