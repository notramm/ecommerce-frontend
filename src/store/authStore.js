import { create }  from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoggedIn:  false,

      setAuth: (user, accessToken) => {
        set({ user, accessToken, isLoggedIn: true });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      updateUser: (updates) => {
        const current = get().user;
        set({ user: current ? { ...current, ...updates } : updates });
      },

      logout: () => {
        set({ user: null, accessToken: null, isLoggedIn: false });
      },
    }),
    {
      name: 'luxe-auth',
      // Dev mein sab persist karo including accessToken
      // Production mein yahi rahega — refreshToken cookie se handle hoga
      partialize: (state) => ({
        user:        state.user,
        accessToken: state.accessToken,
        isLoggedIn:  state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;