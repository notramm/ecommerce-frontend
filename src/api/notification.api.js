import api from './axios';

export const getMyNotifications = (params) => api.get('/notifications', { params });
export const markNotificationsRead = (ids = []) => api.post('/notifications/read', { ids });
export const getUnreadCount = () => api.get('/notifications/unread-count');