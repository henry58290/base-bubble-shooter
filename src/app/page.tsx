'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { NeonButton } from '@/components/ui/NeonButton';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
      {/* Animated scanline overlay — purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
      >
        <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-neon-green/20 to-transparent animate-scan" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl space-y-10 text-center"
      >
        <header className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.5em] text-neon-cyan/80 text-glow-cyan">
            // Base Mainnet · chainId 8453
          </p>
          <h1 className="text-5xl font-bold uppercase tracking-[0.25em] text-neon-green text-glow-green animate-flicker sm:text-6xl">
            Neon Pop
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neon-green/60 sm:text-sm">
            On-chain arcade. Pop bubbles. Climb the leaderboard.
          </p>
        </header>

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-md border border-neon-green/30 bg-panel/40 p-1 border-glow-green">
            <ConnectButton />
          </div>

          <Link href="/play" className="w-full max-w-xs">
            <NeonButton tone="green" size="md" fullWidth>
              ▶ Play
            </NeonButton>
          </Link>
          <Link href="/leaderboard" className="w-full max-w-xs">
            <NeonButton tone="cyan" size="md" fullWidth>
              Leaderboard
            </NeonButton>
          </Link>
        </div>

        <footer className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-neon-green/30">
          <p>All systems online · v1.0</p>
          <p className="text-neon-green/20">Built with Next.js · wagmi · viem · Base</p>
        </footer>
      </motion.section>
    </main>
  );
}
