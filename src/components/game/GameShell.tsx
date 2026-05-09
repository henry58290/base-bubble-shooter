'use client';

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
  // `roundKey` forces GameCanvas to remount (fresh World) on each replay.
  const [roundKey, setRoundKey] = useState(0);

  // Mirror the live score so the game-over snapshot doesn't go stale through
  // the useCallback closure.
  const scoreRef = useRef(0);

  const audioRef = useRef<AudioManager | null>(null);
  if (audioRef.current === null) audioRef.current = new AudioManager();
  const audio = audioRef.current;

  useEffect(() => {
    audio.setMuted(muted);
  }, [audio, muted]);

  const startRound = useCallback(() => {
    // Browsers require a user gesture before audio can play; this click qualifies.
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
    // Snapshot the final score *before* React commits anything that could
    // wipe the live score (e.g. the canvas remounting).
    setFinalScore(scoreRef.current);
    setPhase('gameOver');
  }, []);
  const handleToggleMute = useCallback(() => setMuted((m) => !m), []);

  // Collapse 'playing' and 'gameOver' into the same transition group so the
  // canvas/world subtree stays mounted across game-over (and the live score
  // doesn't get reset by a canvas remount).
  const screenKey = phase === 'idle' ? 'idle' : 'in-game';

  return (
    <div className="relative flex w-full flex-col items-center gap-6">
      <ScreenTransition screenKey={screenKey}>
        {phase === 'idle' ? (
          <Panel tone="cyan" className="mx-auto w-full max-w-md space-y-6 p-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-neon-cyan/80 text-glow-cyan">
              // Ready
            </p>
            <h2 className="text-2xl font-bold uppercase tracking-[0.3em] text-neon-green text-glow-green">
              Round Start
            </h2>
            <ul className="mx-auto max-w-xs space-y-1.5 text-left text-[11px] uppercase tracking-[0.2em] text-neon-green/60">
              <li>· Tap or click bubbles to pop them</li>
              <li>· Chains multiply your score</li>
              <li>· 3 misses ends the run</li>
            </ul>
            <NeonButton tone="green" size="lg" fullWidth onClick={startRound}>
              Start Round
            </NeonButton>
          </Panel>
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <HUD
              score={phase === 'gameOver' ? finalScore : score}
              lives={lives}
              maxLives={MAX_LIVES}
              muted={muted}
              onToggleMute={handleToggleMute}
            />
            <div className="relative w-full max-w-md">
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
