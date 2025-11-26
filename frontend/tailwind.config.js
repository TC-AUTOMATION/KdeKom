/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        designer: ['DESIGNER', 'sans-serif'],
      },
      colors: {
        // shadcn/ui variables (keep for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // LUSTRAUTO Unified Color Palette (theme-aware via CSS variables)
        app: {
          // Base colors (noir/gris)
          black: 'var(--app-black)',        // Fond principal, sidebar
          dark: 'var(--app-dark)',         // Cards, containers, elements dark
          border: 'var(--app-border)',       // Borders, separators, buttons
          hover: 'var(--app-hover)',        // Hover states
          active: 'var(--app-active)',       // Active states

          // Text colors (gris/blanc)
          'text-primary': 'var(--app-text-primary)',     // Textes principaux
          'text-secondary': 'var(--app-text-secondary)',   // Textes labels, descriptions
          'text-muted': 'var(--app-text-muted)',       // Textes secondaires, disabled

          // Brand colors
          'brand-blue': 'var(--app-brand-blue)',       // Logo LUSTR'AUTO
        },

        // Status colors (keep for functional usage)
        status: {
          success: '#10b981',      // Green - Factures payées, revenus
          warning: '#f59e0b',      // Orange - Alertes, avertissements
          error: '#ef4444',        // Red - Erreurs, retards
          info: '#60a5fa',         // Blue - Informations
        },
      },
      borderRadius: {
        lg: "6px",
        md: "4px",
        sm: "2px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
