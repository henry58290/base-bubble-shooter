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
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#94a3b8',
          600: '#475569',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        glass:
          '0 10px 40px -10px rgba(14, 116, 144, 0.25), 0 4px 16px -4px rgba(2, 132, 199, 0.18), inset 0 1px 0 0 rgba(255,255,255,0.7)',
        'glass-lg':
          '0 30px 60px -15px rgba(2, 132, 199, 0.25), 0 12px 24px -8px rgba(14, 165, 233, 0.18), inset 0 1px 0 0 rgba(255,255,255,0.8)',
        'soft-up': '0 -8px 24px -8px rgba(14, 165, 233, 0.18)',
        glow: '0 0 0 1px rgba(56,189,248,0.35), 0 12px 32px -8px rgba(14,165,233,0.45)',
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
