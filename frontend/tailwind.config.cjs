/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1F3D2B',
        forestDeep: '#16291D',
        leaf: '#6FA85C',
        turmeric: '#D99A2B',
        turmericDeep: '#B5791C',
        rust: '#B5482E',
        success: '#3F6E3C',
        parchment: '#F5F0E1',
        parchmentDark: '#EAE1C6',
        soil: '#2B2419',
        soilMuted: '#6B5D45',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};