describe('Admin - vendor page', function() {
    var isFirst = true;

    beforeEach(function() {
        if (isFirst) {
            loginAsUser('alice@bunnies.test');
            browser.get('/admin/vendors');
            element.all(by.css('#vendors-table a[href^="/admin/vendor/"]')).first().click();
            browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                    return (/\/admin\/vendor\/\d+$/.test(url));
                });
            });
            isFirst = false;
        }
    });

    it('should show the "vendor" page', function() {
        expect(browser.getCurrentUrl()).toMatch(/\/admin\/vendor\/\d+$/);
        expect(element(by.css('h1')).getText()).toMatch(/^Vendor \d+$/);
    });
});