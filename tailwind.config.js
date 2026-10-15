/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ev: {
          dark: '#080d1a',
          card: '#0f172a',
          border: '#1e293b',
          cyan: '#06b6d4',
          cyanGlow: '#22d3ee',
          green: '#10b981',
          greenGlow: '#34d399',
          amber: '#f59e0b',
          rose: '#f43f5e',
          slate: '#334155',
          muted: '#64748b',
          accent: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.45)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
