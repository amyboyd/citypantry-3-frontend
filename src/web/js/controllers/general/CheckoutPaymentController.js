angular.module('cp.controllers.general').controller('CheckoutPaymentController',
        function($scope, DocumentTitleService, SecurityService, LoadingService, PackagesFactory,
        CheckoutService, $location, UsersFactory, $q, NotificationService, OrdersFactory,
        getCardNumberMaskFilter, PromoCodeFactory, getPromoCodeErrorTextFilter,
        GoogleAnalyticsService) {
    DocumentTitleService('Checkout: Payment');
    SecurityService.requireLoggedIn();

    $scope.order = {
        isPayOnAccount: false,
        packageId: CheckoutService.getPackageId(),
        totalAmount: CheckoutService.getTotalAmount()
    };

    $scope.cards = [];
    $scope.card = {};
    $scope.isAmericanExpressVisible = true;
    $scope.isCardExpiryDateVisible = false;
    $scope.isMaestroVisible = true;
    $scope.isMastercardVisible = true;
    $scope.isVisaVisible = true;
    $scope.package = {};
    $scope.user = {};

    const thisYear = (new Date()).getFullYear();
    $scope.yearOptions = [];
    for (let year = thisYear; year < thisYear + 10; year += 1) {
        $scope.yearOptions.push({label: year, value: year});
    }

    $scope.monthOptions = [];
    for (let month = 1; month <= 12; month += 1) {
        $scope.monthOptions.push({label: ('0' + month).slice(-2), value: ('0' + month).slice(-2)});
    }

    function init() {
        const promise1 = PackagesFactory.getPackage($scope.order.packageId)
            .success(response => {
                $scope.package = response;
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));

        const promise2 = UsersFactory.getPaymentCards()
            .success(response => {
                $scope.cards = response.cards;
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));

        const promise3 = UsersFactory.getLoggedInUser()
            .success(response => {
                $scope.user = response;
            })
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));

        $q.all([promise1, promise2, promise3]).then(() => {
            $scope.cards.forEach(card => card.numberMasked = getCardNumberMaskFilter(card.last4, card.type));

            if ($scope.cards.length > 0) {
                $scope.order.paymentMethod = $scope.cards[0];
            }

            if ($scope.user.customer.isPaidOnAccount) {
                $scope.order.isPayOnAccount = true;
            }

            LoadingService.hide();
        });
    }

    init();

    $scope.$watch('order.paymentMethod', (paymentMethod, oldPaymentMethod) => {
        if (paymentMethod === oldPaymentMethod) {
            return;
        }

        if (!paymentMethod) {
            $scope.isAmericanExpressVisible = true;
            $scope.isMaestroVisible = true;
            $scope.isMastercardVisible = true;
            $scope.isVisaVisible = true;
            $scope.isCardExpiryDateVisible = false;
        } else {
            $scope.isAmericanExpressVisible = false;
            $scope.isMaestroVisible = false;
            $scope.isMastercardVisible = false;
            $scope.isVisaVisible = false;
            $scope.isCardExpiryDateVisible = true;

            switch (paymentMethod.type) {
                case 'American Express':
                    $scope.isAmericanExpressVisible = true;
                    break;
                case 'Maestro':
                    $scope.isMaestroVisible = true;
                    break;
                case 'MasterCard':
                    $scope.isMastercardVisible = true;
                    break;
                case 'Visa':
                    $scope.isVisaVisible = true;
                    break;
            }
        }
    });

    function recalculateCostAmounts() {
        if (!$scope.order.promoCode) {
            return;
        }

        const totalAmountBeforePromoCode = $scope.order.totalAmount;

        if ($scope.order.promoCode.type === 'percentage') {
            $scope.order.totalAmount = $scope.order.totalAmount - ($scope.order.totalAmount * ($scope.order.promoCode.discount / 100));
            $scope.order.promoCodeValue = totalAmountBeforePromoCode - $scope.order.totalAmount;
        } else if ($scope.order.promoCode.type === 'fixed') {
            if ($scope.order.totalAmount <= $scope.order.promoCode.discount) {
                $scope.order.totalAmount = 0;
                $scope.order.promoCodeValue = totalAmountBeforePromoCode;
            } else {
                $scope.order.totalAmount = $scope.order.totalAmount - $scope.order.promoCode.discount;
                $scope.order.promoCodeValue = $scope.order.promoCode.discount;
            }
        }

        CheckoutService.setTotalAmount($scope.order.totalAmount);
    }

    function showPromoCodeError(errorMessage) {
        $scope.promoCodeError = errorMessage;
        LoadingService.hide();
    }

    $scope.submitPromoCode = function() {
        if (!$scope.order.promoCodeCode) {
            return;
        }

        LoadingService.show();

        $scope.promoCodeError = null;

        PromoCodeFactory.getPromoCodeByCode($scope.order.promoCodeCode)
            .success(response => {
                if (!response.isValid) {
                    showPromoCodeError(getPromoCodeErrorTextFilter($scope.order.promoCodeCode.toUpperCase()));
                    return;
                }

                $scope.order.promoCode = response.promoCode;
                recalculateCostAmounts();
                $scope.isPromoCodeValid = true;
                $scope.isPromoCodeVisible = false;
                CheckoutService.setPromoCodeId($scope.order.promoCode.id);
                LoadingService.hide();
            })
            .catch(response => showPromoCodeError(response.data.errorTranslation));
    };

    $scope.finish = function() {
        if ($scope.checkoutForm.$invalid) {
            $scope.checkoutForm.$submitted = true;
            return;
        }

        LoadingService.show();

        const orderDetails = {
            deliveryAddress: CheckoutService.getDeliveryAddressId(),
            headCount: CheckoutService.getHeadCount(),
            package: CheckoutService.getPackageId(),
            packagingTypeChoice: CheckoutService.getPackagingType(),
            promotion: CheckoutService.getPromoCodeId(),
            requestedDeliveryDate: CheckoutService.getDeliveryDate().toISOString(),
            // The object `dietaryRequirements` must be in a structure that the API's
            // `DietaryRequirementService::createDietaryRequirementCollectionFromArray()` expects.
            dietaryRequirements: {
                customInstructions: CheckoutService.getDietaryRequirementsExtra(),
                vegetarians: CheckoutService.getVegetarianHeadCount()
            },
            willVendorDeliverCutleryAndServiettes: CheckoutService.isCutleryAndServiettesRequired(),
            willVendorCleanUpAfterDelivery: CheckoutService.isVendorRequiredToCleanUp(),
            willVendorSetUpAfterDelivery: CheckoutService.isVendorRequiredToSetUp()
        };

        const promises = [];

        if ($scope.order.isPayOnAccount) {
            orderDetails.payOnAccount = true;
            orderDetails.purchaseOrderNumber = $scope.order.purchaseOrderNumber;
            orderDetails.departmentReference = $scope.order.departmentReference;
        } else {
            if (!$scope.order.paymentMethod) {
                const promise1 = UsersFactory.addPaymentCard($scope.card)
                    .success(response => {
                        orderDetails.payOnCard = response.card.id;
                    })
                    .catch(response => NotificationService.notifyError(response.data.errorTranslation));
                promises.push(promise1);
            } else {
                orderDetails.payOnCard = $scope.order.paymentMethod.id;
            }
        }

        $q.all(promises).then(() => {
            OrdersFactory.createOrder(orderDetails)
                .success(response => {
                    CheckoutService.setEndTime(new Date());
                    CheckoutService.reset();
                    CheckoutService.setLastCreatedOrder(response.updatedObject);

                    GoogleAnalyticsService.trackNewOrder(response.updatedObject);

                    $location.path('/checkout/thank-you');
                })
                .catch(response => NotificationService.notifyError(response.data.errorTranslation));
        });
    };
});
