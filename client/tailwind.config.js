/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3f0",
          100: "#e8e4dc",
          200: "#d2c9b9",
          300: "#bbaa96",
          400: "#a48c73",
          500: "#8d7150",
          600: "#715a40",
          700: "#554330",
          800: "#382c20",
          900: "#1c1610",
        },
        secondary: {
          50: "#f0f6f9",
          100: "#dceaf2",
          200: "#b9d5e5",
          300: "#96c0d8",
          400: "#73abcb",
          500: "#5096be",
          600: "#407898",
          700: "#305a72",
          800: "#203c4c",
          900: "#101e26",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Raleway", "sans-serif"],
      },
    },
  },
  plugins: [],
}
