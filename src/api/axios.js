import axios from 'axios';
import { API_BASE } from '../utils/constants';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL:         API_BASE,
  withCredentials: true,
  timeout:         15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — refresh token on 401
let isRefreshing  = false;
let refreshQueue  = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Skip retry for non-401, already-retried, or auth endpoints (refresh/OTP)
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/') && original.url?.includes('otp')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    try {
      const { data } = await axios.post(
        `${API_BASE}/auth/refresh`,   // ← fixed endpoint
        {},
        { withCredentials: true }
      );
      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);

      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      processQueue(e, null);
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;