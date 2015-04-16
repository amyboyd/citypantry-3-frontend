angular.module('cp.services', []);

angular.module('cp.services').service('CheckoutService', function() {
    var deliveryAddressId;
    var deliveryCost;
    var deliveryDate;
    var dietaryRequirementsExtra;
    var endTime;
    var headCount;
    var isCutleryAndServiettesRequired = false;
    var isVendorRequiredToCleanUp = false;
    var isVendorRequiredToSetUp = false;
    var packageId;
    var packagingType;
    var postcode;
    var promoCodeId;
    var startTime;
    var subTotalAmount;
    var totalAmount;
    var vegetarianHeadCount;
    var vendorCleanupCost;
    var vendorSetupCost;

    return {
        getDeliveryAddressId: function() {
            return deliveryAddressId;
        },

        setDeliveryAddressId: function(value) {
            deliveryAddressId = value;
        },

        getDeliveryCost: function() {
            return deliveryCost;
        },

        setDeliveryCost: function(value) {
            deliveryCost = value;
        },

        getDeliveryDate: function() {
            return deliveryDate;
        },

        setDeliveryDate: function(value) {
            deliveryDate = value;
        },

        getDietaryRequirementsExtra: function() {
            return dietaryRequirementsExtra;
        },

        setDietaryRequirementsExtra: function(value) {
            dietaryRequirementsExtra = value;
        },

        getEndTime: function() {
            return endTime;
        },

        setEndTime: function(value) {
            endTime = value;
        },

        getHeadCount: function() {
            return headCount;
        },

        setHeadCount: function(value) {
            headCount = value;
        },

        getPackageId: function() {
            return packageId;
        },

        setPackageId: function(value) {
            packageId = value;
        },

        getPackagingType: function() {
            return packagingType;
        },

        setPackagingType: function(value) {
            packagingType = value;
        },

        getPostcode: function() {
            return postcode;
        },

        setPostcode: function(value) {
            postcode = value;
        },

        getPromoCodeId: function() {
            return promoCodeId;
        },

        setPromoCodeId: function(value) {
            promoCodeId = value;
        },

        getStartTime: function() {
            return startTime;
        },

        setStartTime: function(value) {
            startTime = value;
        },

        getSubTotalAmount: function() {
            return subTotalAmount;
        },

        setSubTotalAmount: function(value) {
            subTotalAmount = value;
        },

        getTotalAmount: function() {
            return totalAmount;
        },

        setTotalAmount: function(value) {
            totalAmount = value;
        },

        getVendorCleanupCost: function() {
            return vendorCleanupCost;
        },

        setVendorCleanupCost: function(value) {
            vendorCleanupCost = value;
        },

        getVendorSetupCost: function() {
            return vendorSetupCost;
        },

        setVendorSetupCost: function(value) {
            vendorSetupCost = value;
        },

        getVegetarianHeadCount: function() {
            return vegetarianHeadCount;
        },

        setVegetarianHeadCount: function(value) {
            vegetarianHeadCount = value;
        },

        isCutleryAndServiettesRequired: function() {
            return isCutleryAndServiettesRequired;
        },

        setIsCutleryAndServiettesRequired: function(value) {
            isCutleryAndServiettesRequired = value;
        },

        isVendorRequiredToCleanUp: function() {
            return isVendorRequiredToCleanUp;
        },

        setIsVendorRequiredToCleanUp: function(value) {
            isVendorRequiredToCleanUp = value;
        },

        isVendorRequiredToSetUp: function() {
            return isVendorRequiredToSetUp;
        },

        setIsVendorRequiredToSetUp: function(value) {
            isVendorRequiredToSetUp = value;
        },

        reset: function() {
            dietaryRequirementsExtra = undefined;
            isCutleryAndServiettesRequired = false;
            isVendorRequiredToCleanUp = false;
            isVendorRequiredToSetUp = false;
            packagingType = undefined;
            vegetarianHeadCount = undefined;
        }
    };
});
