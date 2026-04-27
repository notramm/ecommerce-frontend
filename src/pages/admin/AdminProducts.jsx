import { useState }  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { ShoppingBag, Check, X, Eye } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getPendingProducts, approveProduct, rejectProduct } from '../../api/admin.api';
import { cn, formatPrice } from '../../utils/formatters';
import { toast }     from 'sonner';

export default function AdminProducts() {
  const [rejectingId,  setRejectingId]  = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient                      = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey:  ['admin-products-pending'],
    queryFn:   () => getPendingProducts({ limit: 30 }),
    staleTime: 2 * 60 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: approveProduct,
    onSuccess:  () => { toast.success('Product approved'); queryClient.invalidateQueries({ queryKey: ['admin-products-pending'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectProduct(id, reason),
    onSuccess:  () => {
      toast.success('Product rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-products-pending'] });
      setRejectingId(null);
      setRejectReason('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const products = data?.data?.products || [];

  return (
    <PageWrapper>
      <DashboardShell title="Product Approvals" subtitle="Admin">
        <p className="text-stone/50 text-xs mb-5 font-mono">
          {products.length} product{products.length !== 1 ? 's' : ''} pending approval
        </p>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Check size={28} className="mx-auto text-emerald-400/30 mb-4" />
            <p className="font-display text-xl text-cream mb-2">All caught up!</p>
            <p className="text-stone text-sm">No products pending approval</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => {
              const image = p.images?.[0]?.url;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0d0d0d] border border-white/[0.07] p-4 sm:p-5"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-16 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
                      {image
                        ? <img src={image} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-stone/20" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium line-clamp-1 mb-1">{p.name}</p>
                      <p className="text-stone/40 text-xs mb-1">
                        By: {p.vendor?.name || 'Unknown'} · {p.category?.name || 'Uncategorized'}
                      </p>
                      <p className="text-cream text-sm font-mono">{formatPrice(p.basePrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-cream transition-colors"
                      >
                        <Eye size={13} />
                      </a>
                      <button
                        onClick={() => approveMutation.mutate(p._id)}
                        disabled={approveMutation.isPending}
                        className="w-8 h-8 border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setRejectingId(rejectingId === p._id ? null : p._id)}
                        className="w-8 h-8 border border-vermillion/20 bg-vermillion/5 flex items-center justify-center text-vermillion hover:bg-vermillion/10 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {rejectingId === p._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 pt-4 border-t border-white/[0.05] flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Rejection reason (required)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-vermillion/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
                      />
                      <button
                        onClick={() => rejectMutation.mutate({ id: p._id, reason: rejectReason })}
                        disabled={!rejectReason.trim() || rejectMutation.isPending}
                        className="px-4 py-2 bg-vermillion/10 border border-vermillion/30 text-vermillion text-xs hover:bg-vermillion/20 disabled:opacity-40"
                      >
                        Confirm
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}