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
        /* EV Telemetry semantic tokens — mirrored from src/index.css */
        ev: {
          bg: '#F3F6FB',
          surface: '#FFFFFF',
          surface2: '#F8FAFC',
          border: 'rgba(15, 23, 42, 0.08)',
          borderStrong: '#E2E8F0',
          ink: '#0F172A',
          ink2: '#334155',
          muted: '#64748B',
          faint: '#94A3B8',
          accent: '#0EA5E9',
          accentStrong: '#0284C7',
          cobalt: '#2563EB',
          ok: '#059669',
          warn: '#D97706',
          crit: '#E11D48',
          navy: '#0B1220',
          navy2: '#111A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
      boxShadow: {
        'panel': 'var(--shadow-panel)',
        'panel-hover': 'var(--shadow-panel-hover)',
        'pop': 'var(--shadow-pop)',
        'glow-cyan': '0 0 25px -5px rgba(14, 165, 233, 0.35)',
        'glow-cobalt': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
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
