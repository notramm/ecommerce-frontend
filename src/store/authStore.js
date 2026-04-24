import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoggedIn:  false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isLoggedIn: true }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      updateUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),

      logout: () =>
        set({ user: null, accessToken: null, isLoggedIn: false }),

      isRole: (role) => get().user?.role === role,
      isAdmin:  () => get().user?.role === 'admin',
      isVendor: () => get().user?.role === 'vendor',
      isAgent:  () => get().user?.role === 'agent',
    }),
    {
      name:    'auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isLoggedIn: s.isLoggedIn }),
    }
  )
);

export default useAuthStore;