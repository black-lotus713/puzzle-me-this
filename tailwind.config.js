/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        tan: '#E8DDD0',
        olive: '#6B7C5C',
        charcoal: '#2C2C2C',
        muted: '#8A8A7A',
      },
    },
  },
  plugins: [],
}
