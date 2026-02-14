/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'true-black': '#000000',
        'soft-white': '#EDEDED',
        'dim-gray': '#8A8A8A',
        'glitch-white': '#FFFFFF',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
