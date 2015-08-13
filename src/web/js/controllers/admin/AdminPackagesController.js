angular.module('cp.controllers.admin').controller('AdminPackagesController',
        function($scope, PackagesFactory, getActiveAndApprovedStatusTextFilter, $window, NotificationService, DocumentTitleService, SecurityService, LoadingService) {
    DocumentTitleService('Packages');
    SecurityService.requireStaff();

    var vm = this;

    vm.gridOptions = {
        columnDefs: [
            {
                displayName: 'ID',
                field: 'humanId'
            },
            {
                displayName: 'Name',
                field: 'name'
            },
            {
                displayName: 'Food Type',
                field: 'cuisineType.name'
            },
            {
                displayName: 'Vendor',
                field: 'vendor.name',
                cellTemplate: `
                    <div class="ui-grid-cell-contents">
                        <a href="/admin/vendor/{{row.entity.vendor.id}}">{{row.entity.vendor.name}}</a>
                    </div>
                `
            },
            {
                cellFilter: 'currency:\'£\':2',
                displayName: 'Cost (inc. VAT)',
                field: 'totalGrossFoodCost'
            },
            {
                displayName: 'Min People',
                field: 'minPeople'
            },
            {
                displayName: 'Max People',
                field: 'maxPeople'
            },
            {
                displayName: 'Status',
                field: 'status'
            },
            {
                cellTemplate: `<div class="ui-grid-cell-contents">
                    <a href="/admin/package/{{row.entity[col.field]}}">Edit</a>
                    <br />
                    <a ng-click="grid.appScope.delete(row.entity[col.field])">Delete</a>
                    <br />
                    <a href="/package/{{row.entity.humanId}}">View</a>
                    <br />
                    <a ng-if="!row.entity.approved" ng-click="grid.appScope.approve(row.entity[col.field])"
                        class="approve-package">Approve</a>
                    </div>`,
                displayName: 'Action',
                field: 'id',
                name: ' ',
                enableFiltering: false
            }
        ],
        enableFiltering: true,
        enableSorting: true,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 25,
        rowHeight: 80
    };

    function loadPackages() {
        PackagesFactory.getAllPackages().success(response => {
            angular.forEach(response.packages, row => {
                // There is no `isActive` field for packages, so pass `true`.
                row.status = getActiveAndApprovedStatusTextFilter(true, row.isApproved);
            });

            vm.gridOptions.data = response.packages;

            LoadingService.hide();
        }).error(() => NotificationService.notifyError());
    }

    loadPackages();

    $scope.delete = function(id) {
        const confirmed = $window.confirm('Are you sure?');
        if (confirmed) {
            LoadingService.show();
            PackagesFactory.deletePackage(id)
                .then(loadPackages)
                .catch(response => NotificationService.notifyError(response.data.errorTranslation));
        }
    };

    $scope.approve = function(id) {
        PackagesFactory.approvePackage(id)
            .success(loadPackages)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };
});
