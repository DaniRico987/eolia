/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      colors: {
        tierra: {
          oscura: "#2C1A0E",
        },
        verde: {
          musgo: "#3B5233",
          oliva: "#6B7C45",
        },
        dorado: {
          trigo: "#C4922A",
        },
        crema: "#F5F0E8",
        arena: "#E8DCC8",
        blanco: {
          hueso: "#FDFAF5",
        },
      },
      boxShadow: {
        subtle: "0 2px 12px rgba(44, 26, 14, 0.07)",
      },
    },
  },
  plugins: [],
}
