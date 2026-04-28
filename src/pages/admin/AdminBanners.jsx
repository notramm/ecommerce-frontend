import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Image, Plus, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getBanners, createBanner, deleteBanner, updateBanner } from '../../api/admin.api';
import { cn, formatDate } from '../../utils/formatters';
import { toast }     from 'sonner';

function CreateBannerModal({ open, onClose, queryClient }) {
  const [title,    setTitle]    = useState('');
  const [placement,setPlacement]= useState('hero');
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [linkType, setLinkType] = useState('none');
  const [linkValue,setLinkValue]= useState('');
  const fileRef                  = useRef(null);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('placement', placement);
      fd.append('linkType', linkType);
      fd.append('linkValue', linkValue);
      if (file) fd.append('image', file);
      return createBanner(fd);
    },
    onSuccess: () => {
      toast.success('Banner created');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      onClose();
      setTitle(''); setFile(null); setPreview(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-4"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-cream">Create Banner</p>
          <button onClick={onClose} className="text-stone hover:text-cream transition-colors"><X size={16} /></button>
        </div>

        <div>
          <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Banner title"
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Placement</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/[0.07] text-cream px-3 py-3 text-sm outline-none"
            >
              {['hero','mid_page','sidebar','popup'].map((p) => (
                <option key={p} value={p} className="bg-[#0a0a0a] capitalize">{p.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Link Type</label>
            <select value={linkType} onChange={(e) => setLinkType(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/[0.07] text-cream px-3 py-3 text-sm outline-none"
            >
              {['none','url','category','product'].map((l) => (
                <option key={l} value={l} className="bg-[#0a0a0a] capitalize">{l}</option>
              ))}
            </select>
          </div>
        </div>

        {linkType !== 'none' && (
          <input value={linkValue} onChange={(e) => setLinkValue(e.target.value)}
            placeholder={linkType === 'url' ? 'https://...' : 'slug or ID'}
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
          />
        )}

        {preview ? (
          <div className="relative w-full h-32 overflow-hidden border border-white/[0.06]">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 w-6 h-6 bg-vermillion flex items-center justify-center text-cream"><X size={11} /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-8 border border-dashed border-white/[0.1] text-stone/40 hover:text-cream hover:border-gold/30 transition-all text-sm"
          >
            <Upload size={16} /> Upload Banner Image
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
        }} />

        <button onClick={() => mutation.mutate()} disabled={!title || !file || mutation.isPending}
          className="w-full btn-primary py-3.5 disabled:opacity-40">
          Create Banner
        </button>
      </motion.div>
    </div>
  );
}

export default function AdminBanners() {
  const [modalOpen,  setModalOpen]  = useState(false);
  const [placement,  setPlacement]  = useState('');
  const queryClient                   = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey:  ['admin-banners', placement],
    queryFn:   async () => { const {data} = await getBanners({ placement: placement || undefined, activeOnly: 'false' }); return data.data; },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess:  () => { toast.success('Banner deleted'); queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateBanner(id, { isActive }),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const banners = data?.banners || [];

  return (
    <PageWrapper>
      <DashboardShell title="Banners & CMS" subtitle="Admin">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-1">
            {['', 'hero', 'mid_page', 'sidebar', 'popup'].map((p) => (
              <button key={p} onClick={() => setPlacement(p)}
                className={cn('px-3 py-1.5 text-[10px] font-mono border transition-all whitespace-nowrap capitalize',
                  placement === p ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/[0.07] text-stone/60 hover:text-cream'
                )}>
                {p || 'All'}
              </button>
            ))}
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-2 py-2.5 px-5 shrink-0">
            <Plus size={13} /> Create Banner
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16">
            <Image size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="text-stone text-sm">No banners yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <motion.div key={b._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden group">
                <div className="relative aspect-video overflow-hidden bg-[#111]">
                  {b.imageUrl
                    ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Image size={24} className="text-stone/20" /></div>
                  }
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="text-[9px] font-mono bg-obsidian/80 text-stone px-2 py-1 capitalize">
                      {b.placement?.replace(/_/g, ' ')}
                    </span>
                    {!b.isActive && (
                      <span className="text-[9px] font-mono bg-vermillion/80 text-cream px-2 py-1">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-cream text-sm font-medium mb-1 line-clamp-1">{b.title}</p>
                  <p className="text-stone/40 text-[10px] font-mono mb-3">
                    {b.clickCount} clicks · {formatDate(b.createdAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleMutation.mutate({ id: b._id, isActive: !b.isActive })}
                      className={cn('flex items-center gap-1.5 px-2.5 py-1.5 border text-[10px] transition-all',
                        b.isActive
                          ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5'
                          : 'border-white/[0.1] text-stone/50 hover:text-cream'
                      )}>
                      {b.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => deleteMutation.mutate(b._id)}
                      className="ml-auto p-1.5 text-stone/30 hover:text-vermillion transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </DashboardShell>
      <CreateBannerModal open={modalOpen} onClose={() => setModalOpen(false)} queryClient={queryClient} />
    </PageWrapper>
  );
}