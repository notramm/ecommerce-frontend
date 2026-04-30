import { create }  from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // existing
      cartOpen:      false,
      searchOpen:    false,
      mobileNavOpen: false,

      openCart:      () => set({ cartOpen: true }),
      closeCart:     () => set({ cartOpen: false }),
      openSearch:    () => set({ searchOpen: true }),
      closeSearch:   () => set({ searchOpen: false }),
      openMobileNav: () => set({ mobileNavOpen: true }),
      closeMobileNav:() => set({ mobileNavOpen: false }),

      // Theme
      theme:     'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        document.documentElement.setAttribute('data-theme', next);
      },
      initTheme: () => {
        const t = get().theme || 'dark';
        document.documentElement.setAttribute('data-theme', t);
      },
    }),
    {
      name:       'luxe-ui',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);

export default useUIStore;