/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#22d3ee',
        'neon-pink': '#f472b6',
      }
    },
  },
  plugins: [],
}