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
          bg: '#080A10',         // Ultra-deep obsidian matte
          surface: '#0D111A',    // Elevated card surface (titanium)
          card: '#101522',       // Interactive card surface
          cardHover: '#161C2C',  // Hover elevated surface
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          borderBright: 'rgba(255, 255, 255, 0.25)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        executive: {
          emerald: '#00D68F',    // Bold vibrant emerald
          emeraldDeep: '#00875A',
          ruby: '#FF3358',       // Bold rich crimson ruby
          rubyDeep: '#A8102B',
          gold: '#FFB800',       // Bold royal champagne gold
          goldDeep: '#D97706',
          violet: '#8B5CF6',     // Gen Z electric violet
          indigo: '#6366F1',
          cyan: '#00D2FF',       // Cyber cyan
          blue: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -4px rgba(255, 184, 0, 0.25), 0 0 8px -2px rgba(255, 184, 0, 0.15)',
        'glow-emerald': '0 0 25px -4px rgba(0, 214, 143, 0.25), 0 0 8px -2px rgba(0, 214, 143, 0.15)',
        'glow-ruby': '0 0 25px -4px rgba(255, 51, 88, 0.25), 0 0 8px -2px rgba(255, 51, 88, 0.15)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.25), 0 0 8px -2px rgba(139, 92, 246, 0.15)',
        'glow-cyan': '0 0 25px -4px rgba(0, 210, 255, 0.25), 0 0 8px -2px rgba(0, 210, 255, 0.15)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise-pattern': 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)',
      }
    },
  },
  plugins: [],
}
