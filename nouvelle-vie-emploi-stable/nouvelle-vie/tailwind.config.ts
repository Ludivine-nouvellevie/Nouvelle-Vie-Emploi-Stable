import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#152B4E", deep: "#0D1D38" },
        gold: { DEFAULT: "#E3A857", deep: "#B8792E" },
        cream: "#FFFDF9",
        line: "#EEE9DD",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
