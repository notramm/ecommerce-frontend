import { Toaster } from 'sonner';

export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background:   '#1a1a1a',
          border:       '1px solid rgba(255,255,255,0.07)',
          color:        '#f5f0e8',
          fontFamily:   '"DM Sans", sans-serif',
          fontSize:     '14px',
          borderRadius: '0',
        },
        success: {
          style: { borderLeftColor: '#c9a96e', borderLeftWidth: '3px' },
          icon: '✦',
        },
        error: {
          style: { borderLeftColor: '#c94a2e', borderLeftWidth: '3px' },
        },
      }}
    />
  );
}