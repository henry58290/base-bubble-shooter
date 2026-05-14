'use client';

import { useMemo } from 'react';

type Bubble = {
  id: number;
  size: number;
  left: string;
  delay: string;
  duration: string;
  drift: string;
  hue: string;
  shadow: string;
};

const HUES: { gradient: string; shadow: string }[] = [
  {
    gradient: 'from-emerald-400/50 to-emerald-200/5',
    shadow: '0 0 28px rgba(74,222,128,0.45)',
  },
  {
    gradient: 'from-cyan-400/55 to-cyan-200/5',
    shadow: '0 0 28px rgba(34,211,238,0.45)',
  },
  {
    gradient: 'from-sky-400/50 to-sky-200/5',
    shadow: '0 0 28px rgba(56,189,248,0.45)',
  },
  {
    gradient: 'from-violet-400/45 to-violet-200/5',
    shadow: '0 0 28px rgba(167,139,250,0.45)',
  },
  {
    gradient: 'from-emerald-300/45 to-cyan-300/5',
    shadow: '0 0 28px rgba(74,222,128,0.4)',
  },
  {
    gradient: 'from-cyan-300/45 to-emerald-300/5',
    shadow: '0 0 28px rgba(34,211,238,0.4)',
  },
];

function buildBubbles(count: number, seed: number): Bubble[] {
  // Deterministic pseudo-random so SSR and client agree.
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, (_, i) => {
    const size = 18 + Math.floor(rand() * 78);
    const hue = HUES[Math.floor(rand() * HUES.length)];
    return {
      id: i,
      size,
      left: `${Math.floor(rand() * 100)}%`,
      delay: `${(rand() * 22).toFixed(2)}s`,
      duration: `${(22 + rand() * 24).toFixed(2)}s`,
      drift: `${Math.floor(rand() * 240) - 120}px`,
      hue: hue.gradient,
      shadow: hue.shadow,
    };
  });
}

/**
 * Dark cyberpunk ambient backdrop:
 *  - deep navy/black canvas (body bg in globals.css)
 *  - faint neon scan-grid for cyberpunk depth
 *  - drifting neon bubbles (CSS keyframes `floatUp`) with cyan / green / blue glows
 *
 * Lives at z-0 under the rest of the UI; pointer-events disabled.
 */
export function AnimatedBackground() {
  const bubbles = useMemo(() => buildBubbles(34, 7), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Hero glow at the top — cyan/green neon halo */}
      <div className="absolute -top-48 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),rgba(74,222,128,0.12)_45%,transparent_75%)] blur-3xl" />

      {/* Secondary glow at the bottom — emerald wash */}
      <div className="absolute -bottom-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.20),rgba(34,211,238,0.10)_45%,transparent_75%)] blur-3xl" />

      {/* Subtle cyber grid for that "Base receipt" vibe */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%)',
        }}
      />

      {/* Floating neon bubbles */}
      <div className="absolute inset-0">
        {bubbles.map((b) => (
          <span
            key={`bubble-${b.id}`}
            className={`absolute bottom-[-120px] block rounded-full bg-gradient-to-br ${b.hue} animate-float-up will-change-transform`}
            style={{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDuration: b.duration,
              animationDelay: b.delay,
              // Custom property consumed by the floatUp keyframes for horizontal drift.
              ['--drift' as string]: b.drift,
              boxShadow: `inset 1px 2px 6px rgba(255,255,255,0.18), ${b.shadow}`,
            }}
          >
            <span className="absolute left-[20%] top-[16%] block h-[24%] w-[24%] rounded-full bg-white/40 blur-[1px]" />
          </span>
        ))}
      </div>

      {/* Top vignette to fade the grid into the chrome edge */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#04070d]/90 to-transparent" />
      {/* Bottom vignette for depth */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#04070d]/80 to-transparent" />
    </div>
  );
}
