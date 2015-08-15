angular.module('cp.controllers.admin').controller('AdminViewInvoiceController',
        function($scope, $routeParams, OrdersFactory, NotificationService, DocumentTitleService,
        SecurityService, LoadingService, INVOICE_STATUS_AWAITING_PAYMENT, INVOICE_STATUS_PAID) {
    DocumentTitleService('View invoice');
    SecurityService.requireStaff();

    OrdersFactory.getCustomerInvoice($routeParams.invoiceId)
        .success(invoice => {
            $scope.invoice = invoice;
            LoadingService.hide();
        })
        .error(response => NotificationService.notifyError(response.errorTranslation));

    function updateStatus(status) {
        LoadingService.show();

        OrdersFactory.updateCustomerInvoiceStatus($scope.invoice.id, status)
            .success(response => {
                $scope.invoice = response.invoice;
                LoadingService.hide();
            })
            .error(response => NotificationService.notifyError(response.errorTranslation));
    }

    $scope.markAsPaid = function() {
        updateStatus(INVOICE_STATUS_PAID);
    };

    $scope.markAsAwaitingPayment = function() {
        updateStatus(INVOICE_STATUS_AWAITING_PAYMENT);
    };
});
