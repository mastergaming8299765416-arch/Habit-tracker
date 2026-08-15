/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        sand: "rgb(var(--border) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        sage: "rgb(var(--accent) / <alpha-value>)",
        sagelight: "rgb(var(--accent-light) / <alpha-value>)",
        accentLight: "rgb(var(--accent-light) / <alpha-value>)",
        rose: "rgb(var(--danger) / <alpha-value>)",
        roselight: "rgb(var(--danger-light) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
