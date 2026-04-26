/**
 * Dynamically load Razorpay checkout script.
 * Only loads once even if called multiple times.
 */
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script  = document.createElement('script');
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Open Razorpay checkout modal.
 * Returns a promise that resolves with payment response or rejects on failure/close.
 */
export const openRazorpayCheckout = ({
  key,
  amount,
  currency = 'INR',
  orderId,
  name     = 'LUXE Commerce',
  description,
  prefill  = {},
  theme    = {},
  notes    = {},
}) =>
  new Promise((resolve, reject) => {
    const options = {
      key,
      amount,
      currency,
      name,
      description,
      order_id:    orderId,
      prefill,
      notes,
      theme: {
        color:           '#c9a96e',
        backdrop_color:  'rgba(10,10,10,0.9)',
        hide_topbar:     false,
        ...theme,
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
        animation:  true,
      },
      handler: (response) => resolve(response),
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (res) => reject(new Error(res.error?.description || 'Payment failed')));
    rzp.open();
  });