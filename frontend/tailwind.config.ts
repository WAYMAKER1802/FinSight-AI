/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Brand Palette ──────────────────────────────────────────────
        brand: {
          50 : '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b9fc',
          400: '#8196f8',
          500: '#6675f1',
          600: '#5a54e5',
          700: '#4d44cb',
          800: '#3f39a4',
          900: '#373582',
          950: '#21204c',
        },
        // ─── Accent (Gold / Emerald) ────────────────────────────────────
        accent: {
          gold   : '#f59e0b',
          emerald: '#10b981',
          rose   : '#f43f5e',
          violet : '#8b5cf6',
          cyan   : '#06b6d4',
        },
        // ─── Dark Theme Surfaces ─────────────────────────────────────────
        dark: {
          50 : '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
        // ─── Glass Surface ────────────────────────────────────────────────
        glass: {
          border: 'rgba(255,255,255,0.1)',
          bg    : 'rgba(255,255,255,0.05)',
        },
      },
      fontFamily: {
        sans    : ['Inter', 'system-ui', 'sans-serif'],
        display : ['Outfit', 'Inter', 'sans-serif'],
        mono    : ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18' : '4.5rem',
        '22' : '5.5rem',
        '88' : '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      backgroundImage: {
        // ── Gradient Backgrounds ─────────────────────────────────────────
        'gradient-radial'   : 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic'    : 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient'     : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'card-gradient'     : 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
        'profit-gradient'   : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'loss-gradient'     : 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)',
        'gold-gradient'     : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'dark-gradient'     : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172033 100%)',
        'sidebar-gradient'  : 'linear-gradient(180deg, #0f172a 0%, #1a1f35 100%)',
      },
      boxShadow: {
        'glass'      : '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-lg'   : '0 25px 50px rgba(31, 38, 135, 0.25)',
        'glow'       : '0 0 20px rgba(102, 126, 234, 0.5)',
        'glow-green' : '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red'   : '0 0 20px rgba(244, 63, 94, 0.5)',
        'card'       : '0 4px 24px rgba(0, 0, 0, 0.2)',
        'card-hover' : '0 12px 40px rgba(0, 0, 0, 0.35)',
        'inner-glow' : 'inset 0 0 20px rgba(102, 126, 234, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in'       : 'fadeIn 0.5s ease-out',
        'fade-up'       : 'fadeUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left' : 'slideInLeft 0.4s ease-out',
        'scale-in'      : 'scaleIn 0.3s ease-out',
        'pulse-slow'    : 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float'         : 'float 6s ease-in-out infinite',
        'shimmer'       : 'shimmer 2s linear infinite',
        'glow-pulse'    : 'glowPulse 2s ease-in-out infinite',
        'count-up'      : 'countUp 1.5s ease-out',
        'spin-slow'     : 'spin 8s linear infinite',
        'bounce-subtle' : 'bounceSubtle 2s ease-in-out infinite',
        'marquee'       : 'marquee 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to  : { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to  : { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to  : { transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to  : { transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to  : { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%'     : { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%'  : { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)' },
          '50%'     : { boxShadow: '0 0 40px rgba(102, 126, 234, 0.7)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%'     : { transform: 'translateY(-5px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    // Custom plugin for glassmorphism utilities
    function({ addUtilities }) {
      const glassUtilities = {
        '.glass': {
          background       : 'rgba(255, 255, 255, 0.05)',
          backdropFilter   : 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border           : '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          background       : 'rgba(15, 23, 42, 0.6)',
          backdropFilter   : 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border           : '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.glass-card': {
          background       : 'rgba(30, 41, 59, 0.6)',
          backdropFilter   : 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border           : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow        : '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        '.text-gradient': {
          background      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip  : 'text',
        },
        '.text-gradient-gold': {
          background      : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip  : 'text',
        },
        '.shimmer-bg': {
          background     : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          backgroundSize : '200% 100%',
        },
      };
      addUtilities(glassUtilities);
    },
  ],
};
