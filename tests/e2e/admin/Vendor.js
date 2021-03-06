var gridTestUtils = require('../lib/gridTestUtils.spec.js');

function navigateToVendor(name) {
    loginAsUser('alice@bunnies.test');
    browser.get('/admin/vendors');
    gridTestUtils.enterFilterInColumn('vendors-table', 1, name);
    element.all(by.css('#vendors-table a[href^="/admin/vendor/"]')).first().click();

    expect(browser.getCurrentUrl()).toMatch(/\/admin\/vendor\/[\da-f]{24}$/);

    var titleText = element(by.css('h1')).getText();
    expect(titleText).toMatch(/^Vendor \d+:/);
    expect(titleText).toContain(name);
}

function getCityPantryCommissionFormGroup() {
    return element(by.id('edit-vendor-city-pantry-commission'));
}

describe('Admin - edit vendor page - Hong Tin', function() {
    it('should be able to navigate to the "edit vendor" page', function() {
        navigateToVendor('Hong Tin');
    });

    it('should show the vendor\'s addresses', function() {
        expect(element.all(by.repeater('address in vendor.addresses')).count()).toBe(1);
    });

    it('should say that this vendor cannot have meal plan packages', function() {
        expect(element(by.model('vendor.isMealPlan')).isSelected()).toBe(false);
    });

    it('should allow the commission to be edited because this vendor has a flat commission', function() {
        var formGroup = getCityPantryCommissionFormGroup();
        expect(formGroup.isPresent()).toBe(true);
    });

    it('should list the vendor\'s users', function() {
        var users = element.all(by.repeater('user in users'));
        expect(users.count()).toBe(1);
        expect(users.get(0).getText()).toContain('Vendor, vendor@bunnies.test');
    });
});

describe('Admin - edit vendor page - Sam\'s', function() {
    it('should be able to navigate to the "edit vendor" page', function() {
        navigateToVendor('Sam\'s');
    });

    it('should say that this vendor can have meal plan packages', function() {
        expect(element(by.model('vendor.isMealPlan')).isSelected()).toBe(true);
    });

    it('should not allow the commission to be edited because this vendor does not have a flat commission', function() {
        var formGroup = getCityPantryCommissionFormGroup();
        expect(formGroup.isPresent()).toBe(false);
    });
});

describe('Admin - edit vendor page - masquerading', function() {
    it('should be able to masquerade as the vendor\'s user', function() {
        navigateToVendor('Hong Tin');

        element(by.css('a.cp-masquerade')).click();

        browser.wait(function() {
            return browser.getCurrentUrl().then(function(url) {
                return /\.dev\/vendor\/orders$/.test(url);
            });
        }, 15000);
    });

    it('should have a button to return to being staff, which prompts for a password', function() {
        element(by.css('a[ng-if="isStaffMasquerading"]')).click();
        element(by.model('plainPassword')).sendKeys('password');
        element(by.id('login_button')).click();
    });

    it('should be the staff user again', function() {
        expect(browser.getCurrentUrl()).toMatch(/\/admin\/users$/);
    });
});
