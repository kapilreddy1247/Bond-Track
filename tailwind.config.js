/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Bond-Track Companion design tokens — see design plan in MEMORY.md / chat history.
        background: "#EDF3F2",   // pale seafoam
        surface: "#FFFFFF",
        ink: "#16262B",          // primary text
        brand: "#2E6F6E",        // muted teal
        accent: "#E8A33D",       // warm marigold CTA
        danger: "#C24C3D",       // muted brick red (errors only)
        muted: "#5B6E70",        // secondary text
        border: "#D7E2E0",
      },
      fontFamily: {
        display: ["Sora_600SemiBold"],
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
      },
    },
  },
  plugins: [],
};
