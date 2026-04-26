import { useState }  from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm }   from 'react-hook-form';
import { z }         from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Plus, Check, Edit2, Trash2, Home, Briefcase, Loader2 } from 'lucide-react';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress }
  from '../../api/user.api';
import { cn }        from '../../utils/formatters';
import { toast }     from 'sonner';

const addressSchema = z.object({
  label:    z.string().optional(),
  fullName: z.string().min(2,  'Full name required'),
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Valid phone required'),
  line1:    z.string().min(5,  'Address required'),
  line2:    z.string().optional(),
  city:     z.string().min(2,  'City required'),
  state:    z.string().min(2,  'State required'),
  pincode:  z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode'),
  isDefault: z.boolean().optional(),
});

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Chandigarh','Puducherry','Jammu and Kashmir','Ladakh',
];

// ── Address form ──────────────────────────────────────────────────────────────
function AddressForm({ defaultValues, onSubmit, onCancel, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || { label: 'Home', isDefault: false },
  });

  const Field = ({ name, label, placeholder, type = 'text', required, children }) => (
    <div>
      <label className="eyebrow text-stone/50 text-[10px] block mb-1.5">
        {label}{required && <span className="text-vermillion ml-1">*</span>}
      </label>
      {children || (
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className={cn(
            'w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/25',
            'px-4 py-3 text-sm font-sans outline-none transition-all duration-300',
            'focus:border-gold/40 focus:ring-1 focus:ring-gold/10',
            errors[name] ? 'border-vermillion/40' : 'border-white/[0.07]'
          )}
        />
      )}
      {errors[name] && (
        <p className="text-[10px] text-vermillion/80 mt-1">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Label */}
      <div>
        <p className="eyebrow text-stone/50 text-[10px] mb-2">Label</p>
        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map((l) => (
            <label key={l} className="flex items-center gap-2 cursor-pointer">
              <input {...register('label')} type="radio" value={l} className="hidden peer" />
              <span className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.07] text-xs text-stone peer-checked:border-gold/40 peer-checked:text-gold peer-checked:bg-gold/5 transition-all duration-200 cursor-pointer">
                {l === 'Home' ? <Home size={11} /> : l === 'Work' ? <Briefcase size={11} /> : <MapPin size={11} />}
                {l}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="fullName" label="Full Name" placeholder="John Doe" required />
        <Field name="phone"    label="Phone"     placeholder="9876543210" required />
      </div>

      {/* Address lines */}
      <Field name="line1" label="Address Line 1" placeholder="House/Flat no., Street" required />
      <Field name="line2" label="Address Line 2" placeholder="Landmark, Area (optional)" />

      {/* City, State, Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field name="city"    label="City"    placeholder="Mumbai" required />

        <div>
          <label className="eyebrow text-stone/50 text-[10px] block mb-1.5">
            State <span className="text-vermillion ml-1">*</span>
          </label>
          <select
            {...register('state')}
            className={cn(
              'w-full bg-[#0a0a0a] border text-cream',
              'px-4 py-3 text-sm outline-none transition-all duration-300',
              'focus:border-gold/40',
              errors.state ? 'border-vermillion/40' : 'border-white/[0.07]'
            )}
          >
            <option value="" className="bg-[#0a0a0a]">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
            ))}
          </select>
          {errors.state && <p className="text-[10px] text-vermillion/80 mt-1">{errors.state.message}</p>}
        </div>

        <Field name="pincode" label="Pincode" placeholder="400001" required />
      </div>

      {/* Default checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <input {...register('isDefault')} type="checkbox" className="hidden peer" />
        <span className="w-4 h-4 border border-white/[0.15] flex items-center justify-center peer-checked:border-gold peer-checked:bg-gold transition-all shrink-0">
          <Check size={10} className="text-obsidian opacity-0 peer-checked:opacity-100" />
        </span>
        <span className="text-sm text-stone group-hover:text-cream transition-colors">
          Set as default address
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {defaultValues?._id ? 'Update Address' : 'Save Address'}
        </motion.button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm px-4">
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

// ── Address card ──────────────────────────────────────────────────────────────
function AddressCard({ address, selected, onSelect, onEdit, onDelete, onSetDefault }) {
  const isDefault = address.isDefault;
  return (
    <motion.div
      layout
      className={cn(
        'relative border p-4 cursor-pointer transition-all duration-300',
        selected
          ? 'border-gold/50 bg-gold/5'
          : 'border-white/[0.07] hover:border-white/[0.15] bg-[#0f0f0f]'
      )}
      onClick={() => onSelect(address._id)}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Selected indicator */}
      <div className={cn(
        'absolute top-3.5 right-3.5 w-4 h-4 border-2 flex items-center justify-center transition-all duration-200',
        selected ? 'border-gold bg-gold' : 'border-white/[0.2]'
      )}>
        {selected && <Check size={9} className="text-obsidian" strokeWidth={3} />}
      </div>

      {/* Label */}
      <div className="flex items-center gap-2 mb-2 pr-8">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-stone/50 border border-white/[0.06] px-2 py-0.5">
          {address.label === 'Home' ? <Home size={9} /> : <Briefcase size={9} />}
          {address.label || 'Address'}
        </span>
        {isDefault && (
          <span className="text-[10px] font-mono text-gold/60 bg-gold/5 border border-gold/20 px-2 py-0.5">
            Default
          </span>
        )}
      </div>

      <p className="text-cream text-sm font-medium mb-0.5">{address.fullName}</p>
      <p className="text-stone text-xs mb-0.5">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
      <p className="text-stone text-xs mb-0.5">{address.city}, {address.state} — {address.pincode}</p>
      <p className="text-stone/60 text-xs font-mono">{address.phone}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.05]">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(address); }}
          className="flex items-center gap-1.5 text-[10px] text-stone/40 hover:text-cream transition-colors"
        >
          <Edit2 size={10} /> Edit
        </button>
        {!isDefault && (
          <button
            onClick={(e) => { e.stopPropagation(); onSetDefault(address._id); }}
            className="flex items-center gap-1.5 text-[10px] text-stone/40 hover:text-gold transition-colors"
          >
            <Check size={10} /> Set Default
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(address._id); }}
          className="flex items-center gap-1.5 text-[10px] text-stone/40 hover:text-vermillion transition-colors ml-auto"
        >
          <Trash2 size={10} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

// ── Main selector ─────────────────────────────────────────────────────────────
export default function AddressSelector({ selectedId, onSelect }) {
  const [editing,  setEditing]  = useState(null); // address object or 'new'
  const queryClient             = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn:  async () => { const { data } = await getAddresses(); return data.data.addresses; },
    staleTime: 5 * 60 * 1000,
  });

  const addresses = data || [];

  // Auto-select default address
  if (!selectedId && addresses.length > 0) {
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    if (def) onSelect(def._id);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const saveMutation = useMutation({
    mutationFn: (d) => editing === 'new'
      ? addAddress(d)
      : updateAddress(editing._id, d),
    onSuccess: (res) => {
      invalidate();
      setEditing(null);
      toast.success(editing === 'new' ? 'Address added' : 'Address updated');
      if (editing === 'new') {
        const newAddr = res.data.data.address;
        if (newAddr) onSelect(newAddr._id);
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => { invalidate(); toast.success('Address deleted'); },
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => invalidate(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-28 border border-white/[0.06] bg-[#0f0f0f] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Address list */}
      <AnimatePresence>
        {addresses.map((addr) => (
          <AddressCard
            key={addr._id}
            address={addr}
            selected={selectedId === addr._id}
            onSelect={onSelect}
            onEdit={(a) => setEditing(a)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onSetDefault={(id) => defaultMutation.mutate(id)}
          />
        ))}
      </AnimatePresence>

      {/* Add new / form */}
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border border-gold/20 bg-gold/3 p-5">
              <p className="eyebrow text-gold/50 text-[10px] mb-4">
                {editing === 'new' ? 'Add New Address' : 'Edit Address'}
              </p>
              <AddressForm
                defaultValues={editing !== 'new' ? editing : undefined}
                onSubmit={(d) => saveMutation.mutate(d)}
                onCancel={() => setEditing(null)}
                isLoading={saveMutation.isPending}
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setEditing('new')}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-dashed border-white/[0.1] text-stone/50 hover:text-cream hover:border-gold/30 transition-all duration-300 text-sm"
          >
            <Plus size={14} />
            Add New Address
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}