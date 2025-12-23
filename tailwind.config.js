/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-grass': '#278E2A',
        'pond-blue': '#00B5E6',
        'pond-yellow': '#EFD409',
        'white-green': '#DAFFD5',
        'another-green': '#369929ff',
        'sea-blue': '#1d66cdff'
      },
    },
  },
  plugins: [],
}