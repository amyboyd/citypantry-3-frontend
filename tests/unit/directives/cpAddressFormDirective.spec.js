describe('cpAddressForm directive controller', function() {
    'use strict';

    var scope;
    var makeCtrl;
    var AddressFactory;

    beforeEach(function () {
        module('cp');
    });

    beforeEach(inject(function ($controller, $rootScope, _AddressFactory_) {
        scope = $rootScope.$new();
        AddressFactory = _AddressFactory_;

        makeCtrl = function () {
            $controller('cpAddressFormController', {
                $scope: scope,
            });
        };

        scope.addressType = 'vendor'
        scope.address = {};
        scope.form = {};
    }));

    describe('for vendor addresses', function() {
        beforeEach(function() {
            scope.addressType = 'vendor';
        });

        it('should create a default empty array of mobile numbers if the address has none', function() {
            scope.address.orderNotificationMobileNumbers = undefined;
            makeCtrl();

            expect(scope.address.orderNotificationMobileNumbers)
                .toEqual([]);
            expect(scope.address.orderNotificationMobileNumbersCommaSeparated)
                .toEqual('');
        });

        it('should create a comma-separated string of order notification mobile numbers when loading', function() {
            scope.address.orderNotificationMobileNumbers = ['07123', '07456'];
            makeCtrl();

            expect(scope.address.orderNotificationMobileNumbersCommaSeparated)
                .toBe('07123, 07456');
        });

        it('should create an array of order notification mobile numbers when saving', function() {
            makeCtrl();
            scope.address.orderNotificationMobileNumbersCommaSeparated = '07123, 07456  ,  07789';

            scope.form.$invalid = false;
            scope.save();

            expect(scope.address.orderNotificationMobileNumbers)
                .toEqual(['07123', '07456', '07789']);
        });
    });
});
