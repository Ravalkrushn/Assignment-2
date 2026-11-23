import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0C0E",
        "background-secondary": "#101317",
        "primary-text": "#EDE7DC",
        "secondary-text": "#9EA5A8",
        muted: "#6C7378",
        amber: {
          DEFAULT: "#E8913C",
          hover: "#f39f4c",
          glow: "rgba(232, 145, 60, 0.15)",
        },
        teal: {
          DEFAULT: "#2E6B72",
          hover: "#398088",
          subtle: "rgba(46, 107, 114, 0.15)",
        },
        hairline: "rgba(237, 231, 220, 0.13)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        sora: ["var(--font-sora)", "sans-serif"],
      },
      borderColor: {
        hairline: "rgba(237, 231, 220, 0.13)",
      },
    },
  },
  plugins: [],
};
export default config;
