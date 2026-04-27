import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast }       from 'sonner';
import useAuthStore    from '../store/authStore';
import { getWishlist, addToWishlist, removeFromWishlist, moveToCart } from '../api/user.api';
import useCartStore    from '../store/cartStore';

export default function useWishlist() {
  const { isLoggedIn }  = useAuthStore();
  const { setServerCart } = useCartStore();
  const queryClient     = useQueryClient();

  const query = useQuery({
    queryKey:  ['wishlist'],
    queryFn:   async () => {
      const { data } = await getWishlist({ limit: 100 });
      return data.data;
    },
    enabled:   isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['wishlist'] });

  const addMutation = useMutation({
    mutationFn: (productId) => addToWishlist(productId),
    onSuccess:  () => { invalidate(); toast.success('Added to wishlist'); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => removeFromWishlist(productId),
    onSuccess:  () => { invalidate(); toast.success('Removed from wishlist'); },
    onError:    () => toast.error('Failed to remove'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ productId, variantId }) => moveToCart(productId, variantId),
    onSuccess:  (res) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setServerCart(res.data.data);
      toast.success('Moved to cart!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const isWishlisted = (productId) => {
    const items = query.data?.items || [];
    return items.some((i) => i.product?._id === productId || i.product === productId);
  };

  const toggle = (productId) => {
    if (!isLoggedIn) { toast.error('Sign in to use wishlist'); return; }
    if (isWishlisted(productId)) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  };

  return {
    ...query,
    items:       query.data?.items || [],
    total:       query.data?.total || 0,
    isWishlisted,
    toggle,
    add:         addMutation.mutate,
    remove:      removeMutation.mutate,
    moveToCart:  moveMutation.mutate,
    isAdding:    addMutation.isPending,
    isRemoving:  removeMutation.isPending,
    isMoving:    moveMutation.isPending,
  };
}