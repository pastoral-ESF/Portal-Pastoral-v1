/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        pastoral: {
          DEFAULT: '#2B3890',
          primary: '#2B3890',
          deep: '#1A235A',
          light: '#3F4DAE',
          cyan: '#00ADEF',
          gold: '#FBB03B',
          red: '#E30613',
          lime: '#8DC63F',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(26, 35, 90, 0.08)',
        card: '0 2px 12px -2px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
