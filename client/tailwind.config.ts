import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cinematic dark palette
        cinema: {
          950: '#050508',
          900: '#0a0a12',
          800: '#111120',
          700: '#1a1a2e',
          600: '#252540',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          DEFAULT: '#111120',
          muted: '#1a1a2e',
          subtle: '#252540',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cinema':
          'linear-gradient(135deg, #050508 0%, #0a0a12 40%, #111120 100%)',
        'gradient-gold':
          'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)',
        'gradient-accent':
          'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6)' },
        },
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(245, 158, 11, 0.25)',
        'gold-md': '0 0 24px rgba(245, 158, 11, 0.35)',
        'gold-lg': '0 0 48px rgba(245, 158, 11, 0.4)',
        'accent-sm': '0 0 12px rgba(139, 92, 246, 0.25)',
        'accent-md': '0 0 24px rgba(139, 92, 246, 0.35)',
        'inner-gold': 'inset 0 1px 0 rgba(245, 158, 11, 0.1)',
      },
      borderColor: {
        'gold-subtle': 'rgba(245, 158, 11, 0.15)',
        'white-subtle': 'rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
