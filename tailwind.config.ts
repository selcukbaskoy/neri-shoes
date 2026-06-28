import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#111111",
        accent: "#FFD000",
        foreground: "#FFFFFF",
        muted: "#A8A8A8",
        gold: {
          100: "#FFF4CC",
          300: "#FFD000",
          600: "#B8960B",
          900: "#4A3C03",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
        serif: ["var(--font-bodoni)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
