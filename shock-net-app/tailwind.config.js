/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Shock Net colors (from existing HTML mockups)
        'shock-purple': '#7B1FA2',
        'shock-purple-light': '#E1BEE7',
        'shock-green': '#2E7D32',
        'shock-green-light': '#C8E6C9',
        'shock-orange': '#E65100',
        'shock-orange-light': '#FFF3E0',
        'shock-blue': '#1565C0',
        'shock-blue-light': '#E3F2FD',
        'shock-red': '#C62828',
        'shock-red-light': '#FFCDD2',
        'shock-teal': '#00695C',
        'shock-teal-light': '#B2DFDB',

        // Admin Portal colors
        'admin-blue': '#0D47A1',
        'admin-blue-light': '#BBDEFB',
        'shock-cyan': '#00838F',
        'shock-cyan-light': '#B2EBF2',
      },
    },
  },
  plugins: [],
}
