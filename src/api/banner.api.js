import api from './axios';

export const getActiveBanners = (placement) =>
  api.get('/banners', { params: { placement, activeOnly: 'true' } });