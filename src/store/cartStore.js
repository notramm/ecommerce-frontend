import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items:       [],       // guest cart (synced to backend on login)
      serverCart:  null,     // enriched cart from backend
      itemCount:   0,
      total:       0,

      setServerCart: (cart) =>
        set({
          serverCart: cart,
          itemCount:  cart?.itemCount || 0,
          total:      cart?.total     || 0,
        }),

      addGuestItem: (item) => {
        const items = get().items;
        const exists = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (exists) {
          set({ items: items.map((i) =>
            i.productId === item.productId && i.variantId === item.variantId
              ? { ...i, quantity: Math.min(i.quantity + item.quantity, 10) }
              : i
          )});
        } else {
          set({ items: [...items, item] });
        }
      },

      clearGuestCart: () => set({ items: [] }),

      getGuestCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: 'cart-guest',
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export default useCartStore;