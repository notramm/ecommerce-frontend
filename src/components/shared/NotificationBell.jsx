import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import { Bell, Check, Package, ShoppingBag, DollarSign, Info } from 'lucide-react';
import { useQuery, useMutation }        from '@tanstack/react-query';
import { Link }                         from 'react-router-dom';
import { getMyNotifications, markNotificationsRead, getUnreadCount } from '../../api/notification.api';
import useAuthStore                     from '../../store/authStore';
import { cn, formatRelative }           from '../../utils/formatters';
import useClickOutside                  from '../../hooks/useClickOutside';

const TYPE_ICONS = {
  order_confirmed:  Package,
  order_update:     Package,
  order_delivered:  Package,
  new_order:        ShoppingBag,
  payout_completed: DollarSign,
  refund:           DollarSign,
  default:          Info,
};

function NotifItem({ notif, onRead }) {
  const Icon = TYPE_ICONS[notif.type] || TYPE_ICONS.default;
  return (
    <div
      onClick={() => !notif.isRead && onRead([notif._id])}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 cursor-pointer',
        'border-b border-white/[0.05] last:border-b-0 transition-colors',
        notif.isRead
          ? 'hover:bg-white/[0.02]'
          : 'bg-gold/3 hover:bg-gold/5'
      )}
    >
      <div className={cn(
        'w-8 h-8 flex items-center justify-center border shrink-0 mt-0.5',
        notif.isRead ? 'border-white/[0.08]' : 'border-gold/25 bg-gold/10'
      )}>
        <Icon size={13} className={notif.isRead ? 'text-stone/40' : 'text-gold'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium line-clamp-1', notif.isRead ? 'text-stone' : 'text-cream')}>
          {notif.title}
        </p>
        <p className="text-stone/40 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <p className="text-stone/25 text-[10px] font-mono mt-1">
          {formatRelative(notif.createdAt)}
        </p>
      </div>
      {!notif.isRead && (
        <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
      )}
    </div>
  );
}

export default function NotificationBell() {
  const [open,    setOpen]    = useState(false);
  const ref                    = useRef(null);
  const { isLoggedIn }         = useAuthStore();

  useClickOutside(ref, () => setOpen(false));

  const { data: unreadData, refetch: refetchCount } = useQuery({
    queryKey:  ['unread-count'],
    queryFn:   async () => { const { data } = await getUnreadCount(); return data.data.count; },
    enabled:   isLoggedIn,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: notifsData, refetch } = useQuery({
    queryKey:  ['notifications'],
    queryFn:   async () => {
      const { data } = await getMyNotifications({ page: 1, limit: 10 });
      return data.data;
    },
    enabled:   isLoggedIn && open,
    staleTime: 30 * 1000,
  });

  const readMutation = useMutation({
    mutationFn: (ids) => markNotificationsRead(ids),
    onSuccess:  () => { refetch(); refetchCount(); },
  });

  const count   = unreadData || 0;
  const notifs  = notifsData?.notifications || [];

  if (!isLoggedIn) return null;

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-stone hover:text-cream transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-vermillion text-cream text-[9px] font-mono font-bold px-0.5"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d0d] border border-white/[0.08] shadow-card z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <p className="eyebrow text-stone/50 text-[10px]">Notifications</p>
                {count > 0 && (
                  <span className="text-[9px] font-mono text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5">
                    {count} new
                  </span>
                )}
              </div>
              {count > 0 && (
                <button
                  onClick={() => readMutation.mutate([])}
                  className="flex items-center gap-1 text-[10px] text-stone/40 hover:text-gold transition-colors"
                >
                  <Check size={10} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell size={20} className="text-stone/20 mb-2" />
                  <p className="text-stone/40 text-xs">No notifications yet</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <NotifItem
                    key={n._id}
                    notif={n}
                    onRead={(ids) => readMutation.mutate(ids)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.07] px-4 py-2.5">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-[10px] text-stone/40 hover:text-gold transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}