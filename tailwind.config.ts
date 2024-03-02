import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Ember", "Helvetica", "Hiragino Kaku Gothic Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
