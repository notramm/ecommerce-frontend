import api from './axios';

export const getWishlist       = (params)      => api.get('/users/wishlist', { params });
export const addToWishlist     = (productId)   => api.post('/users/wishlist', { productId });
export const removeFromWishlist= (productId)   => api.delete(`/users/wishlist/${productId}`);
export const moveToCart        = (productId, variantId) =>
  api.post(`/users/wishlist/${productId}/move-to-cart`, { variantId });
export const checkWishlist     = (productId)   => api.get(`/users/wishlist/check/${productId}`);
export const getProfile        = ()            => api.get('/users/profile');
export const updateProfile     = (data)        => api.put('/users/profile', data);
export const getAddresses      = ()            => api.get('/users/addresses');
export const addAddress        = (data)        => api.post('/users/addresses', data);
export const updateAddress     = (id, data)    => api.put(`/users/addresses/${id}`, data);
export const deleteAddress     = (id)          => api.delete(`/users/addresses/${id}`);
export const setDefaultAddress = (id)          => api.patch(`/users/addresses/${id}/default`);