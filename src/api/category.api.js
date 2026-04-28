import api from './axios';

// Raw API call
export const getCategoryTree = () => api.get('/categories');

// Normalized helper — returns array directly
export const getCategories = async () => {
  const { data } = await api.get('/categories');
  const arr = data?.data?.categories || data?.data || data || [];
  return Array.isArray(arr) ? arr : [];
};