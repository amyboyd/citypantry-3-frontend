var gridTestUtils = require('../lib/gridTestUtils.spec.js');

describe('Admin - invoice page', function() {
    var isFirst = true;

    beforeEach(function() {
        if (isFirst) {
            loginAsUser('alice@bunnies.test');
            browser.get('/admin/invoices');
            // Filter to an order that is paid on account, awaiting payment, and not overdue.
            gridTestUtils.enterFilterInColumn('invoices-table', 4, 'Yes');
            gridTestUtils.enterFilterInColumn('invoices-table', 6, 'Awaiting');
            gridTestUtils.enterFilterInColumn('invoices-table', 8, 'No');
            element.all(by.css('#invoices-table a[href^="/admin/invoice/"]')).first().click();
            isFirst = false;
        }
    });

    it('should load the "invoice" page', function() {
        expect(browser.getCurrentUrl()).toMatch(/\/admin\/invoice\/[\da-f]{24}$/);
        expect(element(by.css('h1')).getText()).toMatch(/^Invoice CP\-\d+\-\d{4}$/);
    });

    it('should have a link to mark the invoice as paid, then to revert to awaiting payment', function() {
        var markAsPaid = element(by.css('a.cp-mark-as-paid'));
        var revertToAwaitingPayment = element(by.css('a.cp-revert-to-awaiting-payment'));

        expect(markAsPaid.isDisplayed()).toBe(true);
        expect(revertToAwaitingPayment.isPresent()).toBe(false);

        markAsPaid.click();

        expect(markAsPaid.isPresent()).toBe(false);
        expect(revertToAwaitingPayment.isDisplayed()).toBe(true);

        revertToAwaitingPayment.click();

        expect(markAsPaid.isDisplayed()).toBe(true);
        expect(revertToAwaitingPayment.isPresent()).toBe(false);
    });

    it('should load the invoice details', function() {
        var invoice = element(by.css('.invoice')).getText();
        expect(invoice).toMatch(/Invoice No.: CP\-\d+\-\d{4}/);
        expect(invoice).toMatch(/Invoice Date and Tax Point: \d{2}\/\d{2}\/\d{4}/);
        expect(invoice).toContain('Package: Paella');
        expect(invoice).toContain('25 Lena Gardens');
        expect(invoice).toMatch(/Food\/Drink £(\d*\.\d{2}|\d+) 0/); // Head count = 0 because there is no hot food.
        expect(invoice).toMatch(/Cold Takeaway Food £(\d*\.\d{2}|\d+) 15/); // Head count = 15.
        expect(invoice).toContain('Subtotal £150.00');
        expect(invoice).toContain('VAT £0.00');
        expect(invoice).toContain('Grand Total £127.50');
        expect(invoice).toContain('Paid on account. Payment is due 10 days from the invoice date.');
    });
});
