/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#020817',
          900: '#040d21',
          800: '#070f2b',
          700: '#0a1628',
          600: '#0f1f3d',
          500: '#162447',
          400: '#1e3a5f',
          300: '#2d5282',
        },
        brand: {
          blue: '#3b82f6',
          'blue-dark': '#1d4ed8',
          'blue-light': '#60a5fa',
          amber: '#f59e0b',
          green: '#10b981',
          purple: '#8b5cf6',
          red: '#ef4444',
        }
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(59,130,246,0.08), 0 4px 24px rgba(0,0,0,0.3)',
        'glow': '0 0 30px rgba(59,130,246,0.15)',
        'glow-amber': '0 0 30px rgba(245,158,11,0.15)',
        'glow-green': '0 0 30px rgba(16,185,129,0.15)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
