/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Neue Montreal', 'system-ui', 'sans-serif'],
      },
      colors: {
        glow: '#00FF94',
        background: '#000000',
      },
    },
  },
  plugins: [],
}