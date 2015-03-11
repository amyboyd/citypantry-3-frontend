angular.module('cp').directive('cpAddressForm', function() {
    return {
        restrict: 'E',
        scope: {
            address: '=',
            userType: '=',
        },
        templateUrl: '/dist/templates/directives/cp-address-form.html',
        controller: function($scope, $location, AddressFactory, NotificationService, LoadingService) {
            if ($scope.userType !== 'vendor' && $scope.userType !== 'customer') {
                throw new Error('userType must be vendor or customer');
            }

            let isNew = !$scope.address.id;

            $scope.address.label = $scope.address.addressLine1;

            $scope.save = function() {
                if ($scope.form.$invalid) {
                    $scope.form.$submitted = true;
                    return;
                }

                LoadingService.show();

                let promise;
                if (isNew) {
                    promise = AddressFactory.createAddress($scope.address);
                    isNew = false;
                } else {
                    promise = AddressFactory.updateAddress($scope.address.id, $scope.address);
                }

                promise.then(function() {
                    NotificationService.notifySuccess('Address saved');
                    const redirectTo = '/' + $scope.userType + '/addresses';
                    $location.path(redirectTo);
                });
            };
        }
    };
});