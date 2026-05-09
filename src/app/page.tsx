'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { NeonButton } from '@/components/ui/NeonButton';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-glass-lg sm:p-12">
          <header className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-300 via-sky-400 to-sky-600 shadow-[0_12px_32px_-8px_rgba(14,165,233,0.6)]"
            >
              <span className="text-4xl">🫧</span>
            </motion.div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Base Mainnet · chainId 8453
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-gradient-ocean sm:text-6xl">
              Bubble Pop
            </h1>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-600 sm:text-base">
              Pop bubbles, chain combos, climb the on-chain leaderboard.
              <span className="block mt-1 text-sky-600 font-medium">Free to play. No wallet required.</span>
            </p>
          </header>

          <div className="mt-10 flex flex-col gap-3">
            <Link href="/play" className="w-full">
              <NeonButton tone="primary" size="lg" fullWidth>
                <span className="text-lg">▶</span>
                Play Now
              </NeonButton>
            </Link>
            <Link href="/leaderboard" className="w-full">
              <NeonButton tone="secondary" size="md" fullWidth>
                🏆 Leaderboard
              </NeonButton>
            </Link>

            <div className="mt-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-sky-200/70" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-500/80">
                Optional
              </span>
              <div className="h-px flex-1 bg-sky-200/70" />
            </div>

            <div className="flex justify-center">
              <ConnectButton
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
            <p className="text-center text-[11px] text-ink-400">
              Connect to submit your score on-chain & view the leaderboard.
            </p>
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide text-sky-700/70">
          <span>Built on</span>
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 font-semibold text-sky-700 ring-1 ring-sky-200">
            Base
          </span>
          <span>· Next.js · wagmi · viem</span>
        </footer>
      </motion.section>
    </main>
  );
}
