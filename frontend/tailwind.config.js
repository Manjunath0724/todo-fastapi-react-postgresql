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
        navy: {
          900: '#0A192F',
          800: '#112D4E',
        },
        cyan: {
          500: '#00ADB5',
          400: '#3FC1C9',
        },
        amber: {
          500: '#FF5722',
          600: '#F9A825',
        },
        emerald: {
          500: '#4CAF50',
          600: '#00C853',
        },
        primary: {
          DEFAULT: '#00ADB5',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#00ADB5',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
    },
  },
  plugins: [],
}
