/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian:  { DEFAULT: '#0a0a0a', 50: '#1a1a1a', 100: '#141414' },
        cream:     { DEFAULT: '#f5f0e8', 50: '#faf8f4', 100: '#ede8de' },
        gold:      { DEFAULT: '#c9a96e', light: '#e0c896', dark: '#a8854a' },
        stone:     { DEFAULT: '#8c8479', light: '#b5afa6', dark: '#5c574f' },
        vermillion: { DEFAULT: '#c94a2e', light: '#e06550' },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in':   'slideIn 0.5s ease forwards',
        'shimmer':    'shimmer 1.5s infinite',
        'float':      'float 3s ease-in-out infinite',
        'grain':      'grain 0.5s steps(1) infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        grain:   {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%':     { transform: 'translate(-2%,-3%)' },
          '30%':     { transform: 'translate(3%,-1%)' },
          '50%':     { transform: 'translate(-1%,3%)' },
          '70%':     { transform: 'translate(2%,1%)' },
          '90%':     { transform: 'translate(-3%,2%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url('/noise.png')",
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-in':  'cubic-bezier(0.7, 0, 0.84, 0)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'luxury': '0 0 0 1px rgba(201,169,110,0.15), 0 20px 60px -10px rgba(0,0,0,0.5)',
        'card':   '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 4px 20px rgba(0,0,0,0.3)',
        'glow':   '0 0 40px rgba(201,169,110,0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};