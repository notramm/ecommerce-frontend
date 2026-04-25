import api from './axios';

export const getProducts          = (params) => api.get('/products', { params });
export const getProductBySlug     = (slug)   => api.get(`/products/slug/${slug}`);
export const getProductById       = (id)     => api.get(`/products/${id}`);
export const getSearchSuggestions = (q)      => api.get('/products/suggestions', { params: { q } });
export const getFeaturedProducts  = ()       => api.get('/products', { params: { isFeatured: true,   limit: 8 } });
export const getNewArrivals       = ()       => api.get('/products', { params: { isNewArrival: true,  limit: 8 } });
export const getBestSellers       = ()       => api.get('/products', { params: { isBestSeller: true,  limit: 8 } });