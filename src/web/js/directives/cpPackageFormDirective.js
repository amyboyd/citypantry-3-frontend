angular.module('cp').directive('cpPackageForm', function($anchorScroll, $cookies, $location, $q,
        $window, LoadingService, AddressFactory, PackagesFactory, VendorsFactory, uiGmapGoogleMapApi,
        MAP_CENTER, NotificationService, SecurityService) {
    return {
        restrict: 'E',
        scope: {
            destination: '@cpDestination',
            operation: '@cpOperation',
            package: '=cpPackage',
            submitValue: '@cpSubmitValue'
        },
        controller: function($scope) {
            $scope.address = {countryName: 'United Kingdom'};
            $scope.allergenTypeOptions = [];
            $scope.cuisineTypeOptions = [];
            $scope.deliveryDayOptions = PackagesFactory.getDeliveryDayOptions();
            $scope.deliveryTimeOptions = PackagesFactory.getDeliveryTimeOptions();
            $scope.deliveryZones = [];
            $scope.dietaryTypeOptions = [];
            $scope.eventTypeOptions = [];
            $scope.isAddAddressFormOpen = false;
            $scope.map = {};
            $scope.noticeOptions = PackagesFactory.getNoticeOptions();
            $scope.quantityOptions = PackagesFactory.getQuantityOptions();
            $scope.radiusOptions = PackagesFactory.getRadiusOptions();
            $scope.vendor = {};

            function init() {
                SecurityService.getVendor().then(vendor => {
                    $scope.vendor = vendor;
                });

                let promise1 = PackagesFactory.getAllergenTypes().success(response => {
                    $scope.allergenTypeOptions = response.allergenTypes;
                });
                let promise2 = PackagesFactory.getDietaryTypes().success(response => {
                    var dietaryTypes = response.dietaryRequirements;

                    dietaryTypes.forEach(dietaryType => {
                        $scope.dietaryTypeOptions.push({
                            name: dietaryType.name,
                            notes: ''
                        });
                    });
                });
                let promise3 = PackagesFactory.getEventTypes().success(response => {
                    $scope.eventTypeOptions = response.eventTypes;
                });
                let promise4 = PackagesFactory.getCuisineTypes().success(response => {
                    $scope.cuisineTypeOptions = response.cuisineTypes;
                });

                $q.all([promise1, promise2, promise3, promise4]).then(() => {
                    $scope.setDefaultValuesForAddresses();
                    $scope.createDeliveryZones();
                    LoadingService.hide();
                });
            }

            init();

            uiGmapGoogleMapApi.then(function(maps) {
                $scope.map = {
                    center: MAP_CENTER,
                    options: {
                        scrollwheel: false
                    },
                    zoom: 12
                };
            });

            $scope.addAddress = function() {
                if (!$scope.addAddressForm.$valid) {
                    return;
                }

                LoadingService.show();

                const addressDetails = {
                    addressLine1: $scope.address.addressLine1,
                    addressLine2: $scope.address.addressLine2 ? $scope.address.addressLine2 : null,
                    addressLine3: $scope.address.addressLine3 ? $scope.address.addressLine3 : null,
                    city: $scope.address.city,
                    county: $scope.address.county ? $scope.address.county : null,
                    postcode: $scope.address.postcode,
                    countryName: $scope.address.countryName,
                    landlineNumber: $scope.address.landlineNumber,
                    orderNotificationMobileNumber: $scope.address.orderNotificationMobileNumber,
                    contactName: $scope.address.contactName
                };

                AddressFactory.createAddress(addressDetails)
                    .success(response => {
                        $scope.isAddAddressFormOpen = false;
                        $scope.address = {countryName: 'United Kingdom'}; // Reset address form fields.
                        $location.hash('addresses');
                        $anchorScroll();
                    })
                    .catch(response => {
                        $scope.addAddressError = response.data.errorTranslation;
                    });

                VendorsFactory.getAddresses().success(response => {
                    $scope.vendor.addresses = response.addresses;
                    $scope.setDefaultValuesForAddresses();
                    $scope.createDeliveryZones();
                    LoadingService.hide();
                });
            };

            $scope.addAnotherAddress = function() {
                $scope.isAddAddressFormOpen = true;
            };

            $scope.addPackageItem = function() {
                $scope.package.items.push('');
            };

            $scope.createDeliveryZones = function() {
                $scope.deliveryZones = [];

                $scope.vendor.addresses.forEach(function(address, index) {
                    $scope.deliveryZones.push({
                        id: index,
                        center: {
                            latitude: address.latitude,
                            longitude: address.longitude
                        },
                        fill: {
                            color: '#ff0000',
                            opacity: 0.3
                        },
                        radius: address.deliveryRadius * 1609.344, // Metres.
                        stroke: {
                            weight: 0
                        }
                    });
                });

                $scope.map.refresh = true;
            };

            $scope.setDefaultValuesForAddresses = function() {
                $scope.vendor.addresses.forEach(vendorAddress => {
                    if (!$scope.package.deliveryRadiuses || $scope.package.deliveryRadiuses.length === 0) {
                        vendorAddress.deliveryRadius = 2;
                        vendorAddress.isSelected = true;
                    }

                    for (let addressId in $scope.package.deliveryRadiuses) {
                        if (vendorAddress.id === addressId) {
                            vendorAddress.deliveryRadius = $scope.package.deliveryRadiuses[addressId];
                            vendorAddress.isSelected = true;
                        }
                    }
                });
            };

            $scope.hasAtLeastOneAddressSelected = function(addresses) {
                let result = false;

                addresses.forEach(address => {
                    if (address.isSelected) {
                        result = true;
                        return false;
                    }
                });

                return result;
            };

            $scope.isDietaryTypeSelected = function(dietaryType) {
                for (let i = 0; i < $scope.package.dietaryRequirements.length; i++) {
                    let dietaryRequirement = $scope.package.dietaryRequirements[i];

                    if (dietaryType.name === dietaryRequirement.name) {
                        dietaryType.notes = dietaryRequirement.notes;
                        $scope.package.dietaryRequirements.splice(i, 1, dietaryType);
                        return true;
                    }
                }

                return false;
            };

            $scope.submit = function() {
                if (!$scope.packageForm.$valid) {
                    $scope.packageForm.$submitted = true;
                    return;
                }

                LoadingService.show();

                $scope.packageFormError = null;

                let deliveryRadiuses = {};

                $scope.vendor.addresses.forEach(function(address) {
                    if (address.isSelected) {
                        deliveryRadiuses[address.id] = address.deliveryRadius;
                    }
                });

                const packageDetails = {
                    cuisineType: $scope.package.cuisineType.id,
                    name: $scope.package.name,
                    shortDescription: $scope.package.shortDescription ? $scope.package.shortDescription : null,
                    description: $scope.package.description,
                    items: ($scope.package.items.length > 0) ? $scope.package.items : [],
                    dietaryRequirements: ($scope.package.dietaryRequirements.length > 0) ? $scope.package.dietaryRequirements : [],
                    allergenTypes: ($scope.package.allergenTypes.length > 0) ? $scope.package.allergenTypes : [],
                    eventTypes: ($scope.package.eventTypes.length > 0) ? $scope.package.eventTypes : [],
                    hotFood: $scope.package.hotFood,
                    costIncludingVat: $scope.package.costIncludingVat,
                    deliveryRadiuses: deliveryRadiuses,
                    minPeople: $scope.package.minPeople,
                    maxPeople: $scope.package.maxPeople,
                    notice: $scope.package.notice,
                    deliveryDays: $scope.package.deliveryDays,
                    deliveryTimeStart: $scope.package.deliveryTimeStart,
                    deliveryTimeEnd: $scope.package.deliveryTimeEnd,
                    deliveryCostIncludingVat: $scope.package.deliveryCostIncludingVat,
                    freeDeliveryThreshold: $scope.package.freeDeliveryThreshold,
                    vendor: $scope.vendor.id
                };

                var packageArguments = [packageDetails];

                if ($scope.operation === 'update') {
                    packageArguments.unshift($scope.package.id);
                }

                PackagesFactory[$scope.operation + 'Package'].apply(this, packageArguments)
                    .success(response => {
                        LoadingService.hide();

                        let notificationMessage;

                        if ($scope.operation === 'create') {
                            notificationMessage = 'Your package has been created.';
                        } else if ($scope.operation === 'update') {
                            notificationMessage = 'Your package has been updated.';
                        }
                        NotificationService.notifySuccess(notificationMessage);

                        $location.path($scope.destination);
                    })
                    .catch(response => {
                        $scope.packageFormError = response.data.errorTranslation;
                        LoadingService.hide();
                    });
            };
        },
        templateUrl: '/dist/templates/vendor/vendor-package.html'
    };
});
