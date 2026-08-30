/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0908",
        bone: {
          50: "#fdfbf7",
          100: "#f7f2e9",
          200: "#efe6d3",
          300: "#e2d3b3",
        },
        gold: {
          300: "#dcc088",
          400: "#c9a55c",
          500: "#b8934a",
          600: "#9c7a3a",
          700: "#7a5f2c",
        },
        wine: {
          500: "#7a1220",
          600: "#5c0e18",
          700: "#3d0a10",
        },
      },
      fontFamily: {
        display: ["'Quicksand'", "Arial", "sans-serif"],
        serif: ["'Quicksand'", "Arial", "sans-serif"],
        sans: ["Inter", "Arial", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ink-gradient": "linear-gradient(160deg, #0b0908 0%, #1c1512 55%, #2a1c14 100%)",
        "gold-fade": "linear-gradient(120deg, rgba(201,165,92,0.18), rgba(201,165,92,0) 60%)",
      },
      boxShadow: {
        lux: "0 20px 45px -15px rgba(11,9,8,0.35)",
        "lux-sm": "0 10px 25px -12px rgba(11,9,8,0.3)",
      },
      letterSpacing: {
        widest2: "0.28em",
      },
    },
  },
  plugins: [],
};
