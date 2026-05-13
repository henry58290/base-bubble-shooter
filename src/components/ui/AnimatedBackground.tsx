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
};

type Cloud = {
  id: number;
  top: string;
  scale: number;
  duration: string;
  delay: string;
  opacity: number;
};

const HUES = [
  'from-bubble-pink/70 to-bubble-peach/40',
  'from-sky-300/80 to-sky-100/30',
  'from-bubble-violet/70 to-sky-200/30',
  'from-bubble-mint/70 to-sky-100/30',
  'from-bubble-gold/70 to-bubble-peach/30',
  'from-sky-400/80 to-sky-200/30',
];

function buildBubbles(count: number, seed: number): Bubble[] {
  // Deterministic pseudo-random so SSR and client agree.
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, (_, i) => {
    // Mix of small (mobile-friendly) and large (presence on big screens) bubbles.
    const size = 22 + Math.floor(rand() * 96);
    return {
      id: i,
      size,
      left: `${Math.floor(rand() * 100)}%`,
      delay: `${(rand() * 22).toFixed(2)}s`,
      duration: `${(18 + rand() * 22).toFixed(2)}s`,
      drift: `${Math.floor(rand() * 240) - 120}px`,
      hue: HUES[Math.floor(rand() * HUES.length)],
    };
  });
}

function buildClouds(count: number, seed: number): Cloud[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${5 + Math.floor(rand() * 70)}%`,
    scale: 0.6 + rand() * 0.9,
    duration: `${(60 + rand() * 60).toFixed(2)}s`,
    delay: `${-(rand() * 60).toFixed(2)}s`,
    opacity: 0.45 + rand() * 0.4,
  }));
}

/**
 * Soft sky-blue ambient backdrop:
 *  - layered radial sky gradient (in globals.css)
 *  - drifting clouds (CSS keyframes `drift`)
 *  - colorful bubbles rising from the bottom (CSS keyframes `floatUp`)
 *
 * Lives at z-0 under the rest of the UI; pointer-events disabled.
 */
export function AnimatedBackground() {
  const bubbles = useMemo(() => buildBubbles(38, 7), []);
  const clouds = useMemo(() => buildClouds(9, 13), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Sun-like glow */}
      <div className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-gradient-radial bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),rgba(186,230,253,0.35)_40%,transparent_70%)] blur-2xl" />

      {/* Clouds */}
      {clouds.map((c) => (
        <div
          key={`cloud-${c.id}`}
          className="absolute animate-drift will-change-transform"
          style={{
            top: c.top,
            transform: `scale(${c.scale})`,
            animationDuration: c.duration,
            animationDelay: c.delay,
            opacity: c.opacity,
          }}
        >
          <CloudShape />
        </div>
      ))}

      {/* Bubbles rising */}
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
              boxShadow:
                'inset 2px 4px 8px rgba(255,255,255,0.6), 0 6px 18px -6px rgba(14,165,233,0.45)',
            }}
          >
            <span className="absolute left-[18%] top-[14%] block h-[28%] w-[28%] rounded-full bg-white/70 blur-[1px]" />
          </span>
        ))}
      </div>

      {/* Subtle vignette top + bottom for depth */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-sky-100/60 to-transparent" />
    </div>
  );
}

function CloudShape() {
  return (
    <svg
      width="220"
      height="80"
      viewBox="0 0 220 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#cloudBlur)">
        <ellipse cx="60" cy="50" rx="40" ry="22" fill="white" />
        <ellipse cx="100" cy="42" rx="46" ry="28" fill="white" />
        <ellipse cx="148" cy="50" rx="38" ry="22" fill="white" />
        <ellipse cx="180" cy="55" rx="26" ry="16" fill="white" />
      </g>
      <defs>
        <filter id="cloudBlur" x="0" y="0" width="220" height="80">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
    </svg>
  );
}
