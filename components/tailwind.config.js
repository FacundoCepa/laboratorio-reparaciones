/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#1C1B18",
        surface: "#2B2926",
        surface2: "#1F1D1A",
        border: "#454239",
        border2: "#3a372f",
        ink: "#EDE8DF",
        muted: "#B8A48C",
        dim: "#8a8578",
        accent: "#E8873A",
        good: "#7FBF7F",
        warn: "#F2B705",
        bad: "#E86A5C",
        info: "#4FB4A8",
      },
    },
  },
  plugins: [],
};
