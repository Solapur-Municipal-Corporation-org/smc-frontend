import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        // Existing department-portal fonts (unchanged, still used outside /citizen)
        sans: ["var(--font-manrope)", "sans-serif"],
        marathi: ["var(--font-tiro-marathi)", "serif"],
        // Citizen Portal module fonts
        display: ["Sora", "Noto Sans Devanagari", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        citizen: ["Inter", "Noto Sans Devanagari", "Segoe UI", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // Existing simple brand tokens (unchanged, still used outside /citizen)
        brand: {
          light: "#AC5288",
          DEFAULT: "#7A3470",
          dark: "#3C1053",
        },
        // Citizen Portal design system (shadcn-style HSL tokens)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f6eef7",
          100: "#e9d6ea",
          600: "#74316e",
          700: "#582160",
          800: "#3c1053",
          900: "#241033",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          500: "#ac5288",
          600: "#8f3f71",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "#16a34a",
        warning: "#d97706",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glossy: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,42,90,.18)",
        "glossy-lg": "0 12px 40px -12px rgba(16,42,90,.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #AC5288 0%, #3C1053 100%)",
        "gov-gradient": "linear-gradient(135deg, #241033 0%, #582160 45%, #74316e 70%, #ac5288 100%)",
        sheen: "linear-gradient(120deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,0) 60%)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in .4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
