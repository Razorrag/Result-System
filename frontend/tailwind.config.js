// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // <-- This line is crucial for the App Router
  ],
  theme: {
    extend: {
      colors: {
        'jecrc-maroon': '#800000',
        'jecrc-gold': '#FFD700',
      },
    },
  },
  plugins: [],
}