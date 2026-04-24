import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useEffect }       from 'react';
import Lenis               from 'lenis';
import { router }          from './router';
import Toast               from './components/ui/Toast';
import '../src/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          60 * 1000,
      gcTime:             5 * 60 * 1000,
      retry:              1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration:   1.2,
      easing:     (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth:     true,
    });

    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    const id  = requestAnimationFrame(raf);

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden />
      <AnimatePresence mode="wait">
        <RouterProvider router={router} />
      </AnimatePresence>
      <Toast />
    </QueryClientProvider>
  );
}