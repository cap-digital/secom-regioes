import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // gov.br institutional palette
        gov: {
          blue: "#1351B4",
          navy: "#0C326F",
          sky: "#5992ED",
          red: "#E52207",
          yellow: "#FFCD07",
          green: "#168821",
        },
        ink: "#0d1b2a",
        muted: "#64748b",
        surface: "#f4f6fb",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(13,27,42,0.06), 0 8px 24px -12px rgba(13,27,42,0.12)",
        float: "0 8px 40px -12px rgba(19,81,180,0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
