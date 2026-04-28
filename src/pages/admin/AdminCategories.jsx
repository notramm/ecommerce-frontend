import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Pencil, Trash2, X, Upload, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import PageWrapper    from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }   from '../../components/ui/Skeleton';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../../api/admin.api';
import { cn } from '../../utils/formatters';
import { toast } from 'sonner';

// ─── Category Modal (Create / Edit) ──────────────────────────────────────────
function CategoryModal({ open, onClose, editing, categories, queryClient }) {
  const isEdit = !!editing;

  const [name,        setName]        = useState(editing?.name        || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [parentId,    setParentId]    = useState(editing?.parent?._id || editing?.parent || '');
  const [sortOrder,   setSortOrder]   = useState(editing?.sortOrder   ?? 0);
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(editing?.image       || null);
  const fileRef                        = useRef(null);

  // Only show categories that can be parents (level < 2, not self)
  const validParents = categories.filter(
    (c) => c.level < 2 && c._id !== editing?._id
  );

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name',        name);
      fd.append('description', description);
      fd.append('sortOrder',   sortOrder);
      if (parentId)  fd.append('parentId', parentId);
      if (file)      fd.append('image',    file);

      return isEdit
        ? adminUpdateCategory(editing._id, fd)
        : adminCreateCategory(fd);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-4"
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{   scale: 0.95, y: 10,  opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-cream">
            {isEdit ? 'Edit Category' : 'Create Category'}
          </p>
          <button onClick={onClose} className="text-stone hover:text-cream transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={2}
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none resize-none"
          />
        </div>

        {/* Parent + Sort Order */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Parent Category</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/[0.07] text-cream px-3 py-3 text-sm outline-none"
            >
              <option value="" className="bg-[#0a0a0a]">None (Root)</option>
              {validParents.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#0a0a0a]">
                  {'—'.repeat(c.level)} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {/* Image Upload */}
        {preview ? (
          <div className="relative w-full h-28 overflow-hidden border border-white/[0.06]">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 w-6 h-6 bg-vermillion flex items-center justify-center text-cream"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-7 border border-dashed border-white/[0.1] text-stone/40 hover:text-cream hover:border-gold/30 transition-all text-sm"
          >
            <Upload size={16} /> Upload Category Image
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
          }}
        />

        {/* Submit */}
        <button
          onClick={() => mutation.mutate()}
          disabled={!name.trim() || mutation.isPending}
          className="w-full btn-primary py-3.5 disabled:opacity-40"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ category, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
      >
        <p className="font-display text-lg text-cream">Delete Category?</p>
        <p className="text-stone text-sm">
          Are you sure you want to delete{' '}
          <span className="text-cream font-medium">"{category.name}"</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 btn-outline py-3 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3 bg-vermillion/10 border border-vermillion/40 text-vermillion text-xs font-medium uppercase tracking-widest hover:bg-vermillion/20 transition-colors disabled:opacity-40"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ category, level = 0, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children?.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-3 py-3 px-4 border-b border-white/[0.04] group hover:bg-white/[0.02] transition-colors',
          level > 0 && 'bg-[#0a0a0a]/60'
        )}
        style={{ paddingLeft: `${16 + level * 28}px` }}
      >
        {/* Expand toggle / indent indicator */}
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={cn(
            'w-5 h-5 flex items-center justify-center text-stone/30 shrink-0',
            hasChildren ? 'hover:text-cream cursor-pointer' : 'cursor-default'
          )}
        >
          {hasChildren ? (
            <ChevronRight
              size={13}
              className={cn('transition-transform duration-200', expanded && 'rotate-90')}
            />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white/10 block" />
          )}
        </button>

        {/* Icon */}
        <div className="w-7 h-7 bg-[#111] border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
          {category.image
            ? <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            : (hasChildren
                ? <FolderOpen size={13} className="text-gold/50" />
                : <Folder     size={13} className="text-stone/30" />
              )
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-cream text-sm font-medium leading-tight">{category.name}</p>
          {category.description && (
            <p className="text-stone/40 text-[10px] font-mono line-clamp-1 mt-0.5">{category.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-stone/30 shrink-0">
          <span>L{category.level}</span>
          <span>#{category.sortOrder}</span>
          {category.productCount != null && (
            <span>{category.productCount} products</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(category)}
            className="w-7 h-7 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-cream hover:border-gold/30 transition-all"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="w-7 h-7 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-vermillion hover:border-vermillion/30 transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && expanded && category.children.map((child) => (
          <CategoryRow
            key={child._id}
            category={child}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

// ─── Build tree from flat list ────────────────────────────────────────────────
function buildTree(flat) {
  const map  = {};
  const tree = [];
  flat.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  flat.forEach((c) => {
    const parentId = c.parent?._id || c.parent;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[c._id]);
    } else {
      tree.push(map[c._id]);
    }
  });
  return tree;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null);   // category being edited
  const [deleting,   setDeleting]   = useState(null);   // category being deleted
  const queryClient                  = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn:  async () => {
      const res = await adminGetCategories();
      return res.data?.data || res.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminDeleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDeleting(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed — check for sub-categories'),
  });

  const flat = Array.isArray(data) ? data : [];
  const tree = buildTree(flat);

  const handleEdit = (category) => {
    setEditing(category);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <PageWrapper>
      <DashboardShell title="Categories" subtitle="Admin">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="text-stone/50 text-xs font-mono">
            {flat.length} categor{flat.length !== 1 ? 'ies' : 'y'} total
            {' · '}
            {flat.filter((c) => c.level === 0).length} root
          </p>
          <button
            onClick={handleCreate}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-5 shrink-0"
          >
            <Plus size={13} /> New Category
          </button>
        </div>

        {/* Table header */}
        <div className="border border-white/[0.07] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.07] bg-[#111]">
            <span className="text-[10px] font-mono text-stone/30 uppercase tracking-widest flex-1">
              Category
            </span>
            <span className="hidden sm:block text-[10px] font-mono text-stone/30 uppercase tracking-widest mr-14">
              Level · Sort
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-3 border-b border-white/[0.04]">
                  <Skeleton className="h-5 w-48" />
                </div>
              ))}
            </div>
          ) : flat.length === 0 ? (
            <div className="text-center py-16">
              <Tag size={28} className="mx-auto text-stone/20 mb-4" />
              <p className="font-display text-xl text-cream mb-2">No categories yet</p>
              <p className="text-stone text-sm">Create your first category to get started</p>
            </div>
          ) : (
            <div>
              {tree.map((cat) => (
                <CategoryRow
                  key={cat._id}
                  category={cat}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          )}
        </div>

      </DashboardShell>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <CategoryModal
            open={modalOpen}
            onClose={handleClose}
            editing={editing}
            categories={flat}
            queryClient={queryClient}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleting && (
          <DeleteConfirm
            category={deleting}
            onCancel={() => setDeleting(null)}
            onConfirm={() => deleteMutation.mutate(deleting._id)}
            isPending={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}