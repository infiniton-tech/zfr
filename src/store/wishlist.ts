import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[];
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        const exists = get().items.includes(productId);
        if (exists) {
          set({ items: get().items.filter((id) => id !== productId) });
        } else {
          set({ items: [...get().items, productId] });
        }
      },
      isInWishlist: (productId) => get().items.includes(productId),
    }),
    { name: "zfr-wishlist" }
  )
);
