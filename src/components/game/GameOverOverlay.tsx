'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { NeonButton } from '@/components/ui/NeonButton';
import { Panel } from '@/components/ui/Panel';
import { useSubmitScore, type SubmitState } from '@/hooks/useSubmitScore';
import { isLeaderboardConfigured } from '@/lib/contract';
import { formatScore } from '@/lib/format';

type GameOverOverlayProps = {
  score: number;
  onPlayAgain: () => void;
};

const LABEL: Record<SubmitState, string> = {
  idle: 'Submit Score On-Chain',
  awaitingWallet: 'Awaiting Wallet…',
  submitting: 'Submitting Transaction…',
  confirmed: 'Confirmed ⚡',
  error: 'Try Again',
};

export function GameOverOverlay({ score, onPlayAgain }: GameOverOverlayProps) {
  const { isConnected } = useAccount();
  const { submit, reset, state, explorerUrl } = useSubmitScore();

  // Reset the tx state when this overlay unmounts (i.e. user clicks Play Again).
  useEffect(() => () => reset(), [reset]);

  const isBusy = state === 'awaitingWallet' || state === 'submitting';
  const isConfirmed = state === 'confirmed';

  const handleSubmit = () => {
    void submit(score);
  };

  const handlePlayAgain = () => {
    reset();
    onPlayAgain();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-bg/85 backdrop-blur-sm"
    >
      <Panel tone="magenta" className="w-full max-w-sm space-y-6 p-8 text-center">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.5em] text-neon-magenta/80 text-glow-magenta">
            // Run terminated
          </p>
          <h2 className="text-2xl font-bold uppercase tracking-[0.3em] text-neon-magenta text-glow-magenta">
            Game Over
          </h2>
        </header>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon-green/60">Final score</p>
          <p className="font-mono text-5xl font-bold tabular-nums text-neon-green text-glow-green">
            {formatScore(score)}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <NeonButton
            tone={isConfirmed ? 'cyan' : 'green'}
            size="md"
            fullWidth
            onClick={handleSubmit}
            disabled={!isConnected || score === 0 || isBusy || isConfirmed}
            title={
              !isConnected
                ? 'Connect a wallet to submit'
                : !isLeaderboardConfigured
                  ? 'Contract address not set'
                  : undefined
            }
          >
            {isBusy ? <BusyDots /> : null}
            {LABEL[state]}
          </NeonButton>
          <NeonButton tone="cyan" size="md" fullWidth onClick={handlePlayAgain} disabled={isBusy}>
            Play Again
          </NeonButton>
        </div>

        {/* Status footer — shows explorer link once a tx hash exists */}
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="block text-[10px] uppercase tracking-[0.3em] text-neon-cyan/70 underline-offset-4 transition-colors hover:text-neon-cyan hover:underline"
          >
            view on basescan ↗
          </a>
        ) : !isConnected ? (
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon-magenta/60">
            Connect a wallet from the menu to submit
          </p>
        ) : !isLeaderboardConfigured ? (
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon-magenta/60">
            Set NEXT_PUBLIC_LEADERBOARD_ADDRESS to enable submission
          </p>
        ) : null}
      </Panel>
    </motion.div>
  );
}

function BusyDots() {
  return (
    <span className="mr-2 inline-flex gap-1 align-middle">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
          className="inline-block h-1 w-1 rounded-full bg-current"
        />
      ))}
    </span>
  );
}
