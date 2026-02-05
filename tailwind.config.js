/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F2F2F2", // Silver Shine
        secondary: "#1C6E7A", // Deep Turquoise (Focus/Accent)
        background: "#0F0F0F", // Deep Black Gradient Base
        surface: "#1A1A1A", // Matte Dark Surface
        muted: "#BFC3C7", // Muted Silver
        border: "rgba(255, 255, 255, 0.1)",
        luxury: {
          gold: "#D4AF37", // VIP Only
          silver: "#E8E8E8",
        }
      },
      fontFamily: {
        playfair: ["PlayfairDisplay-Regular"],
        playfairBold: ["PlayfairDisplay-Bold"],
        montserrat: ["Montserrat-Regular"],
        montserratMedium: ["Montserrat-Medium"],
        montserratBold: ["Montserrat-Bold"],
      }
    },
  },
  plugins: [],
};
