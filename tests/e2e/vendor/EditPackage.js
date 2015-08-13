var notificationModal = require('../NotificationModal.js');

describe('Vendor portal - edit a non-meal-plan package', function() {
    var isFirst = true;
    var deliveryCost;
    var dietaryTypeDairyFreeCheckbox;
    var dietaryTypeGlutenFreeCheckbox;
    var eventTypeDinnerCheckbox;
    var eventTypeLunchCheckbox;
    var freeDeliveryThreshold;
    var packageDescription;
    var packageItems;
    var submitFormButton;

    beforeEach(function() {
        if (isFirst) {
            loginAsUser('vendor@bunnies.test');
            browser.get('/vendor/packages');
            element.all(by.css('#table_packages a.edit-package')).get(0).click();
            isFirst = false;
        }

        deliveryCost = element(by.id('package_delivery_cost'));
        dietaryTypeDairyFreeCheckbox = element.all(by.css('input[name="packageDietaryTypes[]"]')).get(5);
        dietaryTypeGlutenFreeCheckbox = element.all(by.css('input[name="packageDietaryTypes[]"]')).get(3);
        eventTypeDinnerCheckbox = element.all(by.css('input[name="packageEventTypes[]"]')).get(2);
        eventTypeLunchCheckbox = element.all(by.css('input[name="packageEventTypes[]"]')).get(1);
        freeDeliveryThreshold = element(by.id('package_free_delivery_threshold'));
        packageDescription = element(by.id('package_description'));
        packageItems = element.all(by.css('input[name="packageItems[]"]'));
        submitFormButton = element(by.css('main input.btn.btn-primary'));
    });

    it('should show the "Edit package" page', function() {
        expect(browser.getCurrentUrl()).toMatch(/\/vendor\/packages\/[\da-f]{24}$/);
        expect(element(by.css('h2.cp-heading')).getText()).toBe('EDIT PACKAGE');
    });

    it('should load select options and checkboxes', function() {
        // Cuisine types.
        expect(element.all(by.css('#package_cuisine_type > option')).count()).toBe(31);
        expect(element.all(by.css('#package_cuisine_type > option')).get(0).getText()).toBe('American');

        // Dietary types.
        expect(element.all(by.repeater('dietaryTypeOption in dietaryTypeOptions')).count()).toBe(7);
        expect(element.all(by.repeater('dietaryTypeOption in dietaryTypeOptions')).get(0).getText()).toContain('Vegetarian');

        // Allergen types.
        expect(element.all(by.repeater('allergenTypeOption in allergenTypeOptions')).count()).toBe(14);
        expect(element.all(by.repeater('allergenTypeOption in allergenTypeOptions')).get(0).getText()).toContain('Cereals containing gluten');

        // Event types.
        expect(element.all(by.repeater('eventTypeOption in eventTypeOptions')).count()).toBe(6);
        expect(element.all(by.repeater('eventTypeOption in eventTypeOptions')).get(0).getText()).toContain('Breakfast');
    });

    it('should load the package details', function() {
        expect(element(by.id('package_cuisine_type')).$('option:checked').getText()).toBe('Swiss');
        expect(element(by.model('package.name')).getAttribute('value')).toBe('Carrots');
        expect(element(by.model('package.description')).getAttribute('value')).toBe('Yum');

        expect(packageItems.get(0).getAttribute('value')).toBe('Orange carrots');
        expect(packageItems.get(1).getAttribute('value')).toBe('White carrots');

        // Dietary type: "Vegetarian", "Vegan".
        expect(element.all(by.css('input[name="packageDietaryTypes[]"]')).get(0).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDietaryTypes[]"]')).get(1).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDietaryTypes[]"]')).get(2).isSelected()).toBe(false);

        // Allergen type: "Sulphur dioxide, which is a preservative found in some dried fruit".
        expect(element.all(by.css('input[name="packageAllergenTypes[]"]')).get(11).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageAllergenTypes[]"]')).get(0).isSelected()).toBe(false);

        // Event types: "Breakfast".
        expect(element.all(by.css('input[name="packageEventTypes[]"]')).get(0).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageEventTypes[]"]')).get(1).isSelected()).toBe(false);

        expect(element.all(by.css('input[name="packageHotFood"]')).get(1).isSelected()).toBe(true);

        expect(element(by.model('package.standardRatedFoodGrossCost')).getAttribute('value')).toBe('0');
        expect(element(by.model('package.zeroRatedFoodNetCost')).getAttribute('value')).toBe('20');

        // Delivery days: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" and "Saturday".
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(0).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(1).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(2).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(3).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(4).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(5).isSelected()).toBe(true);
        expect(element.all(by.css('input[name="packageDeliveryDays[]"]')).get(6).isSelected()).toBe(false);

        var packagingType = element(by.model('package.packagingType'));
        expect(packagingType.all(by.css('option')).count()).toBe(5);
        expect(packagingType.element(by.cssContainingText('option', 'Individual')).isSelected()).toBe(true);
    });

    it('should show 2 package item textboxes', function() {
        expect(element.all(by.css('input[name="packageItems[]"]')).count()).toBe(2);
    });

    it('should be able to add a package item textbox', function() {
        element(by.css('a[ng-click="addPackageItem()"]')).click();
        expect(element.all(by.css('input[name="packageItems[]"]')).count()).toBe(3);
    });

    it('should show a notes textbox for the vegetarian dietary type', function() {
        expect(element.all(by.css('input[name="packageDietaryTypeNotes[]"]')).get(0).isDisplayed()).toBe(true);
    });

    it('should have notice options up to 14 days', function() {
        var noticeOptions = element(by.model('package.notice')).all(by.css('option'));
        expect(noticeOptions.last().getText()).toBe('14 days');
    });

    // This test will fail if the suite is run in isolation because the address added by
    // CreatePackage will not exist.
    it('should load the vendor\'s addresses', function() {
        var addresses = element.all(by.repeater('vendorAddress in vendor.addresses'));
        expect(addresses.count()).toBe(2);
        expect(addresses.get(0).getText()).toContain('Shepherds Bush Road, London, W6, United Kingdom');
        expect(addresses.get(1).getText()).toContain('11 Francis Street');

        var isSelectedCheckboxes = element.all(by.css('input[name="vendorAddressIsSelected[]"]'));
        expect(isSelectedCheckboxes.get(0).isSelected()).toBe(true);
        expect(isSelectedCheckboxes.get(1).isSelected()).toBe(false);
    });

    // This test will fail if the suite is run in isolation because the address added by
    // CreatePackage will not exist.
    it('should be able to add an address', function() {
        var addAddressButton = element(by.css('button.cp-add-vendor-address'));
        expect(addAddressButton.getText()).toBe('ADD ANOTHER ADDRESS');
        addAddressButton.click();

        element(by.model('newAddress.addressLine1')).sendKeys('Jeremy House');
        element(by.model('newAddress.addressLine2')).sendKeys('22 Jeremy Road');
        element(by.model('newAddress.addressLine3')).sendKeys('Westminster');
        element(by.model('newAddress.city')).sendKeys('London');
        element(by.model('newAddress.postcode')).sendKeys('SW1P 1DE');
        element(by.model('newAddress.landlineNumber')).sendKeys('020 3397 8376');
        element(by.model('newAddress.orderNotificationMobileNumbersCommaSeparated')).sendKeys('07861795252');
        element(by.model('newAddress.contactName')).sendKeys('Stu');

        element(by.css('button[ng-click="addAddress()"]')).click();

        var addresses = element.all(by.repeater('vendorAddress in vendor.addresses'));
        expect(addresses.count()).toBe(3);
        expect(addresses.get(2).getText()).toContain('Jeremy House, 22 Jeremy Road, Westminster, London, SW1P 1DE, United Kingdom');
    });

    // This test will fail if the suite is run in isolation because the address added by
    // CreatePackage will not exist.
    it('should set default values for the new address', function() {
        // Address is selected.
        expect(element.all(by.css('input[name="vendorAddressIsSelected[]"]')).get(2).isSelected()).toBe(true);

        // Delivery radius is 2 miles.
        expect(element(by.css('select[id="delivery_radius3"] > option:nth-child(2)')).isSelected()).toBe(true);
    });

    it('should show an error if an invalid postcode is entered', function() {
        element(by.css('button.cp-add-vendor-address')).click();
        element(by.model('newAddress.postcode')).sendKeys('QWERTY');
        element(by.css('button[ng-click="addAddress()"]')).click();

        var invalidPostcodeError = element.all(by.css('label[for="address_postcode"] > .form-element-invalid')).get(1);
        expect(invalidPostcodeError.getText()).toBe('(Postcode is invalid.)');
        expect(invalidPostcodeError.isDisplayed()).toBe(true);

        element(by.css('.modal .close')).click();
    });

    // This test will fail if the suite is run in isolation because the address added by
    // CreatePackage will not exist.
    it('should show an error if 0 delivery addresses are selected', function() {
        var firstAddressCheckbox = element.all(by.css('input[name="vendorAddressIsSelected[]"]')).get(0);
        firstAddressCheckbox.click();

        var thirdAddressCheckbox = element.all(by.css('input[name="vendorAddressIsSelected[]"]')).get(2);
        thirdAddressCheckbox.click();

        submitFormButton.click();

        notificationModal.expectIsOpenWithErrorMessage(/There are some fields/);
        notificationModal.dismiss();

        var deliveryAddressError = element.all(by.css('legend[id="package_delivery_addresses"] > .form-element-invalid')).get(0);
        expect(deliveryAddressError.getText()).toBe('(Please specify at least one delivery address.)');
        expect(deliveryAddressError.isDisplayed()).toBe(true);

        // Revert the changes so other tests will pass.
        firstAddressCheckbox.click();
        thirdAddressCheckbox.click();
    });

    it('should show an error if minimum people is greater than maximum people', function() {
        var minPeopleOptions = element.all(by.css('#package_min_people > option'));
        minPeopleOptions.get(1).click(); // 2 people.
        var maxPeopleOptions = element.all(by.css('#package_max_people > option'));
        maxPeopleOptions.get(0).click(); // 1 person.

        submitFormButton.click();

        notificationModal.expectIsOpenWithErrorMessage(/There are some fields/);
        notificationModal.dismiss();

        var greaterThanError = element(by.css('legend[id="package_min_max_people"] > .form-element-invalid'));
        expect(greaterThanError.getText()).toBe('(Package maximum must be greater than package minimum.)');
        expect(greaterThanError.isDisplayed()).toBe(true);

        // Revert the changes so other tests will pass.
        minPeopleOptions.get(0).click(); // 1 person.
        maxPeopleOptions.get(50).click(); // 250 people.
    });

    it('should be able to save the details', function() {
        packageDescription.sendKeys(' yum');

        element(by.css('a[ng-click="addPackageItem()"]')).click();
        packageItems.get(2).sendKeys('Purple carrots');

        // Dietary types: "Gluten free" and "Dairy free".
        dietaryTypeGlutenFreeCheckbox.click();
        dietaryTypeDairyFreeCheckbox.click();

        // Event types: "Lunch" and "Dinner".
        eventTypeLunchCheckbox.click();
        eventTypeDinnerCheckbox.click();

        element(by.cssContainingText('#package_notice > option', '3 hours')).click();
        element(by.cssContainingText('#package_delivery_time_start > option', '07:00')).click();
        element(by.cssContainingText('#package_delivery_time_end > option', '17:00')).click();
        deliveryCost.clear().sendKeys(10);
        freeDeliveryThreshold.clear().sendKeys(150);

        submitFormButton.click();
    });

    it('should notify the user that the package has been updated', function() {
        notificationModal.expectIsOpenWithSuccessMessage('Your package has been updated.');
        notificationModal.dismiss();
    });

    it('should remain on the package page', function() {
        expect(browser.getCurrentUrl()).toMatch(/citypantry\.dev\/vendor\/packages\/[\da-f]{24}/);
    });

    it('should have persisted the updated values', function() {
        browser.refresh();

        expect(packageDescription.getAttribute('value')).toBe('Yum yum');
        expect(packageItems.get(2).getAttribute('value')).toBe('Purple carrots');
        expect(dietaryTypeGlutenFreeCheckbox.isSelected()).toBe(true);
        expect(dietaryTypeDairyFreeCheckbox.isSelected()).toBe(true);
        expect(eventTypeLunchCheckbox.isSelected()).toBe(true);
        expect(eventTypeDinnerCheckbox.isSelected()).toBe(true);
        expect(element(by.id('package_notice')).$('option:checked').getText()).toBe('3 hours');
        expect(element(by.id('package_delivery_time_start')).$('option:checked').getText()).toBe('07:00');
        expect(element(by.id('package_delivery_time_end')).$('option:checked').getText()).toBe('17:00');
        expect(deliveryCost.getAttribute('value')).toBe('10');
        expect(freeDeliveryThreshold.getAttribute('value')).toBe('150');
    });

    it('should revert the changes so other tests will pass', function() {
        packageDescription.clear().sendKeys('Yum');
        packageItems.get(2).clear();
        dietaryTypeGlutenFreeCheckbox.click();
        dietaryTypeDairyFreeCheckbox.click();
        eventTypeLunchCheckbox.click();
        eventTypeDinnerCheckbox.click();
        element(by.cssContainingText('#package_notice > option', '2 days')).click();
        // The delivery start time can't be reset to it's original (0600) because that isn't an
        // option in the time wheel anymore.
        element(by.cssContainingText('#package_delivery_time_end > option', '18:00')).click();
        deliveryCost.clear().sendKeys(15);
        freeDeliveryThreshold.clear().sendKeys(100);
        submitFormButton.click();
    });
});
