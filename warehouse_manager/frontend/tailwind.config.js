module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      keyframes: {
        'fade-in-out': {
          '0%,100%': { opacity: 0 },
          '10%,90%': { opacity: 1 },
        },
      }, // <-- tutaj musi być przecinek!
      animation: {
        'fade-in-out': 'fade-in-out 2s ease-in-out',
      },
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
