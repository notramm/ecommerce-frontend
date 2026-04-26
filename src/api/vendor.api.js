import api from './axios';

export const registerVendor     = (data)        => api.post('/vendors/register', data);
export const getVendorProfile   = ()            => api.get('/vendors/profile');
export const updateVendorProfile= (data)        => api.put('/vendors/profile', data);
export const submitKYC          = (formData)    => api.post('/vendors/kyc', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBankDetails  = (data)        => api.put('/vendors/bank-details', data);
export const getVendorDashboard = ()            => api.get('/vendors/dashboard');
export const getSalesAnalytics  = (period)      => api.get('/vendors/analytics/sales', { params: { period } });
export const getPayouts         = (params)      => api.get('/vendors/payouts', { params });
export const requestPayout      = (data)        => api.post('/vendors/payouts/request', data);
export const getVendorCoupons   = (params)      => api.get('/vendors/coupons', { params });
export const createVendorCoupon = (data)        => api.post('/vendors/coupons', data);
export const updateVendorCoupon = (id, data)    => api.put(`/vendors/coupons/${id}`, data);
export const deleteVendorCoupon = (id)          => api.delete(`/vendors/coupons/${id}`);
export const getShippingLabel   = (orderId)     => api.get(`/vendors/orders/${orderId}/shipping-label`);
export const getPackagingSlip   = (orderId)     => api.get(`/vendors/orders/${orderId}/packaging-slip`);

// Products (vendor)
export const getVendorProducts  = (params)      => api.get('/products/vendor/my-products', { params });
export const createProduct      = (formData)    => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct      = (id, data)    => api.put(`/products/${id}`, data);
export const approveProductAdmin= (id)          => api.patch(`/products/${id}/approve`);
export const getInventoryLogs   = (productId)   => api.get(`/products/${productId}/inventory`);
export const adjustStock        = (data)        => api.post('/products/inventory/adjust', data);

// Orders (vendor)
export const getVendorOrders    = (params)      => api.get('/orders/vendor/orders', { params });
export const updateItemStatus   = (itemId, data)=> api.patch(`/orders/vendor/items/${itemId}/status`, data);