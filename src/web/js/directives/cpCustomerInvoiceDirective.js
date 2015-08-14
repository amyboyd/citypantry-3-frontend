angular.module('cp').directive('cpCustomerInvoice', function(OrdersFactory) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            OrdersFactory.getCustomerInvoiceAsHtml(attrs.cpInvoiceId)
                .then(response => {
                    let invoiceHtml = response.data;

                    // Change the invoice's 'body' CSS to only apply to this directive, not the rest
                    // of the page. This is so the rest of the page doesn't not get changed.
                    invoiceHtml = invoiceHtml.replace(/<style>\s+body \{/, '<style>cp-customer-invoice {');

                    // Make the invoice text readable. The font-size rule is correct for the PDF
                    // renderer but not for this page.
                    invoiceHtml = invoiceHtml.replace('font-size: 62.5%;', '');

                    element.html(invoiceHtml);
                });
        }
    };
});
