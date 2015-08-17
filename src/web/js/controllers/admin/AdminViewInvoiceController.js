angular.module('cp.controllers.admin').controller('AdminViewInvoiceController',
        function($scope, $routeParams, OrdersFactory, NotificationService, DocumentTitleService,
        SecurityService, LoadingService, INVOICE_STATUS_AWAITING_PAYMENT, INVOICE_STATUS_PAID,
        $location) {
    DocumentTitleService('View invoice');
    SecurityService.requireStaff();

    const id = $routeParams.invoiceId;

    OrdersFactory.getCustomerInvoice(id)
        .success(invoice => {
            $scope.invoice = invoice;
            LoadingService.hide();
        })
        .error(response => NotificationService.notifyError(response.errorTranslation));

    function updateStatus(status) {
        LoadingService.show();

        OrdersFactory.updateCustomerInvoiceStatus(id, status)
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

    $scope.reissue = function() {
        OrdersFactory.reissueCustomerInvoice(id)
            .success(response => {
                const newId = response.newInvoice.id;
                $location.url(`/admin/invoice/${newId}`);
            })
            .error(response => NotificationService.notifyError(response.errorTranslation));
    };
});
