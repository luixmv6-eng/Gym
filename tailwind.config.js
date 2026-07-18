/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#F97316', soft: '#FB923C', deep: '#EA580C' },
        accent: { DEFAULT: '#22C55E', soft: '#4ADE80' },
        bg: {
          DEFAULT: '#0A0E16', // página (near-black, ligeramente frío)
          soft: '#111827', // superficie elevada
          card: '#151D2C', // tarjetas
          raised: '#1B2536', // modales / popovers
        },
        line: {
          DEFAULT: '#26324A',
          soft: '#1E293B',
        },
        muted: '#8A98AD',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 8px 30px -8px rgba(249,115,22,0.45)',
        'glow-accent': '0 8px 30px -8px rgba(34,197,94,0.4)',
      },
      backgroundImage: {
        ember: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        'ember-deep': 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
