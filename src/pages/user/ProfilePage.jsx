import { useState }  from 'react';
import { useForm }   from 'react-hook-form';
import { z }         from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Camera, Save, Loader2, Shield, Link2 } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import useAuthStore  from '../../store/authStore';
import { updateProfile } from '../../api/user.api';
import { cn }        from '../../utils/formatters';
import { toast }     from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(50),
});

export default function ProfilePage() {
  const { user, updateUser }  = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver:      zodResolver(schema),
    defaultValues: { name: user?.name || '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const onSubmit = (d) => mutate(d);

  const providers = user?.authProviders || [];

  return (
    <PageWrapper>
      <DashboardShell title="My Profile" subtitle="Account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Profile form */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <p className="eyebrow text-stone/40 text-[10px] mb-5">Personal Information</p>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-display text-2xl overflow-hidden">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : user?.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : user?.name?.[0]?.toUpperCase()
                  }
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold flex items-center justify-center cursor-pointer hover:bg-gold-light transition-colors">
                  <Camera size={11} className="text-obsidian" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAvatarPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
              <div>
                <p className="text-cream text-sm font-medium">{user?.name}</p>
                <p className="text-stone/40 text-xs font-mono">{user?.role}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Full Name</label>
                <input
                  {...register('name')}
                  className={cn(
                    'w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/25',
                    'px-4 py-3 text-sm outline-none transition-all duration-300',
                    'focus:border-gold/40',
                    errors.name ? 'border-vermillion/40' : 'border-white/[0.07]'
                  )}
                />
                {errors.name && <p className="text-[10px] text-vermillion/80 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Email</label>
                <input
                  value={user?.email || '—'}
                  disabled
                  className="w-full bg-[#0a0a0a] border border-white/[0.04] text-stone/50 px-4 py-3 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Phone</label>
                <input
                  value={user?.phone || '—'}
                  disabled
                  className="w-full bg-[#0a0a0a] border border-white/[0.04] text-stone/50 px-4 py-3 text-sm cursor-not-allowed"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isPending || !isDirty}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </motion.button>
            </form>
          </div>

          {/* Account security */}
          <div className="space-y-4">
            {/* Verification status */}
            <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
              <p className="eyebrow text-stone/40 text-[10px] mb-4">Verification Status</p>
              <div className="space-y-3">
                {[
                  { label: 'Email',  verified: user?.isEmailVerified, value: user?.email },
                  { label: 'Phone',  verified: user?.isPhoneVerified, value: user?.phone },
                ].map(({ label, verified, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={13} className={verified ? 'text-emerald-400' : 'text-stone/30'} />
                      <span className="text-sm text-stone">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {value && <span className="text-[10px] text-stone/30 font-mono">{value}</span>}
                      <span className={cn(
                        'text-[10px] font-mono border px-2 py-0.5',
                        verified
                          ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                          : 'text-stone/40 border-white/[0.07]'
                      )}>
                        {verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked providers */}
            <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
              <p className="eyebrow text-stone/40 text-[10px] mb-4">Linked Accounts</p>
              {providers.length === 0 ? (
                <p className="text-stone/40 text-xs">No providers linked</p>
              ) : (
                <div className="space-y-2">
                  {providers.map((p, i) => (
                    <div key={`${p.provider}-${p.providerId || i}`} className="flex items-center gap-3 py-2">
                      <div className="w-7 h-7 bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                        <Link2 size={13} className="text-stone/50" />
                      </div>
                      <span className="text-sm text-stone capitalize">{p.provider}</span>
                      <span className="ml-auto text-[10px] text-emerald-400 font-mono">Connected</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet balance card */}
            <div className="bg-gradient-to-br from-[#141008] to-[#0a0a0a] border border-gold/15 p-5 sm:p-6">
              <p className="eyebrow text-gold/40 text-[10px] mb-2">Wallet Balance</p>
              <p className="font-display text-3xl text-gold">
                ₹{(user?.walletBalance || 0).toLocaleString()}
              </p>
              <p className="text-stone/40 text-xs mt-1">Available for checkout</p>
            </div>
          </div>
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}