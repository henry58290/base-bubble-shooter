'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

import { GameShell } from '@/components/game/GameShell';
import { NeonButton } from '@/components/ui/NeonButton';

export default function PlayPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/">
          <NeonButton tone="cyan" size="sm">
            ← Menu
          </NeonButton>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard">
            <NeonButton tone="green" size="sm">
              Leaderboard
            </NeonButton>
          </Link>
          <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
        </div>
      </header>

      <GameShell />
    </main>
  );
}
