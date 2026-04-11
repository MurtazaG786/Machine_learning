/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
        accent: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        dark: { 900: '#0f0c29', 800: '#302b63', 700: '#24243e', 600: '#1a1a3e' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      backdropBlur: { xs: '2px' },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }
    }
  },
  plugins: []
}
