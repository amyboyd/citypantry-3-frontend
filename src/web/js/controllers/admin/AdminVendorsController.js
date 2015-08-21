angular.module('cp.controllers.admin').controller('AdminVendorsController',
        function($scope, VendorsFactory, getActiveAndApprovedStatusTextFilter, $window, NotificationService, DocumentTitleService, SecurityService, LoadingService) {
    DocumentTitleService('Vendors');
    SecurityService.requireStaff();

    $scope.csvFields = [
        {field: 'humanId', label: 'ID', isEnabled: true},
        {field: 'name', label: 'Name', isEnabled: true},
        {field: 'mainEmail', label: 'Main email', isEnabled: true},
        {field: 'isApproved', label: 'Is approved?', isEnabled: true},
        {field: 'slug', label: 'URL slug', isEnabled: false},
        {field: 'url', label: 'Website', isEnabled: false},
        {field: 'description', label: 'Description', isEnabled: false},
        {field: 'maxPeople', label: 'Max people per day', isEnabled: false},
        {field: 'dateAdded', label: 'Date added', isEnabled: false},
        {field: 'businessType', label: 'Business type', isEnabled: false},
        {field: 'misspellings', label: 'Misspellings', isEnabled: false},
        {field: 'facebookUrl', label: 'Facebook URL', isEnabled: false},
        {field: 'twitterUrl', label: 'Twitter URL', isEnabled: false},
        {field: 'youtubeUrl', label: 'Youtube URL', isEnabled: false},
        {field: 'googlePlusUrl', label: 'Google+ URL', isEnabled: false},
        {field: 'cityPantryCommission', label: 'City Pantry commission', isEnabled: false},
        {field: 'isFlatCommission', label: 'Is flat commission?', isEnabled: false},
        {field: 'isVatRegistered', label: 'Is VAT registered?', isEnabled: false},
        {field: 'vatNumber', label: 'VAT number', isEnabled: false},
        {field: 'isMealPlan', label: 'Is meal plan?', isEnabled: false}
    ];

    let gridApi;

    /**
     * Get all rows that are currently filtered, regardless of whether they are on the currently
     * visible page.
     */
    const getAllFilteredRows = () => {
        return $scope.gridApi.grid.rows.filter(row => row.visible);
    };

    $scope.gridOptions = {
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
        paginationPageSize: 25,
        onRegisterApi(gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    function loadVendors() {
        VendorsFactory.getAllVendors().success(response => {
            angular.forEach(response.vendors, row => {
                // There is no `isActive` field for vendors, so pass `true`.
                row.status = getActiveAndApprovedStatusTextFilter(true, row.isApproved);
            });
            $scope.gridOptions.data = response.vendors;

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

    $scope.createVendorsCsv = () => {
        const selectedVendorsIds = getAllFilteredRows().map(row => row.entity.id);
        if (selectedVendorsIds.length === 0) {
            NotificationService.notifyError('You must have at least one order to create a CSV file.');
            return;
        }

        const enabledFields = $scope.csvFields.filter(field => field.isEnabled).map(field => field.field);
        if (enabledFields.length === 0) {
            NotificationService.notifyError('You must have at least one field to create a CSV file.');
            return;
        }

        VendorsFactory.createVendorsCsvFile(selectedVendorsIds, enabledFields)
            .success(response => $window.location.href = response.url)
            .catch(response => NotificationService.notifyError(response.data.errorTranslation));
    };
});
