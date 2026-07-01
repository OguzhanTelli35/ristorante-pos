/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pos: {
          bg: '#020617',        // slate-950
          surface: '#0f172a',   // slate-900
          card: '#1e293b',      // slate-800
          border: '#334155',    // slate-700
          muted: '#64748b',     // slate-500
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'toast-exit': 'fadeOut 0.25s ease forwards',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          to: { opacity: '0', transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.25)' },
          '50%': { boxShadow: '0 0 16px 2px rgba(59, 130, 246, 0.12)' },
        },
      },
    },
  },
  plugins: [],
};
