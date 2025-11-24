export default {
  darkMode: "class",
};
module.exports = {
  theme: {
    extend: {
      keyframes: {
        flower: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.35)" },
        },
      },
      animation: {
        "flower-pulse": "flower 1.2s ease-in-out infinite",
      },
    },
  },
};
