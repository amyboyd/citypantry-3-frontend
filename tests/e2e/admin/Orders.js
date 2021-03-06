describe('Admin - orders page', function() {
    var notificationModal = require('../NotificationModal.js');
    var GridObjectTest = require('../lib/gridObjectTestUtils.spec.js');
    var isFirst = true;
    var gridObject;

    beforeEach(function() {
        if (isFirst) {
            loginAsUser('alice@bunnies.test');
            browser.get('/admin/orders');
            isFirst = false;
            gridObject = new GridObjectTest('orders-table');
        }
    });

    it('should have the title "Orders"', function() {
        expect(element(by.css('h1')).getText()).toBe('Orders');
    });

    it('should have 10 columns', function() {
        gridObject.expectHeaderColumnCount(10);
    });

    it('should have 5 rows', function() {
        gridObject.expectRowCount(5);
    });

    it('should have the column name "Order No"', function() {
        gridObject.expectHeaderCellValueMatch(0, 'Order No');
    });

    it('should have the column name "Order Date"', function() {
        gridObject.expectHeaderCellValueMatch(1, 'Order Date');
    });

    it('should have the column name "Delivery Date"', function() {
        gridObject.expectHeaderCellValueMatch(2, 'Delivery Date');
    });

    it('should have the column name "Customer"', function() {
        gridObject.expectHeaderCellValueMatch(3, 'Customer');
    });

    it('should have the column name "Vendor"', function() {
        gridObject.expectHeaderCellValueMatch(4, 'Vendor');
    });

    it('should have the column name "Package"', function() {
        gridObject.expectHeaderCellValueMatch(5, 'Package');
    });

    it('should have the column name "Cost"', function() {
        // `expectHeaderCellValueMatch` takes a regex for the expected value, so we need to
        // escape the brackets and dot.
        gridObject.expectHeaderCellValueMatch(6, /Cost \(inc\. VAT\)/);
    });

    it('should have the column name "Status"', function() {
        gridObject.expectHeaderCellValueMatch(7, 'Order Status');
    });

    it('should have the column name "Delivery Status"', function() {
        gridObject.expectHeaderCellValueMatch(8, 'Delivery Status');
    });

    it('should have the column name "View"', function() {
        gridObject.expectHeaderCellValueMatch(9, 'View');
    });

    it('should find 1 order when filtered by "Carrots"', function() {
        gridObject.enterFilterInColumn(5, 'Car');
        gridObject.expectRowCount(1);
        gridObject.expectCellValueMatch(0, 5, 'Carrots');
    });

    it('should find 5 orders when filter is cancelled', function() {
        gridObject.cancelFilterInColumn(5);
        gridObject.expectRowCount(5);
    });

    it('should find some orders when the "show orders delivered today" button is clicked', function() {
        element(by.css('main .show-orders-delivered-today')).click();

        // Then number of rows found depends on a few things:
        // - time the test is run (because the time in fixtures varies, and the time and timezone when
        // running the tests varies).
        // - if this test is being ran in isolation.
        // For that reason, we don't want to be too strict about the expected row count. However,
        // there should be at least 1 order regardless of those factors.
        var rows = element(by.id('orders-table')).all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
        expect(rows.count()).toBeGreaterThan(0);
    });

    it('should be able to download orders as a CSV', function() {
        var downloadButton = element(by.css('button.cp-download-csv'));
        expect(downloadButton.getText()).toBe('DOWNLOAD');
        downloadButton.click();

        // If there was an error, a notification modal would display. If there was not an error,
        // the download will have happened.
        notificationModal.expectIsClosed();
    });
});
