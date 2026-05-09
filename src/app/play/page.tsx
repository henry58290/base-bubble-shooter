'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

import { GameShell } from '@/components/game/GameShell';
import { NeonButton } from '@/components/ui/NeonButton';

export default function PlayPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/">
          <NeonButton tone="secondary" size="sm">
            ← Menu
          </NeonButton>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/leaderboard">
            <NeonButton tone="ghost" size="sm">
              🏆 Leaderboard
            </NeonButton>
          </Link>
          <ConnectButton
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </header>

      <GameShell />
    </main>
  );
}
