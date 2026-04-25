import api from './axios';

export const getCategoryTree = () => api.get('/categories');