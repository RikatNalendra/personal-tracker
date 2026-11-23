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
        dark: {
          bg: '#0B0E14',
          card: '#131722',
          surface: '#171C2A',
          hover: '#1D2335',
          border: '#1E2433',
          borderLight: '#2A3246',
          text: '#F3F4F6',
          muted: '#9CA3AF',
          subtle: '#64748B',
        },
        executive: {
          emerald: '#10B981',
          coral: '#EF4444',
          gold: '#F59E0B',
          amber: '#D97706',
          blue: '#3B82F6',
          indigo: '#6366F1',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-glow': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 15px -3px rgba(245, 158, 11, 0.05)',
        'emerald-glow': '0 0 15px -2px rgba(16, 185, 129, 0.25)',
        'gold-glow': '0 0 15px -2px rgba(245, 158, 11, 0.25)',
        'coral-glow': '0 0 15px -2px rgba(239, 68, 68, 0.25)',
      }
    },
  },
  plugins: [],
}
