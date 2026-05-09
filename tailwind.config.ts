import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff9d',
        'neon-cyan': '#00e5ff',
        'neon-magenta': '#ff2d95',
        panel: '#0c1117',
        bg: '#05070a',
      },
      fontFamily: {
        mono: ['ui-monospace', '"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,255,157,0.35)' },
          '50%': { boxShadow: '0 0 28px rgba(0,255,157,0.7)' },
        },
      },
      animation: {
        flicker: 'flicker 2.4s ease-in-out infinite',
        scan: 'scan 5s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
