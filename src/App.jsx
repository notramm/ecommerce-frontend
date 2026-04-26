import { useEffect }   from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Lenis           from 'lenis';
import { router }      from './router';
import Toast           from './components/ui/Toast';
import './styles/globals.css';

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

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let id;
    const raf = (time) => { lenis.raf(time); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="noise-overlay" aria-hidden="true" />
      <RouterProvider router={router} />
      <Toast />
    </QueryClientProvider>
  );
}