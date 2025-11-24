/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        // 🌸 loader (pokud ho používáš)
        flower: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.35)" },
        },

        // 🌈 background blob Animations
        blob: {
          "0%, 100%": { transform: "translate(0px,0px) scale(1)" },
          "33%": { transform: "translate(20px,-10px) scale(1.05)" },
          "66%": { transform: "translate(-15px,10px) scale(0.95)" },
        },
        blobReverse: {
          "0%, 100%": { transform: "translate(0px,0px) scale(1)" },
          "33%": { transform: "translate(-20px,10px) scale(1.05)" },
          "66%": { transform: "translate(15px,-10px) scale(0.95)" },
        },
        blobSlow: {
          "0%, 100%": { transform: "translate(0px,0px) scale(1)" },
          "50%": { transform: "translate(10px,-10px) scale(1.08)" },
        },

        // 🌸 padající lístky
        petalFall: {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: 1 },
          "100%": {
            transform: "translateY(120px) rotate(120deg)",
            opacity: 0,
          },
        },

        // 🔆 světlušky
        fireflyFloat: {
          "0%, 100%": {
            transform: "translate(0,0) scale(1)",
            opacity: 0.8,
          },
          "50%": {
            transform: "translate(10px,-20px) scale(1.3)",
            opacity: 1,
          },
        },
      },
      animation: {
        "flower-pulse": "flower 1.2s ease-in-out infinite",
        "blob-animate": "blob 8s infinite ease-in-out",
        "blob-animate-reverse": "blobReverse 10s infinite ease-in-out",
        "blob-animate-slow": "blobSlow 12s infinite ease-in-out",
        petalFall: "petalFall 4s infinite linear",
        fireflyFloat: "fireflyFloat 6s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
