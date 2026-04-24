import { create } from 'zustand';

const useUIStore = create((set) => ({
  cartOpen:       false,
  searchOpen:     false,
  mobileNavOpen:  false,
  activeModal:    null,

  openCart:    () => set({ cartOpen: true }),
  closeCart:   () => set({ cartOpen: false }),
  toggleCart:  () => set((s) => ({ cartOpen: !s.cartOpen })),

  openSearch:  () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  openMobileNav:  () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  openModal:  (id) => set({ activeModal: id }),
  closeModal: ()   => set({ activeModal: null }),
}));

export default useUIStore;