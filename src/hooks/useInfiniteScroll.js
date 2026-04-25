import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(callback, hasMore) {
  const ref = useRef(null);
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback(); },
      { threshold: 0.1 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [callback, hasMore]);
  return ref;
}