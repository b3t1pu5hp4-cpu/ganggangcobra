/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1512",
        "ink-deep": "#0F0B09",
        ivory: "#F1E9DA",
        brass: "#A9824C",
        "brass-light": "#c19a63",
        rose: "#B4685A",
        moss: "#565C46",
      },
      fontFamily: {
        display: ['"Cormorant SC"', '"EB Garamond"', "serif"],
        body: ['"EB Garamond"', "serif"],
        mono: ['"Space Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
