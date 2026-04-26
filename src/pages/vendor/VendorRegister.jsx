import { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm }   from 'react-hook-form';
import { z }         from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Store, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import { registerVendor } from '../../api/vendor.api';
import useAuthStore  from '../../store/authStore';
import { cn }        from '../../utils/formatters';
import { toast }     from 'sonner';

const schema = z.object({
  storeName:   z.string().min(3, 'Min 3 characters').max(100),
  storeDesc:   z.string().max(500).optional(),
  storeEmail:  z.string().email('Valid email required').optional().or(z.literal('')),
  storePhone:  z.string().regex(/^[6-9]\d{9}$/, 'Valid phone').optional().or(z.literal('')),
  panNumber:   z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN (e.g. ABCDE1234F)'),
  gstNumber:   z.string().optional().or(z.literal('')),
  line1:       z.string().min(5, 'Address required'),
  city:        z.string().min(2),
  state:       z.string().min(2),
  pincode:     z.string().regex(/^\d{6}$/, '6-digit pincode'),
});

const PERKS = [
  'Reach millions of customers',
  'Dedicated seller support',
  'Fast, reliable payouts',
  'Powerful analytics dashboard',
  'Easy product management',
];

const STEPS_INFO = [
  { n: 1, label: 'Register Store' },
  { n: 2, label: 'Complete KYC' },
  { n: 3, label: 'Start Selling' },
];

export default function VendorRegister() {
  const navigate         = useNavigate();
  const { updateUser }   = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d) => registerVendor({
      storeName:    d.storeName,
      storeDesc:    d.storeDesc,
      storeEmail:   d.storeEmail,
      storePhone:   d.storePhone,
      panNumber:    d.panNumber,
      gstNumber:    d.gstNumber,
      storeAddress: { line1: d.line1, city: d.city, state: d.state, pincode: d.pincode },
    }),
    onSuccess: () => {
      updateUser({ role: 'vendor' });
      toast.success('Vendor account created! Please complete KYC.');
      navigate('/vendor/kyc');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Registration failed'),
  });

  const Field = ({ name, label, placeholder, required, hint }) => (
    <div>
      <label className="eyebrow text-stone/50 text-[10px] block mb-1.5">
        {label}{required && <span className="text-vermillion ml-1">*</span>}
      </label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/25 px-4 py-3 text-sm outline-none transition-all',
          'focus:border-gold/40',
          errors[name] ? 'border-vermillion/40' : 'border-white/[0.07]'
        )}
      />
      {errors[name] && <p className="text-[10px] text-vermillion/80 mt-1">{errors[name].message}</p>}
      {hint && !errors[name] && <p className="text-[10px] text-stone/30 mt-1">{hint}</p>}
    </div>
  );

  return (
    <PageWrapper>
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-16 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <p className="eyebrow text-gold/50 mb-4">Sell on LUXE</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight mb-6">
              Grow your business<br />
              <span className="italic text-gradient-gold">with us</span>
            </h1>
            <p className="text-stone text-sm leading-relaxed mb-8 max-w-sm">
              Join thousands of vendors already selling on LUXE. Simple setup, powerful tools,
              transparent payouts.
            </p>

            <div className="space-y-3 mb-10">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 size={15} className="text-gold shrink-0" />
                  <span className="text-sm text-stone">{p}</span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="flex items-center gap-4">
              {STEPS_INFO.map((s, i) => (
                <div key={s.n} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 border border-gold/30 bg-gold/10 flex items-center justify-center text-gold font-mono text-xs">
                      {s.n}
                    </div>
                    <p className="text-[9px] text-stone/40 uppercase tracking-wider text-center">{s.label}</p>
                  </div>
                  {i < STEPS_INFO.length - 1 && <div className="w-8 h-px bg-white/[0.06] mb-5" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={handleSubmit(mutate)} className="space-y-5">
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6 space-y-4">
                <p className="eyebrow text-stone/40 text-[10px] mb-2">Store Information</p>
                <Field name="storeName"  label="Store Name"    placeholder="My Awesome Store" required />
                <div>
                  <label className="eyebrow text-stone/50 text-[10px] block mb-1.5">Store Description</label>
                  <textarea
                    {...register('storeDesc')}
                    placeholder="Tell customers what you sell..."
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/25 px-4 py-3 text-sm outline-none resize-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field name="storeEmail" label="Store Email" placeholder="store@email.com" />
                  <Field name="storePhone" label="Store Phone" placeholder="9876543210" />
                </div>
              </div>

              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6 space-y-4">
                <p className="eyebrow text-stone/40 text-[10px] mb-2">Legal Information</p>
                <Field
                  name="panNumber"
                  label="PAN Number"
                  placeholder="ABCDE1234F"
                  required
                  hint="Your personal or business PAN"
                />
                <Field
                  name="gstNumber"
                  label="GST Number"
                  placeholder="27ABCDE1234F1Z5"
                  hint="Optional — add for GST benefits"
                />
              </div>

              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6 space-y-4">
                <p className="eyebrow text-stone/40 text-[10px] mb-2">Pickup Address</p>
                <Field name="line1"   label="Address"  placeholder="Street, Building" required />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field name="city"    label="City"    placeholder="Mumbai"  required />
                  <Field name="state"   label="State"   placeholder="Maharashtra" required />
                  <Field name="pincode" label="Pincode" placeholder="400001"  required />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isPending}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary py-4 sm:py-5 flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Store size={16} />}
                {isPending ? 'Creating Store...' : 'Create Vendor Account'}
                {!isPending && <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}