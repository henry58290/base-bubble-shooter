'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GameCanvas } from '@/components/game/GameCanvas';
import { GameOverOverlay } from '@/components/game/GameOverOverlay';
import { HUD } from '@/components/game/HUD';
import { NeonButton } from '@/components/ui/NeonButton';
import { Panel } from '@/components/ui/Panel';
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { AudioManager } from '@/game/engine/audio';

type Phase = 'idle' | 'playing' | 'gameOver';

const MAX_LIVES = 3;

export function GameShell() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [muted, setMuted] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const scoreRef = useRef(0);

  const audioRef = useRef<AudioManager | null>(null);
  if (audioRef.current === null) audioRef.current = new AudioManager();
  const audio = audioRef.current;

  useEffect(() => {
    audio.setMuted(muted);
  }, [audio, muted]);

  const startRound = useCallback(() => {
    audio.preload();
    scoreRef.current = 0;
    setScore(0);
    setFinalScore(0);
    setLives(MAX_LIVES);
    setRoundKey((k) => k + 1);
    setPhase('playing');
  }, [audio]);

  const handleScoreChange = useCallback((s: number) => {
    scoreRef.current = s;
    setScore(s);
  }, []);
  const handleLivesChange = useCallback((l: number) => setLives(l), []);
  const handleGameOver = useCallback(() => {
    setFinalScore(scoreRef.current);
    setPhase('gameOver');
  }, []);
  const handleToggleMute = useCallback(() => setMuted((m) => !m), []);

  const screenKey = phase === 'idle' ? 'idle' : 'in-game';

  return (
    <div className="relative flex w-full flex-col items-center gap-6 lg:gap-4">
      <ScreenTransition screenKey={screenKey}>
        {phase === 'idle' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md lg:max-w-xl xl:max-w-2xl"
          >
            <Panel
              variant="glass"
              className="space-y-7 p-8 text-center sm:p-10 lg:space-y-9 lg:p-14 xl:p-16"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-500 lg:text-xs">
                  Ready to play
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-gradient-ocean sm:text-4xl lg:text-5xl xl:text-6xl">
                  Pop &amp; Chain
                </h2>
              </div>

              <div className="space-y-3 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-emerald-400/20 lg:space-y-4 lg:p-7">
                <Rule emoji="🎯" text="Tap or drag to aim. Release to fire." />
                <Rule emoji="✨" text="Match 3+ same-color bubbles to pop them." />
                <Rule emoji="⚡" text="Chain combos for huge multipliers." />
                <Rule emoji="❤️" text="3 misses jolts the ceiling down." />
              </div>

              <NeonButton
                tone="primary"
                size="lg"
                fullWidth
                onClick={startRound}
                className="lg:py-5 lg:text-lg"
              >
                ▶ Start Round
              </NeonButton>
            </Panel>
          </motion.div>
        ) : (
          <div className="flex w-full flex-col items-center gap-4 lg:gap-3">
            <HUD
              score={phase === 'gameOver' ? finalScore : score}
              lives={lives}
              maxLives={MAX_LIVES}
              muted={muted}
              onToggleMute={handleToggleMute}
            />
            <div className="relative w-full max-w-md lg:max-w-[min(32rem,calc((100vh-12rem)*0.75))] xl:max-w-[min(36rem,calc((100vh-13rem)*0.75))]">
              <GameCanvas
                key={roundKey}
                audio={audio}
                onScoreChange={handleScoreChange}
                onLivesChange={handleLivesChange}
                onGameOver={handleGameOver}
              />
              {phase === 'gameOver' ? (
                <GameOverOverlay score={finalScore} onPlayAgain={startRound} />
              ) : null}
            </div>
          </div>
        )}
      </ScreenTransition>
    </div>
  );
}

function Rule({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left lg:gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-base shadow-[0_0_18px_-4px_rgba(74,222,128,0.45)] ring-1 ring-emerald-400/40 lg:h-10 lg:w-10 lg:text-lg">
        {emoji}
      </span>
      <span className="text-sm text-ink-600 lg:text-base">{text}</span>
    </div>
  );
}
