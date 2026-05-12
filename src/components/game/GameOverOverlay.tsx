'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { NeonButton } from '@/components/ui/NeonButton';
import { Panel } from '@/components/ui/Panel';
import { useSubmitScore, type SubmitState } from '@/hooks/useSubmitScore';
import { isLeaderboardConfigured, SUBMISSION_FEE_ETH } from '@/lib/contract';
import { formatScore } from '@/lib/format';

type GameOverOverlayProps = {
  score: number;
  onPlayAgain: () => void;
};

const LABEL: Record<SubmitState, string> = {
  idle: '⛓ Submit Score On-Chain',
  awaitingWallet: 'Awaiting Wallet…',
  submitting: 'Submitting Transaction…',
  confirmed: 'Confirmed ✨',
  error: 'Try Again',
};

export function GameOverOverlay({ score, onPlayAgain }: GameOverOverlayProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { submit, reset, state, explorerUrl } = useSubmitScore();

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

  const handleConnect = () => {
    openConnectModal?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-sky-900/30 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm px-4"
      >
        <Panel variant="glass" tone="sky" className="space-y-6 p-7 text-center">
          <header className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-bubble-pink">
              Run Complete
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-gradient-ocean">
              Game Over
            </h2>
          </header>

          <div className="rounded-2xl bg-gradient-to-b from-sky-50 to-white p-5 ring-1 ring-sky-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-500">
              Final Score
            </p>
            <p className="font-display text-5xl font-extrabold tabular-nums text-gradient-ocean">
              {formatScore(score)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {!isConnected ? (
              <NeonButton tone="primary" size="md" fullWidth onClick={handleConnect}>
                🔗 Connect Wallet to Submit Score
              </NeonButton>
            ) : (
              <NeonButton
                tone={isConfirmed ? 'success' : 'primary'}
                size="md"
                fullWidth
                onClick={handleSubmit}
                disabled={score === 0 || isBusy || isConfirmed || !isLeaderboardConfigured}
                title={
                  !isLeaderboardConfigured
                    ? 'Contract address not set'
                    : score === 0
                      ? 'Score must be greater than zero'
                      : undefined
                }
              >
                {isBusy ? <BusyDots /> : null}
                {LABEL[state]}
              </NeonButton>
            )}

            <NeonButton
              tone="secondary"
              size="md"
              fullWidth
              onClick={handlePlayAgain}
              disabled={isBusy}
            >
              ↻ Play Again
            </NeonButton>

            {isConnected && isLeaderboardConfigured && !isConfirmed ? (
              <p className="text-center text-[10px] font-medium uppercase tracking-[0.25em] text-sky-600/80">
                Fee: {SUBMISSION_FEE_ETH} ETH <span className="text-ink-400">+ gas</span>
              </p>
            ) : null}
          </div>

          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600 underline-offset-4 transition-colors hover:text-sky-800 hover:underline"
            >
              View on Basescan ↗
            </a>
          ) : !isConnected ? (
            <p className="text-[11px] leading-relaxed text-ink-400">
              Connect a wallet to record your score on-chain. Free to play forever.
            </p>
          ) : !isLeaderboardConfigured ? (
            <p className="text-[11px] leading-relaxed text-bubble-pink">
              Contract not configured.
            </p>
          ) : null}
        </Panel>
      </motion.div>
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
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
        />
      ))}
    </span>
  );
}
