'use client';

import Link from 'next/link';

import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTopScores } from '@/hooks/useTopScores';

export default function LeaderboardPage() {
  const { entries, isLoading, isConfigured, refetch } = useTopScores();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-neon-cyan/80 text-glow-cyan">
            // Top 20 · Base Mainnet
          </p>
          <h1 className="mt-2 text-3xl font-bold uppercase tracking-[0.2em] text-neon-green text-glow-green sm:text-4xl">
            Leaderboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NeonButton tone="cyan" size="sm" onClick={refetch} aria-label="Refresh">
            Refresh
          </NeonButton>
          <Link href="/">
            <NeonButton tone="green" size="sm">
              ← Menu
            </NeonButton>
          </Link>
        </div>
      </header>

      <LeaderboardTable
        entries={entries}
        isLoading={isLoading}
        isConfigured={isConfigured}
      />

      <footer className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-neon-green/30">
        Updates every 15s · pulled from chain
      </footer>
    </main>
  );
}
