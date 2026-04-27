import { useState }  from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Bell, Send, BarChart3, Loader2 } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { sendBulkNotification, getNotificationStats } from '../../api/admin.api';
import { cn }        from '../../utils/formatters';
import { toast }     from 'sonner';

const AUDIENCES = [
  { value: 'all',       label: 'Everyone' },
  { value: 'customers', label: 'Customers Only' },
  { value: 'vendors',   label: 'Vendors Only' },
  { value: 'agents',    label: 'Delivery Agents' },
];

const NOTIFICATION_TYPES = ['announcement', 'promotion', 'system'];

export default function AdminNotifications() {
  const [title,    setTitle]    = useState('');
  const [message,  setMessage]  = useState('');
  const [audience, setAudience] = useState('all');
  const [type,     setType]     = useState('announcement');

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['notif-stats'],
    queryFn:  async () => { const { data } = await getNotificationStats(); return data.data; },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: () => sendBulkNotification({ title, message, targetAudience: audience, type }),
    onSuccess: (res) => {
      toast.success(`Sent to ${res.data.data.recipientCount} users`);
      setTitle(''); setMessage('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send'),
  });

  const stats   = statsData || {};
  const byType  = stats.byType || [];
  const readRate = stats.readRate || 0;

  return (
    <PageWrapper>
      <DashboardShell title="Bulk Notifications" subtitle="Admin">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Compose */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Send size={14} className="text-gold" />
              <p className="eyebrow text-stone/40 text-[10px]">Compose Notification</p>
            </div>

            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map((a) => (
                  <label key={a.value} className="cursor-pointer">
                    <input type="radio" value={a.value} checked={audience === a.value}
                      onChange={() => setAudience(a.value)} className="hidden peer" />
                    <span className="block text-center py-2 border border-white/[0.07] text-xs text-stone peer-checked:border-gold/40 peer-checked:text-gold peer-checked:bg-gold/5 transition-all">
                      {a.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Type</label>
              <div className="flex gap-2">
                {NOTIFICATION_TYPES.map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn('flex-1 py-2 border text-xs capitalize transition-all',
                      type === t ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/[0.07] text-stone/60 hover:text-cream'
                    )}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your notification message..."
                rows={4}
                className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none resize-none"
              />
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="bg-[#111] border border-white/[0.06] p-4">
                <p className="eyebrow text-stone/30 text-[10px] mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Bell size={13} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-cream text-xs font-medium">{title || 'Title...'}</p>
                    <p className="text-stone/60 text-[11px] mt-0.5 leading-relaxed">{message || 'Message...'}</p>
                  </div>
                </div>
              </div>
            )}

            <motion.button
              onClick={() => mutation.mutate()}
              disabled={!title.trim() || !message.trim() || mutation.isPending}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send to{' '}
              {AUDIENCES.find((a) => a.value === audience)?.label}
            </motion.button>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={14} className="text-gold" />
                <p className="eyebrow text-stone/40 text-[10px]">Notification Stats (30 days)</p>
              </div>

              {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 p-4 bg-[#0a0a0a] border border-white/[0.05]">
                    <div>
                      <p className="text-stone/40 text-xs mb-0.5">Total Sent</p>
                      <p className="font-display text-2xl text-cream">{(stats.totalSent || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-stone/40 text-xs mb-0.5">Read Rate</p>
                      <p className="font-display text-2xl text-gold">{readRate}%</p>
                    </div>
                  </div>

                  {byType.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-stone/30 mb-3">By Type</p>
                      {byType.map((t) => {
                        const pct = stats.totalSent > 0 ? ((t.count / stats.totalSent) * 100).toFixed(1) : 0;
                        const readPct = t.count > 0 ? ((t.read / t.count) * 100).toFixed(1) : 0;
                        return (
                          <div key={t._id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-stone capitalize">{t._id}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-stone/40 font-mono">{t.count}</span>
                                <span className="text-cream font-mono">{readPct}% read</span>
                              </div>
                            </div>
                            <div className="h-1 bg-white/[0.05]">
                              <motion.div
                                className="h-full bg-gold/40"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tips */}
            <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
              <p className="eyebrow text-stone/30 text-[10px] mb-3">Best Practices</p>
              <ul className="space-y-2">
                {[
                  'Keep titles under 50 characters for better visibility',
                  'Use emojis sparingly to catch attention',
                  'Send promotions early morning or evening',
                  'Avoid more than 2 notifications per week',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-stone/40">
                    <span className="text-gold mt-0.5 shrink-0">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}