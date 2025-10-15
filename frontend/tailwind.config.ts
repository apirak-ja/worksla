/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"IBM Plex Sans Thai"',
          'IBM Plex Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          purple: {
            50: '#F5F3F7',
            100: '#E6E0ED',
            200: '#D1C4DD',
            300: '#B9A4CC',
            400: '#9B7BC4',
            500: '#7B5BA4',
            600: '#6B4B94',
            700: '#5B3B84',
            800: '#4B2B74',
            900: '#3B1B64',
          },
          orange: {
            50: '#FEF6F1',
            100: '#FDE8DB',
            200: '#FBCFB5',
            300: '#F9B38E',
            400: '#FF9452',
            500: '#F17422',
            600: '#E1641A',
            700: '#C15412',
            800: '#A1440E',
            900: '#81340A',
          },
        },
        primary: {
          50: '#F5F3F7',
          100: '#E6E0ED',
          200: '#D1C4DD',
          300: '#B9A4CC',
          400: '#9B7BC4',
          500: '#7B5BA4',
          600: '#6B4B94',
          700: '#5B3B84',
          800: '#4B2B74',
          900: '#3B1B64',
        },
      },
      borderRadius: {
        'brand': '12px',
        'brand-lg': '16px',
      },
      boxShadow: {
        'brand': '0 4px 12px rgba(123, 91, 164, 0.15)',
        'brand-lg': '0 10px 24px rgba(123, 91, 164, 0.2)',
        'brand-xl': '0 20px 48px rgba(123, 91, 164, 0.25)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
