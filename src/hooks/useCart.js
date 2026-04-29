import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} from "../api/cart.api";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";

export function useServerCart() {
  const { setServerCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();
  

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await getCart();
      setServerCart(data.data);
      return data.data;
    },
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["cart"] });

  const updateMutation = useMutation({
  mutationFn: ({ itemId, quantity }) => {
    if (!itemId) throw new Error('Cart item ID missing');
    if (quantity === undefined || quantity === null) throw new Error('Quantity missing');
    return updateCartItem(itemId, quantity);
  },
  onSuccess: (res) => { setServerCart(res.data.data); invalidate(); },
  onError:   (e)  => toast.error(e.response?.data?.message || e.message || 'Update failed'),
});

  const removeMutation = useMutation({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: (res) => {
      setServerCart(res.data.data);
      invalidate();
      toast.success("Item removed");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const couponMutation = useMutation({
    mutationFn: (code) => applyCoupon(code),
    onSuccess: (res) => {
      setServerCart(res.data.data);
      invalidate();
      toast.success("Coupon applied!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Invalid coupon"),
  });

  const removeCouponMutation = useMutation({
    mutationFn: removeCoupon,
    onSuccess: (res) => {
      setServerCart(res.data.data);
      invalidate();
      toast.success("Coupon removed");
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      setServerCart(null);
      invalidate();
      toast.success("Cart cleared");
    },
  });

  return {
    ...query,
    updateItem: updateMutation.mutate,
    removeItem: removeMutation.mutate,
    applyCoupon: couponMutation.mutate,
    removeCoupon: removeCouponMutation.mutate,
    clearCart: clearMutation.mutate,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isCouponing: couponMutation.isPending,
  };
}

export function useWishlist() {
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { getWishlist } = await import("../api/user.api");
      const { data } = await getWishlist({ limit: 50 });
      return data.data.data;
    },
    enabled: isLoggedIn,
    staleTime: 2 * 60 * 1000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });

  const removeMutation = useMutation({
    mutationFn: async (productId) => {
      const { removeFromWishlist } = await import("../api/user.api");
      return removeFromWishlist(productId);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const moveMutation = useMutation({
    mutationFn: async ({ productId, variantId }) => {
      const { moveToCart } = await import("../api/user.api");
      return moveToCart(productId, variantId);
    },
    onSuccess: (res) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      useCartStore.getState().setServerCart(res.data.data);
      toast.success("Moved to cart!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to move"),
  });

  return {
    ...query,
    removeItem: removeMutation.mutate,
    moveToCart: moveMutation.mutate,
    isRemoving: removeMutation.isPending,
    isMoving: moveMutation.isPending,
  };
}
