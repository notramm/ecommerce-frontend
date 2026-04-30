import api from './axios';

export const getPublicCoupons = ()     => api.get('/coupons/public');
export const validateCoupon   = (code) => api.post('/cart/coupon', { code });