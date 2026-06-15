/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['CrossfitBlack', 'Arial', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        'midnight-purple': '#2e1a47',
        'amethyst-purple': '#72569C',
        'dusk-purple': '#7c6992',
        'dawn-purple': '#AFABC9',
        'mist-purple': '#F6F3F9',
        'light-purple': '#E3DFEF',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.10)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.10)',
        'float': '0 6px 24px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.07)',
      },
      animation: {
        scroll: 'scroll 30s linear infinite',
        'scroll-reverse': 'scroll-reverse 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      }
    },
  },
  plugins: [],
}