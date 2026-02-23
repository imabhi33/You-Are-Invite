/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wedding: {
          dark: "#2b0f0f",
          maroon: "#4a1818",
          gold: "#d7b26d",
          cream: "#fff7e7"
        }
      },
      fontFamily: {
        script: ["Great Vibes", "cursive"],
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};