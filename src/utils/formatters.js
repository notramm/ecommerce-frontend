import numeral from 'numeral';
import { format, formatDistanceToNow } from 'date-fns';

export const formatPrice   = (n) => `₹${numeral(n).format('0,0')}`;
export const formatDiscount = (mrp, price) => Math.round(((mrp - price) / mrp) * 100);
export const formatDate    = (d, fmt = 'dd MMM yyyy') => format(new Date(d), fmt);
export const formatRelative = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const formatRating  = (r) => Number(r).toFixed(1);
export const truncate      = (str, n = 60) => str?.length > n ? str.slice(0, n) + '…' : str;

export const cn = (...classes) =>
  classes.filter(Boolean).join(' ');