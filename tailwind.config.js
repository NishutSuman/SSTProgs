/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        flag: {
          red: "#dc2626",
          amber: "#d97706",
          green: "#16a34a",
        },
        brand: {
          DEFAULT: "#4f46e5",
          soft: "#eef2ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
