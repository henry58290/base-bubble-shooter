'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

import { Panel } from '@/components/ui/Panel';
import type { LeaderboardEntry } from '@/lib/contract';
import { formatScore, truncateAddress } from '@/lib/format';

type LeaderboardTableProps = {
  entries: readonly LeaderboardEntry[];
  isLoading: boolean;
  isConfigured: boolean;
};

export function LeaderboardTable({ entries, isLoading, isConfigured }: LeaderboardTableProps) {
  const { address: connectedAddress } = useAccount();

  if (!isConfigured) {
    return (
      <Panel tone="cyan" className="p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan/80">
          Contract not configured
        </p>
        <p className="mt-3 text-[11px] leading-relaxed text-neon-cyan/50">
          Deploy{' '}
          <code className="rounded bg-bg/80 px-1 py-0.5">GameLeaderboard.sol</code> and set{' '}
          <code className="rounded bg-bg/80 px-1 py-0.5">NEXT_PUBLIC_LEADERBOARD_ADDRESS</code>{' '}
          to populate the leaderboard.
        </p>
      </Panel>
    );
  }

  if (isLoading) {
    return (
      <Panel tone="green" className="p-8 text-center">
        <p className="animate-pulse text-xs uppercase tracking-[0.3em] text-neon-green/70">
          Loading scores from Base…
        </p>
      </Panel>
    );
  }

  if (entries.length === 0) {
    return (
      <Panel tone="green" className="p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neon-green/70">
          No scores submitted yet
        </p>
        <p className="mt-3 text-[11px] text-neon-green/40">Be the first to break the chain.</p>
      </Panel>
    );
  }

  return (
    <Panel tone="green" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neon-green/20 bg-bg/60">
              <Th className="w-12">#</Th>
              <Th>Player</Th>
              <Th className="text-right">Score</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const isYou =
                connectedAddress &&
                entry.player.toLowerCase() === connectedAddress.toLowerCase();
              return (
                <motion.tr
                  key={entry.player}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.025, duration: 0.18 }}
                  className={[
                    'border-b border-neon-green/10 transition-colors hover:bg-neon-green/5',
                    isYou ? 'bg-neon-green/10' : '',
                  ].join(' ')}
                >
                  <Td className="font-bold text-neon-green/90">
                    {index === 0 ? (
                      <span className="text-glow-green">01</span>
                    ) : (
                      String(index + 1).padStart(2, '0')
                    )}
                  </Td>
                  <Td>
                    <span className="font-mono text-neon-green/90">
                      {truncateAddress(entry.player)}
                    </span>
                    {isYou ? (
                      <span className="ml-2 rounded border border-neon-cyan/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-neon-cyan">
                        you
                      </span>
                    ) : null}
                  </Td>
                  <Td className="text-right font-mono tabular-nums text-glow-green">
                    {formatScore(entry.score)}
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
        'px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-green/60',
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
  return <td className={['px-4 py-3', className].filter(Boolean).join(' ')}>{children}</td>;
}
