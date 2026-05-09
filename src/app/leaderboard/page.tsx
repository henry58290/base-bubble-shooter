'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';

import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTopScores } from '@/hooks/useTopScores';

export default function LeaderboardPage() {
  const { isConnected } = useAccount();
  const { entries, isLoading, isConfigured, refetch } = useTopScores();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-500">
            Top 20 · Base Mainnet
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-gradient-ocean sm:text-5xl">
            🏆 Leaderboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <NeonButton tone="secondary" size="sm" onClick={refetch} aria-label="Refresh">
              ↻ Refresh
            </NeonButton>
          ) : null}
          <Link href="/">
            <NeonButton tone="ghost" size="sm">
              ← Menu
            </NeonButton>
          </Link>
        </div>
      </header>

      <LeaderboardTable
        entries={entries}
        isLoading={isLoading}
        isConfigured={isConfigured}
        isConnected={isConnected}
      />

      <footer className="mt-8 text-center text-[11px] font-medium tracking-wide text-sky-700/60">
        Updates every 15s · pulled from chain
      </footer>
    </main>
  );
}
