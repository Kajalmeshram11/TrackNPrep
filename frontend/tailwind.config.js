/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Integrate custom colors
      colors: {
        'primary': '#FF9324', // Now you can use 'bg-primary', 'text-primary', etc.
      },
      // Integrate custom font family
      fontFamily: {
        'display': ['Urbanist', 'sans-serif'], // Now you can use 'font-display'
      },
      // Integrate custom breakpoint
      screens: {
        '3xl': '1920px', // Now you can use '3xl:text-lg', etc.
      }
    },
  },
  plugins: [],
}