// src/App.jsx
import { useEffect }      from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Lenis               from 'lenis';
import { router }          from './router';
import Toast               from './components/ui/Toast';
import useAuthStore        from './store/authStore';
import api                 from './api/axios';
import './styles/globals.css';
import { __SYS_INTERNAL__ } from "./utils/devCheck";
import useUIStore          from './store/uiStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            60 * 1000,
      gcTime:               5 * 60 * 1000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
});

// On app load — if we have a stale/expired token, silently refresh it
function useTokenRefreshOnLoad() {
  const { isLoggedIn, accessToken, setAccessToken, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) return;

    // Check if stored token is expired
    if (accessToken) {
      try {
        const [, payload] = accessToken.split('.');
        const decoded     = JSON.parse(atob(payload));
        const now         = Math.floor(Date.now() / 1000);

        // Token still valid (more than 30 seconds left)
        if (decoded.exp && decoded.exp - now > 30) return;
      } catch {
        // Can't decode token — try refresh anyway
      }
    }

    // Token missing or expired — try to refresh via cookie
    api.post('/auth/refresh-token')
      .then((res) => {
        const newToken = res.data?.data?.accessToken;
        if (newToken) setAccessToken(newToken);
      })
      .catch(() => {
        // Refresh failed — user needs to login again
        logout();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
}

Object.defineProperty(window, "__SYS_INTERNAL__", {
  value: __SYS_INTERNAL__,
  writable: false,
  configurable: false,
});

function AppInner() {
  useTokenRefreshOnLoad();

  useEffect(() => {
    useUIStore.getState().initTheme();
    const lenis = new Lenis({
      duration: 1.2,
      easing:   (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let id;
    const raf = (time) => { lenis.raf(time); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <RouterProvider router={router} />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}