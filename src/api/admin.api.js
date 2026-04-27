import api from './axios';

export const getPlatformDashboard  = ()       => api.get('/admin/dashboard');
export const getPlatformAnalytics  = (params) => api.get('/admin/analytics', { params });
export const getFinancialOverview  = (params) => api.get('/admin/financial', { params });

// Users
export const getAllUsers   = (params) => api.get('/admin/users', { params });
export const getUserDetail = (id)     => api.get(`/admin/users/${id}`);
export const banUser       = (id, reason) => api.post(`/admin/users/${id}/ban`,   { reason });
export const unbanUser     = (id)         => api.post(`/admin/users/${id}/unban`);

// Commission
export const getCommission      = ()     => api.get('/admin/commission');
export const setGlobalCommission= (data) => api.put('/admin/commission/global', data);
export const setVendorCommission= (data) => api.put('/admin/commission/vendor', data);

// Banners
export const getBanners    = (params)    => api.get('/admin/banners', { params });
export const createBanner  = (formData)  => api.post('/admin/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBanner  = (id, data)  => api.put(`/admin/banners/${id}`, data);
export const deleteBanner  = (id)        => api.delete(`/admin/banners/${id}`);

// Notifications
export const sendBulkNotification = (data) => api.post('/admin/notifications/bulk', data);
export const getNotificationStats = ()     => api.get('/admin/notifications/stats');

// Vendor KYC (admin)
export const getPendingKYC  = (params)        => api.get('/vendors/admin/kyc', { params });
export const reviewKYC      = (vendorId, data) => api.post(`/vendors/admin/${vendorId}/kyc`, data);
export const processAdminPayout = (payoutId, data) => api.post(`/vendors/admin/payouts/${payoutId}`, data);

// Orders (admin)
export const adminGetOrders      = (params)      => api.get('/orders/admin/all', { params });
export const adminUpdateOrder    = (id, data)    => api.patch(`/orders/admin/${id}/status`, data);
export const adminInitiateRefund = (id, data)    => api.post(`/orders/admin/${id}/refund`, data);

// Products (admin)
export const getPendingProducts  = (params) => api.get('/products', { params: { status: 'pending_approval', ...params } });
export const approveProduct      = (id)     => api.patch(`/products/${id}/approve`);
export const rejectProduct       = (id, reason) => api.patch(`/products/${id}/reject`, { reason });

// Activity logs
export const getActivityLogs = (params) => api.get('/admin/activity-logs', { params });
export const getFraudReport  = (params) => api.get('/admin/fraud-report', { params });