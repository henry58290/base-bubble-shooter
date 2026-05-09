'use client';

import { motion } from 'framer-motion';

import { formatScore } from '@/lib/format';

type HUDProps = {
  score: number;
  lives: number;
  maxLives?: number;
  muted: boolean;
  onToggleMute: () => void;
};

export function HUD({ score, lives, maxLives = 3, muted, onToggleMute }: HUDProps) {
  return (
    <div className="flex w-full max-w-md items-end justify-between gap-4 font-mono text-xs uppercase tracking-[0.3em]">
      <div className="text-neon-cyan/80">
        <span className="text-[10px] opacity-60">SCORE</span>
        <motion.div
          key={score}
          initial={{ scale: 1.12, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="text-2xl tabular-nums text-neon-green text-glow-green"
        >
          {formatScore(score)}
        </motion.div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5" aria-label={`${lives} lives remaining`}>
          {Array.from({ length: maxLives }).map((_, i) => {
            const filled = i < lives;
            return (
              <motion.div
                key={i}
                animate={{
                  scale: filled ? 1 : 0.7,
                  opacity: filled ? 1 : 0.3,
                }}
                transition={{ duration: 0.18 }}
                className={[
                  'h-3 w-3 rotate-45',
                  filled
                    ? 'bg-neon-magenta shadow-[0_0_10px_rgba(255,45,149,0.8)]'
                    : 'border border-neon-magenta/40',
                ].join(' ')}
              />
            );
          })}
        </div>
        <button
          type="button"
          onClick={onToggleMute}
          className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan/60 transition-colors hover:text-neon-cyan"
          aria-pressed={muted}
        >
          {muted ? 'sound · off' : 'sound · on'}
        </button>
      </div>
    </div>
  );
}
