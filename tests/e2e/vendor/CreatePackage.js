describe('Vendor portal - create package', function() {
    var notificationModal = require('../NotificationModal.js');
    var isFirst = true;
    var submitFormButton;

    beforeEach(function() {
        if (isFirst) {
            loginAsUser('vendor@bunnies.test');
            browser.get('/vendor/create-package');
            isFirst = false;
        }

        submitFormButton = element(by.css('main input.btn.btn-primary'));
    });

    it('should load the "Create package" page', function() {
        expect(element(by.css('h2.cp-heading')).getText()).toBe('CREATE PACKAGE');
    });

    it('should load select options and checkboxes', function() {
        // Cuisine types.
        expect(element.all(by.css('#package_cuisine_type > option')).count()).toBe(32); // 12 options + default option = 13.
        expect(element.all(by.css('#package_cuisine_type > option')).get(1).getText()).toBe('American');

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

    it('should show 4 package item textboxes', function() {
        expect(element.all(by.css('input[name="packageItems[]"]')).count()).toBe(4);
    });

    it('should be able to add a package item textbox', function() {
        element(by.css('a[ng-click="addPackageItem()"]')).click();
        expect(element.all(by.css('input[name="packageItems[]"]')).count()).toBe(5);
    });

    it('should show/hide a notes textbox on check/uncheck of a dietary type', function() {
        var dietaryTypeCheckbox = element.all(by.css('input[name="packageDietaryTypes[]"]')).get(0);
        var dietaryTypeNotes = element.all(by.css('input[name="packageDietaryTypeNotes[]"]')).get(0);

        expect(dietaryTypeNotes.isDisplayed()).toBe(false);
        dietaryTypeCheckbox.click();
        expect(dietaryTypeNotes.isDisplayed()).toBe(true);

        // Revert the changes so other tests will pass.
        dietaryTypeCheckbox.click();
    });

    it('should have packaging type options', function() {
        var packagingType = element(by.model('package.packagingType'));

        expect(packagingType.all(by.css('option')).count()).toBe(6);

        packagingType.element(by.cssContainingText('option', 'Either')).click();

        // The empty option should have been removed.
        expect(packagingType.all(by.css('option')).count()).toBe(5);
    });

    it('should load the vendor\'s addresses', function() {
        var addresses = element.all(by.repeater('vendorAddress in vendor.addresses'));
        expect(addresses.count()).toBe(1);
        expect(addresses.get(0).getText()).toContain('Shepherds Bush Road, London, W6, United Kingdom');

        var isSelectedCheckboxes = element.all(by.css('input[name="vendorAddressIsSelected[]"]'));
        expect(isSelectedCheckboxes.get(0).isSelected()).toBe(false);
    });

    it('should be able to add an address', function() {
        var addAddressButton = element(by.css('button.cp-add-vendor-address'));
        expect(addAddressButton.getText()).toBe('ADD ANOTHER ADDRESS');
        addAddressButton.click();

        element(by.model('newAddress.addressLine1')).sendKeys('Francis House');
        element(by.model('newAddress.addressLine2')).sendKeys('11 Francis Street');
        element(by.model('newAddress.addressLine3')).sendKeys('Westminster');
        element(by.model('newAddress.city')).sendKeys('London');
        element(by.model('newAddress.postcode')).sendKeys('SW1P 1DE');
        element(by.model('newAddress.landlineNumber')).sendKeys('020 3397 8376');
        element(by.model('newAddress.orderNotificationMobileNumbersCommaSeparated')).sendKeys('07861795252');
        element(by.model('newAddress.contactName')).sendKeys('Stu');

        element(by.css('button[ng-click="addAddress()"]')).click();

        var addresses = element.all(by.repeater('vendorAddress in vendor.addresses'));
        expect(addresses.count()).toBe(2);
        expect(addresses.get(1).getText()).toContain('Francis House, 11 Francis Street, Westminster, London, SW1P 1DE, United Kingdom');
    });

    it('should set default values for the new address', function() {
        // Address is selected.
        expect(element.all(by.css('input[name="vendorAddressIsSelected[]"]')).get(1).isSelected()).toBe(true);

        // Delivery radius is 2 miles.
        expect(element(by.css('select[id="delivery_radius2"] > option:nth-child(2)')).isSelected()).toBe(true);
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

    it('should show an error if 0 delivery addresses are selected', function() {
        var secondAddressCheckbox = element.all(by.css('input[name="vendorAddressIsSelected[]"]')).get(1);
        secondAddressCheckbox.click();

        submitFormButton.click();

        notificationModal.expectIsOpenWithErrorMessage(/There are some fields/);
        notificationModal.dismiss();

        var deliveryAddressError = element.all(by.css('legend[id="package_delivery_addresses"] > .form-element-invalid')).get(0);
        expect(deliveryAddressError.getText()).toBe('(Please specify at least one delivery address.)');
        expect(deliveryAddressError.isDisplayed()).toBe(true);

        // Revert the changes so other tests will pass.
        secondAddressCheckbox.click();
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
        minPeopleOptions.get(9).click(); // 10 people.
        maxPeopleOptions.get(33).click(); // 50 people.
    });

    it('should show the "cost to set up after delivery" only if the vendor can set up after delivery', function() {
        var checkbox = element(by.model('package.canSetUpAfterDelivery'));
        var cost = element(by.model('package.costToSetUpAfterDelivery'));

        expect(checkbox.isSelected()).toBe(false);
        expect(cost.isPresent()).toBe(false);

        checkbox.click();

        expect(cost.isPresent()).toBe(true);

        checkbox.click();

        expect(cost.isPresent()).toBe(false);
    });

    it('should show the "cost to clean up after delivery" only if the vendor can clean up after delivery', function() {
        var checkbox = element(by.model('package.canCleanUpAfterDelivery'));
        var cost = element(by.model('package.costToCleanUpAfterDelivery'));

        expect(checkbox.isSelected()).toBe(false);
        expect(cost.isPresent()).toBe(false);

        checkbox.click();

        expect(cost.isPresent()).toBe(true);

        checkbox.click();

        expect(cost.isPresent()).toBe(false);
    });

    it('should be able to save the details', function() {
        var packageItems = element.all(by.css('input[name="packageItems[]"]'));

        element(by.model('package.cuisineType')).sendKeys('British');
        element(by.model('package.name')).sendKeys('Fish cake');
        element(by.model('package.description')).sendKeys('Consisting of leftover fish and cold potatoes.');
        packageItems.get(0).sendKeys('Fish');
        packageItems.get(1).sendKeys('Cake');
        element.all(by.css('input[name="packageDietaryTypes[]"]')).get(0).click();
        element.all(by.css('input[name="packageAllergenTypes[]"]')).get(0).click();
        element.all(by.css('input[name="packageEventTypes[]"]')).get(0).click();
        element.all(by.css('input[name="packageHotFood"]')).get(0).click();

        element(by.model('package.standardRatedFoodNetCost')).clear().sendKeys(1.30);
        element(by.model('package.zeroRatedFoodNetCost')).clear().sendKeys(0);

        element(by.model('package.notice')).sendKeys(1);
        element.all(by.css('input[name="packageDeliveryDays[]"]')).get(0).click();
        element(by.model('package.deliveryCostIncludingVat')).sendKeys(15);
        element(by.model('package.freeDeliveryThreshold')).sendKeys(100);

        element(by.model('package.canCleanUpAfterDelivery')).click();
        element(by.model('package.costToCleanUpAfterDelivery')).sendKeys('12.50');

        submitFormButton.click();
    });

    it('should notify the user that the package has been created', function() {
        notificationModal.expectIsOpenWithSuccessMessage('Your package has been created.');
        notificationModal.dismiss();
    });

    it('should redirect to the packages page', function() {
        expect(browser.getCurrentUrl()).toMatch(/citypantry\.dev\/vendor\/packages/);
    });
});
