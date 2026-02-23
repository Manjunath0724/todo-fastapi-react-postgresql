/** 
 * Purpose: Tailwind configuration for class scanning and theme extensions
 * Why: Ensures only used styles ship and defines the brand color palette/font
 * How: Scans src for class names and extends theme with Inter and primary colors
 * @type {import('tailwindcss').Config} 
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF5C35', // Vibrant orange from dark theme
          blue: '#3B82F6',   // Bright blue from light theme
          dark: '#080808',   // Deep black background
          card: '#121212',   // Slightly lighter black for cards
          gray: '#9E9E9E',   // Muted text
        },
        navy: {
          900: '#0A192F',
          800: '#112D4E',
        },
        primary: {
          DEFAULT: '#FF5C35', // Defaulting to the vibrant orange
          50: '#FFF5F2',
          100: '#FFECE5',
          200: '#FFD1C2',
          300: '#FFB6A0',
          400: '#FF9B7D',
          500: '#FF5C35',
          600: '#E55330',
          700: '#CC4A2B',
          800: '#B34125',
          900: '#993720',
        },
      },
    },
  },
  plugins: [],
}
