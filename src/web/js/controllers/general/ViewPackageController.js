angular.module('cp.controllers.general').controller('ViewPackageController',
        function($scope, $routeParams, PackagesFactory, NotificationService, DocumentTitleService,
        LoadingService, SecurityService, $sce, FRONTEND_BASE, OrdersFactory, $location,
        getPackageAvailabilityErrorTextFilter, CheckoutService, $filter, SearchService,
        ABTestService, dateIsBSTInEffectFilter, $window, GoogleAnalyticsService) {
    $scope.openLoginModal = false;
    $scope.isLoggedIn = SecurityService.isLoggedIn();

    // 'changeDeliveryLocationModalState' can be set to 'checking', 'available', 'notAvailable'.
    $scope.changeDeliveryLocationModalState = undefined;
    $scope.isChangeDeliveryLocationModalOpen = false;
    $scope.isDatePickerOpen = false;
    $scope.minDate = new Date();
    $scope.packageDeliveryTimeOptions = [];
    $scope.packageHeadCountOptions = [];
    $scope.reviewsLimit = 3;

    $scope.order = {};

    const humanId = Number($routeParams.humanIdAndSlug.split('-')[0]);

    const loadReviews = (id) => {
        PackagesFactory.getPackageReviews(id)
            .success(response => {
                $scope.reviews = response.reviews.filter(review => review.review);
                $scope.reviewsSummary = response.summary;
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    const loadSimilarPackages = (id) => {
        PackagesFactory.getSimilarPackages(id)
            .success(response => {
                $scope.otherPackagesBySameVendor = response.otherPackagesBySameVendor;
                $scope.similarPackagesByDifferentVendors = response.similarPackagesByDifferentVendors;
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };

    const recalculateCostAmounts = () => {
        if (!$scope.package) {
            return;
        }

        if ($scope.order.headCount === undefined) {
            $scope.order.headCount = $scope.package.minPeople;
        }

        $scope.order.subTotalAmount = $scope.package.costIncludingVat * $scope.order.headCount;

        if ($scope.order.subTotalAmount >= $scope.package.freeDeliveryThreshold) {
            $scope.order.deliveryCost = 0;
        } else {
            $scope.order.deliveryCost = $scope.package.deliveryCostIncludingVat;
        }

        $scope.order.totalAmount = $scope.order.subTotalAmount + $scope.order.deliveryCost;
    };

    PackagesFactory.getPackageByHumanId(humanId)
        .success(response => {
            $scope.package = response;

            if ($scope.package.recycled || !$scope.package.approved || !$scope.package.active) {
                $location.url('/package/deleted').replace();
                return;
            }

            for (let i = 0; i < $scope.package.dietaryRequirements.length; i++) {
                const dietaryRequirement = $scope.package.dietaryRequirements[i];
                if (dietaryRequirement.name === 'Vegetarian') {
                    $scope.vegetarianOption = dietaryRequirement;
                }
            }

            DocumentTitleService($scope.package.name);
            LoadingService.hide();

            loadReviews($scope.package.id);
            loadSimilarPackages($scope.package.id);

            $scope.facebookUrl = $sce.trustAsResourceUrl('//www.facebook.com/plugins/like.php?href=' + encodeURIComponent(FRONTEND_BASE) + '/package/' + $scope.package.id + '&width=90&height=21&colorscheme=light&layout=button_count&action=like&show_faces=false&send=false');
            $scope.twitterUrl = $sce.trustAsResourceUrl('https://platform.twitter.com/widgets/tweet_button.html?via=CityPantry&text=' + encodeURIComponent($scope.package.name + ' by ' + $scope.package.vendor.name));

            $scope.packageDeliveryTimeOptions = PackagesFactory.getPackageDeliveryTimeOptions($scope.package.deliveryTimeStart, $scope.package.deliveryTimeEnd);
            $scope.packageHeadCountOptions = OrdersFactory.getHeadCountOptions($scope.package.maxPeople, $scope.package.minPeople);

            // Only show active event types.
            $scope.package.eventTypes = $scope.package.eventTypes.filter(eventType => eventType.isActive);

            $scope.order.date = SearchService.getDeliveryDate();
            if ($scope.order.date) {
                $scope.pickedDate = $filter('date')($scope.order.date, 'dd/MM/yyyy');
            }

            $scope.order.headCount = SearchService.getHeadCount();
            $scope.order.postcode = SearchService.getPostcode();
            $scope.order.time = SearchService.getDeliveryTime();

            SearchService.setLastPackageSelected($scope.package.id);

            recalculateCostAmounts();

            GoogleAnalyticsService.trackPackageView($scope.package);
        })
        .catch(response => NotificationService.notifyError(response.data.errorTranslation));

    let allDietaryRequirements;

    PackagesFactory.getDietaryTypes()
        .success(response => allDietaryRequirements = response.dietaryRequirements)
        .catch(response => NotificationService.notifyError(response.data.errorTranslation));

    /**
     * Get the path to an icon for the given dietary requirement.
     *
     * If the dietary requirements haven't loaded yet, or the given dietary requirment has an unknown
     * icon, returns false.
     */
    $scope.getDietaryRequirementIcon = (toGetIconFor) => {
        if (!allDietaryRequirements) {
            return false;
        }
        for (let i = 0; i < allDietaryRequirements.length; i++) {
            if (allDietaryRequirements[i].name === toGetIconFor.name) {
                return allDietaryRequirements[i].icon;
            }
        }
        return false;
    };

    $scope.openDatePicker = function($event) {
        // Need to call these, otherwise the popup won't open (a click outside
        // of the popup closes it).
        $event.preventDefault();
        $event.stopPropagation();

        $scope.isDatePickerOpen = true;
    };

    $scope.$watch('pickedDate', (date, oldDate) => {
        if (typeof date === 'undefined') {
            return;
        }
        if (date === oldDate) {
            return;
        }

        if (date === null) {
            $scope.order.date = undefined;
        } else {
            // The date will be a string if the URL param "date" is present.
            if (typeof date === 'string') {
                const bits = date.split(/\D/);
                $scope.order.date = new Date(bits[2], bits[1] - 1, bits[0]);
            } else {
                $scope.order.date = date;
            }
        }
    });

    $scope.$watch('order.headCount', (newValue, oldValue) => {
        if (newValue === oldValue) {
            return;
        }
        recalculateCostAmounts();
    });

    $scope.changeDeliveryLocation = function(changeDeliveryLocationForm) {
        if (!changeDeliveryLocationForm.$valid) {
            changeDeliveryLocationForm.$submitted = true;
            return;
        }

        $scope.changeDeliveryLocationModalState = 'checking';

        PackagesFactory.checkIfPackageCanBeDeliveredToPostcode($scope.package.id, $scope.newPostcode)
            .success(response => {
                if (response.details.isPostcodeOk) {
                    $scope.order.postcode = $scope.newPostcode;
                    $scope.newPostcode = undefined;
                    $scope.changeDeliveryLocationModalState = 'available';
                } else {
                    $scope.changeDeliveryLocationModalState = 'notAvailable';
                }
            });
    };

    $scope.changeDeliveryLocationAndGoToSearch = function() {
        if (!$scope.newPostcode) {
            return;
        }

        $location.path('/search').query('postcode', $scope.newPostcode);
    };

    $scope.closeChangeDeliveryLocationModal = function() {
        $scope.newPostcode = '';
        $scope.changeDeliveryLocationModalState = undefined;
        $scope.isChangeDeliveryLocationModalOpen = false;
    };

    $scope.order = function() {
        if (!$scope.packageForm.$valid) {
            $scope.packageForm.$submitted = true;
            return;
        }

        LoadingService.show();

        $scope.packageFormError = null;

        const timeHour = Math.floor(parseInt($scope.order.time, 10) / 100);
        const timeMinute = Math.floor(parseInt($scope.order.time, 10) % 100);

        const dateToCheckIfInBst = new Date($scope.order.date.getTime());
        dateToCheckIfInBst.setHours(timeHour);
        dateToCheckIfInBst.setMinutes(timeMinute);
        const isBst = dateIsBSTInEffectFilter(dateToCheckIfInBst);

        $scope.iso8601DateString = (
            $scope.order.date.getFullYear() + '-' +
            ('0' + ($scope.order.date.getMonth() + 1)).substr(-2) + '-' +
            ('0' + $scope.order.date.getDate()).substr(-2) +
            'T' +
            ('0' + timeHour).substr(-2) + ':' +
            ('0' + timeMinute).substr(-2) + ':' +
            '00' +
            (isBst ? '+01:00' : '+00:00')
        );
        const dateTime = new Date(parseIso8601($scope.iso8601DateString));

        // Format the date as YYYY-MM-DD because that is the format expected by the availability API.
        const date = $scope.iso8601DateString.substr(0, 10);

        PackagesFactory.checkIfPackageCanBeDelivered($scope.package.id, date, $scope.order.time, $scope.order.postcode, $scope.order.headCount)
            .success(response => {
                if (response.isAvailable) {
                    CheckoutService.setPackageId($scope.package.id);
                    CheckoutService.setPostcode($scope.order.postcode);
                    CheckoutService.setDeliveryDate(dateTime);
                    CheckoutService.setHeadCount($scope.order.headCount);
                    CheckoutService.setSubTotalAmount($scope.order.subTotalAmount);
                    CheckoutService.setDeliveryCost($scope.order.deliveryCost);
                    CheckoutService.setTotalAmount($scope.order.totalAmount);
                    CheckoutService.setStartTime(new Date());

                    if (!$scope.isLoggedIn) {
                        $scope.openLoginModal = true;
                        SecurityService.urlToForwardToAfterLogin = '/checkout/catering-details';
                        return;
                    }

                    $location.path('/checkout/catering-details');
                } else {
                    $scope.packageFormError = getPackageAvailabilityErrorTextFilter(response.details);
                }

                LoadingService.hide();
            });
    };
});
