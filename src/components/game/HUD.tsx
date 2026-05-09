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
    <div className="flex w-full max-w-md items-center justify-between gap-3">
      <div className="glass flex flex-1 items-center justify-between rounded-2xl px-4 py-3 shadow-glass">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-500">
            Score
          </p>
          <motion.p
            key={score}
            initial={{ scale: 1.1, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="font-display text-2xl font-extrabold tabular-nums text-gradient-ocean"
          >
            {formatScore(score)}
          </motion.p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div
            className="flex items-center gap-1.5"
            aria-label={`${lives} lives remaining`}
          >
            {Array.from({ length: maxLives }).map((_, i) => {
              const filled = i < lives;
              return (
                <motion.div
                  key={i}
                  animate={{ scale: filled ? 1 : 0.7, opacity: filled ? 1 : 0.35 }}
                  transition={{ duration: 0.18 }}
                  className={[
                    'h-3.5 w-3.5 rounded-full transition-colors',
                    filled
                      ? 'bg-gradient-to-br from-bubble-pink to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                      : 'border border-rose-300 bg-white/60',
                  ].join(' ')}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-500/80 transition-colors hover:text-sky-700"
            aria-pressed={muted}
          >
            {muted ? '🔇 muted' : '🔊 sound'}
          </button>
        </div>
      </div>
    </div>
  );
}
