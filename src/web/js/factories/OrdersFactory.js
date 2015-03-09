angular.module('cp.factories').factory('OrdersFactory', function(API_BASE, ApiService) {
    return {
        getAllOrders: () => ApiService.get(`${API_BASE}/orders`),

        getOrdersByCurrentVendor: () => ApiService.get(`${API_BASE}/orders/by-current-vendor`),

        getOrdersByCurrentCustomer: () => ApiService.get(`${API_BASE}/orders/by-current-customer`),

        getOrder: (id) => ApiService.get(`${API_BASE}/orders/${id}`),

        getOrderMessages: (id) => ApiService.get(`${API_BASE}/orders/${id}/messages`),

        sendMessage: (id, message) => ApiService.put(`${API_BASE}/orders/${id}/messages`, {message: message}),

        updateOrder: (id, updatedOrder) => ApiService.put(`${API_BASE}/order/${id}`, updatedOrder),

        deleteOrder: (id, reason = '') => ApiService.delete(`${API_BASE}/order/${id}?deletionReason=${reason}`),

        getCourierOrders: () => ApiService.get(`${API_BASE}/orders/courier`),

        addCustomerServiceEvent: (id, event) => ApiService.post(`${API_BASE}/order/${id}/customer-service-events`, {event: event}),

        acceptOrder: (id) => ApiService.put(`${API_BASE}/order/${id}/accept`),

        getHeadCountOptions(maxPeople = 1, minPeople = 1) {
            if (maxPeople === null) {
                maxPeople = 1000;
            }
            if (minPeople === null) {
                minPeople = 1;
            }

            const options = [];

            for (let i = minPeople; i <= maxPeople; i += 1) {
                options.push(i);
            }

            return options;
        }
    };
});
