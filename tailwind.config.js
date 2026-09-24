/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './404.html', './src/**/*.{jsx,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd7ff',
          300: '#8ebeff',
          400: '#599bff',
          500: '#3378ff',
          600: '#1a58f5',
          700: '#1344e1',
          800: '#1639b6',
          900: '#18348f',
        },
        night: {
          900: '#0b1022',
          800: '#10172f',
          700: '#18203f',
        },
        peach: '#ffd6a5',
        mint: '#4ade80',
      },
      fontFamily: {
        sans: ['Tajawal', 'Readex Pro', 'system-ui', 'sans-serif'],
        display: ['Readex Pro', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.08)',
        glow: '0 0 0 1px rgba(51, 120, 255, 0.25), 0 10px 40px rgba(51, 120, 255, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pop-in': 'pop-in 0.25s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}