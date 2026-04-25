import api from './axios';

export const getProductReviews = (productId, params) =>
  api.get(`/reviews/product/${productId}`, { params });

export const createReview  = (data) => api.post('/reviews', data);
export const markHelpful   = (id)   => api.post(`/reviews/${id}/helpful`);
export const vendorReply   = (id, reply) => api.post(`/reviews/${id}/vendor-reply`, { reply });