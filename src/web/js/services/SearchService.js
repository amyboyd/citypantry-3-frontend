angular.module('cp.services').service('SearchService', function() {
    var cuisineTypes = [];
    var deliveryDate;
    var deliveryTime;
    var dietaryRequirements = [];
    var eventTypes = [];
    var headCount;
    var maxBudget;
    var packagingType;
    var postcode;

    return {
        getCuisineTypes: function() {
            return cuisineTypes;
        },

        setCuisineTypes: function(value) {
            cuisineTypes = value;
        },

        getDeliveryDate: function() {
            return deliveryDate;
        },

        setDeliveryDate: function(value) {
            deliveryDate = value;
        },

        getDeliveryTime: function() {
            return deliveryTime;
        },

        setDeliveryTime: function(value) {
            deliveryTime = value;
        },

        getDietaryRequirements: function() {
            return dietaryRequirements;
        },

        setDietaryRequirements: function(value) {
            dietaryRequirements = value;
        },

        getEventTypes: function() {
            return eventTypes;
        },

        setEventTypes: function(value) {
            eventTypes = value;
        },

        getHeadCount: function() {
            return headCount;
        },

        setHeadCount: function(value) {
            headCount = value;
        },

        getMaxBudget: function() {
            return maxBudget;
        },

        setMaxBudget: function(value) {
            maxBudget = value;
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
        }
    };
});
