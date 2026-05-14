import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium sky-blue palette.
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Bubble accents — vibrant but pastel-friendly so they still pop on a light sky.
        bubble: {
          pink: '#fb7185',
          peach: '#fdba74',
          mint: '#34d399',
          violet: '#a78bfa',
          gold: '#fbbf24',
        },
        // Reinterpreted for the dark cyberpunk theme: higher numbers = lighter
        // (brighter on a dark background). Components that wrote `text-ink-900`
        // for "primary text" continue to work without per-file edits.
        ink: {
          50: '#04070d',
          100: '#0a0e1a',
          200: '#1e293b',
          400: '#64748b',
          600: '#94a3b8',
          800: '#cbd5e1',
          900: '#f1f5f9',
        },
        neon: {
          green: '#4ade80',
          mint: '#34d399',
          cyan: '#22d3ee',
          blue: '#38bdf8',
          violet: '#a78bfa',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        glass:
          '0 0 0 1px rgba(34,211,238,0.06), 0 0 32px -8px rgba(74,222,128,0.22), 0 20px 60px -16px rgba(0,0,0,0.65), inset 0 1px 0 0 rgba(255,255,255,0.04)',
        'glass-lg':
          '0 0 0 1px rgba(34,211,238,0.08), 0 0 48px -8px rgba(74,222,128,0.28), 0 32px 80px -16px rgba(0,0,0,0.75), inset 0 1px 0 0 rgba(255,255,255,0.05)',
        'soft-up': '0 -8px 24px -8px rgba(74, 222, 128, 0.25)',
        glow: '0 0 0 1px rgba(74,222,128,0.45), 0 0 32px -4px rgba(74,222,128,0.55)',
        'neon-green':
          '0 0 24px -2px rgba(74,222,128,0.65), inset 0 1px 0 0 rgba(255,255,255,0.45), inset 0 -2px 0 0 rgba(0,0,0,0.18)',
        'neon-cyan':
          '0 0 24px -2px rgba(34,211,238,0.55), inset 0 1px 0 0 rgba(255,255,255,0.4)',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
          '10%': { opacity: '0.7' },
          '90%': { opacity: '0.7' },
          '100%': {
            transform: 'translateY(-110vh) translateX(var(--drift,40px)) scale(0.85)',
            opacity: '0',
          },
        },
        drift: {
          '0%': { transform: 'translateX(-12%)' },
          '100%': { transform: 'translateX(112%)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'float-up': 'floatUp linear infinite',
        drift: 'drift linear infinite',
        shimmer: 'shimmer 3.5s ease-in-out infinite',
        pop: 'pop 0.45s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
