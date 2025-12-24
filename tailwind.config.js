/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./layouts/**/*.html", "./content/**/*.md"],
  darkMode: "class", // Enable dark mode with class
  theme: {
    extend: {
      colors: {
        // Custom colors untuk rizkynotes.com style
        navy: {
          900: "#0f172a", // Dark background
          800: "#1e293b",
          700: "#334155",
          600: "#1B254B",
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
