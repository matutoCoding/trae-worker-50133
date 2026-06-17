/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: "#0D1B2A",
          secondary: "#1B2838",
          tertiary: "#243447",
        },
        "border-color": "#2D3F54",
        text: {
          primary: "#E8EEF2",
          secondary: "#8AA4B8",
          muted: "#5C7A91",
        },
        accent: {
          primary: "#457B9D",
          success: "#2EC4B6",
          warning: "#FFD60A",
          danger: "#E63946",
          notice: "#FF9F1C",
        },
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(69, 123, 157, 0.4), 0 0 40px rgba(69, 123, 157, 0.1)",
        "glow-success": "0 0 20px rgba(46, 196, 182, 0.4), 0 0 40px rgba(46, 196, 182, 0.1)",
        "glow-warning": "0 0 20px rgba(255, 214, 10, 0.4), 0 0 40px rgba(255, 214, 10, 0.1)",
        "glow-danger": "0 0 20px rgba(230, 57, 70, 0.4), 0 0 40px rgba(230, 57, 70, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink: "blink 1s step-end infinite",
        scan: "scan 2s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
