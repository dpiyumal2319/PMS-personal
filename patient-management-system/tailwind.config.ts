import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B70CF',
          50: '#C0D5F2',
          100: '#AFCAEE',
          200: '#8DB3E7',
          300: '#6B9DE0',
          400: '#4A86D9',
          500: '#2B70CF',
          600: '#2157A1',
          700: '#183E72',
          800: '#0E2544',
          900: '#040B15',
          950: '#000000'
        },
        background: '#F5F5F5'
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      }
    },
  },
  plugins: [],
} satisfies Config;
