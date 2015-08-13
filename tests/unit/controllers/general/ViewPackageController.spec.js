describe('ViewPackageController', function() {
    'use strict';

    var scope;
    var makeCtrl;
    var PackagesFactory;
    var CheckoutService;
    var LoadingService;
    var $httpBackend;
    var $routeParams;

    beforeEach(function() {
        module('cp');
    });

    beforeEach(inject(function($controller, $rootScope, _$routeParams_, _CheckoutService_,
            _PackagesFactory_, _LoadingService_, _$httpBackend_) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        CheckoutService = _CheckoutService_;
        PackagesFactory = _PackagesFactory_;
        LoadingService = _LoadingService_;
        $routeParams = _$routeParams_;
        $routeParams.humanIdAndSlug = '123';

        makeCtrl = function () {
            $controller('ViewPackageController', {
                $scope: scope,
            });
        };

        spyOn(PackagesFactory, 'getPackageByHumanId').and.callThrough();
        spyOn(PackagesFactory, 'getPackageReviews').and.callThrough();
        spyOn(PackagesFactory, 'getDietaryTypes').and.returnValue(newPromise());
        spyOn(PackagesFactory, 'getSimilarPackages').and.returnValue(newPromise());
    }));

    it('should not display empty reviews', function() {
        makeCtrl();

        $httpBackend.expectGET('api.mock.dev/packages/123').respond(
            200,
            {
                id: 'abc123',
                isDeleted: false,
                isApproved: true,
                dietaryRequirements: 'cheese',
                vendor: {
                    name: 'Bob',
                },
                eventTypes: [
                    {
                        isActive: true,
                    },
                ],
            }
        );

        $httpBackend.expectGET('api.mock.dev/reviews/package/abc123').respond(
            200,
            {
                reviews: [
                    {
                        review: 'Good.',
                    },
                    {
                        review: '',
                    },
                    {
                        review: 'Great.',
                    },
                    {
                        review: 'Excellent.',
                    },
                ]
            }
        );

        $httpBackend.flush();
        expect(PackagesFactory.getPackageByHumanId).toHaveBeenCalled();
        expect(PackagesFactory.getPackageReviews).toHaveBeenCalled();

        expect(scope.reviews.length).toBe(3);
    });

    describe('should convert a date/time to an ISO 8601 string, a date string, and a time string', function() {
        var checkPromise;

        beforeEach(function() {
            checkPromise = newPromise();
            spyOn(PackagesFactory, 'checkIfPackageCanBeDelivered').and.returnValue(checkPromise);
            spyOn(CheckoutService, 'setDeliveryDate');
            spyOn(LoadingService, 'show');
            spyOn(LoadingService, 'hide');
            scope.package = {
                id: 'abcdef',
            };
            scope.packageForm = newValidForm();
            makeCtrl();
        });

        it('with a date/time outside British Summer Time', function() {
            scope.order.date = new Date(Date.UTC(2005, 1, 2));
            scope.order.time = '0300';

            scope.order();

            var args = PackagesFactory.checkIfPackageCanBeDelivered.calls.mostRecent().args;
            expect(args[1]).toEqual('2005-02-02');
            expect(args[2]).toEqual('0300');
            expect(scope.iso8601DateString).toBe('2005-02-02T03:00:00+00:00');

            checkPromise.resolveSuccess({isAvailable: true});

            var persistArgs = CheckoutService.setDeliveryDate.calls.mostRecent().args;
            expect(persistArgs[0].getTime()).toEqual(Date.UTC(2005, 1, 2, 3, 0, 0));
        });

        it('with a date/time inside British Summer Time', function() {
            scope.order.date = new Date(Date.UTC(2005, 2, 27));
            scope.order.time = '0300';

            scope.order();

            var checkArgs = PackagesFactory.checkIfPackageCanBeDelivered.calls.mostRecent().args;
            expect(checkArgs[1]).toEqual('2005-03-27');
            expect(checkArgs[2]).toEqual('0300');
            expect(scope.iso8601DateString).toBe('2005-03-27T03:00:00+01:00');

            checkPromise.resolveSuccess({isAvailable: true});

            var persistArgs = CheckoutService.setDeliveryDate.calls.mostRecent().args;
            expect(persistArgs[0].getTime()).toEqual(Date.UTC(2005, 2, 27, 2, 0, 0));
        });
    });
});
