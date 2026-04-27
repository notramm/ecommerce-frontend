export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const ORDER_STATUS = {
  pending_payment:   { label: 'Pending Payment',  color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  confirmed:         { label: 'Confirmed',         color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  processing:        { label: 'Processing',        color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  shipped:           { label: 'Shipped',           color: 'text-purple-400', bg: 'bg-purple-400/10' },
  out_for_delivery:  { label: 'Out for Delivery',  color: 'text-orange-400', bg: 'bg-orange-400/10' },
  delivered:         { label: 'Delivered',         color: 'text-emerald-400',bg: 'bg-emerald-400/10'},
  cancelled:         { label: 'Cancelled',         color: 'text-red-400',    bg: 'bg-red-400/10'    },
  refund_initiated:  { label: 'Refund Initiated',  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  refunded:          { label: 'Refunded',          color: 'text-stone',      bg: 'bg-stone/10'      },
};

export const PAYMENT_STATUS = {
  pending:   { label: 'Pending',   color: 'text-yellow-500' },
  paid:      { label: 'Paid',      color: 'text-emerald-400'},
  failed:    { label: 'Failed',    color: 'text-red-400'    },
  refunded:  { label: 'Refunded',  color: 'text-stone'      },
};

export const ROLES = {
  CUSTOMER: 'customer',
  VENDOR:   'vendor',
  AGENT:    'agent',
  ADMIN:    'admin',
};

export const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Relevance'          },
  { value: 'newest',     label: 'Newest First'        },
  { value: 'price_asc',  label: 'Price: Low to High'  },
  { value: 'price_desc', label: 'Price: High to Low'  },
  { value: 'rating',     label: 'Top Rated'           },
  { value: 'popular',    label: 'Most Popular'        },
];

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Chandigarh','Puducherry','Jammu and Kashmir','Ladakh',
];

export const COUPON_TYPES  = ['flat', 'percent'];
export const VEHICLE_TYPES = ['bike', 'bicycle', 'scooter', 'car', 'van'];

export const PAGE_SIZE = 24;