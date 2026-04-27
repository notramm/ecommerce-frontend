import api from './axios';

export const getMyPayments = (params) => api.get('/payments/my', { params });
export const getWallet     = ()       => api.get('/payments/wallet');