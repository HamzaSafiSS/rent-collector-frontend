/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        surface: {
          DEFAULT: '#0b1120',
          light:   '#0f172a',
          card:    '#111827',
          elevated:'#1e293b',
        },
        // Light mode Navy & Emerald palette
        navy: {
          DEFAULT: '#1A2B3C',
          light:   '#2D4356',
        },
      }
    },
  },
  plugins: [],
}