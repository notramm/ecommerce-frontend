import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Pencil, Trash2, X, Upload,
  ChevronRight, FolderOpen, Folder,
  Settings, ChevronDown, ToggleLeft, ToggleRight,
  GripVertical, AlertCircle, Check, Type, Hash,
  List, ToggleRight as Toggle, Calendar, AlignLeft,
} from 'lucide-react';
import PageWrapper    from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }   from '../../components/ui/Skeleton';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  getCategoryFields,
  createCategoryField,
  updateCategoryField,
  deleteCategoryField,
  addFieldOption,
  removeFieldOption,
} from '../../api/admin.api';
import { cn } from '../../utils/formatters';
import { toast } from 'sonner';

const FIELD_TYPES = [
  { value: 'text',     label: 'Text',        icon: Type     },
  { value: 'textarea', label: 'Long Text',    icon: AlignLeft },
  { value: 'number',   label: 'Number',       icon: Hash     },
  { value: 'dropdown', label: 'Dropdown',     icon: List     },
  { value: 'radio',    label: 'Radio',        icon: List     },
  { value: 'checkbox', label: 'Checkbox',     icon: List     },
  { value: 'boolean',  label: 'Yes/No',       icon: Toggle   },
  { value: 'date',     label: 'Date',         icon: Calendar },
];

const SELECTABLE = ['dropdown', 'radio', 'checkbox'];

// ── Build tree from flat list ──────────────────────────────────────────────────
function buildTree(flat) {
  const map  = {};
  const tree = [];
  flat.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  flat.forEach((c) => {
    const parentId = c.parent?._id || c.parent;
    if (parentId && map[parentId]) map[parentId].children.push(map[c._id]);
    else tree.push(map[c._id]);
  });
  return tree;
}

// ── Category Modal ─────────────────────────────────────────────────────────────
function CategoryModal({ open, onClose, editing, categories, queryClient }) {
  const isEdit = !!editing;
  const [name,        setName]        = useState(editing?.name        || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [parentId,    setParentId]    = useState(editing?.parent?._id || editing?.parent || '');
  const [sortOrder,   setSortOrder]   = useState(editing?.sortOrder   ?? 0);
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(editing?.image       || null);
  const fileRef                        = useRef(null);

  const validParents = categories.filter((c) => c.level < 2 && c._id !== editing?._id);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name',        name);
      fd.append('description', description);
      fd.append('sortOrder',   sortOrder);
      if (parentId) fd.append('parentId', parentId);
      if (file)     fd.append('image',    file);
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
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-cream">
            {isEdit ? 'Edit Category' : 'Create Category'}
          </p>
          <button onClick={onClose} className="text-stone hover:text-cream transition-colors">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
          />
        </div>

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

// ── Delete Confirm ─────────────────────────────────────────────────────────────
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
          Delete <span className="text-cream font-medium">"{category.name}"</span>? Cannot be undone.
        </p>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 btn-outline py-3 text-xs">Cancel</button>
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

// ── Field Form (Create / Edit) ─────────────────────────────────────────────────
function FieldForm({ categoryId, field, onClose, queryClient }) {
  const isEdit = !!field;
  const [label,       setLabel]       = useState(field?.label       || '');
  const [description, setDescription] = useState(field?.description || '');
  const [placeholder, setPlaceholder] = useState(field?.placeholder || '');
  const [fieldType,   setFieldType]   = useState(field?.fieldType   || 'text');
  const [isRequired,  setIsRequired]  = useState(field?.isRequired  ?? false);
  const [isFilterable,setIsFilterable]= useState(field?.isFilterable ?? false);
  const [isSearchable,setIsSearchable]= useState(field?.isSearchable ?? false);
  const [sortOrder,   setSortOrder]   = useState(field?.sortOrder   ?? 0);
  const [minValue,    setMinValue]    = useState(field?.minValue     ?? '');
  const [maxValue,    setMaxValue]    = useState(field?.maxValue     ?? '');
  const [unit,        setUnit]        = useState(field?.unit         || '');
  const [minLength,   setMinLength]   = useState(field?.minLength    ?? '');
  const [maxLength,   setMaxLength]   = useState(field?.maxLength    ?? '');
  const [options,     setOptions]     = useState(field?.options      || []);
  const [optLabel,    setOptLabel]    = useState('');
  const [optValue,    setOptValue]    = useState('');

  const needsOptions = SELECTABLE.includes(fieldType);

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? updateCategoryField(categoryId, field._id, body)
      : createCategoryField(categoryId, body),
    onSuccess: () => {
      toast.success(isEdit ? 'Field updated' : 'Field created');
      queryClient.invalidateQueries({ queryKey: ['cat-fields', categoryId] });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const handleSubmit = () => {
    if (!label.trim()) { toast.error('Label required'); return; }
    if (!fieldType)    { toast.error('Field type required'); return; }
    if (needsOptions && options.length < 2) {
      toast.error('Add at least 2 options for this field type');
      return;
    }

    const body = {
      label:       label.trim(),
      description: description.trim(),
      placeholder: placeholder.trim(),
      fieldType,
      isRequired,
      isFilterable,
      isSearchable,
      sortOrder: Number(sortOrder),
      options,
      ...(fieldType === 'number' && {
        minValue: minValue !== '' ? Number(minValue) : null,
        maxValue: maxValue !== '' ? Number(maxValue) : null,
        unit,
      }),
      ...(['text', 'textarea'].includes(fieldType) && {
        minLength: minLength !== '' ? Number(minLength) : null,
        maxLength: maxLength !== '' ? Number(maxLength) : null,
      }),
    };

    mutation.mutate(body);
  };

  const addOption = () => {
    if (!optLabel.trim() || !optValue.trim()) { toast.error('Label and value required'); return; }
    if (options.find((o) => o.value === optValue.trim())) { toast.error('Value already exists'); return; }
    setOptions([...options, { label: optLabel.trim(), value: optValue.trim() }]);
    setOptLabel('');
    setOptValue('');
  };

  const removeOption = (idx) => setOptions(options.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-lg bg-[#0d0d0d] border border-white/[0.08] flex flex-col max-h-[90vh]"
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <p className="font-display text-base text-cream">
            {isEdit ? 'Edit Field' : 'Add Custom Field'}
          </p>
          <button onClick={onClose} className="text-stone hover:text-cream transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Field type selector */}
          {!isEdit && (
            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-2">Field Type *</label>
              <div className="grid grid-cols-4 gap-1.5">
                {FIELD_TYPES.map(({ value, label: lbl, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFieldType(value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 border text-center transition-all',
                      fieldType === value
                        ? 'border-gold/50 bg-gold/10 text-gold'
                        : 'border-white/[0.07] text-stone/60 hover:text-cream hover:border-white/20'
                    )}
                  >
                    <Icon size={14} />
                    <span className="text-[9px] font-mono leading-tight">{lbl}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Label */}
          <div>
            <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Label *</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`e.g. ${fieldType === 'number' ? 'Screen Size' : 'Color'}`}
              className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
            />
          </div>

          {/* Description + Placeholder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Help Text</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shown below field"
                className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
              />
            </div>
            {!needsOptions && (
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Placeholder</label>
                <input
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="e.g. Enter size..."
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* Number constraints */}
          {fieldType === 'number' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Min Value</label>
                <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
                />
              </div>
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Max Value</label>
                <input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)}
                  placeholder="100"
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
                />
              </div>
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Unit</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                  placeholder="GB, inch..."
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* Text length constraints */}
          {['text', 'textarea'].includes(fieldType) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Min Length</label>
                <input type="number" value={minLength} onChange={(e) => setMinLength(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
                />
              </div>
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Max Length</label>
                <input type="number" value={maxLength} onChange={(e) => setMaxLength(e.target.value)}
                  placeholder="500"
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2.5 text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* Options (dropdown/radio/checkbox) */}
          {needsOptions && (
            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                Options * <span className="text-stone/30">(min 2 required)</span>
              </label>

              {/* Existing options */}
              {options.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#0a0a0a] border border-white/[0.06] px-3 py-2">
                      <span className="text-cream text-xs flex-1">{opt.label}</span>
                      <span className="text-stone/40 text-[10px] font-mono">{opt.value}</span>
                      <button
                        onClick={() => removeOption(i)}
                        className="text-stone/30 hover:text-vermillion transition-colors ml-2"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add option row */}
              <div className="flex gap-2">
                <input
                  value={optLabel}
                  onChange={(e) => setOptLabel(e.target.value)}
                  placeholder="Label (shown to user)"
                  className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                />
                <input
                  value={optValue}
                  onChange={(e) => setOptValue(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="value (stored)"
                  className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                />
                <button
                  onClick={addOption}
                  className="px-3 border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-[10px] text-stone/30 mt-1">Press Enter or + to add option</p>
            </div>
          )}

          {/* Toggles */}
          <div className="flex gap-4 flex-wrap pt-1">
            {[
              { label: 'Required',   val: isRequired,   set: setIsRequired   },
              { label: 'Filterable', val: isFilterable,  set: setIsFilterable  },
              { label: 'Searchable', val: isSearchable,  set: setIsSearchable  },
            ].map(({ label: lbl, val, set }) => (
              <button
                key={lbl}
                onClick={() => set(!val)}
                className="flex items-center gap-2 text-xs"
              >
                {val
                  ? <ToggleRight size={20} className="text-gold" />
                  : <ToggleLeft  size={20} className="text-stone/30" />
                }
                <span className={val ? 'text-cream' : 'text-stone/50'}>{lbl}</span>
              </button>
            ))}
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-3">
            <label className="eyebrow text-stone/40 text-[10px] shrink-0">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-20 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.07] shrink-0">
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full btn-primary py-3.5 disabled:opacity-40"
          >
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Field' : 'Create Field'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Category Fields Panel ──────────────────────────────────────────────────────
function CategoryFieldsPanel({ category, onClose, queryClient }) {
  const [fieldForm, setFieldForm] = useState(null); // null | 'new' | fieldObj

  const { data, isLoading } = useQuery({
    queryKey: ['cat-fields', category._id],
    queryFn:  async () => {
      const { data } = await getCategoryFields(category._id);
      return data?.data?.fields || [];
    },
    staleTime: 60 * 1000,
  });

  const fields = data || [];

  const deleteMutation = useMutation({
    mutationFn: (fieldId) => deleteCategoryField(category._id, fieldId),
    onSuccess:  () => {
      toast.success('Field deleted');
      queryClient.invalidateQueries({ queryKey: ['cat-fields', category._id] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const FIELD_TYPE_ICONS = {
    text: Type, textarea: AlignLeft, number: Hash,
    dropdown: List, radio: List, checkbox: List,
    boolean: Toggle, date: Calendar,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-2xl bg-[#0d0d0d] border border-white/[0.08] flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <p className="eyebrow text-gold/50 text-[10px] mb-0.5">Category Fields</p>
            <p className="text-cream text-sm font-medium">{category.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFieldForm('new')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-colors"
            >
              <Plus size={13} /> Add Field
            </button>
            <button onClick={onClose} className="text-stone hover:text-cream transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Fields list */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-12">
              <Settings size={24} className="mx-auto text-stone/20 mb-3" />
              <p className="text-stone text-sm mb-4">No custom fields yet</p>
              <button
                onClick={() => setFieldForm('new')}
                className="btn-outline text-xs flex items-center gap-2 mx-auto"
              >
                <Plus size={13} /> Add First Field
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((f) => {
                const TypeIcon = FIELD_TYPE_ICONS[f.fieldType] || Tag;
                return (
                  <div
                    key={f._id}
                    className={cn(
                      'flex items-center gap-3 p-3.5 border transition-all',
                      f.isActive
                        ? 'border-white/[0.07] bg-[#0f0f0f]'
                        : 'border-white/[0.04] bg-transparent opacity-50'
                    )}
                  >
                    <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <TypeIcon size={13} className="text-stone/50" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-cream text-sm font-medium">{f.label}</span>
                        <span className="text-[10px] font-mono text-stone/40 border border-white/[0.06] px-1.5 py-0.5">
                          {f.fieldType}
                        </span>
                        {f.isRequired && (
                          <span className="text-[10px] font-mono text-vermillion/60 border border-vermillion/20 px-1.5 py-0.5">
                            required
                          </span>
                        )}
                        {f.isFilterable && (
                          <span className="text-[10px] font-mono text-gold/50 border border-gold/15 px-1.5 py-0.5">
                            filterable
                          </span>
                        )}
                        {!f.isActive && (
                          <span className="text-[10px] font-mono text-stone/30 border border-white/[0.06] px-1.5 py-0.5">
                            inactive
                          </span>
                        )}
                      </div>
                      <p className="text-stone/40 text-[10px] font-mono mt-0.5">
                        key: {f.key}
                        {f.options?.length > 0 && ` · ${f.options.length} options`}
                        {f.unit && ` · unit: ${f.unit}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setFieldForm(f)}
                        className="w-7 h-7 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-cream hover:border-gold/30 transition-all"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete field "${f.label}"?`)) {
                            deleteMutation.mutate(f._id);
                          }
                        }}
                        className="w-7 h-7 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-vermillion hover:border-vermillion/30 transition-all"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Field form modal */}
      {fieldForm && (
        <FieldForm
          categoryId={category._id}
          field={fieldForm === 'new' ? null : fieldForm}
          onClose={() => setFieldForm(null)}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

// ── Category Row ───────────────────────────────────────────────────────────────
function CategoryRow({ category, level = 0, onEdit, onDelete, onManageFields }) {
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
        {/* Expand toggle */}
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onManageFields(category)}
            className="w-7 h-7 border border-white/[0.08] flex items-center justify-center text-stone/50 hover:text-gold hover:border-gold/30 transition-all"
            title="Manage Fields"
          >
            <Settings size={11} />
          </button>
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
            onManageFields={onManageFields}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [deleting,       setDeleting]       = useState(null);
  const [fieldsCategory, setFieldsCategory] = useState(null); // category to manage fields
  const queryClient                          = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn:  async () => {
      const res = await adminGetCategories();
      const arr = res.data?.data?.categories || res.data?.data || res.data || [];
      return Array.isArray(arr) ? arr : [];
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

  const handleEdit   = (cat) => { setEditing(cat); setModalOpen(true); };
  const handleCreate = ()    => { setEditing(null); setModalOpen(true); };
  const handleClose  = ()    => { setModalOpen(false); setEditing(null); };

  return (
    <PageWrapper>
      <DashboardShell title="Categories" subtitle="Admin">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-stone/50 text-xs font-mono">
              {flat.length} categor{flat.length !== 1 ? 'ies' : 'y'} ·{' '}
              {flat.filter((c) => c.level === 0).length} root
            </p>
            <p className="text-stone/30 text-[10px] mt-0.5">
              Click ⚙ on a category to manage its custom fields
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-5 shrink-0"
          >
            <Plus size={13} /> New Category
          </button>
        </div>

        {/* Table */}
        <div className="border border-white/[0.07] overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.07] bg-[#111]">
            <span className="text-[10px] font-mono text-stone/30 uppercase tracking-widest flex-1">
              Category
            </span>
            <span className="hidden sm:block text-[10px] font-mono text-stone/30 uppercase tracking-widest mr-24">
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
                  onManageFields={setFieldsCategory}
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

      {/* Category Fields Panel */}
      <AnimatePresence>
        {fieldsCategory && (
          <CategoryFieldsPanel
            category={fieldsCategory}
            onClose={() => setFieldsCategory(null)}
            queryClient={queryClient}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}