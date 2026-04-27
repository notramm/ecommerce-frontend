import { useState }  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Users, Ban, CheckCircle2, Search, ChevronDown } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getAllUsers, banUser, unbanUser } from '../../api/admin.api';
import { cn, formatDate } from '../../utils/formatters';
import { toast }     from 'sonner';

function UserRow({ user, onBan, onUnban }) {
  const [expanded,   setExpanded]   = useState(false);
  const [banReason,  setBanReason]  = useState('');
  const [showBanForm,setShowBanForm]= useState(false);

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 sm:gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="w-9 h-9 bg-gold/10 border border-gold/15 flex items-center justify-center text-gold font-display shrink-0">
          {user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-cream text-sm font-medium">{user.name}</span>
            <span className={cn(
              'text-[10px] font-mono border px-2 py-0.5 capitalize',
              user.role === 'admin'  ? 'text-vermillion border-vermillion/20 bg-vermillion/5' :
              user.role === 'vendor' ? 'text-gold border-gold/20 bg-gold/5' :
              'text-stone border-white/[0.08]'
            )}>
              {user.role}
            </span>
            {user.isBanned && (
              <span className="text-[10px] font-mono border border-vermillion/30 bg-vermillion/10 text-vermillion px-2 py-0.5">Banned</span>
            )}
          </div>
          <p className="text-stone/40 text-xs font-mono truncate">
            {user.email || user.phone} · Joined {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn(
            'text-[10px] font-mono hidden sm:block',
            user.isEmailVerified || user.isPhoneVerified ? 'text-emerald-400' : 'text-stone/30'
          )}>
            {user.isEmailVerified || user.isPhoneVerified ? '✓ Verified' : 'Unverified'}
          </span>
          <ChevronDown size={14} className={cn('text-stone/40 transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-t border-white/[0.06] px-4 py-4 space-y-3"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><p className="text-stone/30 mb-0.5">Wallet</p><p className="text-cream font-mono">₹{user.walletBalance || 0}</p></div>
            <div><p className="text-stone/30 mb-0.5">Providers</p><p className="text-cream">{user.authProviders?.length || 0}</p></div>
            <div><p className="text-stone/30 mb-0.5">Phone</p><p className="text-cream font-mono">{user.phone || '—'}</p></div>
            <div><p className="text-stone/30 mb-0.5">Last Login</p><p className="text-cream">{user.lastLogin ? formatDate(user.lastLogin) : '—'}</p></div>
          </div>

          {user.isBanned ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-vermillion/60 flex-1">Ban reason: {user.banReason}</p>
              <button
                onClick={() => onUnban(user._id)}
                className="flex items-center gap-1.5 px-3 py-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs hover:bg-emerald-500/10 transition-colors"
              >
                <CheckCircle2 size={12} /> Unban
              </button>
            </div>
          ) : (
            <>
              {showBanForm ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Reason for ban (required)"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-vermillion/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
                  />
                  <button
                    onClick={() => { if (banReason.trim()) onBan(user._id, banReason); }}
                    disabled={!banReason.trim()}
                    className="px-3 py-2 bg-vermillion/10 border border-vermillion/30 text-vermillion text-xs hover:bg-vermillion/20 disabled:opacity-40 whitespace-nowrap"
                  >
                    Confirm Ban
                  </button>
                  <button onClick={() => setShowBanForm(false)} className="px-3 py-2 border border-white/[0.08] text-stone text-xs hover:text-cream">
                    Cancel
                  </button>
                </div>
              ) : (
                user.role !== 'admin' && (
                  <button
                    onClick={() => setShowBanForm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-vermillion/15 text-vermillion/60 text-xs hover:border-vermillion/30 hover:text-vermillion transition-all"
                  >
                    <Ban size={12} /> Ban User
                  </button>
                )
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const [role,   setRole]   = useState('');
  const [search, setSearch] = useState('');
  const [banned, setBanned] = useState('');
  const queryClient          = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey:  ['admin-users', role, search, banned],
    queryFn:   () => getAllUsers({
      role:     role    || undefined,
      search:   search  || undefined,
      isBanned: banned  || undefined,
      limit:    40,
    }),
    staleTime: 2 * 60 * 1000,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }) => banUser(id, reason),
    onSuccess:  () => { toast.success('User banned'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess:  () => { toast.success('User unbanned'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const users = data?.data?.users || [];
  const total = data?.data?.meta?.total || 0;

  return (
    <PageWrapper>
      <DashboardShell title="User Management" subtitle="Admin">

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 pl-9 pr-4 py-2 text-xs outline-none"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-[#0f0f0f] border border-white/[0.07] text-stone px-3 py-2 text-xs outline-none focus:border-gold/30"
          >
            <option value="">All Roles</option>
            {['customer','vendor','agent','admin'].map((r) => (
              <option key={r} value={r} className="bg-[#0f0f0f] capitalize">{r}</option>
            ))}
          </select>
          <select
            value={banned}
            onChange={(e) => setBanned(e.target.value)}
            className="bg-[#0f0f0f] border border-white/[0.07] text-stone px-3 py-2 text-xs outline-none focus:border-gold/30"
          >
            <option value="">All Status</option>
            <option value="false" className="bg-[#0f0f0f]">Active</option>
            <option value="true"  className="bg-[#0f0f0f]">Banned</option>
          </select>
        </div>

        {total > 0 && (
          <p className="text-stone/40 text-xs font-mono mb-4">{total} users found</p>
        )}

        {isLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="text-stone text-sm">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                onBan={(id, reason) => banMutation.mutate({ id, reason })}
                onUnban={(id) => unbanMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}