angular.module('cp.controllers.admin').controller('AdminEditDeliveryRadiiController',
        function ($scope, $q, AddressFactory, PackagesFactory, LoadingService, DocumentTitleService,
        NotificationService, SecurityService) {
    DocumentTitleService('Package delivery radii');
    SecurityService.requireStaff();

    PackagesFactory.getAllPackages()
        .success(response => {
            $scope.packages = response.packages;
            $scope.packages.sort((a, b) => a.name.localeCompare(b.name));
            $scope.packages.forEach((p) => p.isFullyActive = p.isApproved && !p.isDeleted);
            LoadingService.hide();
        })
        .catch(response => NotificationService.notifyError(response.data.errorTranslation));

    $scope.save = function() {
        LoadingService.show();

        const savePromises = [];

        $scope.packages.forEach(p => {
            if (!p.hasChanged) {
                return;
            }

            // Filter down to just the addresses with a radius set, removing any addresses without
            // a radius.
            const deliveryRadiuses = {};
            for (let addressId in p.deliveryRadiuses) {
                const radius = p.deliveryRadiuses[addressId];
                if (Number(radius) > 0) {
                    deliveryRadiuses[addressId] = radius;
                }
            }

            const savePromise = PackagesFactory.updatePackage(p.id, {deliveryRadiuses: deliveryRadiuses});
            savePromise.catch(response => NotificationService.notifyError(response.data.errorTranslation));
            savePromises.push(savePromise);
        });

        $q.all(savePromises).then(() => {
            NotificationService.notifySuccess('Your delivery radiuses have been saved.');
            LoadingService.hide();
        });
    };
});
