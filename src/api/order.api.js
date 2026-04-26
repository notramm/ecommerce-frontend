import api from './axios';

export const initiateOrder    = (data)    => api.post('/orders', data);
export const verifyPayment    = (data)    => api.post('/orders/verify-payment', data);
export const getMyOrders      = (params)  => api.get('/orders/my', { params });
export const getOrderById     = (id)      => api.get(`/orders/${id}`);
export const cancelOrder      = (id, reason) => api.post(`/orders/${id}/cancel`, { reason });
export const requestReturn    = (id, data)   => api.post(`/orders/${id}/return`, data);