import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette pulled from shesellsremote.com
        brand: {
          pink: "#EE2C82",
          "pink-soft": "#FFCEEC",
          blue: "#3A71B0",
          "blue-soft": "#E6F4FF",
          gold: "#C9883A",
          cream: "#F6F2F0",
          ink: "#1D1B1D",
        },
      },
      fontFamily: {
        heading: ["var(--font-josefin)", "ui-sans-serif", "sans-serif"],
        serif: ["var(--font-garamond)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
