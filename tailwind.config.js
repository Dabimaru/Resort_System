/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        resort: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        sand: '#f2efe8',
        sunset: '#d98c5f',
        deep: '#0e1726',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(14, 23, 38, 0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(14,23,38,0.72), rgba(14,23,38,0.28))',
      },
    },
  },
  plugins: [],
};
