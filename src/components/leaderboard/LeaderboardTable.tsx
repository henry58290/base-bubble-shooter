'use client';

import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

import { NeonButton } from '@/components/ui/NeonButton';
import { Panel } from '@/components/ui/Panel';
import type { LeaderboardEntry } from '@/lib/contract';
import { formatScore, truncateAddress } from '@/lib/format';

type LeaderboardTableProps = {
  entries: readonly LeaderboardEntry[];
  isLoading: boolean;
  isConfigured: boolean;
  isConnected: boolean;
};

const PLACEHOLDER_ENTRIES: readonly LeaderboardEntry[] = [
  { player: '0x1111111111111111111111111111111111111111' as `0x${string}`, score: 128400n },
  { player: '0x2222222222222222222222222222222222222222' as `0x${string}`, score: 96250n },
  { player: '0x3333333333333333333333333333333333333333' as `0x${string}`, score: 71800n },
  { player: '0x4444444444444444444444444444444444444444' as `0x${string}`, score: 54200n },
  { player: '0x5555555555555555555555555555555555555555' as `0x${string}`, score: 38900n },
  { player: '0x6666666666666666666666666666666666666666' as `0x${string}`, score: 22500n },
  { player: '0x7777777777777777777777777777777777777777' as `0x${string}`, score: 14100n },
];

export function LeaderboardTable({
  entries,
  isLoading,
  isConfigured,
  isConnected,
}: LeaderboardTableProps) {
  const { address: connectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();

  if (!isConfigured) {
    return (
      <Panel variant="glass" className="p-8 text-center">
        <p className="font-display text-base font-semibold text-sky-700">
          Contract not configured
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Deploy <code className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-800">GameLeaderboard.sol</code> and set{' '}
          <code className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-800">
            NEXT_PUBLIC_LEADERBOARD_ADDRESS
          </code>{' '}
          to populate the leaderboard.
        </p>
      </Panel>
    );
  }

  // Gated: not connected → blur preview rows behind a connect-prompt overlay.
  if (!isConnected) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-[6px] opacity-70" aria-hidden>
          <Table entries={PLACEHOLDER_ENTRIES} connectedAddress={undefined} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Panel variant="glass" tone="sky" className="w-full max-w-sm space-y-5 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-sky-600 shadow-[0_8px_24px_-6px_rgba(14,165,233,0.55)]">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-gradient-ocean">
                Connect to view rankings
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                The on-chain leaderboard is reserved for connected players. Link your wallet to see who's on top.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <NeonButton tone="primary" size="md" fullWidth onClick={() => openConnectModal?.()}>
                🔗 Connect Wallet
              </NeonButton>
              <ConnectButton.Custom>
                {() => (
                  <span className="text-[11px] text-ink-400">
                    Free, anonymous, takes 10 seconds.
                  </span>
                )}
              </ConnectButton.Custom>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Panel variant="glass" className="p-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
        <p className="mt-4 text-sm font-medium text-sky-700">Loading scores from Base…</p>
      </Panel>
    );
  }

  if (entries.length === 0) {
    return (
      <Panel variant="glass" className="p-10 text-center">
        <p className="text-3xl">🌊</p>
        <p className="mt-3 font-display text-lg font-semibold text-sky-800">
          No scores submitted yet
        </p>
        <p className="mt-2 text-sm text-ink-600">Be the first to break the chain.</p>
      </Panel>
    );
  }

  return <Table entries={entries} connectedAddress={connectedAddress} />;
}

function Table({
  entries,
  connectedAddress,
}: {
  entries: readonly LeaderboardEntry[];
  connectedAddress: string | undefined;
}) {
  return (
    <Panel variant="glass" className="overflow-hidden p-2">
      <div className="overflow-x-auto scrollbar-clean">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sky-200/60">
              <Th className="w-16 pl-4">Rank</Th>
              <Th>Player</Th>
              <Th className="pr-4 text-right">Score</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const isYou =
                connectedAddress &&
                entry.player.toLowerCase() === connectedAddress.toLowerCase();
              const medal =
                index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
              return (
                <motion.tr
                  key={entry.player}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.025, duration: 0.2 }}
                  className={[
                    'border-b border-sky-100/70 transition-colors hover:bg-sky-50/70',
                    isYou ? 'bg-gradient-to-r from-sky-100/80 to-transparent' : '',
                  ].join(' ')}
                >
                  <Td className="pl-4">
                    <span className="inline-flex items-center gap-2">
                      {medal ? (
                        <span className="text-lg">{medal}</span>
                      ) : (
                        <span className="font-display text-sm font-bold text-sky-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-sm font-medium text-ink-800">
                      {truncateAddress(entry.player)}
                    </span>
                    {isYou ? (
                      <span className="ml-2 rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">
                        you
                      </span>
                    ) : null}
                  </Td>
                  <Td className="pr-4 text-right">
                    <span className="font-display text-base font-bold tabular-nums text-gradient-ocean">
                      {formatScore(entry.score)}
                    </span>
                  </Td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={[
        'px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-500',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={['px-3 py-3.5', className].filter(Boolean).join(' ')}>{children}</td>;
}
