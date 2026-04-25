import api from './axios';

export const getActiveBanners = (placement) =>
  api.get('/admin/banners', { params: { placement, activeOnly: 'true' } });