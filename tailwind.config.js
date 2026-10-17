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
        devnio: {
          bg: '#F8FAFC',
          canvas: '#F1F5F9',
          card: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(226, 232, 240, 0.8)',
          indigo: '#4F46E5',
          indigoLight: '#6366F1',
          cobalt: '#2563EB',
          cyan: '#0EA5E9',
          charcoal: '#0F172A',
          slate: '#475569',
          muted: '#64748B',
        },
        ev: {
          dark: '#080d1a',
          card: '#0f172a',
          border: '#e2e8f0',
          cyan: '#0ea5e9',
          cyanGlow: '#38bdf8',
          green: '#10b981',
          greenGlow: '#34d399',
          amber: '#f59e0b',
          rose: '#f43f5e',
          slate: '#475569',
          muted: '#64748b',
          accent: '#4f46e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'glass': '0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        'glass-hover': '0 25px 35px -5px rgba(79, 70, 229, 0.09), 0 10px 15px -3px rgba(0, 0, 0, 0.03)',
        'glow-indigo': '0 0 25px -5px rgba(79, 70, 229, 0.35)',
        'glow-cobalt': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(14, 165, 233, 0.35)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
