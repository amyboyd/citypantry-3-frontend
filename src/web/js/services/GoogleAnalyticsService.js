angular.module('cp.services').service('GoogleAnalyticsService', function(INCLUDE_ANALYTICS_JS) {
    function isEnabled() {
        return INCLUDE_ANALYTICS_JS && typeof window.ga === 'function'
    }

    return {
        trackPackageView(pkg) {
            if (!isEnabled()) {
                return;
            }

            window.ga('ec:addProduct', {
                id: pkg.id,
                name: pkg.name,
                category: pkg.cuisineType.name,
                brand: pkg.vendor.name
            });

            window.ga('ec:setAction', 'click');
        },

        trackNewOrder(order) {
            if (!isEnabled()) {
                return;
            }

            const pkg = order.package;
            const promoCode = order.promotion ? order.promotion.code : null;

            window.ga('ec:addProduct', {
                id: pkg.id,
                name: pkg.name,
                category: pkg.cuisineType.name,
                brand: pkg.vendor.name,
                price: pkg.costIncludingVat,
                coupon: promoCode,
                quantity: order.headCount
            });

            window.ga('ec:setAction', 'purchase', {
                id: order.id,
                revenue: order.totalAmountAfterVoucher,
                tax: order.totalTaxAmount,
                shipping: order.shippingIncludingVatAmount,
                coupon: promoCode
            });
        }
    };
});
