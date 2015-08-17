var GridObjectTest = require('../lib/gridObjectTestUtils.spec.js');
var notificationModal = require('../NotificationModal.js');

describe('Admin - invoices page', function() {
    var isFirst = true;
    var gridObject;
    var NUMBER_OF_INVOICES_IN_FIXTURES = 6;
    // One invoice is created in the 'reissue invoice' test, so there should be 7 invoices total.
    var NUMBER_OF_INVOICES_EXPECTED = NUMBER_OF_INVOICES_IN_FIXTURES + 1;

    beforeEach(function() {
        if (isFirst) {
            loginAsUser('alice@bunnies.test');
            browser.get('/admin/invoices');
            isFirst = false;
            gridObject = new GridObjectTest('invoices-table');
        }
    });

    it('should load the "invoices" page', function() {
        expect(element(by.css('h1')).getText()).toBe('Invoices');
    });

    it('should have 10 columns', function() {
        gridObject.expectHeaderColumns([
            'Invoice No',
            'Invoice Date',
            'Order No',
            'Order Date',
            'Paid on Account',
            'Customer',
            'Invoice Status',
            'Amount',
            'Overdue?',
            'View',
        ]);
    });

    it('should list all customer invoices', function() {
        gridObject.expectRowCount(NUMBER_OF_INVOICES_EXPECTED);
    });

    it('should find 3 invoices when filtered by awaiting payment status', function() {
        gridObject.enterFilterInColumn(6, 'Awaiting');
        gridObject.expectRowCount(3);
    });

    it('should find all invoices when filter is cancelled', function() {
        gridObject.cancelFilterInColumn(6);
        gridObject.expectRowCount(NUMBER_OF_INVOICES_EXPECTED);
    });

    it('should find 1 invoice when filtered by overdue', function() {
        gridObject.enterFilterInColumn(8, 'Yes');
        gridObject.expectRowCount(1);
        gridObject.cancelFilterInColumn(8);
    });

    it('should be able to mark an invoice as paid', function() {
        gridObject.enterFilterInColumn(6, 'Awaiting payment');
        gridObject.expectRowCount(3);

        var markAsPaidLink = element.all(by.css('#invoices-table a.invoice-status')).first();
        markAsPaidLink.click();

        gridObject.expectRowCount(2);

        notificationModal.expectIsOpenWithSuccessMessage('The invoice has been updated.');
        notificationModal.dismiss();
    });
});
