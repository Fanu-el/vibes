/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#172033",
        elevated: "#202C44",
        border: "#31415C",
        text: "#E5EDF5",
        muted: "#9FB0C3",
        primary: "#14B8A6",
        accent: "#A78BFA",
        danger: "#FCA5A5",
        success: "#86EFAC",
      },
      fontFamily: {
        sans: ["Nunito_400Regular"],
        medium: ["Nunito_500Medium"],
        semibold: ["Nunito_600SemiBold"],
        bold: ["Nunito_700Bold"],
      },
    },
  },
  plugins: [],
};
