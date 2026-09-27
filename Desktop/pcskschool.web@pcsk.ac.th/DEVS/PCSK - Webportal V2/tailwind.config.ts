import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./systems/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-prompt)", "var(--font-sarabun)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Enforce readable scale where base is 16px
        xs: ["0.75rem", { lineHeight: "1rem" }],     // 12px - metadata, footnotes
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px - helper text, captions, secondary
        base: ["1rem", { lineHeight: "1.5rem" }],     // 16px - default primary content & body
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px - section header
        xl: ["1.25rem", { lineHeight: "1.75rem" }],  // 20px - subheadings
        "2xl": ["1.5rem", { lineHeight: "2rem" }],   // 24px - page title
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      },
    },
  },
  plugins: [],
};

export default config;
