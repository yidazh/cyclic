/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom theme colors for time tracking
        pause: {
          DEFAULT: '#94a3b8',
          light: '#cbd5e1',
          dark: '#64748b',
        },
      },
    },
  },
  plugins: [],
};
