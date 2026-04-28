import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,   // sends refreshToken cookie
  timeout:         15000,
  headers: { 'Content-Type': 'application/json' },
});

// Queue for parallel requests during refresh
let isRefreshing  = false;
let pendingQueue  = [];

const resolveQueue = (token) => {
  pendingQueue.forEach((cb) => cb.resolve(token));
  pendingQueue = [];
};

const rejectQueue = (err) => {
  pendingQueue.forEach((cb) => cb.reject(err));
  pendingQueue = [];
};

// ── Request interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use((config) => {
  // Read from store every time (handles both initial load from LS and in-memory)
  const stored = localStorage.getItem('luxe-auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token  = parsed?.state?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

// ── Response interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only handle 401, skip retries and auth endpoints
    if (
      !error.response ||
      error.response.status !== 401 ||
      original._retry
    ) {
      return Promise.reject(error);
    }

    // Skip token refresh for these routes
    const skipUrls = [
      '/auth/refresh-token',
      '/auth/login',
      '/auth/email/send-otp',
      '/auth/email/verify-otp',
      '/auth/phone/verify',
      '/auth/google/firebase',
    ];
    if (skipUrls.some((u) => original.url?.includes(u))) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // refreshToken is in HttpOnly cookie — sent automatically
      const { data } = await axios.post(
        `${BASE}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newToken = data?.data?.accessToken;
      if (!newToken) throw new Error('No token in refresh response');

      // Save new token
      const stored = localStorage.getItem('luxe-auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.state.accessToken = newToken;
          localStorage.setItem('luxe-auth', JSON.stringify(parsed));
        } catch {}
      }

      // Update Zustand store (in-memory)
      const { default: useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().setAccessToken(newToken);

      resolveQueue(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);

    } catch (refreshError) {
      rejectQueue(refreshError);

      // Refresh failed — clear everything and logout
      const { default: useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().logout();
      localStorage.removeItem('luxe-auth');

      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;