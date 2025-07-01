/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Add this line to enable class-based dark mode
  theme: {
    extend: {
      // Optional: extend your color palette for dark mode
      colors: {
        dark: {
          100: '#1a1a1a',
          200: '#2a2a2a',
          // Add more dark mode specific colors if needed
        }
      }
    },
  },
  plugins: [],
}