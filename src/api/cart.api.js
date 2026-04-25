import api from './axios';

export const getCart        = ()              => api.get('/cart');
export const addToCart      = (data)          => api.post('/cart/add', data);
export const updateCartItem = (itemId, qty)   => api.put(`/cart/items/${itemId}`, { quantity: qty });
export const removeCartItem = (itemId)        => api.delete(`/cart/items/${itemId}`);
export const clearCart      = ()              => api.delete('/cart');
export const applyCoupon    = (code)          => api.post('/cart/coupon', { code });
export const removeCoupon   = ()              => api.delete('/cart/coupon');
export const validateCart   = ()              => api.get('/cart/validate');
export const mergeGuestCart = (guestItems)    => api.post('/cart/merge', { guestItems });