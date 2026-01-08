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
        'bright-green': '#46CF34',
        'sea-blue': '#1d66cdff',
        'dark-blue': '#0d438eff',
        'dark-gray': '#3d5b44ff'
      },
      screens: {
        'xs': '500px',
        'mdlg': '900px'
      }
    },
  },
  plugins: [],
}