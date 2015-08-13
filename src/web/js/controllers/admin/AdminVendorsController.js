angular.module('cp.controllers.admin').controller('AdminVendorsController',
        function($scope, VendorsFactory, getActiveAndApprovedStatusTextFilter, $window, NotificationService, DocumentTitleService, SecurityService, LoadingService) {
    DocumentTitleService('Vendors');
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
                displayName: 'Email',
                field: 'mainEmail'
            },
            {
                displayName: 'Business Type',
                field: 'businessType.name'
            },
            {
                displayName: 'Status',
                field: 'status'
            },
            {
                cellTemplate: `<div class="ui-grid-cell-contents">
                    <a href="/admin/vendor/{{row.entity[col.field]}}">Edit</a>
                    /
                    <a ng-click="grid.appScope.delete(row.entity[col.field])">Delete</a>
                    /
                    <a ng-if="!row.entity.isApproved" ng-click="grid.appScope.approve(row.entity[col.field])">Approve</a>
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
        paginationPageSize: 25
    };

    function loadVendors() {
        VendorsFactory.getAllVendors().success(response => {
            angular.forEach(response.vendors, row => {
                // There is no `isActive` field for vendors, so pass `true`.
                row.status = getActiveAndApprovedStatusTextFilter(true, row.isApproved);
            });
            vm.gridOptions.data = response.vendors;

            LoadingService.hide();
        }).error(() => NotificationService.notifyError());
    }

    loadVendors();

    $scope.delete = function(id) {
        const confirmed = $window.confirm('Are you sure?');
        if (confirmed) {
            LoadingService.show();

            VendorsFactory.deleteVendor(id)
                .then(loadVendors)
                .catch(response => NotificationService.notifyError(response.data.errorTranslation));
        }
    };

    $scope.approve = function(id) {
        VendorsFactory.approveVendor(id)
            .success(loadVendors)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };
});
