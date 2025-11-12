/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'halyard': ['halyard-display', 'sans-serif'],
        'owners': ['owners-xnarrow', 'sans-serif'],
      },
      colors: {
        'text': '#151515',
        'bg': '#fff',
        'link': '#151515',
        'link-hover': '#000000',
        'close': '#a22d1d',
      },
      spacing: {
        'page-padding': '1.5rem',
        'c-gap': '0.5rem',
        'column': '80px',
        'panel-gap': '1rem',
      },
      aspectRatio: {
        'image': '4/5',
      },
      fontSize: {
        'l': '18px',
        'xl': 'clamp(2rem, 10vw, 6rem)',
      },
    },
  },
  plugins: [],
}

