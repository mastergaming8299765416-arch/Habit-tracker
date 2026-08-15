/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        ink: "#2E2A26",
        sage: "#8FA98B",
        sagelight: "#E4ECE2",
        rose: "#D98E8E",
        roselight: "#F6E4E4",
        sand: "#E8DFCF",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
