/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        navy: {
          50:  '#f0f4fa',
          100: '#dde6f5',
          200: '#c3d3ed',
          300: '#9ab5df',
          400: '#6b8fce',
          500: '#4a6eb8',
          600: '#3856a0',
          700: '#2e4483',
          800: '#1e3068',
          900: '#14204e',
          950: '#0d1530',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
